// create_two_ball_combination_table.js
// 创建最新1期两球组合数据表
const { query, pool } = require('./数据库配置.js');

async function createTable() {
  try {
    const sql = `
      CREATE TABLE IF NOT EXISTS latest_two_ball_combinations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        front_ball_1 INT NOT NULL CHECK (front_ball_1 BETWEEN 1 AND 35),
        front_ball_2 INT NOT NULL CHECK (front_ball_2 BETWEEN 1 AND 35),
        combination_period VARCHAR(10) NOT NULL,
        combination_front_numbers VARCHAR(50) NOT NULL,
        next_period VARCHAR(10) NOT NULL,
        next_front_numbers VARCHAR(50) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_combination (front_ball_1, front_ball_2),
        INDEX idx_period (combination_period)
      );
    `;
    
    await query(sql);
    console.log('最新1期两球组合数据表创建成功');
  } catch (error) {
    console.error('创建表失败:', error.message);
  } finally {
    // 关闭连接池
    await pool.end();
  }
}

createTable();