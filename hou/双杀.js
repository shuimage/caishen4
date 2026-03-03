// 参数说明:
// - period: 必需，查询周期，值可以是 "35", "50", "100", "200", "300", "500", "1000"
// 接口功能: 分析前区和后区两球组合在下一期的出现情况
// 1. 返回最新一期的开奖数据
// 2. 分析最新一期前区每两个球的自由组合，统计在指定周期内这些组合出现时，下一期开奖号码出现的次数
// 3. 分析最新一期后区两球组合，统计在指定周期内这些组合出现时，下一期开奖号码出现的次数

const express = require('express');
const cors = require('cors');
const { query } = require('./数据库配置.js');

const router = express.Router();

/**
 * 获取两球组合下一期出现统计数据
 * @param {string} period - 统计周期（35, 50, 100, 200, 300, 500, 1000）
 * @returns {Promise<Object>} 包含最新开奖数据和组合统计的结果
 */
async function getDoubleKillAnalysis(period) {
  try {
    // 处理中文字符串格式的period参数
    let processedPeriod = period;
    if (typeof period === 'string' && period !== 'all') {
      // 尝试从中文描述中提取数字
      const numberMatch = period.match(/\d+/);
      if (numberMatch) {
        processedPeriod = numberMatch[0];
        console.log('从中文描述中提取的数字:', processedPeriod);
      }
    }
    
    // 验证参数
    // 允许'all'字符串或者任何正整数
    if (processedPeriod !== 'all' && (isNaN(processedPeriod) || parseInt(processedPeriod) <= 0)) {
      throw new Error('无效的周期参数，必须是正整数或"all"');
    }
    
    // 使用处理后的period
    period = processedPeriod;

    // 不使用缓存，直接查询数据库

    // 获取最新一期的开奖数据
    console.log('开始查询最新开奖数据...');
    const latestResultSql = `
      SELECT * 
      FROM lottery_results 
      ORDER BY issue DESC 
      LIMIT 1
    `;
    
    const latestResult = await query(latestResultSql);
    console.log('最新开奖数据查询完成');
    
    if (!latestResult || latestResult.length === 0) {
      throw new Error('未找到开奖数据');
    }

    const latestDraw = latestResult[0];
    console.log('获取到最新开奖期号:', latestDraw.issue);
    console.log('红球数据:', latestDraw.red);
    console.log('蓝球数据:', latestDraw.blue);
    
    // 解析前区号码（从red字段中获取）
    let frontNumbers = [];
    try {
      if (Array.isArray(latestDraw.red)) {
        // 如果已经是数组，直接使用
        frontNumbers = latestDraw.red.map(num => typeof num === 'string' ? parseInt(num) : num);
      } else if (typeof latestDraw.red === 'string') {
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
      if (Array.isArray(latestDraw.blue)) {
        // 如果已经是数组，直接使用
        backNumbers = latestDraw.blue.map(num => typeof num === 'string' ? parseInt(num) : num);
      } else if (typeof latestDraw.blue === 'string') {
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
    console.log('准备查询历史数据，period:', period);
    // 直接使用查询，不使用参数化查询的LIMIT
    if (period === 'all') {
      // 查询所有历史数据（除了最新一期）
      const historySql = `
        SELECT * 
        FROM lottery_results 
        WHERE issue < '${latestDraw.issue}' 
        ORDER BY issue DESC
      `;
      historyData = await query(historySql);
    } else {
      // 查询指定周期内的历史数据
      const limit = parseInt(period);
      const historySql = `
        SELECT * 
        FROM lottery_results 
        WHERE issue < '${latestDraw.issue}' 
        ORDER BY issue DESC 
        LIMIT ${limit}
      `;
      historyData = await query(historySql);
    }
    console.log('历史数据查询完成，共获取', historyData.length, '条记录');

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
    // 注意：历史数据是按issue降序排列的，所以下一期的索引是i-1
    for (let i = 1; i < historyData.length; i++) {
      const currentDraw = historyData[i];  // 当前期（组合出现的期数）
      const nextDraw = historyData[i - 1]; // 下一期（期号比当前期大1，因为数据是降序排列的）
      
      // 确保nextDraw存在
      if (!nextDraw) continue;
      
      // 解析当前期的前区号码
      let currentFrontNumbers = [];
      try {
        if (Array.isArray(currentDraw.red)) {
          currentFrontNumbers = currentDraw.red.map(num => typeof num === 'string' ? parseInt(num) : num);
        } else if (typeof currentDraw.red === 'string') {
          currentFrontNumbers = currentDraw.red.match(/\d+/g)?.map(num => parseInt(num)) || [];
        }
      } catch (e) {
        console.error('Error extracting current draw red numbers:', e);
      }
      
      // 解析当前期的后区号码
      let currentBackNumbers = [];
      try {
        if (Array.isArray(currentDraw.blue)) {
          currentBackNumbers = currentDraw.blue.map(num => typeof num === 'string' ? parseInt(num) : num);
        } else if (typeof currentDraw.blue === 'string') {
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
            if (Array.isArray(nextDraw.red)) {
              nextNumbers = nextDraw.red.map(num => typeof num === 'string' ? parseInt(num) : num);
            } else if (typeof nextDraw.red === 'string') {
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
            if (Array.isArray(nextDraw.blue)) {
              nextNumbers = nextDraw.blue.map(num => typeof num === 'string' ? parseInt(num) : num);
            } else if (typeof nextDraw.blue === 'string') {
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

    // 计算推荐杀号：统计期内所有组合出现0次的号码
    // 前区推荐杀号：所有前区组合都未出现过的号码
    console.log('开始计算前区推荐杀号...');
    const recommendedFrontKillNumbers = [];
    // 检查1-35的每个号码
    for (let num = 1; num <= 35; num++) {
      let isKillNumber = true;
      // 检查这个号码是否在所有组合的出现次数中都是0
      for (const comb of frontCombinations) {
        if (frontCombinationStats[comb] && frontCombinationStats[comb].numberCounts[num] > 0) {
          isKillNumber = false;
          break;
        }
      }
      if (isKillNumber) {
        recommendedFrontKillNumbers.push(num);
      }
    }
    console.log('前区推荐杀号计算完成:', recommendedFrontKillNumbers);
    
    // 后区推荐杀号：所有后区组合都未出现过的号码
    console.log('开始计算后区推荐杀号...');
    const recommendedBackKillNumbers = [];
    // 检查1-12的每个号码
    for (let num = 1; num <= 12; num++) {
      let isKillNumber = true;
      // 检查这个号码是否在所有组合的出现次数中都是0
      for (const comb of backCombinations) {
        if (backCombinationStats[comb] && backCombinationStats[comb].numberCounts[num] > 0) {
          isKillNumber = false;
          break;
        }
      }
      if (isKillNumber) {
        recommendedBackKillNumbers.push(num);
      }
    }
    console.log('后区推荐杀号计算完成:', recommendedBackKillNumbers);

    // 整理结果
    console.log('准备返回结果...');
    console.log('前区推荐杀号最终结果:', recommendedFrontKillNumbers);
    console.log('后区推荐杀号最终结果:', recommendedBackKillNumbers);
    
    const result = {
      latestDraw: {
        issue: latestDraw.issue,
        drawDate: latestDraw.draw_date || latestDraw.date || new Date().toISOString().split('T')[0],
        frontNumbers: frontNumbers,
        backNumbers: backNumbers,
        fullData: latestDraw // 返回完整的开奖数据
      },
      frontCombinations: Object.values(frontCombinationStats),
      backCombinations: Object.values(backCombinationStats),
      recommendedFrontKillNumbers: recommendedFrontKillNumbers, // 前区推荐杀号
      recommendedBackKillNumbers: recommendedBackKillNumbers // 后区推荐杀号
    };

    // 不使用缓存
    console.log('结果返回成功');
    return result;
  } catch (error) {
    console.error('双杀分析出错:', error);
    console.error('错误堆栈:', error.stack);
    throw error;
  }
}

/**
 * 双杀分析接口
 * @route GET /shuang_sha_fen_xi
 * @group 数据分析 - 双杀分析相关接口
 * @param {string} period.query.required - 统计周期 (35, 50, 100, 200, 300, 500, 1000)
 * @returns {object} 200 - 成功响应，包含最新开奖数据和组合统计
 * @returns {object} 400 - 参数错误
 * @returns {object} 500 - 服务器内部错误
 */
router.get('/', async (req, res) => {
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