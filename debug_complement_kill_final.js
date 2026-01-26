// 调试最终版互补对杀号法

// 模拟数据库中的历史数据
const mockHistoryData = [
  { issue: '26006', red: [5, 12, 18, 23, 35] },
  { issue: '26005', red: [2, 4, 16, 23, 35] },
  { issue: '26004', red: [5, 18, 23, 25, 32] },
  { issue: '26003', red: [2, 9, 11, 15, 16] },
  { issue: '26002', red: [4, 8, 15, 20, 31] }
];

// 互补对杀号法（最终版实现）
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
    
    // 计算互补对号码与当前期号码的距离
    const distance1 = Math.min(...lastDrawNumbers.map(num => Math.abs(num1 - num)));
    const distance2 = Math.min(...lastDrawNumbers.map(num => Math.abs(num2 - num)));
    const avgDistance = (distance1 + distance2) / 2;
    
    return {
      ...complement,
      isCurrent: isCurrent,
      hasNum1: hasNum1,
      hasNum2: hasNum2,
      heatScore: heatScore,
      balanceScore: balanceScore,
      avgDistance: avgDistance
    };
  });
  
  // 显示互补对统计信息
  console.log('互补对统计信息（前5个）:');
  complementStats.slice(0, 5).forEach(stat => {
    console.log(`  ${stat.key}: 当前期出现=${stat.isCurrent}, 热度=${stat.heatScore}, 平衡性=${stat.balanceScore}, 平均距离=${stat.avgDistance}`);
  });
  
  // 1. 杀掉当前期出现的互补对
  const currentKillComplements = complementStats.filter(stat => stat.isCurrent);
  console.log('杀掉当前期出现的互补对:', currentKillComplements.map(stat => stat.key));
  currentKillComplements.forEach(stat => {
    killedNumbers.push(...stat.pair);
  });
  
  // 2. 杀掉平衡性差的互补对（只出现一个号码）
  const unbalancedComplements = complementStats.filter(stat => stat.balanceScore === 1);
  console.log('平衡性差的互补对数量:', unbalancedComplements.length);
  
  // 3. 杀掉极冷互补对（都没出现）
  const coldComplements = complementStats.filter(stat => 
    !stat.hasNum1 && !stat.hasNum2
  );
  console.log('极冷互补对数量:', coldComplements.length);
  
  // 4. 杀掉距离较远的互补对
  const farComplements = complementStats.filter(stat => stat.avgDistance > 15);
  console.log('距离较远的互补对数量:', farComplements.length);
  
  // 合并所有候选杀号互补对
  const allCandidateComplements = [...unbalancedComplements, ...coldComplements, ...farComplements];
  
  // 去重
  const uniqueCandidates = allCandidateComplements.filter((complement, index, self) => 
    index === self.findIndex((c) => c.key === complement.key)
  );
  console.log('去重后候选互补对数量:', uniqueCandidates.length);
  
  // 随机选择互补对杀掉，确保杀号数量足够
  const shuffle = (array) => array.sort(() => Math.random() - 0.5);
  const shuffledCandidates = shuffle(uniqueCandidates);
  
  // 计算需要的杀号数量
  const targetKillCount = Math.floor(Math.random() * 3) + 6; // 6-8个杀号
  console.log(`目标杀号数量: ${targetKillCount}`);
  
  // 添加杀号，直到达到目标数量
  for (const complement of shuffledCandidates) {
    if (killedNumbers.length >= targetKillCount * 2) break; // 每个互补对贡献2个号码
    killedNumbers.push(...complement.pair);
  }
  
  console.log('添加杀号后:', killedNumbers);
  
  // 去重并过滤掉当前期开奖号
  const finalKillNumbers = [...new Set(killedNumbers)]
    .filter(num => !lastDrawNumbers.includes(num));
  console.log('去重过滤后:', finalKillNumbers);
  
  // 确保杀号数量在6-8个之间
  let resultKillNumbers = finalKillNumbers;
  if (resultKillNumbers.length < 6) {
    // 如果数量不足，从所有号码中随机添加一些
    console.log(`杀号数量不足，需要添加 ${6 - resultKillNumbers.length} 个号码`);
    const allNumbers = Array.from({ length: 35 }, (_, i) => i + 1);
    const availableNumbers = allNumbers.filter(num => 
      !resultKillNumbers.includes(num) && !lastDrawNumbers.includes(num)
    );
    const neededCount = 6 - resultKillNumbers.length;
    const additionalNumbers = shuffle(availableNumbers).slice(0, neededCount);
    resultKillNumbers = [...resultKillNumbers, ...additionalNumbers];
  } else if (resultKillNumbers.length > 8) {
    // 如果数量过多，随机保留8个
    console.log(`杀号数量过多，需要保留8个`);
    resultKillNumbers = shuffle(resultKillNumbers).slice(0, 8);
  }
  
  const result = {
    killedNumbers: resultKillNumbers,
    analysis: `共检查${allComplements.length}个互补对，杀掉${resultKillNumbers.length}个号码`
  };
  
  console.log('最终推荐杀号:', result.killedNumbers);
  return result;
}

// 测试每一期
console.log('=== 调试最终版互补对杀号法 ===');
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
