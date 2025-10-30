// 参数说明: 无参数
// 接口功能: 获取数据库中存储的最新一期大乐透开奖期号

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
 * 获取数据库中的最后一期开奖期号
 * @returns {Promise<Object>} 包含最后一期期号的响应
 */
async function getLastDatabaseIssue() {
  try {
    console.log('执行数据库查询获取最后一期数据');
    // 使用draw_date字段排序，而不是issue字段，确保获取实际最新的开奖数据
    // 问题原因：issue字段格式不统一，导致CAST转换后的数值比较不准确
    const result = await query('SELECT issue FROM lottery_results ORDER BY draw_date DESC LIMIT 1');
    let responseData;
    
    if (result && result.length > 0) {
      responseData = { success: true, lastIssue: result[0].issue };
    } else {
      // 如果数据库中没有数据，返回一个默认值
      responseData = { success: true, lastIssue: '暂无数据', mock: true };
    }
    
    console.log('获取最后一期数据成功');
    
    return responseData;
  } catch (error) {
    console.error('获取最后一期数据失败:', error);
    return { success: false, message: error.message };
  }
}

/**
 * 获取数据库最后一期开奖期号接口
 * 接口功能: 获取数据库中存储的最新一期大乐透开奖期号，结果会被缓存
 * 
 * 请求示例:
 * GET http://localhost:18890/sql_zui_xin_yi_qi
 * 
 * 响应格式说明:
 * 成功响应:
 * {
 *   "success": true,
 *   "lastIssue": "25116"
 * }
 * 
 * 数据库为空响应:
 * {
 *   "success": true,
 *   "lastIssue": "暂无数据",
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
    const result = await getLastDatabaseIssue();
    res.json(result);
  } catch (error) {
    console.error('获取最后一期数据失败:', error);
    res.json({ success: false, message: '抓取数据失败' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`最新期号服务运行在 http://localhost:${PORT}`);
  console.log(`获取最后一期接口: http://localhost:${PORT}/sql_zui_xin_yi_qi`);
});

module.exports = app;