// 检查bian_hao格式和连续性的脚本
const { query } = require('./数据库配置.js');

async function checkBianHao() {
  try {
    console.log('开始检查bian_hao数据...');
    
    // 查询最近20期的数据，包括issue和bian_hao
    const results = await query('SELECT issue, bian_hao FROM lottery_results ORDER BY issue DESC LIMIT 20');
    
    console.log('查询结果数量:', results.length);
    
    if (results.length === 0) {
      console.log('未找到数据');
      return;
    }
    
    console.log('\n最近20期的数据:');
    console.log('期号\t\tbian_hao');
    console.log('------------------------');
    
    let prevNumericBianHao = null;
    let formatIssues = [];
    let continuityIssues = [];
    let orderIssues = [];
    
    for (let i = 0; i < results.length; i++) {
      const row = results[i];
      console.log(`${row.issue}\t\t${row.bian_hao}`);
      
      // 检查bian_hao格式
      const numericBianHao = parseInt(row.bian_hao.replace(/[^0-9]/g, ''));
      if (isNaN(numericBianHao)) {
        formatIssues.push({ issue: row.issue, bian_hao: row.bian_hao });
      }
      
      // 检查连续性
      if (prevNumericBianHao && numericBianHao) {
        const expectedBianHao = prevNumericBianHao - 1;
        if (numericBianHao !== expectedBianHao) {
          continuityIssues.push({
            currentIssue: row.issue,
            currentBianHao: row.bian_hao,
            expectedBianHao: expectedBianHao,
            previousBianHao: results[i-1].bian_hao
          });
        }
      }
      
      // 检查与期数顺序的关系
      if (i > 0) {
        const currentIssue = parseInt(row.issue);
        const prevIssue = parseInt(results[i-1].issue);
        if (currentIssue >= prevIssue) {
          orderIssues.push({
            currentIssue: row.issue,
            previousIssue: results[i-1].issue
          });
        }
      }
      
      prevNumericBianHao = numericBianHao;
    }
    
    console.log('\n检查结果:');
    
    if (formatIssues.length > 0) {
      console.log('\n格式问题:');
      formatIssues.forEach(issue => {
        console.log(`期号 ${issue.issue}: bian_hao ${issue.bian_hao} 无法提取数字部分`);
      });
    } else {
      console.log('\n格式检查: 所有bian_hao格式正确');
    }
    
    if (continuityIssues.length > 0) {
      console.log('\n连续性问题:');
      continuityIssues.forEach(issue => {
        console.log(`期号 ${issue.currentIssue}: bian_hao ${issue.currentBianHao} 与前一期 ${issue.previousBianHao} 不连续`);
      });
    } else {
      console.log('\n连续性检查: bian_hao连续');
    }
    
    if (orderIssues.length > 0) {
      console.log('\n顺序问题:');
      orderIssues.forEach(issue => {
        console.log(`期号 ${issue.currentIssue} 大于或等于前一期 ${issue.previousIssue}`);
      });
    } else {
      console.log('\n顺序检查: 期数顺序正确');
    }
    
  } catch (error) {
    console.error('检查bian_hao时出错:', error);
  }
}

checkBianHao();