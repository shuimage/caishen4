// 参数说明:
// - period: 必需，查询周期，值可以是 "35", "50", "100", "200", "300", "500", "1000"
// 接口功能: 分析倒数第9期后区两球组合在下下下下下下下下下期的出现情况
// 返回倒数第9期后区两球组合的统计数据

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
 * 获取倒数第9期后区两球组合下下下下下下下下下期出现统计数据
 * @param {string} period - 统计周期（35, 50, 100, 200, 300, 500, 1000）
 * @returns {Promise<Object>} 包含后区两球组合统计的结果
 */
async function getNinthLastBackZoneAnalysis(period) {
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

    // 获取倒数第9期的开奖数据
    console.log('开始查询倒数第9期开奖数据...');
    const ninthLastResultSql = `
      SELECT * 
      FROM lottery_results 
      ORDER BY issue DESC 
      LIMIT 8, 1
    `;
    
    const ninthLastResult = await query(ninthLastResultSql);
    console.log('倒数第9期开奖数据查询完成');
    
    if (!ninthLastResult || ninthLastResult.length === 0) {
      throw new Error('未找到倒数第9期开奖数据');
    }

    const ninthLastDraw = ninthLastResult[0];
    console.log('获取到倒数第9期开奖期号:', ninthLastDraw.issue);
    console.log('蓝球数据:', ninthLastDraw.blue);
    
    // 解析后区号码（从blue字段中获取）
    let backNumbers = [];
    try {
      // 使用processBalls函数处理号码，确保格式一致
      const processedBalls = processBalls(ninthLastDraw.blue);
      // 转换回数字数组，并过滤掉非数字值
      backNumbers = processedBalls.map(num => parseInt(num)).filter(num => !isNaN(num));
      // 确保backNumbers至少有一些号码，否则记录错误
      if (!backNumbers.length) {
        console.error('Failed to extract valid back numbers from:', ninthLastDraw.blue);
      }
    } catch (e) {
      console.error('Error extracting blue numbers:', e);
    }

    // 获取历史数据（用于统计）
    let historyData;
    console.log('准备查询历史数据，period:', processedPeriod);
    // 直接使用查询，不使用参数化查询的LIMIT
    if (processedPeriod === 'all') {
      // 查询所有历史数据
      const historySql = `
        SELECT * 
        FROM lottery_results 
        ORDER BY issue DESC
      `;
      historyData = await query(historySql);
    } else {
      // 查询指定周期内的历史数据
      const limit = parseInt(processedPeriod); // 只查询需要的期数
      const historySql = `
        SELECT *, bian_hao 
        FROM lottery_results 
        ORDER BY issue DESC 
        LIMIT ${limit}
      `;
      historyData = await query(historySql);
    }
    console.log('历史数据查询完成，共获取', historyData.length, '条记录');

    // 只生成倒数9期后区开奖号码的两球组合
    const backCombinations = [];
    for (let i = 0; i < backNumbers.length; i++) {
      for (let j = i + 1; j < backNumbers.length; j++) {
        // 确保小球在前，大球在后，保持一致性
        const ball1 = Math.min(backNumbers[i], backNumbers[j]);
        const ball2 = Math.max(backNumbers[i], backNumbers[j]);
        backCombinations.push(`${ball1}-${ball2}`);
      }
    }
    
    // 去重，确保每个组合只出现一次
    const uniqueBackCombinations = [...new Set(backCombinations)];
    backCombinations.length = 0;
    backCombinations.push(...uniqueBackCombinations);

    // 统计后区每个组合出现时下下下下下下下下下期的号码
    const backCombinationStats = {};
    backCombinations.forEach(combination => {
      backCombinationStats[combination] = {
        combo: combination,
        count: 0,
        nextDrawNumbers: [], // 存储这个组合出现时下下下下下下下下下期开出的号码
        numberCounts: {}, // 统计每个号码出现的次数
        occurrenceDetails: [] // 存储组合出现时的期号和下下下下下下下下下期信息
      };
    });

    // 遍历历史数据，查找组合出现的位置，并记录下下下下下下下下下期的号码
    // 使用bian_hao +9的方式来查找下下下下下下下下下期
    for (const currentDraw of historyData) { // 遍历所有记录
      // 解析当前期的后区号码
      let currentBackNumbers = [];
      try {
        // 使用processBalls函数处理号码，确保格式一致
        const processedBalls = processBalls(currentDraw.blue);
        // 转换回数字数组
        currentBackNumbers = processedBalls.map(num => parseInt(num));
      } catch (e) {
        console.error('Error extracting current draw blue numbers:', e);
      }
      
      // 生成当前期后区的所有两球组合
      const currentBackCombinations = [];
      for (let j = 0; j < currentBackNumbers.length; j++) {
        for (let k = j + 1; k < currentBackNumbers.length; k++) {
          // 确保小球在前，大球在后，保持一致性
          const ball1 = Math.min(currentBackNumbers[j], currentBackNumbers[k]);
          const ball2 = Math.max(currentBackNumbers[j], currentBackNumbers[k]);
          // 组合号使用数字格式，不需要补0
          currentBackCombinations.push(`${ball1}-${ball2}`);
        }
      }
      
      // 检查后区是否包含我们关心的组合
      for (const comb of currentBackCombinations) {
        if (backCombinations.includes(comb)) {
          // 计算下下下下下下下下下期的bian_hao（bian_hao +9）
          if (currentDraw.bian_hao) {
            // 提取bian_hao中的数字部分
            const prefix = currentDraw.bian_hao.substring(0, 2); // 提取前缀，如"LT"
            const numberStr = currentDraw.bian_hao.substring(2); // 提取数字部分
            const number = parseInt(numberStr, 10); // 转换为数字
            
            if (!isNaN(number)) {
              // 计算下下下下下下下下下期的bian_hao（+9）
              const nextNextNextNextNextNextNextNextNumber = number + 9;
              const nextNextNextNextNextNextNextNextBianHao = prefix + String(nextNextNextNextNextNextNextNextNumber).padStart(5, '0');
              console.log('当前bian_hao:', currentDraw.bian_hao, '下下下下下下下下下期bian_hao:', nextNextNextNextNextNextNextNextBianHao);
              
              // 查询下下下下下下下下下期的数据
              const nextNextNextNextNextNextNextNextData = await query(
                'SELECT issue, blue, draw_date FROM lottery_results WHERE bian_hao = ?',
                [nextNextNextNextNextNextNextNextBianHao]
              );
              
              if (nextNextNextNextNextNextNextNextData && nextNextNextNextNextNextNextNextData.length > 0) {
                const nextNextNextNextNextNextNextNextDraw = nextNextNextNextNextNextNextNextData[0];
                
                // 获取下下下下下下下下下期的后区号码
                let nextNextNextNextNextNextNextNextNumbers = [];
                try {
                  // 使用processBalls函数处理号码，确保格式一致
                  const processedBalls = processBalls(nextNextNextNextNextNextNextNextDraw.blue);
                  // 存储两位格式的号码，用于统计
                  nextNextNextNextNextNextNextNextNumbers = processedBalls;
                } catch (e) {
                  console.error('Error extracting next next next next next next next next draw blue numbers:', e);
                }
                
                // 记录下下下下下下下下下期的号码
                nextNextNextNextNextNextNextNextNumbers.forEach(num => {
                  backCombinationStats[comb].nextDrawNumbers.push(num); // 存储两位格式的号码
                  backCombinationStats[comb].numberCounts[num] = 
                    (backCombinationStats[comb].numberCounts[num] || 0) + 1;
                });
                
                // 记录组合出现的详细信息
                backCombinationStats[comb].occurrenceDetails.push({
                  currentPeriod: currentDraw.issue,
                  currentDrawDate: currentDraw.draw_date || currentDraw.date || '',
                  currentBackNumbers: currentBackNumbers,
                  nextNextNextNextNextNextNextNextNextPeriod: nextNextNextNextNextNextNextNextDraw.issue,
                  nextNextNextNextNextNextNextNextNextDrawDate: nextNextNextNextNextNextNextNextDraw.draw_date || nextNextNextNextNextNextNextNextDraw.date || '',
                  nextNextNextNextNextNextNextNextNextBackNumbers: nextNextNextNextNextNextNextNextNumbers
                });
                
                // 更新组合出现次数
                backCombinationStats[comb].count++;
              } else {
                console.log('未找到下下下下下下下下下期数据，bian_hao:', nextNextNextNextNextNextNextNextBianHao);
              }
            } else {
              console.error('无法解析bian_hao数字部分:', currentDraw.bian_hao);
            }
          } else {
            console.error('当前记录缺少bian_hao:', currentDraw);
          }
        }
      }
    }

      // 计算后区推荐杀号
    console.log('计算后区推荐杀号...');
    const backNumberCounts = {}; // 后区1-12：记录每个号码在组合出现时下下下下下下下下下期的出现次数
    for (let i = 1; i <= 12; i++) backNumberCounts[i] = 0;
    
    // 统计组合出现时下下下下下下下下下期号码的出现次数（基于前端表格显示的数据维度）
    console.log('开始统计组合出现时下下下下下下下下下期号码的出现次数');
    
    // 遍历所有组合的统计数据
    Object.values(backCombinationStats).forEach(combination => {
      // 获取当前组合对应的下下下下下下下下下期号码列表
      const nextDrawNumbers = combination.nextDrawNumbers || [];
      
      // 统计每个号码出现的次数
      nextDrawNumbers.forEach(numStr => {
        const num = parseInt(numStr);
        if (backNumberCounts.hasOwnProperty(num)) {
          backNumberCounts[num]++;
        }
      });
    });
    
    // 输出号码统计结果（基于组合出现时下下下下下下下下下期的维度）
    console.log('组合出现时下下下下下下下下下期号码出现次数统计结果:', backNumberCounts);
    
    // 只返回出现次数为0的号码作为杀号（符合用户需求）
    let recommendedBackKillNumbers = Object.entries(backNumberCounts)
      .filter(([num, count]) => count === 0)
      .map(([num]) => parseInt(num))
      .sort((a, b) => a - b);
    
    console.log('是否有出现次数为0的号码:', recommendedBackKillNumbers.length > 0);
    
    console.log('后区推荐杀号计算完成(基于组合出现时下下下下下下下下下期维度):', recommendedBackKillNumbers);

    // 整理结果
    console.log('准备返回结果...');
    
    const result = {
      ninthLastDraw: {
        issue: ninthLastDraw.issue,
        drawDate: ninthLastDraw.draw_date || ninthLastDraw.date || new Date().toISOString().split('T')[0],
        lastZoneNumbers: backNumbers
      },
      combinations: Object.values(backCombinationStats),
      period: period,
      prediction: [], // 可以根据需要添加预测算法
      recommendedBackKillNumbers: recommendedBackKillNumbers // 返回后区推荐杀号
    };

    console.log('结果返回成功');
    return result;
  } catch (error) {
    console.error('倒数第9期后区两球组合分析出错:', error);
    console.error('错误堆栈:', error.stack);
    throw error;
  }
}

/**
 * 倒数第9期后区两球组合分析接口
 * @route GET /dao_shu_9_qi_hou_qu_liang_qiu_zu_he
 * @group 数据分析 - 倒数第9期后区两球组合分析相关接口
 * @param {string} period.query.required - 统计周期 (35, 50, 100, 200, 300, 500, 1000)
 * @returns {object} 200 - 成功响应，包含后区两球组合统计
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

    const result = await getNinthLastBackZoneAnalysis(processedPeriod);
    
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