// 临时端口转发服务，将18890端口的请求转发到18892端口
// proxy_server.js - 仅作为模块导出，不再单独启动服务器
const express = require('express');
const cors = require('cors');
const http = require('http');

const app = express();
const PORT = 18890;

// 配置CORS，允许所有来源的请求
app.use(cors());

// 解析JSON请求体
app.use(express.json());

// 处理所有GET请求，转发到18892端口
app.get('*', async (req, res) => {
  try {
    const path = req.originalUrl;
    console.log(`转发GET请求: ${path} -> http://localhost:18892${path}`);
    
    // 创建HTTP请求选项
    const options = {
      hostname: 'localhost',
      port: 18892,
      path: path,
      method: 'GET',
      headers: req.headers
    };
    
    // 发送请求到目标服务器
    const proxyReq = http.request(options, (proxyRes) => {
      let data = '';
      proxyRes.on('data', (chunk) => {
        data += chunk;
      });
      proxyRes.on('end', () => {
        // 设置响应头
        res.set(proxyRes.headers);
        res.status(proxyRes.statusCode);
        // 发送响应体
        res.send(data);
        console.log(`GET请求转发完成: ${path}`);
      });
    });
    
    // 处理错误
    proxyReq.on('error', (error) => {
      console.error(`转发请求失败: ${error.message}`);
      res.status(500).json({ success: false, message: '转发请求失败' });
    });
    
    // 结束请求
    proxyReq.end();
  } catch (error) {
    console.error(`处理请求时出错: ${error.message}`);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 处理所有POST请求，转发到18892端口
app.post('*', async (req, res) => {
  try {
    const path = req.originalUrl;
    const postData = JSON.stringify(req.body);
    console.log(`转发POST请求: ${path} -> http://localhost:18892${path}`);
    
    // 创建HTTP请求选项
    const options = {
      hostname: 'localhost',
      port: 18892,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...req.headers
      }
    };
    
    // 发送请求到目标服务器
    const proxyReq = http.request(options, (proxyRes) => {
      let data = '';
      proxyRes.on('data', (chunk) => {
        data += chunk;
      });
      proxyRes.on('end', () => {
        // 设置响应头
        res.set(proxyRes.headers);
        res.status(proxyRes.statusCode);
        // 发送响应体
        res.send(data);
        console.log(`POST请求转发完成: ${path}`);
      });
    });
    
    // 处理错误
    proxyReq.on('error', (error) => {
      console.error(`转发请求失败: ${error.message}`);
      res.status(500).json({ success: false, message: '转发请求失败' });
    });
    
    // 写入请求体
    proxyReq.write(postData);
    // 结束请求
    proxyReq.end();
  } catch (error) {
    console.error(`处理请求时出错: ${error.message}`);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '代理服务运行正常',
    timestamp: new Date().toISOString()
  });
});

// 注释掉服务器启动代码，避免单独启动服务器
/*
// 启动服务器
app.listen(PORT, () => {
  console.log(`临时转发服务运行在 http://localhost:${PORT}`);
  console.log(`所有请求将被转发到 http://localhost:18892`);
});
*/

// 导出app以便在主服务器中使用
module.exports = app;