// 参数说明: 无参数
// 接口功能: 更新大乐透数据并返回结果

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const { query, transaction } = require('./db.config');
const { cacheGet, cacheSet, cacheDel } = require('./redis.config');
const doubleKillRouter = require('./shuang_sha.js');

const app = express();
const PORT = process.env.PORT || 18889;

// 配置CORS，允许所有来源的请求
app.use(cors());

// 解析JSON请求体
app.use(express.json());

// 注册双杀分析路由
app.use(doubleKillRouter);

/**
 * 从新浪彩票网站抓取最新大乐透数据
 * @returns {Promise<Array>} 彩票数据数组
 */
/**
 * 从指定API获取最新大乐透数据
 * @returns {Promise<Array>} 彩票数据数组
 */
// 从指定API获取最新大乐透数据
async function fetchNewLotteryData() {
  try {
    console.log('开始从sporttery.cn抓取大乐透数据...');
    // 增加获取的数据量，确保能获取到更多历史数据
    const apiUrl = 'https://webapi.sporttery.cn/gateway/lottery/getHistoryPageListV1.qry?gameNo=85&provinceId=0&pageSize=50&isVerify=1&pageNo=1';
    
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Cache-Control': 'no-cache',
        'Origin': 'https://static.sporttery.cn',
        'Pragma': 'no-cache',
        'Referer': 'https://static.sporttery.cn/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site'
      },
      timeout: 10000,
      responseType: 'json'
    });
    
    console.log('成功获取数据，开始解析...');
    
    // 解析返回的数据
    const data = response.data;
    
    console.log('API返回的原始数据:', data);
    console.log('数据类型:', typeof data);
    console.log('数据结构:', Object.keys(data || {}));
    
    // 检查响应是否成功
    if (!data) {
      console.error('API返回空数据');
      throw new Error('API返回空数据');
    }
    
    // 检查API是否返回了成功状态
    if (data.success === false) {
      console.error('API返回失败状态:', data.errorMessage || data.message);
      throw new Error(data.errorMessage || 'API调用失败');
    }
    
    // 尝试从不同可能的字段路径获取数据
    let listData = null;
    
    // 检查可能的数据结构路径
    if (data.value && data.value.list) {
      listData = data.value.list;
      console.log('使用value.list作为数据来源');
    } else if (data.result && data.result.list) {
      listData = data.result.list;
      console.log('使用result.list作为数据来源');
    } else if (Array.isArray(data.list)) {
      listData = data.list;
      console.log('使用data.list作为数据来源');
    } else if (Array.isArray(data)) {
      listData = data;
      console.log('直接使用返回数据作为数组');
    }
    
    if (!listData || !Array.isArray(listData)) {
      console.error('无法找到有效的数据列表:', data);
      throw new Error('API返回数据格式不正确，无法找到有效的数据列表');
    }
    
    console.log(`找到${listData.length}条数据记录`);
    
    // 格式化数据，并添加严格的错误检查
    const formattedData = [];
    
    console.log('尝试解析每条记录的数据结构...');
    
    for (const item of listData) {
      try {
        // 打印第一条记录的完整结构，帮助调试
        if (formattedData.length === 0) {
          console.log('第一条记录的完整结构:', JSON.stringify(item, null, 2));
          console.log('记录的字段名称:', Object.keys(item || {}));
          
          // 特别检查lotteryDrawResult字段的内容
          if (item.lotteryDrawResult) {
            console.log('lotteryDrawResult字段内容:', item.lotteryDrawResult);
            console.log('lotteryDrawResult字段类型:', typeof item.lotteryDrawResult);
          }
        }
        
        // 检查必要字段是否存在
        if (!item || typeof item !== 'object') {
          console.warn('跳过无效记录:', item);
          continue;
        }
        
        // 检查必要字段是否存在
        if (!item.lotteryDrawNum) {
          console.warn('记录缺少期号字段:', Object.keys(item));
          continue;
        }
        
        if (!item.lotteryDrawResult) {
          console.warn('记录缺少开奖结果字段:', Object.keys(item));
          continue;
        }
        
        // 从lotteryDrawResult字段解析红球和蓝球
        let redBalls = [];
        let blueBalls = [];
        
        // 处理不同格式的开奖结果
        if (typeof item.lotteryDrawResult === 'string') {
          console.log('开始解析lotteryDrawResult字符串:', item.lotteryDrawResult);
          
          // 尝试不同的分隔符
          const possibleSeparators = [',', ' ', '|', ';'];
          let separatedNumbers = [];
          
          for (const separator of possibleSeparators) {
            const splitResult = item.lotteryDrawResult.split(separator).filter(num => num.trim());
            if (splitResult.length > separatedNumbers.length) {
              separatedNumbers = splitResult;
            }
          }
          
          console.log('解析后的号码数组:', separatedNumbers);
          
          // 根据中国体育彩票大乐透规则，前5个是前区号码，后2个是后区号码
          if (separatedNumbers.length >= 7) {
            redBalls = separatedNumbers.slice(0, 5).map(ball => ball.trim().padStart(2, '0'));
            blueBalls = separatedNumbers.slice(5, 7).map(ball => ball.trim().padStart(2, '0'));
          }
        } 
        // 如果是数组格式
        else if (Array.isArray(item.lotteryDrawResult)) {
          console.log('lotteryDrawResult是数组格式:', item.lotteryDrawResult);
          
          if (item.lotteryDrawResult.length >= 7) {
            redBalls = item.lotteryDrawResult.slice(0, 5).map(ball => String(ball).trim().padStart(2, '0'));
            blueBalls = item.lotteryDrawResult.slice(5, 7).map(ball => String(ball).trim().padStart(2, '0'));
          }
        }
        
        console.log('解析后的红球:', redBalls);
        console.log('解析后的蓝球:', blueBalls);
        
        // 确保解析出了有效的球号
        if (redBalls.length !== 5 || blueBalls.length !== 2) {
          console.warn('未能解析出有效的球号数据，红球数量:', redBalls.length, '蓝球数量:', blueBalls.length);
          continue;
        }
        
        // 优先使用从日期计算的星期几，如果API提供了有效的week字段也可以使用
        const calculatedWeekday = getWeekdayFromDate(item.lotteryDrawTime);
        
        formattedData.push({
          issue: item.lotteryDrawNum,
          drawDate: item.lotteryDrawTime || '',
          weekday: item.week && item.week.toString() !== '0' ? item.week.toString() : calculatedWeekday,
          redBalls: redBalls,
          blueBalls: blueBalls,
          sum: calculateSum(redBalls),
          span: calculateSpan(redBalls),
          intervalRatio: calculateIntervalRatio(redBalls),
          parityRatio: calculateParityRatio(redBalls)
        });
      } catch (itemError) {
        console.error('处理单条记录失败:', itemError.message);
        console.error('错误记录:', JSON.stringify(item, null, 2));
        console.error('错误堆栈:', itemError.stack);
        // 跳过错误记录，继续处理下一条
        continue;
      }
    }
    
    console.log('成功解析的记录数量:', formattedData.length);
    
    // 如果没有解析到任何数据，抛出错误
    if (formattedData.length === 0) {
      throw new Error('未能解析到任何有效数据');
    }
    
    return formattedData;
  } catch (error) {
    console.error('抓取数据失败:', error);
    // 抓取失败时返回错误，不再使用模拟数据
    throw new Error('抓取数据失败');
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
    // JavaScript中getDay()返回0-6，0是星期日，我们需要转换为1-7表示周一到周日
    const weekday = date.getDay();
    // 如果是星期日(0)，返回7，否则返回原数字
    return weekday === 0 ? '7' : weekday.toString();
  } catch (error) {
    console.error('计算星期失败:', error);
    return '0';
  }
}

/**
 * 同步数据到数据库
 * @param {Array} data 彩票数据数组
 * @returns {Promise<Object>} 同步结果
 */
// 同步数据到数据库
async function syncDataToDatabase(newData) {
  try {
    console.log(`开始同步数据到数据库，共${newData ? newData.length : 0}条数据`);
    
    // 使用事务确保数据一致性
    let updatedCount = 0;
    let lastIssue = '';
    
    // 确保newData是数组
    if (!Array.isArray(newData) || newData.length === 0) {
      console.log('无数据可同步');
      return {
        success: true,
        message: '无数据可同步',
        updatedCount: 0,
        lastIssue: '',
        latestResults: []
      };
    }
    
    // 按期号降序排序，确保先处理最新数据
    const sortedData = [...newData].sort((a, b) => {
      // 确保期号是数字格式进行比较
      const issueA = typeof a.issue === 'string' ? parseInt(a.issue) : a.issue;
      const issueB = typeof b.issue === 'string' ? parseInt(b.issue) : b.issue;
      return issueB - issueA;
    });
    
    // 先获取数据库中现有的所有期号，避免重复查询
    const existingIssuesResult = await query('SELECT issue FROM lottery_results');
    const existingIssues = new Set(existingIssuesResult.map(item => item.issue));
    
    console.log(`数据库中已有${existingIssues.size}期数据`);
    console.log('最新期号排序结果:', sortedData.map(item => item.issue).slice(0, 5));
    
    for (const item of sortedData) {
      try {
        // 确保期号格式统一
        const issue = item.issue.toString();
        
        // 快速检查是否已存在该期数据
        if (!existingIssues.has(issue)) {
          // 问题1：同步到lottery_results表的数据不要带引号，使用字符串拼接代替JSON.stringify
          // 确保前区显示前5个球，后区显示后2个球
            const frontArea = (item.redBalls || []).slice(0, 5).map(ball => parseInt(ball));
            const backArea = (item.blueBalls || []).slice(0, 2).map(ball => parseInt(ball));
            
            // 格式化红号和蓝号，不带引号
            const redStr = '[' + frontArea.join(', ') + ']';
            const blueStr = '[' + backArea.join(', ') + ']';
            
            // 记录要插入的数据，用于日志
            console.log(`准备插入数据: ${issue}期, 红球: ${redStr}, 蓝球: ${blueStr}`);
            
            try {
              // 使用事务确保数据一致性
              await transaction([
                // 插入lottery_results表
                {
                  sql: 'INSERT INTO lottery_results (issue, draw_date, week, red, blue, sum, span, area_ratio, odd_even_ratio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                  params: [
                    issue,
                    item.drawDate || new Date().toISOString().split('T')[0],
                    item.weekday || '0',
                    redStr,  // 不带引号的红号字符串
                    blueStr,  // 不带引号的蓝号字符串
                    parseInt(item.sum) || 0,
                    parseInt(item.span) || 0,
                    item.intervalRatio || '0:0:0',
                    item.parityRatio || '0:0'
                  ]
                },
                // 插入letou表
                {
                  sql: 'INSERT INTO letou (riqi, qihao, qian1, qian2, qian3, qian4, qian5, hou1, hou2) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                  params: [
                    item.drawDate || new Date().toISOString().split('T')[0],
                    issue,
                    frontArea[0] || 0,
                    frontArea[1] || 0,
                    frontArea[2] || 0,
                    frontArea[3] || 0,
                    frontArea[4] || 0,
                    backArea[0] || 0,
                    backArea[1] || 0
                  ]
                }
              ]);
              
              console.log(`事务提交成功: ${issue}期数据已同步到两个表`);
              updatedCount++;
              
              // 更新内存中的存在期号集合，避免重复处理
              existingIssues.add(issue);
            } catch (transactionError) {
              console.error(`事务回滚，处理${issue}期数据失败:`, transactionError);
              // 记录详细错误信息
              console.error(`错误详情: ${transactionError.message || '未知错误'}`);
              console.error(`尝试插入的数据: ${JSON.stringify({issue, frontArea, backArea})}`);
              // 继续处理下一条数据
              continue;
            }
          lastIssue = issue;
        } else {
          console.log(`数据已存在，跳过: ${issue}期`);
        }
      } catch (error) {
          console.error(`处理${item.issue}期数据时出错:`, error);
          console.error(`错误堆栈:`, error.stack);
          // 继续处理下一条数据，不中断整体流程
        }
    }
    
    console.log(`数据同步完成，新增${updatedCount}条记录`);
    
    // 验证同步结果：检查是否确实插入了数据
    if (updatedCount > 0) {
      const verifyResult = await query('SELECT COUNT(*) as count FROM lottery_results');
      const verifyLetouResult = await query('SELECT COUNT(*) as count FROM letou');
      console.log(`同步后验证 - lottery_results表: ${verifyResult[0].count}条记录, letou表: ${verifyLetouResult[0].count}条记录`);
    }
    
    // 获取当前数据库中的最后一期期号
    const latestIssueResult = await query('SELECT issue FROM lottery_results ORDER BY CAST(issue AS UNSIGNED) DESC LIMIT 1');
    if (latestIssueResult.length > 0) {
      lastIssue = latestIssueResult[0].issue;
      console.log(`数据库中最新期号: ${lastIssue}`);
    }
    
    // 获取最新的几条记录用于返回，使用正确的列名
    const latestResults = await query('SELECT issue, draw_date AS drawDate, week, red, blue, sum, span, area_ratio, odd_even_ratio FROM lottery_results ORDER BY CAST(issue AS UNSIGNED) DESC LIMIT 5');
    
    // 格式化返回的数据
    const formattedResults = latestResults.map(item => ({
      issue: item.issue,
      drawDate: item.drawDate,
      weekday: item.week,
      // 注意：由于存储的是不带引号的字符串，这里不需要JSON.parse，直接处理字符串
      redBalls: item.red.replace(/\[|\]/g, '').split(',').map(ball => ball.trim()),
      blueBalls: item.blue.replace(/\[|\]/g, '').split(',').map(ball => ball.trim()),
      sum: item.sum.toString(),
      span: item.span.toString(),
      intervalRatio: item.area_ratio,
      parityRatio: item.odd_even_ratio
    }));
    
    console.log(`返回给前端的数据: ${JSON.stringify(formattedResults, null, 2)}`);
    
    return {
      success: true,
      message: updatedCount > 0 ? `成功更新了 ${updatedCount} 条新数据` : '数据库中已有最新数据',
      updatedCount,
      lastIssue,
      latestResults: formattedResults
    };
  } catch (error) {
    console.error('数据更新失败:', error);
    return {
      success: false,
      message: error.message || '数据同步失败',
      updatedCount: 0,
      lastIssue: '',
      latestResults: []
    };
  }
}

/**
 * 获取数据库中的最后一期开奖期号
 * @returns {Promise<Object>} 包含最后一期期号的响应
 */
async function getLastDatabaseIssue() {
  try {
    // 首先检查Redis缓存
    const cacheKey = 'last_lottery_issue';
    const cachedResult = await cacheGet(cacheKey);
    
    // 检查数据是否已更新（通过检查更新标记）
    const updatedFlag = await cacheGet('lottery_data_updated_flag');
    
    if (cachedResult && !updatedFlag) {
      console.log('从Redis缓存获取最后一期数据成功');
      return cachedResult;
    }
    
    console.log('Redis缓存未命中或数据已更新，执行数据库查询');
    // 使用draw_date字段排序，而不是issue字段，确保获取实际最新的开奖数据
    // 问题原因：issue字段格式不统一，导致CAST转换后的数值比较不准确
    const result = await query('SELECT issue FROM lottery_results ORDER BY draw_date DESC LIMIT 1');
    let responseData;
    
    if (result && result.length > 0) {
      responseData = { success: true, lastIssue: result[0].issue };
    } else {
      // 如果数据库中没有数据，返回一个默认值
      responseData = { success: true, lastIssue: '暂无数据', mock: true };
    }
    
    // 将结果存入Redis缓存，过期时间设置为10分钟
    await cacheSet(cacheKey, responseData, 600);
    // 设置更新标记，表示数据已缓存
    await cacheSet('lottery_data_updated_flag', false, 3600);
    console.log('最后一期数据已存入Redis缓存');
    
    return responseData;
  } catch (error) {
    console.error('获取最后一期数据失败:', error);
    return { success: false, message: error.message };
  }
}

/**
 * 大乐透数据更新接口
 * 接口功能: 从外部API获取最新大乐透开奖数据并同步到数据库，同时返回更新结果
 * 
 * 请求示例:
 * GET http://localhost:8083/gengxin
 * 
 * 响应格式说明:
 * 成功响应:
 * {
 *   "success": true,
 *   "message": "成功更新了 3 条新数据",
 *   "updatedCount": 3,
 *   "lastIssue": "25116",
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
 *   "message": "抓取数据失败",
 *   "updatedCount": 0,
 *   "lastIssue": "",
 *   "latestResults": []
 * }
 */
app.get('/gengxin', async (req, res) => {
  try {
    console.log('开始执行数据更新任务');
    
    // 抓取最新大乐透数据
    const lotteryData = await fetchNewLotteryData();
    
    // 同步数据到数据库
    const syncResult = await syncDataToDatabase(lotteryData);
    
    // 如果有新数据更新，清除相关的Redis缓存
    if (syncResult.updatedCount > 0) {
      console.log('数据已更新，开始清除Redis缓存...');
      // 这里我们可以使用通配符删除相关缓存，或者直接删除所有开奖数据缓存
      try {
        // 注意：Redis的del命令不支持通配符，但我们可以通过其他方式实现
        // 这里我们简单地删除一个特殊的缓存键，前端可以通过检查这个键来决定是否重新获取数据
        await cacheDel('lottery_data_updated_flag');
        console.log('Redis缓存清除标记已设置');
      } catch (error) {
        console.error('清除Redis缓存失败:', error);
      }
    }
    
    return res.json({
      success: true,
      message: syncResult.message,
      updatedCount: syncResult.updatedCount,
      lastIssue: syncResult.lastIssue,
      latestResults: syncResult.latestResults,
      ...(syncResult.mock && { mock: true })
    });
  } catch (error) {
    console.error('数据更新失败:', error);
    // 不再返回模拟数据，而是返回错误信息
    res.json({
      success: false,
      message: '抓取数据失败',
      updatedCount: 0,
      lastIssue: '',
      latestResults: []
    });
  }
});

/**
 * 获取数据库最后一期开奖期号接口
 * 接口功能: 获取数据库中存储的最新一期大乐透开奖期号，结果会被Redis缓存
 * 
 * 请求示例:
 * GET http://localhost:8083/getLastIssue
 * 
 * 响应格式说明:
 * 成功响应:
 * {
 *   "success": true,
 *   "lastIssue": "25116"
 * }
 * 
 * 数据库为空响应:
 * {
 *   "success": true,
 *   "lastIssue": "暂无数据",
 *   "mock": true
 * }
 * 
 * 失败响应:
 * {
 *   "success": false,
 *   "message": "获取数据失败"
 * }
 * 
 * 缓存说明:
 * - 接口会将查询结果缓存到Redis，过期时间为10分钟
 * - 当数据更新时，缓存会被标记为过期
 */
app.get('/getLastIssue', async (req, res) => {
  try {
    const result = await getLastDatabaseIssue();
    res.json(result);
  } catch (error) {
    console.error('获取最后一期数据失败:', error);
    res.json({ success: false, message: '抓取数据失败' });
  }
});

/**
 * 获取最新开奖数据但不同步接口
 * 接口功能: 从外部API获取最新大乐透开奖数据但不写入数据库，结果会被Redis缓存
 * 
 * 请求示例:
 * GET http://localhost:8083/getLatestData
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
 *   "message": "抓取数据失败",
 *   "latestResults": []
 * }
 * 
 * 缓存说明:
 * - 接口会将查询结果缓存到Redis，过期时间为1小时
 */
app.get('/getLatestData', async (req, res) => {
  try {
    console.log('开始获取最新开奖数据但不同步...');
    
    // 首先检查Redis缓存
    const cacheKey = 'latest_lottery_data';
    const cachedResult = await cacheGet(cacheKey);
    
    if (cachedResult) {
      console.log('从Redis缓存获取最新数据成功');
      return res.json(cachedResult);
    }
    
    console.log('Redis缓存未命中，执行API调用');
    // 抓取最新大乐透数据但不同步
    const latestData = await fetchNewLotteryData();
    
    // 格式化数据
    const formattedData = latestData.map(item => ({
      issue: item.issue,
      drawDate: item.drawDate,
      weekday: item.weekday,
      redBalls: item.redBalls,
      blueBalls: item.blueBalls,
      sum: item.sum,
      span: item.span,
      intervalRatio: item.intervalRatio,
      parityRatio: item.parityRatio
    }));
    
    // 构建响应结果
    const responseData = {
      success: true,
      latestResults: formattedData
    };
    
    console.log(`成功获取并格式化${formattedData.length}条最新数据`);
    
    // 将结果存入Redis缓存，过期时间设置为1小时
    await cacheSet(cacheKey, responseData, 3600);
    console.log('最新数据已存入Redis缓存');
    
    res.json(responseData);
  } catch (error) {
    console.error('获取最新数据失败:', error);
    
    // 不再使用模拟数据
    res.json({
      success: false,
      message: '抓取数据失败',
      latestResults: []
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`数据更新接口: http://localhost:${PORT}/gengxin`);
  console.log(`获取最后一期接口: http://localhost:${PORT}/getLastIssue`);
  console.log(`获取最新数据接口: http://localhost:${PORT}/getLatestData`);
});

// 引入获取数据的路由模块
const huoQuShuJuRouter = require('./huo_qu_shu_ju');

// 使用获取数据的路由模块
app.use('/', huoQuShuJuRouter);

module.exports = app;