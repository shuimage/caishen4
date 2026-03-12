// 参数说明: period - 期号
// 接口功能: 根据期号获取大乐透开奖信息

const express = require('express');
const { query } = require('./数据库配置.js');

const router = express.Router();

// 提取号码的辅助函数
function extractNumbers(data) {
  if (!data) return [];
  
  // 将数据转换为字符串
  const dataStr = String(data);
  
  // 使用正则表达式提取所有数字
  const numbers = dataStr.match(/\d+/g) || [];
  
  return numbers;
}

/**
 * 根据期号获取开奖信息
 * @param {string} period - 期号
 * @returns {Promise<Object>} 包含开奖信息的响应
 */
async function getDrawInfoByPeriod(period) {
  try {
    console.log(`查询期号 ${period} 的开奖信息`);
    
    // 查询指定期号的开奖信息
    const result = await query('SELECT issue, draw_date, red, blue FROM lottery_results WHERE issue = ?', [period]);
    let responseData;
    
    if (result && result.length > 0) {
      const drawData = result[0];
      
      // 获取前区号码和后区号码
      const firstZoneNumbers = extractNumbers(drawData.red);
      const lastZoneNumbers = extractNumbers(drawData.blue);
      
      console.log('前区号码:', firstZoneNumbers);
      console.log('后区号码:', lastZoneNumbers);
      
      // 格式化日期为YYYY-MM-DD格式
      let formattedDate = drawData.draw_date;
      if (formattedDate instanceof Date) {
        formattedDate = formattedDate.toISOString().split('T')[0];
      } else if (typeof formattedDate === 'string') {
        if (formattedDate.includes('T')) {
          formattedDate = formattedDate.split('T')[0];
        }
      }
      
      // 创建响应数据
      responseData = {
        success: true,
        drawInfo: {
          period: drawData.issue,
          drawDate: formattedDate,
          firstZoneNumbers: firstZoneNumbers,
          lastZoneNumbers: lastZoneNumbers
        }
      };
    } else {
      // 如果数据库中没有数据，返回空数据
      responseData = {
        success: false,
        message: `未找到期号 ${period} 的开奖信息`
      };
    }
    
    console.log(`获取期号 ${period} 开奖信息成功`);
    return responseData;
  } catch (error) {
    console.error(`获取期号 ${period} 开奖信息失败:`, error);
    return { success: false, message: error.message };
  }
}

// GET 接口
router.get('/', async (req, res) => {
  const { period } = req.query;
  
  if (!period) {
    return res.status(400).json({ success: false, message: '期号参数不能为空' });
  }
  
  const result = await getDrawInfoByPeriod(period);
  res.json(result);
});

module.exports = router;
module.exports.getDrawInfoByPeriod = getDrawInfoByPeriod;
