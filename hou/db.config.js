// 数据库配置文件
const mysql = require('mysql2/promise');
// 尝试从不同位置加载.env文件
require('dotenv').config({ path: '/home/work/caishen2/.env' });
console.log('DB Config:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ? '******' : undefined,
  database: process.env.DB_NAME
});

// 数据库连接配置 - 优先使用环境变量，否则使用默认值
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456', // 使用用户提供的密码
  database: process.env.DB_NAME || 'letou',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: process.env.DB_POOL_LIMIT || 10,
  queueLimit: 0
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

/**
 * 执行SQL查询
 * @param {string} sql - SQL查询语句
 * @param {Array} params - SQL参数数组
 * @returns {Promise} 查询结果
 */
async function query(sql, params = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('数据库查询错误:', error);
    throw error;
  }
}

/**
 * 执行事务
 * @param {Array} queries - 事务查询数组，每个元素包含sql和params
 * @returns {Promise} 事务结果
 */
async function transaction(queries) {
  let connection;
  
  try {
    // 从连接池获取连接
    connection = await pool.getConnection();
    await connection.beginTransaction();
    
    const results = [];
    for (const { sql, params } of queries) {
      const [result] = await connection.execute(sql, params);
      results.push(result);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('数据库事务错误:', error);
    throw error;
  } finally {
    if (connection) connection.release(); // 释放连接回连接池
  }
}

module.exports = {
  dbConfig,
  pool,
  query,
  transaction
};