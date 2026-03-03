const { query } = require('./数据库配置.js');

async function checkTableStructure() {
  try {
    console.log('开始检查lottery_results表结构...');
    const result = await query('DESCRIBE lottery_results');
    console.log('表结构:');
    result.forEach(field => {
      console.log(`${field.Field}: ${field.Type}`);
    });
    
    // 检查是否存在bian_hao字段
    const hasBianHao = result.some(field => field.Field === 'bian_hao');
    console.log(`\n是否存在bian_hao字段: ${hasBianHao}`);
    
  } catch (error) {
    console.error('错误:', error);
  }
}

checkTableStructure();