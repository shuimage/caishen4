const express = require('express');
const cors = require('cors');
const { query } = require('./数据库配置.js');

const router = express.Router();

/**
 * 倒数3期三球组合前区杀号回测
 * @param {string} backtest_period - 回测周期（35, 50, 100, 200, 300, 500, 1000）
 * @param {string} stats_period - 统计周期（35, 50, 100, 200, 300, 500, 1000）
 * @returns {Promise<Object>} 包含回测结果列表的对象
 */
async function getDaoShu3QiSanQiuShaHaoHuiCe(backtest_period, stats_period) {
  try {
    // 1. 参数验证
    if (backtest_period !== 'all' && (isNaN(backtest_period) || parseInt(backtest_period) <= 0)) {
      throw new Error('无效的回测周期参数，必须是正整数或"all"');
    }
    if (stats_period !== 'all' && (isNaN(stats_period) || parseInt(stats_period) <= 0)) {
      throw new Error('无效的统计周期参数，必须是正整数或"all"');
    }

    // 2. 获取历史数据
    console.log('准备查询历史数据，backtest_period:', backtest_period, ', stats_period:', stats_period);
    let historyData;
    if (backtest_period === 'all') {
      const historySql = `
        SELECT * 
        FROM lottery_results 
        ORDER BY issue DESC
      `;
      historyData = await query(historySql);
    } else {
      const limit = parseInt(backtest_period);
      const historySql = `
        SELECT * 
        FROM lottery_results 
        ORDER BY issue DESC 
        LIMIT ${limit + 3}
      `;
      historyData = await query(historySql);
    }
    console.log('历史数据查询完成，共获取', historyData.length, '条记录');

    // 3. 准备回测结果
    const backtestResults = [];

    // 4. 遍历历史数据进行回测（从第4条开始，确保有足够的历史数据）
    for (let i = 3; i < historyData.length; i++) {
      try {
        // 当前回测期（用作参考期）
        const currentDraw = historyData[i];
        // 倒数第3期（用于生成三球组合）
        const thirdLastDraw = historyData[i + 3];
        // 下下下期开奖结果（用于验证杀号）
        const nextNextNextDraw = historyData[i - 3];

        if (!thirdLastDraw || !nextNextNextDraw) continue;

        console.log(`回测处理：当前期号${currentDraw.issue}，倒数第3期${thirdLastDraw.issue}，下下下期${nextNextNextDraw.issue}`);

        // 5. 解析倒数第3期前区号码
        let frontNumbers = [];
        if (Array.isArray(thirdLastDraw.red)) {
          frontNumbers = thirdLastDraw.red.map(num => typeof num === 'string' ? parseInt(num) : num);
        } else if (typeof thirdLastDraw.red === 'string') {
          const numbers = thirdLastDraw.red.match(/\d+/g);
          if (numbers) {
            frontNumbers = numbers.map(num => parseInt(num));
          }
        }
        if (!frontNumbers.length) {
          console.error('无法解析倒数第3期前区号码:', thirdLastDraw.red);
          continue;
        }

        // 6. 生成倒数第3期前区「三球组合」
        const frontCombinations = [];
        for (let j = 0; j < frontNumbers.length; j++) {
          for (let k = j + 1; k < frontNumbers.length; k++) {
            for (let l = k + 1; l < frontNumbers.length; l++) {
              const sortedBalls = [frontNumbers[j], frontNumbers[k], frontNumbers[l]].sort((a, b) => a - b);
              frontCombinations.push(`${sortedBalls[0]}-${sortedBalls[1]}-${sortedBalls[2]}`);
            }
          }
        }
        if (frontCombinations.length === 0) {
          console.error('倒数第3期前区号码不足3个，无法生成三球组合:', frontNumbers);
          continue;
        }

        // 7. 初始化前区三球组合统计结构
        const frontCombinationStats = {};
        frontCombinations.forEach(combination => {
          frontCombinationStats[combination] = {
            combination: combination,
            count: 0,
            nextNextNextDrawNumbers: [],
            numberCounts: {}
          };
        });

        // 8. 获取用于统计的历史数据（在当前回测期之前的数据）
        let statsData;
        const statsSql = `
          SELECT * 
          FROM lottery_results 
          WHERE issue < '${currentDraw.issue}' 
          ORDER BY issue DESC 
          LIMIT ${stats_period === 'all' ? 1000 : parseInt(stats_period)}
        `;
        statsData = await query(statsSql);

        // 9. 遍历统计数据，统计三球组合对应的下下下期号码
        for (let j = 3; j < statsData.length; j++) {
          const statsCurrentDraw = statsData[j];
          const statsNextNextNextDraw = statsData[j - 3];
          if (!statsNextNextNextDraw) continue;

          // 解析当前期前区号码
          let statsCurrentFrontNumbers = [];
          if (Array.isArray(statsCurrentDraw.red)) {
            statsCurrentFrontNumbers = statsCurrentDraw.red.map(num => typeof num === 'string' ? parseInt(num) : num);
          } else if (typeof statsCurrentDraw.red === 'string') {
            const numbers = statsCurrentDraw.red.match(/\d+/g);
            if (numbers) {
              statsCurrentFrontNumbers = numbers.map(num => parseInt(num));
            }
          }

          // 生成当前期前区「三球组合」
          const statsCurrentFrontCombinations = [];
          for (let k = 0; k < statsCurrentFrontNumbers.length; k++) {
            for (let l = k + 1; l < statsCurrentFrontNumbers.length; l++) {
              for (let m = l + 1; m < statsCurrentFrontNumbers.length; m++) {
                const sortedBalls = [statsCurrentFrontNumbers[k], statsCurrentFrontNumbers[l], statsCurrentFrontNumbers[m]].sort((a, b) => a - b);
                statsCurrentFrontCombinations.push(`${sortedBalls[0]}-${sortedBalls[1]}-${sortedBalls[2]}`);
              }
            }
          }

          // 匹配组合并统计下下下期号码
          statsCurrentFrontCombinations.forEach(comb => {
            if (frontCombinations.includes(comb)) {
              frontCombinationStats[comb].count += 1;
              
              let nextNextNextNumbers = [];
              if (Array.isArray(statsNextNextNextDraw.red)) {
                nextNextNextNumbers = statsNextNextNextDraw.red.map(num => typeof num === 'string' ? parseInt(num) : num);
              } else if (typeof statsNextNextNextDraw.red === 'string') {
                nextNextNextNumbers = statsNextNextNextDraw.red.match(/\d+/g)?.map(num => parseInt(num)) || [];
              }

              nextNextNextNumbers.forEach(num => {
                frontCombinationStats[comb].numberCounts[num] = 
                  (frontCombinationStats[comb].numberCounts[num] || 0) + 1;
              });
            }
          });
        }

        // 10. 计算前区推荐杀号（使用与原算法相同的逻辑）
        const recommendedKillNumbers = [];
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
            recommendedKillNumbers.push(num);
          }
        }

        // 11. 解析下下下期开奖前区号码
        let nextNextNextDrawNumbers = [];
        if (Array.isArray(nextNextNextDraw.red)) {
          nextNextNextDrawNumbers = nextNextNextDraw.red.map(num => typeof num === 'string' ? parseInt(num) : num);
        } else if (typeof nextNextNextDraw.red === 'string') {
          const numbers = nextNextNextDraw.red.match(/\d+/g);
          if (numbers) {
            nextNextNextDrawNumbers = numbers.map(num => parseInt(num));
          }
        }

        // 12. 统计正确杀号和错误杀号数量
        let correctKillCount = 0;
        let wrongKillCount = 0;
        
        recommendedKillNumbers.forEach(killNum => {
          if (!nextNextNextDrawNumbers.includes(killNum)) {
            correctKillCount++;
          } else {
            wrongKillCount++;
          }
        });

        // 13. 保存回测结果
        backtestResults.push({
          currentIssue: currentDraw.issue, // 当前回测期号
          recommendedKillNumbers: recommendedKillNumbers, // 前区推荐杀号
          nextNextNextIssue: nextNextNextDraw.issue, // 下下下期开奖期号
          actualNextNextNextNumbers: nextNextNextDrawNumbers, // 下下下期实际开奖前区
          correctKillCount: correctKillCount, // 正确杀号数量
          wrongKillCount: wrongKillCount, // 错误杀号数量
          drawDate: currentDraw.draw_date || currentDraw.date || new Date().toISOString().split('T')[0]
        });
      } catch (error) {
        console.error(`回测处理出错，跳过当前期:`, error);
        continue;
      }
    }

    // 14. 整理返回结果
    console.log('回测完成，共生成', backtestResults.length, '条回测记录');
    const result = {
      backtestResults: backtestResults,
      totalRecords: backtestResults.length
    };

    return result;
  } catch (error) {
    console.error('倒数3期三球组合杀号回测出错:', error);
    console.error('错误堆栈:', error.stack);
    throw error;
  }
}

/**
 * 倒数3期三球组合前区杀号回测接口
 * @route GET /dao_shu_3_qi_san_qiu_sha_hao_hui_ce
 * @group 数据分析 - 倒数3期三球组合杀号回测相关接口
 * @param {string} backtest_period.query.required - 回测周期 (35, 50, 100, 200, 300, 500, 1000, all)
 * @param {string} stats_period.query.required - 统计周期 (35, 50, 100, 200, 300, 500, 1000, all)
 * @returns {object} 200 - 成功响应，包含回测结果
 * @returns {object} 400 - 参数错误
 * @returns {object} 500 - 服务器内部错误
 */
router.get('/', async (req, res) => {
  try {
    const { backtest_period, stats_period } = req.query;
    
    if (!backtest_period || !stats_period) {
      return res.status(400).json({
        success: false,
        message: '缺少必需参数：backtest_period或stats_period'
      });
    }

    const result = await getDaoShu3QiSanQiuShaHaoHuiCe(backtest_period, stats_period);
    
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