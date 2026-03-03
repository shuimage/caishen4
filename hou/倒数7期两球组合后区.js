// 参数说明:
// - period: 必需，查询周期，值可以是 "35", "50", "100", "200", "300", "500", "1000"
// 接口功能: 分析倒数第7期后区两球组合在下下下下下下下期的出现情况
// 返回倒数第7期后区两球组合的统计数据

const express = require('express');
const cors = require('cors');
const { query } = require('./数据库配置.js');

const router = express.Router();

/**
 * 获取倒数第7期后区两球组合下下下下下下下期出现统计数据
 * @param {string} period - 统计周期（35, 50, 100, 200, 300, 500, 1000）
 * @returns {Promise<Object>} 包含后区两球组合统计的结果
 */
async function getSeventhLastBackZoneAnalysis(period) {
  try {
    // 验证参数并转换类型
    let processedPeriod = period;
    if (typeof period === 'string') {
      // 移除中文，只保留数字
      const numericPart = period.replace(/[^0-9]/g, '');
      if (numericPart) {
        processedPeriod = parseInt(numericPart);
      } else if (period === 'all') {
        processedPeriod = 'all';
      }
    }
    
    // 验证参数
    if (processedPeriod !== 'all' && (isNaN(processedPeriod) || processedPeriod <= 0)) {
      throw new Error('无效的周期参数，必须是正整数或"all"');
    }

    // 获取倒数第7期的开奖数据
    console.log('开始查询倒数第7期开奖数据...');
    const seventhLastResultSql = `
      SELECT * 
      FROM lottery_results 
      ORDER BY issue DESC 
      LIMIT 6, 1
    `;
    
    const seventhLastResult = await query(seventhLastResultSql);
    console.log('倒数第7期开奖数据查询完成');
    
    if (!seventhLastResult || seventhLastResult.length === 0) {
      throw new Error('未找到倒数第7期开奖数据');
    }

    const seventhLastDraw = seventhLastResult[0];
    console.log('获取到倒数第7期开奖期号:', seventhLastDraw.issue);
    console.log('蓝球数据:', seventhLastDraw.blue);
    
    // 解析后区号码（从blue字段中获取）
    let backNumbers = [];
    try {
      if (Array.isArray(seventhLastDraw.blue)) {
        // 如果已经是数组，直接使用
        backNumbers = seventhLastDraw.blue.map(num => typeof num === 'string' ? parseInt(num) : num);
      } else if (typeof seventhLastDraw.blue === 'string') {
        // 从字符串中提取数字
        const numbers = seventhLastDraw.blue.match(/\d+/g);
        if (numbers) {
          backNumbers = numbers.map(num => parseInt(num));
        }
      }
      // 确保backNumbers至少有一些号码，否则记录错误
      if (!backNumbers.length) {
        console.error('Failed to extract back numbers from:', seventhLastDraw.blue);
      }
    } catch (e) {
      console.error('Error extracting blue numbers:', e);
    }

    // 获取历史数据（用于统计）
    let historyData;
    console.log('准备查询历史数据，period:', processedPeriod);
    // 直接使用查询，不使用参数化查询的LIMIT
    if (processedPeriod === 'all') {
      // 查询所有历史数据（除了最新七期）
      const historySql = `
        SELECT * 
        FROM lottery_results 
        WHERE issue < '${seventhLastDraw.issue}' 
        ORDER BY issue DESC
      `;
      historyData = await query(historySql);
    } else {
      // 查询指定周期内的历史数据
      const limit = processedPeriod;
      const historySql = `
        SELECT * 
        FROM lottery_results 
        WHERE issue < '${seventhLastDraw.issue}' 
        ORDER BY issue DESC 
        LIMIT ${limit}
      `;
      historyData = await query(historySql);
    }
    console.log('历史数据查询完成，共获取', historyData.length, '条记录');

    // 生成倒数第7期后区号码的所有两球组合
    const backCombinations = [];
    for (let i = 0; i < backNumbers.length; i++) {
      for (let j = i + 1; j < backNumbers.length; j++) {
        // 确保小球在前，大球在后，保持一致性
        const ball1 = Math.min(backNumbers[i], backNumbers[j]);
        const ball2 = Math.max(backNumbers[i], backNumbers[j]);
        backCombinations.push(`${ball1}-${ball2}`);
      }
    }

    // 统计后区每个组合出现时下下下下下下下期的号码
    const backCombinationStats = {};
    backCombinations.forEach(combination => {
      backCombinationStats[combination] = {
        combo: combination,
        count: 0,
        nextDrawNumbers: [], // 存储这个组合出现时下下下下下下下期开出的号码
        numberCounts: {}, // 统计每个号码出现的次数
        occurrenceDetails: [] // 存储组合出现时的期号和下下下下下下下期信息
      };
    });

    // 遍历历史数据，查找组合出现的位置，并记录下下下下下下下期的号码
    // 注意：历史数据是按issue降序排列的，所以下下下下下下下期的索引是i-7
    for (let i = 7; i < historyData.length; i++) {
      const currentDraw = historyData[i];  // 当前期（组合出现的期数）
      const nextNextNextNextNextNextNextDraw = historyData[i - 7]; // 下下下下下下下期（期号比当前期大7，因为数据是降序排列的）
      
      // 确保nextNextNextNextNextNextNextDraw存在
      if (!nextNextNextNextNextNextNextDraw) continue;
      
      // 解析当前期的后区号码
      let currentBackNumbers = [];
      try {
        if (Array.isArray(currentDraw.blue)) {
          currentBackNumbers = currentDraw.blue.map(num => typeof num === 'string' ? parseInt(num) : num);
        } else if (typeof currentDraw.blue === 'string') {
          currentBackNumbers = currentDraw.blue.match(/\d+/g)?.map(num => parseInt(num)) || [];
        }
      } catch (e) {
        console.error('Error extracting current draw blue numbers:', e);
      }
      
      // 生成当前期后区的所有两球组合
      const currentBackCombinations = [];
      for (let j = 0; j < currentBackNumbers.length; j++) {
        for (let k = j + 1; k < currentBackNumbers.length; k++) {
          const ball1 = Math.min(currentBackNumbers[j], currentBackNumbers[k]);
          const ball2 = Math.max(currentBackNumbers[j], currentBackNumbers[k]);
          currentBackCombinations.push(`${ball1}-${ball2}`);
        }
      }
      
      // 检查后区是否包含我们关心的组合
      currentBackCombinations.forEach(comb => {
        if (backCombinations.includes(comb)) {
          // 获取下下下下下下下期的后区号码
          let nextNextNextNextNextNextNextNumbers = [];
          try {
            if (Array.isArray(nextNextNextNextNextNextNextDraw.blue)) {
              nextNextNextNextNextNextNextNumbers = nextNextNextNextNextNextNextDraw.blue.map(num => typeof num === 'string' ? parseInt(num) : num);
            } else if (typeof nextNextNextNextNextNextNextDraw.blue === 'string') {
              nextNextNextNextNextNextNextNumbers = nextNextNextNextNextNextNextDraw.blue.match(/\d+/g)?.map(num => parseInt(num)) || [];
            }
          } catch (e) {
            console.error('Error extracting next next next next next next next draw blue numbers:', e);
          }
          
          // 记录下下下下下下下期的号码
          nextNextNextNextNextNextNextNumbers.forEach(num => {
            backCombinationStats[comb].nextDrawNumbers.push(String(num));
            backCombinationStats[comb].numberCounts[num] = 
              (backCombinationStats[comb].numberCounts[num] || 0) + 1;
          });
          
          // 记录组合出现的详细信息
          backCombinationStats[comb].occurrenceDetails.push({
            currentPeriod: currentDraw.issue,
            currentDrawDate: currentDraw.draw_date || currentDraw.date || '',
            currentBackNumbers: currentBackNumbers,
            nextNextNextNextNextNextNextPeriod: nextNextNextNextNextNextNextDraw.issue,
            nextNextNextNextNextNextNextDrawDate: nextNextNextNextNextNextNextDraw.draw_date || nextNextNextNextNextNextNextDraw.date || '',
            nextNextNextNextNextNextNextBackNumbers: nextNextNextNextNextNextNextNumbers
          });
          
          // 更新组合出现次数
          backCombinationStats[comb].count++;
        }
      });
    }

    // 整理结果
    console.log('准备返回结果...');
    
    const result = {
      seventhLastDraw: {
        issue: seventhLastDraw.issue,
        drawDate: seventhLastDraw.draw_date || seventhLastDraw.date || new Date().toISOString().split('T')[0],
        firstZoneNumbers: backNumbers // 使用与前区相同的字段名，保证数据格式一致
      },
      combinations: Object.values(backCombinationStats),
      period: period,
      prediction: [] // 可以根据需要添加预测算法
    };

    console.log('结果返回成功');
    return result;
  } catch (error) {
    console.error('倒数第7期后区两球组合分析出错:', error);
    console.error('错误堆栈:', error.stack);
    throw error;
  }
}

/**
 * 倒数第7期后区两球组合分析接口
 * @route GET /dao_shu_7_qi_hou_qu_zu_he
 * @group 数据分析 - 倒数第7期后区两球组合分析相关接口
 * @param {string} period.query.required - 统计周期 (35, 50, 100, 200, 300, 500, 1000)
 * @returns {object} 200 - 成功响应，包含后区两球组合统计
 * @returns {object} 400 - 参数错误
 * @returns {object} 500 - 服务器内部错误
 */
router.get('/', async (req, res) => {
  try {
    const { period } = req.query;
    
    if (!period) {
      return res.status(400).json({
        success: false,
        message: '缺少必需参数：period'
      });
    }

    // 处理中文期数参数
    let processedPeriod = period;
    if (typeof period === 'string') {
      // 移除中文，只保留数字
      const numericPart = period.replace(/[^0-9]/g, '');
      if (numericPart) {
        processedPeriod = numericPart;
      } else if (period === '全部期') {
        processedPeriod = 'all';
      }
    }

    const result = await getSeventhLastBackZoneAnalysis(processedPeriod);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('路由处理错误:', error);
    res.status(500).json({
      success: false,
      message: error.message || '服务器内部错误'
    });
  }
});

module.exports = router;