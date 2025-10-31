const express = require('express');
const router = express.Router();
const { query } = require('./db.config.js');

// 获取lottery_results表的总条数
router.get('/huo_qu_lottery_results_total', async (req, res) => {
  try {
    // 查询总条数
    const sql = 'SELECT COUNT(*) AS total FROM lottery_results';
    const results = await query(sql);
    
    // 返回总条数
    const totalCount = results[0].total;
    res.json({ success: true, total: totalCount });
  } catch (error) {
    console.error('查询失败:', error);
    res.json({ success: false, message: '查询失败' });
  }
});

module.exports = router;
