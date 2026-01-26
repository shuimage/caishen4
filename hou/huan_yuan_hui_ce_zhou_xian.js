// 参数说明:
// - backtest_period: 回测期数
// - stats_period: 统计期数
// - backtest_method: 回测方法（most/least/average）
// 接口功能: 幻圆回测 - 轴线对称杀号法回测

const express = require('express');
const { query } = require('./数据库配置.js');

const router = express.Router();

/**
 * 获取幻圆回测轴线对称数据
 * @param {string} backtest_period - 回测周期
 * @param {string} stats_period - 统计周期
 * @param {string} backtest_method - 回测方法（most/least/average）
 * @returns {Promise<Object>} 包含回测数据的结果
 */
// 轴线覆盖杀号法
function axisCoverageKill(lastDrawNumbers) {
  const killedNumbers = [];
  
  // 四轴线数据
  const axes = [
    { name: '横轴', numbers: [2, 14, 18, 22, 30] },
    { name: '纵轴', numbers: [4, 16, 18, 20, 28] },
    { name: '左斜轴', numbers: [6, 17, 18, 19, 26] },
    { name: '右斜轴', numbers: [8, 15, 18, 21, 24] }
  ];
  
  // 统计每条轴线的覆盖密度
  const axisCoverage = axes.map(axis => {
    const coverageCount = axis.numbers.filter(num => lastDrawNumbers.includes(num)).length;
    return {
      name: axis.name,
      numbers: axis.numbers,
      coverageCount: coverageCount,
      density: coverageCount / axis.numbers.length
    };
  });
  
  // 杀掉覆盖密度为0的冷轴号码
  const coldAxes = axisCoverage.filter(axis => axis.coverageCount === 0);
  coldAxes.forEach(axis => {
    axis.numbers.forEach(num => {
      if (num !== 18) { // 保留中心号码18
        killedNumbers.push(num);
      }
    });
  });
  
  // 杀掉覆盖密度>3的热轴非核心号码
  const hotAxes = axisCoverage.filter(axis => axis.coverageCount > 3);
  hotAxes.forEach(axis => {
    axis.numbers.forEach(num => {
      if (num !== 18 && !lastDrawNumbers.includes(num)) { // 保留中心号码18和开奖号
        killedNumbers.push(num);
      }
    });
  });
  
  return {
    killedNumbers: [...new Set(killedNumbers)],
    analysis: `共检查4条轴线，发现${coldAxes.length}条冷轴，${hotAxes.length}条热轴，杀掉${killedNumbers.length}个号码`
  };
}

async function getHuanYuanZhouXianBacktest(backtest_period, stats_period, backtest_method) {
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
      
      // 应用轴线覆盖杀号法生成推荐杀号
      const killResult = axisCoverageKill(currentFrontNumbers);
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
    console.error('获取幻圆回测轴线对称数据失败:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

// 定义获取幻圆回测轴线对称数据的路由
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
    
    const result = await getHuanYuanZhouXianBacktest(backtest_period, stats_period, backtest_method);
    res.json(result);
  } catch (error) {
    console.error('处理幻圆回测轴线对称请求失败:', error);
    res.json({
      success: false,
      message: error.message
    });
  }
});

// 导出路由器
module.exports = router;