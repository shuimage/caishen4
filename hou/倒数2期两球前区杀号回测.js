// 参数说明:
// - period: 必需，查询周期，值可以是 "35", "50", "100", "200", "300", "500", "1000", "all"
// 接口功能: 回测统计范围内的推荐杀号，比较推荐杀号与实际开奖结果
// 返回每一期的回测数据，包括期号、推荐杀号、下下期开奖号、正确杀号和错误杀号数量

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
      if (combinationStats[comb] && combinationStats[comb].numberCounts[num] > 0) {
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
 * 获取倒数2期两球组合前区杀号回测数据
 * @param {string} backtest_period - 回测周期
 * @param {string} stats_period - 统计周期
 * @returns {Promise<Object>} 包含回测数据的结果
 */
async function getDaoShu2QiKillNumberBacktest(backtest_period, stats_period) {
  try {
    // 验证参数
    if (backtest_period !== 'all' && (isNaN(backtest_period) || parseInt(backtest_period) <= 0)) {
      throw new Error('无效的回测周期参数，必须是正整数或"all"');
    }
    if (stats_period !== 'all' && (isNaN(stats_period) || parseInt(stats_period) <= 0)) {
      throw new Error('无效的统计周期参数，必须是正整数或"all"');
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
    
    if (!historyData || historyData.length < 3) {
      throw new Error('历史数据不足，无法进行回测');
    }
    
    // 回测数据结果数组
    const backtestResults = [];
    
    // 对每一期进行回测（跳过最新两期，因为没有下下期数据）
    for (let i = 2; i < historyData.length; i++) {
      const currentDraw = historyData[i];  // 当前期（用于计算推荐杀号的期数）
      const nextDraw = historyData[i - 1]; // 下一期
      const nextNextDraw = historyData[i - 2]; // 下下期（用于比较的实际开奖期数）
      
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
      
      // 生成当前期前区号码的所有两球组合
      const frontCombinations = [];
      for (let j = 0; j < frontNumbers.length; j++) {
        for (let k = j + 1; k < frontNumbers.length; k++) {
          // 确保小球在前，大球在后，保持一致性
          const ball1 = Math.min(frontNumbers[j], frontNumbers[k]);
          const ball2 = Math.max(frontNumbers[j], frontNumbers[k]);
          frontCombinations.push(`${ball1}-${ball2}`);
        }
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
      
      // 统计前区每个组合出现时下一期的号码
      const frontCombinationStats = {};
      frontCombinations.forEach(combination => {
        frontCombinationStats[combination] = {
          combination: combination,
          numberCounts: {} // 统计每个号码出现的次数
        };
      });
      
      // 遍历统计历史数据，查找组合出现的位置，并记录下一期的号码
      for (let j = 1; j < statsHistoryData.length; j++) {
        const statsCurrentDraw = statsHistoryData[j];
        const statsNextDraw = statsHistoryData[j - 1];
        
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
        
        // 生成统计当前期前区的所有两球组合
        const statsCurrentFrontCombinations = [];
        for (let m = 0; m < statsCurrentFrontNumbers.length; m++) {
          for (let n = m + 1; n < statsCurrentFrontNumbers.length; n++) {
            const ball1 = Math.min(statsCurrentFrontNumbers[m], statsCurrentFrontNumbers[n]);
            const ball2 = Math.max(statsCurrentFrontNumbers[m], statsCurrentFrontNumbers[n]);
            statsCurrentFrontCombinations.push(`${ball1}-${ball2}`);
          }
        }
        
        // 检查前区是否包含我们关心的组合
        statsCurrentFrontCombinations.forEach(comb => {
          if (frontCombinations.includes(comb)) {
            // 获取下一期的前区号码
            let nextNumbers = [];
            try {
              if (Array.isArray(statsNextDraw.red)) {
                nextNumbers = statsNextDraw.red.map(num => typeof num === 'string' ? parseInt(num) : num);
              } else if (typeof statsNextDraw.red === 'string') {
                nextNumbers = statsNextDraw.red.match(/\d+/g)?.map(num => parseInt(num)) || [];
              }
            } catch (e) {
              console.error('解析统计下一期前区号码失败:', e);
              return;
            }
            
            // 更新号码计数
            nextNumbers.forEach(num => {
              frontCombinationStats[comb].numberCounts[num] = 
                (frontCombinationStats[comb].numberCounts[num] || 0) + 1;
            });
          }
        });
      }
      
      // 计算当前期的推荐杀号
      const recommendedFrontKillNumbers = calculateKillNumbers(frontCombinations, frontCombinationStats, 1, 35);
      
      // 解析下下期的前区号码
      let nextNextFrontNumbers = [];
      try {
        if (Array.isArray(nextNextDraw.red)) {
          nextNextFrontNumbers = nextNextDraw.red.map(num => typeof num === 'string' ? parseInt(num) : num);
        } else if (typeof nextNextDraw.red === 'string') {
          const numbers = nextNextDraw.red.match(/\d+/g);
          if (numbers) {
            nextNextFrontNumbers = numbers.map(num => parseInt(num));
          }
        }
      } catch (e) {
        console.error('解析下下期前区号码失败:', e);
        continue;
      }
      
      // 计算前区正确杀号和错误杀号数量
      let frontCorrectKill = 0;
      let frontWrongKill = 0;
      
      recommendedFrontKillNumbers.forEach(killNum => {
        if (!nextNextFrontNumbers.includes(killNum)) {
          // 正确杀号：推荐杀号没有出现在下下期开奖号中
          frontCorrectKill++;
        } else {
          // 错误杀号：推荐杀号出现在下下期开奖号中
          frontWrongKill++;
        }
      });
      
      // 添加到回测结果
      backtestResults.push({
        currentIssue: currentDraw.issue, // 当前回测期号
        frontKillNumbers: recommendedFrontKillNumbers, // 前区推荐杀号
        nextNextIssue: nextNextDraw.issue, // 下下期开奖期号
        nextNextFrontNumbers: nextNextFrontNumbers, // 下下期实际开奖前区
        frontCorrectKill: frontCorrectKill, // 前区正确杀号数量
        frontWrongKill: frontWrongKill // 前区错误杀号数量
      });
    }
    
    // 整理结果
    const result = {
      success: true,
      data: {
        backtest_period: backtest_period,
        stats_period: stats_period,
        backtestResults: backtestResults,
        totalPeriods: backtestResults.length
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
 * 倒数2期两球组合前区杀号回测接口
 * @route GET /dao_shu_2_qi_sha_hao_hui_ce
 * @group 数据分析 - 杀号回测相关接口
 * @param {string} backtest_period.query.required - 回测周期 (35, 50, 100, 200, 300, 500, 1000, all)
 * @param {string} stats_period.query.required - 统计周期 (35, 50, 100, 200, 300, 500, 1000, all)
 * @returns {object} 200 - 成功响应，包含回测数据
 * @returns {object} 400 - 参数错误
 * @returns {object} 500 - 服务器内部错误
 */
router.get('/', async (req, res) => {
  try {
    const { backtest_period, stats_period } = req.query;
    
    if (!backtest_period || !stats_period) {
      return res.status(400).json({
        success: false,
        message: '缺少必需参数：backtest_period 或 stats_period'
      });
    }

    const result = await getDaoShu2QiKillNumberBacktest(backtest_period, stats_period);
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || '服务器内部错误'
    });
  }
});

module.exports = router;