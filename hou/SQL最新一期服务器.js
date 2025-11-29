// 参数说明: 无参数
// 接口功能: 获取数据库中存储的最新一期大乐透开奖信息

// SQL最新一期服务器 - 仅作为模块导出，不再单独启动服务器
const express = require('express');
const cors = require('cors');
const sqlZuiXinYiQiRouter = require('./SQL最新一期.js');

const app = express();

// 启用CORS
app.use(cors());

// 解析JSON请求体
app.use(express.json());

// 注册路由
app.use('/sql_zui_xin_yi_qi', sqlZuiXinYiQiRouter);

// 健康检查接口
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'SQL最新一期服务运行正常'
  });
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
});

// 注释掉服务器启动代码，避免单独启动服务器
/*
const PORT = 18890;
app.listen(PORT, () => {
  console.log(`SQL最新一期服务器已启动，监听端口 ${PORT}`);
  console.log(`接口地址: http://localhost:${PORT}/sql_zui_xin_yi_qi`);
  console.log(`健康检查: http://localhost:${PORT}/health`);
});
*/

// 导出app以便在主服务器中使用
module.exports = app;