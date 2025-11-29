const express = require('express');
const cors = require('cors');
const { query } = require('./数据库配置.js');
// 导入新的倒数2期两球组合详情API
const daoShu2QiLiangQiuZuHeXiangQingAPI = require('./新倒数2期两球组合详情服务器.js');
const app = express();
const PORT = 18890;

// 配置中间件
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// 记录请求日志的中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: err.message
  });
});

// 1. 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: '统一主服务器运行正常',
    timestamp: new Date().toISOString()
  });
});

// 2. SQL最新一期接口 (原18889端口)
app.get('/sql_zui_xin_yi_qi', async (req, res) => {
  try {
    console.log('查询最新一期开奖信息...');
    const result = await query('SELECT * FROM lottery_results ORDER BY draw_date DESC LIMIT 1');
    
    if (result && result.length > 0) {
      const data = result[0];
      // 格式化数据
      const formattedData = {
        draw_num: data.draw_num,
        draw_date: data.draw_date,
        front_numbers: data.front_numbers ? data.front_numbers.split(',').map(n => Number(n)) : [],
        back_numbers: data.back_numbers ? data.back_numbers.split(',').map(n => Number(n)) : []
      };
      
      res.json({
        success: true,
        data: formattedData
      });
    } else {
      res.json({
        success: true,
        data: null,
        message: '暂无开奖数据'
      });
    }
  } catch (error) {
    console.error('查询最新一期开奖信息失败:', error.message);
    res.json({
      success: false,
      message: '接口失败'
    });
  }
});

// 3. 三球分析接口
app.get('/san_qiu_fen_xi', async (req, res) => {
  try {
    console.log('执行三球分析...');
    // 这里简化处理，实际应该实现三球分析逻辑
    res.json({
      success: true,
      data: {
        message: '三球分析数据',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('三球分析失败:', error.message);
    res.json({
      success: false,
      message: '接口失败'
    });
  }
});

// 4. 组合详情接口 (原18892端口)
app.get('/zuhe/zu_he_xiang_qing', async (req, res) => {
  try {
    console.log('获取组合详情...');
    // 简化处理，实际应该查询数据库
    res.json({
      success: true,
      data: {
        message: '组合详情数据',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('获取组合详情失败:', error.message);
    res.json({
      success: false,
      message: '接口失败'
    });
  }
});

// 使用新的倒数2期两球组合详情API
app.use('/zuhe', daoShu2QiLiangQiuZuHeXiangQingAPI);

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器已启动在端口 ${PORT}`);
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`健康检查: http://localhost:${PORT}/health`);
  console.log(`SQL最新一期接口: http://localhost:${PORT}/sql_zui_xin_yi_qi`);
  console.log(`三球分析接口: http://localhost:${PORT}/san_qiu_fen_xi`);
  console.log(`组合详情接口: http://localhost:${PORT}/zuhe/zu_he_xiang_qing`);
  console.log(`倒数2期两球组合详情接口: http://localhost:${PORT}/zuhe/dao_shu_2_qi_liang_qiu_zu_he_xiang_qing`);
});

// 导出app以便在主服务器中使用
module.exports = app;