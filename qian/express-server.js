const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8000;
const PUBLIC_DIR = path.resolve(__dirname);

// 配置详细的访问日志中间件
app.use((req, res, next) => {
  console.log('===== 新请求 =====');
  console.log(`请求方法: ${req.method}`);
  console.log(`请求URL: ${req.originalUrl}`);
  console.log(`请求路径: ${req.path}`);
  console.log(`查询参数:`, req.query);
  console.log(`请求头:`, req.headers);
  console.log(`用户代理: ${req.headers['user-agent']}`);
  next();
});

// 配置CORS中间件
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
});

// 配置静态文件服务，使用Express的内置静态中间件
// 这会自动处理URL解码、路径安全检查和内容类型设置
app.use(express.static(PUBLIC_DIR, {
  // 配置索引文件
  index: 'index.html',
  // 配置缓存控制
  setHeaders: (res, filePath) => {
    // 禁用缓存以确保开发环境中始终获取最新文件
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // 对于HTML文件，确保正确的编码
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.html') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }
  },
  // 提高文件处理的可靠性
  dotfiles: 'ignore',
  // 设置最大年龄为0，不缓存
  maxAge: 0
}));

// 处理根路径请求，明确指向index.html
app.get('/', (req, res) => {
  const indexPath = path.join(PUBLIC_DIR, 'index.html');
  console.log(`提供index.html: ${indexPath}`);
  
  // 验证文件是否存在
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error(`index.html文件不存在: ${indexPath}`);
    res.status(404).send('未找到index.html文件');
  }
});

// 处理所有其他GET请求的回退
app.get('*', (req, res) => {
  const requestedPath = path.join(PUBLIC_DIR, req.path);
  console.log(`尝试访问: ${requestedPath}`);
  
  // 检查文件是否存在
  if (fs.existsSync(requestedPath) && fs.statSync(requestedPath).isFile()) {
    res.sendFile(requestedPath);
  } else {
    // 尝试重定向到index.html，支持SPA应用
    console.log(`文件不存在，重定向到index.html`);
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
  }
});

// 404处理中间件
app.use((req, res, next) => {
  console.error(`404 - 未找到: ${req.originalUrl}`);
  res.status(404).send(`<h1>404 - 未找到</h1><p>请求的资源不存在: ${req.originalUrl}</p>`);
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).send(`<h1>500 - 服务器错误</h1><p>发生内部服务器错误</p>`);
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Express静态服务器运行在 http://localhost:${PORT}`);
  console.log(`服务目录: ${PUBLIC_DIR}`);
  console.log('服务器已配置支持CORS、详细日志和完善的错误处理');
  console.log('按Ctrl+C停止服务器');
});

// 捕获未处理的异常
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
});

// 捕获未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
});