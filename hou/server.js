const express = require('express');
const cors = require('cors');
const shuangShaRouter = require('./shuang_sha');
const { getLotteryResults } = require('./huo_qu_shu_ju');

const app = express();
const PORT = 8084;

// 中间件配置
app.use(cors({
  origin: '*', // 允许所有来源的请求
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 处理OPTIONS请求
app.options('*', (req, res) => {
  res.sendStatus(200);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('====================================');
  console.log('新请求到达！');
  console.log('时间:', new Date().toISOString());
  console.log('方法:', req.method);
  console.log('路径:', req.path);
  console.log('查询参数:', req.query);
  console.log('原始URL:', req.originalUrl);
  console.log('主机:', req.headers.host);
  console.log('用户代理:', req.headers['user-agent']);
  next();
});

// 健康检查接口
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    success: true,
    message: '服务器运行正常',
    timestamp: new Date().toISOString()
  });
});

// 挂载双杀分析路由
app.use('/shuangsha', shuangShaRouter);

// 集成获取开奖数据的API接口
app.get('/getLotteryResults', getLotteryResults);

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : '内部错误'
  });
});

// 启动服务器
function startServer() {
  try {
    // 启动服务器
    app.listen(PORT, () => {
      console.log(`====================================`);
      console.log(`服务器已启动在端口 ${PORT}`);
      console.log(`服务器运行在 http://localhost:${PORT}`);
      console.log(`健康检查: http://localhost:${PORT}/health`);
      console.log(`双杀分析API: http://localhost:${PORT}/shuangsha/doubleKillAnalysis`);
      console.log(`API接口地址: http://localhost:${PORT}/getLotteryResults`);
      console.log(`====================================`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
}

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
});

// 启动服务器
startServer();