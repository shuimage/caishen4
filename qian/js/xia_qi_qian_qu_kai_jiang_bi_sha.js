// 主题切换功能 - 仅从localStorage读取设置，不在此页面提供切换按钮
document.addEventListener('DOMContentLoaded', function() {
  // 从localStorage读取主题设置
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark-theme');
  }
  
  // 调用主函数初始化页面数据
  main();
});

// 获取全部期数
async function getTotalPeriods() {
  try {
    const response = await fetch('http://localhost:18889/huo_qu_lottery_results_total');
    const result = await response.json();
    return result.success ? result.total : 1000;
  } catch (error) {
    console.error('获取全部期数失败:', error);
    return 1000; // 默认值
  }
}

// 从后端获取前区回测数据
// 从后端获取最新1期两球回测数据
async function huo_qu_zui_xin_1_qi_liang_qiu_mai_hao_hui_ce(backtestPeriod = '50', statsPeriod = '100', backtestMethod = 'most') {
  try {
    const response = await fetch(`http://localhost:18889/huo_qu_sha_hao_mai_hao_hui_ce?backtest_period=${backtestPeriod}&stats_period=${statsPeriod}&backtest_method=${backtestMethod}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      alert('接口失败');
      return null;
    }
  } catch (error) {
    console.error('接口失败:', error);
    alert('接口失败');
    return null;
  }
}

// 测试单个统计期值的平均正确率（前区）
async function testStatsPeriod(backtestPeriod, statsPeriod, backtestMethod) {
  try {
    const backtestData = await huo_qu_zui_xin_1_qi_liang_qiu_mai_hao_hui_ce(backtestPeriod, statsPeriod, backtestMethod);
    if (!backtestData || !backtestData.backtestResults || backtestData.backtestResults.length === 0) {
      return { statsPeriod, accuracy: 100 };
    }
    
    let successBuyCount = 0;
    backtestData.backtestResults.forEach(result => {
      if (result.frontCorrectBuy > 0) {
        successBuyCount++;
      }
    });
    
    const totalPeriods = backtestData.backtestResults.length;
    const averageCorrectRate = totalPeriods > 0 ? 
      ((successBuyCount / totalPeriods) * 100) : 100;
    
    return { statsPeriod, accuracy: averageCorrectRate };
  } catch (error) {
    console.error(`测试统计期${statsPeriod} 失败:`, error);
    return { statsPeriod, accuracy: 100 };
  }
}

// 获取最新一期的期号
async function getLatestPeriod() {
  try {
    // 调用letou数据库中最新一期的期号API
    const response = await fetch('http://localhost:18889/sql_zui_xin_yi_qi');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (result.success) {
      // 获取最新一期期号，去掉"期"
      const latestPeriod = result.latestDraw.period.replace('期', '');
      return (parseInt(latestPeriod) + 1) + '期';
    } else {
      // 备选方案：从页面中获取当前期号
      const currentPeriod = document.querySelector('.current-period').textContent;
      const currentPeriodNum = parseInt(currentPeriod);
      return (currentPeriodNum + 1) + '期';
    }
  } catch (error) {
    console.error('获取最新期号失败', error);
    // 备选方案：从页面中获取当前期号
    const currentPeriod = document.querySelector('.current-period').textContent;
    const currentPeriodNum = parseInt(currentPeriod);
    return (currentPeriodNum + 1) + '期';
  }
}

// 获取近五期开奖信息
async function huo_qu_jin_wu_qi_kai_jiang() {
  try {
    // 调用获取近五期开奖信息的接口
    const response = await fetch('http://localhost:18889/huo_qu_jin_wu_qi_kai_jiang');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      alert('接口失败');
      return null;
    }
  } catch (error) {
    console.error('获取近五期开奖信息失败', error);
    alert('接口失败');
    return null;
  }
}

// 复制到剪贴板的功能
async function copyToClipboard(numbers) {
  try {
    const tabSeparatedNumbers = numbers.join('\t');
    await navigator.clipboard.writeText(tabSeparatedNumbers);
    alert('复制成功，可直接粘贴到Excel');
  } catch (err) {
    console.error('复制失败:', err);
    alert('复制失败，请重试');
  }
}

// 从接口获取开奖信息的通用函数
async function huo_qu_kai_jiang_info(apiUrl, drawKey) {
  try {
    const response = await fetch(apiUrl);
    const result = await response.json();
    
    if (result.success && result[drawKey]) {
      const drawInfo = result[drawKey];
      return {
        issue: drawInfo.period,
        drawDate: drawInfo.drawDate,
        frontNumbers: drawInfo.firstZoneNumbers,
        backNumbers: drawInfo.lastZoneNumbers
      };
    } else {
      console.error('获取开奖信息失败', result.message || '数据格式不正确');
      return null;
    }
  } catch (error) {
    console.error('获取开奖信息失败', error);
    return null;
  }
}

// 从接口获取最新开奖信息
async function huo_qu_zui_xin_kai_jiang() {
  return await huo_qu_kai_jiang_info('http://localhost:18889/sql_zui_xin_yi_qi', 'latestDraw');
}

// 从接口获取倒数2期开奖信息
async function huo_qu_dao_shu_2_qi() {
  return await huo_qu_kai_jiang_info('http://localhost:18889/sql_dao_shu_2_qi', 'secondLastDraw');
}

// 从接口获取倒数3期开奖信息
async function huo_qu_dao_shu_3_qi() {
  return await huo_qu_kai_jiang_info('http://localhost:18889/sql_dao_shu_3_qi', 'thirdLastDraw');
}

// 从接口获取倒数4期开奖信息
async function huo_qu_dao_shu_4_qi() {
  return await huo_qu_kai_jiang_info('http://localhost:18889/sql_dao_shu_4_qi', 'fourthLastDraw');
}

// 从接口获取倒数5期开奖信息
async function huo_qu_dao_shu_5_qi() {
  return await huo_qu_kai_jiang_info('http://localhost:18889/sql_dao_shu_5_qi', 'fifthLastDraw');
}

// 渲染开奖信息的通用函数
function renderDrawInfo(containerId, drawInfo, isLatest = false) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`找不到ID为${containerId}的容器元素`);
    return;
  }
  
  if (!drawInfo) {
    container.innerHTML = '<div style="color: #ff0000; text-align: center; padding: 20px;">获取开奖信息失败</div>';
    return;
  }
  
  // 如果是最新开奖信息，更新顶部快捷栏的期数显示
  if (isLatest) {
    const currentPeriodElement = document.querySelector('.current-period');
    if (currentPeriodElement) {
      currentPeriodElement.textContent = drawInfo.issue;
    }
  }
  
  // 处理日期格式，只显示年月日
  let formattedDate = drawInfo.drawDate;
  if (formattedDate && typeof formattedDate === 'string') {
    // 处理ISO格式日期（如：2025-10-28T16:00:00.000Z）
    if (formattedDate.includes('T')) {
      formattedDate = formattedDate.split('T')[0];
    }
    // 处理包含空格的日期（如：2025-10-28 16:00:00）
    else if (formattedDate.includes(' ')) {
      formattedDate = formattedDate.split(' ')[0];
    }
  }
  
  container.innerHTML = `
    <div style="font-weight: bold; color: #DF2220; font-size: 16px;">
      期号: ${drawInfo.issue}
    </div>
    <div>
      日期: ${formattedDate}
    </div>
    <div>
      前区: ${drawInfo.frontNumbers.map(num => `<span class="red-ball">${num}</span>`).join(' ')}
    </div>
    <div>
      后区: ${drawInfo.backNumbers.map(num => `<span class="blue-ball">${num}</span>`).join(' ')}
    </div>
  `;
}

// 渲染最新开奖信息（调用通用渲染函数）
function renderLatestDrawInfo(drawInfo) {
  renderDrawInfo('latestDrawInfo', drawInfo, true);
}

// 主函数：执行必要的功能
async function main() {
  try {
    // 获取最新开奖信息
    const latestDraw = await huo_qu_zui_xin_kai_jiang();
    if (latestDraw) {
      renderLatestDrawInfo(latestDraw);
    }
    
    // 获取倒数2期开奖信息
    const secondLastDraw = await huo_qu_dao_shu_2_qi();
    renderDrawInfo('secondLastDrawInfo', secondLastDraw);
    
    // 获取倒数3期开奖信息
    const thirdLastDraw = await huo_qu_dao_shu_3_qi();
    renderDrawInfo('thirdLastDrawInfo', thirdLastDraw);
    
    // 获取倒数4期开奖信息
    const fourthLastDraw = await huo_qu_dao_shu_4_qi();
    renderDrawInfo('fourthLastDrawInfo', fourthLastDraw);
    
    // 获取倒数5期开奖信息
    const fifthLastDraw = await huo_qu_dao_shu_5_qi();
    renderDrawInfo('fifthLastDrawInfo', fifthLastDraw);
  } catch (error) {
    console.error('初始化页面数据失败:', error);
  }
}

// 渲染详情数据
async function renderDetailData(allResults, nextPeriod) {
  const detailResults = document.getElementById('detailResults');
  
  try {
    // 清空当前内容
    detailResults.innerHTML = '';
    
    // 如果没有结果，显示提示
    if (allResults.length === 0) {
      detailResults.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #666;">未找到平均率最低的统计期</td></tr>';
      return;
    }
    
    // 遍历所有结果
    for (const result of allResults) {
      const { statsPeriod, accuracy, backtestMethod, frontBuyNumbers } = result;
      
      // 平均正确率已经在搜索阶段计算好
      const averageCorrectRate = accuracy.toFixed(3);
      
      // 获取回测方法中文名称
      let backtestMethodText = '出现最多';
      if (backtestMethod === 'least') {
        backtestMethodText = '出现最少';
      } else if (backtestMethod === 'average') {
        backtestMethodText = '出现平均';
      }
      
      // 格式化前区推荐买号
      const frontBuyNumbersStr = frontBuyNumbers.map(num => `<span class="red-ball">${num}</span>`).join(' ');
      
      // 创建表格行
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${backtestMethodText}</td>
        <td>50期</td>
        <td>${statsPeriod}期</td>
        <td>${averageCorrectRate}%</td>
        <td>${nextPeriod}</td>
        <td>${frontBuyNumbersStr}</td>
        <td>
          <button class="btn copy-btn" style="background-color: #4CAF50; color: white; padding: 5px 10px; font-size: 12px;">复制</button>
        </td>
      `;
      
      // 添加复制按钮事件
      const copyBtn = tr.querySelector('.copy-btn');
      copyBtn.addEventListener('click', () => copyToClipboard(frontBuyNumbers));
      
      detailResults.appendChild(tr);
    }
  } catch (error) {
    console.error('渲染详情数据失败:', error);
    detailResults.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #ff0000;">加载失败，请重试</td></tr>';
  }
}

// 获取最后一期期号（最新1期两球专用）
async function getLastPeriod1() {
  try {
    // 调用letou数据库中最新一期的期号API
    const response = await fetch('http://localhost:18889/sql_zui_xin_yi_qi');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (result.success) {
      // 获取最新一期期号，去掉"期"
      const lastPeriod = result.latestDraw.period.replace('期', '');
      return lastPeriod;
    } else {
      alert('接口失败');
      // 备选方案：从页面中获取当前期号
      const currentPeriod = document.querySelector('.current-period').textContent;
      return currentPeriod.replace('期', '');
    }
  } catch (error) {
    console.error('获取最后一期期号失败', error);
    // 备选方案：从页面中获取当前期号
    const currentPeriod = document.querySelector('.current-period').textContent;
    return currentPeriod.replace('期', '');
  }
}

// 获取最新1期两球前区推荐买号
async function huo_qu_zui_xin_yi_qi_qian_qu_tui_jian_mai_hao(statsPeriod, backtestMethod) {
  try {
    // 使用现有的回测结果计算推荐买号，而不是调用不存在的API
    const backtestData = await huo_qu_zui_xin_1_qi_liang_qiu_mai_hao_hui_ce('50', statsPeriod, backtestMethod);
    if (!backtestData || !backtestData.backtestResults || backtestData.backtestResults.length === 0) {
      return [];
    }
    
    // 初始化汇总计数数组
    const totalCounts = new Array(36).fill(0); // 索引0不使用，1-35对应前区号码
    
    // 遍历回测结果，统计每个号码的出现次数
    backtestData.backtestResults.forEach(result => {
      if (result.frontBuyNumbers && result.frontBuyNumbers.length > 0) {
        result.frontBuyNumbers.forEach(num => {
          totalCounts[num]++;
        });
      }
    });
    
    let frontBuyNumbers = [];
    
    // 根据回测方法计算对应的前区推荐买号
    if (backtestMethod === 'most') {
      // 1. 出现最多球：找到totalCounts中的最大值对应的号码
      const maxFirstCount = Math.max(...totalCounts);
      if (maxFirstCount > 0) {
        // 找出所有最大值对应的号码
        for (let i = 1; i <= 35; i++) {
          if (totalCounts[i] === maxFirstCount) {
            frontBuyNumbers.push(i);
          }
        }
      }
    } else if (backtestMethod === 'least') {
      // 2. 出现最少球：找到totalCounts中除0以外的最小值对应的号码
      const nonZeroCounts = totalCounts.filter(count => count > 0);
      if (nonZeroCounts.length > 0) {
        const minFirstCount = Math.min(...nonZeroCounts);
        // 找出所有最小值对应的号码
        for (let i = 1; i <= 35; i++) {
          if (totalCounts[i] === minFirstCount) {
            frontBuyNumbers.push(i);
          }
        }
      }
    } else if (backtestMethod === 'average') {
      // 3. 出现平均球：找到totalCounts中次数等于平均值的号码
      const nonZeroTotalCounts = totalCounts.filter(count => count > 0);
      if (nonZeroTotalCounts.length > 0) {
        const sumCounts = nonZeroTotalCounts.reduce((sum, count) => sum + count, 0);
        const averageCount = Math.round(sumCounts / nonZeroTotalCounts.length);
        // 找出所有等于平均值的号码
        for (let i = 1; i <= 35; i++) {
          if (totalCounts[i] === averageCount) {
            frontBuyNumbers.push(i);
          }
        }
      }
    }
    
    return frontBuyNumbers;
  } catch (error) {
    console.error('获取前区推荐买号失败:', error);
    return [];
  }
}

// 执行最新1期两球搜索并显示进度
async function performSearch() {
  const progressDiv = document.getElementById('progress');
  const progressText = document.getElementById('progressText');
  const progressBar = document.getElementById('progressBar');
  const progressPercentage = document.getElementById('progressPercentage');
  const currentPhase = document.getElementById('currentPhase');
  const detailResults = document.getElementById('detailResults');
  const startBacktestBtn = document.getElementById('startBacktestBtn');
  const stopBacktestBtn = document.getElementById('stopBacktestBtn');
  
  // 进度计算变量
  let totalProgress = 0;
  let currentStep = 0;
  let totalSteps = 0;
  
  // 终止标志
  let isBacktestStopped = false;
  
  // 更新进度的函数
  function updateProgress(text, percentage, phase) {
    return new Promise(resolve => {
      // 直接更新DOM元素，不依赖requestAnimationFrame
      progressText.textContent = text;
      progressBar.style.width = `${percentage}%`;
      progressPercentage.textContent = `${Math.round(percentage)}%`;
      currentPhase.textContent = phase;
      resolve();
    });
  }
  
  try {
    // 显示终止回测按钮，隐藏开始回测按钮
    startBacktestBtn.style.display = 'none';
    stopBacktestBtn.style.display = 'inline-block';
    
    // 立即显示进度条，直接更新DOM元素，不依赖requestAnimationFrame
    progressDiv.style.display = 'block';
    progressText.textContent = '开始搜索平均率最低的统计期...';
    progressBar.style.width = '0%';
    progressPercentage.textContent = '0%';
    currentPhase.textContent = '正在准备...';
    detailResults.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #666;">正在搜索平均率最低的统计期...</td></tr>';
    await new Promise(resolve => setTimeout(resolve, 0)); // 确保DOM更新
    
    // 重置终止标志
    isBacktestStopped = false;
    
    // 添加终止回测按钮点击事件
    stopBacktestBtn.onclick = function() {
      isBacktestStopped = true;
      updateProgress('回测已终止', 100, '回测终止');
    };
    
    // 确保DOM更新
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const backtestPeriod = '50'; // 固定回测期数为50期
    // 更新进度
    await updateProgress('正在获取总期数...', 5, '获取总期数');
    
    const totalPeriods = await getTotalPeriods();
    
    // 多阶段搜索策略，从大到小变化步长
    const searchStages = [
      { step: 100, expansion: 200 }, // 第一阶段：步长100，扩展范围200
      { step: 50, expansion: 100 },   // 第二阶段：步长50，扩展范围100
      { step: 20, expansion: 50 },    // 第三阶段：步长20，扩展范围50
      { step: 10, expansion: 30 },    // 第四阶段：步长10，扩展范围30
      { step: 5, expansion: 20 }      // 第五阶段：步长5，扩展范围20
    ];
    
    // 三种回测方法
    const backtestMethods = ['most', 'least', 'average'];
    const allResults = [];
    
    // 计算总工作量
    totalSteps = backtestMethods.length * searchStages.length + 3; // 3个初始化和收尾步骤
    // 更新进度
    await updateProgress('正在获取最新一期期号...', 10, '获取最新期号');
    currentStep++;
    
    // 获取最后一期期号
    const lastPeriod = await getLastPeriod1();
    const nextPeriod = lastPeriod + '期'; // 使用最新一期的期号作为当前期号
    
    // 遍历三种回测方法
    for (const backtestMethod of backtestMethods) {
      const methodName = backtestMethod === 'most' ? '出现最多' : backtestMethod === 'least' ? '出现最少' : '出现平均';
      
      // 更新进度
      await updateProgress(`正在搜索回测方法: ${methodName}...`, 15 + (currentStep / totalSteps) * 60, `搜索回测方法: ${methodName}`);
      currentStep++;
      
      let currentStart = 20;
      let currentEnd = totalPeriods;
      let allTestResults = [];
      
      // 执行每个阶段的搜索
      for (let stageIndex = 0; stageIndex < searchStages.length; stageIndex++) {
        const stage = searchStages[stageIndex];
        const { step, expansion } = stage;
        
        // 更新进度
        const stageProgress = 15 + (currentStep / totalSteps) * 60;
        await updateProgress(
          `正在进行${methodName}方法的第${stageIndex + 1}阶段搜索（步长：${step}期）...`, 
          stageProgress, 
          `阶段${stageIndex + 1}，步长${step}`
        );
        currentStep++;
        
        let stageResults = [];
        
        // 计算当前阶段的期数范围和总次数
        const stageTotal = Math.ceil((currentEnd - currentStart) / step) + 1;
        let stageCount = 0;
        
        // 在当前范围内使用当前步长进行搜索
        for (let i = currentStart; i <= currentEnd; i += step) {
          // 检查是否需要终止回测
          if (isBacktestStopped) {
            break;
          }
          
          stageCount++;
          // 实时更新进度
          const loopProgress = 15 + ((currentStep - 1 + (stageCount / stageTotal)) / totalSteps) * 60;
          await updateProgress(
            `正在测试统计期${i}期...`, 
            loopProgress, 
            `测试期数: ${i}，进度 ${stageCount}/${stageTotal}`
          );
          
          const result = await testStatsPeriod(backtestPeriod, i, backtestMethod);
          stageResults.push(result);
          allTestResults.push(result);
        }
        
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          break;
        }
        
        // 如果当前阶段没有结果，继续下一阶段
        if (stageResults.length === 0) {
          continue;
        }
        
        // 找出当前阶段的最低正确率
        const lowestAccuracy = Math.min(...stageResults.map(result => result.accuracy));
        
        // 找出当前阶段中所有最低正确率的结果
        const lowestResultsInStage = stageResults.filter(result => result.accuracy === lowestAccuracy);
        
        // 计算下一阶段的搜索范围
        const minStatsPeriod = Math.min(...lowestResultsInStage.map(result => result.statsPeriod));
        const maxStatsPeriod = Math.max(...lowestResultsInStage.map(result => result.statsPeriod));
        
        // 扩展搜索范围，确保不遗漏相邻区域
        currentStart = Math.max(20, minStatsPeriod - expansion);
        currentEnd = Math.min(totalPeriods, maxStatsPeriod + expansion);
      }
      
      // 检查是否需要终止回测
      if (isBacktestStopped) {
        break;
      }
      
      // 从所有测试结果中找出最低正确率
      const lowestAccuracy = Math.min(...allTestResults.map(result => result.accuracy));
      
      // 找出所有正确率等于最低值的期数
      const lowestPeriods = allTestResults.filter(result => result.accuracy === lowestAccuracy);
      
      // 对期数进行去重处理
      const uniquePeriodsMap = new Map();
      lowestPeriods.forEach(result => {
        if (!uniquePeriodsMap.has(result.statsPeriod)) {
          uniquePeriodsMap.set(result.statsPeriod, result);
        }
      });
      
      // 将去重后的结果转换回数组，并添加回测方法信息
      const uniqueLowestPeriods = Array.from(uniquePeriodsMap.values()).map(result => ({
        ...result,
        backtestMethod
      }));
      
      // 添加到所有结果中
      allResults.push(...uniqueLowestPeriods);
    }
    
    // 检查是否需要终止回测
    if (isBacktestStopped) {
      detailResults.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #ff0000;">回测已终止</td></tr>';
    } else {
      // 更新进度
      await updateProgress('搜索完成，正在获取前区推荐买号...', 85, '获取前区推荐买号');
      currentStep++;
      
      // 为每个结果获取后区推荐杀号
      for (let i = 0; i < allResults.length; i++) {
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          break;
        }
        
        const result = allResults[i];
        const methodName = result.backtestMethod === 'most' ? '出现最多' : result.backtestMethod === 'least' ? '出现最少' : '出现平均';
        
        // 更新进度
        const buyProgress = 85 + ((i + 1) / allResults.length) * 10;
        await updateProgress(
          `正在获取统计期${result.statsPeriod}期，${methodName}方法的前区推荐买号...`, 
          buyProgress, 
          `处理结果 ${i + 1}/${allResults.length}`
        );
        
        result.frontBuyNumbers = await huo_qu_zui_xin_yi_qi_qian_qu_tui_jian_mai_hao(result.statsPeriod, result.backtestMethod);
      }
      
      // 检查是否需要终止回测
      if (isBacktestStopped) {
        detailResults.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #ff0000;">回测已终止</td></tr>';
      } else {
        // 更新进度
        await updateProgress('正在处理回测结果，过滤重复推荐...', 92, '处理结果');
        
        // 按回测方法和平均正确率分组
        const groupedResults = {};
        allResults.forEach(result => {
          const key = `${result.backtestMethod}_${result.accuracy}`;
          if (!groupedResults[key]) groupedResults[key] = [];
          groupedResults[key].push(result);
        });
        
        // 处理每个分组，保留唯一推荐买号结果
        const filteredResults = [];
        for (const key in groupedResults) {
          const group = groupedResults[key];
          if (group.length === 1) {
            filteredResults.push(group[0]);
            continue;
          }
          
          // 对于同方法同正确率的结果，按推荐买号分组
          const buyNumbersMap = new Map();
          group.forEach(result => {
            const buyNumbersKey = result.frontBuyNumbers.sort().join(',');
            if (!buyNumbersMap.has(buyNumbersKey)) {
              buyNumbersMap.set(buyNumbersKey, result);
            }
          });
          
          // 将分组结果添加到过滤结果中
          filteredResults.push(...buyNumbersMap.values());
        }
        
        // 更新进度
        await updateProgress(`找到 ${filteredResults.length} 个平均率最低的统计期，正在渲染结果...`, 98, '渲染结果');
        currentStep++;
        
        // 渲染详情数据，传递过滤后的结果和下一期期号
        await renderDetailData(filteredResults, nextPeriod);
        
        // 更新进度
        await updateProgress('搜索完成，正在隐藏进度条...', 100, '完成');
      }
    }
    
  } catch (error) {
    console.error('搜索最低正确率统计期失败', error);
    
    // 更新进度
    await updateProgress('搜索失败，请重试', 100, '搜索失败');
    detailResults.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #ff0000;">搜索失败，请重试</td></tr>';
  } finally {
    // 恢复按钮状态
    startBacktestBtn.style.display = 'inline-block';
    stopBacktestBtn.style.display = 'none';
    // 重置终止标志
    isBacktestStopped = false;
  }
}

// 从后端获取倒数2期两球回测数据
async function huo_qu_dao_shu_2_qi_liang_qiu_mai_hao_hui_ce(backtestPeriod = '50', statsPeriod = '100', backtestMethod = 'most') {
  try {
    const response = await fetch(`http://localhost:18889/dao_shu_2_qi_mai_hao_hui_ce?backtest_period=${backtestPeriod}&stats_period=${statsPeriod}&backtest_method=${backtestMethod}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      alert('接口失败');
      return null;
    }
  } catch (error) {
    console.error('接口失败:', error);
    alert('接口失败');
    return null;
  }
}

// 测试单个统计期值的平均正确率（倒数2期两球）
async function testStatsPeriod2(backtestPeriod, statsPeriod, backtestMethod) {
  try {
    const backtestData = await huo_qu_dao_shu_2_qi_liang_qiu_mai_hao_hui_ce(backtestPeriod, statsPeriod, backtestMethod);
    if (!backtestData || !backtestData.backtestResults || backtestData.backtestResults.length === 0) {
      return { statsPeriod, accuracy: 100 };
    }
    
    let successBuyCount = 0;
    backtestData.backtestResults.forEach(result => {
      if (result.frontCorrectBuy > 0) {
        successBuyCount++;
      }
    });
    
    const totalPeriods = backtestData.backtestResults.length;
    const averageCorrectRate = totalPeriods > 0 ? 
      ((successBuyCount / totalPeriods) * 100) : 100;
    
    return { statsPeriod, accuracy: averageCorrectRate };
  } catch (error) {
    console.error(`测试统计期${statsPeriod} 失败:`, error);
    return { statsPeriod, accuracy: 100 };
  }
}

// 渲染倒数2期两球详情数据
async function renderDetailData2(allResults, nextPeriod) {
  const detailResults = document.getElementById('detailResults2');
  
  try {
    // 清空当前内容
    detailResults.innerHTML = '';
    
    // 如果没有结果，显示提示
    if (allResults.length === 0) {
      detailResults.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #666;">未找到平均率最低的统计期</td></tr>';
      return;
    }
    
    // 遍历所有结果
    for (const result of allResults) {
      const { statsPeriod, accuracy, backtestMethod, frontBuyNumbers } = result;
      
      // 平均正确率已经在搜索阶段计算好
      const averageCorrectRate = accuracy.toFixed(3);
      
      // 获取回测方法中文名称
      let backtestMethodText = '出现最多';
      if (backtestMethod === 'least') {
        backtestMethodText = '出现最少';
      } else if (backtestMethod === 'average') {
        backtestMethodText = '出现平均';
      }
      
      // 格式化前区推荐买号
      const frontBuyNumbersStr = frontBuyNumbers.map(num => `<span class="red-ball">${num}</span>`).join(' ');
      
      // 创建表格行
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${backtestMethodText}</td>
        <td>50期</td>
        <td>${statsPeriod}期</td>
        <td>${averageCorrectRate}%</td>
        <td>${nextPeriod}</td>
        <td>${frontBuyNumbersStr}</td>
        <td>
          <button class="btn copy-btn" style="background-color: #4CAF50; color: white; padding: 5px 10px; font-size: 12px;">复制</button>
        </td>
      `;
      
      // 添加复制按钮事件
      const copyBtn = tr.querySelector('.copy-btn');
      copyBtn.addEventListener('click', () => copyToClipboard(frontBuyNumbers));
      
      detailResults.appendChild(tr);
    }
  } catch (error) {
    console.error('渲染详情数据失败:', error);
    detailResults.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #ff0000;">加载失败，请重试</td></tr>';
  }
}

// 获取倒数2期两球前区推荐买号
async function huo_qu_dao_shu_2_qi_qian_qu_tui_jian_mai_hao(statsPeriod, backtestMethod) {
  try {
    // 使用现有的回测结果计算推荐买号，而不是调用不存在的API
    const backtestData = await huo_qu_dao_shu_2_qi_liang_qiu_mai_hao_hui_ce('50', statsPeriod, backtestMethod);
    if (!backtestData || !backtestData.backtestResults || backtestData.backtestResults.length === 0) {
      return [];
    }
    
    // 初始化汇总计数数组
    const totalCounts = new Array(36).fill(0); // 索引0不使用，1-35对应前区号码
    
    // 遍历回测结果，统计每个号码的出现次数
    backtestData.backtestResults.forEach(result => {
      if (result.frontBuyNumbers && result.frontBuyNumbers.length > 0) {
        result.frontBuyNumbers.forEach(num => {
          totalCounts[num]++;
        });
      }
    });
    
    let frontBuyNumbers = [];
    
    // 根据回测方法计算对应的前区推荐买号
    if (backtestMethod === 'most') {
      // 1. 出现最多球：找到totalCounts中的最大值对应的号码
      const maxFirstCount = Math.max(...totalCounts);
      if (maxFirstCount > 0) {
        // 找出所有最大值对应的号码
        for (let i = 1; i <= 35; i++) {
          if (totalCounts[i] === maxFirstCount) {
            frontBuyNumbers.push(i);
          }
        }
      }
    } else if (backtestMethod === 'least') {
      // 2. 出现最少球：找到totalCounts中除0以外的最小值对应的号码
      const nonZeroCounts = totalCounts.filter(count => count > 0);
      if (nonZeroCounts.length > 0) {
        const minFirstCount = Math.min(...nonZeroCounts);
        // 找出所有最小值对应的号码
        for (let i = 1; i <= 35; i++) {
          if (totalCounts[i] === minFirstCount) {
            frontBuyNumbers.push(i);
          }
        }
      }
    } else if (backtestMethod === 'average') {
      // 3. 出现平均球：找到totalCounts中次数等于平均值的号码
      const nonZeroTotalCounts = totalCounts.filter(count => count > 0);
      if (nonZeroTotalCounts.length > 0) {
        const sumCounts = nonZeroTotalCounts.reduce((sum, count) => sum + count, 0);
        const averageCount = Math.round(sumCounts / nonZeroTotalCounts.length);
        // 找出所有等于平均值的号码
        for (let i = 1; i <= 35; i++) {
          if (totalCounts[i] === averageCount) {
            frontBuyNumbers.push(i);
          }
        }
      }
    }
    
    return frontBuyNumbers;
  } catch (error) {
    console.error('获取前区推荐买号失败:', error);
    return [];
  }
}

// 获取最后一期期号（倒数2期两球专用）
async function getLastPeriod2() {
  try {
    // 调用letou数据库中最新一期的期号API
    const response = await fetch('http://localhost:18889/sql_zui_xin_yi_qi');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (result.success) {
      // 获取最新一期期号，去掉"期"
      const lastPeriod = result.latestDraw.period.replace('期', '');
      // 返回下下期的期号
      return (parseInt(lastPeriod) + 2) + '期';
    } else {
      alert('接口失败');
      // 备选方案：从页面中获取当前期号
      const currentPeriod = document.querySelector('.current-period').textContent;
      // 返回下下期的期号
      return (parseInt(currentPeriod.replace('期', '')) + 2) + '期';
    }
  } catch (error) {
    console.error('获取最后一期期号失败', error);
    // 备选方案：从页面中获取当前期号
    const currentPeriod = document.querySelector('.current-period').textContent;
    // 返回下下期的期号
    return (parseInt(currentPeriod.replace('期', '')) + 2) + '期';
  }
}

// 执行倒数2期两球搜索并显示进度
async function performSearch2() {
  const progressDiv = document.getElementById('progress2');
  const progressText = document.getElementById('progressText2');
  const progressBar = document.getElementById('progressBar2');
  const progressPercentage = document.getElementById('progressPercentage2');
  const currentPhase = document.getElementById('currentPhase2');
  const detailResults = document.getElementById('detailResults2');
  const startBacktestBtn = document.getElementById('startBacktestBtn2');
  const stopBacktestBtn = document.getElementById('stopBacktestBtn2');
  
  // 进度计算变量
  let totalProgress = 0;
  let currentStep = 0;
  let totalSteps = 0;
  
  // 终止标志
  let isBacktestStopped = false;
  
  // 更新进度的函数
  function updateProgress(text, percentage, phase) {
    return new Promise(resolve => {
      // 直接更新DOM元素，不依赖requestAnimationFrame
      progressText.textContent = text;
      progressBar.style.width = `${percentage}%`;
      progressPercentage.textContent = `${Math.round(percentage)}%`;
      currentPhase.textContent = phase;
      resolve();
    });
  }
  
  try {
    // 显示终止回测按钮，隐藏开始回测按钮
    startBacktestBtn.style.display = 'none';
    stopBacktestBtn.style.display = 'inline-block';
    
    // 立即显示进度条，直接更新DOM元素，不依赖requestAnimationFrame
    progressDiv.style.display = 'block';
    progressText.textContent = '开始搜索平均率最低的统计期...';
    progressBar.style.width = '0%';
    progressPercentage.textContent = '0%';
    currentPhase.textContent = '正在准备...';
    detailResults.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #666;">正在搜索平均率最低的统计期...</td></tr>';
    await new Promise(resolve => setTimeout(resolve, 0)); // 确保DOM更新
    
    // 重置终止标志
    isBacktestStopped = false;
    
    // 添加终止回测按钮点击事件
    stopBacktestBtn.onclick = function() {
      isBacktestStopped = true;
      updateProgress('回测已终止', 100, '回测终止');
    };
    
    // 确保DOM更新
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const backtestPeriod = '50'; // 固定回测期数为50期
    // 更新进度
    await updateProgress('正在获取总期数...', 5, '获取总期数');
    
    const totalPeriods = await getTotalPeriods();
    
    // 多阶段搜索策略，从大到小变化步长
    const searchStages = [
      { step: 100, expansion: 200 }, // 第一阶段：步长100，扩展范围200
      { step: 50, expansion: 100 },   // 第二阶段：步长50，扩展范围100
      { step: 20, expansion: 50 },    // 第三阶段：步长20，扩展范围50
      { step: 10, expansion: 30 },    // 第四阶段：步长10，扩展范围30
      { step: 5, expansion: 20 }      // 第五阶段：步长5，扩展范围20
    ];
    
    // 三种回测方法
    const backtestMethods = ['most', 'least', 'average'];
    const allResults = [];
    
    // 计算总工作量
    totalSteps = backtestMethods.length * searchStages.length + 3; // 3个初始化和收尾步骤
    // 更新进度
    await updateProgress('正在获取最新一期期号...', 10, '获取最新期号');
    currentStep++;
    
    // 获取最后一期期号
    const lastPeriod = await getLastPeriod2();
    const nextPeriod = lastPeriod; // 使用最新一期的期号的下下期作为当前期号
    
    // 遍历三种回测方法
    for (const backtestMethod of backtestMethods) {
      const methodName = backtestMethod === 'most' ? '出现最多' : backtestMethod === 'least' ? '出现最少' : '出现平均';
      
      // 更新进度
      await updateProgress(`正在搜索回测方法: ${methodName}...`, 15 + (currentStep / totalSteps) * 60, `搜索回测方法: ${methodName}`);
      currentStep++;
      
      let currentStart = 20;
      let currentEnd = totalPeriods;
      let allTestResults = [];
      
      // 执行每个阶段的搜索
      for (let stageIndex = 0; stageIndex < searchStages.length; stageIndex++) {
        const stage = searchStages[stageIndex];
        const { step, expansion } = stage;
        
        // 更新进度
        const stageProgress = 15 + (currentStep / totalSteps) * 60;
        await updateProgress(
          `正在进行${methodName}方法的第${stageIndex + 1}阶段搜索（步长：${step}期）...`, 
          stageProgress, 
          `阶段${stageIndex + 1}，步长${step}`
        );
        currentStep++;
        
        let stageResults = [];
        
        // 计算当前阶段的期数范围和总次数
        const stageTotal = Math.ceil((currentEnd - currentStart) / step) + 1;
        let stageCount = 0;
        
        // 在当前范围内使用当前步长进行搜索
        for (let i = currentStart; i <= currentEnd; i += step) {
          // 检查是否需要终止回测
          if (isBacktestStopped) {
            break;
          }
          
          stageCount++;
          // 实时更新进度
          const loopProgress = 15 + ((currentStep - 1 + (stageCount / stageTotal)) / totalSteps) * 60;
          await updateProgress(
            `正在测试统计期${i}期...`, 
            loopProgress, 
            `测试期数: ${i}，进度 ${stageCount}/${stageTotal}`
          );
          
          const result = await testStatsPeriod2(backtestPeriod, i, backtestMethod);
          stageResults.push(result);
          allTestResults.push(result);
        }
        
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          break;
        }
        
        // 如果当前阶段没有结果，继续下一阶段
        if (stageResults.length === 0) {
          continue;
        }
        
        // 找出当前阶段的最低正确率
        const lowestAccuracy = Math.min(...stageResults.map(result => result.accuracy));
        
        // 找出当前阶段中所有最低正确率的结果
        const lowestResultsInStage = stageResults.filter(result => result.accuracy === lowestAccuracy);
        
        // 计算下一阶段的搜索范围
        const minStatsPeriod = Math.min(...lowestResultsInStage.map(result => result.statsPeriod));
        const maxStatsPeriod = Math.max(...lowestResultsInStage.map(result => result.statsPeriod));
        
        // 扩展搜索范围，确保不遗漏相邻区域
        currentStart = Math.max(20, minStatsPeriod - expansion);
        currentEnd = Math.min(totalPeriods, maxStatsPeriod + expansion);
      }
      
      // 从所有测试结果中找出最低正确率
      const lowestAccuracy = Math.min(...allTestResults.map(result => result.accuracy));
      
      // 找出所有正确率等于最低值的期数
      const lowestPeriods = allTestResults.filter(result => result.accuracy === lowestAccuracy);
      
      // 对期数进行去重处理
      const uniquePeriodsMap = new Map();
      lowestPeriods.forEach(result => {
        if (!uniquePeriodsMap.has(result.statsPeriod)) {
          uniquePeriodsMap.set(result.statsPeriod, result);
        }
      });
      
      // 将去重后的结果转换回数组，并添加回测方法信息
      const uniqueLowestPeriods = Array.from(uniquePeriodsMap.values()).map(result => ({
        ...result,
        backtestMethod
      }));
      
      // 添加到所有结果中
      allResults.push(...uniqueLowestPeriods);
    }
    
    // 更新进度
    await updateProgress('搜索完成，正在获取前区推荐买号...', 85, '获取前区推荐买号');
    currentStep++;
    
    // 为每个结果获取前区推荐买号
    for (let i = 0; i < allResults.length; i++) {
      // 检查是否需要终止回测
      if (isBacktestStopped) {
        break;
      }
      
      const result = allResults[i];
      const methodName = result.backtestMethod === 'most' ? '出现最多' : result.backtestMethod === 'least' ? '出现最少' : '出现平均';
      
      // 更新进度
      const buyProgress = 85 + ((i + 1) / allResults.length) * 10;
      await updateProgress(
        `正在获取统计期${result.statsPeriod}期，${methodName}方法的前区推荐买号...`, 
        buyProgress, 
        `处理结果 ${i + 1}/${allResults.length}`
      );
      
      result.frontBuyNumbers = await huo_qu_dao_shu_2_qi_qian_qu_tui_jian_mai_hao(result.statsPeriod, result.backtestMethod);
    }
    
    // 检查是否需要终止回测
    if (isBacktestStopped) {
      detailResults.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #ff0000;">回测已终止</td></tr>';
    } else {
      // 更新进度
      await updateProgress('正在处理回测结果，过滤重复推荐...', 92, '处理结果');
      
      // 按回测方法和平均正确率分组
      const groupedResults = {};
      allResults.forEach(result => {
        const key = `${result.backtestMethod}_${result.accuracy}`;
        if (!groupedResults[key]) groupedResults[key] = [];
        groupedResults[key].push(result);
      });
      
      // 处理每个分组，保留唯一推荐买号结果
      const filteredResults = [];
      for (const key in groupedResults) {
        const group = groupedResults[key];
        if (group.length === 1) {
          filteredResults.push(group[0]);
          continue;
        }
        
        // 对于同方法同正确率的结果，按推荐买号分组
        const buyNumbersMap = new Map();
        group.forEach(result => {
          const buyNumbersKey = result.frontBuyNumbers.sort().join(',');
          if (!buyNumbersMap.has(buyNumbersKey)) {
            buyNumbersMap.set(buyNumbersKey, result);
          }
        });
        
        // 将分组结果添加到过滤结果中
        filteredResults.push(...buyNumbersMap.values());
      }
      
      // 更新进度
      await updateProgress(`找到 ${filteredResults.length} 个平均率最低的统计期，正在渲染结果...`, 98, '渲染结果');
      currentStep++;
      
      // 渲染详情数据，传递过滤后的结果和下一期期号
      await renderDetailData2(filteredResults, nextPeriod);
      
      // 更新进度
      await updateProgress('搜索完成，正在隐藏进度条...', 100, '完成');
    }
    
    // 隐藏进度
    await new Promise(resolve => {
      setTimeout(() => {
        // 直接更新DOM元素，不依赖requestAnimationFrame
        progressDiv.style.display = 'none';
        resolve();
      }, 500);
    });
    
  } catch (error) {
    console.error('搜索最低正确率统计期失败', error);
    
    // 更新进度
    await updateProgress('搜索失败，请重试', 100, '搜索失败');
    detailResults.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #ff0000;">搜索失败，请重试</td></tr>';
  } finally {
    // 恢复按钮状态
    startBacktestBtn.style.display = 'inline-block';
    stopBacktestBtn.style.display = 'none';
    // 重置终止标志
    isBacktestStopped = false;
  }
}

// 从后端获取倒数3期两球回测数据
async function huo_qu_dao_shu_3_qi_liang_qiu_mai_hao_hui_ce(backtestPeriod = '50', statsPeriod = '100', backtestMethod = 'most') {
  try {
    const response = await fetch(`http://localhost:18889/dao_shu_3_qi_mai_hao_hui_ce?backtest_period=${backtestPeriod}&stats_period=${statsPeriod}&backtest_method=${backtestMethod}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      alert('接口失败');
      return null;
    }
  } catch (error) {
    console.error('接口失败:', error);
    alert('接口失败');
    return null;
  }
}

// 测试单个统计期值的平均正确率（倒数3期两球）
async function testStatsPeriod3(backtestPeriod, statsPeriod, backtestMethod) {
  try {
    const backtestData = await huo_qu_dao_shu_3_qi_liang_qiu_mai_hao_hui_ce(backtestPeriod, statsPeriod, backtestMethod);
    if (!backtestData || !backtestData.backtestResults || backtestData.backtestResults.length === 0) {
      return { statsPeriod, accuracy: 100 };
    }
    
    let successBuyCount = 0;
    backtestData.backtestResults.forEach(result => {
      if (result.frontCorrectBuy > 0) {
        successBuyCount++;
      }
    });
    
    const totalPeriods = backtestData.backtestResults.length;
    const averageCorrectRate = totalPeriods > 0 ? 
      ((successBuyCount / totalPeriods) * 100) : 100;
    
    return { statsPeriod, accuracy: averageCorrectRate };
  } catch (error) {
    console.error(`测试统计期${statsPeriod} 失败:`, error);
    return { statsPeriod, accuracy: 100 };
  }
}

// 渲染倒数3期两球详情数据
async function renderDetailData3(allResults, nextPeriod) {
  const detailResults = document.getElementById('detailResults3');
  
  try {
    // 清空当前内容
    detailResults.innerHTML = '';
    
    // 如果没有结果，显示提示
    if (allResults.length === 0) {
      detailResults.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #666;">未找到平均率最低的统计期</td></tr>';
      return;
    }
    
    // 遍历所有结果
    for (const result of allResults) {
      const { statsPeriod, accuracy, backtestMethod, frontBuyNumbers } = result;
      
      // 平均正确率已经在搜索阶段计算好
      const averageCorrectRate = accuracy.toFixed(3);
      
      // 获取回测方法中文名称
      let backtestMethodText = '出现最多';
      if (backtestMethod === 'least') {
        backtestMethodText = '出现最少';
      } else if (backtestMethod === 'average') {
        backtestMethodText = '出现平均';
      }
      
      // 格式化前区推荐买号
      const frontBuyNumbersStr = frontBuyNumbers.map(num => `<span class="red-ball">${num}</span>`).join(' ');
      
      // 创建表格行
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${backtestMethodText}</td>
        <td>50期</td>
        <td>${statsPeriod}期</td>
        <td>${averageCorrectRate}%</td>
        <td>${nextPeriod}</td>
        <td>${frontBuyNumbersStr}</td>
        <td>
          <button class="btn copy-btn" style="background-color: #4CAF50; color: white; padding: 5px 10px; font-size: 12px;">复制</button>
        </td>
      `;
      
      // 添加复制按钮事件
      const copyBtn = tr.querySelector('.copy-btn');
      copyBtn.addEventListener('click', () => copyToClipboard(frontBuyNumbers));
      
      detailResults.appendChild(tr);
    }
  } catch (error) {
    console.error('渲染详情数据失败:', error);
    detailResults.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #ff0000;">加载失败，请重试</td></tr>';
  }
}

// 获取倒数3期两球前区推荐买号
async function huo_qu_dao_shu_3_qi_qian_qu_tui_jian_mai_hao(statsPeriod, backtestMethod) {
  try {
    // 使用现有的回测结果计算推荐买号，而不是调用不存在的API
    const backtestData = await huo_qu_dao_shu_3_qi_liang_qiu_mai_hao_hui_ce('50', statsPeriod, backtestMethod);
    if (!backtestData || !backtestData.backtestResults || backtestData.backtestResults.length === 0) {
      return [];
    }
    
    // 初始化汇总计数数组
    const totalCounts = new Array(36).fill(0); // 索引0不使用，1-35对应前区号码
    
    // 遍历回测结果，统计每个号码的出现次数
    backtestData.backtestResults.forEach(result => {
      if (result.frontBuyNumbers && result.frontBuyNumbers.length > 0) {
        result.frontBuyNumbers.forEach(num => {
          totalCounts[num]++;
        });
      }
    });
    
    let frontBuyNumbers = [];
    
    // 根据回测方法计算对应的前区推荐买号
    if (backtestMethod === 'most') {
      // 1. 出现最多球：找到totalCounts中的最大值对应的号码
      const maxFirstCount = Math.max(...totalCounts);
      if (maxFirstCount > 0) {
        // 找出所有最大值对应的号码
        for (let i = 1; i <= 35; i++) {
          if (totalCounts[i] === maxFirstCount) {
            frontBuyNumbers.push(i);
          }
        }
      }
    } else if (backtestMethod === 'least') {
      // 2. 出现最少球：找到totalCounts中除0以外的最小值对应的号码
      const nonZeroCounts = totalCounts.filter(count => count > 0);
      if (nonZeroCounts.length > 0) {
        const minFirstCount = Math.min(...nonZeroCounts);
        // 找出所有最小值对应的号码
        for (let i = 1; i <= 35; i++) {
          if (totalCounts[i] === minFirstCount) {
            frontBuyNumbers.push(i);
          }
        }
      }
    } else if (backtestMethod === 'average') {
      // 3. 出现平均球：找到totalCounts中次数等于平均值的号码
      const nonZeroTotalCounts = totalCounts.filter(count => count > 0);
      if (nonZeroTotalCounts.length > 0) {
        const sumCounts = nonZeroTotalCounts.reduce((sum, count) => sum + count, 0);
        const averageCount = Math.round(sumCounts / nonZeroTotalCounts.length);
        // 找出所有等于平均值的号码
        for (let i = 1; i <= 35; i++) {
          if (totalCounts[i] === averageCount) {
            frontBuyNumbers.push(i);
          }
        }
      }
    }
    
    return frontBuyNumbers;
  } catch (error) {
    console.error('获取前区推荐买号失败:', error);
    return [];
  }
}

// 获取最后一期期号（倒数3期两球专用）
async function getLastPeriod3() {
  try {
    // 调用letou数据库中最新一期的期号API
    const response = await fetch('http://localhost:18889/sql_zui_xin_yi_qi');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (result.success) {
      // 获取最新一期期号，去掉"期"
      const lastPeriod = result.latestDraw.period.replace('期', '');
      // 返回下下下期的期号
      return (parseInt(lastPeriod) + 3) + '期';
    } else {
      alert('接口失败');
      // 备选方案：从页面中获取当前期号
      const currentPeriod = document.querySelector('.current-period').textContent;
      // 返回下下下期的期号
      return (parseInt(currentPeriod.replace('期', '')) + 3) + '期';
    }
  } catch (error) {
    console.error('获取最后一期期号失败', error);
    // 备选方案：从页面中获取当前期号
    const currentPeriod = document.querySelector('.current-period').textContent;
    // 返回下下下期的期号
    return (parseInt(currentPeriod.replace('期', '')) + 3) + '期';
  }
}

// 执行倒数3期两球搜索并显示进度
async function performSearch3() {
  const progressDiv = document.getElementById('progress3');
  const progressText = document.getElementById('progressText3');
  const progressBar = document.getElementById('progressBar3');
  const progressPercentage = document.getElementById('progressPercentage3');
  const currentPhase = document.getElementById('currentPhase3');
  const detailResults = document.getElementById('detailResults3');
  const startBacktestBtn = document.getElementById('startBacktestBtn3');
  const stopBacktestBtn = document.getElementById('stopBacktestBtn3');
  
  // 进度计算变量
  let totalProgress = 0;
  let currentStep = 0;
  let totalSteps = 0;
  
  // 终止标志
  let isBacktestStopped = false;
  
  // 更新进度的函数
  function updateProgress(text, percentage, phase) {
    return new Promise(resolve => {
      // 直接更新DOM元素，不依赖requestAnimationFrame
      progressText.textContent = text;
      progressBar.style.width = `${percentage}%`;
      progressPercentage.textContent = `${Math.round(percentage)}%`;
      currentPhase.textContent = phase;
      resolve();
    });
  }
  
  try {
    // 显示终止回测按钮，隐藏开始回测按钮
    startBacktestBtn.style.display = 'none';
    stopBacktestBtn.style.display = 'inline-block';
    
    // 立即显示进度条，直接更新DOM元素，不依赖requestAnimationFrame
    progressDiv.style.display = 'block';
    progressText.textContent = '开始搜索平均率最低的统计期...';
    progressBar.style.width = '0%';
    progressPercentage.textContent = '0%';
    currentPhase.textContent = '正在准备...';
    detailResults.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #666;">正在搜索平均率最低的统计期...</td></tr>';
    await new Promise(resolve => setTimeout(resolve, 0)); // 确保DOM更新
    
    // 重置终止标志
    isBacktestStopped = false;
    
    // 添加终止回测按钮点击事件
    stopBacktestBtn.onclick = function() {
      isBacktestStopped = true;
      updateProgress('回测已终止', 100, '回测终止');
    };
    
    // 确保DOM更新
    await new Promise(resolve => setTimeout(resolve, 100));