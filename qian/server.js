const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const PUBLIC_DIR = path.resolve(__dirname); // 使用绝对路径

const server = http.createServer((req, res) => {
  let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);
  
  // 检测文件是否存在
  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }
    
    // 如果是目录，重定向到index.html
    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
    
    // 读取文件并响应
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Internal Server Error');
        return;
      }
      
      // 设置适当的Content-Type
      const ext = path.extname(filePath).toLowerCase();
      const contentType = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif'
      }[ext] || 'text/plain';
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Static server running at http://localhost:${PORT}/`);
});