// 参数说明:
// - period: 必需，查询周期，值可以是 "35", "50", "100", "200", "300", "500", "1000"
// 接口功能: 分析倒数第3期前区两球组合在下下期的出现情况
// 返回倒数第3期前区两球组合的统计数据

const express = require('express');
const cors = require('cors');
const { query } = require('./数据库配置.js');

const router = express.Router();

/**
 * 获取倒数第3期前区两球组合下下期出现统计数据
 * @param {string} period - 统计周期（35, 50, 100, 200, 300, 500, 1000）
 * @returns {Promise<Object>} 包含前区两球组合统计的结果
 */
async function getThirdLastFrontZoneAnalysis(period, targetPeriod) {
  try {
    // 验证参数
    if (period !== 'all' && (isNaN(period) || parseInt(period) <= 0)) {
      throw new Error('无效的周期参数，必须是正整数或"all"');
    }

    // 获取倒数第3期的开奖数据（如果提供了targetPeriod，则使用指定期号的前两期作为倒数第3期）
    console.log('开始查询倒数第3期开奖数据...');
    let thirdLastResult;
    if (targetPeriod) {
      console.log('使用指定的目标期号:', targetPeriod);
      // 查找指定期号的前两期作为倒数第3期
      const targetResultSql = `
        SELECT * 
        FROM lottery_results 
        WHERE issue < '${targetPeriod}' 
        ORDER BY issue DESC 
        LIMIT 2, 1
      `;
      thirdLastResult = await query(targetResultSql);
    } else {
      console.log('使用最新一期的倒数第3期数据');
      const thirdLastResultSql = `
        SELECT * 
        FROM lottery_results 
        ORDER BY issue DESC 
        LIMIT 2, 1
      `;
      thirdLastResult = await query(thirdLastResultSql);
    }
    
    console.log('倒数第3期开奖数据查询完成');
    
    if (!thirdLastResult || thirdLastResult.length === 0) {
      throw new Error('未找到倒数第3期开奖数据');
    }

    const thirdLastDraw = thirdLastResult[0];
    console.log('获取到倒数第3期开奖期号:', thirdLastDraw.issue);
    console.log('红球数据:', thirdLastDraw.red);
    
    // 解析前区号码（从red字段中获取）
    let frontNumbers = [];
    try {
      if (Array.isArray(thirdLastDraw.red)) {
        // 如果已经是数组，直接使用
        frontNumbers = thirdLastDraw.red.map(num => typeof num === 'string' ? parseInt(num) : num);
      } else if (typeof thirdLastDraw.red === 'string') {
        // 从字符串中提取数字
        const numbers = thirdLastDraw.red.match(/\d+/g);
        if (numbers) {
          frontNumbers = numbers.map(num => parseInt(num));
        }
      }
      // 确保frontNumbers至少有一些号码，否则记录错误
      if (!frontNumbers.length) {
        console.error('Failed to extract front numbers from:', thirdLastDraw.red);
      }
    } catch (e) {
      console.error('Error extracting red numbers:', e);
    }

    // 获取历史数据（用于统计）
    let historyData;
    console.log('准备查询历史数据，period:', period);
    // 直接使用查询，不使用参数化查询的LIMIT
    if (period === 'all') {
      // 查询所有历史数据（除了最新三期）
      const historySql = `
        SELECT * 
        FROM lottery_results 
        WHERE issue < '${thirdLastDraw.issue}' 
        ORDER BY issue DESC
      `;
      historyData = await query(historySql);
    } else {
      // 查询指定周期内的历史数据
      const limit = parseInt(period);
      const historySql = `
        SELECT * 
        FROM lottery_results 
        WHERE issue < '${thirdLastDraw.issue}' 
        ORDER BY issue DESC 
        LIMIT ${limit}
      `;
      historyData = await query(historySql);
    }
    console.log('历史数据查询完成，共获取', historyData.length, '条记录');

    // 生成倒数第3期前区号码的所有两球组合
    const frontCombinations = [];
    for (let i = 0; i < frontNumbers.length; i++) {
      for (let j = i + 1; j < frontNumbers.length; j++) {
        // 确保小球在前，大球在后，保持一致性
        const ball1 = Math.min(frontNumbers[i], frontNumbers[j]);
        const ball2 = Math.max(frontNumbers[i], frontNumbers[j]);
        frontCombinations.push(`${ball1}-${ball2}`);
      }
    }

    // 统计前区每个组合出现时下下期的号码
    const frontCombinationStats = {};
    frontCombinations.forEach(combination => {
      frontCombinationStats[combination] = {
        combo: combination,
        count: 0,
        nextDrawNumbers: [], // 存储这个组合出现时下下期开出的号码
        numberCounts: {}, // 统计每个号码出现的次数
        occurrenceDetails: [] // 存储组合出现时的期号和下下期信息
      };
    });

    // 遍历历史数据，查找组合出现的位置，并记录下下下期的号码
    // 注意：历史数据是按issue降序排列的，所以下下下期的索引是i-3
    for (let i = 3; i < historyData.length; i++) {
      const currentDraw = historyData[i];  // 当前期（组合出现的期数）
      const nextNextNextDraw = historyData[i - 3]; // 下下下期（期号比当前期大3，因为数据是降序排列的）
      
      // 确保nextNextNextDraw存在
      if (!nextNextNextDraw) continue;
      
      // 解析当前期的前区号码
      let currentFrontNumbers = [];
      try {
        if (Array.isArray(currentDraw.red)) {
          currentFrontNumbers = currentDraw.red.map(num => typeof num === 'string' ? parseInt(num) : num);
        } else if (typeof currentDraw.red === 'string') {
          currentFrontNumbers = currentDraw.red.match(/\d+/g)?.map(num => parseInt(num)) || [];
        }
      } catch (e) {
        console.error('Error extracting current draw red numbers:', e);
      }
      
      // 生成当前期前区的所有两球组合
      const currentFrontCombinations = [];
      for (let j = 0; j < currentFrontNumbers.length; j++) {
        for (let k = j + 1; k < currentFrontNumbers.length; k++) {
          const ball1 = Math.min(currentFrontNumbers[j], currentFrontNumbers[k]);
          const ball2 = Math.max(currentFrontNumbers[j], currentFrontNumbers[k]);
          currentFrontCombinations.push(`${ball1}-${ball2}`);
        }
      }
      
      // 检查前区是否包含我们关心的组合
      currentFrontCombinations.forEach(comb => {
        if (frontCombinations.includes(comb)) {
          // 获取下下下期的前区号码
          let nextNextNextNumbers = [];
          try {
            if (Array.isArray(nextNextNextDraw.red)) {
              nextNextNextNumbers = nextNextNextDraw.red.map(num => typeof num === 'string' ? parseInt(num) : num);
            } else if (typeof nextNextNextDraw.red === 'string') {
              nextNextNextNumbers = nextNextNextDraw.red.match(/\d+/g)?.map(num => parseInt(num)) || [];
            }
          } catch (e) {
            console.error('Error extracting next next next draw red numbers:', e);
          }
          
          // 记录下下下期的号码
          nextNextNextNumbers.forEach(num => {
            frontCombinationStats[comb].nextDrawNumbers.push(String(num));
            frontCombinationStats[comb].numberCounts[num] = 
              (frontCombinationStats[comb].numberCounts[num] || 0) + 1;
          });
          
          // 记录组合出现的详细信息
          frontCombinationStats[comb].occurrenceDetails.push({
            currentPeriod: currentDraw.issue,
            currentDrawDate: currentDraw.draw_date || currentDraw.date || '',
            currentFrontNumbers: currentFrontNumbers,
            nextNextNextPeriod: nextNextNextDraw.issue,
            nextNextNextDrawDate: nextNextNextDraw.draw_date || nextNextNextDraw.date || '',
            nextNextNextFrontNumbers: nextNextNextNumbers
          });
          
          // 更新组合出现次数
          frontCombinationStats[comb].count++;
        }
      });
    }

      // 计算前区推荐杀号
    console.log('计算前区推荐杀号...');
    const frontNumberCounts = {}; // 前区1-35：记录每个号码在组合出现时下下下期的出现次数
    for (let i = 1; i <= 35; i++) frontNumberCounts[i] = 0;
    
    // 统计组合出现时下下下期号码的出现次数（基于前端表格显示的数据维度）
    console.log('开始统计组合出现时下下下期号码的出现次数');
    
    // 遍历所有组合的统计数据
    Object.values(frontCombinationStats).forEach(combination => {
      // 获取当前组合对应的下下下期号码列表
      const nextDrawNumbers = combination.nextDrawNumbers || [];
      
      // 统计每个号码出现的次数
      nextDrawNumbers.forEach(numStr => {
        const num = parseInt(numStr);
        if (frontNumberCounts.hasOwnProperty(num)) {
          frontNumberCounts[num]++;
        }
      });
    });
    
    // 输出号码统计结果（基于组合出现时下下下期的维度）
    console.log('组合出现时下下下期号码出现次数统计结果:', frontNumberCounts);
    
    // 只返回出现次数为0的号码作为杀号（符合用户需求）
    let recommendedFrontKillNumbers = Object.entries(frontNumberCounts)
      .filter(([num, count]) => count === 0)
      .map(([num]) => parseInt(num))
      .sort((a, b) => a - b);
    
    console.log('是否有出现次数为0的号码:', recommendedFrontKillNumbers.length > 0);
    
    console.log('前区推荐杀号计算完成(基于组合出现时下下下期维度):', recommendedFrontKillNumbers);

    // 整理结果
    console.log('准备返回结果...');
    
    const result = {
      thirdLastDraw: {
        issue: thirdLastDraw.issue,
        drawDate: thirdLastDraw.draw_date || thirdLastDraw.date || new Date().toISOString().split('T')[0],
        firstZoneNumbers: frontNumbers
      },
      combinations: Object.values(frontCombinationStats),
      period: period,
      prediction: [], // 可以根据需要添加预测算法
      recommendedFrontKillNumbers: recommendedFrontKillNumbers // 返回前区推荐杀号
    };

    console.log('结果返回成功');
    return result;
  } catch (error) {
    console.error('倒数第3期前区两球组合分析出错:', error);
    console.error('错误堆栈:', error.stack);
    throw error;
  }
}

/**
 * 倒数第3期前区两球组合分析接口
 * @route GET /dao_shu_3_qi_liang_qiu_zu_he
 * @group 数据分析 - 倒数第3期前区两球组合分析相关接口
 * @param {string} period.query.required - 统计周期 (35, 50, 100, 200, 300, 500, 1000)
 * @returns {object} 200 - 成功响应，包含前区两球组合统计
 * @returns {object} 400 - 参数错误
 * @returns {object} 500 - 服务器内部错误
 */
router.get('/', async (req, res) => {
  try {
    const { period, target_period } = req.query;
    
    if (!period) {
      return res.status(400).json({
        success: false,
        message: '缺少必需参数：period'
      });
    }

    const result = await getThirdLastFrontZoneAnalysis(period, target_period);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || '服务器内部错误'
    });
  }
});

module.exports = router;