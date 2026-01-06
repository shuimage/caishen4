// 参数说明:
// 接口功能: 获取倒数第4期开奖数据
// 返回倒数第4期开奖信息

const express = require('express');
const cors = require('cors');
const { query } = require('./数据库配置.js');

const router = express.Router();

/**
 * 获取倒数第4期开奖数据
 * @returns {Promise<Object>} 包含倒数第4期开奖数据的结果
 */
async function getFourthLastDraw() {
  try {
    // 获取倒数第4期的开奖数据
    console.log('开始查询倒数第4期开奖数据...');
    const fourthLastResultSql = `
      SELECT * 
      FROM lottery_results 
      ORDER BY issue DESC 
      LIMIT 3, 1
    `;
    
    const fourthLastResult = await query(fourthLastResultSql);
    console.log('倒数第4期开奖数据查询完成');
    
    if (!fourthLastResult || fourthLastResult.length === 0) {
      throw new Error('未找到倒数第4期开奖数据');
    }
    
    const fourthLastDraw = fourthLastResult[0];
    
    // 解析前区和后区号码
    let firstZoneNumbers = [];
    let lastZoneNumbers = [];
    
    try {
      // 解析前区号码（从red字段中获取）
      if (Array.isArray(fourthLastDraw.red)) {
        firstZoneNumbers = fourthLastDraw.red.map(num => typeof num === 'string' ? parseInt(num) : num);
      } else if (typeof fourthLastDraw.red === 'string') {
        const numbers = fourthLastDraw.red.match(/\d+/g);
        if (numbers) {
          firstZoneNumbers = numbers.map(num => parseInt(num));
        }
      }
      
      // 解析后区号码（从blue字段中获取）
      if (Array.isArray(fourthLastDraw.blue)) {
        lastZoneNumbers = fourthLastDraw.blue.map(num => typeof num === 'string' ? parseInt(num) : num);
      } else if (typeof fourthLastDraw.blue === 'string') {
        const numbers = fourthLastDraw.blue.match(/\d+/g);
        if (numbers) {
          lastZoneNumbers = numbers.map(num => parseInt(num));
        }
      }
    } catch (e) {
      console.error('解析号码失败:', e);
    }
    
    // 整理结果
    const result = {
      success: true,
      fourthLastDraw: {
        period: fourthLastDraw.issue,
        drawDate: fourthLastDraw.draw_date || fourthLastDraw.date || '',
        firstZoneNumbers: firstZoneNumbers,
        lastZoneNumbers: lastZoneNumbers
      }
    };
    
    return result;
  } catch (error) {
    console.error('获取倒数第4期开奖数据出错:', error);
    console.error('错误堆栈:', error.stack);
    throw error;
  }
}

/**
 * SQL查询倒数第4期开奖数据接口
 * @route GET /sql_dao_shu_4_qi
 * @group 数据分析 - 倒数第4期开奖数据相关接口
 * @returns {object} 200 - 成功响应，包含倒数第4期开奖数据
 * @returns {object} 500 - 服务器内部错误
 */
router.get('/', async (req, res) => {
  try {
    const result = await getFourthLastDraw();
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || '服务器内部错误'
    });
  }
});

module.exports = router;