// 近两期两球组合前区路由器 - 作为模块导出，用于主服务器注册
const express = require('express');
const { query } = require('./数据库配置.js');

const router = express.Router();

// 处理球号数据
function processBalls(balls) {
  if (!balls) return [];
  if (typeof balls === 'string') {
    const numbers = balls.match(/\d+/g);
    if (numbers) {
      return numbers.map(num => parseInt(num));
    }
  } else if (Array.isArray(balls)) {
    return balls.map(num => typeof num === 'string' ? parseInt(num) : num);
  }
  return [];
}

// 检查球号是否在开奖号码中
function checkBallInDraw(drawNumbers, ball) {
  return drawNumbers.includes(ball);
}

// 接口：获取近两期前区两球组合统计数据
router.post('/', async (req, res) => {
  try {
    // 获取请求参数
    const { stats_range = 100 } = req.body;
    
    console.log('收到近两期前区两球组合统计请求，请求参数:', { stats_range });
    
    // 获取近两期的开奖数据
    const latestDrawsSql = `
      SELECT * 
      FROM lottery_results 
      ORDER BY issue DESC 
      LIMIT 2
    `;
    
    const latestDraws = await query(latestDrawsSql);
    
    if (!latestDraws || latestDraws.length < 2) {
      return res.json({
        success: false,
        message: '未找到足够的近两期开奖数据'
      });
    }
    
    console.log('获取到近两期开奖数据:', latestDraws.map(draw => draw.issue));
    
    // 分别获取两期的前区号码
    const frontNumbers1 = processBalls(latestDraws[0].red); // 第1期（最新一期）
    const frontNumbers2 = processBalls(latestDraws[1].red); // 第2期
    
    console.log('第1期前区号码:', frontNumbers1);
    console.log('第2期前区号码:', frontNumbers2);
    
    // 只生成两期间的组合，第2期的号在前，第1期的号在后
    const combinations = [];
    for (const num2 of frontNumbers2) {
      for (const num1 of frontNumbers1) {
        combinations.push([num2, num1]);
      }
    }
    
    console.log('生成的两期间组合数量:', combinations.length);
    
    // 查询历史数据，获取统计期范围内的所有开奖记录
    let historySql = `
      SELECT id, issue, red 
      FROM lottery_results 
      ORDER BY issue DESC
    `;
    
    // 如果不是全部期，添加LIMIT子句
    if (stats_range !== 'all') {
      const limit = parseInt(stats_range, 10);
      if (!isNaN(limit) && limit > 0) {
        historySql += ` LIMIT ${limit + 3}`; // 多取3条，确保能统计到最后一期
      }
    }
    
    const historyResults = await query(historySql);
    console.log('获取到历史数据条数:', historyResults.length);
    
    // 处理历史数据，确保red字段是数组
    const processedHistory = historyResults.map(result => ({
      ...result,
      red: processBalls(result.red)
    }));
    
    // 统计每个组合的出现次数和下一期球号出现次数
    const combinationStats = [];
    
    for (const combo of combinations) {
      const comboStr = `${combo[0]}-${combo[1]}`;
      const ball1 = combo[0]; // 第2期的球号
      const ball2 = combo[1]; // 第1期的球号
      
      // 统计变量
      let matchCount = 0; // 组合出现次数
      const nextBallsCount = {}; // 下一期球号出现次数
      
      // 遍历历史数据，查找连续两期
      // processedHistory已经按issue降序排列
      for (let i = 0; i < processedHistory.length - 2; i++) {
        const currentDraw = processedHistory[i];     // 当前期（第1期）
        const nextDraw = processedHistory[i + 1];    // 下一期（第2期）
        const nextNextDraw = processedHistory[i + 2]; // 下下期（第3期）
        
        // 检查是否存在连续两期：
        // 下一期（第2期）出现ball1
        // 当前期（第1期）出现ball2
        // 注意：由于数据是按issue降序排列的，所以：
        // i: 当前期，issue较大
        // i+1: 下一期，issue较小
        
        if (checkBallInDraw(nextDraw.red, ball1) && checkBallInDraw(currentDraw.red, ball2)) {
          // 找到连续两期，统计下下期（第3期）的球号
          matchCount++;
          
          if (nextNextDraw) {
            nextNextDraw.red.forEach(ball => {
              nextBallsCount[ball] = (nextBallsCount[ball] || 0) + 1;
            });
          }
        }
      }
      
      console.log(`组合 ${comboStr} 出现次数: ${matchCount}`);
      
      // 找出出现最多的5个球号
      const topBalls = Object.entries(nextBallsCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(entry => entry[0]);
      
      // 创建numberCounts对象，包含1-35的键值对
      const numberCounts = {};
      for (let i = 1; i <= 35; i++) {
        numberCounts[i] = nextBallsCount[i] || 0;
      }
      
      combinationStats.push({
        combination: comboStr,
        count: matchCount,
        topBalls: topBalls,
        numberCounts: numberCounts,
        nextDrawNumbers: [] // 不需要返回详细记录
      });
    }
    
    // 按出现次数降序排序
    combinationStats.sort((a, b) => b.count - a.count);
    
    console.log('统计结果:', combinationStats);
    
    // 返回成功结果
    res.json({
      success: true,
      data: combinationStats
    });
  } catch (error) {
    console.error('处理请求时发生错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

// 健康检查接口
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: '近两期两球组合前区服务运行正常'
  });
});

// 全局错误处理中间件
router.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
});

// 导出router以便在主服务器中使用
module.exports = router;
