const express = require('express');
const router = express.Router();
const db = require('./数据库配置.js');

// 获取三球组合详情数据
router.get('/san_qiu_zu_he_xiang_qing', async (req, res) => {
  try {
    const { combination, period } = req.query;
    
    // 参数验证
    if (!combination) {
      return res.json({
        success: false,
        message: '缺少必要参数combination'
      });
    }
    
    // 解析组合号码
    const comboNumbers = combination.split('-').map(num => parseInt(num)).sort((a, b) => a - b);
    
    if (comboNumbers.length !== 3 || comboNumbers.some(isNaN)) {
      return res.json({
        success: false,
        message: '组合格式不正确，应为三个数字用横线分隔'
      });
    }
    
    // 构建查询条件
    let limitClause = '';
    if (period && period !== 'all') {
      limitClause = `LIMIT ${parseInt(period)}`;
    }
    
    // 查询最近的开奖数据，包含bian_hao字段用于正确排序
    const allDraws = await db.query(
      `SELECT issue as period, bian_hao, draw_date as drawDate, 
              red as frontNumbers, 
              blue as backNumbers 
       FROM lottery_results 
       ORDER BY period DESC 
       ${limitClause}`
    );
    
    // 过滤出包含三球组合的记录
    const occurrenceDetails = [];
    
    // 使用for...of循环支持异步操作
    for (const draw of allDraws) {
      // 解析前区号码
      let frontNumbers;
      if (typeof draw.frontNumbers === 'string') {
        frontNumbers = draw.frontNumbers.split(' ').map(num => parseInt(num));
      } else if (Array.isArray(draw.frontNumbers)) {
        frontNumbers = draw.frontNumbers.map(num => parseInt(num));
      } else {
        continue;
      }
      
      // 解析后区号码
      let backNumbers;
      if (typeof draw.backNumbers === 'string') {
        backNumbers = draw.backNumbers.split(' ').map(num => parseInt(num));
      } else if (Array.isArray(draw.backNumbers)) {
        backNumbers = draw.backNumbers.map(num => parseInt(num));
      } else {
        backNumbers = [];
      }
      
      // 检查前区号码是否包含完整的三球组合
      const hasCombo = comboNumbers.every(num => frontNumbers.includes(num));
      
      if (hasCombo) {
          // 获取下一期开奖信息（如果存在）- 使用bian_hao字段作为顺序索引
          let nextPeriod = null;
          let nextPeriodFrontNumbers = null;
          
          try {
            // 首先获取当前期的bian_hao
            const currentBianHaoResult = await db.query(
              `SELECT bian_hao FROM lottery_results WHERE issue = '${draw.period}'`
            );
            
            console.log(`处理期号: ${draw.period}, bian_hao查询结果:`, currentBianHaoResult);
            
            if (currentBianHaoResult && currentBianHaoResult.length > 0) {
              const currentBianHao = currentBianHaoResult[0].bian_hao;
              console.log(`当前期${draw.period}的bian_hao: ${currentBianHao}`);
              
              // 使用bian_hao顺序索引查询下一期 - 找到bian_hao比当前大的最小记录
              const nextPeriodResult = await db.query(
                `SELECT issue as period, red as frontNumbers 
                 FROM lottery_results 
                 WHERE bian_hao > '${currentBianHao}' 
                 ORDER BY bian_hao ASC 
                 LIMIT 1`
              );
              
              console.log(`下一期查询结果:`, nextPeriodResult);
              
              if (nextPeriodResult && nextPeriodResult.length > 0) {
                nextPeriod = nextPeriodResult[0].period;
                console.log(`找到下一期: ${nextPeriod}`);
                
                // 解析下一期前区号码
                if (typeof nextPeriodResult[0].frontNumbers === 'string') {
                  nextPeriodFrontNumbers = nextPeriodResult[0].frontNumbers.split(' ').map(num => parseInt(num));
                } else if (Array.isArray(nextPeriodResult[0].frontNumbers)) {
                  nextPeriodFrontNumbers = nextPeriodResult[0].frontNumbers.map(num => parseInt(num));
                }
              } else {
                console.log(`未找到期号${draw.period}的下一期`);
              }
            } else {
              console.log(`未找到期号${draw.period}的bian_hao信息`);
            }
          } catch (error) {
            console.error(`查询下一期时出错:`, error);
          }
        
        occurrenceDetails.push({
          period: draw.period,
          drawDate: draw.drawDate,
          frontNumbers: frontNumbers,
          backNumbers: backNumbers,
          nextPeriod: nextPeriod,
          nextPeriodFrontNumbers: nextPeriodFrontNumbers
        });
      }
    }
    
    // 计算出现概率
    const totalDraws = allDraws.length;
    const count = occurrenceDetails.length;
    const probability = totalDraws > 0 ? ((count / totalDraws) * 100).toFixed(2) + '%' : '0.00%';
    
    // 返回结果
    res.json({
      success: true,
      data: {
        count: count,
        probability: probability,
        occurrenceDetails: occurrenceDetails
      }
    });
  } catch (error) {
    console.error('获取三球组合详情失败:', error);
    res.json({
      success: false,
      message: '服务器错误'
    });
  }
});

module.exports = router;