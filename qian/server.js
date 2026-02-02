const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8081;
const PUBLIC_DIR = path.resolve(__dirname); // 使用绝对路径

// 添加CORS支持和日志功能的增强服务器
const server = http.createServer((req, res) => {
  // 记录详细请求信息
  console.log('===== 新请求 =====');
  console.log(`请求URL: ${req.url}`);
  console.log(`请求方法: ${req.method}`);
  console.log(`请求头:`, req.headers);
  
  // 添加CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // 解码URL，处理特殊字符和中文路径
  let decodedUrl = decodeURIComponent(req.url);
  console.log(`解码后的URL: ${decodedUrl}`);
  
  // 确定文件路径
  let filePath;
  if (decodedUrl === '/') {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  } else {
    // 移除查询参数和哈希部分
    const cleanPath = decodedUrl.split('?')[0].split('#')[0];
    filePath = path.join(PUBLIC_DIR, cleanPath);
  }
  
  console.log(`解析后的文件路径: ${filePath}`);
  
  // 确保路径在PUBLIC_DIR内（安全检查）
  if (!filePath.startsWith(PUBLIC_DIR)) {
    console.log(`安全警告: 路径尝试访问目录外的文件`);
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  // 检测文件是否存在
  fs.stat(filePath, (err, stats) => {
    if (err) {
      console.log(`文件不存在: ${filePath}, 错误: ${err.message}`);
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`文件未找到: ${decodedUrl}`);
      return;
    }
    
    // 如果是目录，重定向到index.html
    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      // 重新检查index.html是否存在
      fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Directory index not found');
          return;
        }
        sendFile(filePath);
      });
      return;
    }
    
    // 确保是文件
    if (!stats.isFile()) {
      console.log(`路径不是文件: ${filePath}`);
      res.writeHead(400);
      res.end('Not a file');
      return;
    }
    
    sendFile(filePath);
    
    // 发送文件的函数
    function sendFile(filePath) {
      // 设置适当的Content-Type
      const ext = path.extname(filePath).toLowerCase();
      let contentType = 'text/plain; charset=utf-8';
      
      const contentTypeMap = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'text/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml; charset=utf-8'
      };
      
      if (contentTypeMap[ext]) {
        contentType = contentTypeMap[ext];
      }
      
      console.log(`准备发送文件: ${filePath}, 内容类型: ${contentType}`);
      
      // 读取文件并响应
      fs.readFile(filePath, (err, data) => {
        if (err) {
          console.error(`读取文件错误: ${filePath}, 错误: ${err.message}`);
          res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end(`加载文件错误: ${err.message}`);
          return;
        }
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
        console.log(`文件发送成功: ${filePath}`);
      });
    }
  });
});

// 捕获所有错误
server.on('error', (error) => {
  console.error('服务器错误:', error);
});

server.listen(PORT, () => {
  console.log(`增强型静态服务器运行在 http://localhost:${PORT}/`);
  console.log(`服务目录: ${PUBLIC_DIR}`);
});