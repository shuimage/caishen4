const http = require('http');
const fs = require('fs');
const path = require('path');

// 使用明确的绝对路径
const PORT = 8000;
const PUBLIC_DIR = path.resolve('d:\\中啦\\caishen4\\qian');

console.log(`静态服务器根目录: ${PUBLIC_DIR}`);

const server = http.createServer((req, res) => {
  // 简化URL处理 - 移除查询参数
  let cleanUrl = req.url.split('?')[0]; // 只保留路径部分，移除查询参数
  let url = cleanUrl === '/' ? '/index.html' : cleanUrl;
  let filePath = path.join(PUBLIC_DIR, url);
  
  console.log(`请求URL: ${req.url}`);
  console.log(`解析文件路径: ${filePath}`);
  
  // 检查文件是否存在
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`文件不存在: ${filePath}`);
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`文件不存在: ${url}`);
      return;
    }
    
    // 检查是否是文件
    fs.stat(filePath, (err, stats) => {
      if (err) {
        console.error(`读取文件状态错误: ${err.message}`);
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('服务器内部错误');
        return;
      }
      
      if (stats.isDirectory()) {
        // 如果是目录，尝试访问index.html
        filePath = path.join(filePath, 'index.html');
        console.log(`重定向到目录下的index.html: ${filePath}`);
        
        fs.access(filePath, fs.constants.F_OK, (err) => {
          if (err) {
            console.error(`目录下没有index.html: ${filePath}`);
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end(`目录下没有index.html: ${url}`);
            return;
          }
          
          serveFile(filePath, res);
        });
      } else {
        serveFile(filePath, res);
      }
    });
  });
});

// 读取并提供文件
function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  
  // 设置MIME类型
  const contentType = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif'
  }[ext] || 'text/plain; charset=utf-8';
  
  console.log(`提供文件: ${filePath}, 类型: ${contentType}`);
  
  // 读取文件并响应
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(`读取文件错误: ${err.message}`);
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('读取文件失败');
      return;
    }
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
    console.log(`成功提供文件: ${filePath}`);
  });
}

// 启动服务器
server.listen(PORT, () => {
  console.log(`\n静态服务器已启动`);
  console.log(`服务器地址: http://localhost:${PORT}/`);
  console.log(`根目录: ${PUBLIC_DIR}`);
  console.log(`按 Ctrl+C 停止服务器\n`);
});