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
const daoShu4QiHouQuZuHeRouter = require('./倒数4期两球组合后区.js'); // 导入倒数4期后区两球组合路由
const daoShu5QiLiangQiuZuHeRouter = require('./倒数5期两球组合前区.js'); // 导入倒数5期后区两球组合路由
const daoShu5QiHouQuZuHeRouter = require('./倒数5期两球组合后区.js'); // 导入倒数5期后区两球组合路由
// 导入近两期两球组合路由
const jinLiangQiLiangQiuZuHeFrontRouter = require('./近两期两球组合前区.js'); // 导入近两期前区两球组合路由
const jinLiangQiLiangQiuZuHeBackRouter = require('./近两期两球组合后区.js'); // 导入近两期后区两球组合路由
const jinLiangQiLiangQiuZuHeXiangQingRouter = require('./近两期两球组合详情.js'); // 导入近两期两球组合详情路由
const zuHeXiangQingRouter = require('./组合详情.js');
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
const daoShu3QiHouQuShaHaoHuiCeRouter = require('./倒数3期两球后区杀号回测.js'); // 导入倒数3期后区杀号回测路由

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
// 注册近两期两球组合路由
app.use('/jin_liang_qi_liang_qiu_zu_he_front', jinLiangQiLiangQiuZuHeFrontRouter); // 注册近两期前区两球组合路由
app.use('/jin_liang_qi_liang_qiu_zu_he_back', jinLiangQiLiangQiuZuHeBackRouter); // 注册近两期后区两球组合路由
app.use('/jin_liang_qi_liang_qiu_zu_he_xiang_qing', jinLiangQiLiangQiuZuHeXiangQingRouter); // 注册近两期两球组合详情路由
const daoShu2QiSanQiuZuHeRouter = require('./倒数2期三球组合.js');
app.use('/dao_shu_2_qi_san_qiu_zu_he', daoShu2QiSanQiuZuHeRouter); // 注册倒数2期前区三球组合路由
const daoShu2QiSanQiuZuHeXiangQingRouter = require('./倒数2期三球组合详情.js');
app.use('/dao_shu_2_qi_san_qiu_zu_he_xiang_qing', daoShu2QiSanQiuZuHeXiangQingRouter); // 注册倒数2期前区三球组合详情路由
const daoShu3QiSanQiuZuHeRouter = require('./倒数3期三球组合');
app.use('/dao_shu_3_qi_san_qiu_zu_he', daoShu3QiSanQiuZuHeRouter); // 注册倒数3期前区三球组合路由
const daoShu3QiSanQiuZuHeXiangQingRouter = require('./倒数3期三球组合详情.js');
app.use('/dao_shu_3_qi_san_qiu_zu_he_xiang_qing', daoShu3QiSanQiuZuHeXiangQingRouter); // 注册倒数3期前区三球组合详情路由

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

// 注册中间件，放在直接路由之后
app.use('/zuhe', zuHeXiangQingRouter);
app.use('/zuhe', daoShu3QiLiangQiuZuHeXiangQingRouter); // 注册倒数3期两球组合详情路由
app.use('/zuhe', daoShu4QiLiangQiuZuHeXiangQingRouter); // 注册倒数4期两球组合详情路由
app.use('/zuhe', daoShu5QiLiangQiuZuHeXiangQingRouter); // 注册倒数5期两球组合详情路由
app.use('/san_qiu_zu_he_xiang_qing', sanQiuZuHeXiangQingRouter); // 注册最新1期三球组合详情路由
app.use('/', sanQiuXiangQingRouter);
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