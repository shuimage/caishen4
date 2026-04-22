const express = require('express');
const router = express.Router();
const { getDB } = require('./数据库配置.js');

/**
 * 获取开奖数据接口
 * @param {string} type - 期数类型：10, 30, 35, 50, 120, all, 或中文：最近 10 期，最近 30 期等
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
      
      // 构建期号范围查询 SQL
      sql = `
        SELECT 
          issue, 
          red,
          blue,
          week,
          sum,
          span
        FROM lottery_results
        WHERE issue >= ? AND issue <= ?
        ORDER BY issue DESC
      `;
      
      const db = await getDB();
      const results = await db.all(sql, [parseInt(startIssue), parseInt(endIssue)]);
      
      return res.json({
        success: true,
        data: results.map(row => ({
          issue: row.issue.toString(),
          redBalls: row.red.split(' '),
          blueBalls: row.blue.split(' '),
          weekday: row.week.toString(),
          sum: row.sum.toString(),
          span: row.span.toString()
        })),
        message: '获取开奖数据成功'
      });
    }
    
    // 如果没有提供期号范围，使用原来的类型查询
    // 验证期数类型参数，支持中文类型
    let normalizedType = type;
    const typeMap = {
      '最近 10 期': '10',
      '最近 30 期': '30', 
      '最近 35 期': '35',
      '最近 50 期': '50',
      '最近 120 期': '120',
      '全部': 'all'
    };
    
    // 转换中文类型到数字类型
    if (typeMap[type]) {
      normalizedType = typeMap[type];
      console.log('转换中文类型:', type, '->', normalizedType);
    }
    
    const validTypes = ['10', '30', '35', '50', '120', 'all'];
    if (!validTypes.includes(normalizedType)) {
      return res.status(400).json({
        success: false,
        message: '无效的期数类型'
      });
    }
    
    // 根据类型确定查询的期数
    let limitClause = '';
    if (normalizedType !== 'all') {
      const limit = parseInt(normalizedType);
      limitClause = `LIMIT ${limit}`;
    }
    
    sql = `
      SELECT 
        issue, 
        red,
        blue,
        week,
        sum,
        span
      FROM lottery_results
      ORDER BY issue DESC
      ${limitClause}
    `;
    
    const db = await getDB();
    const results = await db.all(sql);
    
    res.json({
      success: true,
      data: results.map(row => ({
        issue: row.issue.toString(),
        redBalls: row.red.split(' '),
        blueBalls: row.blue.split(' '),
        weekday: row.week.toString(),
        sum: row.sum.toString(),
        span: row.span.toString()
      })),
      message: '获取开奖数据成功'
    });
  } catch (error) {
    console.error('获取开奖数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取开奖数据失败'
    });
  }
}

router.get('/', huo_qu_sql_shu_ju);

module.exports = router;
