const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 8080;

// 静态文件服务 - 从 qian 目录提供
const qianDir = path.join(__dirname, 'qian');
app.use(express.static(qianDir));

// API 代理 - 将/api 请求转发到后端服务器
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:18889',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '' // 移除/api 前缀
  },
  onError: (err, req, res) => {
    console.error('代理错误:', err);
    res.status(500).json({ success: false, message: '后端服务不可用' });
  }
}));

// 代理后区深度预测接口
app.use('/hou_qu_shen_du_yu_ce', createProxyMiddleware({
  target: 'http://localhost:18889',
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error('代理错误:', err);
    res.status(500).json({ success: false, message: '后端服务不可用' });
  }
}));

// 代理前区深度预测接口
app.use('/qian_qu_shen_du_yu_ce', createProxyMiddleware({
  target: 'http://localhost:18889',
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error('代理错误:', err);
    res.status(500).json({ success: false, message: '后端服务不可用' });
  }
}));

// 代理期号开奖信息接口
app.use('/qi_hao_kai_jiang_xin_xi', createProxyMiddleware({
  target: 'http://localhost:18889',
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error('代理错误:', err);
    res.status(500).json({ success: false, message: '后端服务不可用' });
  }
}));

// 启动服务器
app.listen(PORT, () => {
  console.log(`前端服务器运行在 http://localhost:${PORT}`);
  console.log(`静态文件目录：${qianDir}`);
  console.log(`API 代理：/api -> http://localhost:18889`);
});
