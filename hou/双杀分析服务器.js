// 双杀分析服务器.js - 双杀分析独立服务
// 功能: 提供双杀分析查询接口，在端口18891上运行
// 作者: AI Assistant
// 创建日期: 2024

// 导入必要的依赖模块
// 双杀分析服务器模块 - 仅作为模块导出，不再单独启动服务器
const express = require('express');
const cors = require('cors');
const app = express();

// 启用CORS
app.use(cors());

// 导入双杀分析路由
const shuangShaRouter = require('./双杀.js');

// 注册路由
app.use('/shuang_sha_fen_xi', shuangShaRouter);

// 健康检查接口
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: '双杀分析服务运行正常'
  });
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 注释掉服务器启动代码，避免单独启动服务器
/*
const PORT = 18891;
app.listen(PORT, () => {
  console.log(`双杀分析服务器已启动，监听端口 ${PORT}`);
  console.log(`接口地址: http://localhost:${PORT}/shuang_sha_fen_xi`);
  console.log(`健康检查: http://localhost:${PORT}/health`);
});
*/

// 导出app以便在主服务器中使用
module.exports = app;