// 参数说明:
// - period: 必需，查询周期，值可以是 "35", "50", "100", "200", "300", "500", "1000"
// 接口功能: 分析倒数第8期前区两球组合在下下下下下下下下期的出现情况
// 返回倒数第8期前区两球组合的统计数据

const express = require('express');
const cors = require('cors');
const { query } = require('./数据库配置.js');

const router = express.Router();

// 处理球号数据，确保格式一致
function processBalls(balls) {
  if (!balls) return [];
  // 将球号字符串转换为数组并处理成标准格式
  if (typeof balls === 'string') {
    return balls.split(' ')
      .filter(ball => ball.trim() !== '')
      .map(ball => {
        // 移除非数字字符，只保留数字
        const cleanBall = ball.replace(/[^\d]/g, '');
        return cleanBall ? String(cleanBall).padStart(2, '0') : null;
      })
      .filter(Boolean); // 过滤掉null值
  } else if (Array.isArray(balls)) {
    return balls.map(ball => {
      // 移除非数字字符，只保留数字
      const cleanBall = String(ball).replace(/[^\d]/g, '');
      return cleanBall ? String(cleanBall).padStart(2, '0') : null;
    }).filter(Boolean); // 过滤掉null值
  }
  return [];
}


/**
 * 获取倒数第8期前区两球组合下下下下下下下下期出现统计数据
 * @param {string} period - 统计周期（35, 50, 100, 200, 300, 500, 1000）
 * @returns {Promise<Object>} 包含前区两球组合统计的结果
 */
async function getEighthLastFrontZoneAnalysis(period) {
  try {
    // 验证参数并转换类型
    let processedPeriod = period;
    if (typeof period === 'string') {
      // 移除中文，只保留数字
      const numericPart = period.replace(/[^0-9]/g, '');
      if (numericPart) {
        processedPeriod = parseInt(numericPart);
      } else if (period === 'all') {
        processedPeriod = 'all';
      }
    }
    
    // 验证参数
    if (processedPeriod !== 'all' && (isNaN(processedPeriod) || processedPeriod <= 0)) {
      throw new Error('无效的周期参数，必须是正整数或"all"');
    }

    // 获取倒数第8期的开奖数据
    console.log('开始查询倒数第8期开奖数据...');
    const eighthLastResultSql = `
      SELECT * 
      FROM lottery_results 
      ORDER BY issue DESC 
      LIMIT 7, 1
    `;
    
    const eighthLastResult = await query(eighthLastResultSql);
    console.log('倒数第8期开奖数据查询完成');
    
    if (!eighthLastResult || eighthLastResult.length === 0) {
      throw new Error('未找到倒数第8期开奖数据');
    }

    const eighthLastDraw = eighthLastResult[0];
    console.log('获取到倒数第8期开奖期号:', eighthLastDraw.issue);
    console.log('红球数据:', eighthLastDraw.red);
    
    // 解析前区号码（从red字段中获取）
    let frontNumbers = [];
    try {
      // 使用processBalls函数处理号码，确保格式一致
      const processedBalls = processBalls(eighthLastDraw.red);
      // 转换回数字数组，并过滤掉非数字值
      frontNumbers = processedBalls.map(num => parseInt(num)).filter(num => !isNaN(num));
      // 确保frontNumbers至少有一些号码，否则记录错误
      if (!frontNumbers.length) {
        console.error('Failed to extract valid front numbers from:', eighthLastDraw.red);
      }
    } catch (e) {
      console.error('Error extracting red numbers:', e);
    }

    // 获取历史数据（用于统计）
    let historyData;
    console.log('准备查询历史数据，period:', processedPeriod);
    // 直接使用查询，不使用参数化查询的LIMIT
    if (processedPeriod === 'all') {
      // 查询所有历史数据（除了最新八期）
      const historySql = `
        SELECT * 
        FROM lottery_results 
        WHERE issue < '${eighthLastDraw.issue}' 
        ORDER BY issue DESC
      `;
      historyData = await query(historySql);
    } else {
      // 查询指定周期内的历史数据
      const limit = parseInt(processedPeriod); // 只查询需要的期数
      const historySql = `
        SELECT *, bian_hao 
        FROM lottery_results 
        WHERE issue < '${eighthLastDraw.issue}' 
        ORDER BY issue DESC 
        LIMIT ${limit}
      `;
      historyData = await query(historySql);
    }
    console.log('历史数据查询完成，共获取', historyData.length, '条记录');

    // 只生成倒数8期前区号码的两两组合
    const frontCombinations = [];
    for (let i = 0; i < frontNumbers.length; i++) {
      for (let j = i + 1; j < frontNumbers.length; j++) {
        const ball1 = Math.min(frontNumbers[i], frontNumbers[j]);
        const ball2 = Math.max(frontNumbers[i], frontNumbers[j]);
        frontCombinations.push(`${ball1}-${ball2}`);
      }
    }

    // 统计前区每个组合出现时下下下下下下下下期的号码
    const frontCombinationStats = {};
    frontCombinations.forEach(combination => {
      frontCombinationStats[combination] = {
        combo: combination,
        count: 0,
        nextDrawNumbers: [], // 存储这个组合出现时下下下下下下下下期开出的号码
        numberCounts: {}, // 统计每个号码出现的次数
        occurrenceDetails: [] // 存储组合出现时的期号和下下下下下下下下期信息
      };
    });

    // 遍历历史数据，查找组合出现的位置，并记录下下下下下下下下期的号码
    // 注意：历史数据是按issue降序排列的，所以下下下下下下下下期的索引是i-8
    for (let i = 8; i < historyData.length; i++) {
      const currentDraw = historyData[i];  // 当前期（组合出现的期数）
      const nextNextNextNextNextNextNextNextDraw = historyData[i - 8]; // 下下下下下下下下期（期号比当前期大8，因为数据是降序排列的）
      
      // 确保nextNextNextNextNextNextNextNextDraw存在
      if (!nextNextNextNextNextNextNextNextDraw) continue;
      
      // 解析当前期的前区号码
      let currentFrontNumbers = [];
      try {
        // 使用processBalls函数处理号码，确保格式一致
        const processedBalls = processBalls(currentDraw.red);
        // 转换回数字数组
        currentFrontNumbers = processedBalls.map(num => parseInt(num));
      } catch (e) {
        console.error('Error extracting current draw red numbers:', e);
      }
      
      // 生成当前期前区的所有两球组合
      const currentFrontCombinations = [];
      for (let j = 0; j < currentFrontNumbers.length; j++) {
        for (let k = j + 1; k < currentFrontNumbers.length; k++) {
          // 确保小球在前，大球在后，保持一致性
          const ball1 = Math.min(currentFrontNumbers[j], currentFrontNumbers[k]);
          const ball2 = Math.max(currentFrontNumbers[j], currentFrontNumbers[k]);
          // 组合号使用数字格式，不需要补0
          currentFrontCombinations.push(`${ball1}-${ball2}`);
        }
      }
      
      // 检查前区是否包含我们关心的组合
      currentFrontCombinations.forEach(comb => {
        if (frontCombinations.includes(comb)) {
          // 获取下下下下下下下下期的前区号码
          let nextNextNextNextNextNextNextNextNumbers = [];
          try {
            // 使用processBalls函数处理号码，确保格式一致
            const processedBalls = processBalls(nextNextNextNextNextNextNextNextDraw.red);
            // 存储两位格式的号码，用于统计
            nextNextNextNextNextNextNextNextNumbers = processedBalls;
          } catch (e) {
            console.error('Error extracting next next next next next next next next draw red numbers:', e);
          }
          
          // 记录下下下下下下下下期的号码
          nextNextNextNextNextNextNextNextNumbers.forEach(num => {
            frontCombinationStats[comb].nextDrawNumbers.push(num); // 存储两位格式的号码
            frontCombinationStats[comb].numberCounts[num] = 
              (frontCombinationStats[comb].numberCounts[num] || 0) + 1;
          });
          
          // 记录组合出现的详细信息
          frontCombinationStats[comb].occurrenceDetails.push({
            currentPeriod: currentDraw.issue,
            currentDrawDate: currentDraw.draw_date || currentDraw.date || '',
            currentFrontNumbers: currentFrontNumbers,
            nextNextNextNextNextNextNextNextPeriod: nextNextNextNextNextNextNextNextDraw.issue,
            nextNextNextNextNextNextNextNextDrawDate: nextNextNextNextNextNextNextNextDraw.draw_date || nextNextNextNextNextNextNextNextDraw.date || '',
            nextNextNextNextNextNextNextNextFrontNumbers: nextNextNextNextNextNextNextNextNumbers
          });
          
          // 更新组合出现次数
          frontCombinationStats[comb].count++;
        }
      });
    }

      // 计算前区推荐杀号
    console.log('计算前区推荐杀号...');
    const frontNumberCounts = {}; // 前区1-35：记录每个号码在组合出现时下下下下下下下下期的出现次数
    for (let i = 1; i <= 35; i++) frontNumberCounts[i] = 0;
    
    // 统计组合出现时下下下下下下下下期号码的出现次数（基于前端表格显示的数据维度）
    console.log('开始统计组合出现时下下下下下下下下期号码的出现次数');
    
    // 遍历所有组合的统计数据
    Object.values(frontCombinationStats).forEach(combination => {
      // 获取当前组合对应的下下下下下下下下期号码列表
      const nextDrawNumbers = combination.nextDrawNumbers || [];
      
      // 统计每个号码出现的次数
      nextDrawNumbers.forEach(numStr => {
        const num = parseInt(numStr);
        if (frontNumberCounts.hasOwnProperty(num)) {
          frontNumberCounts[num]++;
        }
      });
    });
    
    // 输出号码统计结果（基于组合出现时下下下下下下下下期的维度）
    console.log('组合出现时下下下下下下下下期号码出现次数统计结果:', frontNumberCounts);
    
    // 只返回出现次数为0的号码作为杀号（符合用户需求）
    let recommendedFrontKillNumbers = Object.entries(frontNumberCounts)
      .filter(([num, count]) => count === 0)
      .map(([num]) => parseInt(num))
      .sort((a, b) => a - b);
    
    console.log('是否有出现次数为0的号码:', recommendedFrontKillNumbers.length > 0);
    
    console.log('前区推荐杀号计算完成(基于组合出现时下下下下下下下下期维度):', recommendedFrontKillNumbers);

    // 整理结果
    console.log('准备返回结果...');
    
    const result = {
      eighthLastDraw: {
        issue: eighthLastDraw.issue,
        drawDate: eighthLastDraw.draw_date || eighthLastDraw.date || new Date().toISOString().split('T')[0],
        firstZoneNumbers: frontNumbers
      },
      combinations: Object.values(frontCombinationStats),
      period: period,
      prediction: [], // 可以根据需要添加预测算法
      recommendedFrontKillNumbers: recommendedFrontKillNumbers // 返回前区推荐杀号
    };

    console.log('结果返回成功');
    return result;
  } catch (error) {
    console.error('倒数第8期前区两球组合分析出错:', error);
    console.error('错误堆栈:', error.stack);
    throw error;
  }
}

/**
 * 倒数第8期前区两球组合分析接口
 * @route GET /dao_shu_8_qi_liang_qiu_zu_he
 * @group 数据分析 - 倒数第8期前区两球组合分析相关接口
 * @param {string} period.query.required - 统计周期 (35, 50, 100, 200, 300, 500, 1000)
 * @returns {object} 200 - 成功响应，包含前区两球组合统计
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

    // 处理中文期数参数
    let processedPeriod = period;
    if (typeof period === 'string') {
      // 移除中文，只保留数字
      const numericPart = period.replace(/[^0-9]/g, '');
      if (numericPart) {
        processedPeriod = numericPart;
      } else if (period === '全部期') {
        processedPeriod = 'all';
      }
    }

    const result = await getEighthLastFrontZoneAnalysis(processedPeriod);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('路由处理错误:', error);
    res.status(500).json({
      success: false,
      message: error.message || '服务器内部错误'
    });
  }
});

module.exports = router;