// 参数说明:
// - backtest_period: 必需，回测周期，值可以是 "35", "50", "100", "200", "300", "500", "1000", "all"
// - stats_period: 必需，统计周期，值可以是 "35", "50", "100", "200", "300", "500", "1000", "all"
// 接口功能: 回测倒数3期两球组合后区买号结果，比较推荐买号与真实的下下下期开奖结果
// 返回每一期的回测数据，包括期号、推荐买号、下下下期开奖号、正确买号和错误买号数量

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
  
  // 初始化统计对象（后区号码1-12）
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
    
    // 按出现次数降序排序号码（包括出现次数为0的号码），次数相同时按球号升序
    const sortedNumbers = [];
    for (let num = 1; num <= 12; num++) {
      sortedNumbers.push({ number: num, count: totalNumberCounts[num] || 0 });
    }
    sortedNumbers.sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;  // 出现次数降序
      }
      return a.number - b.number;  // 次数相同时，球号升序
    });
    
    // 直接使用索引 +1 作为排名，确保每个号码都有唯一排名
    // 即使排名超出范围，也返回最后一个号码
    const selectedIndex = Math.min(rank - 1, sortedNumbers.length - 1);
    const selectedNumber = sortedNumbers[selectedIndex];
    if (selectedNumber) {
      buyNumbers.push(selectedNumber.number);
    }
  } else {
    switch (backtestMethod) {
      case 'least':
        // 出现最少：找出出现次数最少的号码
        if (nonZeroCounts.length > 0) {
          const minCount = Math.min(...nonZeroCounts);
          // 找出所有出现次数等于最小值的号码
          const minCountNumbers = [];
          for (const [num, count] of Object.entries(totalNumberCounts)) {
            if (count === minCount && count > 0) {
              minCountNumbers.push(parseInt(num));
            }
          }
          // 只选择最小的号码，避免多球
          if (minCountNumbers.length > 0) {
            buyNumbers.push(Math.min(...minCountNumbers));
          }
        } else {
          // 所有号码出现次数都为0，返回最小的号码
          buyNumbers.push(1);
        }
        break;
        
      case 'average':
        // 出现平均：找出出现次数等于平均值的号码
        if (nonZeroCounts.length > 0) {
          const sumCounts = nonZeroCounts.reduce((sum, count) => sum + count, 0);
          const averageCount = Math.round(sumCounts / nonZeroCounts.length);
          // 找出所有出现次数等于平均值的号码
          const averageCountNumbers = [];
          for (const [num, count] of Object.entries(totalNumberCounts)) {
            if (count === averageCount && count > 0) {
              averageCountNumbers.push(parseInt(num));
            }
          }
          // 只选择最小的号码，避免多球
          if (averageCountNumbers.length > 0) {
            buyNumbers.push(Math.min(...averageCountNumbers));
          } else {
            // 没有号码等于平均值，返回最小的号码
            buyNumbers.push(1);
          }
        } else {
          // 所有号码出现次数都为0，返回最小的号码
          buyNumbers.push(1);
        }
        break;
        
      case 'most':
      default:
        // 出现最多：找出出现次数最多的号码
        const maxCount = Math.max(...Object.values(totalNumberCounts));
        // 找出所有出现次数等于最大值的号码
        const maxCountNumbers = [];
        for (const [num, count] of Object.entries(totalNumberCounts)) {
          if (count === maxCount && count > 0) {
            maxCountNumbers.push(parseInt(num));
          }
        }
        // 只选择最小的号码，避免多球
        if (maxCountNumbers.length > 0) {
          buyNumbers.push(Math.min(...maxCountNumbers));
        } else {
          // 所有号码出现次数都为0，返回最小的号码
          buyNumbers.push(1);
        }
        break;
    }
  }
  
  return buyNumbers;
}

/**
 * 获取倒数3期两球组合后区买号回测数据
 * @param {string} backtest_period - 回测周期
 * @param {string} stats_period - 统计周期
 * @param {string} backtest_method - 回测方法：most(出现最多), least(出现最少), average(出现平均)
 * @returns {Promise<Object>} 包含回测数据的结果
 */
async function huo_qu_dao_shu_3_qi_hou_mai_hao_hui_ce(backtest_period, stats_period, backtest_method = 'most') {
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
    const validRankMethods = [];
    for (let i = 1; i <= 12; i++) {
      validRankMethods.push(`rank${i}`);
    }
    const allValidMethods = [...validMethods, ...validRankMethods];
    if (!allValidMethods.includes(backtest_method)) {
      throw new Error(`无效的回测方法参数，必须是以下值之一：${allValidMethods.join(', ')}`);
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
        LIMIT ${limit + 3}  -- 多获取3期，用于回测比较
      `;
      historyData = await query(historySql);
    }
    
    console.log('历史数据查询完成，共获取', historyData.length, '条记录');
    
    if (!historyData || historyData.length < 4) {
      throw new Error('历史数据不足，无法进行回测');
    }
    
    // 回测数据结果数组
    const backtestResults = [];
    
    // 对每一期进行回测（跳过最新3期，因为没有下下下期数据）
    for (let i = 3; i < historyData.length; i++) {
      const currentDraw = historyData[i];  // 当前回测期
      const nextNextNextDraw = historyData[i - 3]; // 下下下期开奖结果（用于比较）
      
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
        // 后区只有2个号码，直接生成组合
        const ball1 = Math.min(backNumbers[0], backNumbers[1]);
        const ball2 = Math.max(backNumbers[0], backNumbers[1]);
        backCombinations.push(`${ball1}-${ball2}`);
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
      
      // 统计后区每个组合出现时下下下期的号码
      const backCombinationStats = {};
      backCombinations.forEach(combination => {
        backCombinationStats[combination] = {
          combination: combination,
          numberCounts: {} // 统计每个号码出现的次数
        };
      });
      
      // 遍历统计历史数据，查找组合出现的位置，并记录下下下期的号码
      for (let j = 3; j < statsHistoryData.length; j++) {
        const statsCurrentDraw = statsHistoryData[j];
        const statsNextNextNextDraw = statsHistoryData[j - 3];
        
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
        
        // 生成统计当前期后区的两球组合
        const statsCurrentBackCombinations = [];
        if (statsCurrentBackNumbers.length >= 2) {
          const ball1 = Math.min(statsCurrentBackNumbers[0], statsCurrentBackNumbers[1]);
          const ball2 = Math.max(statsCurrentBackNumbers[0], statsCurrentBackNumbers[1]);
          statsCurrentBackCombinations.push(`${ball1}-${ball2}`);
        }
        
        // 检查后区是否包含我们关心的组合
        statsCurrentBackCombinations.forEach(comb => {
          if (backCombinations.includes(comb)) {
            // 获取下下下期的后区号码
            let nextNumbers = [];
            try {
              if (Array.isArray(statsNextNextNextDraw.blue)) {
                nextNumbers = statsNextNextNextDraw.blue.map(num => typeof num === 'string' ? parseInt(num) : num);
              } else if (typeof statsNextNextNextDraw.blue === 'string') {
                nextNumbers = statsNextNextNextDraw.blue.match(/\d+/g)?.map(num => parseInt(num)) || [];
              }
            } catch (e) {
              console.error('解析统计下下下期后区号码失败:', e);
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
      
      // 解析下下下期的后区号码
      let nextNextNextBackNumbers = [];
      try {
        if (Array.isArray(nextNextNextDraw.blue)) {
          nextNextNextBackNumbers = nextNextNextDraw.blue.map(num => typeof num === 'string' ? parseInt(num) : num);
        } else if (typeof nextNextNextDraw.blue === 'string') {
          const numbers = nextNextNextDraw.blue.match(/\d+/g);
          if (numbers) {
            nextNextNextBackNumbers = numbers.map(num => parseInt(num));
          }
        }
      } catch (e) {
        console.error('解析下下下期后区号码失败:', e);
        continue;
      }
      
      // 计算后区正确买号和错误买号数量
      let backCorrectBuy = 0;
      let backWrongBuy = 0;
      
      recommendedBackBuyNumbers.forEach(buyNum => {
        if (nextNextNextBackNumbers.includes(buyNum)) {
          // 正确买号：推荐买号出现在下下下期开奖号中
          backCorrectBuy++;
        } else {
          // 错误买号：推荐买号没有出现在下下下期开奖号中
          backWrongBuy++;
        }
      });
      
      // 添加到回测结果
      backtestResults.push({
        currentIssue: currentDraw.issue, // 当前回测期号
        backBuyNumbers: recommendedBackBuyNumbers, // 后区推荐买号
        nextIssue: nextNextNextDraw.issue, // 下下下期开奖期号
        nextBackNumbers: nextNextNextBackNumbers, // 下下下期实际开奖后区
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
    
    console.log('回测完成，共处理', backtestResults.length, '期数据');
    return result;
  } catch (error) {
    console.error('后区买号回测出错:', error);
    console.error('错误堆栈:', error.stack);
    throw error;
  }
}

/**
 * 倒数3期两球组合后区买号回测接口
 * @route GET /huo_qu_dao_shu_3_qi_hou_mai_hao_hui_ce
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

    const result = await huo_qu_dao_shu_3_qi_hou_mai_hao_hui_ce(backtest_period, stats_period, backtest_method);
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || '服务器内部错误'
    });
  }
});

module.exports = router;