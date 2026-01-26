const express = require('express');
const router = express.Router();
const { query } = require('./数据库配置.js');

// 还原九转连环图接口
router.get('/', async (req, res) => {
  try {
    // 获取查询参数
    const { period = '100' } = req.query;
    
    console.log('还原九转连环图请求，统计期数:', period);
    
    // 构建SQL查询
    let sql = `
      SELECT 
        issue, 
        red AS firstZoneNumbers, 
        blue AS secondZoneNumbers
      FROM 
        lottery_results 
      ORDER BY issue DESC
    `;
    
    // 只有当period不是'all'时，才添加LIMIT子句
    if (period !== 'all') {
      sql += ` LIMIT ${parseInt(period)}`;
    }
    
    console.log('SQL查询语句:', sql);
    
    // 执行查询
    const results = await query(sql);
    
    console.log('查询结果数量:', results.length);
    
    // 处理结果数据
    const processedResults = results.map(item => {
      // 确保红球和蓝球数据是字符串
      const firstZoneStr = typeof item.firstZoneNumbers === 'string' ? item.firstZoneNumbers : String(item.firstZoneNumbers);
      const secondZoneStr = typeof item.secondZoneNumbers === 'string' ? item.secondZoneNumbers : String(item.secondZoneNumbers);
      
      // 解析红球和蓝球数据
      const firstZoneNumbers = firstZoneStr
        .match(/\d+/g)
        .map(num => parseInt(num))
        .sort((a, b) => a - b);
      
      const secondZoneNumbers = secondZoneStr
        .match(/\d+/g)
        .map(num => parseInt(num))
        .sort((a, b) => a - b);
      
      return {
        issue: item.issue,
        firstZoneNumbers,
        secondZoneNumbers
      };
    });
    
    // 返回成功响应
    res.json({
      success: true,
      message: '获取还原九转连环图数据成功',
      data: processedResults
    });
  } catch (error) {
    console.error('获取还原九转连环图数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取还原九转连环图数据失败',
      error: error.message
    });
  }
});

module.exports = router;
