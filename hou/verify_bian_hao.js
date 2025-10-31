// 验证bian_hao字段填充是否正确
const { query } = require('./db.config.js');

async function verifyBianHao() {
  try {
    console.log('开始验证bian_hao字段...');
    
    // 1. 验证lottery_results表
    await verifyTable('lottery_results', 'draw_date', 'id');
    
    // 2. 验证letou表
    await verifyTable('letou', 'riqi', 'bianhao');
    
    console.log('所有表的bian_hao字段验证完成！');
  } catch (error) {
    console.error('验证过程中出错:', error);
  }
}

async function verifyTable(tableName, dateField, idField) {
  console.log(`\n=== 验证${tableName}表 ===`);
  
  // 检查是否有未填充的记录
  const nullRecords = await query(`
    SELECT COUNT(*) as count FROM ${tableName} WHERE bian_hao IS NULL
  `);
  console.log(`未填充bian_hao的记录数: ${nullRecords[0].count}`);
  
  if (nullRecords[0].count > 0) {
    console.error(`${tableName}表中还有${nullRecords[0].count}条记录未填充bian_hao字段！`);
  }
  
  // 检查bian_hao格式是否正确（LT开头+5位数字）
  const invalidFormatRecords = await query(`
    SELECT COUNT(*) as count FROM ${tableName} 
    WHERE bian_hao NOT REGEXP '^LT[0-9]{5}$'
  `);
  console.log(`格式不正确的记录数: ${invalidFormatRecords[0].count}`);
  
  if (invalidFormatRecords[0].count > 0) {
    console.error(`${tableName}表中有${invalidFormatRecords[0].count}条记录的bian_hao格式不正确！`);
    // 显示一些格式不正确的记录作为示例
    const examples = await query(`
      SELECT ${idField}, bian_hao FROM ${tableName} 
      WHERE bian_hao NOT REGEXP '^LT[0-9]{5}$' LIMIT 5
    `);
    console.log('格式不正确的记录示例:', examples);
  }
  
  // 检查bian_hao是否唯一
  const duplicateRecords = await query(`
    SELECT bian_hao, COUNT(*) as count FROM ${tableName} 
    GROUP BY bian_hao HAVING COUNT(*) > 1
  `);
  console.log(`重复的bian_hao数量: ${duplicateRecords.length}`);
  
  if (duplicateRecords.length > 0) {
    console.error(`${tableName}表中有${duplicateRecords.length}个重复的bian_hao值！`);
    console.log('重复的值:', duplicateRecords);
  }
  
  // 检查排序是否正确（按日期从远到近，bian_hao递增）
  const checkOrder = await query(`
    SELECT 
      @prev_num := 0,
      @prev_date := '1000-01-01'`);
  
  const orderErrors = await query(`
    SELECT 
      ${idField}, 
      ${dateField}, 
      bian_hao, 
      CAST(SUBSTRING(bian_hao, 3) AS UNSIGNED) as num
    FROM ${tableName}
    ORDER BY ${dateField} ASC
  `);
  
  let orderErrorCount = 0;
  let lastNum = 0;
  
  for (const record of orderErrors) {
    const currentNum = record.num;
    if (currentNum < lastNum || currentNum === lastNum) {
      console.error(`排序错误：记录${record[idField]}的bian_hao(${record.bian_hao})顺序不正确，应该大于${lastNum}`);
      orderErrorCount++;
    }
    lastNum = currentNum;
  }
  
  console.log(`排序错误数量: ${orderErrorCount}`);
  
  // 显示前5条和后5条记录，确认格式和排序
  console.log('\n前5条记录示例:');
  const first5 = await query(`
    SELECT ${idField}, ${dateField}, bian_hao 
    FROM ${tableName} 
    ORDER BY ${dateField} ASC LIMIT 5
  `);
  console.log(first5);
  
  console.log('\n后5条记录示例:');
  const last5 = await query(`
    SELECT ${idField}, ${dateField}, bian_hao 
    FROM ${tableName} 
    ORDER BY ${dateField} DESC LIMIT 5
  `);
  console.log(last5);
  
  // 统计总记录数
  const totalRecords = await query(`
    SELECT COUNT(*) as count FROM ${tableName}
  `);
  console.log(`\n${tableName}表总记录数: ${totalRecords[0].count}`);
  
  if (nullRecords[0].count === 0 && invalidFormatRecords[0].count === 0 && 
      duplicateRecords.length === 0 && orderErrorCount === 0) {
    console.log(`${tableName}表的bian_hao字段填充正确！`);
  }
}

// 执行验证
verifyBianHao();