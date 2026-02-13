// 参数说明:
// - latest_period: 必需，最新期号
// - type: 必需，类型，值可以是 "front" 或 "back"
// - combinations: 必需，组合数组
// - stats_range: 必需，统计范围
// - target_ball: 可选，目标球
// - x_period: 必需，倒数期数
// 接口功能: 分析倒数第X期两球组合的详细信息

const express = require('express');
const { query } = require('./数据库配置.js');

const router = express.Router();

/**
 * 获取倒数第X期两球组合详细信息
 * @param {string} latest_period - 最新期号
 * @param {string} type - 类型（front 或 back）
 * @param {Array} combinations - 组合数组
 * @param {string} stats_range - 统计范围
 * @param {string} target_ball - 目标球
 * @param {number} x_period - 倒数期数
 * @returns {Promise<Object>} 包含组合详细信息的结果
 */
async function getXLastCombinationDetails(latest_period, type, combinations, stats_range, target_ball, x_period) {
  try {
    // 验证参数
    if (!latest_period) {
      throw new Error('最新期号是必填参数');
    }
    if (!Array.isArray(combinations) || combinations.length === 0) {
      throw new Error('组合数组不能为空');
    }
    if (stats_range !== 'all' && (!Number.isInteger(stats_range) || stats_range <= 0)) {
      throw new Error('统计范围必须是正整数或"all"');
    }
    if (type !== 'front' && type !== 'back') {
      throw new Error('类型只能是front或back');
    }
    if (!x_period || isNaN(x_period) || parseInt(x_period) < 1 || parseInt(x_period) > 20) {
      throw new Error('倒数期数必须是1-20之间的整数');
    }

    const x = parseInt(x_period);

    // 获取倒数第X期的开奖数据
    const xLastResultSql = `
      SELECT * 
      FROM lottery_results 
      ORDER BY issue DESC 
      LIMIT ${x-1}, 1
    `;
    
    const xLastResult = await query(xLastResultSql);
    if (!xLastResult || xLastResult.length === 0) {
      throw new Error(`未找到倒数第${x}期开奖数据`);
    }
    
    const xLastDraw = xLastResult[0];
    console.log(`获取到倒数第${x}期开奖期号:`, xLastDraw.issue);
    
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
        issue < '${xLastDraw.issue}'
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
    
    return indexedResults;
  } catch (error) {
    console.error('倒数第X期两球组合详情分析出错:', error);
    throw error;
  }
}

/**
 * 倒数第X期两球组合详情接口
 * @route POST /zuhe/dao_shu_x_qi_liang_qiu_zu_he_xiang_qing
 * @group 数据分析 - 倒数第X期两球组合详情相关接口
 * @param {object} request.body.required - 请求体
 * @returns {object} 200 - 成功响应，包含组合详细信息
 * @returns {object} 400 - 参数错误
 * @returns {object} 500 - 服务器内部错误
 */
router.post('/', async (req, res) => {
  try {
    console.log('收到倒数X期两球组合详情请求，请求体:', req.body);
    
    const { latest_period, type = 'front', combinations = [], stats_range = 100, target_ball = null, x_period } = req.body;
    
    if (!latest_period) {
      return res.status(400).json({ code: 400, message: '最新期号是必填参数' });
    }
    
    if (!x_period) {
      return res.status(400).json({ code: 400, message: '倒数期数是必填参数' });
    }
    
    if (!Array.isArray(combinations) || combinations.length === 0) {
      return res.status(400).json({ code: 400, message: '组合数组不能为空' });
    }
    
    if (stats_range !== 'all' && (!Number.isInteger(stats_range) || stats_range <= 0)) {
      return res.status(400).json({ code: 400, message: '统计范围必须是正整数或"all"' });
    }
    
    if (type !== 'front' && type !== 'back') {
      return res.status(400).json({ code: 400, message: '类型只能是front或back' });
    }
    
    const results = await getXLastCombinationDetails(latest_period, type, combinations, stats_range, target_ball, x_period);
    
    res.status(200).json({
      code: 200,
      message: 'success',
      data: results
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

module.exports = router;