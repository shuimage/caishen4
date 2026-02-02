const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const PUBLIC_DIR = path.resolve('.');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // 处理favicon.ico请求
  if (req.url === '/favicon.ico') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  let filePath = req.url === '/' ? path.join(PUBLIC_DIR, 'index.html') : path.join(PUBLIC_DIR, req.url.split('?')[0].split('#')[0]);
  
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    
    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
          res.writeHead(404);
          res.end('Directory index not found');
          return;
        }
        sendFile(filePath);
      });
      return;
    }
    
    if (!stats.isFile()) {
      res.writeHead(400);
      res.end('Not a file');
      return;
    }
    
    sendFile(filePath);
    
    function sendFile(filePath) {
      const ext = path.extname(filePath).toLowerCase();
      let contentType = 'text/plain';
      
      const contentTypeMap = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif'
      };
      
      if (contentTypeMap[ext]) contentType = contentTypeMap[ext];
      
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Internal Server Error');
          return;
        }
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});