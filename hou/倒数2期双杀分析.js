// 参数说明:
// - period: 必需，查询周期，值可以是 "35", "50", "100", "200", "300", "500", "1000"
// 接口功能: 分析倒数第2期两球组合在下下期的出现情况
// 1. 返回倒数第2期的开奖数据
// 2. 分析倒数第2期前区每两个球的自由组合，统计在指定周期内这些组合出现时，下下期开奖号码出现的次数
// 3. 分析倒数第2期后区两球组合，统计在指定周期内这些组合出现时，下下期开奖号码出现的次数

const express = require('express');
const cors = require('cors');
const { query } = require('./数据库配置.js');

const router = express.Router();

/**
 * 获取倒数第2期两球组合下下期出现统计数据
 * @param {string} period - 统计周期（35, 50, 100, 200, 300, 500, 1000）
 * @returns {Promise<Object>} 包含倒数第2期开奖数据和组合统计的结果
 */
async function getSecondLastDoubleKillAnalysis(period) {
  try {
    // 验证参数
    if (period !== 'all' && (isNaN(period) || parseInt(period) <= 0)) {
      throw new Error('无效的周期参数，必须是正整数或"all"');
    }

    // 获取倒数第2期的开奖数据
    console.log('开始查询倒数第2期开奖数据...');
    const secondLastResultSql = `
      SELECT * 
      FROM lottery_results 
      ORDER BY issue DESC 
      LIMIT 1, 1
    `;
    
    const secondLastResult = await query(secondLastResultSql);
    console.log('倒数第2期开奖数据查询完成');
    
    if (!secondLastResult || secondLastResult.length === 0) {
      throw new Error('未找到倒数第2期开奖数据');
    }

    const secondLastDraw = secondLastResult[0];
    console.log('获取到倒数第2期开奖期号:', secondLastDraw.issue);
    console.log('红球数据:', secondLastDraw.red);
    console.log('蓝球数据:', secondLastDraw.blue);
    
    // 解析前区号码（从red字段中获取）
    let frontNumbers = [];
    try {
      if (Array.isArray(secondLastDraw.red)) {
        // 如果已经是数组，直接使用
        frontNumbers = secondLastDraw.red.map(num => typeof num === 'string' ? parseInt(num) : num);
      } else if (typeof secondLastDraw.red === 'string') {
        // 从字符串中提取数字
        const numbers = secondLastDraw.red.match(/\d+/g);
        if (numbers) {
          frontNumbers = numbers.map(num => parseInt(num));
        }
      }
      // 确保frontNumbers至少有一些号码，否则记录错误
      if (!frontNumbers.length) {
        console.error('Failed to extract front numbers from:', secondLastDraw.red);
      }
    } catch (e) {
      console.error('Error extracting red numbers:', e);
    }

    // 解析后区号码（从blue字段中获取）
    let backNumbers = [];
    try {
      if (Array.isArray(secondLastDraw.blue)) {
        // 如果已经是数组，直接使用
        backNumbers = secondLastDraw.blue.map(num => typeof num === 'string' ? parseInt(num) : num);
      } else if (typeof secondLastDraw.blue === 'string') {
        // 从字符串中提取数字
        const numbers = secondLastDraw.blue.match(/\d+/g);
        if (numbers) {
          backNumbers = numbers.map(num => parseInt(num));
        }
      }
      // 确保backNumbers至少有一些号码，否则记录错误
      if (!backNumbers.length) {
        console.error('Failed to extract back numbers from:', secondLastDraw.blue);
      }
    } catch (e) {
      console.error('Error extracting blue numbers:', e);
    }

    // 获取历史数据（用于统计）
    let historyData;
    console.log('准备查询历史数据，period:', period);
    // 直接使用查询，不使用参数化查询的LIMIT
    if (period === 'all') {
      // 查询所有历史数据（除了最新两期）
      const historySql = `
        SELECT * 
        FROM lottery_results 
        WHERE issue < '${secondLastDraw.issue}' 
        ORDER BY issue DESC
      `;
      historyData = await query(historySql);
    } else {
      // 查询指定周期内的历史数据
      const limit = parseInt(period);
      const historySql = `
        SELECT * 
        FROM lottery_results 
        WHERE issue < '${secondLastDraw.issue}' 
        ORDER BY issue DESC 
        LIMIT ${limit}
      `;
      historyData = await query(historySql);
    }
    console.log('历史数据查询完成，共获取', historyData.length, '条记录');

    // 生成倒数第2期前区号码的所有两球组合
    const frontCombinations = [];
    for (let i = 0; i < frontNumbers.length; i++) {
      for (let j = i + 1; j < frontNumbers.length; j++) {
        // 确保小球在前，大球在后，保持一致性
        const ball1 = Math.min(frontNumbers[i], frontNumbers[j]);
        const ball2 = Math.max(frontNumbers[i], frontNumbers[j]);
        frontCombinations.push(`${ball1}-${ball2}`);
      }
    }

    // 生成倒数第2期后区号码的两球组合（通常后区只有2个球，所以只会有一个组合）
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

    // 统计前区每个组合出现时下下期的号码
    const frontCombinationStats = {};
    frontCombinations.forEach(combination => {
      frontCombinationStats[combination] = {
        combination: combination,
        nextNextDrawNumbers: [], // 存储这个组合出现时下下期开出的号码
        numberCounts: {} // 统计每个号码出现的次数
      };
    });

    // 统计后区每个组合出现时下下期的号码
    const backCombinationStats = {};
    backCombinations.forEach(combination => {
      backCombinationStats[combination] = {
        combination: combination,
        nextNextDrawNumbers: [], // 存储这个组合出现时下下期开出的号码
        numberCounts: {} // 统计每个号码出现的次数
      };
    });

    // 遍历历史数据，查找组合出现的位置，并记录下下期的号码
    // 注意：历史数据是按issue降序排列的，所以下下期的索引是i-2
    for (let i = 2; i < historyData.length; i++) {
      const currentDraw = historyData[i];  // 当前期（组合出现的期数）
      const nextNextDraw = historyData[i - 2]; // 下下期（期号比当前期大2，因为数据是降序排列的）
      
      // 确保nextNextDraw存在
      if (!nextNextDraw) continue;
      
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
          // 获取下下期的前区号码
          let nextNextNumbers = [];
          try {
            if (Array.isArray(nextNextDraw.red)) {
              nextNextNumbers = nextNextDraw.red.map(num => typeof num === 'string' ? parseInt(num) : num);
            } else if (typeof nextNextDraw.red === 'string') {
              nextNextNumbers = nextNextDraw.red.match(/\d+/g)?.map(num => parseInt(num)) || [];
            }
          } catch (e) {
            console.error('Error extracting next next draw red numbers:', e);
          }
          
          // 记录下下期的号码
          frontCombinationStats[comb].nextNextDrawNumbers.push({
            nextNextIssue: nextNextDraw.issue,
            numbers: nextNextNumbers
          });
          
          // 更新号码计数
          nextNextNumbers.forEach(num => {
            frontCombinationStats[comb].numberCounts[num] = 
              (frontCombinationStats[comb].numberCounts[num] || 0) + 1;
          });
        }
      });
      
      // 检查后区是否包含我们关心的组合
      currentBackCombinations.forEach(comb => {
        if (backCombinations.includes(comb)) {
          // 获取下下期的后区号码
          let nextNextNumbers = [];
          try {
            if (Array.isArray(nextNextDraw.blue)) {
              nextNextNumbers = nextNextDraw.blue.map(num => typeof num === 'string' ? parseInt(num) : num);
            } else if (typeof nextNextDraw.blue === 'string') {
              nextNextNumbers = nextNextDraw.blue.match(/\d+/g)?.map(num => parseInt(num)) || [];
            }
          } catch (e) {
            console.error('Error extracting next next draw blue numbers:', e);
          }
          
          // 记录下下期的号码
          backCombinationStats[comb].nextNextDrawNumbers.push({
            nextNextIssue: nextNextDraw.issue,
            numbers: nextNextNumbers
          });
          
          // 更新号码计数
          nextNextNumbers.forEach(num => {
            backCombinationStats[comb].numberCounts[num] = 
              (backCombinationStats[comb].numberCounts[num] || 0) + 1;
          });
        }
      });
    }

    // 整理结果
    console.log('准备返回结果...');
    
    const result = {
      secondLastDraw: {
        issue: secondLastDraw.issue,
        drawDate: secondLastDraw.draw_date || secondLastDraw.date || new Date().toISOString().split('T')[0],
        frontNumbers: frontNumbers,
        backNumbers: backNumbers,
        fullData: secondLastDraw // 返回完整的开奖数据
      },
      frontCombinations: Object.values(frontCombinationStats),
      backCombinations: Object.values(backCombinationStats)
    };

    console.log('结果返回成功');
    return result;
  } catch (error) {
    console.error('倒数第2期双杀分析出错:', error);
    console.error('错误堆栈:', error.stack);
    throw error;
  }
}

/**
 * 倒数第2期双杀分析接口
 * @route GET /dao_shu_2_qi_shuang_sha_fen_xi
 * @group 数据分析 - 倒数第2期双杀分析相关接口
 * @param {string} period.query.required - 统计周期 (35, 50, 100, 200, 300, 500, 1000)
 * @returns {object} 200 - 成功响应，包含倒数第2期开奖数据和组合统计
 * @returns {object} 400 - 参数错误
 * @returns {object} 500 - 服务器内部错误
 */
router.get('/dao_shu_2_qi_shuang_sha_fen_xi', async (req, res) => {
  try {
    const { period } = req.query;
    
    if (!period) {
      return res.status(400).json({
        success: false,
        message: '缺少必需参数：period'
      });
    }

    const result = await getSecondLastDoubleKillAnalysis(period);
    
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