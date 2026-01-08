const express = require('express');
const { query } = require('./数据库配置.js');

const router = express.Router();

function processBalls(balls) {
  if (!balls) return [];
  if (typeof balls === 'string') {
    const numbers = balls.match(/\d+/g);
    if (numbers) {
      return numbers.map(num => parseInt(num));
    }
  } else if (Array.isArray(balls)) {
    return balls.map(num => typeof num === 'string' ? parseInt(num) : num);
  }
  return [];
}

function checkBallInDraw(drawNumbers, ball) {
  return drawNumbers.includes(ball);
}

router.post('/', async (req, res) => {
  try {
    const { latest_period, combination, stats_range = 100, type = 'first', target_ball } = req.body;

    console.log('收到近两期两球组合详情请求:', {
      latest_period,
      combination,
      stats_range,
      type,
      target_ball
    });

    if (!latest_period || !combination) {
      return res.json({
        success: false,
        message: '缺少必要参数：latest_period 或 combination'
      });
    }

    const comboParts = combination.split('-').map(num => parseInt(num));
    if (comboParts.length < 2) {
      return res.json({
        success: false,
        message: '组合格式错误，应为 A-B 格式'
      });
    }

    const ball1 = comboParts[0];
    const ball2 = comboParts[1];

    let historySql = `
      SELECT id, issue, red, blue, draw_date
      FROM lottery_results
      ORDER BY issue DESC
    `;

    if (stats_range !== 'all') {
      const limit = parseInt(stats_range, 10);
      if (!isNaN(limit) && limit > 0) {
        historySql += ` LIMIT ${limit + 5}`;
      }
    }

    const historyResults = await query(historySql);
    console.log('获取历史数据条数:', historyResults.length);

    const processedHistory = historyResults.map(result => ({
      ...result,
      red: processBalls(result.red),
      blue: processBalls(result.blue)
    }));

    const occurrenceRecords = [];

    for (let i = 0; i < processedHistory.length - 2; i++) {
      const currentDraw = processedHistory[i];
      const nextDraw = processedHistory[i + 1];
      const nextNextDraw = processedHistory[i + 2];

      const isFrontZone = type === 'first' || type === 'front';
      const currentBalls = isFrontZone ? currentDraw.red : currentDraw.blue;
      const nextBalls = isFrontZone ? nextDraw.red : nextDraw.blue;
      const nextNextBalls = isFrontZone ? nextNextDraw.red : nextNextDraw.blue;

      if (checkBallInDraw(nextBalls, ball1) && checkBallInDraw(currentBalls, ball2)) {
        const record = {
          prev_period: nextDraw.issue,
          prev_draw_balls: nextBalls,
          current_period: currentDraw.issue,
          current_draw_balls: currentBalls,
          next_period: nextNextDraw.issue,
          next_draw_balls: nextNextBalls
        };

        if (target_ball !== null && target_ball !== undefined) {
          const targetInt = parseInt(target_ball);
          if (checkBallInDraw(nextNextBalls, targetInt)) {
            occurrenceRecords.push(record);
          }
        } else {
          occurrenceRecords.push(record);
        }
      }
    }

    console.log(`组合 ${combination} 找到 ${occurrenceRecords.length} 条记录`);

    res.json({
      success: true,
      data: occurrenceRecords,
      meta: {
        combination: combination,
        stats_range: stats_range,
        total_count: occurrenceRecords.length,
        type: type,
        target_ball: target_ball
      }
    });
  } catch (error) {
    console.error('处理请求时发生错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: '近两期两球组合详情服务运行正常'
  });
});

router.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
});

module.exports = router;
