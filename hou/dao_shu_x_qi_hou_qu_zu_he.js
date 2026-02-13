// 参数说明:
// - period: 必需，查询周期，值可以是 "35", "50", "100", "200", "300", "500", "1000"
// - x_period: 必需，倒数期数，值可以是 1-20 之间的整数
// 接口功能: 分析倒数第X期后区两球组合在下下期的出现情况
// 返回倒数第X期后区两球组合的统计数据

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
 * 获取倒数第X期后区两球组合下下期出现统计数据
 * @param {string} period - 统计周期（35, 50, 100, 200, 300, 500, 1000）
 * @param {number} xPeriod - 倒数期数（1-20）
 * @returns {Promise<Object>} 包含后区两球组合统计的结果
 */
async function getXLastBackZoneAnalysis(period, xPeriod) {
  try {
    // 验证参数
    if (period !== 'all' && (isNaN(period) || parseInt(period) <= 0)) {
      throw new Error('无效的周期参数，必须是正整数或"all"');
    }

    if (isNaN(xPeriod) || parseInt(xPeriod) < 1 || parseInt(xPeriod) > 20) {
      throw new Error('无效的倒数期数参数，必须是1-20之间的整数');
    }

    const x = parseInt(xPeriod);

    // 获取倒数第X期的开奖数据
    console.log(`开始查询倒数第${x}期开奖数据...`);
    const xLastResultSql = `
      SELECT * 
      FROM lottery_results 
      ORDER BY issue DESC 
      LIMIT ${x-1}, 1
    `;
    
    const xLastResult = await query(xLastResultSql);
    console.log(`倒数第${x}期开奖数据查询完成`);
    
    if (!xLastResult || xLastResult.length === 0) {
      throw new Error(`未找到倒数第${x}期开奖数据`);
    }

    const xLastDraw = xLastResult[0];
    console.log(`获取到倒数第${x}期开奖期号:`, xLastDraw.issue);
    console.log('蓝球数据:', xLastDraw.blue);
    
    // 解析后区号码（从blue字段中获取）
    let backNumbers = [];
    try {
      // 使用processBalls函数处理号码，确保格式一致
      const processedBalls = processBalls(xLastDraw.blue);
      // 转换回数字数组，并过滤掉非数字值
      backNumbers = processedBalls.map(num => parseInt(num)).filter(num => !isNaN(num));
      // 确保backNumbers至少有一些号码，否则记录错误
      if (!backNumbers.length) {
        console.error('Failed to extract valid back numbers from:', xLastDraw.blue);
      }
    } catch (e) {
      console.error('Error extracting blue numbers:', e);
    }

    // 获取历史数据（用于统计）
    let historyData;
    console.log('准备查询历史数据，period:', period);
    // 直接使用查询，不使用参数化查询的LIMIT
    if (period === 'all') {
      // 查询所有历史数据（除了最新X期）
      const historySql = `
        SELECT * 
        FROM lottery_results 
        WHERE id < ${xLastDraw.id} 
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
        WHERE id < ${xLastDraw.id} 
        ORDER BY id ASC 
        LIMIT ${limit}
      `;
      historyData = await query(historySql);
      // 反转结果，按照id从大到小排序
      historyData = historyData.reverse();
    }
    console.log('历史数据查询完成，共获取', historyData.length, '条记录');

    // 生成倒数第X期后区号码的所有两球组合
    const backCombinations = [];
    for (let i = 0; i < backNumbers.length; i++) {
      for (let j = i + 1; j < backNumbers.length; j++) {
        // 确保小球在前，大球在后，保持一致性
        const ball1 = Math.min(backNumbers[i], backNumbers[j]);
        const ball2 = Math.max(backNumbers[i], backNumbers[j]);
        // 确保ball1和ball2都是有效的数字
        if (!isNaN(ball1) && !isNaN(ball2)) {
          backCombinations.push(`${ball1}-${ball2}`);
        }
      }
    }

    // 统计后区每个组合出现时下下下下下期的号码
    const backCombinationStats = {};
    backCombinations.forEach(combination => {
      backCombinationStats[combination] = {
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
      currentBackCombinations.forEach(comb => {
        if (backCombinations.includes(comb)) {
          // 获取下下下下下期的后区号码
          let nextNextNextNextNumbers = [];
          try {
            // 使用processBalls函数处理号码，确保格式一致
            const processedBalls = processBalls(nextNextNextNextDraw.blue);
            // 存储两位格式的号码，用于统计
            nextNextNextNextNumbers = processedBalls;
          } catch (e) {
            console.error('Error extracting next next next next draw blue numbers:', e);
          }
          
          // 记录下下下下下期的号码
          nextNextNextNextNumbers.forEach(num => {
            backCombinationStats[comb].nextDrawNumbers.push(num); // 存储两位格式的号码
            backCombinationStats[comb].numberCounts[num] = 
              (backCombinationStats[comb].numberCounts[num] || 0) + 1;
          });
          
          // 记录组合出现的详细信息
          backCombinationStats[comb].occurrenceDetails.push({
            currentPeriod: currentDraw.issue,
            currentDrawDate: currentDraw.draw_date || currentDraw.date || '',
            currentBackNumbers: currentBackNumbers,
            nextNextNextNextPeriod: nextNextNextNextDraw.issue,
            nextNextNextNextDrawDate: nextNextNextNextDraw.draw_date || nextNextNextNextDraw.date || '',
            nextNextNextNextBackNumbers: nextNextNextNextNumbers
          });
          
          // 更新组合出现次数
          backCombinationStats[comb].count++;
        }
      });
    }

      // 计算后区推荐杀号
    console.log('计算后区推荐杀号...');
    const backNumberCounts = {}; // 后区1-12：记录每个号码在组合出现时下下下下下期的出现次数
    for (let i = 1; i <= 12; i++) backNumberCounts[i] = 0;
    
    // 统计组合出现时下下下下下期号码的出现次数（基于前端表格显示的数据维度）
    console.log('开始统计组合出现时下下下下下期号码的出现次数');
    
    // 遍历所有组合的统计数据
    Object.values(backCombinationStats).forEach(combination => {
      // 获取当前组合对应的下下下下下期号码列表
      const nextDrawNumbers = combination.nextDrawNumbers || [];
      
      // 统计每个号码出现的次数
      nextDrawNumbers.forEach(numStr => {
        const num = parseInt(numStr);
        if (backNumberCounts.hasOwnProperty(num)) {
          backNumberCounts[num]++;
        }
      });
    });
    
    // 输出号码统计结果（基于组合出现时下下下下下期的维度）
    console.log('组合出现时下下下下下期号码出现次数统计结果:', backNumberCounts);
    
    // 只返回出现次数为0的号码作为杀号（符合用户需求）
    let recommendedBackKillNumbers = Object.entries(backNumberCounts)
      .filter(([num, count]) => count === 0)
      .map(([num]) => parseInt(num))
      .sort((a, b) => a - b);
    
    console.log('是否有出现次数为0的号码:', recommendedBackKillNumbers.length > 0);
    
    console.log('后区推荐杀号计算完成(基于组合出现时下下下下下期维度):', recommendedBackKillNumbers);

    // 整理结果
    console.log('准备返回结果...');
    
    const result = {
      xLastDraw: {
        issue: xLastDraw.issue,
        drawDate: xLastDraw.draw_date || xLastDraw.date || new Date().toISOString().split('T')[0],
        lastZoneNumbers: backNumbers
      },
      combinations: Object.values(backCombinationStats),
      period: period,
      x_period: x,
      prediction: [], // 可以根据需要添加预测算法
      recommendedBackKillNumbers: recommendedBackKillNumbers // 返回后区推荐杀号
    };

    console.log('结果返回成功');
    return result;
  } catch (error) {
    console.error('倒数第X期后区两球组合分析出错:', error);
    console.error('错误堆栈:', error.stack);
    throw error;
  }
}

/**
 * 倒数第X期后区两球组合分析接口
 * @route GET /dao_shu_x_qi_hou_qu_zu_he
 * @group 数据分析 - 倒数第X期后区两球组合分析相关接口
 * @param {string} period.query.required - 统计周期 (35, 50, 100, 200, 300, 500, 1000)
 * @param {number} x_period.query.required - 倒数期数 (1-20)
 * @returns {object} 200 - 成功响应，包含后区两球组合统计
 * @returns {object} 400 - 参数错误
 * @returns {object} 500 - 服务器内部错误
 */
router.get('/', async (req, res) => {
  try {
    const { period, x_period } = req.query;
    
    if (!period) {
      return res.status(400).json({
        success: false,
        message: '缺少必需参数：period'
      });
    }

    if (!x_period) {
      return res.status(400).json({
        success: false,
        message: '缺少必需参数：x_period'
      });
    }

    const result = await getXLastBackZoneAnalysis(period, x_period);
    
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