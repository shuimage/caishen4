// 倒数5期两球组合详情服务器 - 支持查询倒数5期两球组合在下下下下下期的出现情况
const express = require('express');
const { query } = require('./数据库配置.js');

const router = express.Router();

// 解析JSON请求体
router.use(express.json());

// 处理球号数据，确保格式一致
function processBalls(balls) {
  try {
    if (!balls) return [];
    
    // 将球号字符串转换为数组并处理成标准格式
    if (typeof balls === 'string') {
      // 检查是否是数组格式的字符串，如"[9, 11, 19, 30, 35]"
      if (balls.startsWith('[') && balls.endsWith(']')) {
        try {
          const parsedBalls = JSON.parse(balls);
          if (Array.isArray(parsedBalls)) {
            return parsedBalls.map(ball => String(ball).padStart(2, '0'));
          }
        } catch (e) {
          // 解析失败，按照空格分隔处理
        }
      }
      // 否则按照空格分隔处理
      return balls.split(' ')
        .filter(ball => ball.trim() !== '')
        .map(ball => String(ball).padStart(2, '0'));
    } else if (Array.isArray(balls)) {
      // 如果是数组，检查第一个元素是否是字符串形式的数组元素
      if (balls.length > 0 && typeof balls[0] === 'string' && balls[0].startsWith('[')) {
        // 尝试将整个数组合并为一个字符串并解析
        try {
          const combinedString = balls.join(' ');
          const parsedBalls = JSON.parse(combinedString);
          if (Array.isArray(parsedBalls)) {
            return parsedBalls.map(ball => String(ball).padStart(2, '0'));
          }
        } catch (e) {
          // 解析失败，尝试处理每个元素
        }
      }
      return balls.map(ball => String(ball).padStart(2, '0'));
    }
  } catch (e) {
    console.error('处理球号数据失败:', e, 'balls:', balls);
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

// 接口：获取倒数5期两球组合详情
router.post('/', async (req, res) => {
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
    if (stats_range !== 'all' && (!Number.isInteger(stats_range) || stats_range <= 0)) {
      return res.status(400).json({ code: 400, message: '统计范围必须是正整数或"all"' });
    }
    
    // 验证类型
    if (type !== 'front' && type !== 'back') {
      return res.status(400).json({ code: 400, message: '类型只能是front或back' });
    }
    
    // 直接查询倒数第5期的开奖数据（基于id排序，取最新的第5条）
    let daoShu5QiData = await query(
      'SELECT * FROM lottery_results ORDER BY id DESC LIMIT 4, 1'
    );
    
    // 如果没有结果，尝试另一种查询方式
    if (!daoShu5QiData || daoShu5QiData.length === 0) {
      // 获取最新期号
      const latestDraw = await query('SELECT id FROM lottery_results ORDER BY id DESC LIMIT 1');
      if (!latestDraw || latestDraw.length === 0) {
        return res.status(404).json({ code: 404, message: '未找到开奖数据' });
      }
      const latestId = latestDraw[0].id;
      
      // 查询倒数第5期（id = latestId - 4）
      daoShu5QiData = await query(
        'SELECT * FROM lottery_results WHERE id = ? LIMIT 1',
        [latestId - 4]
      );
    }
    
    if (!daoShu5QiData || daoShu5QiData.length === 0) {
      return res.status(404).json({ code: 404, message: '未找到倒数5期的开奖数据' });
    }
    
    const daoShu5QiResult = daoShu5QiData[0];
    const daoShu5QiPeriod = daoShu5QiResult.issue;
    console.log('查询倒数5期:', daoShu5QiPeriod);
    
    // 提取倒数5期的开奖号码
    const drawField = type === 'front' ? 'red' : 'blue';
    const drawNumbers = processBalls(daoShu5QiResult[drawField]);
    
    console.log('倒数5期开奖号码:', drawNumbers);
    
    // 处理请求的组合，分离组合球和目标球
    const processedCombinations = combinations.map(combination => {
      const parts = combination.split('-');
      return {
        mainCombo: parts.slice(0, 2).join('-'), // 取前两个球作为主组合
        fullCombo: combination // 保留完整组合
      };
    });
    
    console.log('处理后的组合:', processedCombinations);
    
    // 直接使用所有请求的组合，不需要检查是否在倒数5期出现
    const matchingCombinations = processedCombinations.map(combo => combo.fullCombo);
    
    console.log('使用的组合:', matchingCombinations);
    
    // 查询历史数据，查找这些组合出现的记录
    // 查询足够多的记录，包括bian_hao字段
    let limit = Number(stats_range * 2);
    let id = Number(daoShu5QiResult.id);
    
    // 使用字符串替换构建SQL查询，避免参数类型问题
    let sql = `
      SELECT 
        id, 
        issue, 
        bian_hao,
        ${drawField} as draw_info
      FROM 
        lottery_results 
      WHERE 
        id < ${id}
      ORDER BY id ASC
    `;
    
    // 只有当stats_range不是'all'时，才添加LIMIT子句
    if (stats_range !== 'all') {
      sql += ` LIMIT ${limit}`;
    }
    
    // 确保daoShu5QiResult和id存在
    if (!daoShu5QiResult || typeof daoShu5QiResult.id === 'undefined') {
      console.error('倒数5期数据缺少id字段:', daoShu5QiResult);
      return res.status(500).json({ code: 500, message: '获取倒数5期数据失败，缺少id字段' });
    }
    
    // 执行查询，先获取足够多的数据
    let rawResults = await query(sql);
    
    console.log('原始查询结果数量:', rawResults.length);
    
    // 创建bian_hao到数据的映射，方便快速查找下下下下下期数据
    const bianHaoToDataMap = new Map();
    // 创建数字bian_hao到数据的映射，用于计算下下下下下期
    const numericBianHaoToDataMap = new Map();
    
    rawResults.forEach(row => {
      bianHaoToDataMap.set(row.bian_hao, row);
      // 从bian_hao字符串中提取数字部分，比如从"LT00222"中提取"00222"，然后转换为数字222
      const numericBianHao = parseInt(row.bian_hao.replace(/[^0-9]/g, ''));
      numericBianHaoToDataMap.set(numericBianHao, row);
    });
    
    // 过滤出真正包含请求组合的记录，并查找下下下下下期数据
    let results = [];
    
    console.log('开始过滤结果，原始数据数量:', rawResults.length);
    console.log('匹配组合:', matchingCombinations);
    
    rawResults.forEach(row => {
      try {
        const currentDrawNumbers = processBalls(row.draw_info);
        console.log('当前记录期号:', row.issue, '开奖号码:', currentDrawNumbers);
        
        // 分离主组合和目标球，只检查主组合（前两个球）
        const isMatch = matchingCombinations.some(fullCombination => {
          const mainCombo = fullCombination.split('-').slice(0, 2).join('-');
          const match = checkCombinationInDraw(currentDrawNumbers, mainCombo);
          console.log('检查组合:', mainCombo, '结果:', match);
          return match;
        });
        
        if (isMatch) {
          console.log('找到匹配组合的记录:', row.issue);
          // 从当前bian_hao中提取数字部分
          const currentNumericBianHao = parseInt(row.bian_hao.replace(/[^0-9]/g, ''));
          console.log('当前bian_hao数字部分:', currentNumericBianHao);
          
          // 计算下下下下下期的数字bian_hao（当前期+5）
          const nextNextNextNextNumericBianHao = currentNumericBianHao + 5;
          console.log('下下下下下期bian_hao数字部分:', nextNextNextNextNumericBianHao);
          
          // 查找下下下下下期数据
          const nextNextNextNextData = numericBianHaoToDataMap.get(nextNextNextNextNumericBianHao);
          
          if (nextNextNextNextData) {
            console.log('找到下下下下下期数据:', nextNextNextNextData.issue);
            const nextNextNextNextDrawNumbers = processBalls(nextNextNextNextData.draw_info);
            
            // 直接添加结果，后续统一处理目标球
            results.push({
              id: row.id,
              period: row.issue,
              draw_info: currentDrawNumbers,
              next_next_next_next_period: nextNextNextNextData.issue,
              next_next_next_next_draw_info: nextNextNextNextDrawNumbers
            });
          } else {
            console.log('未找到下下下下下期数据:', nextNextNextNextNumericBianHao);
          }
        }
      } catch (error) {
        console.error('处理记录时发生错误:', error, '记录:', row);
      }
    });
    
    console.log('过滤后的结果数量:', results.length);
    
    // 如果有目标球，检查目标球是否在下下下下下期出现
    if (target_ball !== null && target_ball !== undefined && target_ball !== '') {
      const targetBallStr = String(target_ball).padStart(2, '0');
      results = results.filter(result => {
        const nextDrawNumbers = Array.isArray(result.next_next_next_next_draw_info) ? 
          result.next_next_next_next_draw_info.map(num => String(num).padStart(2, '0')) : 
          processBalls(result.next_next_next_next_draw_info);
        return nextDrawNumbers.includes(targetBallStr);
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
    message: '倒数5期两球组合详情服务运行正常'
  });
});

// 导出router以便在主服务器中使用
module.exports = router;