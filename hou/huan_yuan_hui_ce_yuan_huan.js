// 参数说明:
// - backtest_period: 回测期数
// - stats_period: 统计期数
// - backtest_method: 回测方法（most/least/average）
// 接口功能: 幻圆回测 - 圆环对称杀号法回测

const express = require('express');
const { query } = require('./数据库配置.js');

const router = express.Router();

/**
 * 获取幻圆回测圆环对称数据
 * @param {string} backtest_period - 回测周期
 * @param {string} stats_period - 统计周期
 * @param {string} backtest_method - 回测方法（most/least/average）
 * @returns {Promise<Object>} 包含回测数据的结果
 */
// 圆环平衡杀号法
function circleBalanceKill(lastDrawNumbers) {
  const killedNumbers = [];
  
  // 四同心圆数据（与前端保持一致，使用一位数格式避免八进制解析问题）
  const circles = [
    { name: '中心圆', numbers: [18, 17, 19, 16, 20, 15, 21, 14, 22] },
    { name: '第二圆', numbers: [13, 23, 12, 24, 11, 25, 10, 26] },
    { name: '第三圆', numbers: [9, 27, 8, 28, 7, 29, 6, 30] },
    { name: '第四圆', numbers: [5, 31, 4, 32, 3, 33, 2, 34, 1, 35] }
  ];
  
  // 统计每个圆环的分布数量
  const circleDistribution = circles.map(circle => {
    const distributionCount = circle.numbers.filter(num => lastDrawNumbers.includes(num)).length;
    return {
      name: circle.name,
      numbers: circle.numbers,
      distributionCount: distributionCount
    };
  });
  
  // 杀掉分布数量为0的冷环号码
  const coldCircles = circleDistribution.filter(circle => circle.distributionCount === 0);
  coldCircles.forEach(circle => {
    circle.numbers.forEach(num => {
      if (num !== 18) { // 保留中心号码18
        killedNumbers.push(num);
      }
    });
  });
  
  // 杀掉分布数量>3的热环非核心号码
  const hotCircles = circleDistribution.filter(circle => circle.distributionCount > 3);
  hotCircles.forEach(circle => {
    circle.numbers.forEach(num => {
      if (num !== 18 && !lastDrawNumbers.includes(num)) { // 保留中心号码18和开奖号
        killedNumbers.push(num);
      }
    });
  });
  
  // 优化：添加号码位置特性杀号（根据号码在圆环中的位置关系）
  // 1. 杀掉与当前期号码位置对称但未出现的号码
  const positionSymmetryKill = () => {
    // 计算每个号码的对称号码（中心对称）
    const symmetryMap = {};
    circles.forEach(circle => {
      const circleNumbers = circle.numbers;
      for (let i = 0; i < circleNumbers.length; i++) {
        const num = circleNumbers[i];
        const oppositeIndex = (i + circleNumbers.length / 2) % circleNumbers.length;
        symmetryMap[num] = circleNumbers[oppositeIndex];
      }
    });
    
    // 杀掉当前期号码的对称号码（排除中心号码18和已开奖号码）
    lastDrawNumbers.forEach(num => {
      const symmetryNum = symmetryMap[num];
      if (symmetryNum && symmetryNum !== 18 && !lastDrawNumbers.includes(symmetryNum)) {
        killedNumbers.push(symmetryNum);
      }
    });
  };
  
  // 2. 杀掉与中心号码18距离较远的号码
  const distanceFromCenterKill = () => {
    // 定义与中心号码18的距离
    const centerDistance = {
      18: 0,
      17: 1, 19: 1, 16: 2, 20: 2, 15: 3, 21: 3, 14: 4, 22: 4,
      13: 5, 23: 5, 12: 6, 24: 6, 11: 7, 25: 7, 10: 8, 26: 8,
      9: 9, 27: 9, 8: 10, 28: 10, 7: 11, 29: 11, 6: 12, 30: 12,
      5: 13, 31: 13, 4: 14, 32: 14, 3: 15, 33: 15, 2: 16, 34: 16, 1: 17, 35: 17
    };
    
    // 杀掉距离中心号码18超过10的号码（排除已开奖号码）
    circles.forEach(circle => {
      circle.numbers.forEach(num => {
        if (num !== 18 && !lastDrawNumbers.includes(num) && centerDistance[num] > 10) {
          killedNumbers.push(num);
        }
      });
    });
  };
  
  // 执行优化的杀号规则
  positionSymmetryKill();
  distanceFromCenterKill();
  
  return {
    killedNumbers: [...new Set(killedNumbers)].sort((a, b) => a - b),
    analysis: `共检查4个圆环，发现${coldCircles.length}个冷环，${hotCircles.length}个热环，杀掉${killedNumbers.length}个号码`
  };
}

async function getHuanYuanYuanHuanBacktest(backtest_period, stats_period, backtest_method) {
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
      
      // 应用圆环平衡杀号法生成推荐杀号
      const killResult = circleBalanceKill(currentFrontNumbers);
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
    console.error('获取幻圆回测圆环对称数据失败:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

// 定义获取幻圆回测圆环对称数据的路由
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
    
    const result = await getHuanYuanYuanHuanBacktest(backtest_period, stats_period, backtest_method);
    res.json(result);
  } catch (error) {
    console.error('处理幻圆回测圆环对称请求失败:', error);
    res.json({
      success: false,
      message: error.message
    });
  }
});

// 导出路由器
module.exports = router;