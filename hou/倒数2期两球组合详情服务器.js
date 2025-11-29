// 倒数2期两球组合详情服务器 - 仅作为模块导出，不再单独启动服务器
const express = require('express');
const cors = require('cors');
const { query } = require('./数据库配置.js');

const app = express();

// 启用CORS
app.use(cors());

// 解析JSON请求体
app.use(express.json());

// 处理球号数据，确保格式一致
function processBalls(balls) {
  if (!balls) return [];
  // 将球号字符串转换为数组并处理成标准格式
  if (typeof balls === 'string') {
    return balls.split(' ')
      .filter(ball => ball.trim() !== '')
      .map(ball => ball.padStart(2, '0'));
  } else if (Array.isArray(balls)) {
    return balls.map(ball => String(ball).padStart(2, '0'));
  }
  return [];
}

// 接口：获取倒数2期两球组合详情
app.post('/zuhe/dao_shu_2_qi_liang_qiu_zu_he_xiang_qing', async (req, res) => {
  try {
    // 获取请求参数
    const { latest_period, type = 'front', combinations = [], stats_range = 100, target_ball = null } = req.body;
    
    // 参数验证
    if (!latest_period) {
      return res.status(400).json({ code: 400, message: '最新期号是必填参数' });
    }
    
    if (!Array.isArray(combinations) || combinations.length === 0) {
      return res.status(400).json({ code: 400, message: '组合数组不能为空' });
    }
    
    // 验证统计范围
    if (!Number.isInteger(stats_range) || stats_range <= 0) {
      return res.status(400).json({ code: 400, message: '统计范围必须是正整数' });
    }
    
    // 验证类型
    if (type !== 'front' && type !== 'back') {
      return res.status(400).json({ code: 400, message: '类型只能是front或back' });
    }
    
    // 解析最新期号，提取前缀和数字部分
    const periodPrefix = latest_period.match(/[^0-9]+/) ? latest_period.match(/[^0-9]+/)[0] : '';
    const periodNumber = parseInt(latest_period.replace(/[^0-9]/g, ''));
    
    if (isNaN(periodNumber)) {
      return res.status(400).json({ code: 400, message: '最新期号格式不正确' });
    }
    
    // 计算倒数2期的期号
    const daoShu2QiPeriodNumber = periodNumber - 2;
    const daoShu2QiPeriod = periodPrefix + daoShu2QiPeriodNumber.toString().padStart(3, '0');
    
    // 查询倒数2期的开奖数据
    const daoShu2QiData = await query(
      'SELECT * FROM lottery_results WHERE issue = ? LIMIT 1',
      [daoShu2QiPeriod]
    );
    
    if (!daoShu2QiData || daoShu2QiData.length === 0) {
      return res.status(404).json({ code: 404, message: '未找到倒数2期的开奖数据' });
    }
    
    const daoShu2QiResult = daoShu2QiData[0];
    
    // 提取倒数2期的开奖号码
    const drawField = type === 'front' ? 'red' : 'blue';
    const drawNumbers = processBalls(daoShu2QiResult[drawField]);
    
    // 检查所有请求的组合是否在倒数2期的开奖号码中出现
    const matchingCombinations = [];
    
    for (const combination of combinations) {
      // 拆分组合
      const comboParts = combination.split('-')
        .map(part => part.trim())
        .map(part => part.padStart(2, '0'));
      
      // 检查组合是否都出现在开奖号码中
      const allMatch = comboParts.every(part => drawNumbers.includes(part));
      
      if (allMatch) {
        matchingCombinations.push(combination);
      }
    }
    
    if (matchingCombinations.length === 0) {
      return res.status(404).json({ code: 404, message: '在倒数2期中未找到匹配的组合' });
    }
    
    // 查询历史数据，查找这些组合出现的记录
    // 构建查询SQL
    let sql = `
      SELECT 
        l1.id, 
        l1.issue as current_period, 
        l1.${drawField} as draw_info,
        l2.issue as next_period,
        l2.${drawField} as next_draw_info
      FROM 
        lottery_results l1
      LEFT JOIN 
        lottery_results l2 ON l1.id + 1 = l2.id
      WHERE 
        l1.id < ?
    `;
    
    // 添加组合匹配条件
    const comboConditions = matchingCombinations.map(() => `${drawField} LIKE ?`);
    sql += ` AND (${comboConditions.join(' OR ')})`;
    
    // 添加统计范围限制
    sql += ` ORDER BY l1.id DESC LIMIT ?`;
    
    // 构建查询参数
    const params = [daoShu2QiResult.id];
    
    // 添加每个组合的匹配参数
    for (const combination of matchingCombinations) {
      // 构建模糊查询条件，确保组合中的每个数字都存在于开奖号码中
      // 注意：这是一个简化的实现，实际应用中可能需要更精确的匹配逻辑
      const comboParts = combination.split('-');
      let likeCondition = '%';
      comboParts.forEach(part => {
        likeCondition += part.trim() + '%';
      });
      params.push(likeCondition);
    }
    
    params.push(stats_range);
    
    // 执行查询
    let results = await query(sql, params);
    
    // 对结果进行过滤，确保每个记录都真正包含请求的组合
    // 这是因为LIKE查询可能会产生不准确的匹配
    results = results.filter(record => {
      const currentDrawNumbers = processBalls(record.draw_info);
      
      // 检查是否至少有一个请求的组合匹配
      return matchingCombinations.some(combination => {
        const comboParts = combination.split('-')
          .map(part => part.trim())
          .map(part => part.padStart(2, '0'));
        
        return comboParts.every(part => currentDrawNumbers.includes(part));
      });
    });
    
    // 如果有目标球号，需要在结果中标记目标球在第几期出现
    if (target_ball !== null && target_ball !== undefined) {
      // 重新查询，获取更多数据以分析目标球的出现情况
      const targetBallAnalysis = await analyzeTargetBallAppearance(matchingCombinations, target_ball, type, daoShu2QiResult.id, stats_range);
      
      // 合并分析结果到主结果中
      results = results.map(record => ({
        ...record,
        target_ball_appearance: targetBallAnalysis.find(item => item.period === record.current_period)?.appearance || null
      }));
    }
    
    // 为结果添加索引
    results = results.map((result, index) => ({
      ...result,
      index: index + 1,
      period: result.current_period // 为了保持与前端接口兼容性，添加period字段
    }));
    
    // 如果没有找到匹配的历史记录
    if (results.length === 0) {
      return res.status(404).json({ code: 404, message: '在指定范围内未找到匹配的组合数据' });
    }
    
    // 返回成功结果
    res.json({
      code: 200,
      message: 'success',
      data: results
    });
  } catch (error) {
    console.error('处理请求时发生错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

// 分析目标球出现情况的辅助函数
async function analyzeTargetBallAppearance(combinations, targetBall, type, latestId, statsRange) {
  try {
    // 格式化目标球号
    const formattedTargetBall = String(targetBall).padStart(2, '0');
    const drawField = type === 'front' ? 'red' : 'blue';
    
    // 构建查询SQL，查找所有匹配组合的记录
    let sql = `
      SELECT 
        l1.id, 
        l1.issue,
        l1.${drawField} as draw_info,
        l2.issue as next_period_1,
        l2.${drawField} as next_draw_info_1,
        l3.issue as next_period_2,
        l3.${drawField} as next_draw_info_2,
        l4.issue as next_period_3,
        l4.${drawField} as next_draw_info_3
      FROM 
        lottery_results l1
      LEFT JOIN lottery_results l2 ON l1.id + 1 = l2.id
      LEFT JOIN lottery_results l3 ON l1.id + 2 = l3.id
      LEFT JOIN lottery_results l4 ON l1.id + 3 = l4.id
      WHERE 
        l1.id < ?
    `;
    
    // 添加组合匹配条件
    const comboConditions = combinations.map(() => `${drawField} LIKE ?`);
    sql += ` AND (${comboConditions.join(' OR ')})`;
    
    // 添加统计范围限制
    sql += ` ORDER BY l1.id DESC LIMIT ?`;
    
    // 构建查询参数
    const params = [latestId];
    
    // 添加每个组合的匹配参数
    for (const combination of combinations) {
      const comboParts = combination.split('-');
      let likeCondition = '%';
      comboParts.forEach(part => {
        likeCondition += part.trim() + '%';
      });
      params.push(likeCondition);
    }
    
    params.push(statsRange);
    
    // 执行查询
    const results = await query(sql, params);
    
    // 分析目标球出现情况
    const analysis = results.map(record => {
      // 检查目标球在未来几期的出现情况
      let appearance = null;
      
      // 检查下一期
      const nextDrawNumbers1 = processBalls(record.next_draw_info_1);
      if (nextDrawNumbers1.includes(formattedTargetBall)) {
        appearance = 1;
      }
      // 如果下一期没出现，检查下下期
      else if (record.next_draw_info_2) {
        const nextDrawNumbers2 = processBalls(record.next_draw_info_2);
        if (nextDrawNumbers2.includes(formattedTargetBall)) {
          appearance = 2;
        }
        // 如果下下期没出现，检查下下下期
        else if (record.next_draw_info_3) {
          const nextDrawNumbers3 = processBalls(record.next_draw_info_3);
          if (nextDrawNumbers3.includes(formattedTargetBall)) {
            appearance = 3;
          }
        }
      }
      
      return {
        period: record.issue,
        appearance
      };
    });
    
    return analysis;
  } catch (error) {
    console.error('分析目标球出现情况时发生错误:', error);
    return [];
  }
}

// 健康检查接口
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: '倒数2期两球组合详情服务运行正常'
  });
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
});

// 注释掉服务器启动代码，避免单独启动服务器
/*
const PORT = 18893;
app.listen(PORT, () => {
  console.log(`倒数2期两球组合详情服务已启动，监听端口 ${PORT}`);
});
*/

// 导出app以便在主服务器中使用
module.exports = app;