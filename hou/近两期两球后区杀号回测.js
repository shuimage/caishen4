// 参数说明:
// - backtest_period: 必需，回测周期，值可以是数字或 "all"
// - stats_period: 必需，统计周期，值可以是数字或 "all"
// 接口功能: 回测近两期两球组合生成的推荐杀号，比较推荐杀号与实际开奖结果
// 返回每一期的回测数据，包括期号、推荐杀号、下下期开奖号、正确杀号和错误杀号等

const express = require('express');
const { query } = require('./数据库配置.js');

const router = express.Router();

/**
 * 计算推荐杀号
 * @param {Array} combinations - 两球组合数组
 * @param {Object} combinationStats - 组合统计数据
 * @param {number} min - 最小号码
 * @param {number} max - 最大号码
 * @returns {Array} 推荐杀号数组
 */
function calculateKillNumbers(combinations, combinationStats, min, max) {
  const killNumbers = [];
  
  // 检查min到max的每个号码
  for (let num = min; num <= max; num++) {
    let isKillNumber = true;
    // 检查这个号码是否在所有组合的出现次数中都是0
    for (const comb of combinations) {
      const count = combinationStats[comb]?.numberCounts[num] || 0;
      if (count > 0) {
        isKillNumber = false;
        break;
      }
    }
    if (isKillNumber) {
      killNumbers.push(num);
    }
  }
  
  return killNumbers;
}

/**
 * 获取近两期两球组合后区杀号回测数据
 * @param {string} backtest_period - 回测周期
 * @param {string} stats_period - 统计周期
 * @returns {Promise<Object>} 包含回测数据的结果
 */
async function getJinLiangQiHouQuKillNumberBacktest(backtest_period, stats_period) {
  try {
    // 验证参数
    if (backtest_period === undefined || backtest_period === null || backtest_period === '') {
      backtest_period = '50'; // 默认值
    }
    if (backtest_period !== 'all') {
      const parsedBacktestPeriod = parseInt(backtest_period);
      if (isNaN(parsedBacktestPeriod) || parsedBacktestPeriod <= 0) {
        backtest_period = '50'; // 使用默认值
      }
    }

    if (stats_period === undefined || stats_period === null || stats_period === '') {
      stats_period = '100'; // 默认值
    }
    if (stats_period !== 'all') {
      const parsedStatsPeriod = parseInt(stats_period);
      if (isNaN(parsedStatsPeriod) || parsedStatsPeriod <= 0) {
        stats_period = '100'; // 使用默认值
      }
    }

    // 获取所有历史数据
    console.log('开始查询历史数据...');
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
        LIMIT ${limit}
      `;
      historyData = await query(historySql);
    }
    
    console.log('历史数据查询完成，共获取', historyData.length, '条记录');
    
    if (!historyData || historyData.length < 4) {
      throw new Error('历史数据不足，无法进行回测');
    }
    
    // 回测数据结果数组
    const backtestResults = [];
    
    // 对每一期进行回测（跳过最新两期，因为没有下下期数据）
    for (let i = 3; i < historyData.length; i++) {
      const basePeriod1 = historyData[i - 1]; // 第N-1期
      const basePeriod2 = historyData[i - 2]; // 第N-2期（当前回测期）
      const nextDraw = historyData[i - 3]; // 第N-3期（用于比较的实际开奖期数）
      
      // 解析近两期的后区号码
      let basePeriod1BackNumbers = [];
      let basePeriod2BackNumbers = [];
      
      try {
        // 解析第N-1期后区号码
        if (Array.isArray(basePeriod1.blue)) {
          basePeriod1BackNumbers = basePeriod1.blue.map(num => typeof num === 'string' ? parseInt(num) : num);
        } else if (typeof basePeriod1.blue === 'string') {
          const numbers = basePeriod1.blue.match(/\d+/g);
          if (numbers) {
            basePeriod1BackNumbers = numbers.map(num => parseInt(num));
          }
        }
        
        // 解析第N-2期后区号码
        if (Array.isArray(basePeriod2.blue)) {
          basePeriod2BackNumbers = basePeriod2.blue.map(num => typeof num === 'string' ? parseInt(num) : num);
        } else if (typeof basePeriod2.blue === 'string') {
          const numbers = basePeriod2.blue.match(/\d+/g);
          if (numbers) {
            basePeriod2BackNumbers = numbers.map(num => parseInt(num));
          }
        }
      } catch (e) {
        console.error('解析近两期后区号码失败:', e);
        continue;
      }
      
      // 生成近两期后区号码的所有两球组合
      const backCombinations = [];
      
      // 生成第N-1期的两球组合
      for (let j = 0; j < basePeriod1BackNumbers.length; j++) {
        for (let k = j + 1; k < basePeriod1BackNumbers.length; k++) {
          // 确保小球在前，大球在后，保持一致性
          const ball1 = Math.min(basePeriod1BackNumbers[j], basePeriod1BackNumbers[k]);
          const ball2 = Math.max(basePeriod1BackNumbers[j], basePeriod1BackNumbers[k]);
          backCombinations.push(`${ball1}-${ball2}`);
        }
      }
      
      // 生成第N-2期的两球组合
      for (let j = 0; j < basePeriod2BackNumbers.length; j++) {
        for (let k = j + 1; k < basePeriod2BackNumbers.length; k++) {
          // 确保小球在前，大球在后，保持一致性
          const ball1 = Math.min(basePeriod2BackNumbers[j], basePeriod2BackNumbers[k]);
          const ball2 = Math.max(basePeriod2BackNumbers[j], basePeriod2BackNumbers[k]);
          backCombinations.push(`${ball1}-${ball2}`);
        }
      }
      
      // 去重组合
      const uniqueBackCombinations = [...new Set(backCombinations)];
      
      // 获取用于统计的历史数据（当前回测期之前的历史数据）
      let statsHistorySql;
      if (stats_period === 'all') {
        statsHistorySql = `
          SELECT * 
          FROM lottery_results 
          WHERE issue < '${basePeriod2.issue}' 
          ORDER BY issue DESC 
        `;
      } else {
        const parsedStatsPeriod = parseInt(stats_period);
        statsHistorySql = `
          SELECT * 
          FROM lottery_results 
          WHERE issue < '${basePeriod2.issue}' 
          ORDER BY issue DESC 
          LIMIT ${parsedStatsPeriod}
        `;
      }
      const statsHistoryData = await query(statsHistorySql);
      
      // 统计后区每个组合出现时下一期的号码
      const backCombinationStats = {};
      uniqueBackCombinations.forEach(combination => {
        backCombinationStats[combination] = {
          combination: combination,
          numberCounts: {} // 统计每个号码出现的次数
        };
      });
      
      // 遍历统计历史数据，查找组合出现的位置，并记录下一期的号码
      if (statsHistoryData.length >= 2) {
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
        for (let m = 0; m < statsCurrentBackNumbers.length; m++) {
          for (let n = m + 1; n < statsCurrentBackNumbers.length; n++) {
            const ball1 = Math.min(statsCurrentBackNumbers[m], statsCurrentBackNumbers[n]);
            const ball2 = Math.max(statsCurrentBackNumbers[m], statsCurrentBackNumbers[n]);
            statsCurrentBackCombinations.push(`${ball1}-${ball2}`);
          }
        }
        
        // 检查后区是否包含我们关心的组合
        statsCurrentBackCombinations.forEach(comb => {
          if (uniqueBackCombinations.includes(comb)) {
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
    }
      
      // 计算当前期的推荐杀号
      const recommendedBackKillNumbers = calculateKillNumbers(uniqueBackCombinations, backCombinationStats, 1, 12);
      
      // 解析下一期的后区号码
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
        console.error('解析下一期后区号码失败:', e);
        continue;
      }
      
      // 计算后区正确杀号和错误杀号
      const correctKills = [];
      const wrongKills = [];
      const killResults = [];
      
      recommendedBackKillNumbers.forEach(killNum => {
        if (!nextBackNumbers.includes(killNum)) {
          // 正确杀号：推荐杀号没有出现在下一期开奖号中
          correctKills.push(killNum);
          killResults.push({ number: killNum, isCorrect: true });
        } else {
          // 错误杀号：推荐杀号出现在下一期开奖号中
          wrongKills.push(killNum);
          killResults.push({ number: killNum, isCorrect: false });
        }
      });
      
      // 判断是否成功杀号（无错误杀号即为成功）
      const isSuccess = wrongKills.length === 0;
      
      // 添加到回测结果
      backtestResults.push({
        basePeriod1: basePeriod1.issue, // 第N-1期期号
        basePeriod2: basePeriod2.issue, // 第N-2期期号
        recommendedKills: recommendedBackKillNumbers, // 后区推荐杀号
        nextPeriod: nextDraw.issue, // 下一期开奖期号
        nextDrawNumbers: nextBackNumbers, // 下一期实际开奖后区
        killResults: killResults, // 杀号结果详情
        correctKills: correctKills, // 后区正确杀号
        wrongKills: wrongKills, // 后区错误杀号
        isSuccess: isSuccess // 是否成功杀号
      });
    }
    
    // 计算统计数据
    const totalPeriods = backtestResults.length;
    const correctPeriods = backtestResults.filter(result => result.isSuccess).length;
    const accuracy = totalPeriods > 0 ? (correctPeriods / totalPeriods) * 100 : 0;
    const totalKillNumbers = backtestResults.reduce((sum, result) => sum + result.recommendedKills.length, 0);
    const averageKillNumbersPerPeriod = totalPeriods > 0 ? totalKillNumbers / totalPeriods : 0;
    const totalCorrectKills = backtestResults.reduce((sum, result) => sum + result.correctKills.length, 0);
    
    // 整理结果
    const result = {
      success: true,
      data: {
        backtest_period: backtest_period,
        stats_period: stats_period,
        totalPeriods: totalPeriods,
        correctPeriods: correctPeriods,
        accuracy: accuracy,
        averageKillNumbersPerPeriod: averageKillNumbersPerPeriod,
        totalCorrectKills: totalCorrectKills,
        results: backtestResults
      }
    };
    
    console.log('回测完成，共处理', backtestResults.length, '期数据');
    return result;
  } catch (error) {
    console.error('杀号回测出错:', error);
    console.error('错误堆栈:', error.stack);
    throw error;
  }
}

/**
 * 近两期两球组合后区杀号回测接口
 * @route POST /jin_liang_qi_hou_qu_sha_hao_hui_ce
 * @group 数据分析 - 杀号回测相关接口
 * @param {string} backtest_period.body.required - 回测周期 (数字或 "all")
 * @param {string} stats_period.body.required - 统计周期 (数字或 "all")
 * @returns {object} 200 - 成功响应，包含回测数据
 * @returns {object} 400 - 参数错误
 * @returns {object} 500 - 服务器内部错误
 */
router.post('/', async (req, res) => {
  try {
    const { backtest_period, stats_range } = req.body;
    
    if (backtest_period === undefined || stats_range === undefined) {
      return res.status(400).json({
        success: false,
        message: '缺少必需参数：backtest_period 或 stats_range'
      });
    }

    const result = await getJinLiangQiHouQuKillNumberBacktest(backtest_period, stats_range);
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || '服务器内部错误'
    });
  }
});

module.exports = router;