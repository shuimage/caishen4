// 深度预测API
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// 创建数据库连接池
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'letou',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 初始化深度预测数据表
async function initDeepPredictionTable() {
  try {
    const connection = await pool.getConnection();
    
    // 创建深度预测数据表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS qian_qu_shen_du_yu_ce (
        id INT AUTO_INCREMENT PRIMARY KEY,
        period INT NOT NULL,
        backtest_period INT NOT NULL,
        card_index INT NOT NULL,
        card_name VARCHAR(255) NOT NULL,
        buy_numbers JSON NOT NULL,
        accuracy_data JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_period_backtest_card (period, backtest_period, card_index)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    connection.release();
    console.log('深度预测数据表初始化成功');
  } catch (error) {
    console.error('初始化深度预测数据表失败:', error);
  }
}

// 调用初始化函数
initDeepPredictionTable();

// 保存深度预测回测数据
router.post('/save_shen_du_yu_ce_data', async (req, res) => {
  try {
    const { period, backtest_period, backtest_results } = req.body;
    
    // 验证参数
    if (!period || !backtest_period || !backtest_results) {
      return res.json({ success: false, message: '参数不完整' });
    }
    
    const connection = await pool.getConnection();
    
    // 开启事务
    await connection.beginTransaction();
    
    try {
      // 保存每个卡片的回测结果
      for (const result of backtest_results) {
        const { cardIndex, cardName, buyNumbersCollection } = result;
        
        // 使用REPLACE INTO实现覆盖功能
        await connection.execute(
          `REPLACE INTO qian_qu_shen_du_yu_ce (period, backtest_period, card_index, card_name, buy_numbers, accuracy_data)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [period, backtest_period, cardIndex, cardName, JSON.stringify(buyNumbersCollection), JSON.stringify({})]
        );
      }
      
      // 提交事务
      await connection.commit();
      connection.release();
      
      res.json({ success: true, message: '数据保存成功' });
    } catch (error) {
      // 回滚事务
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('保存深度预测数据失败:', error);
    res.json({ success: false, message: '接口失败' });
  }
});

// 获取深度预测回测数据
router.get('/get_shen_du_yu_ce_data', async (req, res) => {
  try {
    const { period, backtest_period } = req.query;
    
    const connection = await pool.getConnection();
    
    let query = 'SELECT * FROM qian_qu_shen_du_yu_ce WHERE 1=1';
    const params = [];
    
    if (period) {
      query += ' AND period = ?';
      params.push(period);
    }
    
    if (backtest_period) {
      query += ' AND backtest_period = ?';
      params.push(backtest_period);
    }
    
    query += ' ORDER BY period DESC, backtest_period DESC, card_index ASC';
    
    const [results] = await connection.execute(query, params);
    connection.release();
    
    // 解析JSON字段，添加更健壮的错误处理
    const parsedResults = [];
    for (const item of results) {
      try {
        // 处理buy_numbers字段
        let buyNumbers = [];
        try {
          if (item.buy_numbers) {
            if (typeof item.buy_numbers === 'string') {
              buyNumbers = JSON.parse(item.buy_numbers);
            } else {
              buyNumbers = item.buy_numbers;
            }
          }
        } catch (e) {
          console.error('解析buy_numbers失败:', e);
          buyNumbers = [];
        }
        
        // 处理accuracy_data字段
        let accuracyData = {};
        try {
          if (item.accuracy_data) {
            if (typeof item.accuracy_data === 'string') {
              accuracyData = JSON.parse(item.accuracy_data);
            } else {
              accuracyData = item.accuracy_data;
            }
          }
        } catch (e) {
          console.error('解析accuracy_data失败:', e);
          accuracyData = {};
        }
        
        // 添加到结果数组
        parsedResults.push({
          ...item,
          buy_numbers: buyNumbers,
          accuracy_data: accuracyData
        });
      } catch (e) {
        console.error('处理单个结果失败:', e);
        // 跳过有问题的记录
      }
    }
    
    res.json({ success: true, data: parsedResults });
  } catch (error) {
    console.error('获取深度预测数据失败:', error);
    res.json({ success: false, message: '接口失败' });
  }
});

// 删除深度预测回测数据
router.delete('/delete_shen_du_yu_ce_data', async (req, res) => {
  try {
    const { period, backtest_period } = req.query;
    
    if (!period) {
      return res.json({ success: false, message: '期号不能为空' });
    }
    
    const connection = await pool.getConnection();
    
    let query = 'DELETE FROM qian_qu_shen_du_yu_ce WHERE period = ?';
    const params = [period];
    
    if (backtest_period) {
      query += ' AND backtest_period = ?';
      params.push(backtest_period);
    }
    
    await connection.execute(query, params);
    connection.release();
    
    res.json({ success: true, message: '数据删除成功' });
  } catch (error) {
    console.error('删除深度预测数据失败:', error);
    res.json({ success: false, message: '接口失败' });
  }
});

module.exports = router;