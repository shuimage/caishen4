const express = require('express');
const cors = require('cors');
const { query } = require('./db.config');

const router = express.Router();

/**
 * 获取前区三球组合下一期出现统计数据（已删除后区功能）
 * @param {string} period - 统计周期（35, 50, 100, 200, 300, 500, 1000）
 * @returns {Promise<Object>} 包含最新开奖数据和三球组合统计的结果
 */
async function getTripleKillAnalysis(period) { // 函数名可修改为更贴合三球的名称
  try {
    // 1. 参数验证（逻辑不变，仅删除后区相关验证）
    if (period !== 'all' && (isNaN(period) || parseInt(period) <= 0)) {
      throw new Error('无效的周期参数，必须是正整数或"all"');
    }

    // 2. 获取最新一期开奖数据（仅保留前区逻辑）
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
    console.log('前区红球数据:', latestDraw.red); // 仅保留红球日志

    // 3. 解析前区号码（逻辑不变，删除后区解析）
    let frontNumbers = [];
    try {
      if (Array.isArray(latestDraw.red)) {
        frontNumbers = latestDraw.red.map(num => typeof num === 'string' ? parseInt(num) : num);
      } else if (typeof latestDraw.red === 'string') {
        const numbers = latestDraw.red.match(/\d+/g);
        if (numbers) {
          frontNumbers = numbers.map(num => parseInt(num));
        }
      }
      if (!frontNumbers.length) {
        console.error('Failed to extract front numbers from:', latestDraw.red);
        throw new Error('无法解析前区号码');
      }
    } catch (e) {
      console.error('Error extracting red numbers:', e);
      throw e;
    }

    // 4. 获取历史数据（逻辑不变，仅查询前区相关数据）
    let historyData;
    console.log('准备查询历史数据，period:', period);
    if (period === 'all') {
      const historySql = `
        SELECT * 
        FROM lottery_results 
        WHERE issue < '${latestDraw.issue}' 
        ORDER BY issue DESC
      `;
      historyData = await query(historySql);
    } else {
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

    // 5. 生成最新一期前区「三球组合」（核心修改：双重循环→三重循环）
    const frontCombinations = [];
    for (let i = 0; i < frontNumbers.length; i++) {
      for (let j = i + 1; j < frontNumbers.length; j++) {
        for (let k = j + 1; k < frontNumbers.length; k++) {
          // 号码从小到大排序，确保组合唯一性（如1-3-5，而非3-1-5）
          const sortedBalls = [frontNumbers[i], frontNumbers[j], frontNumbers[k]].sort((a, b) => a - b);
          frontCombinations.push(`${sortedBalls[0]}-${sortedBalls[1]}-${sortedBalls[2]}`);
        }
      }
    }
    // 校验：若前区号码不足3个，无法生成三球组合
    if (frontCombinations.length === 0) {
      throw new Error('最新一期前区号码不足3个，无法生成三球组合');
    }
    console.log('最新一期前区三球组合:', frontCombinations);

    // 6. 初始化前区三球组合统计结构（逻辑不变，仅适配三球组合）
    const frontCombinationStats = {};
    frontCombinations.forEach(combination => {
      frontCombinationStats[combination] = {
        combination: combination,
        nextDrawNumbers: [], // 该组合出现时下一期的号码
        numberCounts: {} // 下一期每个号码的出现次数
      };
    });

    // 7. 遍历历史数据，统计三球组合对应的下一期号码（核心修改：匹配三球组合）
    for (let i = 1; i < historyData.length; i++) {
      const currentDraw = historyData[i];  // 当前期（组合出现的期）
      const nextDraw = historyData[i - 1]; // 下一期（期号更大，数据降序排列）
      if (!nextDraw) continue;

      // 7.1 解析当前期前区号码
      let currentFrontNumbers = [];
      try {
        if (Array.isArray(currentDraw.red)) {
          currentFrontNumbers = currentDraw.red.map(num => typeof num === 'string' ? parseInt(num) : num);
        } else if (typeof currentDraw.red === 'string') {
          currentFrontNumbers = currentDraw.red.match(/\d+/g)?.map(num => parseInt(num)) || [];
        }
      } catch (e) {
        console.error('Error extracting current draw red numbers:', e);
        continue;
      }

      // 7.2 生成当前期前区「三球组合」（同步修改为三重循环）
      const currentFrontCombinations = [];
      for (let j = 0; j < currentFrontNumbers.length; j++) {
        for (let k = j + 1; k < currentFrontNumbers.length; k++) {
          for (let l = k + 1; l < currentFrontNumbers.length; l++) {
            const sortedBalls = [currentFrontNumbers[j], currentFrontNumbers[k], currentFrontNumbers[l]].sort((a, b) => a - b);
            currentFrontCombinations.push(`${sortedBalls[0]}-${sortedBalls[1]}-${sortedBalls[2]}`);
          }
        }
      }

      // 7.3 匹配组合并统计下一期号码（逻辑不变，仅匹配三球组合）
      currentFrontCombinations.forEach(comb => {
        if (frontCombinations.includes(comb)) {
          // 解析下一期前区号码
          let nextNumbers = [];
          try {
            if (Array.isArray(nextDraw.red)) {
              nextNumbers = nextDraw.red.map(num => typeof num === 'string' ? parseInt(num) : num);
            } else if (typeof nextDraw.red === 'string') {
              nextNumbers = nextDraw.red.match(/\d+/g)?.map(num => parseInt(num)) || [];
            }
          } catch (e) {
            console.error('Error extracting next draw red numbers:', e);
            return;
          }

          // 记录下一期数据
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
    }

    // 8. 计算前区推荐杀号（逻辑不变，仅基于三球组合统计）
    console.log('开始计算前区推荐杀号...');
    const recommendedFrontKillNumbers = [];
    for (let num = 1; num <= 35; num++) {
      let isKillNumber = true;
      // 检查号码在所有三球组合的统计中是否均未出现
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

    // 9. 整理返回结果（删除所有后区字段）
    console.log('准备返回结果...');
    const result = {
      latestDraw: {
        issue: latestDraw.issue,
        drawDate: latestDraw.draw_date || latestDraw.date || new Date().toISOString().split('T')[0],
        frontNumbers: frontNumbers,
        fullData: latestDraw
      },
      frontCombinations: Object.values(frontCombinationStats), // 三球组合统计数据
      recommendedFrontKillNumbers: recommendedFrontKillNumbers // 前区推荐杀号
    };

    console.log('结果返回成功');
    return result;
  } catch (error) {
    console.error('前区三球组合分析出错:', error);
    console.error('错误堆栈:', error.stack);
    throw error;
  }
}

/**
 * 前区三球组合分析接口
 * @route GET /san_qiu_fen_xi
 * @group 数据分析 - 前区三球组合相关接口
 * @param {string} period.query.required - 统计周期 (35, 50, 100, 200, 300, 500, 1000)
 * @returns {object} 200 - 成功响应，包含最新开奖数据和三球组合统计
 * @returns {object} 400 - 参数错误
 * @returns {object} 500 - 服务器内部错误
 */
router.get('/san_qiu_fen_xi', async (req, res) => {
  try {
    const { period } = req.query;
    
    if (!period) {
      return res.status(400).json({
        success: false,
        message: '缺少必需参数：period'
      });
    }

    const result = await getTripleKillAnalysis(period);
    
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