// 参数说明:
// - backtest_period: 回测期数
// - stats_period: 统计期数
// - backtest_method: 回测方法（most/least/average）
// 接口功能: 幻圆回测 - 镜像对称杀号法回测

const express = require('express');
const { query } = require('./数据库配置.js');

const router = express.Router();

/**
 * 获取幻圆回测镜像对称数据
 * @param {string} backtest_period - 回测周期
 * @param {string} stats_period - 统计周期
 * @param {string} backtest_method - 回测方法（most/least/average）
 * @returns {Promise<Object>} 包含回测数据的结果
 */
async function getHuanYuanJingXiangBacktest(backtest_period, stats_period, backtest_method) {
  try {
    // 验证参数
    if (backtest_period !== 'all' && (isNaN(backtest_period) || parseInt(backtest_period) <= 0)) {
      throw new Error('无效的回测周期参数，必须是正整数或"all"');
    }
    // stats_period不再需要，使用默认值100
    stats_period = '100';

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
      
      // 镜像对称杀号算法
      const recommendedKillNumbers = [];
      
      // 计算每个号码的冷热数据（遗漏期数和连续出现期数）
      const calculateHotColdData = (number, historyData) => {
        let consecutive = 0;
        let missing = 0;
        let found = false;
        
        // 计算连续出现期数
        for (let j = 0; j < historyData.length; j++) {
          const draw = historyData[j];
          let drawNumbers = [];
          
          if (Array.isArray(draw.red)) {
            drawNumbers = draw.red.map(num => typeof num === 'string' ? parseInt(num) : num);
          } else if (typeof draw.red === 'string') {
            drawNumbers = draw.red.match(/\d+/g)?.map(num => parseInt(num)) || [];
          }
          
          if (drawNumbers.includes(number)) {
            consecutive++;
          } else {
            break;
          }
        }
        
        // 计算遗漏期数
        for (let j = 0; j < historyData.length; j++) {
          const draw = historyData[j];
          let drawNumbers = [];
          
          if (Array.isArray(draw.red)) {
            drawNumbers = draw.red.map(num => typeof num === 'string' ? parseInt(num) : num);
          } else if (typeof draw.red === 'string') {
            drawNumbers = draw.red.match(/\d+/g)?.map(num => parseInt(num)) || [];
          }
          
          if (drawNumbers.includes(number)) {
            found = true;
            break;
          }
          missing++;
        }
        
        return { consecutive, missing: found ? missing : 999 };
      };
      
      // 应用镜像对称杀号法
      currentFrontNumbers.forEach(num => {
        // 计算镜像号
        const mirror = 36 - num;
        
        // 获取冷热数据
        const hotColdInfo = calculateHotColdData(mirror, historyData.slice(i));
        
        // 确定是否杀号
        if (hotColdInfo.missing > 15 || hotColdInfo.consecutive >= 3) {
          recommendedKillNumbers.push(mirror);
        }
      });
      
      // 生成推荐买号
      const backBuyNumbers = [];
      
      // 计算正确杀号数和错误杀号数
      const frontCorrectKill = recommendedKillNumbers.filter(num => !nextFrontNumbers.includes(num)).length;
      const frontWrongKill = recommendedKillNumbers.filter(num => nextFrontNumbers.includes(num)).length;
      
      // 回测结果
      const backtestResult = {
        period: currentDraw.issue,
        nextPeriod: nextDraw.issue,
        frontNumbers: currentFrontNumbers,
        nextFrontNumbers: nextFrontNumbers,
        nextBackNumbers: nextBackNumbers,
        recommendedKillNumbers: [...new Set(recommendedKillNumbers)], // 推荐杀号，去重
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
    console.error('获取幻圆回测镜像对称数据失败:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

// 定义获取幻圆回测镜像对称数据的路由
router.get('/', async (req, res) => {
  try {
    // 直接使用默认值，不再进行参数验证
    const backtest_period = req.query.backtest_period || '100';
    const backtest_method = req.query.backtest_method || 'most';
    
    const result = await getHuanYuanJingXiangBacktest(backtest_period, '100', backtest_method);
    res.json(result);
  } catch (error) {
    console.error('处理幻圆回测镜像对称请求失败:', error);
    res.json({
      success: false,
      message: error.message
    });
  }
});

// 导出路由器
module.exports = router;