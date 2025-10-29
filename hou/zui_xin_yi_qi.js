// zui_xin_yi_qi.js - 获取最新一期开奖信息接口
// 功能: 从lottery_results表获取最新一期完整开奖信息

const express = require('express');
const { query } = require('./db.config');

const router = express.Router();

/**
 * 获取最新一期开奖信息接口
 * 接口功能: 从lottery_results表获取最新一期完整开奖信息
 * 
 * 请求示例:
 * GET http://localhost:18889/api/latest-lottery
 * 
 * 响应格式说明:
 * 成功响应:
 * {
 *   "code": 200,
 *   "data": {
 *     "period": "2025100",      // 期号
 *     "draw_date": "2025-10-20", // 开奖日期
 *     "front_balls": [1, 3, 5, 7, 9], // 前区号码
 *     "back_balls": [2, 4]       // 后区号码
 *   }
 * }
 * 
 * 失败响应:
 * {
 *   "code": 500,
 *   "message": "获取数据失败"
 * }
 */
router.get('/api/latest-lottery', async (req, res) => {
  try {
    console.log('开始获取最新一期开奖信息...');
    
    // 查询最新一期的开奖信息
    const sql = `
      SELECT 
        issue AS period,
        draw_date,
        red,
        blue
      FROM lottery_results 
      ORDER BY issue DESC 
      LIMIT 1
    `;
    
    const results = await query(sql);
    
    if (results && results.length > 0) {
      const latest = results[0];
      
      // 处理前区和后区号码，确保是数字数组
      let front_balls = [];
      let back_balls = [];
      
      // 尝试解析前区号码（处理数组格式的字符串）
      if (typeof latest.red === 'string') {
        // 处理 [x, x, x] 格式的字符串
        if (latest.red.startsWith('[') && latest.red.endsWith(']')) {
          const content = latest.red.substring(1, latest.red.length - 1);
          front_balls = content
            .split(',')
            .map(ball => parseInt(ball.trim(), 10))
            .filter(num => !isNaN(num));
        } else {
          // 直接按逗号分割
          front_balls = latest.red
            .split(',')
            .map(ball => parseInt(ball.trim(), 10))
            .filter(num => !isNaN(num));
        }
      }
      
      // 尝试解析后区号码（处理数组格式的字符串）
      if (typeof latest.blue === 'string') {
        // 处理 [x, x] 格式的字符串
        if (latest.blue.startsWith('[') && latest.blue.endsWith(']')) {
          const content = latest.blue.substring(1, latest.blue.length - 1);
          back_balls = content
            .split(',')
            .map(ball => parseInt(ball.trim(), 10))
            .filter(num => !isNaN(num));
        } else {
          // 直接按逗号分割
          back_balls = latest.blue
            .split(',')
            .map(ball => parseInt(ball.trim(), 10))
            .filter(num => !isNaN(num));
        }
      }
      
      // 格式化日期为 YYYY-MM-DD 格式
      let formattedDate = latest.draw_date;
      if (typeof formattedDate === 'string') {
        // 处理ISO格式日期
        if (formattedDate.includes('T')) {
          // 提取日期部分 YYYY-MM-DD
          formattedDate = formattedDate.split('T')[0];
        } else if (formattedDate.length === 10) {
          // 如果已经是 YYYY-MM-DD 格式，保持不变
        } else {
          // 尝试解析其他日期格式
          try {
            const date = new Date(formattedDate);
            formattedDate = date.toISOString().split('T')[0];
          } catch (e) {
            // 如果解析失败，保持原样
          }
        }
      } else if (formattedDate instanceof Date) {
        formattedDate = formattedDate.toISOString().split('T')[0];
      }
      
      const responseData = {
        code: 200,
        data: {
          period: latest.period,
          draw_date: formattedDate,
          front_balls: front_balls,
          back_balls: back_balls
        }
      };
      
      console.log('成功获取最新一期开奖信息:', JSON.stringify(responseData));
      res.json(responseData);
    } else {
      console.log('未找到开奖数据');
      res.json({
        code: 404,
        message: '未找到开奖数据'
      });
    }
  } catch (error) {
    console.error('获取最新一期开奖信息失败:', error);
    res.json({
      code: 500,
      message: '获取数据失败'
    });
  }
});

module.exports = router;