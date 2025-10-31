// shuang_sha_xiang_qing_server.js - 组合统计分析接口服务器
// 功能: 提供组合详情分析的API服务
// 作者: AI Assistant
// 创建日期: 2024

const express = require('express');
const cors = require('cors');
const combinationStatisticsRouter = require('./shuang_sha_xiang_qing');

const app = express();
const PORT = process.env.PORT || 18893;

// 配置CORS，允许所有来源的请求
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 解析JSON请求体
app.use(express.json());

// 挂载组合统计分析路由
app.use('/api', combinationStatisticsRouter);

// 根路径测试接口
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '组合统计分析接口服务运行正常',
    version: '1.0.0'
  });
});

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'combination-statistics-service'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`组合统计分析接口服务运行在 http://localhost:${PORT}`);
  console.log(`组合统计分析接口: http://localhost:${PORT}/api/combination-statistics`);
  console.log(`健康检查接口: http://localhost:${PORT}/health`);
});

module.exports = app;