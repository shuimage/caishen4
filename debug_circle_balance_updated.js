// 调试更新后的圆环平衡杀号法

// 模拟数据库中的历史数据
const mockHistoryData = [
  { issue: '26006', red: [5, 12, 18, 23, 35] },
  { issue: '26005', red: [2, 4, 16, 23, 35] },
  { issue: '26004', red: [5, 18, 23, 25, 32] },
  { issue: '26003', red: [2, 9, 11, 15, 16] },
  { issue: '26002', red: [4, 8, 15, 20, 31] }
];

// 更新后的圆环平衡杀号法
function circleBalanceKill(lastDrawNumbers) {
  const killedNumbers = [];
  
  // 四同心圆数据（数字格式）
  const circles = [
    { name: '中心圆', numbers: [18, 17, 19, 16, 20, 15, 21, 14, 22] },
    { name: '第二圆', numbers: [13, 23, 12, 24, 11, 25, 10, 26] },
    { name: '第三圆', numbers: [9, 27, 8, 28, 7, 29, 6, 30] },
    { name: '第四圆', numbers: [5, 31, 4, 32, 3, 33, 2, 34, 1, 35] }
  ];
  
  console.log('\n当前期号码:', lastDrawNumbers);
  
  // 统计每个圆环的分布数量
  const circleDistribution = circles.map(circle => {
    const distributionCount = circle.numbers.filter(num => lastDrawNumbers.includes(num)).length;
    const coverageRate = distributionCount / circle.numbers.length;
    console.log(`${circle.name}分布数量: ${distributionCount}, 覆盖率: ${coverageRate.toFixed(2)}`);
    return {
      name: circle.name,
      numbers: circle.numbers,
      distributionCount: distributionCount,
      coverageRate: coverageRate
    };
  });
  
  // 为每个号码生成一个综合评分，用于决定是否杀号
  const allNumbers = [...new Set(circles.flatMap(circle => circle.numbers))];
  
  // 生成每个号码的评分数据
  const numberScores = allNumbers.map(num => {
    // 找到号码所属的圆环
    const circle = circles.find(c => c.numbers.includes(num));
    const circleInfo = circleDistribution.find(c => c.name === circle.name);
    
    // 基础评分
    let score = 50;
    
    // 根据圆环覆盖率调整评分
    if (circleInfo.coverageRate === 0) {
      // 冷环号码，降低评分
      score -= 30;
    } else if (circleInfo.coverageRate > 0.5) {
      // 热环号码，降低评分
      score -= 20;
    } else {
      // 正常圆环，保持评分
      score += 10;
    }
    
    // 如果是中心号码18，保留
    if (num === 18) {
      score += 100;
    }
    
    // 如果是本期开奖号，保留
    if (lastDrawNumbers.includes(num)) {
      score += 50;
    }
    
    return {
      number: num,
      score: score,
      circle: circle.name,
      coverageRate: circleInfo.coverageRate
    };
  });
  
  // 按照评分排序，选择评分最低的10个号码作为杀号
  const sortedNumbers = numberScores.sort((a, b) => a.score - b.score);
  console.log('号码评分排序前10名:');
  sortedNumbers.slice(0, 10).forEach(item => {
    console.log(`  ${item.number}: 评分=${item.score}, 圆环=${item.circle}`);
  });
  
  const selectedKillNumbers = sortedNumbers.slice(0, 10).map(item => item.number);
  
  // 添加到杀号列表
  selectedKillNumbers.forEach(num => {
    if (num !== 18 && !lastDrawNumbers.includes(num)) {
      killedNumbers.push(num);
    }
  });
  
  const result = {
    killedNumbers: [...new Set(killedNumbers)],
    analysis: `共检查4个圆环，根据综合评分杀掉${killedNumbers.length}个号码`
  };
  
  console.log('推荐杀号:', result.killedNumbers);
  return result;
}

// 测试每一期
console.log('=== 调试更新后的圆环平衡杀号法 ===');
for (let i = 1; i < mockHistoryData.length; i++) {
  const currentDraw = mockHistoryData[i];
  const nextDraw = mockHistoryData[i - 1];
  
  console.log('\n====================================');
  console.log(`期号: ${currentDraw.issue} -> 下一期: ${nextDraw.issue}`);
  
  const result = circleBalanceKill(currentDraw.red);
}
