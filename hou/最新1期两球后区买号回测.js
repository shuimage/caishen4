// 参数说明:
// - backtest_period: 必需，回测周期，值可以是 "35", "50", "100", "200", "300", "500", "1000", "all"
// - stats_period: 必需，统计周期，值可以是 "35", "50", "100", "200", "300", "500", "1000", "all"
// 接口功能: 回测最新1期两球组合后区买号结果，比较推荐买号与真实的开奖结果
// 返回每一期的回测数据，包括期号、推荐买号、下期开奖号、正确买号和错误买号数量

const express = require('express');
const { query } = require('./数据库配置.js');

const router = express.Router();

/**
 * 计算后区推荐买号
 * @param {Array} combinations - 后区两球组合数组
 * @param {Object} combinationStats - 组合统计数据
 * @param {string} backtestMethod - 回测方法：most(出现最多), least(出现最少), average(出现平均)
 * @returns {Array} 推荐买号数组
 */
function calculateBackBuyNumbers(combinations, combinationStats, backtestMethod = 'most') {
  // 统计所有号码的总出现次数
  const totalNumberCounts = {};
  
  // 初始化统计对象（后区号码范围：1-12）
  for (let num = 1; num <= 12; num++) {
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
  
  // 检查是否是排名方法
  const rankMatch = backtestMethod.match(/^rank(\d+)$/);
  if (rankMatch) {
    // 排名方法：根据排名选择号码
    const rank = parseInt(rankMatch[1]);
    
    // 按出现次数降序排序号码（包括出现次数为0的号码）
    const sortedNumbers = [];
    for (let num = 1; num <= 12; num++) {
      sortedNumbers.push({ number: num, count: totalNumberCounts[num] || 0 });
    }
    sortedNumbers.sort((a, b) => b.count - a.count);
    
    // 计算每个号码的实际排名
    const rankMap = {};
    let currentRank = 1;
    
    for (let i = 0; i < sortedNumbers.length; i++) {
      if (i > 0 && sortedNumbers[i].count !== sortedNumbers[i - 1].count) {
        currentRank++;
      }
      rankMap[sortedNumbers[i].number] = currentRank;
    }
    
    // 找出所有排名等于指定排名的号码
    for (let num = 1; num <= 12; num++) {
      if (rankMap[num] === rank) {
        buyNumbers.push(num);
      }
    }
  } else {
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
  }
  
  return buyNumbers;
}

/**
 * 获取最新1期两球组合后区买号回测数据
 * @param {string} backtest_period - 回测周期
 * @param {string} stats_period - 统计周期
 * @param {string} backtest_method - 回测方法：most(出现最多), least(出现最少), average(出现平均)
 * @returns {Promise<Object>} 包含回测数据的结果
 */
async function huo_qu_sha_hao_hou_mai_hao_hui_ce(backtest_period, stats_period, backtest_method = 'most') {
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
    // 检查是否是排名方法
    const isRankMethod = backtest_method.match(/^rank(\d+)$/);
    if (!validMethods.includes(backtest_method) && !isRankMethod) {
      throw new Error(`无效的回测方法参数，必须是以下值之一：${validMethods.join(', ')} 或排名方法（如 rank1）`);
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
      // 查询指定周期内的历史数据
      const limit = parseInt(backtest_period);
      const historySql = `
        SELECT * 
        FROM lottery_results 
        ORDER BY issue DESC 
        LIMIT ${limit + 1}  -- 多获取1期，用于回测比较
      `;
      historyData = await query(historySql);
    }
    
    console.log('历史数据查询完成，共获取', historyData.length, '条记录');
    
    if (!historyData || historyData.length < 2) {
      throw new Error('历史数据不足，无法进行回测');
    }
    
    // 回测数据结果数组
    const backtestResults = [];
    
    // 对每一期进行回测（跳过最新一期，因为没有下期数据）
    for (let i = 1; i < historyData.length; i++) {
      const currentDraw = historyData[i];  // 当前回测期
      const nextDraw = historyData[i - 1]; // 下期开奖结果（用于比较）
      
      // 解析当前期的后区号码
      let backNumbers = [];
      try {
        if (Array.isArray(currentDraw.blue)) {
          backNumbers = currentDraw.blue.map(num => typeof num === 'string' ? parseInt(num) : num);
        } else if (typeof currentDraw.blue === 'string') {
          const numbers = currentDraw.blue.match(/\d+/g);
          if (numbers) {
            backNumbers = numbers.map(num => parseInt(num));
          }
        }
      } catch (e) {
        console.error('解析当前期后区号码失败:', e);
        continue;
      }
      
      // 生成当前期后区号码的两球组合
      const backCombinations = [];
      if (backNumbers.length >= 2) {
        for (let j = 0; j < backNumbers.length; j++) {
          for (let k = j + 1; k < backNumbers.length; k++) {
            // 确保小球在前，大球在后，保持一致性
            const ball1 = Math.min(backNumbers[j], backNumbers[k]);
            const ball2 = Math.max(backNumbers[j], backNumbers[k]);
            backCombinations.push(`${ball1}-${ball2}`);
          }
        }
      }
      
      if (backCombinations.length === 0) {
        console.error('无法生成当前期后区两球组合:', currentDraw.issue);
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
      
      // 统计后区每个组合出现时下一期的号码
      const backCombinationStats = {};
      backCombinations.forEach(combination => {
        backCombinationStats[combination] = {
          combination: combination,
          numberCounts: {} // 统计每个号码出现的次数
        };
      });
      
      // 遍历统计历史数据，查找组合出现的位置，并记录下一期的号码
      for (let j = 1; j < statsHistoryData.length; j++) {
        const statsCurrentDraw = statsHistoryData[j];
        const statsNextDraw = statsHistoryData[j - 1];
        
        // 解析统计当前期的后区号码
        let statsCurrentBackNumbers = [];
        try {
          if (Array.isArray(statsCurrentDraw.blue)) {
            statsCurrentBackNumbers = statsCurrentDraw.blue.map(num => typeof num === 'string' ? parseInt(num) : num);
          } else if (typeof statsCurrentDraw.blue === 'string') {
            statsCurrentBackNumbers = statsCurrentDraw.blue.match(/\d+/g)?.map(num => parseInt(num)) || [];
          }
        } catch (e) {
          console.error('解析统计当前期后区号码失败:', e);
          continue;
        }
        
        // 生成统计当前期后区的所有两球组合
        const statsCurrentBackCombinations = [];
        if (statsCurrentBackNumbers.length >= 2) {
          for (let m = 0; m < statsCurrentBackNumbers.length; m++) {
            for (let n = m + 1; n < statsCurrentBackNumbers.length; n++) {
              const ball1 = Math.min(statsCurrentBackNumbers[m], statsCurrentBackNumbers[n]);
              const ball2 = Math.max(statsCurrentBackNumbers[m], statsCurrentBackNumbers[n]);
              statsCurrentBackCombinations.push(`${ball1}-${ball2}`);
            }
          }
        }
        
        // 检查后区是否包含我们关心的组合
        statsCurrentBackCombinations.forEach(comb => {
          if (backCombinations.includes(comb)) {
            // 获取下一期的后区号码
            let nextNumbers = [];
            try {
              if (Array.isArray(statsNextDraw.blue)) {
                nextNumbers = statsNextDraw.blue.map(num => typeof num === 'string' ? parseInt(num) : num);
              } else if (typeof statsNextDraw.blue === 'string') {
                nextNumbers = statsNextDraw.blue.match(/\d+/g)?.map(num => parseInt(num)) || [];
              }
            } catch (e) {
              console.error('解析统计下一期后区号码失败:', e);
              return;
            }
            
            // 更新号码计数
            nextNumbers.forEach(num => {
              backCombinationStats[comb].numberCounts[num] = 
                (backCombinationStats[comb].numberCounts[num] || 0) + 1;
            });
          }
        });
      }
      
      // 计算当前期的后区推荐买号
      const recommendedBackBuyNumbers = calculateBackBuyNumbers(backCombinations, backCombinationStats, backtest_method);
      
      // 解析下期的后区号码
      let nextBackNumbers = [];
      try {
        if (Array.isArray(nextDraw.blue)) {
          nextBackNumbers = nextDraw.blue.map(num => typeof num === 'string' ? parseInt(num) : num);
        } else if (typeof nextDraw.blue === 'string') {
          const numbers = nextDraw.blue.match(/\d+/g);
          if (numbers) {
            nextBackNumbers = numbers.map(num => parseInt(num));
          }
        }
      } catch (e) {
        console.error('解析下期后区号码失败:', e);
        continue;
      }
      
      // 计算后区正确买号和错误买号数量
      let backCorrectBuy = 0;
      let backWrongBuy = 0;
      
      recommendedBackBuyNumbers.forEach(buyNum => {
        if (nextBackNumbers.includes(buyNum)) {
          // 正确买号：推荐买号出现在下期开奖号中
          backCorrectBuy++;
        } else {
          // 错误买号：推荐买号没有出现在下期开奖号中
          backWrongBuy++;
        }
      });
      
      // 添加到回测结果
      backtestResults.push({
        currentIssue: currentDraw.issue, // 当前回测期号
        backBuyNumbers: recommendedBackBuyNumbers, // 后区推荐买号
        nextIssue: nextDraw.issue, // 下期开奖期号
        nextBackNumbers: nextBackNumbers, // 下期实际开奖后区
        backCorrectBuy: backCorrectBuy, // 正确买号数量
        backWrongBuy: backWrongBuy // 错误买号数量
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
    
    console.log('后区买号回测完成，共处理', backtestResults.length, '期数据');
    return result;
  } catch (error) {
    console.error('后区买号回测出错:', error);
    console.error('错误堆栈:', error.stack);
    throw error;
  }
}

/**
 * 最新1期两球组合后区买号回测接口
 * @route GET /huo_qu_sha_hao_hou_mai_hao_hui_ce
 * @group 数据分析 - 后区买号回测相关接口
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

    const result = await huo_qu_sha_hao_hou_mai_hao_hui_ce(backtest_period, stats_period, backtest_method);
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || '服务器内部错误'
    });
  }
});

module.exports = router;