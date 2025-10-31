// 参数说明: 无参数
// 接口功能: 获取数据库中存储的最新一期大乐透开奖信息

const express = require('express');
const cors = require('cors');
const { query } = require('./db.config');

const app = express();
const PORT = process.env.PORT || 18890;

// 配置CORS，允许所有来源的请求
app.use(cors());

// 解析JSON请求体
app.use(express.json());

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
      
      // 处理可能的字符串形式的号码数据
      if (typeof firstZoneNumbers === 'string') {
        // 尝试多种可能的字符串格式解析
        if (firstZoneNumbers.includes(',')) {
          firstZoneNumbers = firstZoneNumbers.split(',').map(num => num.trim());
        } else if (firstZoneNumbers.includes(' ')) {
          firstZoneNumbers = firstZoneNumbers.split(' ').filter(num => num.trim() !== '');
        } else {
          // 如果没有分隔符，尝试正则匹配数字
          firstZoneNumbers = (firstZoneNumbers.match(/\d+/g) || []).map(num => num);
        }
      }
      
      if (typeof lastZoneNumbers === 'string') {
        // 尝试多种可能的字符串格式解析
        if (lastZoneNumbers.includes(',')) {
          lastZoneNumbers = lastZoneNumbers.split(',').map(num => num.trim());
        } else if (lastZoneNumbers.includes(' ')) {
          lastZoneNumbers = lastZoneNumbers.split(' ').filter(num => num.trim() !== '');
        } else {
          // 如果没有分隔符，尝试正则匹配数字
          lastZoneNumbers = (lastZoneNumbers.match(/\d+/g) || []).map(num => num);
        }
      }
      
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
      
      // 创建响应数据
      responseData = {
        success: true,
        latestDraw: {
          period: drawData.issue,
          drawDate: formattedDate,
          firstZoneNumbers: firstZoneNumbers,
          lastZoneNumbers: lastZoneNumbers
        }
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
        mock: true
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
app.get('/sql_zui_xin_yi_qi', async (req, res) => {
  try {
    const result = await getLastDatabaseDrawInfo();
    res.json(result);
  } catch (error) {
    console.error('获取最新一期完整开奖数据失败:', error);
    res.json({ success: false, message: '抓取数据失败' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`最新开奖信息服务运行在 http://localhost:${PORT}`);
  console.log(`获取最新一期完整开奖信息接口: http://localhost:${PORT}/sql_zui_xin_yi_qi`);
});

module.exports = app;