// 调试互补对杀号法

// 模拟数据库中的历史数据
const mockHistoryData = [
  { issue: '26006', red: [5, 12, 18, 23, 35] },
  { issue: '26005', red: [2, 4, 16, 23, 35] },
  { issue: '26004', red: [5, 18, 23, 25, 32] },
  { issue: '26003', red: [2, 9, 11, 15, 16] },
  { issue: '26002', red: [4, 8, 15, 20, 31] }
];

// 互补对杀号法（更新后的实现）
function complementPairKill(lastDrawNumbers) {
  const killedNumbers = [];
  
  // 生成所有互补对
  const allComplements = [];
  for (let i = 1; i <= 17; i++) {
    allComplements.push({ pair: [i, 36 - i], key: `${i}-${36 - i}` });
  }
  
  console.log('\n当前期号码:', lastDrawNumbers);
  
  // 计算当前期出现的互补对
  const currentComplements = [];
  for (let i = 0; i < lastDrawNumbers.length; i++) {
    for (let j = i + 1; j < lastDrawNumbers.length; j++) {
      const num1 = lastDrawNumbers[i];
      const num2 = lastDrawNumbers[j];
      if (num1 + num2 === 36) {
        // 找到互补对
        const complementKey = `${Math.min(num1, num2)}-${Math.max(num1, num2)}`;
        currentComplements.push(complementKey);
      }
    }
  }
  
  console.log('当前期出现的互补对:', currentComplements);
  
  // 统计互补对的出现情况
  const complementStats = allComplements.map(complement => {
    const [num1, num2] = complement.pair;
    
    // 检查当前期是否出现
    const isCurrent = lastDrawNumbers.includes(num1) && lastDrawNumbers.includes(num2);
    
    // 检查互补对中的号码是否在当前期出现
    const hasNum1 = lastDrawNumbers.includes(num1);
    const hasNum2 = lastDrawNumbers.includes(num2);
    
    // 计算互补对的热冷程度
    let heatScore = 0;
    if (isCurrent) {
      // 当前期出现的互补对，热度+10
      heatScore += 10;
    } else if (hasNum1 || hasNum2) {
      // 只出现一个号码，热度+5
      heatScore += 5;
    } else {
      // 都没出现，热度-5
      heatScore -= 5;
    }
    
    // 计算互补对的平衡性评分
    const balanceScore = Math.abs((hasNum1 ? 1 : 0) - (hasNum2 ? 1 : 0));
    
    return {
      ...complement,
      isCurrent: isCurrent,
      hasNum1: hasNum1,
      hasNum2: hasNum2,
      heatScore: heatScore,
      balanceScore: balanceScore
    };
  });
  
  // 显示互补对统计信息
  console.log('互补对统计信息（前5个）:');
  complementStats.slice(0, 5).forEach(stat => {
    console.log(`  ${stat.key}: 当前期出现=${stat.isCurrent}, 热度=${stat.heatScore}, 平衡性=${stat.balanceScore}`);
  });
  
  // 根据评分决定杀号
  // 1. 杀掉当前期出现的互补对
  const currentKillComplements = complementStats.filter(stat => stat.isCurrent);
  console.log('杀掉当前期出现的互补对:', currentKillComplements.map(stat => stat.key));
  currentKillComplements.forEach(stat => {
    killedNumbers.push(...stat.pair);
  });
  
  // 2. 杀掉平衡性差且热度低的互补对
  const unbalancedComplements = complementStats.filter(stat => 
    stat.balanceScore === 1 && stat.heatScore < 5
  );
  
  // 随机选择2-3个不平衡互补对杀掉
  const shuffle = (array) => array.sort(() => Math.random() - 0.5);
  const selectedUnbalanced = shuffle(unbalancedComplements).slice(0, Math.floor(Math.random() * 2) + 2);
  console.log('杀掉不平衡互补对:', selectedUnbalanced.map(stat => stat.key));
  selectedUnbalanced.forEach(stat => {
    killedNumbers.push(...stat.pair);
  });
  
  // 3. 杀掉完全没出现的极冷互补对
  const coldComplements = complementStats.filter(stat => 
    !stat.hasNum1 && !stat.hasNum2
  );
  
  // 随机选择1-2个极冷互补对杀掉
  const selectedCold = shuffle(coldComplements).slice(0, Math.floor(Math.random() * 2) + 1);
  console.log('杀掉极冷互补对:', selectedCold.map(stat => stat.key));
  selectedCold.forEach(stat => {
    killedNumbers.push(...stat.pair);
  });
  
  // 去重并过滤掉当前期开奖号
  const finalKillNumbers = [...new Set(killedNumbers)]
    .filter(num => !lastDrawNumbers.includes(num));
  
  // 限制杀号数量在6-8个之间
  const killCount = Math.min(Math.max(finalKillNumbers.length, 6), 8);
  console.log(`限制杀号数量: ${killCount}`);
  const resultKillNumbers = finalKillNumbers.slice(0, killCount);
  
  const result = {
    killedNumbers: resultKillNumbers,
    analysis: `共检查${allComplements.length}个互补对，杀掉${resultKillNumbers.length}个号码`
  };
  
  console.log('推荐杀号:', result.killedNumbers);
  return result;
}

// 测试每一期
console.log('=== 调试互补对杀号法 ===');
for (let i = 1; i < mockHistoryData.length; i++) {
  const currentDraw = mockHistoryData[i];
  const nextDraw = mockHistoryData[i - 1];
  
  console.log('\n====================================');
  console.log(`期号: ${currentDraw.issue} -> 下一期: ${nextDraw.issue}`);
  
  const result = complementPairKill(currentDraw.red);
}

// 多次测试同一期，看看结果是否不同
console.log('\n\n=== 测试同一期多次，检查结果是否变化 ===');
console.log('期号: 26005 -> 下一期: 26006');
for (let i = 0; i < 3; i++) {
  console.log(`\n测试第${i+1}次:`);
  const result = complementPairKill(mockHistoryData[1].red);
}
