// 调试圆环平衡杀号法

// 模拟数据库中的历史数据
const mockHistoryData = [
  { issue: '26006', red: [5, 12, 18, 23, 35] },
  { issue: '26005', red: [2, 4, 16, 23, 35] },
  { issue: '26004', red: [5, 18, 23, 25, 32] },
  { issue: '26003', red: [2, 9, 11, 15, 16] },
  { issue: '26002', red: [4, 8, 15, 20, 31] }
];

// 圆环平衡杀号法（与后端相同的实现）
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
    console.log(`${circle.name}分布数量: ${distributionCount}`);
    return {
      name: circle.name,
      numbers: circle.numbers,
      distributionCount: distributionCount
    };
  });
  
  // 杀掉分布数量为0的冷环号码
  const coldCircles = circleDistribution.filter(circle => circle.distributionCount === 0);
  console.log('冷环:', coldCircles.map(c => c.name));
  coldCircles.forEach(circle => {
    circle.numbers.forEach(num => {
      if (num !== 18) { // 保留中心号码18
        killedNumbers.push(num);
      }
    });
  });
  
  // 杀掉分布数量>3的热环非核心号码
  const hotCircles = circleDistribution.filter(circle => circle.distributionCount > 3);
  console.log('热环:', hotCircles.map(c => c.name));
  hotCircles.forEach(circle => {
    circle.numbers.forEach(num => {
      if (num !== 18 && !lastDrawNumbers.includes(num)) { // 保留中心号码18和开奖号
        killedNumbers.push(num);
      }
    });
  });
  
  const result = {
    killedNumbers: [...new Set(killedNumbers)].sort((a, b) => a - b),
    analysis: `共检查4个圆环，发现${coldCircles.length}个冷环，${hotCircles.length}个热环，杀掉${killedNumbers.length}个号码`
  };
  
  console.log('推荐杀号:', result.killedNumbers);
  return result;
}

// 测试每一期
console.log('=== 调试圆环平衡杀号法 ===');
for (let i = 1; i < mockHistoryData.length; i++) {
  const currentDraw = mockHistoryData[i];
  const nextDraw = mockHistoryData[i - 1];
  
  console.log('\n====================================');
  console.log(`期号: ${currentDraw.issue} -> 下一期: ${nextDraw.issue}`);
  
  const result = circleBalanceKill(currentDraw.red);
}
