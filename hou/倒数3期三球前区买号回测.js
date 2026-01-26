// 参数说明:
// - backtest_period: 必需，回测周期，值可以是 "35", "50", "100", "200", "300", "500", "1000", "all"
// - stats_period: 必需，统计周期，值可以是 "35", "50", "100", "200", "300", "500", "1000", "all"
// 接口功能: 回测倒数3期三球组合前区买号结果，比较推荐买号与真实的开奖结果
// 返回每一期的回测数据，包括期号、推荐买号、下下下期开奖号、正确买号和错误买号数量

const express = require('express');
const { query } = require('./数据库配置.js');

const router = express.Router();

/**
 * 生成三球组合
 * @param {Array} numbers - 号码数组
 * @returns {Array} 三球组合数组
 */
function generateTripleCombinations(numbers) {
  const combinations = [];
  for (let i = 0; i < numbers.length; i++) {
    for (let j = i + 1; j < numbers.length; j++) {
      for (let k = j + 1; k < numbers.length; k++) {
        // 号码从小到大排序，确保组合唯一性
        const sortedBalls = [numbers[i], numbers[j], numbers[k]].sort((a, b) => a - b);
        combinations.push(`${sortedBalls[0]}-${sortedBalls[1]}-${sortedBalls[2]}`);
      }
    }
  }
  return combinations;
}

/**
 * 计算前区推荐买号
 * @param {Array} combinations - 前区三球组合数组
 * @param {Object} combinationStats - 组合统计数据
 * @param {string} backtestMethod - 回测方法：most(出现最多), least(出现最少), average(出现平均)
 * @returns {Array} 推荐买号数组
 */
function calculateFrontBuyNumbers(combinations, combinationStats, backtestMethod = 'most') {
  // 统计所有号码的总出现次数
  const totalNumberCounts = {};
  
  // 初始化统计对象
  for (let num = 1; num <= 35; num++) {
    totalNumberCounts[num] = 0;
  }
  
  // 遍历所有组合的统计数据
  combinations.forEach(combination => {
    if (combinationStats[combination] && combinationStats[combination].numberCounts) {
      const numberCounts = combinationStats[combination].numberCounts;
      // 累加每个号码的出现次数
      for (const [num, count] of Object.entries(numberCounts)) {
        const number = parseInt(num);
        totalNumberCounts[number] += count;
      }
    }
  });
  
  // 获取所有非零计数
  const nonZeroCounts = Object.values(totalNumberCounts).filter(count => count > 0);
  const buyNumbers = [];
  
  switch (backtestMethod) {
    case 'least':
      // 出现最少：找出出现次数最少的号码
      if (nonZeroCounts.length > 0) {
        const minCount = Math.min(...nonZeroCounts);
        for (const [num, count] of Object.entries(totalNumberCounts)) {
          if (count === minCount && count > 0) {
            buyNumbers.push(parseInt(num));
          }
        }
      }
      break;
      
    case 'average':
      // 出现平均：找出出现次数等于平均值的号码
      if (nonZeroCounts.length > 0) {
        const sumCounts = nonZeroCounts.reduce((sum, count) => sum + count, 0);
        const averageCount = Math.round(sumCounts / nonZeroCounts.length);
        for (const [num, count] of Object.entries(totalNumberCounts)) {
          if (count === averageCount && count > 0) {
            buyNumbers.push(parseInt(num));
          }
        }
      }
      break;
      
    case 'most':
    default:
      // 出现最多：找出出现次数最多的号码
      const maxCount = Math.max(...Object.values(totalNumberCounts));
      for (const [num, count] of Object.entries(totalNumberCounts)) {
        if (count === maxCount && count > 0) {
          buyNumbers.push(parseInt(num));
        }
      }
      break;
  }
  
  return buyNumbers;
}

/**
 * 获取倒数3期三球组合前区买号回测数据
 * @param {string} backtest_period - 回测周期
 * @param {string} stats_period - 统计周期
 * @param {string} backtest_method - 回测方法：most(出现最多), least(出现最少), average(出现平均)
 * @returns {Promise<Object>} 包含回测数据的结果
 */
async function huo_qu_dao_shu_3_qi_san_qiu_mai_hao_hui_ce(backtest_period, stats_period, backtest_method = 'most') {
  try {
    // 验证参数
    if (backtest_period !== 'all' && (isNaN(backtest_period) || parseInt(backtest_period) <= 0)) {
      throw new Error('无效的回测周期参数，必须是正整数或"all"');
    }
    if (stats_period !== 'all' && (isNaN(stats_period) || parseInt(stats_period) <= 0)) {
      throw new Error('无效的统计周期参数，必须是正整数或"all"');
    }
    
    // 验证回测方法参数
    const validMethods = ['most', 'least', 'average'];
    if (!validMethods.includes(backtest_method)) {
      throw new Error(`无效的回测方法参数，必须是以下值之一：${validMethods.join(', ')}`);
    }

    // 获取历史数据用于回测
    console.log('开始查询历史数据，backtest_period:', backtest_period, ', stats_period:', stats_period, ', backtest_method:', backtest_method);
    let historyData;
    
    if (backtest_period === 'all') {
      // 查询所有历史数据
      const historySql = `
        SELECT * 
        FROM lottery_results 
        ORDER BY issue DESC
      `;
      historyData = await query(historySql);
    } else {
      // 查询指定周期内的历史数据，多获取3期用于倒数3期分析
      const limit = parseInt(backtest_period);
      const historySql = `
        SELECT * 
        FROM lottery_results 
        ORDER BY issue DESC 
        LIMIT ${limit + 3}  -- 多获取3期，用于倒数3期回测比较
      `;
      historyData = await query(historySql);
    }
    
    console.log('历史数据查询完成，共获取', historyData.length, '条记录');
    
    if (!historyData || historyData.length < 4) {
      throw new Error('历史数据不足，无法进行回测');
    }
    
    // 回测数据结果数组
    const backtestResults = [];
    
    // 对每一期进行回测（从第4条开始，确保有足够的历史数据）
    for (let i = 3; i < historyData.length; i++) {
      const currentDraw = historyData[i];  // 当前回测期
      const nextNextNextDraw = historyData[i - 3]; // 下下下期开奖结果（用于比较）
      
      // 解析当前期的前区号码
      let frontNumbers = [];
      try {
        if (Array.isArray(currentDraw.red)) {
          frontNumbers = currentDraw.red.map(num => typeof num === 'string' ? parseInt(num) : num);
        } else if (typeof currentDraw.red === 'string') {
          const numbers = currentDraw.red.match(/\d+/g);
          if (numbers) {
            frontNumbers = numbers.map(num => parseInt(num));
          }
        }
      } catch (e) {
        console.error('解析当前期前区号码失败:', e);
        continue;
      }
      
      // 生成当前期前区号码的所有三球组合
      const frontCombinations = generateTripleCombinations(frontNumbers);
      
      // 如果前区号码不足3个，无法生成三球组合，跳过此期
      if (frontCombinations.length === 0) {
        continue;
      }
      
      // 获取用于统计的历史数据（当前期之前的历史数据）
      const statsHistorySql = `
        SELECT * 
        FROM lottery_results 
        WHERE issue < '${currentDraw.issue}' 
        ORDER BY issue DESC 
        LIMIT ${stats_period === 'all' ? 1000 : parseInt(stats_period)}
      `;
      const statsHistoryData = await query(statsHistorySql);
      
      // 统计前区每个组合出现时下下下期的号码
      const frontCombinationStats = {};
      frontCombinations.forEach(combination => {
        frontCombinationStats[combination] = {
          combination: combination,
          count: 0, // 组合出现次数
          numberCounts: {} // 统计每个号码出现的次数
        };
      });
      
      // 遍历统计历史数据，查找组合出现的位置，并记录下下下期的号码
      for (let j = 3; j < statsHistoryData.length; j++) {
        const statsCurrentDraw = statsHistoryData[j];
        const statsNextNextNextDraw = statsHistoryData[j - 3];
        
        // 解析统计当前期的前区号码
        let statsCurrentFrontNumbers = [];
        try {
          if (Array.isArray(statsCurrentDraw.red)) {
            statsCurrentFrontNumbers = statsCurrentDraw.red.map(num => typeof num === 'string' ? parseInt(num) : num);
          } else if (typeof statsCurrentDraw.red === 'string') {
            statsCurrentFrontNumbers = statsCurrentDraw.red.match(/\d+/g)?.map(num => parseInt(num)) || [];
          }
        } catch (e) {
          console.error('解析统计当前期前区号码失败:', e);
          continue;
        }
        
        // 生成统计当前期前区的所有三球组合
        const statsCurrentFrontCombinations = generateTripleCombinations(statsCurrentFrontNumbers);
        
        // 检查前区是否包含我们关心的组合
        statsCurrentFrontCombinations.forEach(comb => {
          if (frontCombinations.includes(comb)) {
            // 获取下下下期的前区号码
            let nextNumbers = [];
            try {
              if (Array.isArray(statsNextNextNextDraw.red)) {
                nextNumbers = statsNextNextNextDraw.red.map(num => typeof num === 'string' ? parseInt(num) : num);
              } else if (typeof statsNextNextNextDraw.red === 'string') {
                nextNumbers = statsNextNextNextDraw.red.match(/\d+/g)?.map(num => parseInt(num)) || [];
              }
            } catch (e) {
              console.error('解析统计下下下期前区号码失败:', e);
              return;
            }
            
            // 更新组合出现次数
            frontCombinationStats[comb].count += 1;
            
            // 更新号码计数
            nextNumbers.forEach(num => {
              frontCombinationStats[comb].numberCounts[num] = 
                (frontCombinationStats[comb].numberCounts[num] || 0) + 1;
            });
          }
        });
      }
      
      // 计算当前期的前区推荐买号
      const recommendedFrontBuyNumbers = calculateFrontBuyNumbers(frontCombinations, frontCombinationStats, backtest_method);
      
      // 解析下下下期的前区号码
      let nextFrontNumbers = [];
      try {
        if (Array.isArray(nextNextNextDraw.red)) {
          nextFrontNumbers = nextNextNextDraw.red.map(num => typeof num === 'string' ? parseInt(num) : num);
        } else if (typeof nextNextNextDraw.red === 'string') {
          const numbers = nextNextNextDraw.red.match(/\d+/g);
          if (numbers) {
            nextFrontNumbers = numbers.map(num => parseInt(num));
          }
        }
      } catch (e) {
        console.error('解析下下下期前区号码失败:', e);
        continue;
      }
      
      // 计算前区正确买号和错误买号数量
      let frontCorrectBuy = 0;
      let frontWrongBuy = 0;
      
      recommendedFrontBuyNumbers.forEach(buyNum => {
        if (nextFrontNumbers.includes(buyNum)) {
          // 正确买号：推荐买号出现在下下下期开奖号中
          frontCorrectBuy++;
        } else {
          // 错误买号：推荐买号没有出现在下下下期开奖号中
          frontWrongBuy++;
        }
      });
      
      // 添加到回测结果
      backtestResults.push({
        currentIssue: currentDraw.issue, // 当前回测期号
        frontBuyNumbers: recommendedFrontBuyNumbers, // 前区推荐买号
        nextIssue: nextNextNextDraw.issue, // 下下下期开奖期号
        nextFrontNumbers: nextFrontNumbers, // 下下下期实际开奖前区
        frontCorrectBuy: frontCorrectBuy, // 正确买号数量
        frontWrongBuy: frontWrongBuy // 错误买号数量
      });
    }
    
    // 整理结果
    const result = {
      success: true,
      data: {
        backtest_period: backtest_period,
        stats_period: stats_period,
        backtest_method: backtest_method,
        backtestResults: backtestResults,
        totalPeriods: backtestResults.length
      }
    };
    
    console.log('回测完成，共处理', backtestResults.length, '期数据');
    return result;
  } catch (error) {
    console.error('前区买号回测出错:', error);
    console.error('错误堆栈:', error.stack);
    throw error;
  }
}

/**
 * 倒数3期三球组合前区买号回测接口
 * @route GET /dao_shu_3_qi_san_qiu_mai_hao_hui_ce
 * @group 数据分析 - 买号回测相关接口
 * @param {string} backtest_period.query.required - 回测周期 (35, 50, 100, 200, 300, 500, 1000, all)
 * @param {string} stats_period.query.required - 统计周期 (35, 50, 100, 200, 300, 500, 1000, all)
 * @param {string} backtest_method.query - 回测方法 (most, least, average)，默认 most
 * @returns {object} 200 - 成功响应，包含回测数据
 * @returns {object} 400 - 参数错误
 * @returns {object} 500 - 服务器内部错误
 */
router.get('/', async (req, res) => {
  try {
    const { backtest_period, stats_period, backtest_method = 'most' } = req.query;
    
    if (!backtest_period || !stats_period) {
      return res.status(400).json({
        success: false,
        message: '缺少必需参数：backtest_period 或 stats_period'
      });
    }

    const result = await huo_qu_dao_shu_3_qi_san_qiu_mai_hao_hui_ce(backtest_period, stats_period, backtest_method);
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || '服务器内部错误'
    });
  }
});

module.exports = router;