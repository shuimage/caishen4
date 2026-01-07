// 参数说明:
// - period: 必需，查询周期，值可以是 "35", "50", "100", "200", "300", "500", "1000"
// 接口功能: 分析倒数第5期前区两球组合在下下期的出现情况
// 返回倒数第5期前区两球组合的统计数据

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
      .map(ball => String(ball).padStart(2, '0'));
  } else if (Array.isArray(balls)) {
    return balls.map(ball => String(ball).padStart(2, '0'));
  }
  return [];
}


/**
 * 获取倒数第5期前区两球组合下下期出现统计数据
 * @param {string} period - 统计周期（35, 50, 100, 200, 300, 500, 1000）
 * @returns {Promise<Object>} 包含前区两球组合统计的结果
 */
async function getFifthLastFrontZoneAnalysis(period) {
  try {
    // 验证参数
    if (period !== 'all' && (isNaN(period) || parseInt(period) <= 0)) {
      throw new Error('无效的周期参数，必须是正整数或"all"');
    }

    // 获取倒数第5期的开奖数据
    console.log('开始查询倒数第5期开奖数据...');
    const fifthLastResultSql = `
      SELECT * 
      FROM lottery_results 
      ORDER BY issue DESC 
      LIMIT 4, 1
    `;
    
    const fifthLastResult = await query(fifthLastResultSql);
    console.log('倒数第5期开奖数据查询完成');
    
    if (!fifthLastResult || fifthLastResult.length === 0) {
      throw new Error('未找到倒数第5期开奖数据');
    }

    const fifthLastDraw = fifthLastResult[0];
    console.log('获取到倒数第5期开奖期号:', fifthLastDraw.issue);
    console.log('红球数据:', fifthLastDraw.red);
    
    // 解析前区号码（从red字段中获取）
    let frontNumbers = [];
    try {
      // 使用processBalls函数处理号码，确保格式一致
      const processedBalls = processBalls(fifthLastDraw.red);
      // 转换回数字数组
      frontNumbers = processedBalls.map(num => parseInt(num));
      // 确保frontNumbers至少有一些号码，否则记录错误
      if (!frontNumbers.length) {
        console.error('Failed to extract front numbers from:', fifthLastDraw.red);
      }
    } catch (e) {
      console.error('Error extracting red numbers:', e);
    }

    // 获取历史数据（用于统计）
    let historyData;
    console.log('准备查询历史数据，period:', period);
    // 直接使用查询，不使用参数化查询的LIMIT
    if (period === 'all') {
      // 查询所有历史数据（除了最新五期）
      const historySql = `
        SELECT * 
        FROM lottery_results 
        WHERE id < ${fifthLastDraw.id} 
        ORDER BY id ASC
      `;
      historyData = await query(historySql);
      // 反转结果，按照id从大到小排序
      historyData = historyData.reverse();
    } else {
      // 查询指定周期内的历史数据
      const limit = parseInt(period) * 2; // 查询period*2期，确保有足够数据计算下下下下下期
      const historySql = `
        SELECT *, bian_hao 
        FROM lottery_results 
        WHERE id < ${fifthLastDraw.id} 
        ORDER BY id ASC 
        LIMIT ${limit}
      `;
      historyData = await query(historySql);
      // 反转结果，按照id从大到小排序
      historyData = historyData.reverse();
    }
    console.log('历史数据查询完成，共获取', historyData.length, '条记录');

    // 生成倒数第5期前区号码的所有两球组合
    const frontCombinations = [];
    for (let i = 0; i < frontNumbers.length; i++) {
      for (let j = i + 1; j < frontNumbers.length; j++) {
        // 确保小球在前，大球在后，保持一致性
        const ball1 = Math.min(frontNumbers[i], frontNumbers[j]);
        const ball2 = Math.max(frontNumbers[i], frontNumbers[j]);
        frontCombinations.push(`${ball1}-${ball2}`);
      }
    }

    // 统计前区每个组合出现时下下下下下期的号码
    const frontCombinationStats = {};
    frontCombinations.forEach(combination => {
      frontCombinationStats[combination] = {
        combo: combination,
        count: 0,
        nextDrawNumbers: [], // 存储这个组合出现时下下下下下期开出的号码
        numberCounts: {}, // 统计每个号码出现的次数
        occurrenceDetails: [] // 存储组合出现时的期号和下下下下下期信息
      };
    });

    // 创建bian_hao到数据的映射，用于快速查找下下下下下期数据
    const numericBianHaoToDataMap = new Map();
    historyData.forEach(row => {
      if (row.bian_hao) {
        // 从bian_hao字符串中提取数字部分
        const numericBianHao = parseInt(row.bian_hao.replace(/[^0-9]/g, ''));
        numericBianHaoToDataMap.set(numericBianHao, row);
      }
    });

    // 遍历历史数据，查找组合出现的位置，并记录下下下下下期的号码
    // 使用bian_hao字段计算下下下下下期，而不是依赖索引
    for (let i = 0; i < historyData.length; i++) { // 从i=0开始，不跳过任何记录
      const currentDraw = historyData[i];  // 当前期（组合出现的期数）
      
      // 确保currentDraw有bian_hao字段
      if (!currentDraw.bian_hao) continue;
      
      // 从当前bian_hao中提取数字部分
      const currentNumericBianHao = parseInt(currentDraw.bian_hao.replace(/[^0-9]/g, ''));
      
      // 计算下下下下下期的数字bian_hao（当前期+5）
      const nextNextNextNextNumericBianHao = currentNumericBianHao + 5;
      
      // 查找下下下下下期数据
      const nextNextNextNextDraw = numericBianHaoToDataMap.get(nextNextNextNextNumericBianHao);
      
      // 确保下下下下下期数据存在
      if (!nextNextNextNextDraw) continue;
      
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
          // 获取下下下下下期的前区号码
          let nextNextNextNextNumbers = [];
          try {
            // 使用processBalls函数处理号码，确保格式一致
            const processedBalls = processBalls(nextNextNextNextDraw.red);
            // 存储两位格式的号码，用于统计
            nextNextNextNextNumbers = processedBalls;
          } catch (e) {
            console.error('Error extracting next next next next draw red numbers:', e);
          }
          
          // 记录下下下下下期的号码
          nextNextNextNextNumbers.forEach(num => {
            frontCombinationStats[comb].nextDrawNumbers.push(num); // 存储两位格式的号码
            frontCombinationStats[comb].numberCounts[num] = 
              (frontCombinationStats[comb].numberCounts[num] || 0) + 1;
          });
          
          // 记录组合出现的详细信息
          frontCombinationStats[comb].occurrenceDetails.push({
            currentPeriod: currentDraw.issue,
            currentDrawDate: currentDraw.draw_date || currentDraw.date || '',
            currentFrontNumbers: currentFrontNumbers,
            nextNextNextNextPeriod: nextNextNextNextDraw.issue,
            nextNextNextNextDrawDate: nextNextNextNextDraw.draw_date || nextNextNextNextDraw.date || '',
            nextNextNextNextFrontNumbers: nextNextNextNextNumbers
          });
          
          // 更新组合出现次数
          frontCombinationStats[comb].count++;
        }
      });
    }

      // 计算前区推荐杀号
    console.log('计算前区推荐杀号...');
    const frontNumberCounts = {}; // 前区1-35：记录每个号码在组合出现时下下下下下期的出现次数
    for (let i = 1; i <= 35; i++) frontNumberCounts[i] = 0;
    
    // 统计组合出现时下下下下下期号码的出现次数（基于前端表格显示的数据维度）
    console.log('开始统计组合出现时下下下下下期号码的出现次数');
    
    // 遍历所有组合的统计数据
    Object.values(frontCombinationStats).forEach(combination => {
      // 获取当前组合对应的下下下下下期号码列表
      const nextDrawNumbers = combination.nextDrawNumbers || [];
      
      // 统计每个号码出现的次数
      nextDrawNumbers.forEach(numStr => {
        const num = parseInt(numStr);
        if (frontNumberCounts.hasOwnProperty(num)) {
          frontNumberCounts[num]++;
        }
      });
    });
    
    // 输出号码统计结果（基于组合出现时下下下下下期的维度）
    console.log('组合出现时下下下下下期号码出现次数统计结果:', frontNumberCounts);
    
    // 只返回出现次数为0的号码作为杀号（符合用户需求）
    let recommendedFrontKillNumbers = Object.entries(frontNumberCounts)
      .filter(([num, count]) => count === 0)
      .map(([num]) => parseInt(num))
      .sort((a, b) => a - b);
    
    console.log('是否有出现次数为0的号码:', recommendedFrontKillNumbers.length > 0);
    
    console.log('前区推荐杀号计算完成(基于组合出现时下下下下下期维度):', recommendedFrontKillNumbers);

    // 整理结果
    console.log('准备返回结果...');
    
    const result = {
      fifthLastDraw: {
        issue: fifthLastDraw.issue,
        drawDate: fifthLastDraw.draw_date || fifthLastDraw.date || new Date().toISOString().split('T')[0],
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
    console.error('倒数第5期前区两球组合分析出错:', error);
    console.error('错误堆栈:', error.stack);
    throw error;
  }
}

/**
 * 倒数第5期前区两球组合分析接口
 * @route GET /dao_shu_5_qi_liang_qiu_zu_he
 * @group 数据分析 - 倒数第5期前区两球组合分析相关接口
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

    const result = await getFifthLastFrontZoneAnalysis(period);
    
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