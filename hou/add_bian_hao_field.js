// 为lottery_results和letou表填充bian_hao字段数据
const { query } = require('./db.config.js');

async function fillBianHaoData() {
  try {
    console.log('开始填充bian_hao字段数据...');
    
    // 1. 为lottery_results表填充bian_hao字段（按日期从远到近）
    await fillBianHaoForTable('lottery_results', 'draw_date', 'id');
    
    // 2. 为letou表填充bian_hao字段（按日期从远到近）
    await fillBianHaoForTable('letou', 'riqi', 'bianhao');
    
    console.log('所有操作完成！');
  } catch (error) {
    console.error('执行过程中出错:', error);
  }
}

async function fillBianHaoForTable(tableName, dateField, idField) {
  try {
    // 获取表中所有记录，按日期从远到近排序
    
    // 查询所有记录，按日期排序
    const records = await query(`
      SELECT * FROM ${tableName} 
      WHERE bian_hao IS NULL 
      ORDER BY ${dateField} ASC
    `);
    
    console.log(`为${tableName}表填充${records.length}条记录的bian_hao字段`);
    
    // 为每条记录生成bian_hao
    for (let i = 0; i < records.length; i++) {
      // 生成5位自增长数字，从00001开始
      const sequence = (i + 1).toString().padStart(5, '0');
      const bianHao = `LT${sequence}`;
      
      // 更新记录
      await query(`
        UPDATE ${tableName} 
        SET bian_hao = ? 
        WHERE ${idField} = ?
      `, [bianHao, records[i][idField]]);
      
      // 每100条记录输出一次进度
      if ((i + 1) % 100 === 0) {
        console.log(`${tableName}表: 已处理${i + 1}条记录`);
      }
    }
    
    console.log(`${tableName}表的bian_hao字段填充完成`);
  } catch (error) {
    console.error(`为${tableName}表填充数据时出错:`, error);
    throw error;
  }
}

// 执行脚本
fillBianHaoData();