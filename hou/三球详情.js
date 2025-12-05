/**
 * 三球组合详情接口
 * @route GET /san_qiu_xiang_qing
 * @description 获取指定三球组合的详细信息，包括历史出现次数和概率等统计数据
 */

const express = require('express');
const { query } = require('./数据库配置.js');

const router = express.Router();

/**
 * 获取三球组合详情
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
router.get('/san_qiu_xiang_qing', async (req, res) => {
    try {
        console.log('====================================');
        console.log(`[${new Date().toISOString()}] GET /san_qiu_xiang_qing`);
        console.log('====================================');
        console.log('新请求到达！');
        console.log(`查询参数:`, req.query);

        const { combination, period = 500 } = req.query;

        // 参数验证
        if (!combination) {
            return res.status(400).json({
                success: false,
                message: '缺少必要参数 combination'
            });
        }

        // 解析组合参数，确保格式正确
        const balls = combination.split('-').map(num => parseInt(num)).sort((a, b) => a - b);
        if (balls.length !== 3 || balls.some(num => isNaN(num) || num < 1 || num > 35)) {
            return res.status(400).json({
                success: false,
                message: '组合参数格式错误，应为三个1-35之间的数字，用-连接'
            });
        }

        // 查询历史数据
        console.log(`准备查询历史数据，period: ${period}`);
        const limit = parseInt(period) || 500;
        const historySql = `SELECT * FROM lottery_results ORDER BY issue DESC LIMIT ?`;
        
        let historyData;
        try {
            historyData = await query(historySql, [limit]);
            console.log(`历史数据查询完成，共获取 ${historyData.length} 条记录`);
        } catch (error) {
            console.error('查询历史数据失败:', error);
            return res.status(500).json({
                success: false,
                message: '数据库查询失败'
            });
        }

        // 统计组合出现次数
        let count = 0;
        const occurrenceDetails = [];

        historyData.forEach(record => {
            try {
                // 解析前区号码 - 支持不同的数据格式
                let frontNumbers = [];
                if (Array.isArray(record.red)) {
                    frontNumbers = record.red.map(num => parseInt(num));
                } else if (typeof record.red === 'string') {
                    // 尝试多种分隔符格式
                    const numbers = record.red.match(/\d+/g);
                    if (numbers) {
                        frontNumbers = numbers.map(num => parseInt(num));
                    }
                } else if (record.front_numbers) {
                    // 兼容旧的数据格式
                    frontNumbers = record.front_numbers.split(',').map(num => parseInt(num));
                }
                
                // 检查组合是否存在
                const hasCombination = balls.every(ball => frontNumbers.includes(ball));
                
                if (hasCombination) {
                    count++;
                    
                    // 解析后区号码
                    let backNumbers = [];
                    if (Array.isArray(record.blue)) {
                        backNumbers = record.blue.map(num => parseInt(num));
                    } else if (typeof record.blue === 'string') {
                        const numbers = record.blue.match(/\d+/g);
                        if (numbers) {
                            backNumbers = numbers.map(num => parseInt(num));
                        }
                    } else if (record.back_numbers) {
                        backNumbers = record.back_numbers.split(',').map(num => parseInt(num));
                    }
                    
                    occurrenceDetails.push({
                        period: record.issue,
                        drawDate: record.draw_date || record.date,
                        frontNumbers: frontNumbers,
                        backNumbers: backNumbers
                    });
                }
            } catch (e) {
                console.error(`处理记录时出错，期号: ${record.issue}`, e);
                // 跳过错误记录，继续处理
            }
        });

        // 计算概率
        const probability = limit > 0 ? ((count / limit) * 100).toFixed(2) + '%' : '0%';

        // 准备结果
        const result = {
            combination: combination,
            count: count,
            probability: probability,
            period: limit,
            occurrenceDetails: occurrenceDetails
        };

        console.log(`组合 ${combination} 统计完成: 出现 ${count} 次，概率 ${probability}`);
        console.log(`准备返回结果...`);

        // 返回结果
        res.status(200).json({
            success: true,
            data: result
        });

        console.log(`结果返回成功`);
    } catch (error) {
        console.error('获取三球组合详情失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

module.exports = router;