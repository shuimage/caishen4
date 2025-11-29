// 获取SQL数据服务器.js
// 用途: 运行获取SQL数据的接口服务

// 获取SQL数据服务器.js - 仅作为模块导出，不再单独启动服务器
const express = require('express');
const cors = require('cors');
const huo_qu_sql_shu_ju_router = require('./获取SQL数据.js');

const app = express();

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由配置
app.use('/huo_qu_sql_shu_ju', huo_qu_sql_shu_ju_router);

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '服务器运行正常',
    timestamp: new Date().toISOString()
  });
});

// 注释掉服务器启动代码，避免单独启动服务器
/*
app.listen(PORT, () => {
  console.log(`获取SQL数据服务器已启动，监听端口 ${PORT}`);
  console.log(`健康检查地址: http://localhost:${PORT}/health`);
  console.log(`获取SQL数据接口: http://localhost:${PORT}/huo_qu_sql_shu_ju?type=10`);
});
*/

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'production' ? null : err.message
  });
});

// 导出app以便在主服务器中使用
module.exports = app;