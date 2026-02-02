// 参数说明: type - 期数类型（10, 30, 35, 50, 120, all）
// 接口功能: 从数据库查询指定期数的开奖数据

const express = require('express');
const { query } = require('./数据库配置.js');

const router = express.Router();

/**
 * 获取开奖数据接口
 * @param {string} type - 期数类型：10, 30, 35, 50, 120, all
 */
async function huo_qu_sql_shu_ju(req, res) {
  try {
    const { type = '10', startIssue, endIssue } = req.query;
    console.log('收到获取开奖数据请求，类型:', type, '开始期号:', startIssue, '结束期号:', endIssue);
    
    let sql = '';
    
    // 如果提供了开始期号和结束期号，使用期号范围查询
    if (startIssue && endIssue) {
      // 验证期号参数
      if (isNaN(startIssue) || isNaN(endIssue)) {
        return res.status(400).json({
          success: false,
          message: '期号必须是数字'
        });
      }
      
      if (parseInt(startIssue) > parseInt(endIssue)) {
        return res.status(400).json({
          success: false,
          message: '开始期号不能大于结束期号'
        });
      }
      
      // 构建期号范围查询SQL
      sql = `
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
        WHERE
          issue >= ? AND issue <= ?
        ORDER BY 
          draw_date DESC
      `;
      // 执行查询
      const rows = await query(sql, [startIssue, endIssue]);
      console.log('数据库查询结果:', rows.length, '条记录');
      
      // 处理数据格式
      const formattedData = rows.map(row => {
        // 解析红球数据
      let redBalls = [];
      const red = row.red;
      if (red) {
          try {
              if (Array.isArray(red)) {
                  redBalls = red;
              } else if (typeof red === 'string') {
                  // 移除可能的引号和方括号
                  const cleanStr = red.replace(/^["'\[](.*)["'\]]$/, '$1');
                  redBalls = cleanStr.split(/[,，]/).map(ball => ball.trim()).filter(ball => ball);
              }
          } catch (error) {
              console.error('解析红球数据异常:', error);
          }
      }
      
      // 解析蓝球数据
      let blueBalls = [];
      const blue = row.blue;
      if (blue) {
          try {
              if (Array.isArray(blue)) {
                  blueBalls = blue;
              } else if (typeof blue === 'string') {
                  // 移除可能的引号和方括号
                  const cleanStr = blue.replace(/^["'\[](.*)["'\]]$/, '$1');
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
      
      // 返回成功响应
      res.json({
        success: true,
        data: formattedData,
        message: '获取开奖数据成功'
      });
      return;
    }
    
    // 如果没有提供期号范围，使用原来的类型查询
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
    sql = `
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
      // 解析红球数据
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
                  // 移除可能的引号和方括号
                  const cleanStr = red.replace(/^["'\[](.*)["'\]]$/, '$1');
                  
                  // 尝试基本的逗号分割
                  redBalls = cleanStr.split(/[,，]/).map(ball => ball.trim()).filter(ball => ball);
              }
          } catch (error) {
              console.error('解析红球数据异常:', error);
          }
      }
      
      // 解析蓝球数据
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
                  // 移除可能的引号和方括号
                  const cleanStr = blue.replace(/^["'\[](.*)["'\]]$/, '$1');
                  
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
/**
 * 获取数据库开奖数据接口
 * 接口功能: 从数据库中查询指定条件的大乐透开奖数据
 * 
 * 请求示例 1 (按期数类型):
 * GET http://localhost:18892/huo_qu_sql_shu_ju?type=10
 * 
 * 请求示例 2 (按期号范围):
 * GET http://localhost:18892/huo_qu_sql_shu_ju?startIssue=25100&endIssue=25116
 * 
 * 响应格式说明:
 * 成功响应:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "issue": "25116",
 *       "redBalls": ["01", "05", "12", "23", "30"],
 *       "blueBalls": ["02", "07"],
 *       "weekday": "7",
 *       "sum": "71",
 *       "span": "29",
 *       "intervalRatio": "1:2:2",
 *       "parityRatio": "3:2"
 *     }
 *   ],
 *   "message": "获取开奖数据成功"
 * }
 * 
 * 失败响应:
 * {
 *   "success": false,
 *   "message": "获取开奖数据失败"
 * }
 */
router.get('/', huo_qu_sql_shu_ju);

module.exports = router;