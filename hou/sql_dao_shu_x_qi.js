// 参数说明:
// - period: 必需，倒数期数，值可以是 1-20 之间的整数
// 接口功能: 获取倒数第X期的开奖信息
// 返回倒数第X期的开奖数据

const express = require('express');
const { query } = require('./数据库配置.js');

const router = express.Router();

/**
 * 获取倒数第X期的开奖信息
 * @param {number} period - 倒数期数（1-20）
 * @returns {Promise<Object>} 包含倒数第X期开奖信息的结果
 */
async function getXLastDrawInfo(period) {
  try {
    // 验证参数
    if (isNaN(period) || parseInt(period) < 1 || parseInt(period) > 20) {
      throw new Error('无效的倒数期数参数，必须是1-20之间的整数');
    }

    const x = parseInt(period);

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
    console.log('红球数据:', xLastDraw.red);
    console.log('蓝球数据:', xLastDraw.blue);
    
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
            return cleanBall ? parseInt(cleanBall) : null;
          })
          .filter(Boolean); // 过滤掉null值
      } else if (Array.isArray(balls)) {
        return balls.map(ball => {
          // 移除非数字字符，只保留数字
          const cleanBall = String(ball).replace(/[^\d]/g, '');
          return cleanBall ? parseInt(cleanBall) : null;
        }).filter(Boolean); // 过滤掉null值
      }
      return [];
    }

    // 解析前区号码（从red字段中获取）
    let frontNumbers = [];
    try {
      // 使用processBalls函数处理号码，确保格式一致
      frontNumbers = processBalls(xLastDraw.red);
      // 确保frontNumbers至少有一些号码，否则记录错误
      if (!frontNumbers.length) {
        console.error('Failed to extract valid front numbers from:', xLastDraw.red);
      }
    } catch (e) {
      console.error('Error extracting red numbers:', e);
    }

    // 解析后区号码（从blue字段中获取）
    let backNumbers = [];
    try {
      // 使用processBalls函数处理号码，确保格式一致
      backNumbers = processBalls(xLastDraw.blue);
      // 确保backNumbers至少有一些号码，否则记录错误
      if (!backNumbers.length) {
        console.error('Failed to extract valid back numbers from:', xLastDraw.blue);
      }
    } catch (e) {
      console.error('Error extracting blue numbers:', e);
    }

    // 整理结果
    const result = {
      period: xLastDraw.issue,
      drawDate: xLastDraw.draw_date || xLastDraw.date || new Date().toISOString().split('T')[0],
      firstZoneNumbers: frontNumbers,
      lastZoneNumbers: backNumbers
    };

    console.log('结果返回成功:', result);
    return result;
  } catch (error) {
    console.error('获取倒数第X期开奖信息出错:', error);
    console.error('错误堆栈:', error.stack);
    throw error;
  }
}

/**
 * 倒数第X期开奖信息接口
 * @route GET /sql_dao_shu_x_qi
 * @group 数据分析 - 倒数第X期开奖信息相关接口
 * @param {number} period.query.required - 倒数期数 (1-20)
 * @returns {object} 200 - 成功响应，包含倒数第X期开奖信息
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

    const result = await getXLastDrawInfo(period);
    
    res.status(200).json({
      success: true,
      xLastDraw: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || '服务器内部错误'
    });
  }
});

module.exports = router;