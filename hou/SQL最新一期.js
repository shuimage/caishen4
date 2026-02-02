// 参数说明: 无参数
// 接口功能: 获取数据库中存储的最新一期大乐透开奖信息

const express = require('express');
const { query } = require('./数据库配置.js');

// 创建路由器而不是完整的应用
const router = express.Router();

/**
 * 获取数据库中的最新一期开奖信息
 * @returns {Promise<Object>} 包含最新一期完整开奖信息的响应
 */
async function getLastDatabaseDrawInfo() {
  try {
    console.log('执行数据库查询获取最新一期完整开奖数据');
    // 查询最新一期的完整开奖信息，使用正确的字段名
    const result = await query('SELECT issue, draw_date, red, blue FROM lottery_results ORDER BY draw_date DESC LIMIT 1');
    let responseData;
    
    if (result && result.length > 0) {
      const drawData = result[0];
      
      // 获取前区号码和后区号码
      let firstZoneNumbers = drawData.red || [];
      let lastZoneNumbers = drawData.blue || [];
      
      console.log('前区号码:', firstZoneNumbers);
      console.log('后区号码:', lastZoneNumbers);
      
      // 格式化日期为YYYY-MM-DD格式
      let formattedDate = drawData.draw_date;
      if (formattedDate instanceof Date) {
        formattedDate = formattedDate.toISOString().split('T')[0];
      } else if (typeof formattedDate === 'string') {
        // 如果已经是字符串，尝试提取日期部分
        if (formattedDate.includes('T')) {
          formattedDate = formattedDate.split('T')[0];
        }
      }
      
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
      const finalFirstZoneNumbers = extractNumbers(drawData.red);
      const finalLastZoneNumbers = extractNumbers(drawData.blue);
      
      console.log('处理后的前区号码:', finalFirstZoneNumbers);
      console.log('处理后的后区号码:', finalLastZoneNumbers);
      
      // 创建响应数据
      responseData = {
        success: true,
        latestDraw: {
          period: drawData.issue,
          drawDate: formattedDate,
          firstZoneNumbers: finalFirstZoneNumbers,
          lastZoneNumbers: finalLastZoneNumbers
        },
        lastIssue: drawData.issue  // 添加lastIssue字段，供前端使用
      };
    } else {
      // 如果数据库中没有数据，返回空数据
      responseData = {
        success: true,
        latestDraw: {
          period: '暂无数据',
          drawDate: '暂无数据',
          firstZoneNumbers: [],
          lastZoneNumbers: []
        },
        mock: true,
        lastIssue: null  // 添加lastIssue字段，数据库为空时设为null
      };
    }
    
    console.log('获取最新一期完整开奖数据成功');
    console.log('返回数据:', JSON.stringify(responseData));
    
    return responseData;
  } catch (error) {
    console.error('获取最新一期完整开奖数据失败:', error);
    return { success: false, message: error.message };
  }
}

/**
 * 获取数据库最新一期完整开奖信息接口
 * 接口功能: 获取数据库中存储的最新一期大乐透完整开奖信息，包括期号、开奖日期、前区号码和后区号码
 * 
 * 请求示例:
 * GET http://localhost:18890/sql_zui_xin_yi_qi
 * 
 * 成功响应:
 * {
 *   "success": true,
 *   "latestDraw": {
 *     "period": "25120",
 *     "drawDate": "2025-10-22",
 *     "firstZoneNumbers": [1, 2, 3, 4, 5],
 *     "lastZoneNumbers": [6, 7]
 *   }
 * }
 * 
 * 数据库为空响应:
 * {
 *   "success": true,
 *   "latestDraw": {
 *     "period": "暂无数据",
 *     "drawDate": "暂无数据",
 *     "firstZoneNumbers": [],
 *     "lastZoneNumbers": []
 *   },
 *   "mock": true
 * }
 * 
 * 失败响应:
 * {
 *   "success": false,
 *   "message": "获取数据失败"
 * }
 */
// 定义获取最新一期完整开奖信息的路由
// 主路由处理 - 直接使用根路径，因为在server.js中会配置完整路径
router.get('/', async (req, res) => {
  try {
    console.log('收到获取最新一期数据库开奖信息请求');
    const responseData = await getLastDatabaseDrawInfo();
    
    if (responseData.success) {
      res.json(responseData);
    } else {
      // 确保返回正确的错误状态码
      res.status(500).json({
        success: false,
        message: responseData.message || '获取最新开奖信息失败',
        latestDraw: null
      });
    }
  } catch (error) {
    console.error('处理请求时发生错误:', error);
    // 统一错误响应格式
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      latestDraw: null
    });
  }
});

// 导出路由器
module.exports = router;