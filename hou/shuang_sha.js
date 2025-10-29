// 参数说明:
// - period: 必需，查询周期，值可以是 "35", "50", "100", "200", "300", "500", "1000"
// 接口功能: 分析前区和后区两球组合在下一期的出现情况
// 1. 返回最新一期的开奖数据
// 2. 分析最新一期前区每两个球的自由组合，统计在指定周期内这些组合出现时，下一期开奖号码出现的次数
// 3. 分析最新一期后区两球组合，统计在指定周期内这些组合出现时，下一期开奖号码出现的次数

const express = require('express');
const cors = require('cors');
const { query } = require('./db.config');
const { cacheGet, cacheSet } = require('./redis.config');

const router = express.Router();

/**
 * 获取两球组合下一期出现统计数据
 * @param {string} period - 统计周期（35, 50, 100, 200, 300, 500, 1000）
 * @returns {Promise<Object>} 包含最新开奖数据和组合统计的结果
 */
async function getDoubleKillAnalysis(period) {
  try {
    // 验证参数
    const validPeriods = ['35', '50', '100', '200', '300', '500', '1000', 'all'];
    if (!validPeriods.includes(period)) {
      throw new Error('无效的周期参数，有效值为：35, 50, 100, 200, 300, 500, 1000, all');
    }

    // 尝试从缓存获取数据（使用新的缓存键名避免旧数据影响）
    const cacheKey = `double_kill_v3_${period}`;
    const cachedData = await cacheGet(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // 获取最新一期的开奖数据
    const latestResultSql = `
      SELECT * 
      FROM lottery_results 
      ORDER BY issue DESC 
      LIMIT 1
    `;
    const latestResult = await query(latestResultSql);
    
    if (!latestResult || latestResult.length === 0) {
      throw new Error('未找到开奖数据');
    }

    const latestDraw = latestResult[0];
    
    // 解析前区号码（从red字段中获取）
    let frontNumbers = [];
    try {
      if (typeof latestDraw.red === 'string') {
        // 从字符串中提取数字
        const numbers = latestDraw.red.match(/\d+/g);
        if (numbers) {
          frontNumbers = numbers.map(num => parseInt(num));
        }
      }
      // 确保frontNumbers至少有一些号码，否则记录错误
      if (!frontNumbers.length) {
        console.error('Failed to extract front numbers from:', latestDraw.red);
      }
    } catch (e) {
      console.error('Error extracting red numbers:', e);
    }

    // 解析后区号码（从blue字段中获取）
    let backNumbers = [];
    try {
      if (typeof latestDraw.blue === 'string') {
        // 从字符串中提取数字
        const numbers = latestDraw.blue.match(/\d+/g);
        if (numbers) {
          backNumbers = numbers.map(num => parseInt(num));
        }
      }
      // 确保backNumbers至少有一些号码，否则记录错误
      if (!backNumbers.length) {
        console.error('Failed to extract back numbers from:', latestDraw.blue);
      }
    } catch (e) {
      console.error('Error extracting blue numbers:', e);
    }

    // 获取历史数据
    let historyData;
    if (period === 'all') {
      // 查询所有历史数据（除了最新一期）
      const historySql = `
        SELECT * 
        FROM lottery_results 
        WHERE issue < ? 
        ORDER BY issue DESC
      `;
      historyData = await query(historySql, [latestDraw.issue]);
    } else {
      // 查询指定周期内的历史数据
      const historySql = `
        SELECT * 
        FROM lottery_results 
        WHERE issue < ? 
        ORDER BY issue DESC 
        LIMIT ?
      `;
      historyData = await query(historySql, [latestDraw.issue, parseInt(period)]);
    }

    // 生成最新一期前区号码的所有两球组合
    const frontCombinations = [];
    for (let i = 0; i < frontNumbers.length; i++) {
      for (let j = i + 1; j < frontNumbers.length; j++) {
        // 确保小球在前，大球在后，保持一致性
        const ball1 = Math.min(frontNumbers[i], frontNumbers[j]);
        const ball2 = Math.max(frontNumbers[i], frontNumbers[j]);
        frontCombinations.push(`${ball1}-${ball2}`);
      }
    }

    // 生成最新一期后区号码的两球组合（通常后区只有2个球，所以只会有一个组合）
    const backCombinations = [];
    if (backNumbers.length >= 2) {
      for (let i = 0; i < backNumbers.length; i++) {
        for (let j = i + 1; j < backNumbers.length; j++) {
          // 确保小球在前，大球在后，保持一致性
          const ball1 = Math.min(backNumbers[i], backNumbers[j]);
          const ball2 = Math.max(backNumbers[i], backNumbers[j]);
          backCombinations.push(`${ball1}-${ball2}`);
        }
      }
    }

    // 统计前区每个组合出现时下一期的号码
    const frontCombinationStats = {};
    frontCombinations.forEach(combination => {
      frontCombinationStats[combination] = {
        combination: combination,
        nextDrawNumbers: [], // 存储这个组合出现时下一期开出的号码
        numberCounts: {} // 统计每个号码出现的次数
      };
    });

    // 统计后区每个组合出现时下一期的号码
    const backCombinationStats = {};
    backCombinations.forEach(combination => {
      backCombinationStats[combination] = {
        combination: combination,
        nextDrawNumbers: [], // 存储这个组合出现时下一期开出的号码
        numberCounts: {} // 统计每个号码出现的次数
      };
    });

    // 遍历历史数据，查找组合出现的位置，并记录下一期的号码
    // 注意：历史数据是按issue降序排列的，所以需要反向查找下一期
    for (let i = 1; i < historyData.length; i++) {
      const currentDraw = historyData[i];  // 当前期（组合出现的期数）
      const nextDraw = historyData[i + 1]; // 下一期（期号比当前期大1）
      
      // 解析当前期的前区号码
      let currentFrontNumbers = [];
      try {
        if (typeof currentDraw.red === 'string') {
          currentFrontNumbers = currentDraw.red.match(/\d+/g)?.map(num => parseInt(num)) || [];
        }
      } catch (e) {
        console.error('Error extracting current draw red numbers:', e);
      }
      
      // 解析当前期的后区号码
      let currentBackNumbers = [];
      try {
        if (typeof currentDraw.blue === 'string') {
          currentBackNumbers = currentDraw.blue.match(/\d+/g)?.map(num => parseInt(num)) || [];
        }
      } catch (e) {
        console.error('Error extracting current draw blue numbers:', e);
      }
      
      // 生成当前期前区的所有两球组合
      const currentFrontCombinations = [];
      for (let j = 0; j < currentFrontNumbers.length; j++) {
        for (let k = j + 1; k < currentFrontNumbers.length; k++) {
          const ball1 = Math.min(currentFrontNumbers[j], currentFrontNumbers[k]);
          const ball2 = Math.max(currentFrontNumbers[j], currentFrontNumbers[k]);
          currentFrontCombinations.push(`${ball1}-${ball2}`);
        }
      }
      
      // 生成当前期后区的所有两球组合
      const currentBackCombinations = [];
      for (let j = 0; j < currentBackNumbers.length; j++) {
        for (let k = j + 1; k < currentBackNumbers.length; k++) {
          const ball1 = Math.min(currentBackNumbers[j], currentBackNumbers[k]);
          const ball2 = Math.max(currentBackNumbers[j], currentBackNumbers[k]);
          currentBackCombinations.push(`${ball1}-${ball2}`);
        }
      }
      
      // 检查前区是否包含我们关心的组合
      currentFrontCombinations.forEach(comb => {
        if (frontCombinations.includes(comb)) {
          // 获取下一期的前区号码
          let nextNumbers = [];
          try {
            if (typeof nextDraw.red === 'string') {
              nextNumbers = nextDraw.red.match(/\d+/g)?.map(num => parseInt(num)) || [];
            }
          } catch (e) {
            console.error('Error extracting next draw red numbers:', e);
          }
          
          // 记录下一期的号码
          frontCombinationStats[comb].nextDrawNumbers.push({
            nextIssue: nextDraw.issue,
            numbers: nextNumbers
          });
          
          // 更新号码计数
          nextNumbers.forEach(num => {
            frontCombinationStats[comb].numberCounts[num] = 
              (frontCombinationStats[comb].numberCounts[num] || 0) + 1;
          });
        }
      });
      
      // 检查后区是否包含我们关心的组合
      currentBackCombinations.forEach(comb => {
        if (backCombinations.includes(comb)) {
          // 获取下一期的后区号码
          let nextNumbers = [];
          try {
            if (typeof nextDraw.blue === 'string') {
              nextNumbers = nextDraw.blue.match(/\d+/g)?.map(num => parseInt(num)) || [];
            }
          } catch (e) {
            console.error('Error extracting next draw blue numbers:', e);
          }
          
          // 记录下一期的号码
          backCombinationStats[comb].nextDrawNumbers.push({
            nextIssue: nextDraw.issue,
            numbers: nextNumbers
          });
          
          // 更新号码计数
          nextNumbers.forEach(num => {
            backCombinationStats[comb].numberCounts[num] = 
              (backCombinationStats[comb].numberCounts[num] || 0) + 1;
          });
        }
      });
    }

    // 整理结果
    const result = {
      latestDraw: {
        issue: latestDraw.issue,
        drawDate: latestDraw.draw_date || latestDraw.date || new Date().toISOString().split('T')[0],
        frontNumbers: frontNumbers,
        backNumbers: backNumbers,
        fullData: latestDraw // 返回完整的开奖数据
      },
      frontCombinations: Object.values(frontCombinationStats),
      backCombinations: Object.values(backCombinationStats)
    };

    // 缓存结果（缓存1小时）
    await cacheSet(cacheKey, result, 3600);

    return result;
  } catch (error) {
    console.error('双杀分析出错:', error);
    throw error;
  }
}

/**
 * 双杀分析接口
 * @route GET /doubleKillAnalysis
 * @group 数据分析 - 双杀分析相关接口
 * @param {string} period.query.required - 统计周期 (35, 50, 100, 200, 300, 500, 1000)
 * @returns {object} 200 - 成功响应，包含最新开奖数据和组合统计
 * @returns {object} 400 - 参数错误
 * @returns {object} 500 - 服务器内部错误
 */
router.get('/doubleKillAnalysis', async (req, res) => {
  try {
    const { period } = req.query;
    
    if (!period) {
      return res.status(400).json({
        success: false,
        message: '缺少必需参数：period'
      });
    }

    const result = await getDoubleKillAnalysis(period);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || '服务器内部错误'
    });
  }
});

module.exports = router;