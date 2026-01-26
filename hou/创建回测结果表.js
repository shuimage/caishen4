const { query } = require('./数据库配置.js');

async function createBacktestResultsTable() {
  try {
    console.log('正在创建回测结果表...');
    
    const createTableSql = `
      CREATE TABLE IF NOT EXISTS backtest_results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cache_key VARCHAR(255) NOT NULL UNIQUE,
        backtest_results JSON NOT NULL,
        current_period VARCHAR(50),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `;
    
    await query(createTableSql);
    console.log('回测结果表创建成功！');
    
  } catch (error) {
    console.error('创建回测结果表失败:', error);
    process.exit(1);
  }
}

createBacktestResultsTable();