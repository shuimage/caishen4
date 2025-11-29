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
router.post('/zu_he_xiang_qing', async (req, res) => {
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
    if (!Number.isInteger(stats_range) || stats_range <= 0 || stats_range > 5000) {
      return res.status(400).json({
        code: 400,
        message: 'stats_range必须为正整数且不大于5000'
      });
    }
    
    // 验证目标球号（可选参数）
    let targetBallNumber = null;
    if (target_ball) {
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
          bian_hao,
          draw_date,
          red,
          blue
        FROM lottery_results
        WHERE issue <= ?
        ORDER BY issue DESC
        LIMIT ?
      `;
    
    // 执行数据库查询 - 使用参数化查询防止SQL注入，确保参数类型正确
    const historyResults = await query(querySql, [latest_period.toString(), stats_range.toString()]);
    
    // 检查查询结果 - 如果没有找到数据，返回404错误
    if (!historyResults || historyResults.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '未找到指定范围的开奖数据'
      });
    }
    
    // 性能优化 - 创建期号到数据的映射，便于快速查找
    const periodMap = new Map();
    historyResults.forEach(item => {
      periodMap.set(item.period, item);
    });
    
    // 3. 数据处理阶段 - 组合匹配和结果处理
    const resultList = []; // 存储最终的统计结果
    let index = 1;        // 用于结果排序的序号
    
    // 遍历每条历史开奖记录
    for (const record of historyResults) {
      // 根据类型获取对应区域的号码（前区/后区）
      let balls;
      if (type === 'front') {
        balls = processBalls(record.red); // 处理前区红球数据
      } else {
        balls = processBalls(record.blue); // 处理后区蓝球数据
      }
      
      // 格式化号码为两位数字的字符串，确保与输入组合格式一致，便于匹配
      const formattedBalls = balls.map(ball => String(ball).padStart(2, '0'));
      
      // 遍历用户提供的所有组合，检查是否在当前开奖记录中出现
      for (const combination of combinations) {
        // 将组合拆分为多个单独的号码（2-5个）
        const comboNumbers = combination.split('-');
        // 检查当前开奖记录是否包含组合中的所有号码（不考虑顺序）
        const allMatch = comboNumbers.every(num => formattedBalls.includes(num));
        if (allMatch) {
          // 关联信息处理 - 查找下一期的开奖数据
          let nextPeriod = null;     // 下一期期号
          let nextDrawInfo = null;   // 下一期开奖号码
          
          // 添加调试日志 - 查看当前记录的bian_hao值
          console.log(`当前记录期号:${record.period}, bian_hao:${record.bian_hao}`);
          
          // 正确处理字符串格式的bian_hao字段
          // 提取前缀（LT）和数字部分
          const prefixMatch = record.bian_hao.match(/^([A-Z]+)(\d+)$/);
          if (prefixMatch) {
            const prefix = prefixMatch[1]; // LT前缀
            const numStr = prefixMatch[2]; // 数字部分字符串
            const num = parseInt(numStr, 10); // 转换为数字
            const nextNum = num + 1; // 下一期数字
            // 格式化为5位数字并拼接前缀
            const nextBianHao = prefix + String(nextNum).padStart(5, '0');
            
            // 添加调试日志 - 查看要查询的下一期bian_hao值
            console.log(`查询下一期bian_hao:${nextBianHao}`);
            
            // 在历史数据中查找下一期的记录（通过bian_hao）
            const nextPeriodRecord = historyResults.find(item => item.bian_hao === nextBianHao);
            
            // 添加调试日志 - 查看查询结果
            console.log(`下一期查询结果:${nextPeriodRecord ? nextPeriodRecord.period : '未找到'}`);
            
            // 如果找到下一期数据，提取相关信息
            if (nextPeriodRecord) {
            nextPeriod = nextPeriodRecord.period;
            // 根据类型获取下一期对应区域的号码
            if (type === 'front') {
              nextDrawInfo = processBalls(nextPeriodRecord.red);
            } else {
              nextDrawInfo = processBalls(nextPeriodRecord.blue);
            }
          }
          
                // 如果指定了目标球号，则只添加下一期开奖信息中包含该球号的记录
                // 这是正确的需求：只显示下一期包含目标球号的组合记录
                if (!targetBallNumber || (nextDrawInfo && nextDrawInfo.includes(targetBallNumber))) {
                  // 构建结果对象并添加到结果列表
                  resultList.push({
                    index: index++,        // 结果序号（递增）
                    period: record.period, // 当前匹配的期号
                    combination: combination, // 匹配的号码组合
                    draw_info: balls,      // 当前期开奖号码
                    next_period: nextPeriod,  // 下一期期号
                    next_draw_info: nextDrawInfo // 下一期开奖号码
                  });
                } else {
                console.log(`跳过不包含目标球号${targetBallNumber}的记录，期号:${record.period}`);
              }
            } else {
              // 处理bian_hao格式不符合预期的情况
              console.log(`bian_hao格式不符合预期: ${record.bian_hao}`);
            }
        }
      }
    }
    
    // 4. 响应处理阶段 - 返回查询结果
    // 检查是否有匹配的数据
    if (resultList.length === 0) {
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
    console.error('组合详情分析失败:', error);
    // 返回服务器错误响应
    res.status(500).json({
      code: 500,
      message: '数据库操作失败'
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
      // 子情况B: 直接按逗号分割的字符串格式
      return ballsData
        .split(',')
        .map(ball => parseInt(ball.trim(), 10))
        .filter(num => !isNaN(num));
    }
  }
  
  // 默认情况：返回空数组
  return [];
}

module.exports = router;