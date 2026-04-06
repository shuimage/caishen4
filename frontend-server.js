const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

// 静态文件服务 - 从 qian 目录提供
const qianDir = path.join(__dirname, 'qian');
app.use(express.static(qianDir));

// 处理 SPA 路由 - 所有未匹配的路由都返回 index.html
app.get('*', (req, res) => {
  const indexPath = path.join(qianDir, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send('页面未找到');
    }
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('服务器错误');
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`✅ 前端服务器运行在 http://127.0.0.1:${PORT}`);
  console.log(`📁 静态文件目录：${qianDir}`);
  console.log(`🌐 访问地址：http://127.0.0.1:${PORT}`);
});
