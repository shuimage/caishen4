// 参数说明:
// - backtest_period: 回测期数
// - stats_period: 统计期数
// - backtest_method: 回测方法（most/least/average）
// 接口功能: 幻圆回测 - 互补对称杀号法回测

const express = require('express');
const { query } = require('./数据库配置.js');

const router = express.Router();

/**
 * 获取幻圆回测互补对称数据
 * @param {string} backtest_period - 回测周期
 * @param {string} stats_period - 统计周期
 * @param {string} backtest_method - 回测方法（most/least/average）
 * @returns {Promise<Object>} 包含回测数据的结果
 */
// 互补对杀号法
function complementPairKill(lastDrawNumbers) {
  const killedNumbers = [];
  
  // 生成所有互补对
  const allComplements = [];
  for (let i = 1; i <= 17; i++) {
    allComplements.push({ pair: [i, 36 - i], key: `${i}-${36 - i}` });
  }
  
  // 计算当前期出现的互补对
  const currentComplements = [];
  for (let i = 0; i < lastDrawNumbers.length; i++) {
    for (let j = i + 1; j < lastDrawNumbers.length; j++) {
      const num1 = lastDrawNumbers[i];
      const num2 = lastDrawNumbers[j];
      if (num1 + num2 === 36) {
        // 找到互补对
        const complementKey = `${Math.min(num1, num2)}-${Math.max(num1, num2)}`;
        currentComplements.push(complementKey);
      }
    }
  }
  
  // 统计互补对的出现情况
  const complementStats = allComplements.map(complement => {
    const [num1, num2] = complement.pair;
    
    // 检查当前期是否出现
    const isCurrent = lastDrawNumbers.includes(num1) && lastDrawNumbers.includes(num2);
    
    // 检查互补对中的号码是否在当前期出现
    const hasNum1 = lastDrawNumbers.includes(num1);
    const hasNum2 = lastDrawNumbers.includes(num2);
    
    // 计算互补对的热冷程度
    let heatScore = 0;
    if (isCurrent) {
      // 当前期出现的互补对，热度+10
      heatScore += 10;
    } else if (hasNum1 || hasNum2) {
      // 只出现一个号码，热度+5
      heatScore += 5;
    } else {
      // 都没出现，热度-5
      heatScore -= 5;
    }
    
    // 计算互补对的平衡性评分
    const balanceScore = Math.abs((hasNum1 ? 1 : 0) - (hasNum2 ? 1 : 0));
    
    // 计算互补对号码与当前期号码的距离
    const distance1 = Math.min(...lastDrawNumbers.map(num => Math.abs(num1 - num)));
    const distance2 = Math.min(...lastDrawNumbers.map(num => Math.abs(num2 - num)));
    const avgDistance = (distance1 + distance2) / 2;
    
    return {
      ...complement,
      isCurrent: isCurrent,
      hasNum1: hasNum1,
      hasNum2: hasNum2,
      heatScore: heatScore,
      balanceScore: balanceScore,
      avgDistance: avgDistance
    };
  });
  
  // 1. 杀掉当前期出现的互补对
  const currentKillComplements = complementStats.filter(stat => stat.isCurrent);
  currentKillComplements.forEach(stat => {
    killedNumbers.push(...stat.pair);
  });
  
  // 2. 杀掉平衡性差的互补对（只出现一个号码）
  const unbalancedComplements = complementStats.filter(stat => stat.balanceScore === 1);
  
  // 3. 杀掉极冷互补对（都没出现）
  const coldComplements = complementStats.filter(stat => 
    !stat.hasNum1 && !stat.hasNum2
  );
  
  // 4. 杀掉距离较远的互补对
  const farComplements = complementStats.filter(stat => stat.avgDistance > 15);
  
  // 合并所有候选杀号互补对
  const allCandidateComplements = [...unbalancedComplements, ...coldComplements, ...farComplements];
  
  // 去重
  const uniqueCandidates = allCandidateComplements.filter((complement, index, self) => 
    index === self.findIndex((c) => c.key === complement.key)
  );
  
  // 随机选择互补对杀掉，确保杀号数量足够
  const shuffle = (array) => array.sort(() => Math.random() - 0.5);
  const shuffledCandidates = shuffle(uniqueCandidates);
  
  // 计算需要的杀号数量
  const targetKillCount = Math.floor(Math.random() * 3) + 6; // 6-8个杀号
  
  // 添加杀号，直到达到目标数量
  for (const complement of shuffledCandidates) {
    if (killedNumbers.length >= targetKillCount * 2) break; // 每个互补对贡献2个号码
    killedNumbers.push(...complement.pair);
  }
  
  // 去重并过滤掉当前期开奖号
  const finalKillNumbers = [...new Set(killedNumbers)]
    .filter(num => !lastDrawNumbers.includes(num));
  
  // 确保杀号数量在6-8个之间
  let resultKillNumbers = finalKillNumbers;
  if (resultKillNumbers.length < 6) {
    // 如果数量不足，从所有号码中随机添加一些
    const allNumbers = Array.from({ length: 35 }, (_, i) => i + 1);
    const availableNumbers = allNumbers.filter(num => 
      !resultKillNumbers.includes(num) && !lastDrawNumbers.includes(num)
    );
    const neededCount = 6 - resultKillNumbers.length;
    const additionalNumbers = shuffle(availableNumbers).slice(0, neededCount);
    resultKillNumbers = [...resultKillNumbers, ...additionalNumbers];
  } else if (resultKillNumbers.length > 8) {
    // 如果数量过多，随机保留8个
    resultKillNumbers = shuffle(resultKillNumbers).slice(0, 8);
  }
  
  return {
    killedNumbers: resultKillNumbers,
    analysis: `共检查${allComplements.length}个互补对，杀掉${resultKillNumbers.length}个号码`
  };
}

async function getHuanYuanHuBuBacktest(backtest_period, stats_period, backtest_method) {
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
      
      // 应用互补对杀号法生成推荐杀号
      const killResult = complementPairKill(currentFrontNumbers);
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
    console.error('获取幻圆回测互补对称数据失败:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

// 定义获取幻圆回测互补对称数据的路由
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
    
    const result = await getHuanYuanHuBuBacktest(backtest_period, stats_period, backtest_method);
    res.json(result);
  } catch (error) {
    console.error('处理幻圆回测互补对称请求失败:', error);
    res.json({
      success: false,
      message: error.message
    });
  }
});

// 导出路由器
module.exports = router;