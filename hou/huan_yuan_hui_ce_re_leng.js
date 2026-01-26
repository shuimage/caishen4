// 参数说明:
// - backtest_period: 回测期数
// - stats_period: 统计期数
// - backtest_method: 回测方法（most/least/average）
// 接口功能: 幻圆回测 - 冷热对称杀号法回测

const express = require('express');
const { query } = require('./数据库配置.js');

const router = express.Router();

/**
 * 获取幻圆回测冷热对称数据
 * @param {string} backtest_period - 回测周期
 * @param {string} stats_period - 统计周期
 * @param {string} backtest_method - 回测方法（most/least/average）
 * @returns {Promise<Object>} 包含回测数据的结果
 */
// 冷热关联杀号法
function hotColdRelationKill(lastDrawNumbers) {
  const killedNumbers = [];
  
  // 模拟号码冷热状态数据（实际应从API获取）
  const mockHotColdStatus = {
    // 格式：号码: { status: 'hot'|'warm'|'cold', neighbors: [相邻号码数组] }
    1: { status: 'cold', neighbors: [2, 3, 4] },
    2: { status: 'warm', neighbors: [1, 3, 5] },
    3: { status: 'warm', neighbors: [1, 2, 4, 6] },
    4: { status: 'warm', neighbors: [2, 3, 5, 7] },
    5: { status: 'cold', neighbors: [2, 4, 6, 8] },
    6: { status: 'cold', neighbors: [3, 5, 7, 9] },
    7: { status: 'cold', neighbors: [4, 6, 8, 10] },
    8: { status: 'cold', neighbors: [5, 7, 9, 11] },
    9: { status: 'cold', neighbors: [6, 8, 10, 12] },
    10: { status: 'hot', neighbors: [7, 9, 11, 13] },
    11: { status: 'hot', neighbors: [8, 10, 12, 14] },
    12: { status: 'cold', neighbors: [9, 11, 13, 15] },
    13: { status: 'hot', neighbors: [10, 12, 14, 16] },
    14: { status: 'warm', neighbors: [11, 13, 15, 17] },
    15: { status: 'warm', neighbors: [12, 14, 16, 18] },
    16: { status: 'warm', neighbors: [13, 15, 17, 19] },
    17: { status: 'warm', neighbors: [14, 16, 18, 20] },
    18: { status: 'warm', neighbors: [15, 17, 19, 21] },
    19: { status: 'warm', neighbors: [16, 18, 20, 22] },
    20: { status: 'hot', neighbors: [17, 19, 21, 23] },
    21: { status: 'warm', neighbors: [18, 20, 22, 24] },
    22: { status: 'warm', neighbors: [19, 21, 23, 25] },
    23: { status: 'warm', neighbors: [20, 22, 24, 26] },
    24: { status: 'warm', neighbors: [21, 23, 25, 27] },
    25: { status: 'cold', neighbors: [22, 24, 26, 28] },
    26: { status: 'warm', neighbors: [23, 25, 27, 29] },
    27: { status: 'warm', neighbors: [24, 26, 28, 30] },
    28: { status: 'warm', neighbors: [25, 27, 29, 31] },
    29: { status: 'warm', neighbors: [26, 28, 30, 32] },
    30: { status: 'warm', neighbors: [27, 29, 31, 33] },
    31: { status: 'cold', neighbors: [28, 30, 32, 34] },
    32: { status: 'cold', neighbors: [29, 31, 33, 35] },
    33: { status: 'warm', neighbors: [30, 32, 34] },
    34: { status: 'cold', neighbors: [31, 33, 35] },
    35: { status: 'warm', neighbors: [32, 34] }
  };
  
  // 标记热号区和冷号区
  const hotNumbers = [];
  const coldNumbers = [];
  
  for (let num = 1; num <= 35; num++) {
    if (mockHotColdStatus[num].status === 'hot') {
      hotNumbers.push(num);
    } else if (mockHotColdStatus[num].status === 'cold') {
      coldNumbers.push(num);
    }
  }
  
  // 杀掉冷号区及其相邻的3个号码
  coldNumbers.forEach(coldNum => {
    // 杀掉冷号本身
    killedNumbers.push(coldNum);
    
    // 杀掉相邻的3个号码
    const neighbors = mockHotColdStatus[coldNum].neighbors;
    neighbors.forEach(neighbor => {
      killedNumbers.push(neighbor);
    });
  });
  
  // 去重
  const uniqueKilledNumbers = [...new Set(killedNumbers)];
  
  return {
    killedNumbers: uniqueKilledNumbers,
    analysis: `共识别${hotNumbers.length}个热号，${coldNumbers.length}个冷号，杀掉冷号及其相邻号码共${uniqueKilledNumbers.length}个`
  };
}

async function getHuanYuanReLengBacktest(backtest_period, stats_period, backtest_method) {
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
    
    if (!historyData || historyData.length < 2) {
      throw new Error('历史数据不足，无法进行回测');
    }
    
    // 回测数据结果数组
    const backtestResults = [];
    
    // 对每一期进行回测（跳过最新一期，因为没有下一期数据）
    for (let i = 1; i < historyData.length; i++) {
      const currentDraw = historyData[i];  // 当前期（用于计算推荐杀号的期数）
      const nextDraw = historyData[i - 1]; // 下一期（用于比较的实际开奖期数）
      
      // 解析当前期和下一期的号码
      let currentFrontNumbers = [];
      let nextFrontNumbers = [];
      let nextBackNumbers = [];
      
      try {
        // 解析当前期前区号码
        if (Array.isArray(currentDraw.red)) {
          currentFrontNumbers = currentDraw.red.map(num => typeof num === 'string' ? parseInt(num) : num);
        } else if (typeof currentDraw.red === 'string') {
          currentFrontNumbers = currentDraw.red.match(/\d+/g)?.map(num => parseInt(num)) || [];
        }
        
        // 解析下一期前区号码
        if (Array.isArray(nextDraw.red)) {
          nextFrontNumbers = nextDraw.red.map(num => typeof num === 'string' ? parseInt(num) : num);
        } else if (typeof nextDraw.red === 'string') {
          nextFrontNumbers = nextDraw.red.match(/\d+/g)?.map(num => parseInt(num)) || [];
        }
        
        // 解析下一期后区号码
        if (Array.isArray(nextDraw.blue)) {
          nextBackNumbers = nextDraw.blue.map(num => typeof num === 'string' ? parseInt(num) : num);
        } else if (typeof nextDraw.blue === 'string') {
          nextBackNumbers = nextDraw.blue.match(/\d+/g)?.map(num => parseInt(num)) || [];
        }
      } catch (error) {
        console.error('解析号码失败:', error);
        continue;
      }
      
      // 生成推荐买号（这里使用简单的模拟逻辑，实际应该根据幻圆算法计算）
      const backBuyNumbers = [];
      
      // 应用冷热关联杀号法生成推荐杀号
      const killResult = hotColdRelationKill(currentFrontNumbers);
      const recommendedKillNumbers = killResult.killedNumbers;
      
      // 计算正确杀号数和错误杀号数
      const frontCorrectKill = recommendedKillNumbers.filter(num => !nextFrontNumbers.includes(num)).length;
      const frontWrongKill = recommendedKillNumbers.filter(num => nextFrontNumbers.includes(num)).length;
      
      // 生成回测结果
      const backtestResult = {
        period: currentDraw.issue,
        nextPeriod: nextDraw.issue,
        frontNumbers: currentFrontNumbers,
        nextFrontNumbers: nextFrontNumbers,
        nextBackNumbers: nextBackNumbers,
        recommendedKillNumbers: recommendedKillNumbers, // 推荐杀号
        backBuyNumbers: backBuyNumbers,
        frontCorrectKill: frontCorrectKill,
        frontWrongKill: frontWrongKill,
        backCorrectBuy: 0,
        backWrongBuy: 0
      };
      
      backtestResults.push(backtestResult);
    }
    
    return {
      success: true,
      data: {
        backtestResults: backtestResults,
        backtestMethod: backtest_method,
        backtestPeriod: backtest_period,
        statsPeriod: stats_period
      }
    };
  } catch (error) {
    console.error('获取幻圆回测冷热对称数据失败:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

// 定义获取幻圆回测冷热对称数据的路由
router.get('/', async (req, res) => {
  try {
    const { backtest_period, stats_period, backtest_method } = req.query;
    
    // 验证参数
    if (!backtest_period || !stats_period || !backtest_method) {
      return res.json({
        success: false,
        message: '缺少必要参数'
      });
    }
    
    const result = await getHuanYuanReLengBacktest(backtest_period, stats_period, backtest_method);
    res.json(result);
  } catch (error) {
    console.error('处理幻圆回测冷热对称请求失败:', error);
    res.json({
      success: false,
      message: error.message
    });
  }
});

// 导出路由器
module.exports = router;