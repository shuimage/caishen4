// 最新1期两球组合数据转换脚本
const { query, pool } = require('./数据库配置.js');

async function main() {
  console.log('开始执行最新1期两球组合数据转换...');
  
  try {
    // 1. 获取所有期数的开奖记录，按照期号顺序排列
    const getRecordsSql = 'SELECT qihao, qian1, qian2, qian3, qian4, qian5 FROM letou ORDER BY qihao ASC';
    const records = await query(getRecordsSql);
    
    console.log(`获取到 ${records.length} 期开奖记录`);
    
    if (records.length < 2) {
      console.log('期数不足，至少需要2期数据才能生成组合');
      return;
    }
    
    // 2. 生成两两组合数据
    const combinations = [];
    
    for (let i = 0; i < records.length - 1; i++) {
      const currentRecord = records[i];
      const nextRecord = records[i + 1];
      
      // 获取当前期的前区号码
      const currentBalls = [
        currentRecord.qian1,
        currentRecord.qian2,
        currentRecord.qian3,
        currentRecord.qian4,
        currentRecord.qian5
      ];
      
      // 获取下一期的前区号码
      const nextBalls = [
        nextRecord.qian1,
        nextRecord.qian2,
        nextRecord.qian3,
        nextRecord.qian4,
        nextRecord.qian5
      ];
      
      // 生成两两组合（确保组合不重复，如1和2与2和1视为同一个组合）
      for (let j = 0; j < currentBalls.length; j++) {
        for (let k = j + 1; k < currentBalls.length; k++) {
          const ball1 = currentBalls[j];
          const ball2 = currentBalls[k];
          
          // 格式化数据
          const combination = {
            front_ball_1: ball1,
            front_ball_2: ball2,
            combination_period: currentRecord.qihao,
            combination_front_numbers: currentBalls.join(','),
            next_period: nextRecord.qihao,
            next_front_numbers: nextBalls.join(',')
          };
          
          combinations.push(combination);
        }
      }
    }
    
    console.log(`生成了 ${combinations.length} 个两球组合`);
    
    // 3. 清空现有数据
    const truncateSql = 'TRUNCATE TABLE latest_two_ball_combinations';
    await query(truncateSql);
    console.log('已清空现有数据');
    
    // 4. 批量插入数据（每1000条插入一次）
    const batchSize = 1000;
    let insertedCount = 0;
    
    for (let i = 0; i < combinations.length; i += batchSize) {
      const batch = combinations.slice(i, i + batchSize);
      
      // 生成批量插入的SQL语句
      const placeholders = batch.map(() => '(?, ?, ?, ?, ?, ?)').join(',');
      const values = [];
      
      batch.forEach(comb => {
        values.push(
          comb.front_ball_1,
          comb.front_ball_2,
          comb.combination_period,
          comb.combination_front_numbers,
          comb.next_period,
          comb.next_front_numbers
        );
      });
      
      const insertSql = `
        INSERT INTO latest_two_ball_combinations 
        (front_ball_1, front_ball_2, combination_period, combination_front_numbers, next_period, next_front_numbers)
        VALUES ${placeholders}
      `;
      
      await query(insertSql, values);
      insertedCount += batch.length;
      console.log(`已插入 ${insertedCount} / ${combinations.length} 条数据`);
    }
    
    console.log('✅ 最新1期两球组合数据转换完成！');
    console.log(`共处理 ${records.length} 期开奖记录`);
    console.log(`共生成 ${combinations.length} 个两球组合`);
    console.log(`共插入 ${insertedCount} 条数据到 latest_two_ball_combinations 表中`);
    
  } catch (error) {
    console.error('❌ 数据转换失败:', error.message);
    console.error('错误堆栈:', error.stack);
  } finally {
    // 关闭数据库连接池
    await pool.end();
    console.log('数据库连接已关闭');
  }
}

// 执行主函数
main();