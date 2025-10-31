// 检查表结构
const { query } = require('./db.config.js');

async function checkTableStructure() {
  try {
    // 查看lottery_results表结构
    console.log('=== lottery_results表结构 ===');
    const lotteryResultsStructure = await query(
      "SHOW COLUMNS FROM lottery_results"
    );
    console.log(lotteryResultsStructure);
    
    // 查看letou表结构
    console.log('\n=== letou表结构 ===');
    const letouStructure = await query(
      "SHOW COLUMNS FROM letou"
    );
    console.log(letouStructure);
    
    // 查看是否已经有bian_hao字段
    const hasLotteryResultsBianHao = lotteryResultsStructure.some(col => col.Field === 'bian_hao');
    const hasLetouBianHao = letouStructure.some(col => col.Field === 'bian_hao');
    
    console.log(`\nlottery_results表已${hasLotteryResultsBianHao ? '有' : '无'}bian_hao字段`);
    console.log(`letou表已${hasLetouBianHao ? '有' : '无'}bian_hao字段`);
  } catch (error) {
    console.error('检查表结构时出错:', error);
  }
}

checkTableStructure();