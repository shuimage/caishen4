const express = require('express');
const { query } = require('./数据库配置.js');

const router = express.Router();

/**
 * 获取最新1期三球组合详情数据
 * @param {string} combination - 三球组合（格式：1-2-3）
 * @param {string} targetNumber - 目标球
 * @param {string} period - 统计期数
 * @returns {Promise<Object>} 包含组合详情数据的响应
 */
async function getSanQiuZuHeXiangQing(combination, targetNumber, period) {
  try {
    // 1. 参数验证
    if (!combination) {
      throw new Error('缺少必需参数：combination');
    }
    
    // 2. 解析参数
    const comboNumbers = combination.split('-').map(num => parseInt(num)).sort((a, b) => a - b);
    const targetNum = targetNumber ? parseInt(targetNumber) : null;
    const statsPeriod = period === 'all' ? 10000 : parseInt(period) || 100;
    
    // 3. 查询历史数据
    console.log('开始查询历史数据...');
    // 查询所有需要的数据，包括bian_hao字段，包含最新记录
    const sql = `
      SELECT 
        id,
        issue,
        draw_date,
        red,
        bian_hao
      FROM lottery_results 
      ORDER BY CAST(issue AS UNSIGNED) DESC
      LIMIT ${statsPeriod}
    `;
    
    const rows = await query(sql);
    console.log('历史数据查询完成，共获取', rows.length, '条记录');
    
    // 4. 创建bian_hao到数据的映射，方便快速查找下一期数据
    const bianHaoToDataMap = new Map();
    const idToDataMap = new Map();
    
    rows.forEach(row => {
      bianHaoToDataMap.set(row.bian_hao, row);
      idToDataMap.set(row.id, row);
    });
    
    // 5. 处理数据
    const comboOccurrences = [];
    let comboCount = 0;
    
    rows.forEach(row => {
      // 解析当前期前区号码
      let currentRedNumbers = [];
      if (Array.isArray(row.red)) {
        currentRedNumbers = row.red.map(num => typeof num === 'string' ? parseInt(num) : num);
      } else if (typeof row.red === 'string') {
        const numbers = row.red.match(/\d+/g);
        if (numbers) {
          currentRedNumbers = numbers.map(num => parseInt(num));
        }
      }
      
      // 检查当前期是否包含组合
      const hasCombination = comboNumbers.every(num => currentRedNumbers.includes(num));
      if (!hasCombination) return;
      
      comboCount++;
      
      // 使用bian_hao字段查找下一期数据
      // 从bian_hao中提取数字部分，比如"00005" -> 5
      const currentBianHao = row.bian_hao;
      if (!currentBianHao) {
        return;
      }
      
      // 提取数字部分
      const numericPart = currentBianHao.replace(/[^0-9]/g, '');
      if (!numericPart) {
        return;
      }
      
      // 转换为数字，加1，然后转换回字符串，保持相同的位数
      const currentNum = parseInt(numericPart);
      const nextNum = currentNum + 1;
      
      // 转换回字符串，保持相同的位数
      const nextNumericPart = nextNum.toString().padStart(numericPart.length, '0');
      
      // 构建下一期的bian_hao（保留原始前缀）
      const prefix = currentBianHao.replace(numericPart, '');
      const nextBianHao = prefix + nextNumericPart;
      
      // 使用构建的下一期bian_hao查找数据
      const nextData = bianHaoToDataMap.get(nextBianHao);
      
      // 如果找不到下一期数据，跳过
      if (!nextData) {
        return;
      }
      
      // 解析下一期前区号码
      let nextRedNumbers = [];
      if (Array.isArray(nextData.red)) {
        nextRedNumbers = nextData.red.map(num => typeof num === 'string' ? parseInt(num) : num);
      } else if (typeof nextData.red === 'string') {
        const numbers = nextData.red.match(/\d+/g);
        if (numbers) {
          nextRedNumbers = numbers.map(num => parseInt(num));
        }
      }
      
      // 添加到结果数组
      comboOccurrences.push({
        period: row.issue,
        drawDate: row.draw_date,
        frontNumbers: currentRedNumbers,
        nextPeriod: nextData.issue,
        nextPeriodFrontNumbers: nextRedNumbers
      });
    });
    
    // 5. 计算统计数据
    const nextNumberCounts = {};
    comboOccurrences.forEach(record => {
      record.nextPeriodFrontNumbers.forEach(num => {
        nextNumberCounts[num] = (nextNumberCounts[num] || 0) + 1;
      });
    });
    
    // 6. 构造返回结果
    const result = {
      success: true,
      data: {
        combination: combination,
        targetBall: targetNumber,
        comboCount: comboCount,
        statsPeriod: statsPeriod,
        nextNumberCounts: nextNumberCounts,
        occurrenceDetails: comboOccurrences
      }
    };
    
    console.log('最新1期三球组合详情数据处理完成');
    return result;
  } catch (error) {
    console.error('获取最新1期三球组合详情数据失败:', error);
    return { success: false, message: error.message };
  }
}

/**
 * 最新1期三球组合详情接口
 * @route GET /san_qiu_zu_he_xiang_qing
 * @group 数据分析 - 最新1期三球组合相关接口
 * @param {string} combination.query.required - 三球组合（格式：1-2-3）
 * @param {string} number.query - 目标球
 * @param {string} period.query - 统计期数 (35, 50, 100, 200, 300, 500, 1000, all)
 * @returns {object} 200 - 成功响应，包含组合详情数据
 * @returns {object} 400 - 参数错误
 * @returns {object} 500 - 服务器内部错误
 */
router.get('/', async (req, res) => {
  try {
    const { combination, number, period } = req.query;
    
    if (!combination) {
      return res.status(400).json({
        success: false,
        message: '缺少必需参数：combination'
      });
    }
    
    const result = await getSanQiuZuHeXiangQing(combination, number, period);
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || '服务器内部错误'
    });
  }
});

module.exports = router;