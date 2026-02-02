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
      // 完全重写号码处理逻辑，确保能正确处理所有类型的号码数据
      function extractNumbers(data) {
        if (!data) return [];
        
        // 将数据转换为字符串
        const dataStr = String(data);
        
        // 使用正则表达式提取所有数字
        const numbers = dataStr.match(/\d+/g) || [];
        
        return numbers;
      }
      
      // 提取前区和后区号码
      firstZoneNumbers = extractNumbers(fourthLastDraw.red);
      lastZoneNumbers = extractNumbers(fourthLastDraw.blue);
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