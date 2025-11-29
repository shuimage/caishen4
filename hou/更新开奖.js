// 参数说明: 无参数
// 接口功能: 更新大乐透数据并返回结果

const express = require('express');
// 使用node-fetch代替axios以避免undici的File is not defined错误
const fetch = require('node-fetch');
const { query, transaction } = require('./数据库配置.js');

const router = express.Router();

/**
 * 从指定API获取最新大乐透数据
 * @returns {Promise<Array>} 彩票数据数组
 */
async function fetchNewLotteryData(startIssue = null) {
  try {
    console.log('开始从sporttery.cn抓取大乐透数据...', startIssue ? `起始期号: ${startIssue}` : '获取全部最新数据');
    // 增加获取的数据量，确保能获取到更多历史数据
    const apiUrl = 'https://webapi.sporttery.cn/gateway/lottery/getHistoryPageListV1.qry?gameNo=85&provinceId=0&pageSize=50&isVerify=1&pageNo=1';
    
    // 设置超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
    
    const response = await fetch(apiUrl, {
      method: 'GET',
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
      signal: controller.signal
    });
    
    clearTimeout(timeoutId); // 清除超时定时器
    
    if (!response.ok) {
      throw new Error(`API请求失败，状态码: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('成功获取数据，开始解析...');
    
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
    } else if (data.result && data.result.list) {
      listData = data.result.list;
    } else if (Array.isArray(data.list)) {
      listData = data.list;
    } else if (Array.isArray(data)) {
      listData = data;
    }
    
    if (!listData || !Array.isArray(listData)) {
      console.error('无法找到有效的数据列表:', data);
      throw new Error('API返回数据格式不正确，无法找到有效的数据列表');
    }
    
    console.log(`找到${listData.length}条数据记录`);
    
    // 格式化数据，并添加严格的错误检查
    const formattedData = [];
    
    for (const item of listData) {
      try {
        // 检查必要字段是否存在
        if (!item || typeof item !== 'object') {
          console.warn('跳过无效记录:', item);
          continue;
        }
        
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
          // 尝试不同的分隔符
          const possibleSeparators = [',', ' ', '|', ';'];
          let separatedNumbers = [];
          
          for (const separator of possibleSeparators) {
            const splitResult = item.lotteryDrawResult.split(separator).filter(num => num.trim());
            if (splitResult.length > separatedNumbers.length) {
              separatedNumbers = splitResult;
            }
          }
          
          // 根据中国体育彩票大乐透规则，前5个是前区号码，后2个是后区号码
          if (separatedNumbers.length >= 7) {
            redBalls = separatedNumbers.slice(0, 5).map(ball => ball.trim().padStart(2, '0'));
            blueBalls = separatedNumbers.slice(5, 7).map(ball => ball.trim().padStart(2, '0'));
          }
        } 
        // 如果是数组格式
        else if (Array.isArray(item.lotteryDrawResult)) {
          if (item.lotteryDrawResult.length >= 7) {
            redBalls = item.lotteryDrawResult.slice(0, 5).map(ball => String(ball).trim().padStart(2, '0'));
            blueBalls = item.lotteryDrawResult.slice(5, 7).map(ball => String(ball).trim().padStart(2, '0'));
          }
        }
        
        // 确保解析出了有效的球号
        if (redBalls.length !== 5 || blueBalls.length !== 2) {
          console.warn('未能解析出有效的球号数据，红球数量:', redBalls.length, '蓝球数量:', blueBalls.length);
          continue;
        }
        
        // 优先使用从日期计算的星期几
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
        // 跳过错误记录，继续处理下一条
        continue;
      }
    }
    
    console.log('成功解析的记录数量:', formattedData.length);
    
    // 如果没有解析到任何数据，抛出错误
    if (formattedData.length === 0) {
      throw new Error('未能解析到任何有效数据');
    }
    
    // 如果指定了起始期号，过滤出比起始期号大的数据
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
  } catch (error) {
    console.error('抓取数据失败:', error);
    throw error;
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

// 获取表中最大的bian_hao值，并返回数字部分
async function getMaxBianHao(tableName) {
  try {
    const result = await query(`SELECT MAX(bian_hao) as max_bian_hao FROM ${tableName}`);
    if (result && result[0].max_bian_hao) {
      // 提取数字部分并转为整数
      const numberStr = result[0].max_bian_hao.replace(/^LT/, '');
      return parseInt(numberStr, 10);
    }
    // 如果没有数据，返回0
    return 0;
  } catch (error) {
    console.error(`获取${tableName}表最大bian_hao值失败:`, error);
    return 0;
  }
}

/**
 * 同步数据到数据库
 * @param {Array} data 彩票数据数组
 * @returns {Promise<Object>} 同步结果
 */
async function syncDataToDatabase(newData) {
  try {
    console.log(`开始同步数据到数据库，共${newData ? newData.length : 0}条数据`);
    
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
    
    // 按期号升序排序，确保bian_hao值与期号顺序一致递增
    const sortedData = [...newData].sort((a, b) => {
      const issueA = typeof a.issue === 'string' ? parseInt(a.issue) : a.issue;
      const issueB = typeof b.issue === 'string' ? parseInt(b.issue) : b.issue;
      return issueA - issueB;
    });
    
    // 先获取数据库中现有的所有期号，避免重复查询
    const existingIssuesResult = await query('SELECT issue FROM lottery_results');
    const existingIssues = new Set(existingIssuesResult.map(item => item.issue));
    
    // 获取当前数据库中最大的bian_hao值，用于生成新的编号
    let maxLotteryResultsBianHao = await getMaxBianHao('lottery_results');
    let maxLetouBianHao = await getMaxBianHao('letou');
    
    // 初始化编号计数器
    let lotteryResultsBianHaoCounter = maxLotteryResultsBianHao + 1;
    let letouBianHaoCounter = maxLetouBianHao + 1;
    
    console.log(`数据库中已有${existingIssues.size}期数据`);
    
    for (const item of sortedData) {
      try {
        // 确保期号格式统一
        const issue = item.issue.toString();
        
        // 快速检查是否已存在该期数据
        if (!existingIssues.has(issue)) {
          // 确保前区显示前5个球，后区显示后2个球
          const frontArea = (item.redBalls || []).slice(0, 5).map(ball => parseInt(ball));
          const backArea = (item.blueBalls || []).slice(0, 2).map(ball => parseInt(ball));
          
          // 格式化红号和蓝号，不带引号
          const redStr = '[' + frontArea.join(', ') + ']';
          const blueStr = '[' + backArea.join(', ') + ']';
          
          try {
            // 生成新的bian_hao值
            const lotteryResultsBianHao = `LT${lotteryResultsBianHaoCounter.toString().padStart(5, '0')}`;
            const letouBianHao = `LT${letouBianHaoCounter.toString().padStart(5, '0')}`;
            
            // 更新计数器
            lotteryResultsBianHaoCounter++;
            letouBianHaoCounter++;
            
            // 使用事务确保数据一致性
            await transaction([
              // 插入lottery_results表，包含bian_hao字段
              {
                sql: 'INSERT INTO lottery_results (issue, draw_date, week, red, blue, sum, span, area_ratio, odd_even_ratio, bian_hao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                params: [
                  issue,
                  item.drawDate || new Date().toISOString().split('T')[0],
                  item.weekday || '0',
                  redStr,
                  blueStr,
                  parseInt(item.sum) || 0,
                  parseInt(item.span) || 0,
                  item.intervalRatio || '0:0:0',
                  item.parityRatio || '0:0',
                  lotteryResultsBianHao
                ]
              },
              // 插入letou表，包含bian_hao字段
              {
                sql: 'INSERT INTO letou (riqi, qihao, qian1, qian2, qian3, qian4, qian5, hou1, hou2, bian_hao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                params: [
                  item.drawDate || new Date().toISOString().split('T')[0],
                  issue,
                  frontArea[0] || 0,
                  frontArea[1] || 0,
                  frontArea[2] || 0,
                  frontArea[3] || 0,
                  frontArea[4] || 0,
                  backArea[0] || 0,
                  backArea[1] || 0,
                  letouBianHao
                ]
              }
            ]);
            
            console.log(`事务提交成功: ${issue}期数据已同步到两个表`);
            updatedCount++;
            
            // 更新内存中的存在期号集合，避免重复处理
            existingIssues.add(issue);
          } catch (transactionError) {
            console.error(`事务回滚，处理${issue}期数据失败:`, transactionError);
            // 继续处理下一条数据
            continue;
          }
          lastIssue = issue;
        } else {
          console.log(`数据已存在，跳过: ${issue}期`);
        }
      } catch (error) {
          console.error(`处理${item.issue}期数据时出错:`, error);
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
    const formattedResults = latestResults.map(item => {
      // 确保red和blue是字符串类型
      const redStr = typeof item.red === 'string' ? item.red : JSON.stringify(item.red || []);
      const blueStr = typeof item.blue === 'string' ? item.blue : JSON.stringify(item.blue || []);
      
      return {
        issue: item.issue,
        drawDate: item.drawDate,
        weekday: item.week,
        // 注意：由于存储的是不带引号的字符串，这里不需要JSON.parse，直接处理字符串
        redBalls: redStr.replace(/\[|\]/g, '').split(',').map(ball => ball.trim()),
        blueBalls: blueStr.replace(/\[|\]/g, '').split(',').map(ball => ball.trim()),
        sum: item.sum.toString(),
        span: item.span.toString(),
        intervalRatio: item.area_ratio,
        parityRatio: item.odd_even_ratio
      };
    });
    
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
 * 大乐透数据更新接口
 * 接口功能: 从外部API获取最新大乐透开奖数据并同步到数据库，同时返回更新结果
 */
router.get('/', async (req, res) => {
  try {
    console.log('开始执行数据更新任务');
    
    // 抓取最新大乐透数据
    const lotteryData = await fetchNewLotteryData();
    console.log('成功获取远程API数据，共', lotteryData.length, '条记录');
    
    // 同步数据到数据库
    const syncResult = await syncDataToDatabase(lotteryData);
    
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
    // 返回错误信息，不返回模拟数据
    res.json({
      success: false,
      message: '抓取数据失败',
      updatedCount: 0,
      lastIssue: '',
      latestResults: []
    });
  }
});

module.exports = router;