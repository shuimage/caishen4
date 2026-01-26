// 倒数3期两球组合详情路由器 - 作为模块导出，用于主服务器注册
const express = require('express');
const { query } = require('./数据库配置.js');

const router = express.Router();

// 注意：CORS和JSON解析中间件已在主服务器中配置，这里不需要重复配置

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
    .map(part => parseInt(part));
  
  return comboParts.every(part => drawNumbers.includes(part));
}

// 接口：获取倒数3期两球组合详情
router.post('/', async (req, res) => {
  try {
    // 获取请求参数
    const { latest_period, type = 'front', combinations = [], stats_range = 100, target_ball = null } = req.body;
    
    // 参数验证
    if (!latest_period) {
      return res.status(400).json({ code: 400, message: '最新期号是必填参数' });
    }
    
    if (!Array.isArray(combinations) || combinations.length === 0) {
      return res.status(400).json({ code: 400, message: '组合数组不能为空' });
    }
    
    // 验证统计范围
    if (stats_range !== 'all' && (!Number.isInteger(stats_range) || stats_range <= 0)) {
      return res.status(400).json({ code: 400, message: '统计范围必须是正整数或"all"' });
    }
    
    // 验证类型
    if (type !== 'front' && type !== 'back') {
      return res.status(400).json({ code: 400, message: '类型只能是front或back' });
    }
    
    // 直接查询倒数第3期的开奖数据（基于id排序，取最新的第3条）
    let daoShu3QiData = await query(
      'SELECT * FROM lottery_results ORDER BY id DESC LIMIT 2, 1'
    );
    
    // 如果没有结果，尝试另一种查询方式
    if (!daoShu3QiData || daoShu3QiData.length === 0) {
      // 获取最新期号
      const latestDraw = await query('SELECT id FROM lottery_results ORDER BY id DESC LIMIT 1');
      if (!latestDraw || latestDraw.length === 0) {
        // 如果没有找到最新期号，返回空数组表示没有匹配数据
        return res.json({ code: 200, message: 'success', data: [] });
      }
      const latestId = latestDraw[0].id;
      
      // 查询倒数第3期（id = latestId - 2）
      daoShu3QiData = await query(
        'SELECT * FROM lottery_results WHERE id = ? LIMIT 1',
        [latestId - 2]
      );
    }
    
    if (!daoShu3QiData || daoShu3QiData.length === 0) {
      // 如果没有找到倒数3期的数据，返回空数组表示没有匹配数据
      return res.json({ code: 200, message: 'success', data: [] });
    }
    
    const daoShu3QiResult = daoShu3QiData[0];
    
    // 提取倒数3期的开奖号码
    const drawField = type === 'front' ? 'red' : 'blue';
    const drawNumbers = processBalls(daoShu3QiResult[drawField]);
    
    console.log('使用的组合:', combinations);
    
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
        issue < '${daoShu3QiResult.issue}'
      ORDER BY issue DESC
    `;
    
    // 只有当stats_range不是'all'时，才添加LIMIT子句
    if (stats_range !== 'all') {
      sql += ` LIMIT ${limit}`;
    }
    
    // 执行查询，先获取足够多的数据
    let rawResults = await query(sql);
    
    console.log('原始查询结果数量:', rawResults.length);
    
    // 过滤出真正包含请求组合的记录，并查找下下下下期数据
    let results = [];
    
    // 遍历历史数据，查找组合出现的位置，并记录下下下期的号码
    // 注意：历史数据是按issue降序排列的，所以下下下期的索引是i-3
    for (let i = 3; i < rawResults.length; i++) {
      const currentDraw = rawResults[i];  // 当前期（组合出现的期数）
      const nextNextNextDraw = rawResults[i - 3]; // 下下下期（期号比当前期大3，因为数据是降序排列的）
      
      // 确保nextNextNextDraw存在
      if (!nextNextNextDraw) continue;
      
      const currentDrawNumbers = processBalls(currentDraw.draw_info);
      
      // 分离主组合和目标球，只检查主组合（前两个球）
      const isMatch = combinations.some(fullCombination => {
        const mainCombo = fullCombination.split('-').slice(0, 2).join('-');
        const match = checkCombinationInDraw(currentDrawNumbers, mainCombo);
        return match;
      });
      
      if (isMatch) {
        const nextNextNextDrawNumbers = processBalls(nextNextNextDraw.draw_info);
        
        // 直接添加结果，后续统一处理目标球
        results.push({
          id: currentDraw.id,
          period: currentDraw.issue,
          draw_info: currentDrawNumbers,
          next_next_next_period: nextNextNextDraw.issue,
          next_next_next_draw_info: nextNextNextDrawNumbers
        });
      }
    }
    
    // 如果有目标球，检查目标球是否在下下下下期出现
    if (target_ball !== null && target_ball !== undefined && target_ball !== '') {
      const targetBallNum = parseInt(target_ball);
      results = results.filter(result => {
        // 由于next_next_next_draw_info已经是通过processBalls处理过的数字数组，直接使用
        return result.next_next_next_draw_info.includes(targetBallNum);
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
    
    // 限制返回的数据数量，只有当stats_range不是'all'时才限制
    let limitedResults;
    if (stats_range === 'all') {
      limitedResults = indexedResults;
    } else {
      limitedResults = indexedResults.slice(0, stats_range);
    }
    
    console.log('最终返回的结果数量:', limitedResults.length);
    
    // 返回成功结果，即使没有匹配记录也返回空数组
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
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: '倒数3期两球组合详情服务运行正常'
  });
});

// 全局错误处理中间件
router.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
});

// 导出router以便在主服务器中使用
module.exports = router;