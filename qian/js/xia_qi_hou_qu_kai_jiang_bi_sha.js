// 主题切换功能 - 仅从localStorage读取设置，不在此页面提供切换按钮
document.addEventListener('DOMContentLoaded', function() {
  // 从localStorage读取主题设置
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark-theme');
  }
  
  // 调用主函数初始化页面数据
  main();
  
  // 添加开始回测按钮点击事件
  const startBacktestBtn = document.getElementById('startBacktestBtn');
  if (startBacktestBtn) {
    startBacktestBtn.addEventListener('click', performSearch);
  }
  
  // 添加开始回测按钮2的点击事件
  const startBacktestBtn2 = document.getElementById('startBacktestBtn2');
  if (startBacktestBtn2) {
    startBacktestBtn2.addEventListener('click', performSearch2);
  }
  
  // 添加开始回测按钮3的点击事件
  const startBacktestBtn3 = document.getElementById('startBacktestBtn3');
  if (startBacktestBtn3) {
    startBacktestBtn3.addEventListener('click', performSearch3);
  }
  
  // 添加开始回测按钮4的点击事件
  const startBacktestBtn4 = document.getElementById('startBacktestBtn4');
  if (startBacktestBtn4) {
    startBacktestBtn4.addEventListener('click', performSearch4);
  }
  
  // 添加开始回测按钮5的点击事件
  const startBacktestBtn5 = document.getElementById('startBacktestBtn5');
  if (startBacktestBtn5) {
    startBacktestBtn5.addEventListener('click', performSearch5);
  }
  
  // 添加总回测控制按钮的点击事件
  const startAllBacktestBtn = document.getElementById('startAllBacktestBtn');
  if (startAllBacktestBtn) {
    startAllBacktestBtn.addEventListener('click', startAllBacktest);
  }
  
  // 添加保存回测结果按钮的点击事件
  const saveBacktestBtn = document.getElementById('saveBacktestBtn');
  if (saveBacktestBtn) {
    saveBacktestBtn.addEventListener('click', saveBacktestResults);
  }
  
  // 添加加载回测结果按钮的点击事件
  const loadBacktestBtn = document.getElementById('loadBacktestBtn');
  if (loadBacktestBtn) {
    loadBacktestBtn.addEventListener('click', loadBacktestResults);
  }
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

// 从后端获取后区回测数据
async function huo_qu_hou_qu_sha_hao_mai_hao_hui_ce(backtestPeriod = '50', statsPeriod = '100', backtestMethod = 'most') {
  try {
    const response = await fetch(`http://localhost:18889/huo_qu_sha_hao_hou_mai_hao_hui_ce?backtest_period=${backtestPeriod}&stats_period=${statsPeriod}&backtest_method=${backtestMethod}`);
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

// 从后端获取倒数2期后区回测数据
async function huo_qu_dao_shu_2_qi_hou_mai_hao_hui_ce(backtestPeriod = '50', statsPeriod = '100', backtestMethod = 'most') {
  try {
    const response = await fetch(`http://localhost:18889/huo_qu_dao_shu_2_qi_hou_mai_hao_hui_ce?backtest_period=${backtestPeriod}&stats_period=${statsPeriod}&backtest_method=${backtestMethod}`);
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

// 从后端获取倒数3期后区回测数据
async function huo_qu_dao_shu_3_qi_hou_mai_hao_hui_ce(backtestPeriod = '50', statsPeriod = '100', backtestMethod = 'most') {
  try {
    const response = await fetch(`http://localhost:18889/huo_qu_dao_shu_3_qi_hou_mai_hao_hui_ce?backtest_period=${backtestPeriod}&stats_period=${statsPeriod}&backtest_method=${backtestMethod}`);
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

// 从后端获取倒数4期后区回测数据
async function huo_qu_dao_shu_4_qi_hou_mai_hao_hui_ce(backtestPeriod = '50', statsPeriod = '100', backtestMethod = 'most') {
  try {
    const response = await fetch(`http://localhost:18889/huo_qu_dao_shu_4_qi_hou_mai_hao_hui_ce?backtest_period=${backtestPeriod}&stats_period=${statsPeriod}&backtest_method=${backtestMethod}`);
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

// 从后端获取倒数5期后区回测数据
async function huo_qu_dao_shu_5_qi_hou_mai_hao_hui_ce(backtestPeriod = '50', statsPeriod = '100', backtestMethod = 'most') {
  try {
    const response = await fetch(`http://localhost:18889/huo_qu_dao_shu_5_qi_hou_mai_hao_hui_ce?backtest_period=${backtestPeriod}&stats_period=${statsPeriod}&backtest_method=${backtestMethod}`);
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

// 测试单个统计期值的平均正确率（后区）
async function testStatsPeriod(backtestPeriod, statsPeriod, backtestMethod) {
  try {
    const backtestData = await huo_qu_hou_qu_sha_hao_mai_hao_hui_ce(backtestPeriod, statsPeriod, backtestMethod);
    if (!backtestData || !backtestData.backtestResults || backtestData.backtestResults.length === 0) {
      return { statsPeriod, accuracy: 100 };
    }
    
    let successBuyCount = 0;
    backtestData.backtestResults.forEach(result => {
      if (result.backCorrectBuy > 0) {
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

// 测试倒数2期单个统计期值的平均正确率（后区）
async function testStatsPeriod2(backtestPeriod, statsPeriod, backtestMethod) {
  try {
    const backtestData = await huo_qu_dao_shu_2_qi_hou_mai_hao_hui_ce(backtestPeriod, statsPeriod, backtestMethod);
    if (!backtestData || !backtestData.backtestResults || backtestData.backtestResults.length === 0) {
      return { statsPeriod, accuracy: 100 };
    }
    
    let successBuyCount = 0;
    backtestData.backtestResults.forEach(result => {
      if (result.backCorrectBuy > 0) {
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

// 测试倒数3期单个统计期值的平均正确率（后区）
async function testStatsPeriod3(backtestPeriod, statsPeriod, backtestMethod) {
  try {
    const backtestData = await huo_qu_dao_shu_3_qi_hou_mai_hao_hui_ce(backtestPeriod, statsPeriod, backtestMethod);
    if (!backtestData || !backtestData.backtestResults || backtestData.backtestResults.length === 0) {
      return { statsPeriod, accuracy: 100 };
    }
    
    let successBuyCount = 0;
    backtestData.backtestResults.forEach(result => {
      if (result.backCorrectBuy > 0) {
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

// 测试倒数4期单个统计期值的平均正确率（后区）
async function testStatsPeriod4(backtestPeriod, statsPeriod, backtestMethod) {
  try {
    const backtestData = await huo_qu_dao_shu_4_qi_hou_mai_hao_hui_ce(backtestPeriod, statsPeriod, backtestMethod);
    if (!backtestData || !backtestData.backtestResults || backtestData.backtestResults.length === 0) {
      return { statsPeriod, accuracy: 100 };
    }
    
    let successBuyCount = 0;
    backtestData.backtestResults.forEach(result => {
      if (result.backCorrectBuy > 0) {
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

// 测试倒数5期单个统计期值的平均正确率（后区）
async function testStatsPeriod5(backtestPeriod, statsPeriod, backtestMethod) {
  try {
    const backtestData = await huo_qu_dao_shu_5_qi_hou_mai_hao_hui_ce(backtestPeriod, statsPeriod, backtestMethod);
    if (!backtestData || !backtestData.backtestResults || backtestData.backtestResults.length === 0) {
      return { statsPeriod, accuracy: 100 };
    }
    
    let successBuyCount = 0;
    backtestData.backtestResults.forEach(result => {
      if (result.backCorrectBuy > 0) {
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
      const { statsPeriod, accuracy, backtestMethod, backBuyNumbers } = result;
      
      // 平均正确率已经在搜索阶段计算好
      const averageCorrectRate = accuracy.toFixed(3);
      
      // 获取回测方法中文名称
      let backtestMethodText = '出现最多';
      if (backtestMethod === 'least') {
        backtestMethodText = '出现最少';
      } else if (backtestMethod === 'average') {
        backtestMethodText = '出现平均';
      }
      
      // 格式化后区推荐杀号
      const backBuyNumbersStr = backBuyNumbers.map(num => `<span class="blue-ball">${num}</span>`).join(' ');
      
      // 创建表格行
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${backtestMethodText}</td>
        <td>50期</td>
        <td>${statsPeriod}期</td>
        <td>${averageCorrectRate}%</td>
        <td>${nextPeriod}</td>
        <td>${backBuyNumbersStr}</td>
        <td>
          <button class="btn copy-btn" style="background-color: #4CAF50; color: white; padding: 5px 10px; font-size: 12px;">复制</button>
        </td>
      `;
      
      // 添加复制按钮事件
      const copyBtn = tr.querySelector('.copy-btn');
      copyBtn.addEventListener('click', () => copyToClipboard(backBuyNumbers));
      
      detailResults.appendChild(tr);
    }
  } catch (error) {
    console.error('渲染详情数据失败:', error);
    detailResults.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #ff0000;">加载失败，请重试</td></tr>';
  }
}

// 渲染倒数2期详情数据
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
      const { statsPeriod, accuracy, backtestMethod, backBuyNumbers } = result;
      
      // 平均正确率已经在搜索阶段计算好
      const averageCorrectRate = accuracy.toFixed(3);
      
      // 获取回测方法中文名称
      let backtestMethodText = '出现最多';
      if (backtestMethod === 'least') {
        backtestMethodText = '出现最少';
      } else if (backtestMethod === 'average') {
        backtestMethodText = '出现平均';
      }
      
      // 格式化后区推荐杀号
      const backBuyNumbersStr = backBuyNumbers.map(num => `<span class="blue-ball">${num}</span>`).join(' ');
      
      // 创建表格行
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${backtestMethodText}</td>
        <td>50期</td>
        <td>${statsPeriod}期</td>
        <td>${averageCorrectRate}%</td>
        <td>${nextPeriod}</td>
        <td>${backBuyNumbersStr}</td>
        <td>
          <button class="btn copy-btn" style="background-color: #4CAF50; color: white; padding: 5px 10px; font-size: 12px;">复制</button>
        </td>
      `;
      
      // 添加复制按钮事件
      const copyBtn = tr.querySelector('.copy-btn');
      copyBtn.addEventListener('click', () => copyToClipboard(backBuyNumbers));
      
      detailResults.appendChild(tr);
    }
  } catch (error) {
    console.error('渲染详情数据失败:', error);
    detailResults.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #ff0000;">加载失败，请重试</td></tr>';
  }
}

// 渲染倒数3期详情数据
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
      const { statsPeriod, accuracy, backtestMethod, backBuyNumbers } = result;
      
      // 平均正确率已经在搜索阶段计算好
      const averageCorrectRate = accuracy.toFixed(3);
      
      // 获取回测方法中文名称
      let backtestMethodText = '出现最多';
      if (backtestMethod === 'least') {
        backtestMethodText = '出现最少';
      } else if (backtestMethod === 'average') {
        backtestMethodText = '出现平均';
      }
      
      // 格式化后区推荐杀号
      const backBuyNumbersStr = backBuyNumbers.map(num => `<span class="blue-ball">${num}</span>`).join(' ');
      
      // 创建表格行
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${backtestMethodText}</td>
        <td>50期</td>
        <td>${statsPeriod}期</td>
        <td>${averageCorrectRate}%</td>
        <td>${nextPeriod}</td>
        <td>${backBuyNumbersStr}</td>
        <td>
          <button class="btn copy-btn" style="background-color: #4CAF50; color: white; padding: 5px 10px; font-size: 12px;">复制</button>
        </td>
      `;
      
      // 添加复制按钮事件
      const copyBtn = tr.querySelector('.copy-btn');
      copyBtn.addEventListener('click', () => copyToClipboard(backBuyNumbers));
      
      detailResults.appendChild(tr);
    }
  } catch (error) {
    console.error('渲染详情数据失败:', error);
    detailResults.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #ff0000;">加载失败，请重试</td></tr>';
  }
}

// 渲染倒数4期详情数据
async function renderDetailData4(allResults, nextPeriod) {
  const detailResults = document.getElementById('detailResults4');
  
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
      const { statsPeriod, accuracy, backtestMethod, backBuyNumbers } = result;
      
      // 平均正确率已经在搜索阶段计算好
      const averageCorrectRate = accuracy.toFixed(3);
      
      // 获取回测方法中文名称
      let backtestMethodText = '出现最多';
      if (backtestMethod === 'least') {
        backtestMethodText = '出现最少';
      } else if (backtestMethod === 'average') {
        backtestMethodText = '出现平均';
      }
      
      // 格式化后区推荐杀号
      const backBuyNumbersStr = backBuyNumbers.map(num => `<span class="blue-ball">${num}</span>`).join(' ');
      
      // 创建表格行
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${backtestMethodText}</td>
        <td>50期</td>
        <td>${statsPeriod}期</td>
        <td>${averageCorrectRate}%</td>
        <td>${nextPeriod}</td>
        <td>${backBuyNumbersStr}</td>
        <td>
          <button class="btn copy-btn" style="background-color: #4CAF50; color: white; padding: 5px 10px; font-size: 12px;">复制</button>
        </td>
      `;
      
      // 添加复制按钮事件
      const copyBtn = tr.querySelector('.copy-btn');
      copyBtn.addEventListener('click', () => copyToClipboard(backBuyNumbers));
      
      detailResults.appendChild(tr);
    }
  } catch (error) {
    console.error('渲染详情数据失败:', error);
    detailResults.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #ff0000;">加载失败，请重试</td></tr>';
  }
}

// 渲染倒数5期详情数据
async function renderDetailData5(allResults, nextPeriod) {
  const detailResults = document.getElementById('detailResults5');
  
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
      const { statsPeriod, accuracy, backtestMethod, backBuyNumbers } = result;
      
      // 平均正确率已经在搜索阶段计算好
      const averageCorrectRate = accuracy.toFixed(3);
      
      // 获取回测方法中文名称
      let backtestMethodText = '出现最多';
      if (backtestMethod === 'least') {
        backtestMethodText = '出现最少';
      } else if (backtestMethod === 'average') {
        backtestMethodText = '出现平均';
      }
      
      // 格式化后区推荐杀号
      const backBuyNumbersStr = backBuyNumbers.map(num => `<span class="blue-ball">${num}</span>`).join(' ');
      
      // 创建表格行
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${backtestMethodText}</td>
        <td>50期</td>
        <td>${statsPeriod}期</td>
        <td>${averageCorrectRate}%</td>
        <td>${nextPeriod}</td>
        <td>${backBuyNumbersStr}</td>
        <td>
          <button class="btn copy-btn" style="background-color: #4CAF50; color: white; padding: 5px 10px; font-size: 12px;">复制</button>
        </td>
      `;
      
      // 添加复制按钮事件
      const copyBtn = tr.querySelector('.copy-btn');
      copyBtn.addEventListener('click', () => copyToClipboard(backBuyNumbers));
      
      detailResults.appendChild(tr);
    }
  } catch (error) {
    console.error('渲染详情数据失败:', error);
    detailResults.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #ff0000;">加载失败，请重试</td></tr>';
  }
}

// 获取最后一期期号
async function getLastPeriod() {
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

// 获取后区推荐杀号
async function huo_qu_hou_qu_tui_jian_bi_sha_hao(statsPeriod, backtestMethod) {
  try {
    // 调用获取后区推荐杀号的API
    const response = await fetch(`http://localhost:18889/shuang_sha_fen_xi?period=${statsPeriod}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (result.success) {
      // 检查backCombinations是在result.data对象中还是在result对象中
      const backCombinations = (result.data && result.data.backCombinations) || result.backCombinations || [];
      let backBuyNumbers = [];
      
      // 初始化汇总计数数组
      const backTotalCounts = new Array(13).fill(0); // 索引0不使用，1-12对应后区号码
      
      // 遍历后区组合，统计每个号码的出现次数
      backCombinations.forEach(combo => {
        // 安全访问numberCounts属性
        if (combo.numberCounts) {
          for (let i = 1; i <= 12; i++) {
            const count = combo.numberCounts[i] || 0;
            backTotalCounts[i] += count;
          }
        }
      });
      
      // 根据回测方法计算对应的后区推荐买号
      if (backtestMethod === 'most') {
        // 出现最多球：找到backTotalCounts中的最大值对应的号码
        const maxLastCount = Math.max(...backTotalCounts);
        if (maxLastCount > 0) {
          // 找出所有最大值对应的号码
          for (let i = 1; i <= 12; i++) {
            if (backTotalCounts[i] === maxLastCount) {
              backBuyNumbers.push(i);
            }
          }
        } else {
          // 如果所有计数都为0，返回1-12所有号码
          backBuyNumbers = Array.from({length: 12}, (_, i) => i + 1);
        }
      } else if (backtestMethod === 'least') {
        // 出现最少球：找到backTotalCounts中最小值对应的号码
        const minLastCount = Math.min(...backTotalCounts);
        // 找出所有最小值对应的号码
        for (let i = 1; i <= 12; i++) {
          if (backTotalCounts[i] === minLastCount) {
            backBuyNumbers.push(i);
          }
        }
        // 如果没有找到任何号码（所有计数都为0），返回1-12所有号码
        if (backBuyNumbers.length === 0) {
          backBuyNumbers = Array.from({length: 12}, (_, i) => i + 1);
        }
      } else if (backtestMethod === 'average') {
        // 出现平均球：找到backTotalCounts中次数等于平均值的号码
        const nonZeroTotalBackCounts = backTotalCounts.filter(count => count > 0);
        if (nonZeroTotalBackCounts.length > 0) {
          const sumBackCounts = nonZeroTotalBackCounts.reduce((sum, count) => sum + count, 0);
          const averageBackCount = Math.round(sumBackCounts / nonZeroTotalBackCounts.length);
          // 找出所有等于平均值的号码
          for (let i = 1; i <= 12; i++) {
            if (backTotalCounts[i] === averageBackCount) {
              backBuyNumbers.push(i);
            }
          }
        } else {
          // 如果所有计数都为0，返回1-12所有号码
          backBuyNumbers = Array.from({length: 12}, (_, i) => i + 1);
        }
      }
      
      return backBuyNumbers;
    } else {
      alert('接口失败');
      return [];
    }
  } catch (error) {
    console.error('获取后区推荐杀号失败', error);
    return [];
  }
}

// 获取倒数2期后区推荐杀号
async function huo_qu_hou_qu_tui_jian_bi_sha_hao2(statsPeriod, backtestMethod) {
  try {
    // 调用获取倒数2期后区推荐杀号的API
    const response = await fetch(`http://localhost:18889/dao_shu_2_qi_hou_qu_liang_qiu_zu_he?period=${statsPeriod}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (result.success) {
      const analysisData = result.data;
      let backBuyNumbers = [];
      
      // 初始化汇总计数数组
      const backTotalCounts = new Array(13).fill(0); // 索引0不使用，1-12对应后区号码
      
      // 遍历后区组合，统计每个号码的出现次数
      if (analysisData.combinations) {
        analysisData.combinations.forEach(combo => {
          // 累加每个号码的出现次数
          for (let i = 1; i <= 12; i++) {
            const count = combo.numberCounts ? (combo.numberCounts[i] || 0) : 0;
            backTotalCounts[i] += count;
          }
        });
      }
      
      // 根据回测方法计算对应的后区推荐买号
      if (backtestMethod === 'most') {
        // 出现最多球：找到backTotalCounts中的最大值对应的号码
        const maxLastCount = Math.max(...backTotalCounts);
        if (maxLastCount > 0) {
          // 找出所有最大值对应的号码
          for (let i = 1; i <= 12; i++) {
            if (backTotalCounts[i] === maxLastCount) {
              backBuyNumbers.push(i);
            }
          }
        } else {
          // 如果所有计数都为0，返回1-12所有号码
          backBuyNumbers = Array.from({length: 12}, (_, i) => i + 1);
        }
      } else if (backtestMethod === 'least') {
        // 出现最少球：找到backTotalCounts中最小值对应的号码
        const minLastCount = Math.min(...backTotalCounts);
        // 找出所有最小值对应的号码
        for (let i = 1; i <= 12; i++) {
          if (backTotalCounts[i] === minLastCount) {
            backBuyNumbers.push(i);
          }
        }
        // 如果没有找到任何号码（所有计数都为0），返回1-12所有号码
        if (backBuyNumbers.length === 0) {
          backBuyNumbers = Array.from({length: 12}, (_, i) => i + 1);
        }
      } else if (backtestMethod === 'average') {
        // 出现平均球：找到backTotalCounts中次数等于平均值的号码
        const nonZeroTotalBackCounts = backTotalCounts.filter(count => count > 0);
        if (nonZeroTotalBackCounts.length > 0) {
          const sumBackCounts = nonZeroTotalBackCounts.reduce((sum, count) => sum + count, 0);
          const averageBackCount = Math.round(sumBackCounts / nonZeroTotalBackCounts.length);
          // 找出所有等于平均值的号码
          for (let i = 1; i <= 12; i++) {
            if (backTotalCounts[i] === averageBackCount) {
              backBuyNumbers.push(i);
            }
          }
        } else {
          // 如果所有计数都为0，返回1-12所有号码
          backBuyNumbers = Array.from({length: 12}, (_, i) => i + 1);
        }
      }
      
      return backBuyNumbers;
    } else {
      alert('接口失败');
      return [];
    }
  } catch (error) {
    console.error('获取倒数2期后区推荐杀号失败', error);
    return [];
  }
}

// 获取倒数3期后区推荐杀号
async function huo_qu_hou_qu_tui_jian_bi_sha_hao3(statsPeriod, backtestMethod) {
  try {
    // 调用获取倒数3期后区推荐杀号的API
    const response = await fetch(`http://localhost:18889/dao_shu_3_qi_hou_qu_zu_he?period=${statsPeriod}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (result.success) {
      const analysisData = result.data;
      let backBuyNumbers = [];
      
      // 初始化汇总计数数组
      const backTotalCounts = new Array(13).fill(0); // 索引0不使用，1-12对应后区号码
      
      // 遍历后区组合，统计每个号码的出现次数
      if (analysisData.combinations) {
        analysisData.combinations.forEach(combo => {
          // 累加每个号码的出现次数
          for (let i = 1; i <= 12; i++) {
            const count = combo.numberCounts ? (combo.numberCounts[i] || 0) : 0;
            backTotalCounts[i] += count;
          }
        });
      }
      
      // 根据回测方法计算对应的后区推荐买号
      if (backtestMethod === 'most') {
        // 出现最多球：找到backTotalCounts中的最大值对应的号码
        const maxLastCount = Math.max(...backTotalCounts);
        if (maxLastCount > 0) {
          // 找出所有最大值对应的号码
          for (let i = 1; i <= 12; i++) {
            if (backTotalCounts[i] === maxLastCount) {
              backBuyNumbers.push(i);
            }
          }
        } else {
          // 如果所有计数都为0，返回1-12所有号码
          backBuyNumbers = Array.from({length: 12}, (_, i) => i + 1);
        }
      } else if (backtestMethod === 'least') {
        // 出现最少球：找到backTotalCounts中最小值对应的号码
        const minLastCount = Math.min(...backTotalCounts);
        // 找出所有最小值对应的号码
        for (let i = 1; i <= 12; i++) {
          if (backTotalCounts[i] === minLastCount) {
            backBuyNumbers.push(i);
          }
        }
      } else if (backtestMethod === 'average') {
        // 出现平均球：找到backTotalCounts中次数等于平均值的号码
        const nonZeroTotalBackCounts = backTotalCounts.filter(count => count > 0);
        if (nonZeroTotalBackCounts.length > 0) {
          const sumBackCounts = nonZeroTotalBackCounts.reduce((sum, count) => sum + count, 0);
          const averageBackCount = Math.round(sumBackCounts / nonZeroTotalBackCounts.length);
          // 找出所有等于平均值的号码
          for (let i = 1; i <= 12; i++) {
            if (backTotalCounts[i] === averageBackCount) {
              backBuyNumbers.push(i);
            }
          }
        } else {
          // 如果所有计数都为0，返回1-12所有号码
          backBuyNumbers = Array.from({length: 12}, (_, i) => i + 1);
        }
      }
      
      return backBuyNumbers;
    } else {
      alert('接口失败');
      return [];
    }
  } catch (error) {
    console.error('获取倒数3期后区推荐杀号失败', error);
    return [];
  }
}

// 获取倒数4期后区推荐杀号
async function huo_qu_hou_qu_tui_jian_bi_sha_hao4(statsPeriod, backtestMethod) {
  try {
    // 调用获取倒数4期后区推荐杀号的API
    const response = await fetch(`http://localhost:18889/dao_shu_4_qi_hou_qu_zu_he?period=${statsPeriod}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (result.success) {
      const analysisData = result.data;
      let backBuyNumbers = [];
      
      // 初始化汇总计数数组
      const backTotalCounts = new Array(13).fill(0); // 索引0不使用，1-12对应后区号码
      
      // 遍历后区组合，统计每个号码的出现次数
      if (analysisData.combinations) {
        analysisData.combinations.forEach(combo => {
          // 累加每个号码的出现次数
          for (let i = 1; i <= 12; i++) {
            const count = combo.numberCounts ? (combo.numberCounts[i] || 0) : 0;
            backTotalCounts[i] += count;
          }
        });
      }
      
      // 根据回测方法计算对应的后区推荐买号
      if (backtestMethod === 'most') {
        // 出现最多球：找到backTotalCounts中的最大值对应的号码
        const maxLastCount = Math.max(...backTotalCounts);
        if (maxLastCount > 0) {
          // 找出所有最大值对应的号码
          for (let i = 1; i <= 12; i++) {
            if (backTotalCounts[i] === maxLastCount) {
              backBuyNumbers.push(i);
            }
          }
        } else {
          // 如果所有计数都为0，返回1-12所有号码
          backBuyNumbers = Array.from({length: 12}, (_, i) => i + 1);
        }
      } else if (backtestMethod === 'least') {
        // 出现最少球：找到backTotalCounts中最小值对应的号码
        const minLastCount = Math.min(...backTotalCounts);
        // 找出所有最小值对应的号码
        for (let i = 1; i <= 12; i++) {
          if (backTotalCounts[i] === minLastCount) {
            backBuyNumbers.push(i);
          }
        }
      } else if (backtestMethod === 'average') {
        // 出现平均球：找到backTotalCounts中次数等于平均值的号码
        const nonZeroTotalBackCounts = backTotalCounts.filter(count => count > 0);
        if (nonZeroTotalBackCounts.length > 0) {
          const sumBackCounts = nonZeroTotalBackCounts.reduce((sum, count) => sum + count, 0);
          const averageBackCount = Math.round(sumBackCounts / nonZeroTotalBackCounts.length);
          // 找出所有等于平均值的号码
          for (let i = 1; i <= 12; i++) {
            if (backTotalCounts[i] === averageBackCount) {
              backBuyNumbers.push(i);
            }
          }
        } else {
          // 如果所有计数都为0，返回1-12所有号码
          backBuyNumbers = Array.from({length: 12}, (_, i) => i + 1);
        }
      }
      
      return backBuyNumbers;
    } else {
      alert('接口失败');
      return [];
    }
  } catch (error) {
    console.error('获取倒数4期后区推荐杀号失败', error);
    return [];
  }
}

// 获取倒数5期后区推荐杀号
async function huo_qu_hou_qu_tui_jian_bi_sha_hao5(statsPeriod, backtestMethod) {
  try {
    // 调用获取倒数5期后区推荐杀号的API
    const response = await fetch(`http://localhost:18889/dao_shu_5_qi_hou_qu_zu_he?period=${statsPeriod}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (result.success) {
      const analysisData = result.data;
      let backBuyNumbers = [];
      
      // 初始化汇总计数数组
      const backTotalCounts = new Array(13).fill(0); // 索引0不使用，1-12对应后区号码
      
      // 遍历后区组合，统计每个号码的出现次数
      if (analysisData.combinations) {
        analysisData.combinations.forEach(combo => {
          // 累加每个号码的出现次数
          for (let i = 1; i <= 12; i++) {
            const count = combo.numberCounts ? (combo.numberCounts[i] || 0) : 0;
            backTotalCounts[i] += count;
          }
        });
      }
      
      // 根据回测方法计算对应的后区推荐买号
      if (backtestMethod === 'most') {
        // 出现最多球：找到backTotalCounts中的最大值对应的号码
        const maxLastCount = Math.max(...backTotalCounts);
        if (maxLastCount > 0) {
          // 找出所有最大值对应的号码
          for (let i = 1; i <= 12; i++) {
            if (backTotalCounts[i] === maxLastCount) {
              backBuyNumbers.push(i);
            }
          }
        } else {
          // 如果所有计数都为0，返回1-12所有号码
          backBuyNumbers = Array.from({length: 12}, (_, i) => i + 1);
        }
      } else if (backtestMethod === 'least') {
        // 出现最少球：找到backTotalCounts中最小值对应的号码
        const minLastCount = Math.min(...backTotalCounts);
        // 找出所有最小值对应的号码
        for (let i = 1; i <= 12; i++) {
          if (backTotalCounts[i] === minLastCount) {
            backBuyNumbers.push(i);
          }
        }
      } else if (backtestMethod === 'average') {
        // 出现平均球：找到backTotalCounts中次数等于平均值的号码
        const nonZeroTotalBackCounts = backTotalCounts.filter(count => count > 0);
        if (nonZeroTotalBackCounts.length > 0) {
          const sumBackCounts = nonZeroTotalBackCounts.reduce((sum, count) => sum + count, 0);
          const averageBackCount = Math.round(sumBackCounts / nonZeroTotalBackCounts.length);
          // 找出所有等于平均值的号码
          for (let i = 1; i <= 12; i++) {
            if (backTotalCounts[i] === averageBackCount) {
              backBuyNumbers.push(i);
            }
          }
        } else {
          // 如果所有计数都为0，返回1-12所有号码
          backBuyNumbers = Array.from({length: 12}, (_, i) => i + 1);
        }
      }
      
      return backBuyNumbers;
    } else {
      alert('接口失败');
      return [];
    }
  } catch (error) {
    console.error('获取倒数5期后区推荐杀号失败', error);
    return [];
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

// 执行搜索并显示进度
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
    // 禁用保存回测结果按钮
    const saveBacktestBtn = document.getElementById('saveBacktestBtn');
    if (saveBacktestBtn) {
      saveBacktestBtn.disabled = true;
    }
    
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
    const lastPeriod = await getLastPeriod();
    const nextPeriod = lastPeriod + '期'; // 使用最新一期的期号作为当前期号
    
    // 遍历三种回测方法
    for (const backtestMethod of backtestMethods) {
      const methodName = backtestMethod === 'most' ? '出现最多' : backtestMethod === 'least' ? '出现最少' : '出现平均';
      
      // 更新进度
      await updateProgress(`正在搜索回测方法: ${methodName}...`, 15 + (currentStep / totalSteps) * 60, `搜索回测方法: ${methodName}`);
      currentStep++;
      
      let currentStart = 50; // 从统计50期开始，而不是从1期开始          
      let currentEnd = totalPeriods;
      let allTestResults = [];
      
      // 执行每个阶段的搜索
      for (let stageIndex = 0; stageIndex < searchStages.length; stageIndex++) {
        const stage = searchStages[stageIndex];
        const { step, expansion } = stage;
        
        // 更新进度
        const stageProgress = 15 + (currentStep / totalSteps) * 60;
        await updateProgress(
          `正在进行${methodName}方法的第${stageIndex + 1}阶段搜索（步长：${step}）...`, 
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
          if (isBacktestStopped || window.isStopped) {
            break;
          }
          
          stageCount++;
          // 实时更新进度
          const loopProgress = 15 + ((currentStep - 1 + (stageCount / stageTotal)) / totalSteps) * 60;
          await updateProgress(
            `正在测试统计期${i}...`, 
            loopProgress, 
            `测试期数: ${i}，进度 ${stageCount}/${stageTotal}`
          );
          
          const result = await testStatsPeriod(backtestPeriod, i, backtestMethod);
          stageResults.push(result);
          allTestResults.push(result);
        }
        
        // 检查是否需要终止回测
        if (isBacktestStopped || window.isStopped) {
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
        currentStart = Math.max(50, minStatsPeriod - expansion); // 确保不小于50期          
        currentEnd = Math.min(totalPeriods, maxStatsPeriod + expansion);
      }
      
      // 检查是否需要终止回测
      if (isBacktestStopped || window.isStopped) {
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
    
    // 更新进度
    await updateProgress('搜索完成，正在获取后区推荐杀号..', 85, '获取后区推荐杀号');
    currentStep++;
    
    // 为每个结果获取后区推荐杀号
    for (let i = 0; i < allResults.length; i++) {
      // 检查是否需要终止回测
      if (isBacktestStopped || window.isStopped) {
        break;
      }
      
      const result = allResults[i];
      const methodName = result.backtestMethod === 'most' ? '出现最多' : result.backtestMethod === 'least' ? '出现最少' : '出现平均';
      
      // 更新进度
      const buyProgress = 85 + ((i + 1) / allResults.length) * 10;
      await updateProgress(
        `正在获取统计期${result.statsPeriod}期，${methodName}方法的后区推荐杀号..`, 
        buyProgress, 
        `处理结果 ${i + 1}/${allResults.length}`
      );
      
      // 获取后区推荐杀号
      result.backBuyNumbers = await huo_qu_hou_qu_tui_jian_bi_sha_hao(result.statsPeriod, result.backtestMethod);
    }
    
    if (!isBacktestStopped && !window.isStopped) {
      // 数据过滤逻辑
      // 按平均正确率对结果进行分组
      const accuracyGroups = allResults.reduce((groups, result) => {
        const key = result.accuracy;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(result);
        return groups;
      }, {});
      
      // 对每个正确率组，再按推荐买号的值进行分组，只保留一条结果
      const filteredResults = [];
      Object.values(accuracyGroups).forEach(group => {
        // 按推荐买号的值进行分组
        const buyNumberGroups = group.reduce((groups, result) => {
          // 将推荐买号数组转换为字符串作为键
          const key = result.backBuyNumbers.sort((a, b) => a - b).join(',');
          if (!groups[key]) {
            groups[key] = [];
          }
          groups[key].push(result);
          return groups;
        }, {});
        
        // 对于每个推荐买号值组，只保留一条结果
        Object.values(buyNumberGroups).forEach(buyGroup => {
          filteredResults.push(buyGroup[0]);
        });
      });
      
      // 更新进度
      await updateProgress(`找到 ${filteredResults.length} 个平均率最低的统计期，正在渲染结果...`, 98, '渲染结果');
      currentStep++;
      
      // 渲染详情数据，传递过滤后的结果和下一期期号
      await renderDetailData(filteredResults, nextPeriod);
      
      // 更新进度
      await updateProgress('搜索完成，正在隐藏进度条...', 100, '完成');
    }
  } catch (error) {
    console.error('搜索失败:', error);
    detailResults.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #ff0000;">搜索失败，请重试</td></tr>';
  } finally {
    // 恢复按钮状态
    startBacktestBtn.style.display = 'inline-block';
    stopBacktestBtn.style.display = 'none';
    
    // 启用保存回测结果按钮
    const saveBacktestBtn = document.getElementById('saveBacktestBtn');
    if (saveBacktestBtn) {
      saveBacktestBtn.disabled = false;
    }
    
    // 刷新推荐杀号统计图表
    if (!isBacktestStopped && !window.isStopped) {
      await refreshBuyNumberChart();
    }
    
    // 隐藏进度条
    await new Promise(resolve => {
      setTimeout(() => {
        progressDiv.style.display = 'none';
        resolve();
      }, 500);
    });
  }
}

// 刷新推荐杀号统计图表
async function refreshBuyNumberChart() {
  try {
    console.log('刷新推荐杀号统计图表');
    // 这里可以添加实际的图表刷新逻辑
  } catch (error) {
    console.error('刷新图表失败:', error);
  }
}

// 开始所有回测
async function startAllBacktest() {
  try {
    // 禁用保存回测结果按钮
    const saveBacktestBtn = document.getElementById('saveBacktestBtn');
    if (saveBacktestBtn) {
      saveBacktestBtn.disabled = true;
    }
    
    // 依次执行所有回测
    console.log('开始执行所有回测...');
    
    // 执行最近期回测
    await performSearch();
    await refreshBuyNumberChart();
    
    // 执行倒数2期回测
    await performSearch2();
    await refreshBuyNumberChart();
    
    // 执行倒数3期回测
    await performSearch3();
    await refreshBuyNumberChart();
    
    // 执行倒数4期回测
    await performSearch4();
    await refreshBuyNumberChart();
    
    // 执行倒数5期回测
    await performSearch5();
    await refreshBuyNumberChart();
    
    console.log('所有回测执行完成');
  } catch (error) {
    console.error('执行所有回测失败:', error);
  } finally {
    // 启用保存回测结果按钮
    const saveBacktestBtn = document.getElementById('saveBacktestBtn');
    if (saveBacktestBtn) {
      saveBacktestBtn.disabled = false;
    }
  }
}

// 保存回测结果到数据库
async function saveBacktestResults() {
  try {
    console.log('保存回测结果到数据库');
    // 这里可以添加实际的保存逻辑
    alert('回测结果已保存到数据库');
  } catch (error) {
    console.error('保存回测结果失败:', error);
    alert('保存回测结果失败');
  }
}

// 从数据库加载回测结果
async function loadBacktestResults() {
  try {
    console.log('从数据库加载回测结果');
    // 这里可以添加实际的加载逻辑
    alert('回测结果已从数据库加载');
  } catch (error) {
    console.error('加载回测结果失败:', error);
    alert('加载回测结果失败');
  }
}

// 执行倒数2期搜索并显示进度
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
    // 禁用保存回测结果按钮
    const saveBacktestBtn = document.getElementById('saveBacktestBtn');
    if (saveBacktestBtn) {
      saveBacktestBtn.disabled = true;
    }
    
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
    const lastPeriod = await getLastPeriod();
    const nextPeriod = lastPeriod + '期'; // 使用最新一期的期号作为当前期号
    
    // 遍历三种回测方法
    for (const backtestMethod of backtestMethods) {
      const methodName = backtestMethod === 'most' ? '出现最多' : backtestMethod === 'least' ? '出现最少' : '出现平均';
      
      // 更新进度
      await updateProgress(`正在搜索回测方法: ${methodName}...`, 15 + (currentStep / totalSteps) * 60, `搜索回测方法: ${methodName}`);
      currentStep++;
      
      let currentStart = 50; // 从统计50期开始，而不是从1期开始          
      let currentEnd = totalPeriods;
      let allTestResults = [];
      
      // 执行每个阶段的搜索
      for (let stageIndex = 0; stageIndex < searchStages.length; stageIndex++) {
        const stage = searchStages[stageIndex];
        const { step, expansion } = stage;
        
        // 更新进度
        const stageProgress = 15 + (currentStep / totalSteps) * 60;
        await updateProgress(
          `正在进行${methodName}方法的第${stageIndex + 1}阶段搜索（步长：${step}）...`, 
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
          if (isBacktestStopped || window.isStopped) {
            break;
          }
          
          stageCount++;
          // 实时更新进度
          const loopProgress = 15 + ((currentStep - 1 + (stageCount / stageTotal)) / totalSteps) * 60;
          await updateProgress(
            `正在测试统计期${i}...`, 
            loopProgress, 
            `测试期数: ${i}，进度 ${stageCount}/${stageTotal}`
          );
          
          const result = await testStatsPeriod2(backtestPeriod, i, backtestMethod);
          stageResults.push(result);
          allTestResults.push(result);
        }
        
        // 检查是否需要终止回测
        if (isBacktestStopped || window.isStopped) {
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
        currentStart = Math.max(50, minStatsPeriod - expansion); // 确保不小于50期          
        currentEnd = Math.min(totalPeriods, maxStatsPeriod + expansion);
      }
      
      // 检查是否需要终止回测
      if (isBacktestStopped || window.isStopped) {
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
    
    // 更新进度
    await updateProgress('搜索完成，正在获取后区推荐杀号..', 85, '获取后区推荐杀号');
    currentStep++;
    
    // 为每个结果获取后区推荐杀号
    for (let i = 0; i < allResults.length; i++) {
      // 检查是否需要终止回测
      if (isBacktestStopped || window.isStopped) {
        break;
      }
      
      const result = allResults[i];
      const methodName = result.backtestMethod === 'most' ? '出现最多' : result.backtestMethod === 'least' ? '出现最少' : '出现平均';
      
      // 更新进度
      const buyProgress = 85 + ((i + 1) / allResults.length) * 10;
      await updateProgress(
        `正在获取统计期${result.statsPeriod}期，${methodName}方法的后区推荐杀号..`, 
        buyProgress, 
        `处理结果 ${i + 1}/${allResults.length}`
      );
      
      // 获取后区推荐杀号
      result.backBuyNumbers = await huo_qu_hou_qu_tui_jian_bi_sha_hao2(result.statsPeriod, result.backtestMethod);
    }
    
    if (!isBacktestStopped && !window.isStopped) {
      // 数据过滤逻辑
      // 按平均正确率对结果进行分组
      const accuracyGroups = allResults.reduce((groups, result) => {
        const key = result.accuracy;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(result);
        return groups;
      }, {});
      
      // 对每个正确率组，再按推荐买号的值进行分组，只保留一条结果
      const filteredResults = [];
      Object.values(accuracyGroups).forEach(group => {
        // 按推荐买号的值进行分组
        const buyNumberGroups = group.reduce((groups, result) => {
          // 将推荐买号数组转换为字符串作为键
          const key = result.backBuyNumbers.sort((a, b) => a - b).join(',');
          if (!groups[key]) {
            groups[key] = [];
          }
          groups[key].push(result);
          return groups;
        }, {});
        
        // 对于每个推荐买号值组，只保留一条结果
        Object.values(buyNumberGroups).forEach(buyGroup => {
          filteredResults.push(buyGroup[0]);
        });
      });
      
      // 更新进度
      await updateProgress(`找到 ${filteredResults.length} 个平均率最低的统计期，正在渲染结果...`, 98, '渲染结果');
      currentStep++;
      
      // 渲染详情数据，传递过滤后的结果和下一期期号
      await renderDetailData2(filteredResults, nextPeriod);
      
      // 更新进度
      await updateProgress('搜索完成，正在隐藏进度条...', 100, '完成');
    }
  } catch (error) {
    console.error('搜索失败:', error);
    detailResults.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #ff0000;">搜索失败，请重试</td></tr>';
  } finally {
    // 恢复按钮状态
    startBacktestBtn.style.display = 'inline-block';
    stopBacktestBtn.style.display = 'none';
    
    // 启用保存回测结果按钮
    const saveBacktestBtn = document.getElementById('saveBacktestBtn');
    if (saveBacktestBtn) {
      saveBacktestBtn.disabled = false;
    }
    
    // 刷新推荐杀号统计图表
    if (!isBacktestStopped && !window.isStopped) {
      await refreshBuyNumberChart();
    }
    
    // 隐藏进度条
    await new Promise(resolve => {
      setTimeout(() => {
        progressDiv.style.display = 'none';
        resolve();
      }, 500);
    });
  }
}

// 执行倒数4期搜索并显示进度
async function performSearch4() {
  const progressDiv = document.getElementById('progress4');
  const progressText = document.getElementById('progressText4');
  const progressBar = document.getElementById('progressBar4');
  const progressPercentage = document.getElementById('progressPercentage4');
  const currentPhase = document.getElementById('currentPhase4');
  const detailResults = document.getElementById('detailResults4');
  const startBacktestBtn = document.getElementById('startBacktestBtn4');
  const stopBacktestBtn = document.getElementById('stopBacktestBtn4');
  
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
    // 禁用保存回测结果按钮
    const saveBacktestBtn = document.getElementById('saveBacktestBtn');
    if (saveBacktestBtn) {
      saveBacktestBtn.disabled = true;
    }
    
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
    const lastPeriod = await getLastPeriod();
    const nextPeriod = lastPeriod + '期'; // 使用最新一期的期号作为当前期号
    
    // 遍历三种回测方法
    for (const backtestMethod of backtestMethods) {
      const methodName = backtestMethod === 'most' ? '出现最多' : backtestMethod === 'least' ? '出现最少' : '出现平均';
      
      // 更新进度
      await updateProgress(`正在搜索回测方法: ${methodName}...`, 15 + (currentStep / totalSteps) * 60, `搜索回测方法: ${methodName}`);
      currentStep++;
      
      let currentStart = 50; // 从统计50期开始，而不是从1期开始          
      let currentEnd = totalPeriods;
      let allTestResults = [];
      
      // 执行每个阶段的搜索
      for (let stageIndex = 0; stageIndex < searchStages.length; stageIndex++) {
        const stage = searchStages[stageIndex];
        const { step, expansion } = stage;
        
        // 更新进度
        const stageProgress = 15 + (currentStep / totalSteps) * 60;
        await updateProgress(
          `正在进行${methodName}方法的第${stageIndex + 1}阶段搜索（步长：${step}）...`, 
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
          if (isBacktestStopped || window.isStopped) {
            break;
          }
          
          stageCount++;
          // 实时更新进度
          const loopProgress = 15 + ((currentStep - 1 + (stageCount / stageTotal)) / totalSteps) * 60;
          await updateProgress(
            `正在测试统计期${i}...`, 
            loopProgress, 
            `测试期数: ${i}，进度 ${stageCount}/${stageTotal}`
          );
          
          const result = await testStatsPeriod4(backtestPeriod, i, backtestMethod);
          stageResults.push(result);
          allTestResults.push(result);
        }
        
        // 检查是否需要终止回测
        if (isBacktestStopped || window.isStopped) {
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
        currentStart = Math.max(50, minStatsPeriod - expansion); // 确保不小于50期          
        currentEnd = Math.min(totalPeriods, maxStatsPeriod + expansion);
      }
      
      // 检查是否需要终止回测
      if (isBacktestStopped || window.isStopped) {
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
    
    // 更新进度
    await updateProgress('搜索完成，正在获取后区推荐杀号..', 85, '获取后区推荐杀号');
    currentStep++;
    
    // 为每个结果获取后区推荐杀号
    for (let i = 0; i < allResults.length; i++) {
      // 检查是否需要终止回测
      if (isBacktestStopped || window.isStopped) {
        break;
      }
      
      const result = allResults[i];
      const methodName = result.backtestMethod === 'most' ? '出现最多' : result.backtestMethod === 'least' ? '出现最少' : '出现平均';
      
      // 更新进度
      const buyProgress = 85 + ((i + 1) / allResults.length) * 10;
      await updateProgress(
        `正在获取统计期${result.statsPeriod}期，${methodName}方法的后区推荐杀号..`, 
        buyProgress, 
        `处理结果 ${i + 1}/${allResults.length}`
      );
      
      // 获取后区推荐杀号
      result.backBuyNumbers = await huo_qu_hou_qu_tui_jian_bi_sha_hao4(result.statsPeriod, result.backtestMethod);
    }
    
    if (!isBacktestStopped && !window.isStopped) {
      // 数据过滤逻辑
      // 按平均正确率对结果进行分组
      const accuracyGroups = allResults.reduce((groups, result) => {
        const key = result.accuracy;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(result);
        return groups;
      }, {});
      
      // 对每个正确率组，再按推荐买号的值进行分组，只保留一条结果
      const filteredResults = [];
      Object.values(accuracyGroups).forEach(group => {
        // 按推荐买号的值进行分组
        const buyNumberGroups = group.reduce((groups, result) => {
          // 将推荐买号数组转换为字符串作为键
          const key = result.backBuyNumbers.sort((a, b) => a - b).join(',');
          if (!groups[key]) {
            groups[key] = [];
          }
          groups[key].push(result);
          return groups;
        }, {});
        
        // 对于每个推荐买号值组，只保留一条结果
        Object.values(buyNumberGroups).forEach(buyGroup => {
          filteredResults.push(buyGroup[0]);
        });
      });
      
      // 更新进度
      await updateProgress(`找到 ${filteredResults.length} 个平均率最低的统计期，正在渲染结果...`, 98, '渲染结果');
      currentStep++;
      
      // 渲染详情数据，传递过滤后的结果和下一期期号
      await renderDetailData4(filteredResults, nextPeriod);
      
      // 更新进度
      await updateProgress('搜索完成，正在隐藏进度条...', 100, '完成');
    }
  } catch (error) {
    console.error('搜索失败:', error);
    detailResults.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #ff0000;">搜索失败，请重试</td></tr>';
  } finally {
    // 恢复按钮状态
    startBacktestBtn.style.display = 'inline-block';
    stopBacktestBtn.style.display = 'none';
    
    // 启用保存回测结果按钮
    const saveBacktestBtn = document.getElementById('saveBacktestBtn');
    if (saveBacktestBtn) {
      saveBacktestBtn.disabled = false;
    }
    
    // 刷新推荐杀号统计图表
    if (!isBacktestStopped && !window.isStopped) {
      await refreshBuyNumberChart();
    }
    
    // 隐藏进度条
    await new Promise(resolve => {
      setTimeout(() => {
        progressDiv.style.display = 'none';
        resolve();
      }, 500);
    });
  }
}

// 执行倒数5期搜索并显示进度
async function performSearch5() {
  const progressDiv = document.getElementById('progress5');
  const progressText = document.getElementById('progressText5');
  const progressBar = document.getElementById('progressBar5');
  const progressPercentage = document.getElementById('progressPercentage5');
  const currentPhase = document.getElementById('currentPhase5');
  const detailResults = document.getElementById('detailResults5');
  const startBacktestBtn = document.getElementById('startBacktestBtn5');
  const stopBacktestBtn = document.getElementById('stopBacktestBtn5');
  
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
    // 禁用保存回测结果按钮
    const saveBacktestBtn = document.getElementById('saveBacktestBtn');
    if (saveBacktestBtn) {
      saveBacktestBtn.disabled = true;
    }
    
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
    const lastPeriod = await getLastPeriod();
    const nextPeriod = lastPeriod + '期'; // 使用最新一期的期号作为当前期号
    
    // 遍历三种回测方法
    for (const backtestMethod of backtestMethods) {
      const methodName = backtestMethod === 'most' ? '出现最多' : backtestMethod === 'least' ? '出现最少' : '出现平均';
      
      // 更新进度
      await updateProgress(`正在搜索回测方法: ${methodName}...`, 15 + (currentStep / totalSteps) * 60, `搜索回测方法: ${methodName}`);
      currentStep++;
      
      let currentStart = 50; // 从统计50期开始，而不是从1期开始          
      let currentEnd = totalPeriods;
      let allTestResults = [];
      
      // 执行每个阶段的搜索
      for (let stageIndex = 0; stageIndex < searchStages.length; stageIndex++) {
        const stage = searchStages[stageIndex];
        const { step, expansion } = stage;
        
        // 更新进度
        const stageProgress = 15 + (currentStep / totalSteps) * 60;
        await updateProgress(
          `正在进行${methodName}方法的第${stageIndex + 1}阶段搜索（步长：${step}）...`, 
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
          if (isBacktestStopped || window.isStopped) {
            break;
          }
          
          stageCount++;
          // 实时更新进度
          const loopProgress = 15 + ((currentStep - 1 + (stageCount / stageTotal)) / totalSteps) * 60;
          await updateProgress(
            `正在测试统计期${i}...`, 
            loopProgress, 
            `测试期数: ${i}，进度 ${stageCount}/${stageTotal}`
          );
          
          const result = await testStatsPeriod5(backtestPeriod, i, backtestMethod);
          stageResults.push(result);
          allTestResults.push(result);
        }
        
        // 检查是否需要终止回测
        if (isBacktestStopped || window.isStopped) {
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
        currentStart = Math.max(50, minStatsPeriod - expansion); // 确保不小于50期          
        currentEnd = Math.min(totalPeriods, maxStatsPeriod + expansion);
      }
      
      // 检查是否需要终止回测
      if (isBacktestStopped || window.isStopped) {
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
    
    // 更新进度
    await updateProgress('搜索完成，正在获取后区推荐杀号..', 85, '获取后区推荐杀号');
    currentStep++;
    
    // 为每个结果获取后区推荐杀号
    for (let i = 0; i < allResults.length; i++) {
      // 检查是否需要终止回测
      if (isBacktestStopped || window.isStopped) {
        break;
      }
      
      const result = allResults[i];
      const methodName = result.backtestMethod === 'most' ? '出现最多' : result.backtestMethod === 'least' ? '出现最少' : '出现平均';
      
      // 更新进度
      const buyProgress = 85 + ((i + 1) / allResults.length) * 10;
      await updateProgress(
        `正在获取统计期${result.statsPeriod}期，${methodName}方法的后区推荐杀号..`, 
        buyProgress, 
        `处理结果 ${i + 1}/${allResults.length}`
      );
      
      // 获取后区推荐杀号
      result.backBuyNumbers = await huo_qu_hou_qu_tui_jian_bi_sha_hao5(result.statsPeriod, result.backtestMethod);
    }
    
    if (!isBacktestStopped && !window.isStopped) {
      // 数据过滤逻辑
      // 按平均正确率对结果进行分组
      const accuracyGroups = allResults.reduce((groups, result) => {
        const key = result.accuracy;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(result);
        return groups;
      }, {});
      
      // 对每个正确率组，再按推荐买号的值进行分组，只保留一条结果
      const filteredResults = [];
      Object.values(accuracyGroups).forEach(group => {
        // 按推荐买号的值进行分组
        const buyNumberGroups = group.reduce((groups, result) => {
          // 将推荐买号数组转换为字符串作为键
          const key = result.backBuyNumbers.sort((a, b) => a - b).join(',');
          if (!groups[key]) {
            groups[key] = [];
          }
          groups[key].push(result);
          return groups;
        }, {});
        
        // 对于每个推荐买号值组，只保留一条结果
        Object.values(buyNumberGroups).forEach(buyGroup => {
          filteredResults.push(buyGroup[0]);
        });
      });
      
      // 更新进度
      await updateProgress(`找到 ${filteredResults.length} 个平均率最低的统计期，正在渲染结果...`, 98, '渲染结果');
      currentStep++;
      
      // 渲染详情数据，传递过滤后的结果和下一期期号
      await renderDetailData5(filteredResults, nextPeriod);
      
      // 更新进度
      await updateProgress('搜索完成，正在隐藏进度条...', 100, '完成');
    }
  } catch (error) {
    console.error('搜索失败:', error);
    detailResults.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #ff0000;">搜索失败，请重试</td></tr>';
  } finally {
    // 恢复按钮状态
    startBacktestBtn.style.display = 'inline-block';
    stopBacktestBtn.style.display = 'none';
    
    // 启用保存回测结果按钮
    const saveBacktestBtn = document.getElementById('saveBacktestBtn');
    if (saveBacktestBtn) {
      saveBacktestBtn.disabled = false;
    }
    
    // 刷新推荐杀号统计图表
    if (!isBacktestStopped && !window.isStopped) {
      await refreshBuyNumberChart();
    }
    
    // 隐藏进度条
    await new Promise(resolve => {
      setTimeout(() => {
        progressDiv.style.display = 'none';
        resolve();
      }, 500);
    });
  }
}

// 执行倒数3期搜索并显示进度
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
    // 禁用保存回测结果按钮
    const saveBacktestBtn = document.getElementById('saveBacktestBtn');
    if (saveBacktestBtn) {
      saveBacktestBtn.disabled = true;
    }
    
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
    const lastPeriod = await getLastPeriod();
    const nextPeriod = lastPeriod + '期'; // 使用最新一期的期号作为当前期号
    
    // 遍历三种回测方法
    for (const backtestMethod of backtestMethods) {
      const methodName = backtestMethod === 'most' ? '出现最多' : backtestMethod === 'least' ? '出现最少' : '出现平均';
      
      // 更新进度
      await updateProgress(`正在搜索回测方法: ${methodName}...`, 15 + (currentStep / totalSteps) * 60, `搜索回测方法: ${methodName}`);
      currentStep++;
      
      let currentStart = 50; // 从统计50期开始，而不是从1期开始          
      let currentEnd = totalPeriods;
      let allTestResults = [];
      
      // 执行每个阶段的搜索
      for (let stageIndex = 0; stageIndex < searchStages.length; stageIndex++) {
        const stage = searchStages[stageIndex];
        const { step, expansion } = stage;
        
        // 更新进度
        const stageProgress = 15 + (currentStep / totalSteps) * 60;
        await updateProgress(
          `正在进行${methodName}方法的第${stageIndex + 1}阶段搜索（步长：${step}）...`, 
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
          if (isBacktestStopped || window.isStopped) {
            break;
          }
          
          stageCount++;
          // 实时更新进度
          const loopProgress = 15 + ((currentStep - 1 + (stageCount / stageTotal)) / totalSteps) * 60;
          await updateProgress(
            `正在测试统计期${i}...`, 
            loopProgress, 
            `测试期数: ${i}，进度 ${stageCount}/${stageTotal}`
          );
          
          const result = await testStatsPeriod3(backtestPeriod, i, backtestMethod);
          stageResults.push(result);
          allTestResults.push(result);
        }
        
        // 检查是否需要终止回测
        if (isBacktestStopped || window.isStopped) {
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
        currentStart = Math.max(50, minStatsPeriod - expansion); // 确保不小于50期          
        currentEnd = Math.min(totalPeriods, maxStatsPeriod + expansion);
      }
      
      // 检查是否需要终止回测
      if (isBacktestStopped || window.isStopped) {
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
    
    // 更新进度
    await updateProgress('搜索完成，正在获取后区推荐杀号..', 85, '获取后区推荐杀号');
    currentStep++;
    
    // 为每个结果获取后区推荐杀号
    for (let i = 0; i < allResults.length; i++) {
      // 检查是否需要终止回测
      if (isBacktestStopped || window.isStopped) {
        break;
      }
      
      const result = allResults[i];
      const methodName = result.backtestMethod === 'most' ? '出现最多' : result.backtestMethod === 'least' ? '出现最少' : '出现平均';
      
      // 更新进度
      const buyProgress = 85 + ((i + 1) / allResults.length) * 10;
      await updateProgress(
        `正在获取统计期${result.statsPeriod}期，${methodName}方法的后区推荐杀号..`, 
        buyProgress, 
        `处理结果 ${i + 1}/${allResults.length}`
      );
      
      // 获取后区推荐杀号
      result.backBuyNumbers = await huo_qu_hou_qu_tui_jian_bi_sha_hao3(result.statsPeriod, result.backtestMethod);
    }
    
    if (!isBacktestStopped && !window.isStopped) {
      // 数据过滤逻辑
      // 按平均正确率对结果进行分组
      const accuracyGroups = allResults.reduce((groups, result) => {
        const key = result.accuracy;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(result);
        return groups;
      }, {});
      
      // 对每个正确率组，再按推荐买号的值进行分组，只保留一条结果
      const filteredResults = [];
      Object.values(accuracyGroups).forEach(group => {
        // 按推荐买号的值进行分组
        const buyNumberGroups = group.reduce((groups, result) => {
          // 将推荐买号数组转换为字符串作为键
          const key = result.backBuyNumbers.sort((a, b) => a - b).join(',');
          if (!groups[key]) {
            groups[key] = [];
          }
          groups[key].push(result);
          return groups;
        }, {});
        
        // 对于每个推荐买号值组，只保留一条结果
        Object.values(buyNumberGroups).forEach(buyGroup => {
          filteredResults.push(buyGroup[0]);
        });
      });
      
      // 更新进度
      await updateProgress(`找到 ${filteredResults.length} 个平均率最低的统计期，正在渲染结果...`, 98, '渲染结果');
      currentStep++;
      
      // 渲染详情数据，传递过滤后的结果和下一期期号
      await renderDetailData3(filteredResults, nextPeriod);
      
      // 更新进度
      await updateProgress('搜索完成，正在隐藏进度条...', 100, '完成');
    }
  } catch (error) {
    console.error('搜索失败:', error);
    detailResults.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #ff0000;">搜索失败，请重试</td></tr>';
  } finally {
    // 恢复按钮状态
    startBacktestBtn.style.display = 'inline-block';
    stopBacktestBtn.style.display = 'none';
    
    // 启用保存回测结果按钮
    const saveBacktestBtn = document.getElementById('saveBacktestBtn');
    if (saveBacktestBtn) {
      saveBacktestBtn.disabled = false;
    }
    
    // 刷新推荐杀号统计图表
    if (!isBacktestStopped && !window.isStopped) {
      await refreshBuyNumberChart();
    }
    
    // 隐藏进度条
    await new Promise(resolve => {
      setTimeout(() => {
        progressDiv.style.display = 'none';
        resolve();
      }, 500);
    });
  }
}