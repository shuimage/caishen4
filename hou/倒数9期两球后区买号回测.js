const express = require('express');
const router = express.Router();
const { pool } = require('./数据库配置.js');

// 从查询参数中解析统计期数
function parsePeriod(period) {
  if (period === 'all') {
    return 10000; // 使用一个较大的数值代表全部期
  }
  const num = parseInt(period);
  return isNaN(num) ? 100 : num;
}

// 解析回测方法，支持rank1-rank12和most/least/average
function parseBacktestMethod(method) {
  if (method.startsWith('rank')) {
    const rank = parseInt(method.substring(4));
    return isNaN(rank) || rank < 1 || rank > 12 ? 1 : rank;
  }
  return 1; // 默认使用rank1
}

// 计算后区号码的推荐买号
function calculateBackRecommendations(last9Periods) {
  const numberCounts = {};
  
  // 统计每个号码在9期内的出现次数
  last9Periods.forEach(item => {
    item.lastZoneNumbers.forEach(num => {
      numberCounts[num] = (numberCounts[num] || 0) + 1;
    });
  });
  
  // 转换为数组并按出现次数排序
  const sortedNumbers = Object.entries(numberCounts)
    .map(([num, count]) => ({ num, count }))
    .sort((a, b) => b.count - a.count);
  
  // 提取推荐买号（最多12个）
  const recommendedNumbers = sortedNumbers.slice(0, 12).map(item => item.num);
  
  return recommendedNumbers;
}

// 主接口路由
router.get('/', async (req, res) => {
  try {
    const { backtest_period = '100', stats_period = '100', backtest_method = 'rank1' } = req.query;
    
    // 解析参数
    const backtestPeriod = parsePeriod(backtest_period);
    const backtestMethod = parseBacktestMethod(backtest_method);
    
    // 获取历史数据
    const [allResults] = await pool.execute(
      `SELECT issue, blue FROM lottery_results 
       ORDER BY issue DESC`
    );
    
    const results = allResults.map(row => {
      let lastZoneNumbers = [];
      if (row.blue) {
        // 移除方括号并清理号码
        let cleanBlue = row.blue.replace(/\[|\]/g, '').trim();
        if (cleanBlue) {
          lastZoneNumbers = cleanBlue.split(',').map(num => num.trim()).filter(num => num);
        }
      }
      return {
        period: row.issue,
        lastZoneNumbers
      };
    });
    
    const backtestResults = [];
    
    // 执行回测
    for (let i = 9; i < results.length; i += 1) {
      if (backtestResults.length >= backtestPeriod) {
        break; // 达到回测期数限制
      }
      
      const currentResult = results[i];
      
      // 获取当前期之前的9期数据用于分析
      const last9Periods = results.slice(i + 1, i + 1 + 9);
      
      if (last9Periods.length < 9) {
        break; // 数据不足
      }
      
      // 计算推荐买号
      const recommendedNumbers = calculateBackRecommendations(last9Periods);
      
      // 获取回测方法指定的买号
      let selectedBuyNumber;
      if (backtestMethod >= 1 && backtestMethod <= recommendedNumbers.length) {
        selectedBuyNumber = recommendedNumbers[backtestMethod - 1];
      } else {
        selectedBuyNumber = recommendedNumbers[0]; // 默认选择第一个
      }
      
      // 获取下下下下下下下下下期的开奖数据（索引为 i - 9）
      const next8thIndex = i - 9;
      if (next8thIndex < 0) {
        continue; // 没有足够的历史数据
      }
      
      const next8thPeriod = results[next8thIndex];
      
      // 计算正确买号数和错误买号数
      const backCorrectBuy = next8thPeriod.lastZoneNumbers.includes(selectedBuyNumber) ? 1 : 0;
      const backWrongBuy = backCorrectBuy === 1 ? 0 : 1;
      
      // 添加到回测结果
      backtestResults.push({
        currentIssue: currentResult.period,
        backBuyNumbers: selectedBuyNumber,
        nextNextNextNextNextNextNextNextIssue: next8thPeriod.period,
        nextNextNextNextNextNextNextNextBackNumbers: next8thPeriod.lastZoneNumbers,
        backCorrectBuy,
        backWrongBuy
      });
    }
    
    // 计算统计数据
    const totalPeriods = backtestResults.length;
    const successCount = backtestResults.filter(result => result.backCorrectBuy > 0).length;
    const averageCorrectRate = totalPeriods > 0 ? (successCount / totalPeriods * 100).toFixed(2) : 0;
    
    res.json({
      success: true,
      data: {
        backtestResults,
        totalPeriods,
        successCount,
        averageCorrectRate: parseFloat(averageCorrectRate)
      },
      message: '获取倒数9期后区买号回测数据成功'
    });
  } catch (error) {
    console.error('接口错误:', error);
    res.json({
      success: false,
      message: '接口失败'
    });
  }
});

module.exports = router;
