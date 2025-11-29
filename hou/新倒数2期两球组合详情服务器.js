// 新倒数2期两球组合详情服务器 - 修正了组合匹配逻辑和下下期数据查询
const express = require('express');
const cors = require('cors');
const { query } = require('./数据库配置.js');

const app = express();

// 启用CORS
app.use(cors());

// 解析JSON请求体
app.use(express.json());

// 处理球号数据，确保格式一致
function processBalls(balls) {
  if (!balls) return [];
  // 将球号字符串转换为数组并处理成标准格式
  if (typeof balls === 'string') {
    return balls.split(' ')
      .filter(ball => ball.trim() !== '')
      .map(ball => String(ball).padStart(2, '0'));
  } else if (Array.isArray(balls)) {
    return balls.map(ball => String(ball).padStart(2, '0'));
  }
  return [];
}

// 精确检查组合是否在开奖号码中
function checkCombinationInDraw(drawNumbers, combination) {
  const comboParts = combination.split('-')
    .map(part => part.trim())
    .map(part => String(part).padStart(2, '0'));
  
  return comboParts.every(part => drawNumbers.includes(part));
}

// 接口：获取倒数2期两球组合详情
app.post('/zuhe/dao_shu_2_qi_liang_qiu_zu_he_xiang_qing', async (req, res) => {
  try {
    // 获取请求参数
    const { latest_period, type = 'front', combinations = [], stats_range = 100, target_ball = null } = req.body;
    
    console.log('收到请求参数:', { latest_period, type, combinations, stats_range, target_ball });
    
    // 参数验证
    if (!latest_period) {
      return res.status(400).json({ code: 400, message: '最新期号是必填参数' });
    }
    
    if (!Array.isArray(combinations) || combinations.length === 0) {
      return res.status(400).json({ code: 400, message: '组合数组不能为空' });
    }
    
    // 验证统计范围
    if (!Number.isInteger(stats_range) || stats_range <= 0) {
      return res.status(400).json({ code: 400, message: '统计范围必须是正整数' });
    }
    
    // 验证类型
    if (type !== 'front' && type !== 'back') {
      return res.status(400).json({ code: 400, message: '类型只能是front或back' });
    }
    
    // 解析最新期号，提取前缀和数字部分
    const periodPrefix = latest_period.match(/[^0-9]+/) ? latest_period.match(/[^0-9]+/)[0] : '';
    const periodNumber = parseInt(latest_period.replace(/[^0-9]/g, ''));
    
    if (isNaN(periodNumber)) {
      return res.status(400).json({ code: 400, message: '最新期号格式不正确' });
    }
    
    // 计算倒数2期的期号
    const daoShu2QiPeriodNumber = periodNumber - 2;
    const daoShu2QiPeriod = periodPrefix + daoShu2QiPeriodNumber.toString().padStart(3, '0');
    
    console.log('查询倒数2期:', daoShu2QiPeriod);
    
    // 查询倒数2期的开奖数据
    const daoShu2QiData = await query(
      'SELECT * FROM lottery_results WHERE issue = ? LIMIT 1',
      [daoShu2QiPeriod]
    );
    
    if (!daoShu2QiData || daoShu2QiData.length === 0) {
      return res.status(404).json({ code: 404, message: '未找到倒数2期的开奖数据' });
    }
    
    const daoShu2QiResult = daoShu2QiData[0];
    
    // 提取倒数2期的开奖号码
    const drawField = type === 'front' ? 'red' : 'blue';
    const drawNumbers = processBalls(daoShu2QiResult[drawField]);
    
    console.log('倒数2期开奖号码:', drawNumbers);
    
    // 检查所有请求的组合是否在倒数2期的开奖号码中出现
    const matchingCombinations = [];
    
    for (const combination of combinations) {
      if (checkCombinationInDraw(drawNumbers, combination)) {
        matchingCombinations.push(combination);
      }
    }
    
    console.log('匹配的组合:', matchingCombinations);
    
    if (matchingCombinations.length === 0) {
      return res.status(404).json({ code: 404, message: '在倒数2期中未找到匹配的组合' });
    }
    
    // 查询历史数据，查找这些组合出现的记录
    // 这次我们使用正确的JOIN来获取下下期数据 (id + 2)
    let sql = `
      SELECT 
        l1.id, 
        l1.issue as period, 
        l1.${drawField} as draw_info,
        l2.issue as next_period,
        l2.${drawField} as next_draw_info
      FROM 
        lottery_results l1
      LEFT JOIN 
        lottery_results l2 ON l1.id + 2 = l2.id
      WHERE 
        l1.id < ?
      ORDER BY l1.id DESC
      LIMIT ?
    `;
    
    // 执行查询，先获取足够多的数据
    let rawResults = await query(sql, [daoShu2QiResult.id, stats_range * 2]);
    
    console.log('原始查询结果数量:', rawResults.length);
    
    // 过滤出真正包含请求组合的记录
    const filteredResults = rawResults.filter(record => {
      const currentDrawNumbers = processBalls(record.draw_info);
      return matchingCombinations.some(combination => 
        checkCombinationInDraw(currentDrawNumbers, combination)
      );
    });
    
    console.log('过滤后的结果数量:', filteredResults.length);
    
    // 为结果添加索引
    const results = filteredResults.map((result, index) => ({
      ...result,
      index: index + 1
    }));
    
    // 限制返回的数据数量
    const limitedResults = results.slice(0, stats_range);
    
    console.log('最终返回的结果数量:', limitedResults.length);
    
    // 如果没有找到匹配的历史记录
    if (limitedResults.length === 0) {
      return res.status(404).json({ code: 404, message: '在指定范围内未找到匹配的组合数据' });
    }
    
    // 返回成功结果
    res.json({
      code: 200,
      message: 'success',
      data: limitedResults
    });
  } catch (error) {
    console.error('处理请求时发生错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

// 健康检查接口
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: '新倒数2期两球组合详情服务运行正常'
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
const PORT = 18894;
app.listen(PORT, () => {
  console.log(`新倒数2期两球组合详情服务已启动，监听端口 ${PORT}`);
});
*/

// 导出app以便在主服务器中使用
module.exports = app;
