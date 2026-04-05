const express = require('express');
const router = express.Router();
const db = require('./数据库配置');

// 获取倒数 2 期后区买号回测详情
router.get('/', async (req, res) => {
    try {
        const { period, backtestPeriod, backtestMethod } = req.query;
        
        console.log('获取回测详情:', { period, backtestPeriod, backtestMethod });
        
        // 1. 获取原始回测结果 - 从深度预测数据表获取
        const originalResultsQuery = `
            SELECT 
                backtest_method,
                stats_period,
                accuracy,
                back_buy_numbers
            FROM backtest_results_hou
            WHERE backtest_period = ? 
            AND backtest_method LIKE '%rank%'
            ORDER BY accuracy DESC
        `;
        
        const originalResults = await db.query(originalResultsQuery, [period]);
        
        console.log('查询到的原始结果数量:', originalResults.length);
        
        if (!originalResults || originalResults.length === 0) {
            // 如果没有数据，返回空结果
            return res.json({
                success: true,
                data: {
                    originalResults: [],
                    numberCounts: {},
                    accuracyCalculation: [],
                    finalRank: []
                },
                message: '未找到回测数据，请先执行回测'
            });
        }
        
        // 2. 处理原始数据
        const originalResultsProcessed = originalResults.map(row => ({
            backtestMethod: row.backtest_method,
            statsPeriod: row.stats_period,
            accuracy: parseFloat(row.accuracy),
            backBuyNumbers: row.back_buy_numbers ? JSON.parse(row.back_buy_numbers) : []
        }));
        
        // 3. 统计每个号码的出现次数和涉及的回测方法
        const numberCounts = {};
        for (let num = 1; num <= 12; num++) {
            numberCounts[num] = { count: 0, methods: [] };
        }
        
        originalResultsProcessed.forEach(result => {
            result.backBuyNumbers.forEach(num => {
                if (numberCounts[num]) {
                    numberCounts[num].count++;
                    if (!numberCounts[num].methods.includes(result.backtestMethod)) {
                        numberCounts[num].methods.push(result.backtestMethod);
                    }
                }
            });
        });
        
        // 4. 计算每个号码的累计正确率
        const numberAccuracyMap = new Map();
        
        originalResultsProcessed.forEach(result => {
            const { accuracy, backtestMethod, backBuyNumbers } = result;
            
            backBuyNumbers.forEach(num => {
                const numStr = num.toString();
                
                if (numberAccuracyMap.has(numStr)) {
                    const existingData = numberAccuracyMap.get(numStr);
                    if (existingData.backtestMethod === backtestMethod) {
                        // 回测方法相同，只保留平均正确率大的
                        if (accuracy > existingData.accuracy) {
                            numberAccuracyMap.set(numStr, { accuracy, backtestMethod, number: num });
                        }
                    } else {
                        // 回测方法不同，累加平均正确率
                        const newAccuracy = existingData.accuracy + accuracy;
                        numberAccuracyMap.set(numStr, { accuracy: newAccuracy, backtestMethod: 'combined', number: num });
                    }
                } else {
                    // 第一次出现，直接添加
                    numberAccuracyMap.set(numStr, { accuracy, backtestMethod, number: num });
                }
            });
        });
        
        // 5. 转换为数组并排序
        const sortedNumbers = Array.from(numberAccuracyMap.values())
            .sort((a, b) => b.accuracy - a.accuracy);
        
        // 6. 生成正确率计算详情
        const accuracyCalculation = sortedNumbers.map((item, index) => {
            // 查找原始数据中这个号码涉及的所有回测方法
            const relatedResults = originalResultsProcessed.filter(r => 
                r.backBuyNumbers.includes(item.number)
            );
            
            return {
                number: item.number,
                method1: relatedResults[0]?.backtestMethod || '-',
                accuracy1: relatedResults[0]?.accuracy || 0,
                method2: relatedResults[1]?.backtestMethod || '-',
                accuracy2: relatedResults[1]?.accuracy || 0,
                totalAccuracy: relatedResults.length > 1 ? 
                    (relatedResults[0]?.accuracy || 0) + (relatedResults[1]?.accuracy || 0) : 
                    (relatedResults[0]?.accuracy || 0),
                finalAccuracy: item.accuracy
            };
        });
        
        // 7. 生成最终排序
        const finalRank = sortedNumbers.map(item => ({
            number: item.number,
            accuracy: item.accuracy
        }));
        
        // 8. 返回完整数据
        res.json({
            success: true,
            data: {
                originalResults: originalResultsProcessed,
                numberCounts: numberCounts,
                accuracyCalculation: accuracyCalculation,
                finalRank: finalRank
            }
        });
        
    } catch (error) {
        console.error('获取回测详情失败:', error);
        res.status(500).json({
            success: false,
            message: '获取回测详情失败：' + error.message
        });
    }
});

module.exports = router;
