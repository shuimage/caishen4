// 只需要数据库查询功能，不需要Redis缓存
const express = require('express');
const router = express.Router();
const { query } = require('./数据库配置.js');

/**
 * 获取开奖数据接口
 * @param {string} type - 期数类型：10, 30, 35, 50, 120
 */
async function getLotteryResults(req, res) {
  try {
    const { type = '10' } = req.query;
    console.log('收到获取开奖数据请求，类型:', type);
    
    // 验证期数类型参数
    const validTypes = ['10', '30', '35', '50', '120', 'all'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: '无效的期数类型'
      });
    }
    
    // 根据类型确定查询的期数
    let limitClause = '';
    if (type !== 'all') {
      const limit = parseInt(type);
      limitClause = `LIMIT ${limit}`;
    }
    
    // 简化SQL查询
    const sql = `
      SELECT 
        issue, 
        red,
        blue,
        week,
        sum,
        span,
        area_ratio,
        odd_even_ratio
      FROM 
        lottery_results 
      ORDER BY 
        draw_date DESC 
      ${limitClause}
    `;
    
    // 执行查询
    const rows = await query(sql);
    console.log('数据库查询结果:', rows.length, '条记录');
    
    // 处理数据格式
    const formattedData = rows.map(row => {
      // 解析红球数据 - 更简单直接的实现
        let redBalls = [];
        const red = row.red;
        if (red) {
            try {
                // 记录原始数据，帮助调试
                console.log('原始红球数据:', red, '类型:', typeof red);
                
                // 处理各种可能的数据格式
                if (Array.isArray(red)) {
                    redBalls = red;
                } else if (typeof red === 'string') {
                    // 移除可能的引号
                    const cleanStr = red.replace(/^["'](.*)["']$/, '$1');
                    
                    // 尝试基本的逗号分割
                    redBalls = cleanStr.split(/[,，]/).map(ball => ball.trim()).filter(ball => ball);
                }
            } catch (error) {
                console.error('解析红球数据异常:', error);
            }
        }
        
        // 解析蓝球数据 - 更简单直接的实现
        let blueBalls = [];
        const blue = row.blue;
        if (blue) {
            try {
                // 记录原始数据，帮助调试
                console.log('原始蓝球数据:', blue, '类型:', typeof blue);
                
                // 处理各种可能的数据格式
                if (Array.isArray(blue)) {
                    blueBalls = blue;
                } else if (typeof blue === 'string') {
                    // 移除可能的引号
                    const cleanStr = blue.replace(/^["'](.*)["']$/, '$1');
                    
                    // 尝试基本的逗号分割
                    blueBalls = cleanStr.split(/[,，]/).map(ball => ball.trim()).filter(ball => ball);
                }
            } catch (error) {
                console.error('解析蓝球数据异常:', error);
            }
        }
      
      return {
        issue: row.issue,
        redBalls: redBalls,
        blueBalls: blueBalls,
        weekday: row.week || '',
        sum: row.sum || '',
        span: row.span || '',
        intervalRatio: row.area_ratio || '',
        parityRatio: row.odd_even_ratio || ''
      };
    });
    
    // 数据已经按draw_date DESC排序，保持最新的期数在前面，不需要反转
    
    // 返回成功响应
    res.json({
      success: true,
      data: formattedData,
      message: '获取开奖数据成功'
    });
  } catch (error) {
    console.error('获取开奖数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取开奖数据失败',
      error: error.message
    });
  }
}

// 导出接口函数
// 设置路由
router.get('/getLotteryResults', getLotteryResults);

module.exports = router;