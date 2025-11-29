// 倒数2期双杀分析服务器 - 仅作为模块导出，不再单独启动服务器
const express = require('express');
const cors = require('cors');
const daoShu2QiShuangShaFenXiRouter = require('./倒数2期双杀分析.js');

const app = express();

// 启用CORS
app.use(cors());

// 解析JSON请求体
app.use(express.json());

// 注册路由
app.use('/dao_shu_2_qi_shuang_sha_fen_xi', daoShu2QiShuangShaFenXiRouter);

// 健康检查接口
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: '倒数2期双杀分析服务运行正常'
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
const PORT = 18892;
app.listen(PORT, () => {
  console.log(`倒数2期双杀分析服务器已启动，监听端口 ${PORT}`);
  console.log(`接口地址: http://localhost:${PORT}/dao_shu_2_qi_shuang_sha_fen_xi`);
  console.log(`健康检查: http://localhost:${PORT}/health`);
});
*/

// 导出app以便在主服务器中使用
module.exports = app;