// 参数说明: 无参数
// 接口功能: 从外部API获取最新大乐透开奖数据但不写入数据库

const express = require('express');
// 使用node-fetch代替axios以避免undici的File is not defined错误
const fetch = require('node-fetch');
const cors = require('cors');
const { query } = require('./数据库配置.js');

// 创建路由器而不是完整的应用
const router = express.Router();

/**
 * 从指定API获取最新大乐透数据
 * @returns {Promise<Array>} 彩票数据数组
 */
async function fetchNewLotteryData(startIssue = null) {
  console.log('==================================================');
  console.log(`【开始】fetchNewLotteryData函数执行 - ${new Date().toLocaleString()}`);
  console.log('参数:', { startIssue });
  
  try {
    console.log('开始从sporttery.cn抓取大乐透数据...');
    console.log('起始期号:', startIssue || '获取全部最新数据');
    const apiUrl = 'https://webapi.sporttery.cn/gateway/lottery/getHistoryPageListV1.qry?gameNo=85&provinceId=0&pageSize=100&isVerify=1&pageNo=1';
    console.log('API地址:', apiUrl);
    
    console.log('准备发送请求，设置10秒超时...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('【警告】请求超时，准备中止请求');
      controller.abort();
    }, 10000);
    
    try {
      console.log('正在发送请求...');
      const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Connection': 'keep-alive',
        'Host': 'webapi.sporttery.cn',
        'Origin': 'https://static.sporttery.cn',
        'Referer': 'https://static.sporttery.cn/',
        'TE': 'trailers',
        'sec-ch-ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site'
      },
      signal: controller.signal,
      credentials: 'include'
    });
    
      clearTimeout(timeoutId);
      console.log('请求成功完成，状态码:', response.status);
      
      // 记录响应头信息
      const headers = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      console.log('响应头:', JSON.stringify(headers, null, 2));
      
      if (!response.ok) {
        throw new Error(`API请求失败，状态码: ${response.status}, 状态文本: ${response.statusText}`);
      }
    
    const data = await response.json();
    
    // 增强的响应数据验证和日志
    console.log('API响应数据结构概览:', JSON.stringify({
      hasData: !!data,
      hasValue: !!data?.value,
      valueType: typeof data?.value,
      hasList: !!data?.value?.list,
      listType: Array.isArray(data?.value?.list) ? 'array' : typeof data?.value?.list,
      listLength: Array.isArray(data?.value?.list) ? data.value.list.length : 'N/A'
    }, null, 2));
    
    // 检查响应数据格式
    if (!data || typeof data !== 'object') {
      throw new Error('API返回数据格式错误: 响应不是有效的JSON对象');
    }
    
    // 尝试多种可能的数据路径
    let listData = [];
    if (data.value && Array.isArray(data.value.list)) {
      listData = data.value.list;
    } else if (Array.isArray(data.list)) {
      listData = data.list;
    } else if (Array.isArray(data)) {
      listData = data;
    } else {
      throw new Error('无法在API响应中找到有效的数据列表');
    }
    
    console.log(`找到${listData.length}条数据记录`);
    
    // 记录前几条原始数据用于调试
    if (listData.length > 0) {
      console.log('前2条原始数据样例:', JSON.stringify(listData.slice(0, 2), null, 2));
    }
    
    const formattedData = [];
    for (const item of listData) {
      try {
        // 更灵活的字段检测
        const issueField = item.lotteryDrawNum || item.issue || item.period || '未知期号';
        const resultField = item.lotteryUnsortDrawresult || item.result || item.drawResult || '';
        
        if (!issueField || !resultField) {
          console.warn('记录缺少必要字段，跳过:', JSON.stringify(item, null, 2));
          continue;
        }
        
        let redBalls = [];
        let blueBalls = [];
        const resultStr = resultField.toString().trim();
        
        // 更灵活的开奖结果解析
        // 首先尝试空格分隔的格式（如"35 10 09 11 08 11 05"）
        if (resultStr.includes(' ')) {
          const numbers = resultStr.trim().split(/\s+/).filter(num => num !== '');
          if (numbers.length >= 7) {
            redBalls = numbers.slice(0, 5).map(n => n.padStart(2, '0'));
            blueBalls = numbers.slice(5, 7).map(n => n.padStart(2, '0'));
          } else {
            console.warn('空格分隔格式数据不足，跳过期号:', issueField, '结果:', resultStr);
            continue;
          }
        } 
        // 尝试标准格式：5红（2位/个）+2蓝（2位/个）=14位
        else if (resultStr.length === 14) {
          redBalls = [
            resultStr.substr(0, 2),
            resultStr.substr(2, 2),
            resultStr.substr(4, 2),
            resultStr.substr(6, 2),
            resultStr.substr(8, 2)
          ];
          blueBalls = [
            resultStr.substr(10, 2),
            resultStr.substr(12, 2)
          ];
        }
        // 尝试逗号分隔的格式
        else if (resultStr.includes(',')) {
          const numbers = resultStr.replace(/[^0-9,]/g, '').split(',');
          if (numbers.length >= 7) {
            redBalls = numbers.slice(0, 5).map(n => n.padStart(2, '0'));
            blueBalls = numbers.slice(5, 7).map(n => n.padStart(2, '0'));
          } else {
            console.warn('逗号分隔格式数据不足，跳过期号:', issueField, '结果:', resultStr);
            continue;
          }
        }
        else {
          console.warn('无法识别的开奖结果格式，跳过期号:', issueField, '结果:', resultStr);
          continue;
        }
        
        // 验证解析出的球号是否有效
        if (redBalls.length !== 5 || blueBalls.length !== 2) {
          console.warn('解析出的球号数量不正确，跳过期号:', issueField);
          continue;
        }
        
        const dateField = item.lotteryDrawTime || item.drawDate || item.date || new Date().toISOString().split('T')[0];
        const weekdayField = item.week || item.weekday || null;
        const calculatedWeekday = getWeekdayFromDate(dateField);
        
        const formattedItem = {
          issue: issueField.toString(),
          drawDate: dateField.toString(),
          weekday: weekdayField && weekdayField.toString() !== '0' ? weekdayField.toString() : calculatedWeekday,
          redBalls,
          blueBalls,
          sum: calculateSum(redBalls),
          span: calculateSpan(redBalls),
          intervalRatio: calculateIntervalRatio(redBalls),
          parityRatio: calculateParityRatio(redBalls)
        };
        
        formattedData.push(formattedItem);
        console.log(`成功解析期号: ${issueField}`);
      } catch (itemError) {
        console.error('处理单条记录失败:', itemError.message);
        console.error('错误记录详情:', JSON.stringify(item, null, 2));
        console.error('错误堆栈:', itemError.stack);
        continue;
      }
    }
    
    if (formattedData.length === 0) {
      throw new Error('未能解析到任何有效数据');
    }
    
    if (startIssue && startIssue !== '暂无数据') {
      const startIssueNum = parseInt(startIssue);
      const filteredData = formattedData.filter(item => {
        const itemIssueNum = parseInt(item.issue);
        return itemIssueNum > startIssueNum;
      });
      console.log(`过滤后的数据数量: ${filteredData.length}条 (大于${startIssue}期的数据)`);
      return filteredData;
    }
    
    return formattedData;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('【错误】fetch请求失败:', fetchError.name);
      console.error('错误详情:', fetchError.message);
      console.error('错误堆栈:', fetchError.stack);
      
      if (fetchError.name === 'AbortError') {
        throw new Error('请求超时：无法连接到体彩API');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('【错误】抓取数据失败:', error.message);
    console.error('错误类型:', error.name);
    console.error('错误堆栈:', error.stack);
    throw error;
  } finally {
    console.log(`【结束】fetchNewLotteryData函数执行 - ${new Date().toLocaleString()}`);
    console.log('==================================================');
  }
}

// 辅助函数：计算和值
function calculateSum(balls) {
  return balls.reduce((sum, ball) => sum + parseInt(ball), 0).toString();
}

// 辅助函数：计算跨度
function calculateSpan(balls) {
  const nums = balls.map(ball => parseInt(ball));
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  return (max - min).toString();
}

// 辅助函数：计算区间比
function calculateIntervalRatio(balls) {
  const nums = balls.map(ball => parseInt(ball));
  const interval1 = nums.filter(num => num <= 12).length;
  const interval2 = nums.filter(num => num >= 13 && num <= 24).length;
  const interval3 = nums.filter(num => num >= 25).length;
  return `${interval1}:${interval2}:${interval3}`;
}

// 辅助函数：计算奇偶比
function calculateParityRatio(balls) {
  const nums = balls.map(ball => parseInt(ball));
  const odd = nums.filter(num => num % 2 === 1).length;
  const even = nums.filter(num => num % 2 === 0).length;
  return `${odd}:${even}`;
}

// 辅助函数：根据日期计算星期几
function getWeekdayFromDate(dateStr) {
  if (!dateStr) return '0';
  
  try {
    const date = new Date(dateStr);
    const weekday = date.getDay();
    return weekday === 0 ? '7' : weekday.toString();
  } catch (error) {
    console.error('计算星期失败:', error);
    return '0';
  }
}

/**
 * 从sql_zui_xin_yi_qi接口获取数据库中最新期号
 * @returns {Promise<string|null>} 数据库中最新期号
 */
async function getLatestDatabaseIssue() {
  console.log('【开始】getLatestDatabaseIssue函数执行 - 获取数据库最新期号');
  
  try {
    const sqlApiUrl = 'http://localhost:18889/sql_zui_xin_yi_qi';
    console.log('调用sql_zui_xin_yi_qi接口:', sqlApiUrl);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时
    
    const response = await fetch(sqlApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`sql_zui_xin_yi_qi接口调用失败，状态码: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('sql_zui_xin_yi_qi接口返回数据:', JSON.stringify(data, null, 2));
    
    // 提取期号
    if (data.success && data.period) {
      console.log('成功获取数据库最新期号:', data.period);
      return data.period;
    } else if (data.period) {
      // 兼容可能的接口格式
      console.log('成功获取数据库最新期号:', data.period);
      return data.period;
    } else {
      console.warn('sql_zui_xin_yi_qi接口返回数据中未找到期号信息');
      return null;
    }
  } catch (error) {
    console.error('【错误】获取数据库最新期号失败:', error.message);
    console.error('错误堆栈:', error.stack);
    return null;
  } finally {
    console.log('【结束】getLatestDatabaseIssue函数执行');
  }
}

/**
 * 获取最新开奖数据但不同步接口
 * 接口功能: 从体彩网获取最新大乐透开奖数据但不写入数据库，并与数据库中最新期号比较
 * 
 * 请求示例:
 * GET http://localhost:18891/huo_qu_ti_cai_shu_ju
 * 
 * 响应格式说明:
 * 成功响应:
 * {
 *   "success": true,
 *   "latestResults": [
 *     {
 *       "issue": "25116",
 *       "drawDate": "2025-05-25",
 *       "weekday": "7",
 *       "redBalls": ["01", "05", "12", "23", "30"],
 *       "blueBalls": ["02", "07"],
 *       "sum": "71",
 *       "span": "29",
 *       "intervalRatio": "1:2:2",
 *       "parityRatio": "3:2"
 *     }
 *   ]
 * }
 * 
 * 失败响应:
 * {
 *   "success": false,
 *   "message": "获取体彩开奖数据失败",
 *   "latestResults": []
 * }
 */
router.get('/', async (req, res) => {
    console.log('\n==================================================');
    console.log(`【API请求】接收到 /huo_qu_ti_cai_shu_ju 请求 - ${new Date().toLocaleString()}`);
    
    try {
        // 获取请求中的startIssue参数
        const requestStartIssue = req.query.startIssue;
        console.log(`请求参数startIssue: ${requestStartIssue || '未提供'}`);
        
        // 第一步：获取数据库中的最新期号（如果请求中没有提供startIssue）
        let startIssueToUse = requestStartIssue;
        if (!startIssueToUse) {
            console.log('【第一步】获取数据库最新期号');
            const latestDatabaseIssue = await getLatestDatabaseIssue();
            console.log(`数据库最新期号: ${latestDatabaseIssue || '暂无'}`);
            startIssueToUse = latestDatabaseIssue;
        }
        
        // 第二步：获取最新开奖数据
        console.log('【第二步】获取最新开奖数据');
        const latestResults = await fetchNewLotteryData(startIssueToUse);
        
        console.log('获取体彩开奖数据成功，共', latestResults.length, '条记录');
        console.log('最新期号:', latestResults[0]?.issue);
        
        // 返回成功响应
        res.json({
            success: true,
            message: '获取体彩开奖数据成功',
            latestResults: latestResults,
            lastIssue: latestResults.length > 0 ? latestResults[0].issue : ''
        });
    } catch (error) {
        console.error('获取体彩开奖数据时发生错误:', error);
        res.json({
            success: false,
            message: `获取体彩开奖数据失败: ${error.message}`,
            latestResults: []
        });
    }
});

// 导出路由器
module.exports = router;