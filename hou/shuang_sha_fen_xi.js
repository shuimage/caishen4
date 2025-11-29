const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 18891;

// 增强CORS配置以处理所有跨域请求
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 导入倒数2期双杀分析路由
const shuangShaRouter = require('./dao_shu_2_qi_shuang_sha_fen_xi');

// 使用空字符串挂载，避免路径重复，使接口路径为/dao_shu_2_qi_shuang_sha_fen_xi
app.use('', shuangShaRouter);

// 启动服务器
app.listen(PORT, () => {
  console.log(`双杀分析服务运行在 http://localhost:${PORT}`);
  console.log(`双杀分析接口: http://localhost:${PORT}/shuang_sha_fen_xi`);
});