const express = require('express');
const router = express.Router();
const { query } = require('./数据库配置.js');

// 保存回测结果到数据库
router.post('/bao_cun_hui_ce_jie_guo', async (req, res) => {
  try {
    const { cache_key, backtest_results, current_period } = req.body;
    
    if (!cache_key || !backtest_results) {
      return res.status(400).json({ success: false, message: '缺少必要参数' });
    }
    
    // 检查是否已存在相同的缓存记录
    const checkSql = `
      SELECT id FROM backtest_results 
      WHERE cache_key = ?
    `;
    const checkResult = await query(checkSql, [cache_key]);
    
    if (checkResult && checkResult.length > 0) {
      // 更新现有记录
      const updateSql = `
        UPDATE backtest_results 
        SET backtest_results = ?, current_period = ?, updated_at = NOW() 
        WHERE cache_key = ?
      `;
      await query(updateSql, [JSON.stringify(backtest_results), current_period, cache_key]);
    } else {
      // 插入新记录
      const insertSql = `
        INSERT INTO backtest_results (cache_key, backtest_results, current_period, created_at, updated_at) 
        VALUES (?, ?, ?, NOW(), NOW())
      `;
      await query(insertSql, [cache_key, JSON.stringify(backtest_results), current_period]);
    }
    
    res.json({ success: true, message: '回测结果保存成功' });
  } catch (error) {
    console.error('保存回测结果失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误', error: error.message });
  }
});

// 从数据库获取回测结果
router.get('/huo_qu_hui_ce_jie_guo', async (req, res) => {
  try {
    const { cache_key } = req.query;
    
    if (!cache_key) {
      return res.status(400).json({ success: false, message: '缺少必要参数cache_key' });
    }
    
    const getSql = `
      SELECT backtest_results FROM backtest_results 
      WHERE cache_key = ?
    `;
    const result = await query(getSql, [cache_key]);
    
    if (result && result.length > 0) {
      const backtestResults = JSON.parse(result[0].backtest_results);
      res.json({ success: true, data: backtestResults });
    } else {
      res.json({ success: true, data: null });
    }
  } catch (error) {
    console.error('获取回测结果失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误', error: error.message });
  }
});

module.exports = router;