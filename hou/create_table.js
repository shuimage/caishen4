const { query } = require('./数据库配置.js');
const fs = require('fs');
const path = require('path');

async function createBacktestResultsTable() {
  try {
    // 读取SQL文件内容
    const sqlPath = path.join(__dirname, 'create_backtest_results_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // 执行SQL语句
    await query(sql);
    console.log('backtest_results表创建成功');
  } catch (error) {
    console.error('创建表失败:', error);
  }
}

// 执行创建表函数
createBacktestResultsTable();