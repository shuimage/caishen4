const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 18889;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 获取所有路由文件
const routesPath = __dirname;
const jsFiles = fs.readdirSync(routesPath).filter(f => f.endsWith('.js') && f !== 'server.js');

console.log(`找到 ${jsFiles.length} 个路由文件`);

// 动态加载所有路由
let loadedRoutes = 0;
jsFiles.forEach(file => {
  try {
    const route = require(path.join(routesPath, file));
    if (route && (route.get || route.post || route.router)) {
      // 如果是 router 对象，直接挂载
      const routeName = file.replace('.js', '').replace(/_/g, '/');
      app.use(`/${routeName}`, route);
      loadedRoutes++;
      console.log(`  ✅ 加载: /${routeName}`);
    }
  } catch (err) {
    console.log(`  ❌ 加载失败: ${file} - ${err.message}`);
  }
});

console.log(`\n成功加载 ${loadedRoutes} 个路由\n`);

// 健康检查路由
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: '后端服务运行正常',
    routes: loadedRoutes
  });
});

// 列出所有可用 API
app.get('/api/list', (req, res) => {
  const routes = jsFiles.map(f => `/${f.replace('.js', '').replace(/_/g, '/')}`);
  res.json({ 
    total: routes.length,
    routes: routes 
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器错误: ' + err.message });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n========================================`);
  console.log(`✅ 后端服务器运行在 http://0.0.0.0:${PORT}`);
  console.log(`📝 健康检查: http://localhost:${PORT}/health`);
  console.log(`📋 API 列表: http://localhost:${PORT}/api/list`);
  console.log(`========================================\n`);
});
