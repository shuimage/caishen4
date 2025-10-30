// 参数说明: 无参数
// 接口功能: 从外部API获取最新大乐透开奖数据但不写入数据库

const express = require('express');
// 使用node-fetch代替axios以避免undici的File is not defined错误
const fetch = require('node-fetch');
const cors = require('cors');
const { query } = require('./db.config');

const app = express();
const PORT = process.env.PORT || 18891;

// 配置CORS，允许所有来源的请求
app.use(cors());

// 解析JSON请求体
app.use(express.json());

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

/**
 * 获取最新开奖数据但不同步接口
 * 接口功能: 从外部API获取最新大乐透开奖数据但不写入数据库
 * 
 * 请求示例:
 * GET http://localhost:18891/huo_qu_xin_lang_shu_ju
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
 */
app.get('/huo_qu_xin_lang_shu_ju', async (req, res) => {
  try {
    console.log('========================================');
    console.log('接收到getLatestData请求!');
    console.log('请求时间:', new Date().toLocaleString());
    console.log('请求来源:', req.headers.origin);
    console.log('请求IP:', req.ip);
    
    // 设置响应超时
    const timeoutId = setTimeout(() => {
      console.error('响应超时');
      res.json({
        success: false,
        message: '请求超时',
        latestResults: []
      });
    }, 15000); // 15秒响应超时
    
    // 首先从本地数据库查询最近一期的期号
    console.log('开始查询本地数据库中的最新期号...');
    const lastIssueResult = await query('SELECT issue FROM lottery_results ORDER BY draw_date DESC LIMIT 1');
    let startIssue = null;
    
    if (lastIssueResult && lastIssueResult.length > 0) {
      startIssue = lastIssueResult[0].issue;
      console.log(`本地数据库中最新期号: ${startIssue}`);
    } else {
      console.log('本地数据库中暂无数据或查询失败，获取全部最新数据');
    }
    
    // 根据本地最新期号抓取远程API数据
    console.log('开始获取最新开奖数据...');
    const latestData = await fetchNewLotteryData(startIssue);
    console.log('成功获取远程API数据:', latestData.length, '条', startIssue ? `(大于${startIssue}期的数据)` : '');
    
    // 清除超时定时器
    clearTimeout(timeoutId);
    
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
      latestResults: formattedData,
      lastIssue: formattedData.length > 0 ? formattedData[0].issue : ''
    };
    
    console.log(`成功获取并格式化${formattedData.length}条最新数据`);
    
    console.log('准备返回数据响应...');
    res.json(responseData);
    console.log('响应已发送成功!');
    console.log('========================================');
  } catch (error) {
    console.error('========================================');
    console.error('获取最新数据失败:', error);
    console.error('错误堆栈:', error.stack);
    console.error('========================================');
    
    // 返回错误信息，但不提供模拟数据
    res.json({
      success: false,
      message: '抓取数据失败: ' + (error.message || '未知错误'),
      latestResults: []
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`获取最新数据服务运行在 http://localhost:${PORT}`);
  console.log(`获取最新数据接口: http://localhost:${PORT}/huo_qu_xin_lang_shu_ju`);
});

module.exports = app;