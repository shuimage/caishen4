const { query } = require('./数据库配置.js');

// 更新回测结果表，添加 backtest_period 字段
async function updateBacktestResultsTable() {
  try {
    // 先检查字段是否存在
    const checkSql = `
      SHOW COLUMNS FROM backtest_results LIKE 'backtest_period'
    `;
    const checkResult = await query(checkSql);
    
    // 如果字段不存在，添加字段
    if (checkResult.length === 0) {
      const alterSql = `
        ALTER TABLE backtest_results 
        ADD COLUMN backtest_period VARCHAR(10) DEFAULT NULL
      `;
      await query(alterSql);
      console.log('数据库表结构更新成功，添加了 backtest_period 字段');
    } else {
      console.log('backtest_period 字段已存在，无需更新');
    }
  } catch (error) {
    console.error('更新数据库表结构失败:', error);
  }
}

updateBacktestResultsTable();