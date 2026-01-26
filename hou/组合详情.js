// zu_he_xiang_qing.js - 组合详情接口
// 功能: 统计指定号码组合在历史开奖数据中的出现情况及下一期关联信息
// 作者: AI Assistant
// 创建日期: 2024

// 导入必要的依赖模块
const express = require('express');
const { query } = require('./数据库配置.js'); // 导入数据库查询函数

// 创建Express路由器
const router = express.Router();

/**
 * 组合统计分析接口
 * 接口功能: 统计指定号码组合在历史开奖数据中的出现情况及下一期关联信息
 * 
 * 请求路径: POST /zu_he_xiang_qing
 * 
 * 请求参数:
 * - latest_period: string, 必填, 最新一期开奖期号（格式: YYYYMMDD或纯数字）
 * - target_ball: integer, 必填, 目标球号
 * - type: enum, 必填, 类型（front/back）
 * - combinations: array[string], 必填, 组合号码（如 ["01-02", "01-02-03", "01-02-03-04-05"]，支持2-5个球的组合）
 * - stats_range: integer, 必填, 统计期数范围（正整数，表示从latest_period向前统计的期数）
 * 
 * 响应格式说明:
 * 成功响应:
 * {
 *   "code": 200,
 *   "data": [
 *     {
 *       "index": 1,        // 序号,
 *       "period": "2025098", // 组合出现期号
 *       "combination": "01-03", // 匹配的组合
 *       "draw_info": [1, 3, 5, 7, 9], // 当前期号码
 *       "next_period": "2025099", // 下一期期号
 *       "next_draw_info": [2, 4, 6, 8, 10] // 下一期号码
 *     }
 *   ]
 * }
 * 
 * 失败响应:
 * {
 *   "code": 400,
 *   "message": "参数格式错误"
 * }
 */
/**
 * 组合详情接口 - POST /zu_he_xiang_qing
 * 
 * 主要功能：
 * 1. 接收客户端请求参数并进行全面验证
 * 2. 查询指定范围内的历史开奖数据
 * 3. 匹配用户指定的号码组合
 * 4. 关联下一期开奖信息
 * 5. 返回格式化的统计结果
 */
router.post('/', async (req, res) => {
  console.log('收到组合详情请求！请求方法:', req.method, '请求路径:', req.path);
  console.log('请求体内容:', req.body);
  
  try {
    // 1. 参数验证阶段 - 确保所有输入参数符合要求
    const { latest_period, type, combinations, stats_range, target_ball } = req.body;
    
    // 验证必填参数 - 确保没有缺失必要参数
    if (!latest_period || !type || !combinations || !stats_range) {
      return res.status(400).json({
        code: 400,
        message: '参数不完整，所有参数均为必填'
      });
    }
    
    // 验证期号格式 - 确保期号为5-8位数字（支持25120这样的格式或YYYYMMDD格式）
    const periodRegex = /^\d{5,8}$/;
    if (!periodRegex.test(latest_period)) {
      return res.status(400).json({
        code: 400,
        message: 'latest_period格式错误，应为5-8位数字'
      });
    }
    
    // 验证类型值 - 确保类型只能是front（前区）或back（后区）
    if (type !== 'front' && type !== 'back') {
      return res.status(400).json({
        code: 400,
        message: 'type值错误，应为front或back'
      });
    }
    
    // 验证组合数组格式 - 确保combinations是有效的非空数组
    if (!Array.isArray(combinations) || combinations.length === 0) {
      return res.status(400).json({
        code: 400,
        message: 'combinations必须是非空数组'
      });
    }
    
    // 验证每个组合号码的格式 - 确保每个组合都符合x-xx或xx-xx格式，支持2-5个球的组合
    const combinationRegex = /^(\d{1,2}-){1,4}\d{1,2}$/;
    for (const combination of combinations) {
      // 检查格式是否正确
      if (!combinationRegex.test(combination)) {
        return res.status(400).json({
          code: 400,
          message: `组合号码格式错误: ${combination}，应为xx-xx格式（支持2-5个球的组合）`
        });
      }
      // 检查球的数量是否在2-5个之间
      const ballCount = combination.split('-').length;
      if (ballCount < 2 || ballCount > 5) {
        return res.status(400).json({
          code: 400,
          message: `组合号码数量错误: ${combination}，应包含2-5个球`
        });
      }
    }
    
    // 验证统计范围 - 确保为正整数且不超过5000，避免查询过多数据导致性能问题
    const parsedStatsRange = parseInt(stats_range);
    if (isNaN(parsedStatsRange) || parsedStatsRange <= 0 || parsedStatsRange > 5000) {
      return res.status(400).json({
        code: 400,
        message: 'stats_range必须为正整数且不大于5000'
      });
    }
    
    // 验证目标球号（可选参数）
    let targetBallNumber = null;
    if (target_ball !== null && target_ball !== undefined) {
      const parsedBall = parseInt(target_ball, 10);
      if (isNaN(parsedBall) || parsedBall < 1 || parsedBall > 35) {
        return res.status(400).json({
          code: 400,
          message: 'target_ball必须是1-35之间的整数'
        });
      }
      targetBallNumber = parsedBall;
    }
    
    // 记录日志 - 便于问题排查和监控
    console.log('开始组合详情分析，参数:', { latest_period, type, combinations, stats_range, target_ball });
    
    // 2. 数据查询阶段 - 查询指定范围的历史开奖数据
    // SQL查询语句 - 按期号降序排列，确保最新的记录在前面
    const querySql = `
      SELECT
        issue AS period,
        draw_date,
        red,
        blue
      FROM lottery_results
      WHERE issue < ?
      ORDER BY issue DESC
      LIMIT ?
    `;
    
    console.log('SQL查询语句:', querySql);
    console.log('查询参数:', [latest_period, parsedStatsRange]);
    
    // 执行数据库查询 - 使用参数化查询防止SQL注入
    const historyResults = await query(querySql, [latest_period, parsedStatsRange]);
    
    // 检查查询结果 - 如果没有找到数据，返回404错误
    if (!historyResults || historyResults.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '未找到指定范围的开奖数据'
      });
    }
    
    console.log('查询到的历史数据数量:', historyResults.length);
    
    // 3. 数据处理阶段 - 组合匹配和结果处理
    const resultList = []; // 存储最终的统计结果
    let index = 1;        // 用于结果排序的序号
    
    console.log('开始处理历史数据，数据总条数:', historyResults.length);
    
    // 遍历每条历史开奖记录，从第1条开始（因为我们需要查找下一期的数据）
    for (let i = 1; i < historyResults.length; i++) {
      const record = historyResults[i]; // 当前期（组合出现的期数）
      const nextRecord = historyResults[i - 1]; // 下一期（期号比当前期大1，因为数据是降序排列的）
      
      // 确保下一期数据存在
      if (!nextRecord) {
        console.log(`第${i}条记录没有下一期数据，跳过`);
        continue;
      }
      
      console.log(`处理第${i}条记录，期号: ${record.period}，下一期期号: ${nextRecord.period}`);
      
      // 根据类型获取对应区域的号码（前区/后区）
      let balls;
      if (type === 'front') {
        balls = processBalls(record.red); // 处理前区红球数据
      } else {
        balls = processBalls(record.blue); // 处理后区蓝球数据
      }
      
      console.log(`${type === 'front' ? '前区' : '后区'}号码:`, balls);
      
      // 遍历用户提供的所有组合，只检查主组合（前两个球）
      for (const combination of combinations) {
        console.log(`检查组合: ${combination}`);
        // 分离主组合和目标球，只检查主组合（前两个球）
        const mainCombo = combination.split('-').slice(0, 2).join('-');
        const comboNumbers = mainCombo.split('-');
        
        console.log(`主组合: ${mainCombo}，组合号码:`, comboNumbers);
        
        // 检查当前开奖记录是否包含主组合中的所有号码
        const allMatch = comboNumbers.every(num => {
          // 将号码转换为数字，以便正确比较
          const numInt = parseInt(num);
          return balls.includes(numInt);
        });
        
        console.log(`组合匹配结果: ${allMatch}`);
        
        if (allMatch) {
          // 获取下一期的号码
          let nextDrawInfo;
          if (type === 'front') {
            nextDrawInfo = processBalls(nextRecord.red);
          } else {
            nextDrawInfo = processBalls(nextRecord.blue);
          }
          
          console.log(`下一期${type === 'front' ? '前区' : '后区'}号码:`, nextDrawInfo);
          
          // 如果指定了目标球号，则只添加下一期开奖信息中包含该球号的记录
          if (!targetBallNumber || (nextDrawInfo && nextDrawInfo.includes(targetBallNumber))) {
            console.log(`目标球匹配结果: ${!targetBallNumber ? '未指定目标球' : '包含目标球'}`);
            // 构建结果对象并添加到结果列表
            resultList.push({
              index: index++,        // 结果序号（递增）
              period: record.period, // 当前匹配的期号
              combination: combination, // 匹配的号码组合
              draw_info: balls,      // 当前期开奖号码
              next_period: nextRecord.period,  // 下一期期号
              next_draw_info: nextDrawInfo // 下一期开奖号码
            });
            console.log(`添加匹配记录，当前累计: ${resultList.length}条`);
          }
        }
      }
    }
    
    // 4. 响应处理阶段 - 返回查询结果
    // 检查是否有匹配的数据
    if (resultList.length === 0) {
      console.log('未找到匹配的组合数据');
      return res.status(404).json({
        code: 404,
        message: '在指定范围内未找到匹配的组合数据'
      });
    }
    
    // 记录处理完成的日志
    console.log('组合详情分析完成，找到匹配记录:', resultList.length);
    
    // 返回成功响应，包含匹配的结果列表
    res.json({
      code: 200,
      data: resultList
    });
    
  } catch (error) {
    // 异常处理 - 捕获并记录所有可能的错误
    console.error('组合详情分析失败:', error.stack);
    // 返回服务器错误响应，包含详细错误信息
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

/**
 * 工具函数：处理号码数据，确保返回标准的数字数组
 * 
 * 功能说明：
 * - 统一处理不同格式的号码数据（数组或字符串）
 * - 确保返回有效的数字数组
 * - 处理各种异常情况
 * 
 * @param {string|array} ballsData - 原始号码数据，可以是数组或字符串格式
 * @returns {array} 返回标准化的数字数组
 */
function processBalls(ballsData) {
  // 处理空值情况
  if (!ballsData) return [];
  
  // 情况1: 如果已经是数组格式
  if (Array.isArray(ballsData)) {
    // 将数组中的每个元素转换为数字并过滤无效值
    return ballsData.map(ball => parseInt(ball, 10)).filter(num => !isNaN(num));
  }
  
  // 情况2: 如果是字符串格式
  if (typeof ballsData === 'string') {
    // 子情况A: 处理 [x, x, x] 格式的字符串（数据库中常见的存储格式）
    if (ballsData.startsWith('[') && ballsData.endsWith(']')) {
      // 提取中括号内的内容
      const content = ballsData.substring(1, ballsData.length - 1);
      // 按逗号分割，转换为数字并过滤无效值
      return content
        .split(',')
        .map(ball => parseInt(ball.trim(), 10))
        .filter(num => !isNaN(num));
    } else {
      // 子情况B: 处理空格分隔的字符串格式（如"1 2 3 4 5"）
      if (ballsData.includes(' ')) {
        return ballsData
          .split(' ')
          .map(ball => parseInt(ball.trim(), 10))
          .filter(num => !isNaN(num));
      } 
      // 子情况C: 处理逗号分隔的字符串格式（如"1,2,3,4,5"）
      else if (ballsData.includes(',')) {
        return ballsData
          .split(',')
          .map(ball => parseInt(ball.trim(), 10))
          .filter(num => !isNaN(num));
      }
      // 子情况D: 处理其他格式的字符串，尝试提取所有数字
      else {
        const numbers = ballsData.match(/\d+/g);
        if (numbers) {
          return numbers.map(num => parseInt(num, 10)).filter(num => !isNaN(num));
        }
      }
    }
  }
  
  // 默认情况：返回空数组
  return [];
}

module.exports = router;