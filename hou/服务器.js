const express = require('express');
const app = express();
const { query } = require('./数据库配置.js');
const PORT = 18889;

// 导入路由模块
const huoQuSqlShuJuRouter = require('./获取SQL数据.js');
const sqlZuiXinYiQiRouter = require('./SQL最新一期.js');
const sqlDaoShu2QiRouter = require('./SQL倒数2期.js');
const sqlDaoShu3QiRouter = require('./SQL倒数3期.js');
const sqlDaoShu4QiRouter = require('./sql_dao_shu_4_qi.js'); // 导入倒数第4期数据路由
// 导入倒数第5期数据路由
const sqlDaoShu5QiRouter = require('./sql_dao_shu_5_qi.js');
// 导入倒数第6期数据路由
const sqlDaoShu6QiRouter = require('./sql_dao_shu_6_qi.js');
// 导入倒数第7期数据路由
const sqlDaoShu7QiRouter = require('./sql_dao_shu_7_qi.js');
// 导入倒数第8期数据路由
const sqlDaoShu8QiRouter = require('./sql_dao_shu_8_qi.js');
// 导入倒数第9期数据路由
const sqlDaoShu9QiRouter = require('./sql_dao_shu_9_qi.js');
// 导入倒数X期数据路由
const sqlDaoShuXQiRouter = require('./sql_dao_shu_x_qi.js');
// 导入倒数4期两球组合详情路由
const daoShu4QiLiangQiuZuHeXiangQingRouter = require('./倒数4期两球组合详情服务器.js');
// 导入倒数5期两球组合详情路由
const daoShu5QiLiangQiuZuHeXiangQingRouter = require('./倒数5期两球组合详情服务器.js'); // 导入倒数第5期数据路由
// 导入倒数3期两球组合详情路由
const daoShu3QiLiangQiuZuHeXiangQingRouter = require('./倒数3期两球组合详情.js');
const daoShu2QiTuiJianShaHaoRouter = require('./倒数2期推荐杀号.js');
const huoQuTiCaiShuJuRouter = require('./获取体彩数据.js');
const gengXinKaiJiangRouter = require('./更新开奖.js');
const shuangShaRouter = require('./双杀.js'); // 导入双杀分析路由
const daoShu2QiShuangShaFenXiRouter = require('./倒数2期双杀分析.js'); // 导入倒数2期双杀分析路由
const sanQiuFenXiRouter = require('./三球分析.js'); // 导入三球分析路由
const daoShu2QiLiangQiuZuHeRouter = require('./倒数2期两球组合.js'); // 导入倒数2期前区两球组合路由
const daoShu2QiHouQuZuHeRouter = require('./倒数2期后区组合.js'); // 导入倒数2期后区两球组合路由
const daoShu2QiHouQuLiangQiuZuHeRouter = require('./倒数2期后区两球组合.js'); // 导入倒数2期后区两球组合分析路由
const daoShu3QiLiangQiuZuHeRouter = require('./倒数3期两球组合前区.js'); // 导入倒数3期前区两球组合路由
const daoShu3QiHouQuZuHeRouter = require('./倒数3期两球组合后区.js'); // 导入倒数3期后区两球组合路由
const daoShu4QiLiangQiuZuHeRouter = require('./倒数4期两球组合前区.js'); // 导入倒数4期前区两球组合路由
const daoShu4QiHouQuZuHeRouter = require('./倒数4期两球组合后区.js'); // 导入倒数5期两球组合前区.js
const daoShu5QiLiangQiuZuHeRouter = require('./倒数5期两球组合前区.js'); // 导入倒数5期后区两球组合路由
const daoShu5QiHouQuZuHeRouter = require('./倒数5期两球组合后区.js'); // 导入倒数5期后区两球组合路由
// 导入倒数6期两球组合路由
const daoShu6QiLiangQiuZuHeRouter = require('./倒数6期两球组合前区.js'); // 导入倒数6期前区两球组合路由
const daoShu6QiHouQuZuHeRouter = require('./倒数6期两球组合后区.js'); // 导入倒数6期后区两球组合路由
// 导入倒数7期两球组合路由
const daoShu7QiLiangQiuZuHeRouter = require('./倒数7期两球组合前区.js'); // 导入倒数7期前区两球组合路由
const daoShu7QiHouQuZuHeRouter = require('./倒数7期两球组合后区.js'); // 导入倒数7期后区两球组合路由
// 导入倒数8期两球组合路由
const daoShu8QiLiangQiuZuHeRouter = require('./倒数8期两球组合前区.js'); // 导入倒数8期前区两球组合路由
const daoShu8QiHouQuZuHeRouter = require('./倒数8期两球组合后区.js'); // 导入倒数8期后区两球组合路由
// 导入倒数9期两球组合路由
const daoShu9QiLiangQiuZuHeRouter = require('./倒数9期两球组合前区.js'); // 导入倒数9期前区两球组合路由
const daoShu9QiHouQuZuHeRouter = require('./倒数9期两球组合后区.js'); // 导入倒数9期后区两球组合路由
// 导入倒数X期两球组合路由
const daoShuXQiLiangQiuZuHeRouter = require('./dao_shu_x_qi_liang_qiu_zu_he.js'); // 导入倒数X期前区两球组合路由
const daoShuXQiHouQuZuHeRouter = require('./dao_shu_x_qi_hou_qu_zu_he.js'); // 导入倒数X期后区两球组合路由
const daoShuXQiLiangQiuZuHeXiangQingRouter = require('./dao_shu_x_qi_liang_qiu_zu_he_xiang_qing.js'); // 导入倒数X期两球组合详情路由
// 导入倒数6期两球组合详情路由
const daoShu6QiLiangQiuZuHeXiangQingRouter = require('./倒数6期两球组合详情服务器.js'); // 导入倒数6期两球组合详情路由
// 导入倒数7期两球组合详情路由
const daoShu7QiLiangQiuZuHeXiangQingRouter = require('./倒数7期两球组合详情服务器.js'); // 导入倒数7期两球组合详情路由
// 导入倒数8期两球组合详情路由
const daoShu8QiLiangQiuZuHeXiangQingRouter = require('./倒数8期两球组合详情服务器.js'); // 导入倒数8期两球组合详情路由
// 导入近两期两球组合路由
const jinLiangQiLiangQiuZuHeFrontRouter = require('./近两期两球组合前区.js'); // 导入近两期前区两球组合路由
const jinLiangQiLiangQiuZuHeBackRouter = require('./近两期两球组合后区.js'); // 导入近两期后区两球组合路由
const jinLiangQiLiangQiuZuHeXiangQingRouter = require('./近两期两球组合详情.js'); // 导入近两期两球组合详情路由
const sanQiuXiangQingRouter = require('./三球详情.js');
const sanQiuZuHeXiangQingRouter = require('./三球组合详情.js'); // 导入最新1期三球组合详情路由
const shaHaoHuiCeRouter = require('./杀号回测.js'); // 导入杀号回测路由
const daoShu2QiShaHaoHuiCeRouter = require('./倒数2期两球前区杀号回测.js'); // 导入倒数2期杀号回测路由
const daoShu3QiShaHaoHuiCeRouter = require('./倒数3期两球前区杀号回测.js'); // 导入倒数3期杀号回测路由
const sanQiuShaHaoHuiCeRouter = require('./最新1期三球前区杀号回测.js'); // 导入三球组合前区杀号回测路由
const daoShu2QiSanQiuShaHaoHuiCeRouter = require('./倒数2期三球前区杀号回测.js'); // 导入倒数2期三球组合前区杀号回测路由
const daoShu3QiSanQiuShaHaoHuiCeRouter = require('./倒数3期三球前区杀号回测.js'); // 导入倒数3期三球组合前区杀号回测路由
const daoShu4QiShaHaoHuiCeRouter = require('./倒数4期两球前区杀号回测.js'); // 导入倒数4期杀号回测路由
const daoShu5QiShaHaoHuiCeRouter = require('./倒数5期两球前区杀号回测.js'); // 导入倒数5期杀号回测路由
const huoQuShaHaoHouHuiCeRouter = require('./最新1期两球前区杀号回测.js'); // 导入后区杀号回测路由
const daoShu2QiHouQuShaHaoHuiCeRouter = require('./倒数2期两球后区杀号回测.js'); // 导入倒数2期后区杀号回测路由
const daoShu3QiHouQuShaHaoHuiCeRouter = require('./倒数3期两球后区杀号回测.js'); // 导入倒数4期两球后区杀号回测路由
const daoShu4QiHouQuShaHaoHuiCeRouter = require('./倒数4期两球后区杀号回测.js'); // 导入倒数4期后区杀号回测路由
// 导入倒数5期两球后区杀号回测路由
const daoShu5QiHouQuShaHaoHuiCeRouter = require('./倒数5期两球后区杀号回测.js'); // 导入倒数5期后区杀号回测路由
// 导入近两期两球杀号回测路由
const jinLiangQiQianQuShaHaoHuiCeRouter = require('./近两期两球前区杀号回测.js'); // 导入近两期两球前区杀号回测路由
const jinLiangQiHouQuShaHaoHuiCeRouter = require('./近两期两球后区杀号回测.js'); // 导入近两期两球后区杀号回测路由
// 导入最新1期两球买号回测路由
const zuiXinYiQiLiangQiuQianQuMaiHaoHuiCeRouter = require('./最新1期两球前区买号回测.js'); // 导入最新1期两球前区买号回测路由
const zuiXinYiQiLiangQiuHouQuMaiHaoHuiCeRouter = require('./最新1期两球后区买号回测.js'); // 导入最新1期两球后区买号回测路由
// 导入倒数2期两球前区买号回测路由
const daoShu2QiLiangQiuQianQuMaiHaoHuiCeRouter = require('./倒数2期两球前区买号回测.js'); // 导入倒数2期两球前区买号回测路由
// 导入倒数3期两球前区买号回测路由
const daoShu3QiLiangQiuQianQuMaiHaoHuiCeRouter = require('./倒数3期两球前区买号回测.js'); // 导入倒数3期两球前区买号回测路由
// 导入倒数4期两球前区买号回测路由
const daoShu4QiLiangQiuQianQuMaiHaoHuiCeRouter = require('./倒数4期两球前区买号回测.js'); // 导入倒数4期两球前区买号回测路由
// 导入倒数5期两球前区买号回测路由
const daoShu5QiLiangQiuQianQuMaiHaoHuiCeRouter = require('./倒数5期两球前区买号回测.js'); // 导入倒数5期两球前区买号回测路由
// 导入倒数6期两球前区买号回测路由
const daoShu6QiLiangQiuQianQuMaiHaoHuiCeRouter = require('./倒数6期两球前区买号回测.js'); // 导入倒数6期两球前区买号回测路由
// 导入近两期两球前区买号回测路由
const jinLiangQiLiangQiuQianQuMaiHaoHuiCeRouter = require('./近两期两球前区买号回测.js'); // 导入近两期两球前区买号回测路由
// 导入近两期两球后区买号回测路由
const jinLiangQiLiangQiuHouQuMaiHaoHuiCeRouter = require('./近两期两球后区买号回测.js'); // 导入近两期两球后区买号回测路由
// 导入最新1期三球前区买号回测路由
const zuiXinYiQiSanQiuQianQuMaiHaoHuiCeRouter = require('./最新1期三球前区买号回测.js'); // 导入最新1期三球前区买号回测路由
// 导入倒数2期三球前区买号回测路由
const daoShu2QiSanQiuQianQuMaiHaoHuiCeRouter = require('./倒数2期三球前区买号回测.js'); // 导入倒数2期三球前区买号回测路由
// 导入倒数3期三球前区买号回测路由
const daoShu3QiSanQiuQianQuMaiHaoHuiCeRouter = require('./倒数3期三球前区买号回测.js'); // 导入倒数3期三球前区买号回测路由
// 导入倒数2期两球后区买号回测路由
const daoShu2QiLiangQiuHouQuMaiHaoHuiCeRouter = require('./倒数2期两球后区买号回测.js'); // 导入倒数2期两球后区买号回测路由
// 导入倒数3期两球后区买号回测路由
const daoShu3QiLiangQiuHouQuMaiHaoHuiCeRouter = require('./倒数3期两球后区买号回测.js'); // 导入倒数3期两球后区买号回测路由
// 导入倒数4期两球后区买号回测路由
const daoShu4QiLiangQiuHouQuMaiHaoHuiCeRouter = require('./倒数4期两球后区买号回测.js'); // 导入倒数4期两球后区买号回测路由
// 导入倒数5期两球后区买号回测路由
const daoShu5QiLiangQiuHouQuMaiHaoHuiCeRouter = require('./倒数5期两球后区买号回测.js'); // 导入倒数5期两球后区买号回测路由
// 导入幻圆回测路由
const huanYuanHuiCeJingXiangRouter = require('./huan_yuan_hui_ce_jing_xiang.js'); // 导入幻圆回测镜像对称路由
const huanYuanHuiCeZhouXianRouter = require('./huan_yuan_hui_ce_zhou_xian.js'); // 导入幻圆回测轴线对称路由
const huanYuanHuiCeYuanHuanRouter = require('./huan_yuan_hui_ce_yuan_huan.js'); // 导入幻圆回测圆环对称路由
const huanYuanHuiCeHuBuRouter = require('./huan_yuan_hui_ce_hu_bu.js'); // 导入幻圆回测互补对称路由
const huanYuanHuiCeReLengRouter = require('./huan_yuan_hui_ce_re_leng.js'); // 导入幻圆回测冷热对称路由
// 导入回测结果保存和获取路由
const huiCeJieGuoRouter = require('./回测结果保存获取.js');
// 导入还原九转连环图路由
const huanYuanJiuZhuanLianHuanTuRouter = require('./huan_yuan_jiu_zhuan_lian_huan_tu.js');
// 导入前区深度预测路由
const qianQuShenDuYuCeRouter = require('./qian_qu_shen_du_yu_ce.js');
const qiHaoKaiJiangXinXiRouter = require('./qi_hao_kai_jiang_xin_xi.js');

// 设置中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 启用CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '服务器运行正常',
    timestamp: new Date().toISOString()
  });
});

// 注册路由
app.use('/huo_qu_sql_shu_ju', huoQuSqlShuJuRouter);
app.use('/sql_zui_xin_yi_qi', sqlZuiXinYiQiRouter);
app.use('/sql_dao_shu_2_qi', sqlDaoShu2QiRouter);
app.use('/sql_dao_shu_3_qi', sqlDaoShu3QiRouter);
app.use('/sql_dao_shu_4_qi', sqlDaoShu4QiRouter); // 注册倒数第4期数据路由
app.use('/sql_dao_shu_5_qi', sqlDaoShu5QiRouter); // 注册倒数第5期数据路由
app.use('/sql_dao_shu_6_qi', sqlDaoShu6QiRouter); // 注册倒数第6期数据路由
app.use('/sql_dao_shu_7_qi', sqlDaoShu7QiRouter); // 注册倒数第7期数据路由
app.use('/sql_dao_shu_8_qi', sqlDaoShu8QiRouter); // 注册倒数第8期数据路由
app.use('/sql_dao_shu_9_qi', sqlDaoShu9QiRouter); // 注册倒数第9期数据路由
app.use('/sql_dao_shu_x_qi', sqlDaoShuXQiRouter); // 注册倒数X期数据路由
app.use('/dao_shu_2_qi_tui_jian_sha_hao', daoShu2QiTuiJianShaHaoRouter);
app.use('/huo_qu_ti_cai_shu_ju', huoQuTiCaiShuJuRouter);
app.use('/geng_xin_kai_jiang', gengXinKaiJiangRouter);
app.use('/shuang_sha_fen_xi', shuangShaRouter); // 注册双杀分析路由
app.use('/dao_shu_2_qi_shuang_sha_fen_xi', daoShu2QiShuangShaFenXiRouter); // 注册倒数2期双杀分析路由
app.use('/san_qiu_fen_xi', sanQiuFenXiRouter); // 注册三球分析路由
app.use('/dao_shu_2_qi_liang_qiu_zu_he', daoShu2QiLiangQiuZuHeRouter); // 注册倒数2期前区两球组合路由
app.use('/dao_shu_2_qi_hou_qu_zu_he', daoShu2QiHouQuZuHeRouter); // 注册倒数2期后区两球组合路由
app.use('/dao_shu_2_qi_hou_qu_liang_qiu_zu_he', daoShu2QiHouQuLiangQiuZuHeRouter); // 注册倒数2期后区两球组合分析路由
app.use('/dao_shu_3_qi_liang_qiu_zu_he', daoShu3QiLiangQiuZuHeRouter); // 注册倒数3期前区两球组合路由
app.use('/dao_shu_3_qi_hou_qu_zu_he', daoShu3QiHouQuZuHeRouter); // 注册倒数3期后区两球组合路由
app.use('/dao_shu_4_qi_liang_qiu_zu_he', daoShu4QiLiangQiuZuHeRouter); // 注册倒数4期前区两球组合路由
app.use('/dao_shu_4_qi_hou_qu_zu_he', daoShu4QiHouQuZuHeRouter); // 注册倒数4期后区两球组合路由
app.use('/dao_shu_5_qi_liang_qiu_zu_he', daoShu5QiLiangQiuZuHeRouter); // 注册倒数5期前区两球组合路由
app.use('/dao_shu_5_qi_hou_qu_zu_he', daoShu5QiHouQuZuHeRouter); // 注册倒数5期后区两球组合路由
app.use('/dao_shu_6_qi_liang_qiu_zu_he', daoShu6QiLiangQiuZuHeRouter); // 注册倒数6期前区两球组合路由
app.use('/dao_shu_6_qi_hou_qu_zu_he', daoShu6QiHouQuZuHeRouter); // 注册倒数6期后区两球组合路由
app.use('/dao_shu_7_qi_liang_qiu_zu_he', daoShu7QiLiangQiuZuHeRouter); // 注册倒数7期前区两球组合路由
app.use('/dao_shu_7_qi_hou_qu_zu_he', daoShu7QiHouQuZuHeRouter); // 注册倒数7期后区两球组合路由
app.use('/dao_shu_8_qi_liang_qiu_zu_he', daoShu8QiLiangQiuZuHeRouter); // 注册倒数8期前区两球组合路由
app.use('/dao_shu_8_qi_hou_qu_zu_he', daoShu8QiHouQuZuHeRouter); // 注册倒数8期后区两球组合路由
app.use('/dao_shu_9_qi_liang_qiu_zu_he', daoShu9QiLiangQiuZuHeRouter); // 注册倒数9期前区两球组合路由
app.use('/dao_shu_9_qi_hou_qu_zu_he', daoShu9QiHouQuZuHeRouter); // 注册倒数9期后区两球组合路由
app.use('/dao_shu_9_qi_hou_qu_liang_qiu_zu_he', daoShu9QiHouQuZuHeRouter); // 注册倒数9期后区两球组合分析路由
// 注册倒数X期两球组合路由
app.use('/dao_shu_x_qi_liang_qiu_zu_he', daoShuXQiLiangQiuZuHeRouter); // 注册倒数X期前区两球组合路由
app.use('/dao_shu_x_qi_hou_qu_zu_he', daoShuXQiHouQuZuHeRouter); // 注册倒数X期后区两球组合路由
app.use('/zuhe/dao_shu_x_qi_liang_qiu_zu_he_xiang_qing', daoShuXQiLiangQiuZuHeXiangQingRouter); // 注册倒数X期两球组合详情路由
// 注册近两期两球组合路由
app.use('/jin_liang_qi_liang_qiu_zu_he_front', jinLiangQiLiangQiuZuHeFrontRouter); // 注册近两期前区两球组合路由
app.use('/jin_liang_qi_liang_qiu_zu_he_back', jinLiangQiLiangQiuZuHeBackRouter); // 注册近两期后区两球组合路由
app.use('/jin_liang_qi_liang_qiu_zu_he_xiang_qing', jinLiangQiLiangQiuZuHeXiangQingRouter); // 注册近两期两球组合详情路由
// 注册带zuhe前缀的近两期两球组合详情路由
app.use('/zuhe/jin_liang_qi_liang_qiu_zu_he_xiang_qing', jinLiangQiLiangQiuZuHeXiangQingRouter); // 注册带zuhe前缀的近两期两球组合详情路由
const daoShu2QiSanQiuZuHeRouter = require('./倒数2期三球组合.js');
app.use('/dao_shu_2_qi_san_qiu_zu_he', daoShu2QiSanQiuZuHeRouter); // 注册倒数2期前区三球组合路由
const daoShu2QiSanQiuZuHeXiangQingRouter = require('./倒数2期三球组合详情.js');
app.use('/dao_shu_2_qi_san_qiu_zu_he_xiang_qing', daoShu2QiSanQiuZuHeXiangQingRouter); // 注册倒数2期前区三球组合详情路由
const daoShu3QiSanQiuZuHeRouter = require('./倒数3期三球组合');
app.use('/dao_shu_3_qi_san_qiu_zu_he', daoShu3QiSanQiuZuHeRouter); // 注册倒数3期前区三球组合路由
const daoShu3QiSanQiuZuHeXiangQingRouter = require('./倒数3期三球组合详情.js');
app.use('/dao_shu_3_qi_san_qiu_zu_he_xiang_qing', daoShu3QiSanQiuZuHeXiangQingRouter); // 注册倒数3期前区三球组合详情路由
// 注册还原九转连环图路由
app.use('/huan_yuan_jiu_zhuan_lian_huan_tu', huanYuanJiuZhuanLianHuanTuRouter);

// 先注册直接路由，再注册中间件，避免中间件拦截
// 注册倒数4期两球组合详情路由
app.use('/zuhe/dao_shu_4_qi_liang_qiu_zu_he_xiang_qing', daoShu4QiLiangQiuZuHeXiangQingRouter);

// 注册倒数5期两球组合详情路由
app.use('/zuhe/dao_shu_5_qi_liang_qiu_zu_he_xiang_qing', daoShu5QiLiangQiuZuHeXiangQingRouter);

app.post('/zuhe/dao_shu_2_qi_liang_qiu_zu_he_xiang_qing', async (req, res) => {
  console.log('收到倒数2期两球组合详情请求，请求体:', req.body);
  try {
    const { latest_period, type = 'front', combinations = [], stats_range = 100, target_ball = null } = req.body;
    if (!latest_period) return res.status(400).json({ code: 400, message: '最新期号是必填参数' });
    if (!Array.isArray(combinations) || combinations.length === 0) return res.status(400).json({ code: 400, message: '组合数组不能为空' });
    if (stats_range !== 'all' && (!Number.isInteger(stats_range) || stats_range <= 0)) return res.status(400).json({ code: 400, message: '统计范围必须是正整数或"all"' });
    if (type !== 'front' && type !== 'back') return res.status(400).json({ code: 400, message: '类型只能是front或back' });
    
    // 获取倒数第2期的开奖数据
    const secondLastResultSql = `
      SELECT * 
      FROM lottery_results 
      ORDER BY issue DESC 
      LIMIT 1, 1
    `;
    
    const secondLastResult = await query(secondLastResultSql);
    if (!secondLastResult || secondLastResult.length === 0) {
      return res.status(404).json({ code: 404, message: '未找到倒数第2期开奖数据' });
    }
    
    const secondLastDraw = secondLastResult[0];
    console.log('获取到倒数第2期开奖期号:', secondLastDraw.issue);
    
    const drawField = type === 'front' ? 'red' : 'blue';
    
    // 处理球号数据，确保格式一致
    function processBalls(balls) {
      if (!balls) return [];
      // 将球号字符串转换为数字数组
      if (typeof balls === 'string') {
        const numbers = balls.match(/\d+/g);
        if (numbers) {
          return numbers.map(num => parseInt(num));
        }
      } else if (Array.isArray(balls)) {
        return balls.map(num => typeof num === 'string' ? parseInt(num) : num);
      }
      return [];
    }
    
    // 精确检查组合是否在开奖号码中
    function checkCombinationInDraw(drawNumbers, combination) {
      const comboParts = combination.split('-')
        .map(part => part.trim())
        .map(part => parseInt(part))
        .slice(0, 2); // 只检查主组合（前两个球）
      
      return comboParts.every(part => drawNumbers.includes(part));
    }
    
    // 查询历史数据，查找这些组合出现的记录
    let limit = Number(stats_range);
    
    // 使用字符串替换构建SQL查询，避免参数类型问题
    let sql = `
      SELECT 
        id, 
        issue, 
        ${drawField} as draw_info
      FROM 
        lottery_results 
      WHERE 
        issue < '${secondLastDraw.issue}'
      ORDER BY issue DESC
    `;
    
    // 只有当stats_range不是'all'时，才添加LIMIT子句
    if (stats_range !== 'all') {
      sql += ` LIMIT ${limit}`;
    }
    
    console.log('SQL查询语句:', sql);
    
    // 执行查询，先获取足够多的数据
    let rawResults = await query(sql);
    
    console.log('原始查询结果数量:', rawResults.length);
    
    // 过滤出真正包含请求组合的记录，并查找下下下期数据
    let results = [];
    
    // 遍历历史数据，查找组合出现的位置，并记录下下期的号码
    // 注意：历史数据是按issue降序排列的，所以下下期的索引是i-2
    for (let i = 2; i < rawResults.length; i++) {
      const currentDraw = rawResults[i];  // 当前期（组合出现的期数）
      const nextNextDraw = rawResults[i - 2]; // 下下期（期号比当前期大2，因为数据是降序排列的）
      
      // 确保nextNextDraw存在
      if (!nextNextDraw) continue;
      
      const currentDrawNumbers = processBalls(currentDraw.draw_info);
      
      // 检查当前期是否包含请求组合
      const isMatch = combinations.some(fullCombination => {
        const match = checkCombinationInDraw(currentDrawNumbers, fullCombination);
        return match;
      });
      
      if (isMatch) {
          const nextNextDrawNumbers = processBalls(nextNextDraw.draw_info);
          
          // 直接添加结果，后续统一处理目标球
          results.push({
            id: currentDraw.id,
            period: currentDraw.issue,
            draw_info: currentDrawNumbers,
            next_period: nextNextDraw.issue,
            next_draw_info: nextNextDrawNumbers
          });
        }
    }
    
    // 如果有目标球，检查目标球是否在下下下期出现
    if (target_ball !== null && target_ball !== undefined && target_ball !== '') {
      const targetBallNum = parseInt(target_ball);
      results = results.filter(result => {
        // 由于next_draw_info已经是通过processBalls处理过的数字数组，直接使用
        return result.next_draw_info.includes(targetBallNum);
      });
    }
    
    // 反转结果，按照id从大到小排序
    results = results.reverse();
    
    console.log('过滤后的结果数量:', results.length);
    
    // 为结果添加索引
    const indexedResults = results.map((result, index) => ({
      ...result,
      index: index + 1
    }));
    
    console.log('最终返回的结果数量:', indexedResults.length);
    
    res.json({ code: 200, message: 'success', data: indexedResults });
  } catch (error) {
    console.error('处理请求时发生错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误', error: error.message });
  }
});

// 直接定义/zuhe/zu_he_xiang_qing路由，避免路由冲突和中间件问题
// 特别处理请求体解析错误
app.post('/zuhe/zu_he_xiang_qing', (req, res) => {
  // 首先检查请求体是否已经解析成功
  if (typeof req.body !== 'object' || req.body === null) {
    console.error('请求体解析错误，原始请求体:', req.rawBody);
    return res.status(400).json({
      code: 400,
      message: '请求体格式错误，请检查JSON格式',
      error: 'Invalid JSON format'
    });
  }
  
  // 如果请求体解析成功，继续处理
  (async () => {
    try {
      const { latest_period, target_ball, type, combinations, stats_range } = req.body;
      
      console.log('收到组合详情请求，参数:', req.body);
      
      // 参数验证
      if (!latest_period || !type || !combinations || !stats_range) {
        return res.status(400).json({
          code: 400,
          message: '参数不完整，所有参数均为必填'
        });
      }
      
      if (type !== 'front' && type !== 'back') {
        return res.status(400).json({
          code: 400,
          message: 'type值错误，应为front或back'
        });
      }
      
      if (!Array.isArray(combinations) || combinations.length === 0) {
        return res.status(400).json({
          code: 400,
          message: 'combinations必须是非空数组'
        });
      }
      
      const parsedStatsRange = parseInt(stats_range);
      if (isNaN(parsedStatsRange) || parsedStatsRange <= 0 || parsedStatsRange > 5000) {
        return res.status(400).json({
          code: 400,
          message: 'stats_range必须为正整数且不大于5000'
        });
      }
      
      // 处理球号数据的函数
      function processBalls(ballsData) {
        if (!ballsData) return [];
        if (Array.isArray(ballsData)) {
          return ballsData.map(ball => parseInt(ball, 10)).filter(num => !isNaN(num));
        }
        if (typeof ballsData === 'string') {
          if (ballsData.startsWith('[') && ballsData.endsWith(']')) {
            const content = ballsData.substring(1, ballsData.length - 1);
            return content.split(',').map(ball => parseInt(ball.trim(), 10)).filter(num => !isNaN(num));
          } else if (ballsData.includes(' ')) {
            return ballsData.split(' ').map(ball => parseInt(ball.trim(), 10)).filter(num => !isNaN(num));
          } else if (ballsData.includes(',')) {
            return ballsData.split(',').map(ball => parseInt(ball.trim(), 10)).filter(num => !isNaN(num));
          } else {
            const numbers = ballsData.match(/\d+/g);
            if (numbers) {
              return numbers.map(num => parseInt(num, 10)).filter(num => !isNaN(num));
            }
          }
        }
        return [];
      }
      
      // 查询历史数据
      const querySql = `
        SELECT
          issue AS period,
          red,
          blue
        FROM lottery_results
        WHERE issue < ?
        ORDER BY issue DESC
        LIMIT ?
      `;
      
      console.log('执行SQL查询:', querySql);
      console.log('查询参数:', [latest_period, parsedStatsRange]);
      
      const historyResults = await query(querySql, [latest_period, parsedStatsRange]);
      console.log('查询结果数量:', historyResults.length);
      
      if (!historyResults || historyResults.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '未找到指定范围的开奖数据'
        });
      }
      
      // 返回原始的组合详情数据，而不是计算从未出现球
      // 遍历历史数据，查找组合出现的记录
      const resultList = [];
      let index = 1;
      
      for (let i = 1; i < historyResults.length; i++) {
        const record = historyResults[i];
        const nextRecord = historyResults[i - 1];
        const drawNumbers = processBalls(type === 'front' ? record.red : record.blue);
        
        // 遍历所有组合
        for (const combo of combinations) {
          // 提取组合中的主球（前两个球）
          const mainCombo = combo.split('-').slice(0, 2).join('-');
          const comboNumbers = mainCombo.split('-').map(num => parseInt(num));
          
          // 检查组合是否在当前开奖记录中
          if (comboNumbers.every(num => drawNumbers.includes(num))) {
            // 检查目标球是否出现过
            const nextDrawNumbers = processBalls(type === 'front' ? nextRecord.red : nextRecord.blue);
            
            // 构建结果对象
            const result = {
              index: index++,
              period: record.period,
              combination: mainCombo,
              draw_info: drawNumbers,
              next_period: nextRecord.period,
              next_draw_info: nextDrawNumbers
            };
            
            // 如果指定了target_ball，只返回包含target_ball的记录
            if (target_ball === null || target_ball === undefined || nextDrawNumbers.includes(parseInt(target_ball))) {
              resultList.push(result);
            }
          }
        }
      }
      
      console.log('查询完成，找到匹配记录:', resultList.length);
      
      return res.status(200).json({
        code: 200,
        data: resultList
      });
      
    } catch (error) {
      console.error('组合详情处理失败:', error.stack);
      // 直接返回错误信息，不使用全局错误处理中间件
      return res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        error: error.message,
        stack: error.stack
      });
    }
  })();
});

// 添加一个中间件来捕获请求体解析错误
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.type === 'entity.parse.failed') {
    console.error('请求体解析错误:', err);
    return res.status(400).json({
      code: 400,
      message: '请求体格式错误，请检查JSON格式',
      error: err.message
    });
  }
  next(err);
});

// 注册其他带zuhe前缀的路由
app.use('/zuhe/dao_shu_3_qi_liang_qiu_zu_he_xiang_qing', daoShu3QiLiangQiuZuHeXiangQingRouter); // 注册倒数3期两球组合详情路由
app.use('/zuhe/dao_shu_4_qi_liang_qiu_zu_he_xiang_qing', daoShu4QiLiangQiuZuHeXiangQingRouter); // 注册倒数4期两球组合详情路由
app.use('/zuhe/dao_shu_5_qi_liang_qiu_zu_he_xiang_qing', daoShu5QiLiangQiuZuHeXiangQingRouter); // 注册倒数5期两球组合详情路由
app.use('/zuhe/dao_shu_6_qi_liang_qiu_zu_he_xiang_qing', daoShu6QiLiangQiuZuHeXiangQingRouter); // 注册倒数6期两球组合详情路由
app.use('/zuhe/dao_shu_7_qi_liang_qiu_zu_he_xiang_qing', daoShu7QiLiangQiuZuHeXiangQingRouter); // 注册倒数7期两球组合详情路由
app.use('/zuhe/dao_shu_8_qi_liang_qiu_zu_he_xiang_qing', daoShu8QiLiangQiuZuHeXiangQingRouter); // 注册倒数8期两球组合详情路由
// 导入倒数9期两球组合详情路由
const daoShu9QiLiangQiuZuHeXiangQingRouter = require('./倒数9期两球组合详情服务器.js'); // 导入倒数9期两球组合详情路由
app.use('/zuhe/dao_shu_9_qi_liang_qiu_zu_he_xiang_qing', daoShu9QiLiangQiuZuHeXiangQingRouter); // 注册倒数9期两球组合详情路由
app.use('/san_qiu_zu_he_xiang_qing', sanQiuZuHeXiangQingRouter); // 注册最新1期三球组合详情路由
app.use('/san_qiu_xiang_qing', sanQiuXiangQingRouter);
app.use('/huo_qu_sha_hao_hui_ce', shaHaoHuiCeRouter); // 注册杀号回测路由
app.use('/dao_shu_2_qi_sha_hao_hui_ce', daoShu2QiShaHaoHuiCeRouter); // 注册倒数2期杀号回测路由
app.use('/dao_shu_3_qi_sha_hao_hui_ce', daoShu3QiShaHaoHuiCeRouter); // 注册倒数3期杀号回测路由
app.use('/dao_shu_4_qi_sha_hao_hui_ce', daoShu4QiShaHaoHuiCeRouter); // 注册倒数4期杀号回测路由
app.use('/dao_shu_5_qi_sha_hao_hui_ce', daoShu5QiShaHaoHuiCeRouter); // 注册倒数5期杀号回测路由
app.use('/san_qiu_sha_hao_hui_ce', sanQiuShaHaoHuiCeRouter); // 注册三球组合前区杀号回测路由
app.use('/dao_shu_2_qi_san_qiu_sha_hao_hui_ce', daoShu2QiSanQiuShaHaoHuiCeRouter); // 注册倒数2期三球组合前区杀号回测路由
app.use('/dao_shu_3_qi_san_qiu_sha_hao_hui_ce', daoShu3QiSanQiuShaHaoHuiCeRouter); // 注册倒数3期三球组合前区杀号回测路由
app.use('/huo_qu_sha_hao_hou_hui_ce', huoQuShaHaoHouHuiCeRouter); // 注册后区杀号回测路由
app.use('/dao_shu_2_qi_hou_qu_sha_hao_hui_ce', daoShu2QiHouQuShaHaoHuiCeRouter); // 注册倒数2期后区杀号回测路由
app.use('/dao_shu_3_qi_hou_qu_sha_hao_hui_ce', daoShu3QiHouQuShaHaoHuiCeRouter); // 注册倒数3期后区杀号回测路由
app.use('/dao_shu_4_qi_hou_qu_sha_hao_hui_ce', daoShu4QiHouQuShaHaoHuiCeRouter); // 注册倒数4期后区杀号回测路由
app.use('/dao_shu_5_qi_hou_qu_sha_hao_hui_ce', daoShu5QiHouQuShaHaoHuiCeRouter); // 注册倒数5期后区杀号回测路由
// 注册近两期两球杀号回测路由
app.use('/jin_liang_qi_qian_qu_sha_hao_hui_ce', jinLiangQiQianQuShaHaoHuiCeRouter); // 注册近两期两球前区杀号回测路由
app.use('/jin_liang_qi_hou_qu_sha_hao_hui_ce', jinLiangQiHouQuShaHaoHuiCeRouter); // 注册近两期两球后区杀号回测路由
// 注册最新1期两球买号回测路由
app.use('/huo_qu_sha_hao_mai_hao_hui_ce', zuiXinYiQiLiangQiuQianQuMaiHaoHuiCeRouter); // 注册最新1期两球前区买号回测路由
app.use('/huo_qu_sha_hao_hou_mai_hao_hui_ce', zuiXinYiQiLiangQiuHouQuMaiHaoHuiCeRouter); // 注册最新1期两球后区买号回测路由
// 注册倒数2期两球前区买号回测路由
app.use('/dao_shu_2_qi_mai_hao_hui_ce', daoShu2QiLiangQiuQianQuMaiHaoHuiCeRouter); // 注册倒数2期两球前区买号回测路由
// 注册倒数3期两球前区买号回测路由
app.use('/dao_shu_3_qi_mai_hao_hui_ce', daoShu3QiLiangQiuQianQuMaiHaoHuiCeRouter); // 注册倒数3期两球前区买号回测路由
// 注册倒数4期两球前区买号回测路由
app.use('/dao_shu_4_qi_mai_hao_hui_ce', daoShu4QiLiangQiuQianQuMaiHaoHuiCeRouter); // 注册倒数4期两球前区买号回测路由
// 注册倒数5期两球前区买号回测路由
app.use('/dao_shu_5_qi_mai_hao_hui_ce', daoShu5QiLiangQiuQianQuMaiHaoHuiCeRouter); // 注册倒数5期两球前区买号回测路由
// 注册倒数6期两球前区买号回测路由
app.use('/dao_shu_6_qi_mai_hao_hui_ce', daoShu6QiLiangQiuQianQuMaiHaoHuiCeRouter); // 注册倒数6期两球前区买号回测路由
app.use('/dao_shu_5_qi_qian_qu_mai_hao_hui_ce', daoShu5QiLiangQiuQianQuMaiHaoHuiCeRouter); // 注册倒数5期前区买号回测路由（兼容前端请求路径）
// 注册近两期两球前区买号回测路由
app.use('/jin_liang_qi_mai_hao_hui_ce', jinLiangQiLiangQiuQianQuMaiHaoHuiCeRouter); // 注册近两期两球前区买号回测路由
// 注册近两期两球后区买号回测路由
app.use('/jin_liang_qi_hou_qu_mai_hao_hui_ce', jinLiangQiLiangQiuHouQuMaiHaoHuiCeRouter); // 注册近两期两球后区买号回测路由
// 注册最新1期三球前区买号回测路由
app.use('/san_qiu_mai_hao_hui_ce', zuiXinYiQiSanQiuQianQuMaiHaoHuiCeRouter); // 注册最新1期三球前区买号回测路由
// 注册倒数2期三球前区买号回测路由
app.use('/dao_shu_2_qi_san_qiu_mai_hao_hui_ce', daoShu2QiSanQiuQianQuMaiHaoHuiCeRouter); // 注册倒数2期三球前区买号回测路由
// 注册倒数3期三球前区买号回测路由
app.use('/dao_shu_3_qi_san_qiu_mai_hao_hui_ce', daoShu3QiSanQiuQianQuMaiHaoHuiCeRouter); // 注册倒数3期三球前区买号回测路由
app.use('/huo_qu_dao_shu_2_qi_hou_mai_hao_hui_ce', daoShu2QiLiangQiuHouQuMaiHaoHuiCeRouter); // 注册倒数2期两球后区买号回测路由
app.use('/dao_shu_2_qi_mai_hao_hui_ce_hou', daoShu2QiLiangQiuHouQuMaiHaoHuiCeRouter); // 注册倒数2期两球后区买号回测路由（兼容前端请求路径）
app.use('/huo_qu_dao_shu_3_qi_hou_mai_hao_hui_ce', daoShu3QiLiangQiuHouQuMaiHaoHuiCeRouter); // 注册倒数3期两球后区买号回测路由
app.use('/huo_qu_dao_shu_4_qi_hou_mai_hao_hui_ce', daoShu4QiLiangQiuHouQuMaiHaoHuiCeRouter); // 注册倒数4期两球后区买号回测路由
app.use('/dao_shu_4_qi_hou_mai_hao_hui_ce', daoShu4QiLiangQiuHouQuMaiHaoHuiCeRouter); // 注册倒数4期两球后区买号回测路由（兼容前端请求路径）
app.use('/huo_qu_dao_shu_5_qi_hou_mai_hao_hui_ce', daoShu5QiLiangQiuHouQuMaiHaoHuiCeRouter); // 注册倒数5期两球后区买号回测路由
app.use('/dao_shu_5_qi_hou_mai_hao_hui_ce', daoShu5QiLiangQiuHouQuMaiHaoHuiCeRouter); // 注册倒数5期两球后区买号回测路由（兼容前端请求路径）
// 注册幻圆回测路由
app.use('/huan_yuan_hui_ce_jing_xiang', huanYuanHuiCeJingXiangRouter); // 注册幻圆回测镜像对称路由
app.use('/huan_yuan_hui_ce_zhou_xian', huanYuanHuiCeZhouXianRouter); // 注册幻圆回测轴线对称路由
app.use('/huan_yuan_hui_ce_yuan_huan', huanYuanHuiCeYuanHuanRouter); // 注册幻圆回测圆环对称路由
app.use('/huan_yuan_hui_ce_hu_bu', huanYuanHuiCeHuBuRouter); // 注册幻圆回测互补对称路由
app.use('/huan_yuan_hui_ce_re_leng', huanYuanHuiCeReLengRouter); // 注册幻圆回测冷热对称路由

// 注册回测结果保存和获取路由
app.use('/', huiCeJieGuoRouter);

// 注册前区深度预测路由
app.use('/qian_qu_shen_du_yu_ce', qianQuShenDuYuCeRouter);
app.use('/qi_hao_kai_jiang_xin_xi', qiHaoKaiJiangXinXiRouter);

// 测试路由
app.get('/test', async (req, res) => {
  try {
    console.log('收到测试请求，req.query:', req.query);
    const { backtest_period, backtest_method } = req.query;
    res.json({
      success: true,
      message: '测试成功',
      backtest_period: backtest_period,
      backtest_method: backtest_method
    });
  } catch (error) {
    console.error('处理测试请求失败:', error);
    res.json({
      success: false,
      message: error.message
    });
  }
});

// 获取lottery_results总条数
app.get('/huo_qu_lottery_results_total', async (req, res) => {
  try {
    const rows = await query('SELECT COUNT(*) AS count FROM lottery_results');
    const total = rows && rows.length ? rows[0].count : 0;
    res.json({ success: true, total });
  } catch (error) {
    res.status(500).json({ success: false, message: '数据库查询失败' });
  }
});

// 获取最新数据列表（与前端data.js兼容）
app.get('/getLatestData', async (req, res) => {
  try {
    const rows = await query(`
      SELECT issue, draw_date AS drawDate, week, red, blue, sum, span, area_ratio, odd_even_ratio 
      FROM lottery_results 
      ORDER BY CAST(issue AS UNSIGNED) DESC 
      LIMIT 10
    `);
    const latestResults = rows.map(item => ({
      issue: item.issue,
      drawDate: item.drawDate,
      week: item.week,
      red: item.red,
      blue: item.blue,
      sum: item.sum,
      span: item.span,
      area_ratio: item.area_ratio,
      odd_even_ratio: item.odd_even_ratio
    }));
    res.json({ success: true, latestResults, fromMock: false });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取最新数据失败' });
  }
});

// 获取近两期开奖数据
app.get('/sql_jin_liang_qi', async (req, res) => {
  try {
    const result = await query('SELECT * FROM lottery_results ORDER BY issue DESC LIMIT 2');
    if (result && result.length > 0) {
      res.json({ success: true, data: result });
    } else {
      res.json({ success: false, message: '未找到数据' });
    }
  } catch (error) {
    console.error('获取近两期开奖数据失败:', error);
    res.status(500).json({ success: false, message: '数据库查询失败' });
  }
});

// 根据期号获取开奖信息
app.get('/sql_kai_jiang_info', async (req, res) => {
  try {
    const { period } = req.query;
    if (!period) {
      return res.status(400).json({ success: false, message: '期号参数不能为空' });
    }
    
    // 查询指定期号的开奖信息
    const result = await query('SELECT * FROM lottery_results WHERE issue = ?', [period]);
    
    if (result && result.length > 0) {
      const drawInfo = result[0];
      
      // 处理球号数据
      let firstZoneNumbers = [];
      let lastZoneNumbers = [];
      
      // 解析前区号码
      if (drawInfo.red) {
        if (typeof drawInfo.red === 'string') {
          if (drawInfo.red.includes(',')) {
            firstZoneNumbers = drawInfo.red.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num));
          } else if (drawInfo.red.includes(' ')) {
            firstZoneNumbers = drawInfo.red.split(' ').filter(num => num.trim() !== '').map(num => parseInt(num.trim())).filter(num => !isNaN(num));
          } else {
            firstZoneNumbers = (drawInfo.red.match(/\d+/g) || []).map(num => parseInt(num)).filter(num => !isNaN(num));
          }
        } else if (Array.isArray(drawInfo.red)) {
          firstZoneNumbers = drawInfo.red.map(num => parseInt(num)).filter(num => !isNaN(num));
        }
      }
      
      // 解析后区号码
      if (drawInfo.blue) {
        if (typeof drawInfo.blue === 'string') {
          if (drawInfo.blue.includes(',')) {
            lastZoneNumbers = drawInfo.blue.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num));
          } else if (drawInfo.blue.includes(' ')) {
            lastZoneNumbers = drawInfo.blue.split(' ').filter(num => num.trim() !== '').map(num => parseInt(num.trim())).filter(num => !isNaN(num));
          } else {
            lastZoneNumbers = (drawInfo.blue.match(/\d+/g) || []).map(num => parseInt(num)).filter(num => !isNaN(num));
          }
        } else if (Array.isArray(drawInfo.blue)) {
          lastZoneNumbers = drawInfo.blue.map(num => parseInt(num)).filter(num => !isNaN(num));
        }
      }
      
      res.json({
        success: true,
        drawInfo: {
          period: drawInfo.issue,
          drawDate: drawInfo.draw_date,
          firstZoneNumbers: firstZoneNumbers,
          lastZoneNumbers: lastZoneNumbers
        }
      });
    } else {
      res.json({ success: false, message: '未找到指定期号的开奖信息' });
    }
  } catch (error) {
    console.error('根据期号获取开奖信息失败:', error);
    res.status(500).json({ success: false, message: '数据库查询失败' });
  }
});

// 获取近五期开奖数据
app.get('/huo_qu_jin_wu_qi_kai_jiang', async (req, res) => {
  try {
    const result = await query('SELECT issue, draw_date, red, blue FROM lottery_results ORDER BY draw_date DESC LIMIT 5');
    if (result && result.length > 0) {
      // 转换数据格式，使其与前端期望的格式一致
      const formattedData = result.map(item => {
        // 处理可能的字符串形式的号码数据
        let firstZoneNumbers = item.red || [];
        let lastZoneNumbers = item.blue || [];
        
        // 解析前区号码
        if (typeof firstZoneNumbers === 'string') {
          if (firstZoneNumbers.includes(',')) {
            firstZoneNumbers = firstZoneNumbers.split(',').map(num => parseInt(num.trim()));
          } else if (firstZoneNumbers.includes(' ')) {
            firstZoneNumbers = firstZoneNumbers.split(' ').filter(num => num.trim() !== '').map(num => parseInt(num.trim()));
          } else {
            firstZoneNumbers = (firstZoneNumbers.match(/\d+/g) || []).map(num => parseInt(num));
          }
        }
        
        // 解析后区号码
        if (typeof lastZoneNumbers === 'string') {
          if (lastZoneNumbers.includes(',')) {
            lastZoneNumbers = lastZoneNumbers.split(',').map(num => parseInt(num.trim()));
          } else if (lastZoneNumbers.includes(' ')) {
            lastZoneNumbers = lastZoneNumbers.split(' ').filter(num => num.trim() !== '').map(num => parseInt(num.trim()));
          } else {
            lastZoneNumbers = (lastZoneNumbers.match(/\d+/g) || []).map(num => parseInt(num));
          }
        }
        
        // 格式化日期
        let formattedDate = item.draw_date;
        if (formattedDate instanceof Date) {
          formattedDate = formattedDate.toISOString().split('T')[0];
        } else if (typeof formattedDate === 'string') {
          if (formattedDate.includes('T')) {
            formattedDate = formattedDate.split('T')[0];
          }
        }
        
        return {
          period: item.issue + '期',
          drawDate: formattedDate,
          firstZoneNumbers,
          lastZoneNumbers
        };
      });
      
      res.json({ success: true, data: formattedData });
    } else {
      res.json({ success: false, message: '未找到数据' });
    }
  } catch (error) {
    console.error('获取近五期开奖数据失败:', error);
    res.status(500).json({ success: false, message: '数据库查询失败' });
  }
});

// 推荐杀号占位接口（如需可替换为真实逻辑）
app.get('/huo_qu_qian_qu_tui_jian_sha_hao', async (req, res) => {
  try {
    res.json({ success: true, killNumbers: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

app.get('/huo_qu_hou_qu_tui_jian_sha_hao', async (req, res) => {
  try {
    res.json({ success: true, killNumbers: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

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
      console.log(`获取SQL数据接口: http://localhost:${PORT}/huo_qu_sql_shu_ju`);
      console.log(`获取最新期号接口: http://localhost:${PORT}/sql_zui_xin_yi_qi`);
      console.log(`获取倒数第二期接口: http://localhost:${PORT}/sql_dao_shu_2_qi`);
console.log(`获取倒数第三期接口: http://localhost:${PORT}/sql_dao_shu_3_qi`);
console.log(`获取倒数第四期接口: http://localhost:${PORT}/sql_dao_shu_4_qi`);
console.log(`获取倒数第五期接口: http://localhost:${PORT}/sql_dao_shu_5_qi`);
console.log(`推荐杀号接口: http://localhost:${PORT}/dao_shu_2_qi_tui_jian_sha_hao`);
console.log(`获取体彩数据接口: http://localhost:${PORT}/huo_qu_ti_cai_shu_ju`);
console.log(`更新开奖数据接口: http://localhost:${PORT}/geng_xin_kai_jiang`);
console.log(`双杀分析接口: http://localhost:${PORT}/shuang_sha_fen_xi`);
console.log(`倒数2期双杀分析接口: http://localhost:${PORT}/dao_shu_2_qi_shuang_sha_fen_xi`);
console.log(`倒数2期前区两球组合接口: http://localhost:${PORT}/dao_shu_2_qi_liang_qiu_zu_he`);
console.log(`倒数2期后区两球组合接口: http://localhost:${PORT}/dao_shu_2_qi_hou_qu_zu_he`);
console.log(`倒数2期后区两球组合分析接口: http://localhost:${PORT}/dao_shu_2_qi_hou_qu_liang_qiu_zu_he`);
console.log(`倒数3期前区两球组合接口: http://localhost:${PORT}/dao_shu_3_qi_liang_qiu_zu_he`);
console.log(`倒数3期后区两球组合接口: http://localhost:${PORT}/dao_shu_3_qi_hou_qu_zu_he`);
console.log(`倒数4期前区两球组合接口: http://localhost:${PORT}/dao_shu_4_qi_liang_qiu_zu_he`);
console.log(`倒数4期后区两球组合接口: http://localhost:${PORT}/dao_shu_4_qi_hou_qu_zu_he`);
console.log(`倒数5期前区两球组合接口: http://localhost:${PORT}/dao_shu_5_qi_liang_qiu_zu_he`);
console.log(`倒数5期后区两球组合接口: http://localhost:${PORT}/dao_shu_5_qi_hou_qu_zu_he`);
console.log(`倒数6期前区两球组合接口: http://localhost:${PORT}/dao_shu_6_qi_liang_qiu_zu_he`);
console.log(`倒数6期后区两球组合接口: http://localhost:${PORT}/dao_shu_6_qi_hou_qu_zu_he`);
console.log(`倒数7期前区两球组合接口: http://localhost:${PORT}/dao_shu_7_qi_liang_qiu_zu_he`);
console.log(`倒数7期后区两球组合接口: http://localhost:${PORT}/dao_shu_7_qi_hou_qu_zu_he`);
console.log(`倒数8期前区两球组合接口: http://localhost:${PORT}/dao_shu_8_qi_liang_qiu_zu_he`);
console.log(`倒数8期后区两球组合接口: http://localhost:${PORT}/dao_shu_8_qi_hou_qu_zu_he`);
console.log(`倒数9期前区两球组合接口: http://localhost:${PORT}/dao_shu_9_qi_liang_qiu_zu_he`);
console.log(`倒数9期后区两球组合接口: http://localhost:${PORT}/dao_shu_9_qi_hou_qu_zu_he`);
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