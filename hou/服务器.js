const express = require('express');
const app = express();
const { query } = require('./数据库配置.js');
const PORT = 18889;

// 导入路由模块
const huoQuSqlShuJuRouter = require('./获取SQL数据.js');
const sqlZuiXinYiQiRouter = require('./SQL最新一期.js');
const sqlDaoShu2QiRouter = require('./SQL倒数2期.js');
const sqlDaoShu3QiRouter = require('./SQL倒数3期.js');
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
const zuHeXiangQingRouter = require('./组合详情.js');
const sanQiuXiangQingRouter = require('./三球详情.js');
const sanQiuZuHeXiangQingRouter = require('./三球组合详情.js'); // 导入最新1期三球组合详情路由
const shaHaoHuiCeRouter = require('./杀号回测.js'); // 导入杀号回测路由
const daoShu2QiShaHaoHuiCeRouter = require('./倒数2期两球前区杀号回测.js'); // 导入倒数2期杀号回测路由
const daoShu3QiShaHaoHuiCeRouter = require('./倒数3期两球前区杀号回测.js'); // 导入倒数3期杀号回测路由
const sanQiuShaHaoHuiCeRouter = require('./最新1期三球前区杀号回测.js'); // 导入三球组合前区杀号回测路由
const daoShu2QiSanQiuShaHaoHuiCeRouter = require('./倒数2期三球前区杀号回测.js'); // 导入倒数2期三球组合前区杀号回测路由
const daoShu3QiSanQiuShaHaoHuiCeRouter = require('./倒数3期三球前区杀号回测.js'); // 导入倒数3期三球组合前区杀号回测路由
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
const daoShu2QiSanQiuZuHeRouter = require('./倒数2期三球组合.js');
app.use('/dao_shu_2_qi_san_qiu_zu_he', daoShu2QiSanQiuZuHeRouter); // 注册倒数2期前区三球组合路由
const daoShu2QiSanQiuZuHeXiangQingRouter = require('./倒数2期三球组合详情.js');
app.use('/dao_shu_2_qi_san_qiu_zu_he_xiang_qing', daoShu2QiSanQiuZuHeXiangQingRouter); // 注册倒数2期前区三球组合详情路由
const daoShu3QiSanQiuZuHeRouter = require('./倒数3期三球组合');
app.use('/dao_shu_3_qi_san_qiu_zu_he', daoShu3QiSanQiuZuHeRouter); // 注册倒数3期前区三球组合路由
const daoShu3QiSanQiuZuHeXiangQingRouter = require('./倒数3期三球组合详情.js');
app.use('/dao_shu_3_qi_san_qiu_zu_he_xiang_qing', daoShu3QiSanQiuZuHeXiangQingRouter); // 注册倒数3期前区三球组合详情路由

// 先注册直接路由，再注册中间件，避免中间件拦截
app.post('/zuhe/dao_shu_2_qi_liang_qiu_zu_he_xiang_qing', async (req, res) => {
  console.log('收到倒数2期两球组合详情请求，请求体:', req.body);
  try {
    const { latest_period, type = 'front', combinations = [], stats_range = 100, target_ball = null } = req.body;
    if (!latest_period) return res.status(400).json({ code: 400, message: '最新期号是必填参数' });
    if (!Array.isArray(combinations) || combinations.length === 0) return res.status(400).json({ code: 400, message: '组合数组不能为空' });
    if (!Number.isInteger(stats_range) || stats_range <= 0) return res.status(400).json({ code: 400, message: '统计范围必须是正整数' });
    if (type !== 'front' && type !== 'back') return res.status(400).json({ code: 400, message: '类型只能是front或back' });
    const periodPrefixMatch = latest_period.match(/[^0-9]+/);
    const periodPrefix = periodPrefixMatch ? periodPrefixMatch[0] : '';
    const periodNumber = parseInt(latest_period.replace(/[^0-9]/g, ''));
    if (isNaN(periodNumber)) return res.status(400).json({ code: 400, message: '最新期号格式不正确' });
    const daoShu2QiPeriodNumber = periodNumber - 2;
    const daoShu2QiPeriod = periodPrefix + daoShu2QiPeriodNumber.toString().padStart(3, '0');
    const daoShu2QiData = await query('SELECT * FROM lottery_results WHERE issue = ? LIMIT 1', [daoShu2QiPeriod]);
    if (!daoShu2QiData || daoShu2QiData.length === 0) return res.status(404).json({ code: 404, message: '未找到倒数2期的开奖数据' });
    const daoShu2QiResult = daoShu2QiData[0];
    const drawField = type === 'front' ? 'red' : 'blue';
    function __processBalls(balls) {
      if (!balls) return [];
      if (typeof balls === 'string') {
        // 处理 [x, x, x] 格式的JSON字符串
        if (balls.startsWith('[') && balls.endsWith(']')) {
          try {
            // 解析JSON字符串
            const parsedBalls = JSON.parse(balls);
            if (Array.isArray(parsedBalls)) {
              return parsedBalls.map(ball => String(ball).padStart(2, '0'));
            }
          } catch (e) {
            // JSON解析失败，尝试其他格式
          }
        }
        // 处理空格分隔的字符串格式
        return balls.split(' ').filter(ball => ball.trim() !== '').map(ball => String(ball).padStart(2, '0'));
      } else if (Array.isArray(balls)) {
        return balls.map(ball => String(ball).padStart(2, '0'));
      }
      return [];
    }
    // 查询近300期的所有记录，包括bian_hao字段
    // 使用字符串拼接，避免参数化查询的类型匹配问题
    const idValue = daoShu2QiResult.id;
    const limitValue = stats_range;
    let sql = `
      SELECT 
        id, 
        issue, 
        bian_hao,
        ${drawField} as draw_info
      FROM 
        lottery_results 
      WHERE 
        id < ${idValue}
      ORDER BY id ASC
      LIMIT ${limitValue}
    `;
    console.log('SQL查询语句:', sql);
    // 不使用参数数组，直接执行SQL语句
    const rows = await query(sql);
    
    // 创建bian_hao到数据的映射，方便快速查找下下期数据
    const bianHaoToDataMap = new Map();
    // 创建数字bian_hao到数据的映射，用于计算下下期
    const numericBianHaoToDataMap = new Map();
    
    rows.forEach(row => {
      bianHaoToDataMap.set(row.bian_hao, row);
      // 从bian_hao字符串中提取数字部分，比如从"LT00222"中提取"00222"，然后转换为数字222
      const numericBianHao = parseInt(row.bian_hao.replace(/[^0-9]/g, ''));
      numericBianHaoToDataMap.set(numericBianHao, row);
    });
    
    let results = [];
    
    // 遍历所有记录，找出符合条件的记录
    for (const row of rows) {
      console.log('当前记录:', { id: row.id, issue: row.issue, bian_hao: row.bian_hao });
      const currentDrawNumbers = __processBalls(row.draw_info);
      const currentSet = new Set(currentDrawNumbers);
      
      // 检查当前期是否包含组合
      const isMatch = combinations.some(combination => {
        const comboParts = combination.split('-').map(part => part.trim()).map(part => part.padStart(2, '0'));
        return comboParts.every(part => currentSet.has(part));
      });
      
      if (isMatch) {
        console.log('找到匹配组合的记录:', { id: row.id, issue: row.issue, bian_hao: row.bian_hao });
        // 从当前bian_hao中提取数字部分
        const currentNumericBianHao = parseInt(row.bian_hao.replace(/[^0-9]/g, ''));
        console.log('当前数字bian_hao:', currentNumericBianHao);
        // 计算下下期的数字bian_hao
        const nextNextNumericBianHao = currentNumericBianHao + 2;
        console.log('计算下下期数字bian_hao:', nextNextNumericBianHao);
        // 查找下下期数据
        const nextNextData = numericBianHaoToDataMap.get(nextNextNumericBianHao);
        
        if (nextNextData) {
          console.log('找到下下期数据:', { id: nextNextData.id, issue: nextNextData.issue, bian_hao: nextNextData.bian_hao });
          const nextNextDrawNumbers = __processBalls(nextNextData.draw_info);
          
          // 如果有目标球，检查目标球是否在下下期出现
          if (target_ball !== null && target_ball !== undefined && target_ball !== '') {
            const targetBallStr = String(target_ball).padStart(2, '0');
            console.log('检查目标球是否在下下期出现:', { target_ball: targetBallStr, nextNextDrawNumbers: nextNextDrawNumbers });
            if (nextNextDrawNumbers.includes(targetBallStr)) {
              results.push({
                index: 0, // 序号会在前端生成
                period: row.issue,
                draw_info: currentDrawNumbers,
                next_period: nextNextData.issue,
                next_draw_info: nextNextDrawNumbers
              });
            }
          } else {
            // 没有目标球，直接添加结果
            results.push({
              index: 0, // 序号会在前端生成
              period: row.issue,
              draw_info: currentDrawNumbers,
              next_period: nextNextData.issue,
              next_draw_info: nextNextDrawNumbers
            });
          }
        } else {
          console.log('未找到下下期数据，数字bian_hao:', nextNextNumericBianHao);
        }
      }
    }
    
    // 生成序号
    results = results.map((result, index) => ({
      ...result,
      index: index + 1
    }));
    
    res.json({ code: 200, message: 'success', data: results });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器内部错误', error: error.message });
  }
});

// 倒数3期两球组合详情接口
app.post('/dao_shu_3_qi_liang_qiu_zu_he_xiang_qing', async (req, res) => {
  console.log('收到倒数3期两球组合详情请求，请求体:', req.body);
  try {
    const { latest_period, type = 'front', combinations = [], stats_range = 100, target_ball = null } = req.body;
    if (!latest_period) return res.status(400).json({ code: 400, message: '最新期号是必填参数' });
    if (!Array.isArray(combinations) || combinations.length === 0) return res.status(400).json({ code: 400, message: '组合数组不能为空' });
    if (!Number.isInteger(stats_range) || stats_range <= 0) return res.status(400).json({ code: 400, message: '统计范围必须是正整数' });
    if (type !== 'front' && type !== 'back') return res.status(400).json({ code: 400, message: '类型只能是front或back' });
    const periodPrefixMatch = latest_period.match(/[^0-9]+/);
    const periodPrefix = periodPrefixMatch ? periodPrefixMatch[0] : '';
    const periodNumber = parseInt(latest_period.replace(/[^0-9]/g, ''));
    if (isNaN(periodNumber)) return res.status(400).json({ code: 400, message: '最新期号格式不正确' });
    const daoShu3QiPeriodNumber = periodNumber - 3;
    const daoShu3QiPeriod = periodPrefix + daoShu3QiPeriodNumber.toString().padStart(3, '0');
    const daoShu3QiData = await query('SELECT * FROM lottery_results WHERE issue = ? LIMIT 1', [daoShu3QiPeriod]);
    if (!daoShu3QiData || daoShu3QiData.length === 0) return res.status(404).json({ code: 404, message: '未找到倒数3期的开奖数据' });
    const daoShu3QiResult = daoShu3QiData[0];
    const drawField = type === 'front' ? 'red' : 'blue';
    function __processBalls(balls) {
      if (!balls) return [];
      if (typeof balls === 'string') {
        // 处理 [x, x, x] 格式的JSON字符串
        if (balls.startsWith('[') && balls.endsWith(']')) {
          try {
            // 解析JSON字符串
            const parsedBalls = JSON.parse(balls);
            if (Array.isArray(parsedBalls)) {
              return parsedBalls.map(ball => String(ball).padStart(2, '0'));
            }
          } catch (e) {
            // JSON解析失败，尝试其他格式
          }
        }
        // 处理空格分隔的字符串格式
        return balls.split(' ').filter(ball => ball.trim() !== '').map(ball => String(ball).padStart(2, '0'));
      } else if (Array.isArray(balls)) {
        return balls.map(ball => String(ball).padStart(2, '0'));
      }
      return [];
    }
    // 查询近300期的所有记录，包括bian_hao字段
    // 使用字符串拼接，避免参数化查询的类型匹配问题
    const idValue = daoShu3QiResult.id;
    const limitValue = stats_range;
    let sql = `
      SELECT 
        id, 
        issue, 
        bian_hao,
        ${drawField} as draw_info
      FROM 
        lottery_results 
      WHERE 
        id < ${idValue}
      ORDER BY id ASC
      LIMIT ${limitValue}
    `;
    console.log('SQL查询语句:', sql);
    // 不使用参数数组，直接执行SQL语句
    const rows = await query(sql);
    
    // 创建bian_hao到数据的映射，方便快速查找下下下期数据
    const bianHaoToDataMap = new Map();
    // 创建数字bian_hao到数据的映射，用于计算下下下期
    const numericBianHaoToDataMap = new Map();
    
    rows.forEach(row => {
      bianHaoToDataMap.set(row.bian_hao, row);
      // 从bian_hao字符串中提取数字部分，比如从"LT00222"中提取"00222"，然后转换为数字222
      const numericBianHao = parseInt(row.bian_hao.replace(/[^0-9]/g, ''));
      numericBianHaoToDataMap.set(numericBianHao, row);
    });
    
    let results = [];
    
    // 遍历所有记录，找出符合条件的记录
    for (const row of rows) {
      console.log('当前记录:', { id: row.id, issue: row.issue, bian_hao: row.bian_hao });
      const currentDrawNumbers = __processBalls(row.draw_info);
      const currentSet = new Set(currentDrawNumbers);
      
      // 检查当前期是否包含组合
      const isMatch = combinations.some(combination => {
        const comboParts = combination.split('-').map(part => part.trim()).map(part => part.padStart(2, '0'));
        return comboParts.every(part => currentSet.has(part));
      });
      
      if (isMatch) {
        console.log('找到匹配组合的记录:', { id: row.id, issue: row.issue, bian_hao: row.bian_hao });
        // 从当前bian_hao中提取数字部分
        const currentNumericBianHao = parseInt(row.bian_hao.replace(/[^0-9]/g, ''));
        console.log('当前数字bian_hao:', currentNumericBianHao);
        // 计算下下下期的数字bian_hao
        const nextNextNextNumericBianHao = currentNumericBianHao + 3;
        console.log('计算下下下期数字bian_hao:', nextNextNextNumericBianHao);
        // 查找下下下期数据
        const nextNextNextData = numericBianHaoToDataMap.get(nextNextNextNumericBianHao);
        
        if (nextNextNextData) {
          console.log('找到下下下期数据:', { id: nextNextNextData.id, issue: nextNextNextData.issue, bian_hao: nextNextNextData.bian_hao });
          const nextNextNextDrawNumbers = __processBalls(nextNextNextData.draw_info);
          
          // 如果有目标球，检查目标球是否在下下下期出现
          if (target_ball !== null && target_ball !== undefined && target_ball !== '') {
            const targetBallStr = String(target_ball).padStart(2, '0');
            console.log('检查目标球是否在下下下期出现:', { target_ball: targetBallStr, nextNextNextDrawNumbers: nextNextNextDrawNumbers });
            if (nextNextNextDrawNumbers.includes(targetBallStr)) {
              results.push({
                index: 0, // 序号会在前端生成
                period: row.issue,
                draw_info: currentDrawNumbers,
                next_next_next_period: nextNextNextData.issue,
                next_next_next_draw_info: nextNextNextDrawNumbers
              });
            }
          } else {
            // 没有目标球，直接添加结果
            results.push({
              index: 0, // 序号会在前端生成
              period: row.issue,
              draw_info: currentDrawNumbers,
              next_next_next_period: nextNextNextData.issue,
              next_next_next_draw_info: nextNextNextDrawNumbers
            });
          }
        } else {
          console.log('未找到下下下期数据，数字bian_hao:', nextNextNextNumericBianHao);
        }
      }
    }
    
    // 生成序号
    results = results.map((result, index) => ({
      ...result,
      index: index + 1
    }));
    
    res.json({ code: 200, message: 'success', data: results });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器内部错误', error: error.message });
  }
});

// 注册中间件，放在直接路由之后
app.use('/zuhe', zuHeXiangQingRouter);
app.use('/san_qiu_zu_he_xiang_qing', sanQiuZuHeXiangQingRouter); // 注册最新1期三球组合详情路由
app.use('/', sanQiuXiangQingRouter);
app.use('/huo_qu_sha_hao_hui_ce', shaHaoHuiCeRouter); // 注册杀号回测路由
app.use('/dao_shu_2_qi_sha_hao_hui_ce', daoShu2QiShaHaoHuiCeRouter); // 注册倒数2期杀号回测路由
app.use('/dao_shu_3_qi_sha_hao_hui_ce', daoShu3QiShaHaoHuiCeRouter); // 注册倒数3期杀号回测路由
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