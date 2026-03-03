const { query } = require('./数据库配置.js');

async function checkDatabase() {
  try {
    // 检查总记录数
    const countResult = await query('SELECT COUNT(*) AS count FROM lottery_results');
    console.log('总记录数:', countResult[0].count);
    
    // 检查最新的几条记录，查看bian_hao字段的格式
    const latestResults = await query('SELECT id, issue, bian_hao, red, blue FROM lottery_results ORDER BY id DESC LIMIT 10');
    console.log('\n最新10条记录:');
    latestResults.forEach((row, index) => {
      console.log(`${index + 1}. ID: ${row.id}, 期号: ${row.issue}, bian_hao: ${row.bian_hao}`);
      console.log(`   红球: ${row.red}, 蓝球: ${row.blue}`);
    });
    
    // 检查倒数4期的记录
    const daoShu4QiResult = await query('SELECT * FROM lottery_results ORDER BY id DESC LIMIT 3, 1');
    console.log('\n倒数4期记录:');
    if (daoShu4QiResult && daoShu4QiResult.length > 0) {
      console.log('ID:', daoShu4QiResult[0].id);
      console.log('期号:', daoShu4QiResult[0].issue);
      console.log('bian_hao:', daoShu4QiResult[0].bian_hao);
      console.log('红球:', daoShu4QiResult[0].red);
      console.log('蓝球:', daoShu4QiResult[0].blue);
    } else {
      console.log('未找到倒数4期记录');
    }
    
  } catch (error) {
    console.error('检查数据库时发生错误:', error);
  }
}

checkDatabase();
