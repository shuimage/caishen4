// 主题切换功能 - 仅从localStorage读取设置，不在此页面提供切换按钮
document.addEventListener('DOMContentLoaded', function() {
  // 从localStorage读取主题设置
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark-theme');
  }
});

// 定义全局变量
let periodValue = '100'; // 默认统计期数
let backtestPeriod = '20'; // 默认回测期数
let latestDrawInfo = null;
let backtestResults = {}; // 存储所有回测结果

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
    latestDrawInfo = latestDraw;
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

// 总回测函数
async function performAllBacktests() {
  // 回测函数执行顺序
  const backtestFunctions = [
    { name: '最新一期两球组合', func: performSearchNewest },
    { name: '倒数2期两球组合', func: performSearchSecondLast },
    { name: '倒数3期两球组合', func: performSearchThirdLast },
    { name: '倒数4期两球组合', func: performSearchFourthLast },
    { name: '倒数5期两球组合', func: performSearchFifthLast }
  ];
  
  // 显示总进度条
  const totalProgressElement = document.getElementById('totalProgress');
  if (totalProgressElement) {
    totalProgressElement.style.display = 'block';
  }
  
  // 初始化总进度
  let totalProgress = 0;
  const totalSteps = backtestFunctions.length;
  
  // 更新总进度
  function updateTotalProgress(currentFunctionName, stepProgress) {
    const currentStep = backtestFunctions.findIndex(func => func.name === currentFunctionName) + 1;
    const stepWeight = 1 / totalSteps;
    const weightedProgress = (currentStep - 1) * stepWeight + stepProgress * stepWeight;
    totalProgress = weightedProgress;
    
    const totalProgressBar = document.getElementById('totalProgressBar');
    const totalProgressPercentage = document.getElementById('totalProgressPercentage');
    const totalProgressText = document.getElementById('totalProgressText');
    const totalCurrentPhase = document.getElementById('totalCurrentPhase');
    
    if (totalProgressBar) {
      totalProgressBar.style.width = `${totalProgress * 100}%`;
    }
    if (totalProgressPercentage) {
      totalProgressPercentage.textContent = `${Math.round(totalProgress * 100)}%`;
    }
    if (totalProgressText) {
      totalProgressText.textContent = `正在执行: ${currentFunctionName}`;
    }
    if (totalCurrentPhase) {
      totalCurrentPhase.textContent = `执行中...`;
    }
  }
  
  // 开始执行所有回测函数
  for (const { name, func } of backtestFunctions) {
    updateTotalProgress(name, 0);
    try {
      await func();
      updateTotalProgress(name, 1);
    } catch (error) {
      console.error(`执行${name}回测失败`, error);
      updateTotalProgress(name, 1); // 即使失败也标记为完成，继续执行下一个
    }
  }
  
  // 回测完成
  const totalProgressText = document.getElementById('totalProgressText');
  const totalCurrentPhase = document.getElementById('totalCurrentPhase');
  if (totalProgressText) {
    totalProgressText.textContent = '所有回测已完成';
  }
  if (totalCurrentPhase) {
    totalCurrentPhase.textContent = '回测完成';
  }
}

// 回测控制相关事件监听
function setupBacktestControls() {
  // 总回测控制按钮
  const startAllBacktestBtn = document.getElementById('startAllBacktestBtn');
  const stopAllBacktestBtn = document.getElementById('stopAllBacktestBtn');
  
  if (startAllBacktestBtn) {
    startAllBacktestBtn.addEventListener('click', function() {
      performAllBacktests();
      this.style.display = 'none';
      if (stopAllBacktestBtn) {
        stopAllBacktestBtn.style.display = 'inline-block';
      }
    });
  }
  
  if (stopAllBacktestBtn) {
    stopAllBacktestBtn.addEventListener('click', function() {
      // 这里需要实现回测终止逻辑
      this.style.display = 'none';
      if (startAllBacktestBtn) {
        startAllBacktestBtn.style.display = 'inline-block';
      }
    });
  }
  
  // 复制推荐买号按钮
  const copyAllBuyNumbersBtn = document.getElementById('copyAllBuyNumbersBtn');
  if (copyAllBuyNumbersBtn) {
    copyAllBuyNumbersBtn.addEventListener('click', function() {
      // 这里需要实现复制功能
      alert('复制功能开发中');
    });
  }
  
  // 保存回测结果按钮
  const saveBacktestResultsBtn = document.getElementById('saveBacktestResultsBtn');
  if (saveBacktestResultsBtn) {
    saveBacktestResultsBtn.addEventListener('click', function() {
      // 调用保存回测结果功能
      saveBacktestResults();
    });
  }
  
  // 加载回测结果按钮
  const loadBacktestResultsBtn = document.getElementById('loadBacktestResultsBtn');
  if (loadBacktestResultsBtn) {
    loadBacktestResultsBtn.addEventListener('click', function() {
      // 调用加载回测结果功能
      loadBacktestResults();
    });
  }
  
  // 刷新图表按钮
  const refreshChartBtn = document.getElementById('refreshChartBtn');
  if (refreshChartBtn) {
    refreshChartBtn.addEventListener('click', function() {
      // 这里需要实现刷新图表功能
      alert('刷新图表功能开发中');
    });
  }
  
  // 各个回测模块的控制按钮
  const backtestModules = [
    { prefix: 'Newest', name: '最新一期两球组合' },
    { prefix: 'SecondLast', name: '倒数2期两球组合' },
    { prefix: 'ThirdLast', name: '倒数3期两球组合' },
    { prefix: 'FourthLast', name: '倒数4期两球组合' },
    { prefix: 'FifthLast', name: '倒数5期两球组合' },
    { prefix: 'NearTwoPeriods', name: '近两期两球组合' },
    { prefix: 'ThreeBall', name: '最新一期三球组合' },
    { prefix: 'SecondLastThreeBall', name: '倒数2期三球组合' },
    { prefix: 'ThirdLastThreeBall', name: '倒数3期三球组合' }
  ];
  
  backtestModules.forEach(module => {
    const startBtn = document.getElementById(`startBacktestBtn${module.prefix}`);
    const stopBtn = document.getElementById(`stopBacktestBtn${module.prefix}`);
    
    if (startBtn) {
      startBtn.addEventListener('click', function() {
        // 这里需要实现对应模块的回测开始逻辑
        if (module.prefix === 'Newest') {
          performSearchNewest();
        } else if (module.prefix === 'SecondLast') {
          performSearchSecondLast();
        } else if (module.prefix === 'ThirdLast') {
          performSearchThirdLast();
        } else if (module.prefix === 'FourthLast') {
          performSearchFourthLast();
        } else if (module.prefix === 'FifthLast') {
          performSearchFifthLast();
        } else if (module.prefix === 'NearTwoPeriods') {
          performSearchNearTwoPeriods();
        } else if (module.prefix === 'ThreeBall') {
          performSearchThreeBall();
        } else if (module.prefix === 'SecondLastThreeBall') {
          performSearchSecondLastThreeBall();
        } else if (module.prefix === 'ThirdLastThreeBall') {
          performSearchThirdLastThreeBall();
        } else {
          alert(`${module.name}回测功能开发中`);
          this.style.display = 'none';
          if (stopBtn) {
            stopBtn.style.display = 'inline-block';
          }
        }
      });
    }
    
    if (stopBtn) {
      stopBtn.addEventListener('click', function() {
        // 这里需要实现对应模块的回测终止逻辑
        this.style.display = 'none';
        if (startBtn) {
          startBtn.style.display = 'inline-block';
        }
      });
    }
  });
}

// 生成前区推荐买号总集
async function generateTotalBuyNumbers() {
  try {
    // 收集所有推荐买号合集的数据
    const numberAccuracyMap = new Map();
    const numberCountMap = new Map();
    
    // 遍历所有推荐买号合集
    const collectionContents = [
      'buyNumbersCollectionContentNewest',
      'buyNumbersCollectionContentSecondLast',
      'buyNumbersCollectionContentThirdLast',
      'buyNumbersCollectionContentFourthLast',
      'buyNumbersCollectionContentFifthLast',
      'buyNumbersCollectionContentNearTwoPeriods',
      'buyNumbersCollectionContentThreeBall',
      'buyNumbersCollectionContentSecondLastThreeBall',
      'buyNumbersCollectionContentThirdLastThreeBall'
    ];
    
    collectionContents.forEach(contentId => {
      const content = document.getElementById(contentId);
      if (content) {
        const numberElements = content.querySelectorAll('[class="red-ball"]');
        numberElements.forEach(ball => {
          const number = parseInt(ball.textContent);
          const accuracyElement = ball.nextElementSibling;
          if (accuracyElement) {
            const accuracyText = accuracyElement.textContent;
            const accuracy = parseFloat(accuracyText.replace('%', ''));
            
            if (numberAccuracyMap.has(number)) {
              numberAccuracyMap.set(number, numberAccuracyMap.get(number) + accuracy);
              numberCountMap.set(number, numberCountMap.get(number) + 1);
            } else {
              numberAccuracyMap.set(number, accuracy);
              numberCountMap.set(number, 1);
            }
          }
        });
      }
    });
    
    // 转换为数组并按累计平均正确率降序排序
    const sortedNumbers = [];
    numberAccuracyMap.forEach((accuracy, number) => {
      const count = numberCountMap.get(number);
      sortedNumbers.push({
        number,
        accuracy,
        count
      });
    });
    
    sortedNumbers.sort((a, b) => b.accuracy - a.accuracy);
    
    // 更新表格
    const tableBody = document.getElementById('totalBuyNumbersTable');
    if (tableBody) {
      if (sortedNumbers.length > 0) {
        tableBody.innerHTML = sortedNumbers.map((item, index) => {
          const rank = index + 1;
          return `
            <tr>
              <td>${rank}</td>
              <td><span class="red-ball">${item.number}</span></td>
              <td>${item.accuracy.toFixed(3)}%</td>
              <td>${item.count}</td>
            </tr>
          `;
        }).join('');
      } else {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #666;">暂无总集数据</td></tr>';
      }
    }
    
    // 更新总集买号展示
    const collectionContent = document.getElementById('totalBuyNumbersCollectionContent');
    if (collectionContent) {
      if (sortedNumbers.length > 0) {
        collectionContent.innerHTML = sortedNumbers.map(item => {
          const accuracyText = item.accuracy.toFixed(3);
          return `<div style="display: flex; align-items: center; gap: 5px;">
            <div class="red-ball">${item.number}</div>
            <div style="font-size: 12px; color: #666;">${accuracyText}%</div>
          </div>`;
        }).join(' ');
      } else {
        collectionContent.innerHTML = '<div style="color: #666;">暂无总集数据</div>';
      }
    }
    
    // 生成图表
    generateTotalBuyNumberChart(sortedNumbers);
    
  } catch (error) {
    console.error('生成前区推荐买号总集失败:', error);
  }
}

// 生成前区推荐买号总集图表
function generateTotalBuyNumberChart(sortedNumbers) {
  const canvas = document.getElementById('totalBuyNumberChart');
  if (!canvas) return;
  
  // 检查当前主题
  const isDarkTheme = document.body.classList.contains('dark-theme');
  
  // 清除之前的图表
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  if (sortedNumbers.length === 0) return;
  
  // 准备数据
  const labels = sortedNumbers.map(item => item.number);
  const data = sortedNumbers.map(item => item.accuracy);
  
  // 绘制简单的柱状图
  const barWidth = canvas.width / sortedNumbers.length * 0.8;
  const maxValue = Math.max(...data);
  const scale = canvas.height * 0.8 / maxValue;
  
  // 根据主题设置颜色
  const barColor = '#4CAF50';
  const textColor = isDarkTheme ? '#ffffff' : '#333333';
  const subTextColor = isDarkTheme ? '#cccccc' : '#666666';
  
  ctx.fillStyle = barColor;
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  
  sortedNumbers.forEach((item, index) => {
    const x = index * (canvas.width / sortedNumbers.length) + barWidth / 2;
    const barHeight = item.accuracy * scale;
    const y = canvas.height - barHeight - 20;
    
    // 绘制柱子
    ctx.fillRect(x - barWidth / 2, y, barWidth, barHeight);
    
    // 绘制球号
    ctx.fillStyle = textColor;
    ctx.fillText(item.number, x, canvas.height - 5);
    
    // 绘制正确率
    ctx.fillStyle = subTextColor;
    ctx.fillText(`${Math.round(item.accuracy)}`, x, y - 5);
  });
  
  // 绘制标题
  ctx.fillStyle = textColor;
  ctx.font = '16px Arial';
  ctx.fillText('前区推荐买号累计平均正确率', canvas.width / 2, 20);
}

// 页面加载完成后执行
window.addEventListener('load', async function() {
  try {
    await main();
    setupBacktestControls();
    
    // 获取并监听回测期数输入框
    const backtestPeriodInput = document.getElementById('backtestPeriod');
    if (backtestPeriodInput) {
      // 初始化回测期数
      backtestPeriod = backtestPeriodInput.value;
      
      // 监听输入框变化
      backtestPeriodInput.addEventListener('change', function() {
        backtestPeriod = this.value;
      });
    }
    
    // 添加刷新总集按钮事件
    const refreshBtn = document.getElementById('refreshTotalBuyNumbersBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', generateTotalBuyNumbers);
    }
  } catch (error) {
    console.error('页面加载失败:', error);
    // 显示友好的错误信息，避免白屏
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.innerHTML = `
        <div style="text-align: center; padding: 50px;">
          <h2>页面加载失败</h2>
          <p>请刷新页面重试</p>
          <button onclick="location.reload()" class="btn back-btn">刷新页面</button>
        </div>
      `;
    }
  }
});

// 以下是各个回测函数的实现，确保它们不会抛出错误

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

// 从后端获取回测数据 - 使用sha_hao_mai_hao_hui_ce_xiang_qing.html的算法
async function huo_qu_sha_hao_mai_hao_hui_ce(backtestPeriod = '50', statsPeriod = '100', backtestMethod = 'most') {
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

// 测试单个统计期值的平均正确率 - 使用sha_hao_mai_hao_hui_ce_xiang_qing.html的算法
async function testStatsPeriod(backtestPeriod, statsPeriod, backtestMethod) {
  try {
    const backtestData = await huo_qu_sha_hao_mai_hao_hui_ce(backtestPeriod, statsPeriod, backtestMethod);
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

// 获取最后一期期号
async function getLastPeriod() {
  try {
    // 调用sql_zui_xin_yi_qi接口获取最新一期开奖信息
    const response = await fetch('http://localhost:18889/sql_zui_xin_yi_qi');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (result.success && result.latestDraw) {
      // 获取最新一期期号，去掉"期"字
      const lastPeriod = result.latestDraw.period;
      return lastPeriod.replace('期', '');
    }
    return '25120';
  } catch (error) {
    console.error('获取最后一期期号失败', error);
    return '25120';
  }
}

// 获取最新一期的期号
async function getLatestPeriod() {
  try {
    // 调用sql_zui_xin_yi_qi接口获取最新一期开奖信息
    const response = await fetch('http://localhost:18889/sql_zui_xin_yi_qi');
    const result = await response.json();
    if (result.success && result.latestDraw && result.latestDraw.period) {
      const latestPeriod = result.latestDraw.period;
      const latestPeriodNum = parseInt(latestPeriod);
      return (latestPeriodNum + 1) + '期';
    }
    return '最新期';
  } catch (error) {
    console.error('获取最新期号失败', error);
    return '最新期';
  }
}

// 获取倒数2期的下下期期号
async function getLatestPeriodSecondLast() {
  try {
    // 调用sql_dao_shu_2_qi接口获取倒数第2期开奖信息
    const response = await fetch('http://localhost:18889/sql_dao_shu_2_qi');
    const result = await response.json();
    if (result.success && result.secondLastDraw && result.secondLastDraw.period) {
      const latestPeriod = result.secondLastDraw.period;
      const latestPeriodNum = parseInt(latestPeriod);
      return (latestPeriodNum + 2) + '期';
    }
    return '最新期';
  } catch (error) {
    console.error('获取最新期号失败', error);
    return '最新期';
  }
}

// 获取前区推荐买号 - 使用与sha_hao_fen_xi.html相同的算法
async function huo_qu_qian_qu_tui_jian_mai_hao(statsPeriod, backtestMethod) {
  try {
    // 调用与sha_hao_fen_xi.html相同的接口获取最新1期两球组合数据
    const response = await fetch(`http://localhost:18889/shuang_sha_fen_xi?period=${statsPeriod}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (result.success) {
      const analysisData = result.data;
      const frontCombinations = analysisData.frontCombinations;
      let frontBuyNumbers = [];
      
      // 初始化汇总计数数组 - 与sha_hao_fen_xi.html完全相同
      const totalCounts = new Array(36).fill(0); // 索引0不使用，1-35对应前区号码
      
      // 遍历前区组合，统计每个号码的出现次数 - 与sha_hao_fen_xi.html完全相同
      frontCombinations.forEach(combo => {
        // 累加每个号码的出现次数
        for (let i = 1; i <= 35; i++) {
          const count = combo.numberCounts[i] || 0;
          totalCounts[i] += count;
        }
      });
      
      // 根据回测方法计算对应的前区推荐买号 - 与sha_hao_fen_xi.html完全相同
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
      } else if (backtestMethod.match(/^rank(\d+)$/)) {
        // 排名方法：根据排名选择号码
        const rankMatch = backtestMethod.match(/^rank(\d+)$/);
        const rank = parseInt(rankMatch[1]);
        
        // 按出现次数降序排序号码（包括出现次数为0的号码）
        const sortedNumbers = [];
        for (let i = 1; i <= 35; i++) {
          sortedNumbers.push({ number: i, count: totalCounts[i] || 0 });
        }
        sortedNumbers.sort((a, b) => b.count - a.count);
        
        // 计算每个号码的实际排名
        const rankMap = {};
        let currentRank = 1;
        
        for (let i = 0; i < sortedNumbers.length; i++) {
          if (i > 0 && sortedNumbers[i].count !== sortedNumbers[i - 1].count) {
            currentRank++;
          }
          rankMap[sortedNumbers[i].number] = currentRank;
        }
        
        // 找出所有排名等于指定排名的号码
        for (let i = 1; i <= 35; i++) {
          if (rankMap[i] === rank) {
            frontBuyNumbers.push(i);
          }
        }
      }
      
      // 对于排名方法，如果没有找到对应排名的号码，返回空数组
      // 对于其他方法，如果没有找到对应号码，返回所有前区号码作为默认值
      if (frontBuyNumbers.length === 0 && !backtestMethod.match(/^rank(\d+)$/)) {
        // 如果所有条件都不满足，返回所有前区号码作为默认值
        for (let i = 1; i <= 35; i++) {
          frontBuyNumbers.push(i);
        }
      }
      
      return frontBuyNumbers;
    } else {
      alert('接口失败');
      return [];
    }
  } catch (error) {
    console.error('获取前区推荐买号失败:', error);
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

// 保存回测结果到后端
async function saveBacktestResults() {
  try {
    // 生成缓存键
    const currentPeriod = document.querySelector('.current-period').textContent;
    const cacheKey = `xia_qi_kai_jiang_yu_ce_${currentPeriod}`;
    
    // 准备保存的数据
    const saveData = {
      cache_key: cacheKey,
      backtest_results: backtestResults,
      current_period: currentPeriod,
      backtest_period: backtestPeriod // 保存当前回测期数配置
    };
    
    // 调用后端保存接口
    const response = await fetch('http://localhost:18889/bao_cun_hui_ce_jie_guo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(saveData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('回测结果保存成功');
    } else {
      alert('保存失败: ' + (result.message || '未知错误'));
    }
  } catch (error) {
    console.error('保存回测结果失败:', error);
    alert('接口失败');
  }
}

// 加载回测结果从后端
async function loadBacktestResults() {
  try {
    // 显示加载状态
    const loadBacktestResultsBtn = document.getElementById('loadBacktestResultsBtn');
    const originalText = loadBacktestResultsBtn.textContent;
    loadBacktestResultsBtn.textContent = '加载中...';
    loadBacktestResultsBtn.disabled = true;
    
    // 生成缓存键
    const currentPeriod = document.querySelector('.current-period').textContent;
    const cacheKey = `xia_qi_kai_jiang_yu_ce_${currentPeriod}`;
    
    // 调用后端加载接口
    const response = await fetch(`http://localhost:18889/huo_qu_hui_ce_jie_guo?cache_key=${cacheKey}`);
    
    const result = await response.json();
    
    if (result.success) {
      const loadedResults = result.data;
      const loadedBacktestPeriod = result.backtest_period;
      
      if (loadedResults) {
        // 将加载的结果存储到全局变量
        backtestResults = loadedResults;
        
        // 如果返回了回测期数配置，更新全局变量和输入框
        if (loadedBacktestPeriod) {
          backtestPeriod = loadedBacktestPeriod;
          const backtestPeriodInput = document.getElementById('backtestPeriod');
          if (backtestPeriodInput) {
            backtestPeriodInput.value = backtestPeriod;
          }
        }
        
        // 调用相应的渲染函数更新页面显示
        await renderLoadedBacktestResults();
        
        alert('回测结果加载成功');
      } else {
        alert('没有找到对应的回测结果');
      }
    } else {
      alert('加载失败: ' + (result.message || '未知错误'));
    }
  } catch (error) {
    console.error('加载回测结果失败:', error);
    alert('接口失败');
  } finally {
    // 恢复按钮状态
    const loadBacktestResultsBtn = document.getElementById('loadBacktestResultsBtn');
    loadBacktestResultsBtn.textContent = '加载回测结果';
    loadBacktestResultsBtn.disabled = false;
  }
}

// 渲染加载的回测结果
async function renderLoadedBacktestResults() {
  // 渲染最新一期两球组合
  if (backtestResults.newest) {
    await renderDetailData(backtestResults.newest.results, backtestResults.newest.nextPeriod);
  }
  
  // 渲染倒数2期两球组合
  if (backtestResults.secondLast) {
    await renderDetailDataSecondLast(backtestResults.secondLast.results, backtestResults.secondLast.nextPeriod);
  }
  
  // 渲染倒数3期两球组合
  if (backtestResults.thirdLast) {
    await renderDetailDataThirdLast(backtestResults.thirdLast.results, backtestResults.thirdLast.nextPeriod);
  }
  
  // 渲染倒数4期两球组合
  if (backtestResults.fourthLast) {
    await renderDetailDataFourthLast(backtestResults.fourthLast.results, backtestResults.fourthLast.nextPeriod);
  }
  
  // 渲染倒数5期两球组合
  if (backtestResults.fifthLast) {
    await renderDetailDataFifthLast(backtestResults.fifthLast.results, backtestResults.fifthLast.nextPeriod);
  }
  
  // 渲染近两期两球组合
  if (backtestResults.nearTwoPeriods) {
    await renderDetailDataNearTwoPeriods(backtestResults.nearTwoPeriods.results, backtestResults.nearTwoPeriods.nextPeriod);
  }
  
  // 渲染最新一期三球组合
  if (backtestResults.threeBall) {
    await renderDetailDataThreeBall(backtestResults.threeBall.results, backtestResults.threeBall.nextPeriod);
  }
  
  // 渲染倒数2期三球组合
  if (backtestResults.secondLastThreeBall) {
    await renderDetailDataSecondLastThreeBall(backtestResults.secondLastThreeBall.results, backtestResults.secondLastThreeBall.nextPeriod);
  }
  
  // 渲染倒数3期三球组合
  if (backtestResults.thirdLastThreeBall) {
    await renderDetailDataThirdLastThreeBall(backtestResults.thirdLastThreeBall.results, backtestResults.thirdLastThreeBall.nextPeriod);
  }
}

// 渲染详情数据
async function renderDetailData(allResults, nextPeriod) {
  const detailResults = document.getElementById('detailResultsNewest');
  const buyNumbersContent = document.getElementById('buyNumbersCollectionContentNewest');
  
  try {
    // 清空当前内容
    detailResults.innerHTML = '';
    
    // 如果没有结果，显示提示
    if (allResults.length === 0) {
      detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #666;">未找到平均率最高的统计期</td></tr>';
      return;
    }
    
    // 过滤回测结果：如果回测方法相同且下一期前区推荐买号相同，只保留一条
    const uniqueResultsMap = new Map();
    
    allResults.forEach(result => {
      // 基于回测方法和下一期前区推荐买号（排序后）创建唯一键
      const sortedBuyNumbers = [...(result.frontBuyNumbers || [])].sort((a, b) => a - b);
      const uniqueKey = `${result.backtestMethod}_${sortedBuyNumbers.join('_')}`;
      
      // 只保留第一条出现的结果
      if (!uniqueResultsMap.has(uniqueKey)) {
        uniqueResultsMap.set(uniqueKey, result);
      }
    });
    
    // 将过滤后的结果转换回数组
    const filteredResults = Array.from(uniqueResultsMap.values());
    
    // 按照平均正确率降序排序
    filteredResults.sort((a, b) => b.accuracy - a.accuracy);
    
    // 遍历过滤后的结果
    const allBuyNumbers = [];
    for (const result of filteredResults) {
      const { statsPeriod, accuracy, backtestMethod, frontBuyNumbers } = result;
      
      // 平均正确率已经在搜索阶段计算好
      const averageCorrectRate = accuracy.toFixed(3);
      
      // 获取回测方法中文名称
      let backtestMethodText = '出现最多';
      if (backtestMethod === 'least') {
        backtestMethodText = '出现最少';
      } else if (backtestMethod === 'average') {
        backtestMethodText = '出现平均';
      } else if (backtestMethod.match(/^rank(\d+)$/)) {
        // 排名方法：显示为"排名第X"
        const rankMatch = backtestMethod.match(/^rank(\d+)$/);
        const rank = parseInt(rankMatch[1]);
        backtestMethodText = `排名第${rank}`;
      }
      
      // 格式化前区推荐买号
      let frontBuyNumbersStr = '';
      let tr = document.createElement('tr');
      
      // 根据 frontBuyNumbers 是否为空，生成不同的表格行
      if (frontBuyNumbers && frontBuyNumbers.length > 0) {
        // 有推荐买号时，显示完整的表格行
        frontBuyNumbersStr = frontBuyNumbers.map(num => `<span class="red-ball">${num}</span>`).join(' ');
        tr.innerHTML = `
          <td>${backtestMethodText}</td>
          <td>${backtestPeriod}期</td>
          <td>${statsPeriod}期</td>
          <td>${averageCorrectRate}%</td>
          <td>${nextPeriod}</td>
          <td>${nextPeriod}</td>
          <td>${frontBuyNumbersStr}</td>
          <td>
            <button class="btn copy-btn" style="background-color: #4CAF50; color: white; padding: 5px 10px; font-size: 12px;">复制</button>
          </td>
        `;
        
        // 添加复制按钮事件
        const copyBtn = tr.querySelector('.copy-btn');
        copyBtn.addEventListener('click', () => copyToClipboard(frontBuyNumbers));
        
        // 收集所有推荐买号
        frontBuyNumbers.forEach(num => {
          if (!allBuyNumbers.includes(num)) {
            allBuyNumbers.push(num);
          }
        });
      } else {
        // 无推荐买号时，不显示“下一期前区推荐买号”字段
        tr.innerHTML = `
          <td>${backtestMethodText}</td>
          <td>${backtestPeriod}期</td>
          <td>${statsPeriod}期</td>
          <td>${averageCorrectRate}%</td>
          <td>${nextPeriod}</td>
          <td>${nextPeriod}</td>
          <td></td>
          <td>
            <button class="btn copy-btn" style="background-color: #4CAF50; color: white; padding: 5px 10px; font-size: 12px;">复制</button>
          </td>
        `;
        
        // 禁用复制按钮
        const copyBtn = tr.querySelector('.copy-btn');
        copyBtn.disabled = true;
        copyBtn.style.backgroundColor = '#ccc';
        copyBtn.style.cursor = 'not-allowed';
      }
      
      detailResults.appendChild(tr);
    }
    
    // 更新推荐买号合集
    if (buyNumbersContent) {
      if (allBuyNumbers.length > 0) {
        // 按平均正确率累加进行排序，同一个推荐买号的球，回测方法相同时，只保留平均正确率大的
        const numberAccuracyMap = new Map();
        
        // 遍历所有结果，计算每个号码的平均正确率累加
        filteredResults.forEach(result => {
          const { accuracy, backtestMethod, frontBuyNumbers } = result;
          
          if (frontBuyNumbers && frontBuyNumbers.length > 0) {
            frontBuyNumbers.forEach(num => {
              const numStr = num.toString();
              const key = `${backtestMethod}_${numStr}`;
              
              if (numberAccuracyMap.has(key)) {
                // 检查回测方法是否相同
                const existingData = numberAccuracyMap.get(key);
                if (existingData.backtestMethod === backtestMethod) {
                  // 如果回测方法相同，只保留平均正确率大的
                  if (accuracy > existingData.accuracy) {
                    numberAccuracyMap.set(key, { accuracy, backtestMethod, number: num });
                  }
                }
              } else {
                // 第一次出现，直接添加
                numberAccuracyMap.set(key, { accuracy, backtestMethod, number: num });
              }
            });
          }
        });
        
        // 现在对每个号码，按回测方法分组，相同回测方法只保留最高正确率，不同回测方法累加
        const finalNumberMap = new Map();
        numberAccuracyMap.forEach((data, key) => {
          const { accuracy, backtestMethod, number } = data;
          const numStr = number.toString();
          
          if (finalNumberMap.has(numStr)) {
            const existingData = finalNumberMap.get(numStr);
            // 不同回测方法，累加正确率
            const newAccuracy = existingData.accuracy + accuracy;
            finalNumberMap.set(numStr, { accuracy: newAccuracy, backtestMethod: 'combined', number: number });
          } else {
            finalNumberMap.set(numStr, { accuracy, backtestMethod, number: number });
          }
        });
        
        // 转换为数组并按平均正确率降序排序
        const sortedNumbers = Array.from(finalNumberMap.values())
          .sort((a, b) => b.accuracy - a.accuracy);
        
        // 生成推荐买号合集的HTML
        buyNumbersContent.innerHTML = sortedNumbers.map(item => {
          const accuracyText = item.accuracy.toFixed(3);
          return `<div style="display: flex; align-items: center; gap: 5px;">
            <div class="red-ball">${item.number}</div>
            <div style="font-size: 12px; color: #666;">${accuracyText}%</div>
          </div>`;
        }).join(' ');
      } else {
        buyNumbersContent.innerHTML = '<div style="color: #666;">暂无推荐买号数据</div>';
      }
    }
  } catch (error) {
    console.error('渲染详情数据失败:', error);
    detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">加载失败，请重试</td></tr>';
  }
}

// 最新一期两球组合平均率最高统计期详情回测函数
async function performSearchNewest() {
  const progressDiv = document.getElementById('progressNewest');
  const progressText = document.getElementById('progressTextNewest');
  const progressBar = document.getElementById('progressBarNewest');
  const progressPercentage = document.getElementById('progressPercentageNewest');
  const currentPhase = document.getElementById('currentPhaseNewest');
  const detailResults = document.getElementById('detailResultsNewest');
  const startBacktestBtn = document.getElementById('startBacktestBtnNewest');
  const stopBacktestBtn = document.getElementById('stopBacktestBtnNewest');
  
  // 进度计算变量
  let totalProgress = 0;
  let currentStep = 0;
  let totalSteps = 0;
  
  // 终止标志
  let isBacktestStopped = false;
  
  // 更新进度的函数
  function updateProgress(text, percentage, phase) {
    return new Promise(resolve => {
      // 直接更新DOM，不依赖requestAnimationFrame
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
    
    // 立即显示进度条，直接更新DOM
    await new Promise(resolve => {
      progressDiv.style.display = 'block';
      progressText.textContent = '开始搜索平均率最高的统计期..';
      progressBar.style.width = '0%';
      progressPercentage.textContent = '0%';
      currentPhase.textContent = '正在准备...';
      detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #666;">正在搜索平均率最高的统计期..</td></tr>';
      resolve();
    });
    
    // 重置终止标志
    isBacktestStopped = false;
    
    // 添加终止回测按钮点击事件
    stopBacktestBtn.onclick = function() {
      isBacktestStopped = true;
      updateProgress('回测已终止', 100, '回测终止');
    };
    
    // 使用全局配置的回测期数
    const currentBacktestPeriod = backtestPeriod;
    
    // 更新进度
    await updateProgress('正在获取总期数..', 5, '获取总期数');
    
    const totalPeriods = await getTotalPeriods();
    
    // 多阶段搜索策略，从大到小变化步长
    const searchStages = [
      { step: 100, expansion: 200 }, // 第一阶段：步长100，扩展范围200
      { step: 50, expansion: 100 },   // 第二阶段：步长50，扩展范围100
      { step: 10, expansion: 30 }     // 第三阶段：步长10，扩展范围30
    ];
    
    // 回测方法：只包含排名方法
    const backtestMethods = [];
    // 添加排名方法
    for (let i = 1; i <= 30; i++) {
      backtestMethods.push(`rank${i}`);
    }
    const allResults = [];
    
    // 计算总工作量
    totalSteps = backtestMethods.length * searchStages.length + 3; // 3个初始化和收尾步骤
    
    // 更新进度
    await updateProgress('正在获取最新一期期号..', 10, '获取最新期号');
    currentStep++;
    
    // 获取下一期期号
    const nextPeriod = await getLatestPeriod(); // 使用sql_zui_xin_yi_qi接口获取下一期期号
    
    // 遍历所有回测方法
    for (const backtestMethod of backtestMethods) {
      // 获取回测方法中文名称
      let methodName = '出现最多';
      if (backtestMethod === 'least') {
        methodName = '出现最少';
      } else if (backtestMethod === 'average') {
        methodName = '出现平均';
      } else if (backtestMethod.match(/^rank(\d+)$/)) {
        // 排名方法：显示为"排名第X"
        const rankMatch = backtestMethod.match(/^rank(\d+)$/);
        const rank = parseInt(rankMatch[1]);
        methodName = `排名第${rank}`;
      }
      
      // 更新进度
      await updateProgress(`正在搜索回测方法: ${methodName}...`, 15 + (currentStep / totalSteps) * 60, `搜索回测方法: ${methodName}`);
      currentStep++;
      
      // 所有回测方法都从1500期开始
      let currentStart = 1500;
      let currentEnd = totalPeriods;
      let allTestResults = [];
      
      // 执行每个阶段的搜索
      for (let stageIndex = 0; stageIndex < searchStages.length; stageIndex++) {
        const stage = searchStages[stageIndex];
        const { step, expansion } = stage;
        
        // 更新进度
        const stageProgress = 15 + (currentStep / totalSteps) * 60;
        await updateProgress(
          `正在进行${methodName}方法的第${stageIndex + 1}阶段搜索（步长：${step}期）..`, 
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
            `正在测试统计期${i}期..`, 
            loopProgress, 
            `测试期数: ${i}，进度 ${stageCount}/${stageTotal}`
          );
          
          const result = await testStatsPeriod(currentBacktestPeriod, i, backtestMethod);
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
        
        // 找出当前阶段的最高正确率
        const highestAccuracy = Math.max(...stageResults.map(result => result.accuracy));
        
        // 找出当前阶段中所有最高正确率的结果
        const highestResultsInStage = stageResults.filter(result => result.accuracy === highestAccuracy);
        
        // 计算下一阶段的搜索范围
        const minStatsPeriod = Math.min(...highestResultsInStage.map(result => result.statsPeriod));
        const maxStatsPeriod = Math.max(...highestResultsInStage.map(result => result.statsPeriod));
        
        // 扩展搜索范围，确保不遗漏相邻区域
        // 所有回测方法都使用1500期作为最小限制
        const minLimit = 1500;
        currentStart = Math.max(minLimit, minStatsPeriod - expansion);
        currentEnd = Math.min(totalPeriods, maxStatsPeriod + expansion);
      }
      
      // 从所有测试结果中找出最高正确率
      const highestAccuracy = Math.max(...allTestResults.map(result => result.accuracy));
      
      // 找出所有正确率等于最高值的期数
      const highestPeriods = allTestResults.filter(result => result.accuracy === highestAccuracy);
      
      // 对期数进行去重处理
      const uniquePeriodsMap = new Map();
      highestPeriods.forEach(result => {
        if (!uniquePeriodsMap.has(result.statsPeriod)) {
          uniquePeriodsMap.set(result.statsPeriod, result);
        }
      });
      
      // 将去重后的结果转换回数组，并添加回测方法信息
      const uniqueHighestPeriods = Array.from(uniquePeriodsMap.values()).map(result => ({
        ...result,
        backtestMethod
      }));
      
      // 添加到所有结果中
      allResults.push(...uniqueHighestPeriods);
    }
    
    // 更新进度
    await updateProgress('搜索完成，正在获取前区推荐买号..', 85, '获取前区推荐买号');
    currentStep++;
    
    // 为每个结果获取前区推荐买号，并过滤掉空推荐号码的排名方法结果
    const validResults = [];
    for (let i = 0; i < allResults.length; i++) {
      // 检查是否需要终止回测
      if (isBacktestStopped) {
        break;
      }
      
      const result = allResults[i];
      // 获取回测方法中文名称
      let methodName = '出现最多';
      if (result.backtestMethod === 'least') {
        methodName = '出现最少';
      } else if (result.backtestMethod === 'average') {
        methodName = '出现平均';
      } else if (result.backtestMethod.match(/^rank(\d+)$/)) {
        // 排名方法：显示为"排名第X"
        const rankMatch = result.backtestMethod.match(/^rank(\d+)$/);
        const rank = parseInt(rankMatch[1]);
        methodName = `排名第${rank}`;
      }
      
      // 更新进度
      const buyProgress = 85 + ((i + 1) / allResults.length) * 10;
      await updateProgress(
        `正在获取统计期${result.statsPeriod}期，${methodName}方法的前区推荐买号..`, 
        buyProgress, 
        `处理结果 ${i + 1}/${allResults.length}`
      );
      
      result.frontBuyNumbers = await huo_qu_qian_qu_tui_jian_mai_hao(result.statsPeriod, result.backtestMethod);
      
      // 如果是排名方法且没有找到对应排名的号码（返回空数组），则跳过该结果
      if (result.backtestMethod.match(/^rank(\d+)$/) && result.frontBuyNumbers.length === 0) {
        continue;
      }
      
      // 将有效的结果添加到validResults数组中
      validResults.push(result);
    }
    
    // 检查是否需要终止回测
    if (isBacktestStopped) {
      detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">回测已终止</td></tr>';
    } else {
      // 更新进度
      await updateProgress(`找到 ${validResults.length} 个平均率最高的统计期，正在渲染结果...`, 98, '渲染结果');
      currentStep++;
      
      // 渲染详情数据，传递过滤后的结果和下一期期号
      await renderDetailData(validResults, nextPeriod);
      
      // 存储回测结果到全局变量
      backtestResults['newest'] = {
        results: validResults,
        nextPeriod: nextPeriod,
        timestamp: new Date().toISOString()
      };
      
      // 更新进度
      await updateProgress('搜索完成，正在隐藏进度条...', 100, '完成');
    }
    
    // 隐藏进度
    await new Promise(resolve => {
      setTimeout(() => {
        progressDiv.style.display = 'none';
        resolve();
      }, 500);
    });
    
  } catch (error) {
    console.error('搜索最低正确率统计期失败', error);
    
    // 更新进度
    await updateProgress('搜索失败，请重试', 100, '搜索失败');
    detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">搜索失败，请重试</td></tr>';
  } finally {
    // 恢复按钮状态
    startBacktestBtn.style.display = 'inline-block';
    stopBacktestBtn.style.display = 'none';
    // 重置终止标志
    isBacktestStopped = false;
  }
}

// 从后端获取回测数据 - 使用dao_shu_2_qi_mai_hao_hui_ce_xiang_qing.html的算法
async function dao_shu_2_qi_mai_hao_hui_ce(backtestPeriod = '50', statsPeriod = '100', backtestMethod = 'most') {
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

// 测试单个统计期值的平均正确率 - 使用dao_shu_2_qi_mai_hao_hui_ce_xiang_qing.html的算法
async function testStatsPeriodSecondLast(backtestPeriod, statsPeriod, backtestMethod) {
  try {
    const backtestData = await dao_shu_2_qi_mai_hao_hui_ce(backtestPeriod, statsPeriod, backtestMethod);
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

// 获取前区推荐买号 - 使用与dao_shu_2_qi_liang_qiu_zu_he.html相同的算法
async function huo_qu_qian_qu_tui_jian_mai_hao_second_last(statsPeriod, backtestMethod) {
  try {
    // 调用dao_shu_2_qi_liang_qiu_zu_he接口获取倒数2期两球组合数据
    const response = await fetch(`http://localhost:18889/dao_shu_2_qi_liang_qiu_zu_he?period=${statsPeriod}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (result.success) {
      const analysisData = result.data;
      let frontBuyNumbers = [];
      
      // 初始化汇总计数数组 - 与dao_shu_2_qi_liang_qiu_zu_he.html完全相同
      const totalCounts = new Array(36).fill(0); // 索引0不使用，1-35对应前区号码
      
      // 遍历前区组合，统计每个号码的出现次数 - 与dao_shu_2_qi_liang_qiu_zu_he.html完全相同
      analysisData.combinations.forEach(combo => {
        // 累加每个号码的出现次数
        for (let i = 1; i <= 35; i++) {
          const numStr = String(i);
          let count = 0;
          if (combo.nextDrawNumbers && Array.isArray(combo.nextDrawNumbers)) {
            count = combo.nextDrawNumbers.filter(n => n === numStr).length;
          }
          totalCounts[i] += count;
        }
      });
      
      // 根据回测方法计算对应的前区推荐买号 - 与dao_shu_2_qi_liang_qiu_zu_he.html完全相同
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
      } else if (backtestMethod.match(/^rank(\d+)$/)) {
        // 排名方法：根据排名选择号码
        const rankMatch = backtestMethod.match(/^rank(\d+)$/);
        const rank = parseInt(rankMatch[1]);
        
        // 按出现次数降序排序号码（包括出现次数为0的号码） - 与dao_shu_2_qi_liang_qiu_zu_he.html完全一致
        const sortedNumbers = [];
        for (let i = 1; i <= 35; i++) {
          sortedNumbers.push({ number: i, count: totalCounts[i] || 0 });
        }
        sortedNumbers.sort((a, b) => b.count - a.count);
        
        // 计算每个号码的实际排名 - 与dao_shu_2_qi_liang_qiu_zu_he.html完全一致
        const rankMap = {};
        let currentRank = 1;
        
        for (let i = 0; i < sortedNumbers.length; i++) {
          if (i > 0 && sortedNumbers[i].count !== sortedNumbers[i - 1].count) {
            currentRank++;
          }
          rankMap[sortedNumbers[i].number] = currentRank;
        }
        
        // 找出所有排名等于指定排名的号码
        for (let i = 1; i <= 35; i++) {
          if (rankMap[i] === rank) {
            frontBuyNumbers.push(i);
          }
        }
      }
      
      // 对于排名方法，如果没有找到对应排名的号码，返回空数组
      // 对于其他方法，如果没有找到对应号码，返回所有前区号码作为默认值
      if (frontBuyNumbers.length === 0 && !backtestMethod.match(/^rank(\d+)$/)) {
        // 如果所有条件都不满足，返回所有前区号码作为默认值
        for (let i = 1; i <= 35; i++) {
          frontBuyNumbers.push(i);
        }
      }
      
      return frontBuyNumbers;
    } else {
      alert('接口失败');
      return [];
    }
  } catch (error) {
    console.error('获取前区推荐买号失败:', error);
    return [];
  }
}

// 渲染详情数据 - 倒数2期
async function renderDetailDataSecondLast(allResults, nextPeriod) {
  const detailResults = document.getElementById('detailResultsSecondLast');
  const buyNumbersContent = document.getElementById('buyNumbersCollectionContentSecondLast');
  
  try {
    // 清空当前内容
    detailResults.innerHTML = '';
    
    // 如果没有结果，显示提示
    if (allResults.length === 0) {
      detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #666;">未找到平均率最高的统计期</td></tr>';
      return;
    }
    
    // 过滤回测结果：如果回测方法相同且下下期前区推荐买号相同，只保留一条
    const uniqueResultsMap = new Map();
    
    allResults.forEach(result => {
      // 基于回测方法和下下期前区推荐买号（排序后）创建唯一键
      const sortedBuyNumbers = [...(result.frontBuyNumbers || [])].sort((a, b) => a - b);
      const uniqueKey = `${result.backtestMethod}_${sortedBuyNumbers.join('_')}`;
      
      // 只保留第一条出现的结果
      if (!uniqueResultsMap.has(uniqueKey)) {
        uniqueResultsMap.set(uniqueKey, result);
      }
    });
    
    // 将过滤后的结果转换回数组
    const filteredResults = Array.from(uniqueResultsMap.values());
    
    // 按照平均正确率降序排序
    filteredResults.sort((a, b) => b.accuracy - a.accuracy);
    
    // 遍历过滤后的结果
    const allBuyNumbers = [];
    for (const result of filteredResults) {
      const { statsPeriod, accuracy, backtestMethod, frontBuyNumbers } = result;
      
      // 平均正确率已经在搜索阶段计算好
      const averageCorrectRate = accuracy.toFixed(3);
      
      // 获取回测方法中文名称
      let backtestMethodText = '出现最多';
      if (backtestMethod === 'least') {
        backtestMethodText = '出现最少';
      } else if (backtestMethod === 'average') {
        backtestMethodText = '出现平均';
      } else if (backtestMethod.match(/^rank(\d+)$/)) {
        // 排名方法：显示为"排名第X"
        const rankMatch = backtestMethod.match(/^rank(\d+)$/);
        const rank = parseInt(rankMatch[1]);
        backtestMethodText = `排名第${rank}`;
      }
      
      // 格式化前区推荐买号
      let frontBuyNumbersStr = '';
      let tr = document.createElement('tr');
      
      // 根据 frontBuyNumbers 是否为空，生成不同的表格行
      if (frontBuyNumbers && frontBuyNumbers.length > 0) {
        // 有推荐买号时，显示完整的表格行
        frontBuyNumbersStr = frontBuyNumbers.map(num => `<span class="red-ball">${num}</span>`).join(' ');
        tr.innerHTML = `
          <td>${backtestMethodText}</td>
          <td>${backtestPeriod}期</td>
          <td>${statsPeriod}期</td>
          <td>${averageCorrectRate}%</td>
          <td>${nextPeriod}</td>
          <td>${nextPeriod}</td>
          <td>${frontBuyNumbersStr}</td>
          <td>
            <button class="btn copy-btn" style="background-color: #4CAF50; color: white; padding: 5px 10px; font-size: 12px;">复制</button>
          </td>
        `;
        
        // 添加复制按钮事件
        const copyBtn = tr.querySelector('.copy-btn');
        copyBtn.addEventListener('click', () => copyToClipboard(frontBuyNumbers));
        
        // 收集所有推荐买号
        frontBuyNumbers.forEach(num => {
          if (!allBuyNumbers.includes(num)) {
            allBuyNumbers.push(num);
          }
        });
      } else {
        // 无推荐买号时，不显示"下下期前区推荐买号"字段
        tr.innerHTML = `
          <td>${backtestMethodText}</td>
          <td>${backtestPeriod}期</td>
          <td>${statsPeriod}期</td>
          <td>${averageCorrectRate}%</td>
          <td>${nextPeriod}</td>
          <td>${nextPeriod}</td>
          <td></td>
          <td>
            <button class="btn copy-btn" style="background-color: #4CAF50; color: white; padding: 5px 10px; font-size: 12px;">复制</button>
          </td>
        `;
        
        // 禁用复制按钮
        const copyBtn = tr.querySelector('.copy-btn');
        copyBtn.disabled = true;
        copyBtn.style.backgroundColor = '#ccc';
        copyBtn.style.cursor = 'not-allowed';
      }
      
      detailResults.appendChild(tr);
    }
    
    // 更新推荐买号合集
    if (buyNumbersContent) {
      if (allBuyNumbers.length > 0) {
        // 按平均正确率累加进行排序，同一个推荐买号的球，回测方法相同时，只保留平均正确率大的
        const numberAccuracyMap = new Map();
        
        // 遍历所有结果，计算每个号码的平均正确率累加
        filteredResults.forEach(result => {
          const { accuracy, backtestMethod, frontBuyNumbers } = result;
          
          if (frontBuyNumbers && frontBuyNumbers.length > 0) {
            frontBuyNumbers.forEach(num => {
              const numStr = num.toString();
              const key = `${backtestMethod}_${numStr}`;
              
              if (numberAccuracyMap.has(key)) {
                // 检查回测方法是否相同
                const existingData = numberAccuracyMap.get(key);
                if (existingData.backtestMethod === backtestMethod) {
                  // 如果回测方法相同，只保留平均正确率大的
                  if (accuracy > existingData.accuracy) {
                    numberAccuracyMap.set(key, { accuracy, backtestMethod, number: num });
                  }
                }
              } else {
                // 第一次出现，直接添加
                numberAccuracyMap.set(key, { accuracy, backtestMethod, number: num });
              }
            });
          }
        });
        
        // 现在对每个号码，按回测方法分组，相同回测方法只保留最高正确率，不同回测方法累加
        const finalNumberMap = new Map();
        numberAccuracyMap.forEach((data, key) => {
          const { accuracy, backtestMethod, number } = data;
          const numStr = number.toString();
          
          if (finalNumberMap.has(numStr)) {
            const existingData = finalNumberMap.get(numStr);
            // 不同回测方法，累加正确率
            const newAccuracy = existingData.accuracy + accuracy;
            finalNumberMap.set(numStr, { accuracy: newAccuracy, backtestMethod: 'combined', number: number });
          } else {
            finalNumberMap.set(numStr, { accuracy, backtestMethod, number: number });
          }
        });
        
        // 转换为数组并按平均正确率降序排序
        const sortedNumbers = Array.from(finalNumberMap.values())
          .sort((a, b) => b.accuracy - a.accuracy);
        
        // 生成推荐买号合集的HTML
        buyNumbersContent.innerHTML = sortedNumbers.map(item => {
          const accuracyText = item.accuracy.toFixed(3);
          return `<div style="display: flex; align-items: center; gap: 5px;">
            <div class="red-ball">${item.number}</div>
            <div style="font-size: 12px; color: #666;">${accuracyText}%</div>
          </div>`;
        }).join(' ');
      } else {
        buyNumbersContent.innerHTML = '<div style="color: #666;">暂无推荐买号数据</div>';
      }
    }
  } catch (error) {
    console.error('渲染详情数据失败:', error);
    detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">加载失败，请重试</td></tr>';
  }
}

// 倒数2期两球组合平均率最高统计期详情回测函数
async function performSearchSecondLast() {
  const progressDiv = document.getElementById('progressSecondLast');
  const progressText = document.getElementById('progressTextSecondLast');
  const progressBar = document.getElementById('progressBarSecondLast');
  const progressPercentage = document.getElementById('progressPercentageSecondLast');
  const currentPhase = document.getElementById('currentPhaseSecondLast');
  const detailResults = document.getElementById('detailResultsSecondLast');
  const startBacktestBtn = document.getElementById('startBacktestBtnSecondLast');
  const stopBacktestBtn = document.getElementById('stopBacktestBtnSecondLast');
  
  // 进度计算变量
  let totalProgress = 0;
  let currentStep = 0;
  let totalSteps = 0;
  
  // 终止标志
  let isBacktestStopped = false;
  
  // 更新进度的函数
  function updateProgress(text, percentage, phase) {
    return new Promise(resolve => {
      // 直接更新DOM，不依赖requestAnimationFrame
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
    
    // 立即显示进度条，直接更新DOM
    await new Promise(resolve => {
      progressDiv.style.display = 'block';
      progressText.textContent = '开始搜索平均率最高的统计期..';
      progressBar.style.width = '0%';
      progressPercentage.textContent = '0%';
      currentPhase.textContent = '正在准备...';
      detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #666;">正在搜索平均率最高的统计期..</td></tr>';
      resolve();
    });
    
    // 重置终止标志
    isBacktestStopped = false;
    
    // 添加终止回测按钮点击事件
    stopBacktestBtn.onclick = function() {
      isBacktestStopped = true;
      updateProgress('回测已终止', 100, '回测终止');
    };
    
    // 使用全局配置的回测期数
    const currentBacktestPeriod = backtestPeriod;
    
    // 更新进度
    await updateProgress('正在获取总期数..', 5, '获取总期数');
    
    const totalPeriods = await getTotalPeriods();
    
    // 多阶段搜索策略，从大到小变化步长
    const searchStages = [
      { step: 100, expansion: 200 }, // 第一阶段：步长100，扩展范围200
      { step: 50, expansion: 100 },   // 第二阶段：步长50，扩展范围100
      { step: 10, expansion: 30 }     // 第三阶段：步长10，扩展范围30
    ];
    
    // 回测方法：只包含排名方法
    const backtestMethods = [];
    // 添加排名方法
    for (let i = 1; i <= 30; i++) {
      backtestMethods.push(`rank${i}`);
    }
    const allResults = [];
    
    // 计算总工作量
    totalSteps = backtestMethods.length * searchStages.length + 3; // 3个初始化和收尾步骤
    
    // 更新进度
    await updateProgress('正在获取最新一期期号..', 10, '获取最新期号');
    currentStep++;
    
    // 获取下下期期号
    const nextPeriod = await getLatestPeriodSecondLast(); // 使用sql_dao_shu_2_qi接口获取下下期期号
    
    // 遍历所有回测方法
    for (const backtestMethod of backtestMethods) {
      // 获取回测方法中文名称
      let methodName = '出现最多';
      if (backtestMethod === 'least') {
        methodName = '出现最少';
      } else if (backtestMethod === 'average') {
        methodName = '出现平均';
      } else if (backtestMethod.match(/^rank(\d+)$/)) {
        // 排名方法：显示为"排名第X"
        const rankMatch = backtestMethod.match(/^rank(\d+)$/);
        const rank = parseInt(rankMatch[1]);
        methodName = `排名第${rank}`;
      }
      
      // 更新进度
      await updateProgress(`正在搜索回测方法: ${methodName}...`, 15 + (currentStep / totalSteps) * 60, `搜索回测方法: ${methodName}`);
      currentStep++;
      
      // 所有回测方法都从1500期开始
      let currentStart = 1500;
      let currentEnd = totalPeriods;
      let allTestResults = [];
      
      // 执行每个阶段的搜索
      for (let stageIndex = 0; stageIndex < searchStages.length; stageIndex++) {
        const stage = searchStages[stageIndex];
        const { step, expansion } = stage;
        
        // 更新进度
        const stageProgress = 15 + (currentStep / totalSteps) * 60;
        await updateProgress(
          `正在进行${methodName}方法的第${stageIndex + 1}阶段搜索（步长：${step}期）..`, 
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
            `正在测试统计期${i}期..`, 
            loopProgress, 
            `测试期数: ${i}，进度 ${stageCount}/${stageTotal}`
          );
          
          const result = await testStatsPeriodSecondLast(currentBacktestPeriod, i, backtestMethod);
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
        
        // 找出当前阶段的最高正确率
        const highestAccuracy = Math.max(...stageResults.map(result => result.accuracy));
        
        // 找出当前阶段中所有最高正确率的结果
        const highestResultsInStage = stageResults.filter(result => result.accuracy === highestAccuracy);
        
        // 计算下一阶段的搜索范围
        const minStatsPeriod = Math.min(...highestResultsInStage.map(result => result.statsPeriod));
        const maxStatsPeriod = Math.max(...highestResultsInStage.map(result => result.statsPeriod));
        
        // 扩展搜索范围，确保不遗漏相邻区域
        // 所有回测方法都使用1500期作为最小限制
        const minLimit = 1500;
        currentStart = Math.max(minLimit, minStatsPeriod - expansion);
        currentEnd = Math.min(totalPeriods, maxStatsPeriod + expansion);
      }
      
      // 从所有测试结果中找出最高正确率
      const highestAccuracy = Math.max(...allTestResults.map(result => result.accuracy));
      
      // 找出所有正确率等于最高值的期数
      const highestPeriods = allTestResults.filter(result => result.accuracy === highestAccuracy);
      
      // 对期数进行去重处理
      const uniquePeriodsMap = new Map();
      highestPeriods.forEach(result => {
        if (!uniquePeriodsMap.has(result.statsPeriod)) {
          uniquePeriodsMap.set(result.statsPeriod, result);
        }
      });
      
      // 将去重后的结果转换回数组，并添加回测方法信息
      const uniqueHighestPeriods = Array.from(uniquePeriodsMap.values()).map(result => ({
        ...result,
        backtestMethod
      }));
      
      // 添加到所有结果中
      allResults.push(...uniqueHighestPeriods);
    }
    
    // 更新进度
    await updateProgress('搜索完成，正在获取前区推荐买号..', 85, '获取前区推荐买号');
    currentStep++;
    
    // 为每个结果获取前区推荐买号，并过滤掉空推荐号码的排名方法结果
    const validResults = [];
    for (let i = 0; i < allResults.length; i++) {
      // 检查是否需要终止回测
      if (isBacktestStopped) {
        break;
      }
      
      const result = allResults[i];
      // 获取回测方法中文名称
      let methodName = '出现最多';
      if (result.backtestMethod === 'least') {
        methodName = '出现最少';
      } else if (result.backtestMethod === 'average') {
        methodName = '出现平均';
      } else if (result.backtestMethod.match(/^rank(\d+)$/)) {
        // 排名方法：显示为"排名第X"
        const rankMatch = result.backtestMethod.match(/^rank(\d+)$/);
        const rank = parseInt(rankMatch[1]);
        methodName = `排名第${rank}`;
      }
      
      // 更新进度
      const buyProgress = 85 + ((i + 1) / allResults.length) * 10;
      await updateProgress(
        `正在获取统计期${result.statsPeriod}期，${methodName}方法的前区推荐买号..`, 
        buyProgress, 
        `处理结果 ${i + 1}/${allResults.length}`
      );
      
      result.frontBuyNumbers = await huo_qu_qian_qu_tui_jian_mai_hao_second_last(result.statsPeriod, result.backtestMethod);
      
      // 如果是排名方法且没有找到对应排名的号码（返回空数组），则跳过该结果
      if (result.backtestMethod.match(/^rank(\d+)$/) && result.frontBuyNumbers.length === 0) {
        continue;
      }
      
      // 将有效的结果添加到validResults数组中
      validResults.push(result);
    }
    
    // 检查是否需要终止回测
    if (isBacktestStopped) {
      detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">回测已终止</td></tr>';
    } else {
      // 更新进度
      await updateProgress(`找到 ${validResults.length} 个平均率最高的统计期，正在渲染结果...`, 98, '渲染结果');
      currentStep++;
      
      // 渲染详情数据，传递过滤后的结果和下下期期号
      await renderDetailDataSecondLast(validResults, nextPeriod);
      
      // 存储回测结果到全局变量
      backtestResults['secondLast'] = {
        results: validResults,
        nextPeriod: nextPeriod,
        timestamp: new Date().toISOString()
      };
      
      // 更新进度
      await updateProgress('搜索完成，正在隐藏进度条...', 100, '完成');
    }
    
    // 隐藏进度
    await new Promise(resolve => {
      setTimeout(() => {
        progressDiv.style.display = 'none';
        resolve();
      }, 500);
    });
    
  } catch (error) {
    console.error('搜索最高正确率统计期失败', error);
    
    // 更新进度
    await updateProgress('搜索失败，请重试', 100, '搜索失败');
    detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">搜索失败，请重试</td></tr>';
  } finally {
    // 恢复按钮状态
    startBacktestBtn.style.display = 'inline-block';
    stopBacktestBtn.style.display = 'none';
    // 重置终止标志
    isBacktestStopped = false;
  }
}

// 从后端获取回测数据 - 使用dao_shu_3_qi_mai_hao_hui_ce_xiang_qing.html的算法
async function dao_shu_3_qi_mai_hao_hui_ce(backtestPeriod = '50', statsPeriod = '100', backtestMethod = 'most') {
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

// 从后端获取回测数据 - 使用dao_shu_4_qi_mai_hao_hui_ce_xiang_qing.html的算法
async function dao_shu_4_qi_mai_hao_hui_ce(backtestPeriod = '50', statsPeriod = '100', backtestMethod = 'most') {
  try {
    const response = await fetch(`http://localhost:18889/dao_shu_4_qi_mai_hao_hui_ce?backtest_period=${backtestPeriod}&stats_period=${statsPeriod}&backtest_method=${backtestMethod}`);
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

// 从后端获取回测数据 - 使用dao_shu_5_qi_mai_hao_hui_ce_xiang_qing.html的算法
async function dao_shu_5_qi_mai_hao_hui_ce(backtestPeriod = '50', statsPeriod = '100', backtestMethod = 'most') {
  try {
    const response = await fetch(`http://localhost:18889/dao_shu_5_qi_mai_hao_hui_ce?backtest_period=${backtestPeriod}&stats_period=${statsPeriod}&backtest_method=${backtestMethod}`);
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

// 测试单个统计期值的平均正确率 - 使用dao_shu_3_qi_mai_hao_hui_ce_xiang_qing.html的算法
async function testStatsPeriodThirdLast(backtestPeriod, statsPeriod, backtestMethod) {
  try {
    const backtestData = await dao_shu_3_qi_mai_hao_hui_ce(backtestPeriod, statsPeriod, backtestMethod);
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

// 测试单个统计期值的平均正确率 - 使用dao_shu_4_qi_mai_hao_hui_ce_xiang_qing.html的算法
async function testStatsPeriodFourthLast(backtestPeriod, statsPeriod, backtestMethod) {
  try {
    const backtestData = await dao_shu_4_qi_mai_hao_hui_ce(backtestPeriod, statsPeriod, backtestMethod);
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

// 测试单个统计期值的平均正确率 - 使用dao_shu_5_qi_mai_hao_hui_ce_xiang_qing.html的算法
async function testStatsPeriodFifthLast(backtestPeriod, statsPeriod, backtestMethod) {
  try {
    const backtestData = await dao_shu_5_qi_mai_hao_hui_ce(backtestPeriod, statsPeriod, backtestMethod);
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

// 获取前区推荐买号 - 使用与dao_shu_3_qi_liang_qiu_zu_he.html相同的算法
async function huo_qu_qian_qu_tui_jian_mai_hao_third_last(statsPeriod, backtestMethod) {
  try {
    // 调用dao_shu_3_qi_liang_qiu_zu_he接口获取倒数3期两球组合数据
    const response = await fetch(`http://localhost:18889/dao_shu_3_qi_liang_qiu_zu_he?period=${statsPeriod}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (result.success) {
      const analysisData = result.data;
      let frontBuyNumbers = [];
      
      // 初始化汇总计数数组 - 与dao_shu_3_qi_liang_qiu_zu_he.html完全相同
      const totalCounts = new Array(36).fill(0); // 索引0不使用，1-35对应前区号码
      
      // 遍历前区组合，统计每个号码的出现次数 - 与dao_shu_3_qi_liang_qiu_zu_he.html完全相同
      analysisData.combinations.forEach(combo => {
        // 累加每个号码的出现次数
        for (let i = 1; i <= 35; i++) {
          const numStr = String(i);
          let count = 0;
          if (combo.nextDrawNumbers && Array.isArray(combo.nextDrawNumbers)) {
            count = combo.nextDrawNumbers.filter(n => n === numStr).length;
          }
          totalCounts[i] += count;
        }
      });
      
      // 根据回测方法计算对应的前区推荐买号 - 与dao_shu_3_qi_liang_qiu_zu_he.html完全相同
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
      } else if (backtestMethod.match(/^rank(\d+)$/)) {
        // 排名方法：根据排名选择号码
        const rankMatch = backtestMethod.match(/^rank(\d+)$/);
        const rank = parseInt(rankMatch[1]);
        
        // 按出现次数降序排序号码（包括出现次数为0的号码） - 与dao_shu_3_qi_liang_qiu_zu_he.html完全一致
        const sortedNumbers = [];
        for (let i = 1; i <= 35; i++) {
          sortedNumbers.push({ number: i, count: totalCounts[i] || 0 });
        }
        sortedNumbers.sort((a, b) => b.count - a.count);
        
        // 计算每个号码的实际排名 - 与dao_shu_3_qi_liang_qiu_zu_he.html完全一致
        const rankMap = {};
        let currentRank = 1;
        
        for (let i = 0; i < sortedNumbers.length; i++) {
          if (i > 0 && sortedNumbers[i].count !== sortedNumbers[i - 1].count) {
            currentRank++;
          }
          rankMap[sortedNumbers[i].number] = currentRank;
        }
        
        // 找出所有排名等于指定排名的号码
        for (let i = 1; i <= 35; i++) {
          if (rankMap[i] === rank) {
            frontBuyNumbers.push(i);
          }
        }
      }
      
      return frontBuyNumbers;
    } else {
      alert('接口失败');
      return [];
    }
  } catch (error) {
    console.error('获取前区推荐买号失败:', error);
    return [];
  }
}

// 获取前区推荐买号 - 使用与dao_shu_4_qi_liang_qiu_zu_he.html相同的算法
async function huo_qu_qian_qu_tui_jian_mai_hao_fourth_last(statsPeriod, backtestMethod) {
  try {
    // 调用dao_shu_4_qi_liang_qiu_zu_he接口获取倒数4期两球组合数据
    const response = await fetch(`http://localhost:18889/dao_shu_4_qi_liang_qiu_zu_he?period=${statsPeriod}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (result.success) {
      const analysisData = result.data;
      let frontBuyNumbers = [];
      
      // 初始化汇总计数数组 - 与dao_shu_4_qi_liang_qiu_zu_he.html完全相同
      const totalCounts = new Array(36).fill(0); // 索引0不使用，1-35对应前区号码
      
      // 遍历前区组合，统计每个号码的出现次数 - 与dao_shu_4_qi_liang_qiu_zu_he.html完全相同
      analysisData.combinations.forEach(combo => {
        // 累加每个号码的出现次数
        for (let i = 1; i <= 35; i++) {
          const numStr = String(i).padStart(2, '0'); // 使用两位格式的号码，与后端一致
          // 安全访问nextDrawNumbers属性
          let count = 0;
          if (combo.nextDrawNumbers && Array.isArray(combo.nextDrawNumbers)) {
            count = combo.nextDrawNumbers.filter(n => n === numStr).length;
          }
          totalCounts[i] += count;
        }
      });
      
      // 根据回测方法计算对应的前区推荐买号 - 与dao_shu_4_qi_liang_qiu_zu_he.html完全相同
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
      } else if (backtestMethod.match(/^rank(\d+)$/)) {
        // 排名方法：根据排名选择号码
        const rankMatch = backtestMethod.match(/^rank(\d+)$/);
        const rank = parseInt(rankMatch[1]);
        
        // 计算排名 - 与dao_shu_4_qi_liang_qiu_zu_he.html完全相同
        const rankMap = {};
        const sortedNumbers = [];
        for (let i = 1; i <= 35; i++) {
          sortedNumbers.push({ number: i, count: totalCounts[i] || 0 });
        }
        // 按出现次数降序排序
        sortedNumbers.sort((a, b) => b.count - a.count);
        // 计算排名
        let currentRank = 1;
        for (let i = 0; i < sortedNumbers.length; i++) {
          if (i > 0 && sortedNumbers[i].count !== sortedNumbers[i - 1].count) {
            currentRank++;
          }
          rankMap[sortedNumbers[i].number] = currentRank;
        }
        
        // 找出对应排名的号码
        for (let i = 1; i <= 35; i++) {
          if (rankMap[i] === rank) {
            frontBuyNumbers.push(i);
          }
        }
      }
      
      return frontBuyNumbers;
    } else {
      alert('接口失败');
      return [];
    }
  } catch (error) {
    console.error('获取前区推荐买号失败:', error);
    return [];
  }
}

// 获取前区推荐买号 - 使用与dao_shu_5_qi_liang_qiu_zu_he.html相同的算法
async function huo_qu_qian_qu_tui_jian_mai_hao_fifth_last(statsPeriod, backtestMethod) {
  try {
    // 调用dao_shu_5_qi_liang_qiu_zu_he接口获取倒数5期两球组合数据
    const response = await fetch(`http://localhost:18889/dao_shu_5_qi_liang_qiu_zu_he?period=${statsPeriod}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (result.success) {
      const analysisData = result.data;
      
      // 初始化汇总计数数组 - 与dao_shu_5_qi_liang_qiu_zu_he.html完全相同
      const totalCounts = new Array(36).fill(0); // 索引0不使用，1-35对应前区号码
      
      // 遍历前区组合，统计每个号码的出现次数 - 与dao_shu_5_qi_liang_qiu_zu_he.html完全相同
      analysisData.combinations.forEach(combo => {
        // 累加每个号码的出现次数
        for (let i = 1; i <= 35; i++) {
          const numStr = String(i).padStart(2, '0'); // 使用两位格式的号码，与后端一致
          // 安全访问nextDrawNumbers属性
          let count = 0;
          if (combo.nextDrawNumbers && Array.isArray(combo.nextDrawNumbers)) {
            count = combo.nextDrawNumbers.filter(n => n === numStr).length;
          }
          totalCounts[i] += count;
        }
      });
      
      // 排名方法：根据排名获取对应的号码
      let frontBuyNumbers = [];
      if (backtestMethod.startsWith('rank')) {
        const rankMatch = backtestMethod.match(/^rank(\d+)$/);
        if (rankMatch) {
          const targetRank = parseInt(rankMatch[1]);
          
          // 计算排名 - 与dao_shu_5_qi_liang_qiu_zu_he.html完全相同
          const rankMap = {};
          const sortedNumbers = [];
          for (let i = 1; i <= 35; i++) {
            sortedNumbers.push({ number: i, count: totalCounts[i] || 0 });
          }
          // 按出现次数降序排序
          sortedNumbers.sort((a, b) => b.count - a.count);
          // 计算排名
          let currentRank = 1;
          for (let i = 0; i < sortedNumbers.length; i++) {
            if (i > 0 && sortedNumbers[i].count !== sortedNumbers[i - 1].count) {
              currentRank++;
            }
            rankMap[sortedNumbers[i].number] = currentRank;
          }
          
          // 找出对应排名的号码
          for (let i = 1; i <= 35; i++) {
            if (rankMap[i] === targetRank) {
              frontBuyNumbers.push(i);
            }
          }
        }
      }
      
      return frontBuyNumbers;
    } else {
      alert('接口失败');
      return [];
    }
  } catch (error) {
    console.error('获取前区推荐买号失败:', error);
    return [];
  }
}

// 渲染详情数据 - 倒数3期
async function renderDetailDataThirdLast(allResults, nextPeriod) {
  const detailResults = document.getElementById('detailResultsThirdLast');
  const buyNumbersContent = document.getElementById('buyNumbersCollectionContentThirdLast');
  
  try {
    // 清空当前内容
    detailResults.innerHTML = '';
    
    // 如果没有结果，显示提示
    if (allResults.length === 0) {
      detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #666;">未找到平均率最高的统计期</td></tr>';
      return;
    }
    
    // 过滤回测结果：如果回测方法相同且下下下期前区推荐买号相同，只保留一条
    const uniqueResultsMap = new Map();
    
    allResults.forEach(result => {
      // 基于回测方法和下下下期前区推荐买号（排序后）创建唯一键
      const sortedBuyNumbers = [...(result.frontBuyNumbers || [])].sort((a, b) => a - b);
      const uniqueKey = `${result.backtestMethod}_${sortedBuyNumbers.join('_')}`;
      
      // 只保留第一条出现的结果
      if (!uniqueResultsMap.has(uniqueKey)) {
        uniqueResultsMap.set(uniqueKey, result);
      }
    });
    
    // 将过滤后的结果转换回数组
    const filteredResults = Array.from(uniqueResultsMap.values());
    
    // 按照平均正确率降序排序
    filteredResults.sort((a, b) => b.accuracy - a.accuracy);
    
    // 遍历过滤后的结果
    const allBuyNumbers = [];
    for (const result of filteredResults) {
      const { statsPeriod, accuracy, backtestMethod, frontBuyNumbers } = result;
      
      // 平均正确率已经在搜索阶段计算好
      const averageCorrectRate = accuracy.toFixed(3);
      
      // 获取回测方法中文名称
      let backtestMethodText = '出现最多';
      if (backtestMethod === 'least') {
        backtestMethodText = '出现最少';
      } else if (backtestMethod === 'average') {
        backtestMethodText = '出现平均';
      } else if (backtestMethod.match(/^rank(\d+)$/)) {
        // 排名方法：显示为"排名第X"
        const rankMatch = backtestMethod.match(/^rank(\d+)$/);
        const rank = parseInt(rankMatch[1]);
        backtestMethodText = `排名第${rank}`;
      }
      
      // 格式化前区推荐买号
      const frontBuyNumbersStr = frontBuyNumbers.map(num => `<span class="red-ball">${num}</span>`).join(' ');
      
      // 创建表格行
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${backtestMethodText}</td>
        <td>${backtestPeriod}期</td>
        <td>${statsPeriod}期</td>
        <td>${averageCorrectRate}%</td>
        <td>${nextPeriod}</td>
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
      
      // 收集所有推荐买号
      frontBuyNumbers.forEach(num => {
        if (!allBuyNumbers.includes(num)) {
          allBuyNumbers.push(num);
        }
      });
    }
    
    // 更新推荐买号合集
    if (buyNumbersContent) {
      if (allBuyNumbers.length > 0) {
        // 按平均正确率累加进行排序，同一个推荐买号的球，回测方法相同时，只保留平均正确率大的
        const numberAccuracyMap = new Map();
        
        // 遍历所有结果，计算每个号码的平均正确率累加
        filteredResults.forEach(result => {
          const { accuracy, backtestMethod, frontBuyNumbers } = result;
          
          if (frontBuyNumbers && frontBuyNumbers.length > 0) {
            frontBuyNumbers.forEach(num => {
              const numStr = num.toString();
              const key = `${backtestMethod}_${numStr}`;
              
              if (numberAccuracyMap.has(key)) {
                // 检查回测方法是否相同
                const existingData = numberAccuracyMap.get(key);
                if (existingData.backtestMethod === backtestMethod) {
                  // 如果回测方法相同，只保留平均正确率大的
                  if (accuracy > existingData.accuracy) {
                    numberAccuracyMap.set(key, { accuracy, backtestMethod, number: num });
                  }
                }
              } else {
                // 第一次出现，直接添加
                numberAccuracyMap.set(key, { accuracy, backtestMethod, number: num });
              }
            });
          }
        });
        
        // 现在对每个号码，按回测方法分组，相同回测方法只保留最高正确率，不同回测方法累加
        const finalNumberMap = new Map();
        numberAccuracyMap.forEach((data, key) => {
          const { accuracy, backtestMethod, number } = data;
          const numStr = number.toString();
          
          if (finalNumberMap.has(numStr)) {
            const existingData = finalNumberMap.get(numStr);
            // 不同回测方法，累加正确率
            const newAccuracy = existingData.accuracy + accuracy;
            finalNumberMap.set(numStr, { accuracy: newAccuracy, backtestMethod: 'combined', number: number });
          } else {
            finalNumberMap.set(numStr, { accuracy, backtestMethod, number: number });
          }
        });
        
        // 转换为数组并按平均正确率降序排序
        const sortedNumbers = Array.from(finalNumberMap.values())
          .sort((a, b) => b.accuracy - a.accuracy);
        
        // 生成推荐买号合集的HTML
        buyNumbersContent.innerHTML = sortedNumbers.map(item => {
          const accuracyText = item.accuracy.toFixed(3);
          return `<div style="display: flex; align-items: center; gap: 5px;">
            <div class="red-ball">${item.number}</div>
            <div style="font-size: 12px; color: #666;">${accuracyText}%</div>
          </div>`;
        }).join(' ');
      } else {
        buyNumbersContent.innerHTML = '<div style="color: #666;">暂无推荐买号数据</div>';
      }
    }
  } catch (error) {
    console.error('渲染详情数据失败:', error);
    detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">加载失败，请重试</td></tr>';
  }
}

// 渲染详情数据 - 倒数4期
async function renderDetailDataFourthLast(allResults, nextPeriod) {
  const detailResults = document.getElementById('detailResultsFourthLast');
  const buyNumbersContent = document.getElementById('buyNumbersCollectionContentFourthLast');
  
  try {
    // 清空当前内容
    detailResults.innerHTML = '';
    
    // 如果没有结果，显示提示
    if (allResults.length === 0) {
      detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #666;">未找到平均率最高的统计期</td></tr>';
      return;
    }
    
    // 过滤回测结果：如果回测方法相同且下下下下期前区推荐买号相同，只保留一条
    const uniqueResultsMap = new Map();
    
    allResults.forEach(result => {
      // 基于回测方法和下下下下期前区推荐买号（排序后）创建唯一键
      const sortedBuyNumbers = [...(result.frontBuyNumbers || [])].sort((a, b) => a - b);
      const uniqueKey = `${result.backtestMethod}_${sortedBuyNumbers.join('_')}`;
      
      // 只保留第一条出现的结果
      if (!uniqueResultsMap.has(uniqueKey)) {
        uniqueResultsMap.set(uniqueKey, result);
      }
    });
    
    // 将过滤后的结果转换回数组
    const filteredResults = Array.from(uniqueResultsMap.values());
    
    // 按照平均正确率降序排序
    filteredResults.sort((a, b) => b.accuracy - a.accuracy);
    
    // 遍历过滤后的结果
    const allBuyNumbers = [];
    for (const result of filteredResults) {
      const { statsPeriod, accuracy, backtestMethod, frontBuyNumbers } = result;
      
      // 平均正确率已经在搜索阶段计算好
      const averageCorrectRate = accuracy.toFixed(3);
      
      // 获取回测方法中文名称
      let backtestMethodText = '出现最多';
      if (backtestMethod === 'least') {
        backtestMethodText = '出现最少';
      } else if (backtestMethod === 'average') {
        backtestMethodText = '出现平均';
      } else if (backtestMethod.match(/^rank(\d+)$/)) {
        // 排名方法：显示为"排名第X"
        const rankMatch = backtestMethod.match(/^rank(\d+)$/);
        const rank = parseInt(rankMatch[1]);
        backtestMethodText = `排名第${rank}`;
      }
      
      // 格式化前区推荐买号
      const frontBuyNumbersStr = frontBuyNumbers.map(num => `<span class="red-ball">${num}</span>`).join(' ');
      
      // 创建表格行
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${backtestMethodText}</td>
        <td>${backtestPeriod}期</td>
        <td>${statsPeriod}期</td>
        <td>${averageCorrectRate}%</td>
        <td>${nextPeriod}</td>
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
      
      // 收集所有推荐买号
      frontBuyNumbers.forEach(num => {
        if (!allBuyNumbers.includes(num)) {
          allBuyNumbers.push(num);
        }
      });
    }
    
    // 更新推荐买号合集
    if (buyNumbersContent) {
      if (allBuyNumbers.length > 0) {
        // 按平均正确率累加进行排序，同一个推荐买号的球，回测方法相同时，只保留平均正确率大的
        const numberAccuracyMap = new Map();
        
        // 遍历所有结果，计算每个号码的平均正确率累加
        filteredResults.forEach(result => {
          const { accuracy, backtestMethod, frontBuyNumbers } = result;
          
          if (frontBuyNumbers && frontBuyNumbers.length > 0) {
            frontBuyNumbers.forEach(num => {
              const numStr = num.toString();
              const key = `${backtestMethod}_${numStr}`;
              
              if (numberAccuracyMap.has(key)) {
                // 检查回测方法是否相同
                const existingData = numberAccuracyMap.get(key);
                if (existingData.backtestMethod === backtestMethod) {
                  // 如果回测方法相同，只保留平均正确率大的
                  if (accuracy > existingData.accuracy) {
                    numberAccuracyMap.set(key, { accuracy, backtestMethod, number: num });
                  }
                }
              } else {
                // 第一次出现，直接添加
                numberAccuracyMap.set(key, { accuracy, backtestMethod, number: num });
              }
            });
          }
        });
        
        // 现在对每个号码，按回测方法分组，相同回测方法只保留最高正确率，不同回测方法累加
        const finalNumberMap = new Map();
        numberAccuracyMap.forEach((data, key) => {
          const { accuracy, backtestMethod, number } = data;
          const numStr = number.toString();
          
          if (finalNumberMap.has(numStr)) {
            const existingData = finalNumberMap.get(numStr);
            // 不同回测方法，累加正确率
            const newAccuracy = existingData.accuracy + accuracy;
            finalNumberMap.set(numStr, { accuracy: newAccuracy, backtestMethod: 'combined', number: number });
          } else {
            finalNumberMap.set(numStr, { accuracy, backtestMethod, number: number });
          }
        });
        
        // 转换为数组并按平均正确率降序排序
        const sortedNumbers = Array.from(finalNumberMap.values())
          .sort((a, b) => b.accuracy - a.accuracy);
        
        // 生成推荐买号合集的HTML
        buyNumbersContent.innerHTML = sortedNumbers.map(item => {
          const accuracyText = item.accuracy.toFixed(3);
          return `<div style="display: flex; align-items: center; gap: 5px;">
            <div class="red-ball">${item.number}</div>
            <div style="font-size: 12px; color: #666;">${accuracyText}%</div>
          </div>`;
        }).join(' ');
      } else {
        buyNumbersContent.innerHTML = '<div style="color: #666;">暂无推荐买号数据</div>';
      }
    }
  } catch (error) {
    console.error('渲染详情数据失败:', error);
    detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">加载失败，请重试</td></tr>';
  }
}

// 渲染详情数据 - 倒数5期
async function renderDetailDataFifthLast(allResults, nextPeriod) {
  const detailResults = document.getElementById('detailResultsFifthLast');
  const buyNumbersContent = document.getElementById('buyNumbersCollectionContentFifthLast');
  
  try {
    // 清空当前内容
    detailResults.innerHTML = '';
    
    // 如果没有结果，显示提示
    if (allResults.length === 0) {
      detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #666;">未找到平均率最高的统计期</td></tr>';
      return;
    }
    
    // 过滤回测结果：如果回测方法相同且前区推荐买号相同，只保留一条
    const uniqueResultsMap = new Map();
    
    allResults.forEach(result => {
      // 基于回测方法和前区推荐买号（排序后）创建唯一键
      const sortedBuyNumbers = [...(result.frontBuyNumbers || [])].sort((a, b) => a - b);
      const uniqueKey = `${result.backtestMethod}_${sortedBuyNumbers.join('_')}`;
      
      // 只保留第一条出现的结果
      if (!uniqueResultsMap.has(uniqueKey)) {
        uniqueResultsMap.set(uniqueKey, result);
      }
    });
    
    // 将过滤后的结果转换回数组
    const filteredResults = Array.from(uniqueResultsMap.values());
    
    // 按照平均正确率降序排序
    filteredResults.sort((a, b) => b.accuracy - a.accuracy);
    
    // 遍历过滤后的结果
    const allBuyNumbers = [];
    for (const result of filteredResults) {
      const { statsPeriod, accuracy, backtestMethod, frontBuyNumbers } = result;
      
      // 平均正确率已经在搜索阶段计算好
      const averageCorrectRate = accuracy.toFixed(3);
      
      // 获取回测方法中文名称
      let backtestMethodText = '出现最多';
      if (backtestMethod === 'least') {
        backtestMethodText = '出现最少';
      } else if (backtestMethod === 'average') {
        backtestMethodText = '出现平均';
      } else if (backtestMethod.startsWith('rank')) {
        const rankMatch = backtestMethod.match(/^rank(\d+)$/);
        if (rankMatch) {
          backtestMethodText = `排名第${rankMatch[1]}`;
        }
      }
      
      // 格式化前区推荐买号
      const frontBuyNumbersStr = frontBuyNumbers.map(num => `<span class="red-ball">${num}</span>`).join(' ');
      
      // 创建表格行
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${backtestMethodText}</td>
        <td>${backtestPeriod}期</td>
        <td>${statsPeriod}期</td>
        <td>${averageCorrectRate}%</td>
        <td>${nextPeriod}</td>
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
      
      // 收集所有推荐买号
      frontBuyNumbers.forEach(num => {
        if (!allBuyNumbers.includes(num)) {
          allBuyNumbers.push(num);
        }
      });
    }
    
    // 更新推荐买号合集
    if (buyNumbersContent) {
      if (allBuyNumbers.length > 0) {
        // 按平均正确率累加进行排序，同一个推荐买号的球，回测方法相同时，只保留平均正确率大的
        const numberAccuracyMap = new Map();
        
        // 遍历所有结果，计算每个号码的平均正确率累加
        filteredResults.forEach(result => {
          const { accuracy, backtestMethod, frontBuyNumbers } = result;
          
          if (frontBuyNumbers && frontBuyNumbers.length > 0) {
            frontBuyNumbers.forEach(num => {
              const numStr = num.toString();
              const key = `${backtestMethod}_${numStr}`;
              
              if (numberAccuracyMap.has(key)) {
                // 检查回测方法是否相同
                const existingData = numberAccuracyMap.get(key);
                if (existingData.backtestMethod === backtestMethod) {
                  // 如果回测方法相同，只保留平均正确率大的
                  if (accuracy > existingData.accuracy) {
                    numberAccuracyMap.set(key, { accuracy, backtestMethod, number: num });
                  }
                }
              } else {
                // 第一次出现，直接添加
                numberAccuracyMap.set(key, { accuracy, backtestMethod, number: num });
              }
            });
          }
        });
        
        // 现在对每个号码，按回测方法分组，相同回测方法只保留最高正确率，不同回测方法累加
        const finalNumberMap = new Map();
        numberAccuracyMap.forEach((data, key) => {
          const { accuracy, backtestMethod, number } = data;
          const numStr = number.toString();
          
          if (finalNumberMap.has(numStr)) {
            const existingData = finalNumberMap.get(numStr);
            // 不同回测方法，累加正确率
            const newAccuracy = existingData.accuracy + accuracy;
            finalNumberMap.set(numStr, { accuracy: newAccuracy, backtestMethod: 'combined', number: number });
          } else {
            finalNumberMap.set(numStr, { accuracy, backtestMethod, number: number });
          }
        });
        
        // 转换为数组并按平均正确率降序排序
        const sortedNumbers = Array.from(finalNumberMap.values())
          .sort((a, b) => b.accuracy - a.accuracy);
        
        // 生成推荐买号合集的HTML
        buyNumbersContent.innerHTML = sortedNumbers.map(item => {
          const accuracyText = item.accuracy.toFixed(3);
          return `<div style="display: flex; align-items: center; gap: 5px;">
            <div class="red-ball">${item.number}</div>
            <div style="font-size: 12px; color: #666;">${accuracyText}%</div>
          </div>`;
        }).join(' ');
      } else {
        buyNumbersContent.innerHTML = '<div style="color: #666;">暂无推荐买号数据</div>';
      }
    }
  } catch (error) {
    console.error('渲染详情数据失败:', error);
    detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">加载失败，请重试</td></tr>';
  }
}

// 倒数3期两球组合平均率最高统计期详情回测函数
async function performSearchThirdLast() {
  const progressDiv = document.getElementById('progressThirdLast');
  const progressText = document.getElementById('progressTextThirdLast');
  const progressBar = document.getElementById('progressBarThirdLast');
  const progressPercentage = document.getElementById('progressPercentageThirdLast');
  const currentPhase = document.getElementById('currentPhaseThirdLast');
  const detailResults = document.getElementById('detailResultsThirdLast');
  const startBacktestBtn = document.getElementById('startBacktestBtnThirdLast');
  const stopBacktestBtn = document.getElementById('stopBacktestBtnThirdLast');
  
  // 进度计算变量
  let totalProgress = 0;
  let currentStep = 0;
  let totalSteps = 0;
  
  // 终止标志
  let isBacktestStopped = false;
  
  // 更新进度的函数
  function updateProgress(text, percentage, phase) {
    return new Promise(resolve => {
      // 减少DOM更新频率，只在百分比变化较大时更新
      const roundedPercentage = Math.round(percentage);
      const currentRoundedPercentage = Math.round(parseFloat(progressBar.style.width || '0%'));
      
      if (Math.abs(roundedPercentage - currentRoundedPercentage) >= 5 || roundedPercentage === 100) {
        // 直接更新DOM，不依赖requestAnimationFrame
        progressText.textContent = text;
        progressBar.style.width = `${percentage}%`;
        progressPercentage.textContent = `${roundedPercentage}%`;
        currentPhase.textContent = phase;
      }
      resolve();
    });
  }
  
  try {
    // 显示终止回测按钮，隐藏开始回测按钮
    startBacktestBtn.style.display = 'none';
    stopBacktestBtn.style.display = 'inline-block';
    
    // 立即显示进度条，直接更新DOM
    await new Promise(resolve => {
      progressDiv.style.display = 'block';
      progressText.textContent = '开始搜索平均率最高的统计期..';
      progressBar.style.width = '0%';
      progressPercentage.textContent = '0%';
      currentPhase.textContent = '正在准备...';
      detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #666;">正在搜索平均率最高的统计期..</td></tr>';
      resolve();
    });
    
    // 重置终止标志
    isBacktestStopped = false;
    
    // 添加终止回测按钮点击事件
    stopBacktestBtn.onclick = function() {
      isBacktestStopped = true;
      updateProgress('回测已终止', 100, '回测终止');
    };
    
    // 使用全局配置的回测期数
    const currentBacktestPeriod = backtestPeriod;
    
    // 更新进度
    await updateProgress('正在获取总期数..', 5, '获取总期数');
    
    const totalPeriods = await getTotalPeriods();
    
    // 多阶段搜索策略，从大到小变化步长
    const searchStages = [
      { step: 200, expansion: 400 }, // 第一阶段：步长200，扩展范围400
      { step: 100, expansion: 200 },   // 第二阶段：步长100，扩展范围200
      { step: 50, expansion: 100 }    // 第三阶段：步长50，扩展范围100
    ];
    
    // 回测方法：只包含排名方法
    const backtestMethods = [];
    // 添加排名方法
    for (let i = 1; i <= 30; i++) {
      backtestMethods.push(`rank${i}`);
    }
    const allResults = [];
    
    // 计算总工作量
    totalSteps = backtestMethods.length * searchStages.length + 3; // 3个初始化和收尾步骤
    
    // 更新进度
    await updateProgress('正在获取最新一期期号..', 10, '获取最新期号');
    currentStep++;
    
    // 获取最后一期期号
    const lastPeriod = await getLastPeriod();
    const nextPeriod = (parseInt(lastPeriod) + 3) + '期'; // 使用最近期的期号+3作为下下下期期号
    
    // 遍历所有回测方法
    for (const backtestMethod of backtestMethods) {
      // 获取回测方法中文名称
      let methodName = '出现最多';
      if (backtestMethod === 'least') {
        methodName = '出现最少';
      } else if (backtestMethod === 'average') {
        methodName = '出现平均';
      } else if (backtestMethod.match(/^rank(\d+)$/)) {
        // 排名方法：显示为"排名第X"
        const rankMatch = backtestMethod.match(/^rank(\d+)$/);
        const rank = parseInt(rankMatch[1]);
        methodName = `排名第${rank}`;
      }
      
      // 更新进度
      await updateProgress(`正在搜索回测方法: ${methodName}...`, 15 + (currentStep / totalSteps) * 60, `搜索回测方法: ${methodName}`);
      currentStep++;
      
      // 所有回测方法都从1500期开始
      let currentStart = 1500;
      let currentEnd = totalPeriods;
      let allTestResults = [];
      
      // 执行每个阶段的搜索
      for (let stageIndex = 0; stageIndex < searchStages.length; stageIndex++) {
        const stage = searchStages[stageIndex];
        const { step, expansion } = stage;
        
        // 更新进度
        const stageProgress = 15 + (currentStep / totalSteps) * 60;
        await updateProgress(
          `正在进行${methodName}方法的第${stageIndex + 1}阶段搜索（步长：${step}期）..`, 
          stageProgress, 
          `阶段${stageIndex + 1}，步长${step}`
        );
        currentStep++;
        
        let stageResults = [];
        
        // 计算当前阶段的期数范围和总次数
        const stageTotal = Math.ceil((currentEnd - currentStart) / step) + 1;
        
        // 生成所有需要测试的期数
        const testPeriods = [];
        for (let i = currentStart; i <= currentEnd; i += step) {
          testPeriods.push(i);
        }
        
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          break;
        }
        
        // 实时更新进度
        await updateProgress(
          `正在并行测试${testPeriods.length}个统计期..`, 
          15 + ((currentStep - 1) / totalSteps) * 60, 
          `并行测试 ${testPeriods.length} 个期数`
        );
        
        // 并行测试所有统计期
        const promises = testPeriods.map(period => testStatsPeriodThirdLast(currentBacktestPeriod, period, backtestMethod));
        const results = await Promise.all(promises);
        
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          break;
        }
        
        // 添加测试结果
        stageResults.push(...results);
        allTestResults.push(...results);
        
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          break;
        }
        
        // 如果当前阶段没有结果，继续下一阶段
        if (stageResults.length === 0) {
          continue;
        }
        
        // 找出当前阶段的最高正确率
        const highestAccuracy = Math.max(...stageResults.map(result => result.accuracy));
        
        // 找出当前阶段中所有最高正确率的结果
        const highestResultsInStage = stageResults.filter(result => result.accuracy === highestAccuracy);
        
        // 计算下一阶段的搜索范围
        const minStatsPeriod = Math.min(...highestResultsInStage.map(result => result.statsPeriod));
        const maxStatsPeriod = Math.max(...highestResultsInStage.map(result => result.statsPeriod));
        
        // 所有回测方法都使用1500期作为最小限制
        const minLimit = 1500;
        currentStart = Math.max(minLimit, minStatsPeriod - expansion);
        currentEnd = Math.min(totalPeriods, maxStatsPeriod + expansion);
      }
      
      // 从所有测试结果中找出最高正确率
      const highestAccuracy = Math.max(...allTestResults.map(result => result.accuracy));
      
      // 找出所有正确率等于最高值的期数
      const highestPeriods = allTestResults.filter(result => result.accuracy === highestAccuracy);
      
      // 对期数进行去重处理
      const uniquePeriodsMap = new Map();
      highestPeriods.forEach(result => {
        if (!uniquePeriodsMap.has(result.statsPeriod)) {
          uniquePeriodsMap.set(result.statsPeriod, result);
        }
      });
      
      // 将去重后的结果转换回数组，并添加回测方法信息
      const uniqueHighestPeriods = Array.from(uniquePeriodsMap.values()).map(result => ({
        ...result,
        backtestMethod
      }));
      
      // 添加到所有结果中
      allResults.push(...uniqueHighestPeriods);
    }
    
    // 更新进度
    await updateProgress('搜索完成，正在获取前区推荐买号..', 85, '获取前区推荐买号');
    currentStep++;
    
    // 为每个结果获取前区推荐买号，并过滤掉空推荐号码的排名方法结果
    const validResults = [];
    for (let i = 0; i < allResults.length; i++) {
      // 检查是否需要终止回测
      if (isBacktestStopped) {
        break;
      }
      
      const result = allResults[i];
      // 获取回测方法中文名称
      let methodName = '出现最多';
      if (result.backtestMethod === 'least') {
        methodName = '出现最少';
      } else if (result.backtestMethod === 'average') {
        methodName = '出现平均';
      } else if (result.backtestMethod.match(/^rank(\d+)$/)) {
        // 排名方法：显示为"排名第X"
        const rankMatch = result.backtestMethod.match(/^rank(\d+)$/);
        const rank = parseInt(rankMatch[1]);
        methodName = `排名第${rank}`;
      }
      
      // 更新进度
      const buyProgress = 85 + ((i + 1) / allResults.length) * 10;
      await updateProgress(
        `正在获取统计期${result.statsPeriod}期，${methodName}方法的前区推荐买号..`, 
        buyProgress, 
        `处理结果 ${i + 1}/${allResults.length}`
      );
      
      result.frontBuyNumbers = await huo_qu_qian_qu_tui_jian_mai_hao_third_last(result.statsPeriod, result.backtestMethod);
      
      // 如果是排名方法且没有找到对应排名的号码（返回空数组），则跳过该结果
      if (result.backtestMethod.match(/^rank(\d+)$/) && result.frontBuyNumbers.length === 0) {
        continue;
      }
      
      // 将有效的结果添加到validResults数组中
      validResults.push(result);
    }
    
    // 检查是否需要终止回测
    if (isBacktestStopped) {
      detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">回测已终止</td></tr>';
    } else {
      // 更新进度
      await updateProgress(`找到 ${validResults.length} 个平均率最高的统计期，正在渲染结果...`, 98, '渲染结果');
      currentStep++;
      
      // 渲染详情数据，传递过滤后的结果和下下下期期号
      await renderDetailDataThirdLast(validResults, nextPeriod);
      
      // 存储回测结果到全局变量
      backtestResults['thirdLast'] = {
        results: validResults,
        nextPeriod: nextPeriod,
        timestamp: new Date().toISOString()
      };
      
      // 更新进度
      await updateProgress('搜索完成，正在隐藏进度条...', 100, '完成');
    }
    
    // 隐藏进度
    await new Promise(resolve => {
      setTimeout(() => {
        progressDiv.style.display = 'none';
        resolve();
      }, 500);
    });
    
  } catch (error) {
    console.error('搜索最高正确率统计期失败', error);
    
    // 更新进度
    await updateProgress('搜索失败，请重试', 100, '搜索失败');
    detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">搜索失败，请重试</td></tr>';
  } finally {
    // 恢复按钮状态
    startBacktestBtn.style.display = 'inline-block';
    stopBacktestBtn.style.display = 'none';
    // 重置终止标志
    isBacktestStopped = false;
  }
}

// 倒数4期两球组合平均率最高统计期详情回测函数
async function performSearchFourthLast() {
  const progressDiv = document.getElementById('progressFourthLast');
  const progressText = document.getElementById('progressTextFourthLast');
  const progressBar = document.getElementById('progressBarFourthLast');
  const progressPercentage = document.getElementById('progressPercentageFourthLast');
  const currentPhase = document.getElementById('currentPhaseFourthLast');
  const detailResults = document.getElementById('detailResultsFourthLast');
  const startBacktestBtn = document.getElementById('startBacktestBtnFourthLast');
  const stopBacktestBtn = document.getElementById('stopBacktestBtnFourthLast');
  
  // 进度计算变量
  let totalProgress = 0;
  let currentStep = 0;
  let totalSteps = 0;
  
  // 终止标志
  let isBacktestStopped = false;
  
  // 更新进度的函数
  function updateProgress(text, percentage, phase) {
    return new Promise(resolve => {
      // 减少DOM更新频率，只在百分比变化较大时更新
      const roundedPercentage = Math.round(percentage);
      const currentRoundedPercentage = Math.round(parseFloat(progressBar.style.width || '0%'));
      
      if (Math.abs(roundedPercentage - currentRoundedPercentage) >= 5 || roundedPercentage === 100) {
        // 直接更新DOM，不依赖requestAnimationFrame
        progressText.textContent = text;
        progressBar.style.width = `${percentage}%`;
        progressPercentage.textContent = `${roundedPercentage}%`;
        currentPhase.textContent = phase;
      }
      resolve();
    });
  }
  
  try {
    // 显示终止回测按钮，隐藏开始回测按钮
    startBacktestBtn.style.display = 'none';
    stopBacktestBtn.style.display = 'inline-block';
    
    // 立即显示进度条，直接更新DOM
    await new Promise(resolve => {
      progressDiv.style.display = 'block';
      progressText.textContent = '开始搜索平均率最高的统计期..';
      progressBar.style.width = '0%';
      progressPercentage.textContent = '0%';
      currentPhase.textContent = '正在准备...';
      detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #666;">正在搜索平均率最高的统计期..</td></tr>';
      resolve();
    });
    
    // 重置终止标志
    isBacktestStopped = false;
    
    // 添加终止回测按钮点击事件
    stopBacktestBtn.onclick = function() {
      isBacktestStopped = true;
      updateProgress('回测已终止', 100, '回测终止');
    };
    
    // 使用全局配置的回测期数
    const currentBacktestPeriod = backtestPeriod;
    
    // 更新进度
    await updateProgress('正在获取总期数..', 5, '获取总期数');
    
    const totalPeriods = await getTotalPeriods();
    
    // 多阶段搜索策略，从大到小变化步长
    const searchStages = [
      { step: 200, expansion: 400 }, // 第一阶段：步长200，扩展范围400
      { step: 100, expansion: 200 },   // 第二阶段：步长100，扩展范围200
      { step: 50, expansion: 100 }    // 第三阶段：步长50，扩展范围100
    ];
    
    // 回测方法：只包含排名方法
    const backtestMethods = [];
    // 添加排名方法
    for (let i = 1; i <= 30; i++) {
      backtestMethods.push(`rank${i}`);
    }
    const allResults = [];
    
    // 计算总工作量
    totalSteps = backtestMethods.length * searchStages.length + 3; // 3个初始化和收尾步骤
    
    // 更新进度
    await updateProgress('正在获取最新一期期号..', 10, '获取最新期号');
    currentStep++;
    
    // 获取最后一期期号
    const lastPeriod = await getLastPeriod();
    const nextPeriod = (parseInt(lastPeriod) + 4) + '期'; // 使用最近期的期号+4作为下下下下期期号
    
    // 遍历所有回测方法
    for (const backtestMethod of backtestMethods) {
      // 获取回测方法中文名称
      let methodName = '出现最多';
      if (backtestMethod === 'least') {
        methodName = '出现最少';
      } else if (backtestMethod === 'average') {
        methodName = '出现平均';
      } else if (backtestMethod.match(/^rank(\d+)$/)) {
        // 排名方法：显示为"排名第X"
        const rankMatch = backtestMethod.match(/^rank(\d+)$/);
        const rank = parseInt(rankMatch[1]);
        methodName = `排名第${rank}`;
      }
      
      // 更新进度
      await updateProgress(`正在搜索回测方法: ${methodName}...`, 15 + (currentStep / totalSteps) * 60, `搜索回测方法: ${methodName}`);
      currentStep++;
      
      // 所有回测方法都从1500期开始
      let currentStart = 1500;
      let currentEnd = totalPeriods;
      let allTestResults = [];
      
      // 执行每个阶段的搜索
      for (let stageIndex = 0; stageIndex < searchStages.length; stageIndex++) {
        const stage = searchStages[stageIndex];
        const { step, expansion } = stage;
        
        // 更新进度
        const stageProgress = 15 + (currentStep / totalSteps) * 60;
        await updateProgress(
          `正在进行${methodName}方法的第${stageIndex + 1}阶段搜索（步长：${step}期）..`, 
          stageProgress, 
          `阶段${stageIndex + 1}，步长${step}`
        );
        currentStep++;
        
        let stageResults = [];
        
        // 计算当前阶段的期数范围和总次数
        const stageTotal = Math.ceil((currentEnd - currentStart) / step) + 1;
        
        // 生成所有需要测试的期数
        const testPeriods = [];
        for (let i = currentStart; i <= currentEnd; i += step) {
          testPeriods.push(i);
        }
        
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          break;
        }
        
        // 实时更新进度
        await updateProgress(
          `正在并行测试${testPeriods.length}个统计期..`, 
          15 + ((currentStep - 1) / totalSteps) * 60, 
          `并行测试 ${testPeriods.length} 个期数`
        );
        
        // 并行测试所有统计期
        const promises = testPeriods.map(period => testStatsPeriodFourthLast(currentBacktestPeriod, period, backtestMethod));
        const results = await Promise.all(promises);
        
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          break;
        }
        
        // 添加测试结果
        stageResults.push(...results);
        allTestResults.push(...results);
        
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          break;
        }
        
        // 如果当前阶段没有结果，继续下一阶段
        if (stageResults.length === 0) {
          continue;
        }
        
        // 找出当前阶段的最高正确率
        const highestAccuracy = Math.max(...stageResults.map(result => result.accuracy));
        
        // 找出当前阶段中所有最高正确率的结果
        const highestResultsInStage = stageResults.filter(result => result.accuracy === highestAccuracy);
        
        // 计算下一阶段的搜索范围
        const minStatsPeriod = Math.min(...highestResultsInStage.map(result => result.statsPeriod));
        const maxStatsPeriod = Math.max(...highestResultsInStage.map(result => result.statsPeriod));
        
        // 扩展搜索范围，确保不遗漏相邻区域，且统计期数始终从1500期开始
        currentStart = Math.max(1500, minStatsPeriod - expansion);
        currentEnd = Math.min(totalPeriods, maxStatsPeriod + expansion);
      }
      
      // 从所有测试结果中找出最高正确率
      const highestAccuracy = Math.max(...allTestResults.map(result => result.accuracy));
      
      // 找出所有正确率等于最高值的期数
      const highestPeriods = allTestResults.filter(result => result.accuracy === highestAccuracy);
      
      // 对期数进行去重处理
      const uniquePeriodsMap = new Map();
      highestPeriods.forEach(result => {
        if (!uniquePeriodsMap.has(result.statsPeriod)) {
          uniquePeriodsMap.set(result.statsPeriod, result);
        }
      });
      
      // 将去重后的结果转换回数组，并添加回测方法信息
      const uniqueHighestPeriods = Array.from(uniquePeriodsMap.values()).map(result => ({
        ...result,
        backtestMethod
      }));
      
      // 添加到所有结果中
      allResults.push(...uniqueHighestPeriods);
    }
    
    // 更新进度
    await updateProgress('搜索完成，正在获取前区推荐买号..', 85, '获取前区推荐买号');
    currentStep++;
    
    // 为每个结果获取前区推荐买号，并过滤掉空推荐号码的排名方法结果
    const validResults = [];
    for (let i = 0; i < allResults.length; i++) {
      // 检查是否需要终止回测
      if (isBacktestStopped) {
        break;
      }
      
      const result = allResults[i];
      // 获取回测方法中文名称
      let methodName = '出现最多';
      if (result.backtestMethod === 'least') {
        methodName = '出现最少';
      } else if (result.backtestMethod === 'average') {
        methodName = '出现平均';
      } else if (result.backtestMethod.match(/^rank(\d+)$/)) {
        // 排名方法：显示为"排名第X"
        const rankMatch = result.backtestMethod.match(/^rank(\d+)$/);
        const rank = parseInt(rankMatch[1]);
        methodName = `排名第${rank}`;
      }
      
      // 更新进度
      const buyProgress = 85 + ((i + 1) / allResults.length) * 10;
      await updateProgress(
        `正在获取统计期${result.statsPeriod}期，${methodName}方法的前区推荐买号..`, 
        buyProgress, 
        `处理结果 ${i + 1}/${allResults.length}`
      );
      
      result.frontBuyNumbers = await huo_qu_qian_qu_tui_jian_mai_hao_fourth_last(result.statsPeriod, result.backtestMethod);
      
      // 如果是排名方法且没有找到对应排名的号码（返回空数组），则跳过该结果
      if (result.backtestMethod.match(/^rank(\d+)$/) && result.frontBuyNumbers.length === 0) {
        continue;
      }
      
      // 将有效的结果添加到validResults数组中
      validResults.push(result);
    }
    
    // 检查是否需要终止回测
    if (isBacktestStopped) {
      detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">回测已终止</td></tr>';
    } else {
      // 更新进度
      await updateProgress(`找到 ${validResults.length} 个平均率最高的统计期，正在渲染结果...`, 98, '渲染结果');
      currentStep++;
      
      // 渲染详情数据，传递过滤后的结果和下下下下期期号
      await renderDetailDataFourthLast(validResults, nextPeriod);
      
      // 存储回测结果到全局变量
      backtestResults['fourthLast'] = {
        results: validResults,
        nextPeriod: nextPeriod,
        timestamp: new Date().toISOString()
      };
      
      // 更新进度
      await updateProgress('搜索完成，正在隐藏进度条...', 100, '完成');
    }
    
    // 隐藏进度
    await new Promise(resolve => {
      setTimeout(() => {
        progressDiv.style.display = 'none';
        resolve();
      }, 500);
    });
    
  } catch (error) {
    console.error('搜索最高正确率统计期失败', error);
    
    // 更新进度
    await updateProgress('搜索失败，请重试', 100, '搜索失败');
    detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">搜索失败，请重试</td></tr>';
  } finally {
    // 恢复按钮状态
    startBacktestBtn.style.display = 'inline-block';
    stopBacktestBtn.style.display = 'none';
    // 重置终止标志
    isBacktestStopped = false;
  }
}

// 倒数5期两球组合平均率最高统计期详情回测函数
async function performSearchFifthLast() {
  const progressDiv = document.getElementById('progressFifthLast');
  const progressText = document.getElementById('progressTextFifthLast');
  const progressBar = document.getElementById('progressBarFifthLast');
  const progressPercentage = document.getElementById('progressPercentageFifthLast');
  const currentPhase = document.getElementById('currentPhaseFifthLast');
  const detailResults = document.getElementById('detailResultsFifthLast');
  const startBacktestBtn = document.getElementById('startBacktestBtnFifthLast');
  const stopBacktestBtn = document.getElementById('stopBacktestBtnFifthLast');
  
  // 进度计算变量
  let totalProgress = 0;
  let currentStep = 0;
  let totalSteps = 0;
  
  // 终止标志
  let isBacktestStopped = false;
  
  // 更新进度的函数
  function updateProgress(text, percentage, phase) {
    return new Promise(resolve => {
      // 减少DOM更新频率，只在百分比变化较大时更新
      const roundedPercentage = Math.round(percentage);
      const currentRoundedPercentage = Math.round(parseFloat(progressBar.style.width || '0%'));
      
      if (Math.abs(roundedPercentage - currentRoundedPercentage) >= 5 || roundedPercentage === 100) {
        // 直接更新DOM，不依赖requestAnimationFrame
        progressText.textContent = text;
        progressBar.style.width = `${percentage}%`;
        progressPercentage.textContent = `${roundedPercentage}%`;
        currentPhase.textContent = phase;
      }
      resolve();
    });
  }
  
  try {
    // 显示终止回测按钮，隐藏开始回测按钮
    startBacktestBtn.style.display = 'none';
    stopBacktestBtn.style.display = 'inline-block';
    
    // 立即显示进度条，直接更新DOM
    await new Promise(resolve => {
      progressDiv.style.display = 'block';
      progressText.textContent = '开始搜索平均率最高的统计期..';
      progressBar.style.width = '0%';
      progressPercentage.textContent = '0%';
      currentPhase.textContent = '正在准备...';
      detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #666;">正在搜索平均率最高的统计期..</td></tr>';
      resolve();
    });
    
    // 重置终止标志
    isBacktestStopped = false;
    
    // 添加终止回测按钮点击事件
    stopBacktestBtn.onclick = function() {
      isBacktestStopped = true;
      updateProgress('回测已终止', 100, '回测终止');
    };
    
    // 使用全局配置的回测期数
    const currentBacktestPeriod = backtestPeriod;
    
    // 更新进度
    await updateProgress('正在获取总期数..', 5, '获取总期数');
    
    const totalPeriods = await getTotalPeriods();
    
    // 多阶段搜索策略，从大到小变化步长
    const searchStages = [
      { step: 200, expansion: 400 }, // 第一阶段：步长200，扩展范围400
      { step: 100, expansion: 200 }, // 第二阶段：步长100，扩展范围200
      { step: 50, expansion: 100 }    // 第三阶段：步长50，扩展范围100
    ];
    
    // 回测方法列表，只包括排名方法
    const backtestMethods = Array.from({length: 30}, (_, i) => `rank${i + 1}`);
    const allResults = [];
    
    // 计算总工作量
    totalSteps = backtestMethods.length * searchStages.length + 3; // 3个初始化和收尾步骤
    
    // 更新进度
    await updateProgress('正在获取最新一期期号..', 10, '获取最新期号');
    currentStep++;
    
    // 获取最后一期期号
    const lastPeriod = await getLastPeriod();
    const nextPeriod = (parseInt(lastPeriod) + 5) + '期'; // 下下下下下期
    
    // 遍历三种回测方法
    for (const backtestMethod of backtestMethods) {
      let methodName;
      if (backtestMethod.startsWith('rank')) {
        const rankMatch = backtestMethod.match(/^rank(\d+)$/);
        methodName = rankMatch ? `排名第${rankMatch[1]}` : backtestMethod;
      } else {
        methodName = backtestMethod;
      }
      
      // 更新进度
      await updateProgress(`正在搜索回测方法: ${methodName}...`, 15 + (currentStep / totalSteps) * 60, `搜索回测方法: ${methodName}`);
      currentStep++;
      
      // 所有回测方法都从1500期开始
      let currentStart = 1500;
      let currentEnd = totalPeriods;
      let allTestResults = [];
      
      // 执行每个阶段的搜索
      for (let stageIndex = 0; stageIndex < searchStages.length; stageIndex++) {
        const stage = searchStages[stageIndex];
        const { step, expansion } = stage;
        
        // 更新进度
        const stageProgress = 15 + (currentStep / totalSteps) * 60;
        await updateProgress(
          `正在进行${methodName}方法的第${stageIndex + 1}阶段搜索（步长：${step}期）..`, 
          stageProgress, 
          `阶段${stageIndex + 1}，步长${step}`
        );
        currentStep++;
        
        let stageResults = [];
        
        // 计算当前阶段的期数范围和总次数
        const stageTotal = Math.ceil((currentEnd - currentStart) / step) + 1;
        
        // 生成所有需要测试的期数
        const testPeriods = [];
        for (let i = currentStart; i <= currentEnd; i += step) {
          testPeriods.push(i);
        }
        
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          continue;
        }
        
        // 实时更新进度
        await updateProgress(
          `正在并行测试${testPeriods.length}个统计期..`, 
          15 + ((currentStep - 1) / totalSteps) * 60, 
          `并行测试 ${testPeriods.length} 个期数`
        );
        
        // 并行测试所有统计期
        const promises = testPeriods.map(period => testStatsPeriodFifthLast(currentBacktestPeriod, period, backtestMethod));
        const results = await Promise.all(promises);
        
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          continue;
        }
        
        // 添加测试结果
        stageResults.push(...results);
        allTestResults.push(...results);
        
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          break;
        }
        
        // 如果当前阶段没有结果，继续下一阶段
        if (stageResults.length === 0) {
          continue;
        }
        
        // 找出当前阶段的最高正确率
        const highestAccuracy = Math.max(...stageResults.map(result => result.accuracy));
        
        // 找出当前阶段中所有最高正确率的结果
        const highestResultsInStage = stageResults.filter(result => result.accuracy === highestAccuracy);
        
        // 计算下一阶段的搜索范围
        const minStatsPeriod = Math.min(...highestResultsInStage.map(result => result.statsPeriod));
        const maxStatsPeriod = Math.max(...highestResultsInStage.map(result => result.statsPeriod));
        
        // 扩展搜索范围，确保不遗漏相邻区域，且统计期数始终从1500期开始
        currentStart = Math.max(1500, minStatsPeriod - expansion);
        currentEnd = Math.min(totalPeriods, maxStatsPeriod + expansion);
      }
      
      // 从所有测试结果中找出最高正确率
      const highestAccuracy = Math.max(...allTestResults.map(result => result.accuracy));
      
      // 找出所有正确率等于最高值的期数
      const highestPeriods = allTestResults.filter(result => result.accuracy === highestAccuracy);
      
      // 对期数进行去重处理
      const uniquePeriodsMap = new Map();
      highestPeriods.forEach(result => {
        if (!uniquePeriodsMap.has(result.statsPeriod)) {
          uniquePeriodsMap.set(result.statsPeriod, result);
        }
      });
      
      // 将去重后的结果转换回数组，并添加回测方法信息
      const uniqueHighestPeriods = Array.from(uniquePeriodsMap.values()).map(result => ({
        ...result,
        backtestMethod
      }));
      
      // 添加到所有结果中
      allResults.push(...uniqueHighestPeriods);
    }
    
    // 更新进度
    await updateProgress('搜索完成，正在获取前区推荐买号..', 85, '获取前区推荐买号');
    currentStep++;
    
    // 为每个结果获取前区推荐买号
    for (let i = 0; i < allResults.length; i++) {
      // 检查是否需要终止回测
      if (isBacktestStopped) {
        break;
      }
      
      const result = allResults[i];
      let methodName;
      if (result.backtestMethod === 'most') {
        methodName = '出现最多';
      } else if (result.backtestMethod === 'least') {
        methodName = '出现最少';
      } else if (result.backtestMethod === 'average') {
        methodName = '出现平均';
      } else if (result.backtestMethod.startsWith('rank')) {
        const rankMatch = result.backtestMethod.match(/^rank(\d+)$/);
        methodName = rankMatch ? `排名第${rankMatch[1]}` : result.backtestMethod;
      } else {
        methodName = result.backtestMethod;
      }
      
      // 更新进度
      const buyProgress = 85 + ((i + 1) / allResults.length) * 10;
      await updateProgress(
        `正在获取统计期${result.statsPeriod}期，${methodName}方法的前区推荐买号..`, 
        buyProgress, 
        `处理结果 ${i + 1}/${allResults.length}`
      );
      
      result.frontBuyNumbers = await huo_qu_qian_qu_tui_jian_mai_hao_fifth_last(result.statsPeriod, result.backtestMethod);
    }
    
    // 过滤结果：过滤空推荐号码并实现去重
    const filteredResults = [];
    const seenResults = new Set();
    
    for (const result of allResults) {
      // 如果是排名方法且没有找到对应排名的号码（返回空数组），则跳过该结果
      if (result.backtestMethod.match(/^rank(\d+)$/) && result.frontBuyNumbers.length === 0) {
        continue;
      }
      
      // 去重：使用回测方法和统计期数的组合作为唯一标识
      const resultKey = `${result.backtestMethod}-${result.statsPeriod}`;
      if (!seenResults.has(resultKey)) {
        seenResults.add(resultKey);
        filteredResults.push(result);
      }
    }
    
    // 使用过滤后的结果
    allResults.length = 0;
    allResults.push(...filteredResults);
    
    // 检查是否需要终止回测
    if (isBacktestStopped) {
      detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">回测已终止</td></tr>';
    } else {
      // 更新进度
      await updateProgress(`找到 ${allResults.length} 个平均率最高的统计期，正在渲染结果...`, 98, '渲染结果');
      currentStep++;
      
      // 渲染详情数据，传递所有结果和下一期期号
      await renderDetailDataFifthLast(allResults, nextPeriod);
      
      // 存储回测结果到全局变量
      backtestResults['fifthLast'] = {
        results: allResults,
        nextPeriod: nextPeriod,
        timestamp: new Date().toISOString()
      };
      
      // 更新进度
      await updateProgress('搜索完成，正在隐藏进度条...', 100, '完成');
    }
    
    // 隐藏进度
    await new Promise(resolve => {
      setTimeout(() => {
        progressDiv.style.display = 'none';
        resolve();
      }, 500);
    });
    
  } catch (error) {
    console.error('搜索最低正确率统计期失败', error);
    
    // 更新进度
    await updateProgress('搜索失败，请重试', 100, '搜索失败');
    detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">搜索失败，请重试</td></tr>';
  } finally {
    // 恢复按钮状态
    startBacktestBtn.style.display = 'inline-block';
    stopBacktestBtn.style.display = 'none';
    // 重置终止标志
    isBacktestStopped = false;
  }
}

// 从后端获取回测数据 - 使用jin_liang_qi_mai_hao_hui_ce_xiang_qing.html的算法
async function huo_qu_jin_liang_qi_mai_hao_hui_ce(backtestPeriod = '50', statsPeriod = '100', backtestMethod = 'most') {
  try {
    const response = await fetch(`http://localhost:18889/jin_liang_qi_mai_hao_hui_ce?backtest_period=${backtestPeriod}&stats_period=${statsPeriod}&backtest_method=${backtestMethod}`);
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

// 测试单个统计期值的平均正确率 - 使用jin_liang_qi_mai_hao_hui_ce_xiang_qing.html的算法
async function testStatsPeriodNearTwoPeriods(backtestPeriod, statsPeriod, backtestMethod) {
  try {
    const backtestData = await huo_qu_jin_liang_qi_mai_hao_hui_ce(backtestPeriod, statsPeriod, backtestMethod);
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

// 获取前区推荐买号 - 使用与jin_liang_qi_liang_qiu_zu_he.html相同的算法
async function huo_qu_qian_qu_tui_jian_mai_hao_near_two_periods(statsPeriod, backtestMethod) {
  try {
    // 调用jin_liang_qi_liang_qiu_zu_he_front接口获取近两期两球组合数据
    const response = await fetch(`http://localhost:18889/jin_liang_qi_liang_qiu_zu_he_front`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ stats_range: statsPeriod })
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (result.success) {
      const frontCombinations = result.data || [];
      let frontBuyNumbers = [];
      
      // 初始化汇总计数数组 - 与jin_liang_qi_liang_qiu_zu_he.html完全相同
      const totalCounts = new Array(36).fill(0); // 索引0不使用，1-35对应前区号码
      
      // 遍历前区组合，统计每个号码的出现次数 - 与jin_liang_qi_liang_qiu_zu_he.html完全相同
      frontCombinations.forEach(combo => {
        // 累加每个号码的出现次数
        for (let i = 1; i <= 35; i++) {
          const count = combo.numberCounts[i] || 0;
          totalCounts[i] += count;
        }
      });
      
      // 根据回测方法计算对应的前区推荐买号 - 与jin_liang_qi_liang_qiu_zu_he.html完全相同
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
      } else if (backtestMethod.match(/^rank(\d+)$/)) {
        // 排名方法：根据排名选择号码
        const rankMatch = backtestMethod.match(/^rank(\d+)$/);
        const rank = parseInt(rankMatch[1]);
        
        // 按出现次数降序排序号码（包括出现次数为0的号码）
        const sortedNumbers = [];
        for (let i = 1; i <= 35; i++) {
          sortedNumbers.push({ number: i, count: totalCounts[i] || 0 });
        }
        sortedNumbers.sort((a, b) => b.count - a.count);
        
        // 计算每个号码的实际排名
        const rankMap = {};
        let currentRank = 1;
        
        for (let i = 0; i < sortedNumbers.length; i++) {
          if (i > 0 && sortedNumbers[i].count !== sortedNumbers[i - 1].count) {
            currentRank++;
          }
          rankMap[sortedNumbers[i].number] = currentRank;
        }
        
        // 找出所有排名等于指定排名的号码
        for (let i = 1; i <= 35; i++) {
          if (rankMap[i] === rank) {
            frontBuyNumbers.push(i);
          }
        }
      }
      
      return frontBuyNumbers;
    } else {
      alert('接口失败');
      return [];
    }
  } catch (error) {
    console.error('获取前区推荐买号失败:', error);
    return [];
  }
}

// 渲染详情数据 - 近两期
async function renderDetailDataNearTwoPeriods(allResults, nextPeriod) {
  const detailResults = document.getElementById('detailResultsNearTwoPeriods');
  const buyNumbersContent = document.getElementById('buyNumbersCollectionContentNearTwoPeriods');
  
  try {
    // 清空当前内容
    detailResults.innerHTML = '';
    
    // 如果没有结果，显示提示
    if (allResults.length === 0) {
      detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #666;">未找到平均率最高的统计期</td></tr>';
      return;
    }
    
    // 过滤回测结果：如果回测方法相同且下一期前区推荐买号相同，只保留一条
    const uniqueResultsMap = new Map();
    
    allResults.forEach(result => {
      // 基于回测方法和下一期前区推荐买号（排序后）创建唯一键
      const sortedBuyNumbers = [...(result.frontBuyNumbers || [])].sort((a, b) => a - b);
      const uniqueKey = `${result.backtestMethod}_${sortedBuyNumbers.join('_')}`;
      
      // 只保留第一条出现的结果
      if (!uniqueResultsMap.has(uniqueKey)) {
        uniqueResultsMap.set(uniqueKey, result);
      }
    });
    
    // 将过滤后的结果转换回数组
    const filteredResults = Array.from(uniqueResultsMap.values());
    
    // 按照平均正确率降序排序
    filteredResults.sort((a, b) => b.accuracy - a.accuracy);
    
    // 遍历过滤后的结果
    const allBuyNumbers = [];
    for (const result of filteredResults) {
      const { statsPeriod, accuracy, backtestMethod, frontBuyNumbers } = result;
      
      // 平均正确率已经在搜索阶段计算好
      const averageCorrectRate = accuracy.toFixed(3);
      
      // 获取回测方法中文名称
      let backtestMethodText = '出现最多';
      if (backtestMethod === 'least') {
        backtestMethodText = '出现最少';
      } else if (backtestMethod === 'average') {
        backtestMethodText = '出现平均';
      } else if (backtestMethod.match(/^rank(\d+)$/)) {
        // 排名方法：显示为"排名第X"
        const rankMatch = backtestMethod.match(/^rank(\d+)$/);
        const rank = parseInt(rankMatch[1]);
        backtestMethodText = `排名第${rank}`;
      }
      
      // 格式化前区推荐买号
      const frontBuyNumbersStr = frontBuyNumbers.map(num => `<span class="red-ball">${num}</span>`).join(' ');
      
      // 创建表格行
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${backtestMethodText}</td>
        <td>${backtestPeriod}期</td>
        <td>${statsPeriod}期</td>
        <td>${averageCorrectRate}%</td>
        <td>${nextPeriod}</td>
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
      
      // 收集所有推荐买号
      frontBuyNumbers.forEach(num => {
        if (!allBuyNumbers.includes(num)) {
          allBuyNumbers.push(num);
        }
      });
    }
    
    // 更新推荐买号合集
    if (buyNumbersContent) {
      if (allBuyNumbers.length > 0) {
        // 按平均正确率累加进行排序，同一个推荐买号的球，回测方法相同时，只保留平均正确率大的
        const numberAccuracyMap = new Map();
        
        // 遍历所有结果，计算每个号码的平均正确率累加
        filteredResults.forEach(result => {
          const { accuracy, backtestMethod, frontBuyNumbers } = result;
          
          if (frontBuyNumbers && frontBuyNumbers.length > 0) {
            frontBuyNumbers.forEach(num => {
              const numStr = num.toString();
              const key = `${backtestMethod}_${numStr}`;
              
              if (numberAccuracyMap.has(key)) {
                // 检查回测方法是否相同
                const existingData = numberAccuracyMap.get(key);
                if (existingData.backtestMethod === backtestMethod) {
                  // 如果回测方法相同，只保留平均正确率大的
                  if (accuracy > existingData.accuracy) {
                    numberAccuracyMap.set(key, { accuracy, backtestMethod, number: num });
                  }
                }
              } else {
                // 第一次出现，直接添加
                numberAccuracyMap.set(key, { accuracy, backtestMethod, number: num });
              }
            });
          }
        });
        
        // 现在对每个号码，按回测方法分组，相同回测方法只保留最高正确率，不同回测方法累加
        const finalNumberMap = new Map();
        numberAccuracyMap.forEach((data, key) => {
          const { accuracy, backtestMethod, number } = data;
          const numStr = number.toString();
          
          if (finalNumberMap.has(numStr)) {
            const existingData = finalNumberMap.get(numStr);
            // 不同回测方法，累加正确率
            const newAccuracy = existingData.accuracy + accuracy;
            finalNumberMap.set(numStr, { accuracy: newAccuracy, backtestMethod: 'combined', number: number });
          } else {
            finalNumberMap.set(numStr, { accuracy, backtestMethod, number: number });
          }
        });
        
        // 转换为数组并按平均正确率降序排序
        const sortedNumbers = Array.from(finalNumberMap.values())
          .sort((a, b) => b.accuracy - a.accuracy);
        
        // 生成推荐买号合集的HTML
        buyNumbersContent.innerHTML = sortedNumbers.map(item => {
          const accuracyText = item.accuracy.toFixed(3);
          return `<div style="display: flex; align-items: center; gap: 5px;">
            <div class="red-ball">${item.number}</div>
            <div style="font-size: 12px; color: #666;">${accuracyText}%</div>
          </div>`;
        }).join(' ');
      } else {
        buyNumbersContent.innerHTML = '<div style="color: #666;">暂无推荐买号数据</div>';
      }
    }
  } catch (error) {
    console.error('渲染详情数据失败:', error);
    detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">加载失败，请重试</td></tr>';
  }
}

// 近两期两球组合平均率最高统计期详情回测函数
async function performSearchNearTwoPeriods() {
  const progressDiv = document.getElementById('progressNearTwoPeriods');
  const progressText = document.getElementById('progressTextNearTwoPeriods');
  const progressBar = document.getElementById('progressBarNearTwoPeriods');
  const progressPercentage = document.getElementById('progressPercentageNearTwoPeriods');
  const currentPhase = document.getElementById('currentPhaseNearTwoPeriods');
  const detailResults = document.getElementById('detailResultsNearTwoPeriods');
  const startBacktestBtn = document.getElementById('startBacktestBtnNearTwoPeriods');
  const stopBacktestBtn = document.getElementById('stopBacktestBtnNearTwoPeriods');
  
  // 进度计算变量
  let totalProgress = 0;
  let currentStep = 0;
  let totalSteps = 0;
  
  // 终止标志
  let isBacktestStopped = false;
  
  // 更新进度的函数
  function updateProgress(text, percentage, phase) {
    return new Promise(resolve => {
      // 减少DOM更新频率，只在百分比变化较大时更新
      const roundedPercentage = Math.round(percentage);
      const currentRoundedPercentage = Math.round(parseFloat(progressBar.style.width || '0%'));
      
      if (Math.abs(roundedPercentage - currentRoundedPercentage) >= 5 || roundedPercentage === 100) {
        requestAnimationFrame(() => {
          progressText.textContent = text;
          progressBar.style.width = `${percentage}%`;
          progressPercentage.textContent = `${roundedPercentage}%`;
          currentPhase.textContent = phase;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
  
  try {
    // 显示终止回测按钮，隐藏开始回测按钮
    startBacktestBtn.style.display = 'none';
    stopBacktestBtn.style.display = 'inline-block';
    
    // 立即显示进度条，使用requestAnimationFrame确保浏览器渲染
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        progressDiv.style.display = 'block';
        progressText.textContent = '开始搜索平均率最高的统计期..';
        progressBar.style.width = '0%';
        progressPercentage.textContent = '0%';
        currentPhase.textContent = '正在准备...';
        detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #666;">正在搜索平均率最高的统计期..</td></tr>';
        resolve();
      });
    });
    
    // 重置终止标志
    isBacktestStopped = false;
    
    // 添加终止回测按钮点击事件
    stopBacktestBtn.onclick = function() {
      isBacktestStopped = true;
      updateProgress('回测已终止', 100, '回测终止');
    };
    
    // 确保DOM更新
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 使用全局配置的回测期数
    const currentBacktestPeriod = backtestPeriod;
    
    // 更新进度
    await updateProgress('正在获取总期数..', 5, '获取总期数');
    
    const totalPeriods = await getTotalPeriods();
    
    // 多阶段搜索策略，从大到小变化步长
    const searchStages = [
      { step: 200, expansion: 400 }, // 第一阶段：步长200，扩展范400
      { step: 100, expansion: 200 }, // 第二阶段：步长100，扩展范200
      { step: 50, expansion: 100 }    // 第三阶段：步长50，扩展范100
    ];
    
    // 回测方法：只包含排名方法
    const backtestMethods = [];
    // 添加排名方法
    for (let i = 1; i <= 30; i++) {
      backtestMethods.push(`rank${i}`);
    }
    const allResults = [];
    
    // 计算总工作量
    totalSteps = backtestMethods.length * searchStages.length + 3; // 3个初始化和收尾步骤
    
    // 更新进度
    await updateProgress('正在获取最新一期期号..', 10, '获取最新期号');
    currentStep++;
    
    // 获取最后一期期号
    const lastPeriod = await getLastPeriod();
    const nextPeriod = (parseInt(lastPeriod) + 1) + '期'; // 使用最近期的期号的下一期作为当前期号
    
    // 遍历所有回测方法
    for (const method of backtestMethods) {
      let methodName;
      if (method.startsWith('rank')) {
        const rankMatch = method.match(/^rank(\d+)$/);
        methodName = rankMatch ? `排名第${rankMatch[1]}` : method;
      } else {
        methodName = method;
      }
      
      // 更新进度
      await updateProgress(`正在搜索回测方法: ${methodName}...`, 15 + (currentStep / totalSteps) * 60, `搜索回测方法: ${methodName}`);
      currentStep++;
      
      let currentStart = 1500; // 所有回测方法都从1500期开始
      let currentEnd = totalPeriods;
      let allTestResults = [];
      
      // 执行每个阶段的搜索
      for (let stageIndex = 0; stageIndex < searchStages.length; stageIndex++) {
        const stage = searchStages[stageIndex];
        const { step, expansion } = stage;
        
        // 更新进度
        const stageProgress = 15 + (currentStep / totalSteps) * 60;
        await updateProgress(
          `正在进行${methodName}方法的第${stageIndex + 1}阶段搜索（步长：${step}期）..`, 
          stageProgress, 
          `阶段${stageIndex + 1}，步长${step}`
        );
        currentStep++;
        
        let stageResults = [];
        
        // 计算当前阶段的期数范和总次数
        const stageTotal = Math.ceil((currentEnd - currentStart) / step) + 1;
        
        // 生成所有需要测试的期数
        const testPeriods = [];
        for (let i = currentStart; i <= currentEnd; i += step) {
          testPeriods.push(i);
        }
        
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          continue;
        }
        
        // 实时更新进度
        await updateProgress(
          `正在并行测试${testPeriods.length}个统计期..`, 
          15 + ((currentStep - 1) / totalSteps) * 60, 
          `并行测试 ${testPeriods.length} 个期数`
        );
        
        // 并行测试所有统计期
        const promises = testPeriods.map(period => testStatsPeriodNearTwoPeriods(currentBacktestPeriod, period, method));
        const results = await Promise.all(promises);
        
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          continue;
        }
        
        // 添加测试结果
        stageResults.push(...results);
        allTestResults.push(...results);
        
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          break;
        }
        
        // 如果当前阶段没有结果，继续下一阶段
        if (stageResults.length === 0) {
          continue;
        }
        
        // 找出当前阶段的最高正确率
        const highestAccuracy = Math.max(...stageResults.map(result => result.accuracy));
        
        // 找出当前阶段中所有最高正确率的结果
        const highestResultsInStage = stageResults.filter(result => result.accuracy === highestAccuracy);
        
        // 计算下一阶段的搜索范
        const minStatsPeriod = Math.min(...highestResultsInStage.map(result => result.statsPeriod));
        const maxStatsPeriod = Math.max(...highestResultsInStage.map(result => result.statsPeriod));
        
        // 所有回测方法都使用1500期作为最小限制
        const minLimit = 1500;
        currentStart = Math.max(minLimit, minStatsPeriod - expansion);
        currentEnd = Math.min(totalPeriods, maxStatsPeriod + expansion);
      }
      
      // 从所有测试结果中找出最高正确率
      const highestAccuracy = Math.max(...allTestResults.map(result => result.accuracy));
      
      // 找出所有正确率等于最高值的期数
      const highestPeriods = allTestResults.filter(result => result.accuracy === highestAccuracy);
      
      // 对期数进行去重处理
      const uniquePeriodsMap = new Map();
      highestPeriods.forEach(result => {
        if (!uniquePeriodsMap.has(result.statsPeriod)) {
          uniquePeriodsMap.set(result.statsPeriod, result);
        }
      });
      
      // 将去重后的结果转换回数组，并添加回测方法信息
      const uniqueHighestPeriods = Array.from(uniquePeriodsMap.values()).map(result => ({
        ...result,
        backtestMethod: method
      }));
      
      // 为每个结果获取前区推荐买号，并过滤掉空推荐号码的排名方法结果
      const validResults = [];
      for (let i = 0; i < uniqueHighestPeriods.length; i++) {
        const result = uniqueHighestPeriods[i];
        let methodName = '出现最多';
        if (result.backtestMethod === 'least') {
          methodName = '出现最少';
        } else if (result.backtestMethod === 'average') {
          methodName = '出现平均';
        } else if (result.backtestMethod.match(/^rank(\d+)$/)) {
          // 排名方法：显示为"排名第X"
          const rankMatch = result.backtestMethod.match(/^rank(\d+)$/);
          const rank = parseInt(rankMatch[1]);
          methodName = `排名第${rank}`;
        }
        
        // 更新进度
        const buyProgress = 85 + ((i + 1) / uniqueHighestPeriods.length) * 10;
        await updateProgress(
          `正在获取统计期${result.statsPeriod}期，${methodName}方法的前区推荐买号..`, 
          buyProgress, 
          `处理结果 ${i + 1}/${uniqueHighestPeriods.length}`
        );
        
        result.frontBuyNumbers = await huo_qu_qian_qu_tui_jian_mai_hao_near_two_periods(result.statsPeriod, result.backtestMethod);
        
        // 如果是排名方法且没有找到对应排名的号码（返回空数组），则跳过该结果
        if (result.backtestMethod.match(/^rank(\d+)$/) && result.frontBuyNumbers.length === 0) {
          continue;
        }
        
        // 将有效的结果添加到validResults数组中
        validResults.push(result);
      }
      
      // 添加到所有结果中
      allResults.push(...validResults);
    }
    
    // 检查是否需要终止回测
    if (isBacktestStopped) {
      detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">回测已终止</td></tr>';
    } else {
      // 过滤回测结果：如果回测方法相同且下一期前区推荐买号相同，只保留一条
      const uniqueResultsMap = new Map();
      
      allResults.forEach(result => {
        // 基于回测方法和下一期前区推荐买号（排序后）创建唯一键
        const sortedBuyNumbers = [...(result.frontBuyNumbers || [])].sort((a, b) => a - b);
        const uniqueKey = `${result.backtestMethod}_${sortedBuyNumbers.join('_')}`;
        
        // 只保留第一条出现的结果
        if (!uniqueResultsMap.has(uniqueKey)) {
          uniqueResultsMap.set(uniqueKey, result);
        }
      });
      
      // 将过滤后的结果转换回数组
      const filteredResults = Array.from(uniqueResultsMap.values());
      
      // 更新进度
      await updateProgress(`找到 ${filteredResults.length} 个平均率最高的统计期，正在渲染结果...`, 98, '渲染结果');
      currentStep++;
      
      // 渲染详情数据，传递过滤后的结果和下一期期号
      await renderDetailDataNearTwoPeriods(filteredResults, nextPeriod);
      
      // 存储回测结果到全局变量
      backtestResults['nearTwoPeriods'] = {
        results: filteredResults,
        nextPeriod: nextPeriod,
        timestamp: new Date().toISOString()
      };
      
      // 更新进度
      await updateProgress('搜索完成，正在隐藏进度条...', 100, '完成');
    }
    
    // 隐藏进度
    await new Promise(resolve => {
      setTimeout(() => {
        requestAnimationFrame(() => {
          progressDiv.style.display = 'none';
          resolve();
        });
      }, 500);
    });
    
  } catch (error) {
    console.error('搜索最高正确率统计期失败', error);
    
    // 更新进度
    await updateProgress('搜索失败，请重试', 100, '搜索失败');
    detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">搜索失败，请重试</td></tr>';
  } finally {
    // 恢复按钮状态
    startBacktestBtn.style.display = 'inline-block';
    stopBacktestBtn.style.display = 'none';
    // 重置终止标志
    isBacktestStopped = false;
  }
}

// 从后端获取回测数据 - 使用san_qiu_mai_hao_hui_ce_xiang_qing.html的算法
async function huo_qu_san_qiu_mai_hao_hui_ce(backtestPeriod = '50', statsPeriod = '100', backtestMethod = 'most') {
  try {
    const response = await fetch(`http://localhost:18889/san_qiu_mai_hao_hui_ce?backtest_period=${backtestPeriod}&stats_period=${statsPeriod}&backtest_method=${backtestMethod}`);
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

// 测试单个统计期值的平均正确率 - 使用san_qiu_mai_hao_hui_ce_xiang_qing.html的算法
async function testStatsPeriodThreeBall(backtestPeriod, statsPeriod, backtestMethod) {
  try {
    const backtestData = await huo_qu_san_qiu_mai_hao_hui_ce(backtestPeriod, statsPeriod, backtestMethod);
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

// 获取前区推荐买号 - 使用与san_qiu_fen_xi.html相同的算法
async function huo_qu_qian_qu_tui_jian_mai_hao_three_ball(statsPeriod, backtestMethod) {
  try {
    // 调用与san_qiu_fen_xi.html相同的接口获取最新1期三球组合数据
    const response = await fetch(`http://localhost:18889/san_qiu_fen_xi?stats_period=${statsPeriod}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (result.success) {
      const analysisData = result.data;
      const frontCombinations = analysisData.frontCombinations;
      let frontBuyNumbers = [];
      
      // 初始化汇总计数数组 - 与san_qiu_fen_xi.js完全相同
      const totalCounts = new Array(36).fill(0); // 索引0不使用，1-35对应前区号码
      
      // 遍历前区组合，统计每个号码的出现次数 - 与san_qiu_fen_xi.js完全相同
      frontCombinations.forEach(combo => {
        // 累加每个号码的出现次数
        for (let i = 1; i <= 35; i++) {
          const count = combo.numberCounts[i] || 0;
          totalCounts[i] += count;
        }
      });
      
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
      } else if (backtestMethod.match(/^rank(\d+)$/)) {
        // 排名方法：根据排名选择号码
        const rankMatch = backtestMethod.match(/^rank(\d+)$/);
        const rank = parseInt(rankMatch[1]);
        
        // 按出现次数降序排序号码（包括出现次数为0的号码）
        const sortedNumbers = [];
        for (let i = 1; i <= 35; i++) {
          sortedNumbers.push({ number: i, count: totalCounts[i] || 0 });
        }
        sortedNumbers.sort((a, b) => b.count - a.count);
        
        // 计算每个号码的实际排名
        const rankMap = {};
        let currentRank = 1;
        
        for (let i = 0; i < sortedNumbers.length; i++) {
          if (i > 0 && sortedNumbers[i].count !== sortedNumbers[i - 1].count) {
            currentRank++;
          }
          rankMap[sortedNumbers[i].number] = currentRank;
        }
        
        // 找出所有排名等于指定排名的号码
        for (let i = 1; i <= 35; i++) {
          if (rankMap[i] === rank) {
            frontBuyNumbers.push(i);
          }
        }
      }
      
      return frontBuyNumbers;
    } else {
      alert('接口失败');
      return [];
    }
  } catch (error) {
    console.error('获取前区推荐买号失败:', error);
    return [];
  }
}

// 渲染详情数据 - 最新一期三球组合
async function renderDetailDataThreeBall(allResults, nextPeriod) {
  const detailResults = document.getElementById('detailResultsThreeBall');
  const buyNumbersContent = document.getElementById('buyNumbersCollectionContentThreeBall');
  
  try {
    // 清空当前内容
    detailResults.innerHTML = '';
    
    // 如果没有结果，显示提示
    if (allResults.length === 0) {
      detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #666;">未找到平均率最高的统计期</td></tr>';
      return;
    }
    
    // 遍历过滤后的结果
    const allBuyNumbers = [];
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
      } else if (backtestMethod.match(/^rank(\d+)$/)) {
        // 排名方法：显示为"排名第X"
        const rankMatch = backtestMethod.match(/^rank(\d+)$/);
        const rank = parseInt(rankMatch[1]);
        backtestMethodText = `排名第${rank}`;
      }
      
      // 格式化前区推荐买号
      const frontBuyNumbersStr = frontBuyNumbers.map(num => `<span class="red-ball">${num}</span>`).join(' ');
      
      // 创建表格行
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${backtestMethodText}</td>
        <td>${backtestPeriod}期</td>
        <td>${statsPeriod}期</td>
        <td>${averageCorrectRate}%</td>
        <td>${nextPeriod}</td>
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
      
      // 收集所有推荐买号
      frontBuyNumbers.forEach(num => {
        if (!allBuyNumbers.includes(num)) {
          allBuyNumbers.push(num);
        }
      });
    }
    
    // 更新推荐买号合集
    if (buyNumbersContent) {
      if (allBuyNumbers.length > 0) {
        // 按平均正确率累加进行排序，同一个推荐买号的球，回测方法相同时，只保留平均正确率大的
        const numberAccuracyMap = new Map();
        
        // 遍历所有结果，计算每个号码的平均正确率累加
        filteredResults.forEach(result => {
          const { accuracy, backtestMethod, frontBuyNumbers } = result;
          
          if (frontBuyNumbers && frontBuyNumbers.length > 0) {
            frontBuyNumbers.forEach(num => {
              const numStr = num.toString();
              const key = `${backtestMethod}_${numStr}`;
              
              if (numberAccuracyMap.has(key)) {
                // 检查回测方法是否相同
                const existingData = numberAccuracyMap.get(key);
                if (existingData.backtestMethod === backtestMethod) {
                  // 如果回测方法相同，只保留平均正确率大的
                  if (accuracy > existingData.accuracy) {
                    numberAccuracyMap.set(key, { accuracy, backtestMethod, number: num });
                  }
                }
              } else {
                // 第一次出现，直接添加
                numberAccuracyMap.set(key, { accuracy, backtestMethod, number: num });
              }
            });
          }
        });
        
        // 现在对每个号码，按回测方法分组，相同回测方法只保留最高正确率，不同回测方法累加
        const finalNumberMap = new Map();
        numberAccuracyMap.forEach((data, key) => {
          const { accuracy, backtestMethod, number } = data;
          const numStr = number.toString();
          
          if (finalNumberMap.has(numStr)) {
            const existingData = finalNumberMap.get(numStr);
            // 不同回测方法，累加正确率
            const newAccuracy = existingData.accuracy + accuracy;
            finalNumberMap.set(numStr, { accuracy: newAccuracy, backtestMethod: 'combined', number: number });
          } else {
            finalNumberMap.set(numStr, { accuracy, backtestMethod, number: number });
          }
        });
        
        // 转换为数组并按平均正确率降序排序
        const sortedNumbers = Array.from(finalNumberMap.values())
          .sort((a, b) => b.accuracy - a.accuracy);
        
        // 生成推荐买号合集的HTML
        buyNumbersContent.innerHTML = sortedNumbers.map(item => {
          const accuracyText = item.accuracy.toFixed(3);
          return `<div style="display: flex; align-items: center; gap: 5px;">
            <div class="red-ball">${item.number}</div>
            <div style="font-size: 12px; color: #666;">${accuracyText}%</div>
          </div>`;
        }).join(' ');
      } else {
        buyNumbersContent.innerHTML = '<div style="color: #666;">暂无推荐买号数据</div>';
      }
    }
  } catch (error) {
    console.error('渲染详情数据失败:', error);
    detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">加载失败，请重试</td></tr>';
  }
}

// 最新一期三球组合平均率最高统计期详情回测函数
async function performSearchThreeBall() {
  const progressDiv = document.getElementById('progressThreeBall');
  const progressText = document.getElementById('progressTextThreeBall');
  const progressBar = document.getElementById('progressBarThreeBall');
  const progressPercentage = document.getElementById('progressPercentageThreeBall');
  const currentPhase = document.getElementById('currentPhaseThreeBall');
  const detailResults = document.getElementById('detailResultsThreeBall');
  const startBacktestBtn = document.getElementById('startBacktestBtnThreeBall');
  const stopBacktestBtn = document.getElementById('stopBacktestBtnThreeBall');
  
  // 进度计算变量
  let totalProgress = 0;
  let currentStep = 0;
  let totalSteps = 0;
  
  // 终止标志
  let isBacktestStopped = false;
  
  // 更新进度的函数
  function updateProgress(text, percentage, phase) {
    return new Promise(resolve => {
      // 减少DOM更新频率，只在百分比变化较大时更新
      const roundedPercentage = Math.round(percentage);
      const currentRoundedPercentage = Math.round(parseFloat(progressBar.style.width || '0%'));
      
      if (Math.abs(roundedPercentage - currentRoundedPercentage) >= 5 || roundedPercentage === 100) {
        // 直接更新DOM，不依赖requestAnimationFrame
        progressText.textContent = text;
        progressBar.style.width = `${percentage}%`;
        progressPercentage.textContent = `${roundedPercentage}%`;
        currentPhase.textContent = phase;
      }
      resolve();
    });
  }
  
  try {
    // 显示终止回测按钮，隐藏开始回测按钮
    startBacktestBtn.style.display = 'none';
    stopBacktestBtn.style.display = 'inline-block';
    
    // 立即显示进度条，直接更新DOM
    await new Promise(resolve => {
      progressDiv.style.display = 'block';
      progressText.textContent = '开始搜索平均率最高的统计期..';
      progressBar.style.width = '0%';
      progressPercentage.textContent = '0%';
      currentPhase.textContent = '正在准备...';
      detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #666;">正在搜索平均率最高的统计期..</td></tr>';
      resolve();
    });
    
    // 重置终止标志
    isBacktestStopped = false;
    
    // 添加终止回测按钮点击事件
    stopBacktestBtn.onclick = function() {
      isBacktestStopped = true;
      updateProgress('回测已终止', 100, '回测终止');
    };
    
    // 使用全局配置的回测期数
    const currentBacktestPeriod = backtestPeriod;
    
    // 更新进度
    await updateProgress('正在获取总期数..', 5, '获取总期数');
    
    const totalPeriods = await getTotalPeriods();
    
    // 多阶段搜索策略，从大到小变化步长
    const searchStages = [
      { step: 200, expansion: 400 }, // 第一阶段：步长200，扩展范围400
      { step: 100, expansion: 200 }, // 第二阶段：步长100，扩展范围200
      { step: 50, expansion: 100 }    // 第三阶段：步长50，扩展范围100
    ];
    
    // 回测方法：只包含排名方法
    const backtestMethods = [];
    // 添加排名方法
    for (let i = 1; i <= 30; i++) {
      backtestMethods.push(`rank${i}`);
    }
    const allResults = [];
    
    // 计算总工作量
    totalSteps = backtestMethods.length * searchStages.length + 3; // 3个初始化和收尾步骤
    
    // 更新进度
    await updateProgress('正在获取最新一期期号..', 10, '获取最新期号');
    currentStep++;
    
    // 获取最后一期期号
    const lastPeriod = await getLastPeriod();
    const nextPeriod = (parseInt(lastPeriod) + 1) + '期'; // 使用最近期的期号+1作为下一期期号
    
    // 遍历所有回测方法
    for (const backtestMethod of backtestMethods) {
      let methodName;
      if (backtestMethod.startsWith('rank')) {
        const rankMatch = backtestMethod.match(/^rank(\d+)$/);
        methodName = rankMatch ? `排名第${rankMatch[1]}` : backtestMethod;
      } else {
        methodName = backtestMethod;
      }
      
      // 更新进度
      await updateProgress(`正在搜索回测方法: ${methodName}...`, 15 + (currentStep / totalSteps) * 60, `搜索回测方法: ${methodName}`);
      currentStep++;
      
      // 所有回测方法都从1500期开始
      let currentStart = 1500;
      let currentEnd = totalPeriods;
      let allTestResults = [];
      
      // 执行每个阶段的搜索
      for (let stageIndex = 0; stageIndex < searchStages.length; stageIndex++) {
        const stage = searchStages[stageIndex];
        const { step, expansion } = stage;
        
        // 更新进度
        const stageProgress = 15 + (currentStep / totalSteps) * 60;
        await updateProgress(
          `正在进行${methodName}方法的第${stageIndex + 1}阶段搜索（步长：${step}期）..`, 
          stageProgress, 
          `阶段${stageIndex + 1}，步长${step}`
        );
        currentStep++;
        
        let stageResults = [];
        
        // 计算当前阶段的期数范围和总次数
        const stageTotal = Math.ceil((currentEnd - currentStart) / step) + 1;
        
        // 生成所有需要测试的期数
        const testPeriods = [];
        for (let i = currentStart; i <= currentEnd; i += step) {
          testPeriods.push(i);
        }
        
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          break;
        }
        
        // 实时更新进度
        await updateProgress(
          `正在并行测试${testPeriods.length}个统计期..`, 
          15 + ((currentStep - 1) / totalSteps) * 60, 
          `并行测试 ${testPeriods.length} 个期数`
        );
        
        // 并行测试所有统计期
        const promises = testPeriods.map(period => testStatsPeriodThreeBall(currentBacktestPeriod, period, backtestMethod));
        const results = await Promise.all(promises);
        
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          break;
        }
        
        // 添加测试结果
        stageResults.push(...results);
        allTestResults.push(...results);
        
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          break;
        }
        
        // 如果当前阶段没有结果，继续下一阶段
        if (stageResults.length === 0) {
          continue;
        }
        
        // 找出当前阶段的最高正确率
        const highestAccuracy = Math.max(...stageResults.map(result => result.accuracy));
        
        // 找出当前阶段中所有最高正确率的结果
        const highestResultsInStage = stageResults.filter(result => result.accuracy === highestAccuracy);
        
        // 计算下一阶段的搜索范围
        const minStatsPeriod = Math.min(...highestResultsInStage.map(result => result.statsPeriod));
        const maxStatsPeriod = Math.max(...highestResultsInStage.map(result => result.statsPeriod));
        
        // 所有回测方法都使用1500期作为最小限制
        const minLimit = 1500;
        currentStart = Math.max(minLimit, minStatsPeriod - expansion);
        currentEnd = Math.min(totalPeriods, maxStatsPeriod + expansion);
      }
      
      // 从所有测试结果中找出最高正确率
      const highestAccuracy = Math.max(...allTestResults.map(result => result.accuracy));
      
      // 找出所有正确率等于最高值的期数
      const highestPeriods = allTestResults.filter(result => result.accuracy === highestAccuracy);
      
      // 对期数进行去重处理
      const uniquePeriodsMap = new Map();
      highestPeriods.forEach(result => {
        if (!uniquePeriodsMap.has(result.statsPeriod)) {
          uniquePeriodsMap.set(result.statsPeriod, result);
        }
      });
      
      // 将去重后的结果转换回数组，并添加回测方法信息
      const uniqueHighestPeriods = Array.from(uniquePeriodsMap.values()).map(result => ({
        ...result,
        backtestMethod
      }));
      
      // 添加到所有结果中
      allResults.push(...uniqueHighestPeriods);
    }
    
    // 更新进度
    await updateProgress('搜索完成，正在获取前区推荐买号..', 85, '获取前区推荐买号');
    currentStep++;
    
    // 为每个结果获取前区推荐买号，并过滤掉空推荐号码的排名方法结果
    const validResults = [];
    
    // 并行获取前区推荐买号
    const promises = allResults.map(async (result) => {
      if (isBacktestStopped) return null;
      
      result.frontBuyNumbers = await huo_qu_qian_qu_tui_jian_mai_hao_three_ball(result.statsPeriod, result.backtestMethod);
      
      // 如果是排名方法且没有找到对应排名的号码（返回空数组），则过滤掉该结果
      if (result.backtestMethod.match(/^rank(\d+)$/) && result.frontBuyNumbers.length === 0) {
        return null;
      }
      
      return result;
    });
    
    // 等待所有并行请求完成
    const allResultsWithBuyNumbers = await Promise.all(promises);
    
    // 过滤掉null结果
    for (const result of allResultsWithBuyNumbers) {
      if (result && !isBacktestStopped) {
        validResults.push(result);
      }
    }
    
    // 检查是否需要终止回测
    if (isBacktestStopped) {
      detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">回测已终止</td></tr>';
    } else {
      // 过滤回测结果：如果回测方法相同且下一期前区推荐买号相同，只保留一条
      const uniqueResultsMap = new Map();
      
      validResults.forEach(result => {
        // 基于回测方法和下一期前区推荐买号（排序后）创建唯一键
        const sortedBuyNumbers = [...(result.frontBuyNumbers || [])].sort((a, b) => a - b);
        const uniqueKey = `${result.backtestMethod}_${sortedBuyNumbers.join('_')}`;
        
        // 只保留第一条出现的结果
        if (!uniqueResultsMap.has(uniqueKey)) {
          uniqueResultsMap.set(uniqueKey, result);
        }
      });
      
      // 将过滤后的结果转换回数组
      const filteredResults = Array.from(uniqueResultsMap.values());
      
      // 更新进度
      await updateProgress(`找到 ${filteredResults.length} 个平均率最高的统计期，正在渲染结果...`, 98, '渲染结果');
      currentStep++;
      
      // 渲染详情数据，传递过滤后的结果和下一期期号
      await renderDetailDataThreeBall(filteredResults, nextPeriod);
      
      // 存储回测结果到全局变量
      backtestResults['threeBall'] = {
        results: filteredResults,
        nextPeriod: nextPeriod,
        timestamp: new Date().toISOString()
      };
      
      // 更新进度
      await updateProgress('搜索完成，正在隐藏进度条...', 100, '完成');
    }
    
    // 隐藏进度
    await new Promise(resolve => {
      setTimeout(() => {
        progressDiv.style.display = 'none';
        resolve();
      }, 500);
    });
    
  } catch (error) {
    console.error('搜索最高正确率统计期失败', error);
    
    // 更新进度
    await updateProgress('搜索失败，请重试', 100, '搜索失败');
    detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">搜索失败，请重试</td></tr>';
  } finally {
    // 恢复按钮状态
    startBacktestBtn.style.display = 'inline-block';
    stopBacktestBtn.style.display = 'none';
    // 重置终止标志
    isBacktestStopped = false;
  }
}

// 近两期两球组合平均率最高统计期详情回测函数（旧版本，已替换）
async function performSearchNearTwoPeriodsOld() {
  try {
    const resultsContainer = document.getElementById('detailResultsNearTwoPeriods');
    const progressContainer = document.getElementById('progressNearTwoPeriods');
    const buyNumbersContainer = document.getElementById('buyNumbersCollectionNearTwoPeriods');
    
    if (progressContainer) {
      progressContainer.style.display = 'block';
    }
    
    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 20px; color: #666;">回测功能开发中</td>
        </tr>
      `;
    }
    
    if (buyNumbersContainer) {
      const buyNumbersContent = document.getElementById('buyNumbersCollectionContentNearTwoPeriods');
      if (buyNumbersContent) {
        buyNumbersContent.innerHTML = '<div style="color: #666;">回测功能开发中</div>';
      }
    }
  } catch (error) {
    console.error('执行近两期两球组合回测失败:', error);
  }
}

// 从后端获取回测数据 - 使用dao_shu_2_qi_san_qiu_mai_hao_hui_ce_xiang_qing.html的算法
async function huo_qu_dao_shu_2_qi_san_qiu_mai_hao_hui_ce(backtestPeriod = '50', statsPeriod = '100', backtestMethod = 'most') {
  try {
    const response = await fetch(`http://localhost:18889/dao_shu_2_qi_san_qiu_mai_hao_hui_ce?backtest_period=${backtestPeriod}&stats_period=${statsPeriod}&backtest_method=${backtestMethod}`);
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

// 测试单个统计期值的平均正确率 - 使用dao_shu_2_qi_san_qiu_mai_hao_hui_ce_xiang_qing.html的算法
async function testStatsPeriodSecondLastThreeBall(backtestPeriod, statsPeriod, backtestMethod) {
  try {
    const backtestData = await huo_qu_dao_shu_2_qi_san_qiu_mai_hao_hui_ce(backtestPeriod, statsPeriod, backtestMethod);
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

// 获取前区推荐买号 - 使用与dao_shu_2_qi_san_qiu_zu_he.html相同的算法
async function huo_qu_qian_qu_tui_jian_mai_hao_second_last_three_ball(statsPeriod, backtestMethod) {
  try {
    // 调用与dao_shu_2_qi_san_qiu_zu_he.html相同的接口获取倒数2期三球组合数据
    const response = await fetch(`http://localhost:18889/dao_shu_2_qi_san_qiu_zu_he?period=${statsPeriod}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (result.success) {
      const analysisData = result.data;
      const frontCombinations = analysisData.frontCombinations;
      let frontBuyNumbers = [];
      
      // 初始化汇总计数数组 - 与dao_shu_2_qi_san_qiu_zu_he.js完全相同
      const totalCounts = new Array(36).fill(0); // 索引0不使用，1-35对应前区号码
      
      // 遍历前区组合，统计每个号码的出现次数 - 与dao_shu_2_qi_san_qiu_zu_he.js完全相同
      frontCombinations.forEach(combo => {
        // 累加每个号码的出现次数
        for (let i = 1; i <= 35; i++) {
          const numStr = String(i); // 后端使用数字作为键，不需要补0
          const count = combo.numberCounts[numStr] || 0;
          totalCounts[i] += count;
        }
      });
      
      // 根据回测方法计算对应的前区推荐买号 - 与dao_shu_2_qi_san_qiu_zu_he.js完全相同
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
      } else if (backtestMethod.match(/^rank(\d+)$/)) {
        // 排名方法：根据排名选择号码
        const rankMatch = backtestMethod.match(/^rank(\d+)$/);
        const rank = parseInt(rankMatch[1]);
        
        // 按出现次数降序排序号码（包括出现次数为0的号码）
        const sortedNumbers = [];
        for (let i = 1; i <= 35; i++) {
          sortedNumbers.push({ number: i, count: totalCounts[i] || 0 });
        }
        sortedNumbers.sort((a, b) => b.count - a.count);
        
        // 计算每个号码的实际排名
        const rankMap = {};
        let currentRank = 1;
        
        for (let i = 0; i < sortedNumbers.length; i++) {
          if (i > 0 && sortedNumbers[i].count !== sortedNumbers[i - 1].count) {
            currentRank++;
          }
          rankMap[sortedNumbers[i].number] = currentRank;
        }
        
        // 找出所有排名等于指定排名的号码
        for (let i = 1; i <= 35; i++) {
          if (rankMap[i] === rank) {
            frontBuyNumbers.push(i);
          }
        }
      }
      
      return frontBuyNumbers;
    } else {
      alert('接口失败');
      return [];
    }
  } catch (error) {
    console.error('获取前区推荐买号失败:', error);
    return [];
  }
}

// 从后端获取回测数据 - 使用dao_shu_3_qi_san_qiu_mai_hao_hui_ce_xiang_qing.html的算法
async function huo_qu_dao_shu_3_qi_san_qiu_mai_hao_hui_ce(backtestPeriod = '50', statsPeriod = '100', backtestMethod = 'most') {
  try {
    const response = await fetch(`http://localhost:18889/dao_shu_3_qi_san_qiu_mai_hao_hui_ce?backtest_period=${backtestPeriod}&stats_period=${statsPeriod}&backtest_method=${backtestMethod}`);
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

// 测试单个统计期值的平均正确率 - 使用dao_shu_3_qi_san_qiu_mai_hao_hui_ce_xiang_qing.html的算法
async function testStatsPeriodThirdLastThreeBall(backtestPeriod, statsPeriod, backtestMethod) {
  try {
    const backtestData = await huo_qu_dao_shu_3_qi_san_qiu_mai_hao_hui_ce(backtestPeriod, statsPeriod, backtestMethod);
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

// 获取前区推荐买号 - 使用与dao_shu_3_qi_san_qiu_zu_he.html相同的算法
async function huo_qu_qian_qu_tui_jian_mai_hao_third_last_three_ball(statsPeriod, backtestMethod) {
  try {
    // 调用与dao_shu_3_qi_san_qiu_zu_he.html相同的接口获取倒数3期三球组合数据
    const response = await fetch(`http://localhost:18889/dao_shu_3_qi_san_qiu_zu_he?period=${statsPeriod}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (result.success) {
      const analysisData = result.data;
      const frontCombinations = analysisData.frontCombinations;
      let frontBuyNumbers = [];
      
      // 初始化汇总计数数组 - 与dao_shu_3_qi_san_qiu_zu_he.js完全相同
      const totalCounts = new Array(36).fill(0); // 索引0不使用，1-35对应前区号码
      
      // 遍历前区组合，统计每个号码的出现次数 - 与dao_shu_3_qi_san_qiu_zu_he.js完全相同
      frontCombinations.forEach(combo => {
        // 累加每个号码的出现次数
        for (let i = 1; i <= 35; i++) {
          const numStr = String(i); // 后端使用数字作为键，不需要补0
          const count = combo.numberCounts[numStr] || 0;
          totalCounts[i] += count;
        }
      });
      
      // 根据回测方法计算对应的前区推荐买号 - 与dao_shu_3_qi_san_qiu_zu_he.js完全相同
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
      } else if (backtestMethod.match(/^rank(\d+)$/)) {
        // 排名方法：根据排名选择号码
        const rankMatch = backtestMethod.match(/^rank(\d+)$/);
        const rank = parseInt(rankMatch[1]);
        
        // 按出现次数降序排序号码（包括出现次数为0的号码）
        const sortedNumbers = [];
        for (let i = 1; i <= 35; i++) {
          sortedNumbers.push({ number: i, count: totalCounts[i] || 0 });
        }
        sortedNumbers.sort((a, b) => b.count - a.count);
        
        // 计算每个号码的实际排名
        const rankMap = {};
        let currentRank = 1;
        
        for (let i = 0; i < sortedNumbers.length; i++) {
          if (i > 0 && sortedNumbers[i].count !== sortedNumbers[i - 1].count) {
            currentRank++;
          }
          rankMap[sortedNumbers[i].number] = currentRank;
        }
        
        // 找出所有排名等于指定排名的号码
        for (let i = 1; i <= 35; i++) {
          if (rankMap[i] === rank) {
            frontBuyNumbers.push(i);
          }
        }
      }
      
      return frontBuyNumbers;
    } else {
      alert('接口失败');
      return [];
    }
  } catch (error) {
    console.error('获取前区推荐买号失败:', error);
    return [];
  }
}

// 渲染详情数据 - 倒数2期三球组合
async function renderDetailDataSecondLastThreeBall(allResults, nextNextPeriod) {
  const detailResults = document.getElementById('detailResultsSecondLastThreeBall');
  const buyNumbersContent = document.getElementById('buyNumbersCollectionContentSecondLastThreeBall');
  
  try {
    // 清空当前内容
    detailResults.innerHTML = '';
    
    // 如果没有结果，显示提示
    if (allResults.length === 0) {
      detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #666;">未找到平均率最高的统计期</td></tr>';
      return;
    }
    
    // 过滤回测结果：如果回测方法相同且下下期前区推荐买号相同，只保留一条
    const uniqueResultsMap = new Map();
    
    allResults.forEach(result => {
      // 基于回测方法和下下期前区推荐买号（排序后）创建唯一键
      const sortedBuyNumbers = [...(result.frontBuyNumbers || [])].sort((a, b) => a - b);
      const uniqueKey = `${result.backtestMethod}_${sortedBuyNumbers.join('_')}`;
      
      // 只保留第一条出现的结果
      if (!uniqueResultsMap.has(uniqueKey)) {
        uniqueResultsMap.set(uniqueKey, result);
      }
    });
    
    // 将过滤后的结果转换回数组
    const filteredResults = Array.from(uniqueResultsMap.values());
    
    // 按照平均正确率降序排序
    filteredResults.sort((a, b) => b.accuracy - a.accuracy);
    
    // 遍历过滤后的结果
    const allBuyNumbers = [];
    for (const result of filteredResults) {
      const { statsPeriod, accuracy, backtestMethod, frontBuyNumbers } = result;
      
      // 平均正确率已经在搜索阶段计算好
      const averageCorrectRate = accuracy.toFixed(3);
      
      // 获取回测方法中文名称
      let backtestMethodText = '出现最多';
      if (backtestMethod === 'least') {
        backtestMethodText = '出现最少';
      } else if (backtestMethod === 'average') {
        backtestMethodText = '出现平均';
      } else if (backtestMethod.match(/^rank(\d+)$/)) {
        // 排名方法：显示为"排名第X"
        const rankMatch = backtestMethod.match(/^rank(\d+)$/);
        const rank = parseInt(rankMatch[1]);
        backtestMethodText = `排名第${rank}`;
      }
      
      // 格式化前区推荐买号
      const frontBuyNumbersStr = frontBuyNumbers.map(num => `<span class="red-ball">${num}</span>`).join(' ');
      
      // 创建表格行
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${backtestMethodText}</td>
        <td>${backtestPeriod}期</td>
        <td>${statsPeriod}期</td>
        <td>${averageCorrectRate}%</td>
        <td>${nextNextPeriod}</td>
        <td>${nextNextPeriod}</td>
        <td>${frontBuyNumbersStr}</td>
        <td>
          <button class="btn copy-btn" style="background-color: #4CAF50; color: white; padding: 5px 10px; font-size: 12px;">复制</button>
        </td>
      `;
      
      // 添加复制按钮事件
      const copyBtn = tr.querySelector('.copy-btn');
      copyBtn.addEventListener('click', () => copyToClipboard(frontBuyNumbers));
      
      detailResults.appendChild(tr);
      
      // 收集所有推荐买号
      frontBuyNumbers.forEach(num => {
        if (!allBuyNumbers.includes(num)) {
          allBuyNumbers.push(num);
        }
      });
    }
    
    // 更新推荐买号合集
    if (buyNumbersContent) {
      if (allBuyNumbers.length > 0) {
        // 按平均正确率累加进行排序，同一个推荐买号的球，回测方法相同时，只保留平均正确率大的
        const numberAccuracyMap = new Map();
        
        // 遍历所有结果，计算每个号码的平均正确率累加
        filteredResults.forEach(result => {
          const { accuracy, backtestMethod, frontBuyNumbers } = result;
          
          if (frontBuyNumbers && frontBuyNumbers.length > 0) {
            frontBuyNumbers.forEach(num => {
              const numStr = num.toString();
              const key = `${backtestMethod}_${numStr}`;
              
              if (numberAccuracyMap.has(key)) {
                // 检查回测方法是否相同
                const existingData = numberAccuracyMap.get(key);
                if (existingData.backtestMethod === backtestMethod) {
                  // 如果回测方法相同，只保留平均正确率大的
                  if (accuracy > existingData.accuracy) {
                    numberAccuracyMap.set(key, { accuracy, backtestMethod, number: num });
                  }
                }
              } else {
                // 第一次出现，直接添加
                numberAccuracyMap.set(key, { accuracy, backtestMethod, number: num });
              }
            });
          }
        });
        
        // 现在对每个号码，按回测方法分组，相同回测方法只保留最高正确率，不同回测方法累加
        const finalNumberMap = new Map();
        numberAccuracyMap.forEach((data, key) => {
          const { accuracy, backtestMethod, number } = data;
          const numStr = number.toString();
          
          if (finalNumberMap.has(numStr)) {
            const existingData = finalNumberMap.get(numStr);
            // 不同回测方法，累加正确率
            const newAccuracy = existingData.accuracy + accuracy;
            finalNumberMap.set(numStr, { accuracy: newAccuracy, backtestMethod: 'combined', number: number });
          } else {
            finalNumberMap.set(numStr, { accuracy, backtestMethod, number: number });
          }
        });
        
        // 转换为数组并按平均正确率降序排序
        const sortedNumbers = Array.from(finalNumberMap.values())
          .sort((a, b) => b.accuracy - a.accuracy);
        
        // 生成推荐买号合集的HTML
        buyNumbersContent.innerHTML = sortedNumbers.map(item => {
          const accuracyText = item.accuracy.toFixed(3);
          return `<div style="display: flex; align-items: center; gap: 5px;">
            <div class="red-ball">${item.number}</div>
            <div style="font-size: 12px; color: #666;">${accuracyText}%</div>
          </div>`;
        }).join(' ');
      } else {
        buyNumbersContent.innerHTML = '<div style="color: #666;">暂无推荐买号数据</div>';
      }
    }
  } catch (error) {
    console.error('渲染详情数据失败:', error);
    detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">加载失败，请重试</td></tr>';
  }
}

// 渲染详情数据 - 倒数3期三球组合
async function renderDetailDataThirdLastThreeBall(allResults, nextNextNextPeriod) {
  const detailResults = document.getElementById('detailResultsThirdLastThreeBall');
  const buyNumbersContent = document.getElementById('buyNumbersCollectionContentThirdLastThreeBall');
  
  try {
    // 清空当前内容
    detailResults.innerHTML = '';
    
    // 如果没有结果，显示提示
    if (allResults.length === 0) {
      detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #666;">未找到平均率最高的统计期</td></tr>';
      return;
    }
    
    // 过滤回测结果：如果回测方法相同且下下下期前区推荐买号相同，只保留一条
    const uniqueResultsMap = new Map();
    
    allResults.forEach(result => {
      // 基于回测方法和下下下期前区推荐买号（排序后）创建唯一键
      const sortedBuyNumbers = [...(result.frontBuyNumbers || [])].sort((a, b) => a - b);
      const uniqueKey = `${result.backtestMethod}_${sortedBuyNumbers.join('_')}`;
      
      // 只保留第一条出现的结果
      if (!uniqueResultsMap.has(uniqueKey)) {
        uniqueResultsMap.set(uniqueKey, result);
      }
    });
    
    // 将过滤后的结果转换回数组
    const filteredResults = Array.from(uniqueResultsMap.values());
    
    // 按照平均正确率降序排序
    filteredResults.sort((a, b) => b.accuracy - a.accuracy);
    
    // 遍历过滤后的结果
    const allBuyNumbers = [];
    for (const result of filteredResults) {
      const { statsPeriod, accuracy, backtestMethod, frontBuyNumbers } = result;
      
      // 平均正确率已经在搜索阶段计算好
      const averageCorrectRate = accuracy.toFixed(3);
      
      // 获取回测方法中文名称
      let backtestMethodText = '出现最多';
      if (backtestMethod === 'least') {
        backtestMethodText = '出现最少';
      } else if (backtestMethod === 'average') {
        backtestMethodText = '出现平均';
      } else if (backtestMethod.match(/^rank(\d+)$/)) {
        // 排名方法：显示为"排名第X"
        const rankMatch = backtestMethod.match(/^rank(\d+)$/);
        const rank = parseInt(rankMatch[1]);
        backtestMethodText = `排名第${rank}`;
      }
      
      // 格式化前区推荐买号
      const frontBuyNumbersStr = frontBuyNumbers.map(num => `<span class="red-ball">${num}</span>`).join(' ');
      
      // 创建表格行
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${backtestMethodText}</td>
        <td>${backtestPeriod}期</td>
        <td>${statsPeriod}期</td>
        <td>${averageCorrectRate}%</td>
        <td>${nextNextNextPeriod}</td>
        <td>${nextNextNextPeriod}</td>
        <td>${frontBuyNumbersStr}</td>
        <td>
          <button class="btn copy-btn" style="background-color: #4CAF50; color: white; padding: 5px 10px; font-size: 12px;">复制</button>
        </td>
      `;
      
      // 添加复制按钮事件
      const copyBtn = tr.querySelector('.copy-btn');
      copyBtn.addEventListener('click', () => copyToClipboard(frontBuyNumbers));
      
      detailResults.appendChild(tr);
      
      // 收集所有推荐买号
      frontBuyNumbers.forEach(num => {
        if (!allBuyNumbers.includes(num)) {
          allBuyNumbers.push(num);
        }
      });
    }
    
    // 更新推荐买号合集
    if (buyNumbersContent) {
      if (allBuyNumbers.length > 0) {
        // 按平均正确率累加进行排序，同一个推荐买号的球，回测方法相同时，只保留平均正确率大的
        const numberAccuracyMap = new Map();
        
        // 遍历所有结果，计算每个号码的平均正确率累加
        filteredResults.forEach(result => {
          const { accuracy, backtestMethod, frontBuyNumbers } = result;
          
          if (frontBuyNumbers && frontBuyNumbers.length > 0) {
            frontBuyNumbers.forEach(num => {
              const numStr = num.toString();
              const key = `${backtestMethod}_${numStr}`;
              
              if (numberAccuracyMap.has(key)) {
                // 检查回测方法是否相同
                const existingData = numberAccuracyMap.get(key);
                if (existingData.backtestMethod === backtestMethod) {
                  // 如果回测方法相同，只保留平均正确率大的
                  if (accuracy > existingData.accuracy) {
                    numberAccuracyMap.set(key, { accuracy, backtestMethod, number: num });
                  }
                }
              } else {
                // 第一次出现，直接添加
                numberAccuracyMap.set(key, { accuracy, backtestMethod, number: num });
              }
            });
          }
        });
        
        // 现在对每个号码，按回测方法分组，相同回测方法只保留最高正确率，不同回测方法累加
        const finalNumberMap = new Map();
        numberAccuracyMap.forEach((data, key) => {
          const { accuracy, backtestMethod, number } = data;
          const numStr = number.toString();
          
          if (finalNumberMap.has(numStr)) {
            const existingData = finalNumberMap.get(numStr);
            // 不同回测方法，累加正确率
            const newAccuracy = existingData.accuracy + accuracy;
            finalNumberMap.set(numStr, { accuracy: newAccuracy, backtestMethod: 'combined', number: number });
          } else {
            finalNumberMap.set(numStr, { accuracy, backtestMethod, number: number });
          }
        });
        
        // 转换为数组并按平均正确率降序排序
        const sortedNumbers = Array.from(finalNumberMap.values())
          .sort((a, b) => b.accuracy - a.accuracy);
        
        // 生成推荐买号合集的HTML
        buyNumbersContent.innerHTML = sortedNumbers.map(item => {
          const accuracyText = item.accuracy.toFixed(3);
          return `<div style="display: flex; align-items: center; gap: 5px;">
            <div class="red-ball">${item.number}</div>
            <div style="font-size: 12px; color: #666;">${accuracyText}%</div>
          </div>`;
        }).join(' ');
      } else {
        buyNumbersContent.innerHTML = '<div style="color: #666;">暂无推荐买号数据</div>';
      }
    }
  } catch (error) {
    console.error('渲染详情数据失败:', error);
    detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">加载失败，请重试</td></tr>';
  }
}

// 倒数2期三球组合平均率最高统计期详情回测函数
async function performSearchSecondLastThreeBall() {
  const progressDiv = document.getElementById('progressSecondLastThreeBall');
  const progressText = document.getElementById('progressTextSecondLastThreeBall');
  const progressBar = document.getElementById('progressBarSecondLastThreeBall');
  const progressPercentage = document.getElementById('progressPercentageSecondLastThreeBall');
  const currentPhase = document.getElementById('currentPhaseSecondLastThreeBall');
  const detailResults = document.getElementById('detailResultsSecondLastThreeBall');
  const startBacktestBtn = document.getElementById('startBacktestBtnSecondLastThreeBall');
  const stopBacktestBtn = document.getElementById('stopBacktestBtnSecondLastThreeBall');
  
  // 进度计算变量
  let totalProgress = 0;
  let currentStep = 0;
  let totalSteps = 0;
  
  // 终止标志
  let isBacktestStopped = false;
  
  // 更新进度的函数
  function updateProgress(text, percentage, phase) {
    return new Promise(resolve => {
      // 减少DOM更新频率，只在百分比变化较大时更新
      const roundedPercentage = Math.round(percentage);
      const currentRoundedPercentage = Math.round(parseFloat(progressBar.style.width || '0%'));
      
      if (Math.abs(roundedPercentage - currentRoundedPercentage) >= 5 || roundedPercentage === 100) {
        // 直接更新DOM，不依赖requestAnimationFrame
        progressText.textContent = text;
        progressBar.style.width = `${percentage}%`;
        progressPercentage.textContent = `${roundedPercentage}%`;
        currentPhase.textContent = phase;
      }
      resolve();
    });
  }
  
  try {
    // 显示终止回测按钮，隐藏开始回测按钮
    startBacktestBtn.style.display = 'none';
    stopBacktestBtn.style.display = 'inline-block';
    
    // 立即显示进度条，直接更新DOM
    await new Promise(resolve => {
      progressDiv.style.display = 'block';
      progressText.textContent = '开始搜索平均率最高的统计期..';
      progressBar.style.width = '0%';
      progressPercentage.textContent = '0%';
      currentPhase.textContent = '正在准备...';
      detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #666;">正在搜索平均率最高的统计期..</td></tr>';
      resolve();
    });
    
    // 重置终止标志
    isBacktestStopped = false;
    
    // 添加终止回测按钮点击事件
    stopBacktestBtn.onclick = function() {
      isBacktestStopped = true;
      updateProgress('回测已终止', 100, '回测终止');
    };
    
    // 使用全局配置的回测期数
    const currentBacktestPeriod = backtestPeriod;
    
    // 更新进度
    await updateProgress('正在获取总期数..', 5, '获取总期数');
    
    const totalPeriods = await getTotalPeriods();
    
    // 多阶段搜索策略，从大到小变化步长
    const searchStages = [
      { step: 200, expansion: 400 }, // 第一阶段：步长200，扩展范围400
      { step: 100, expansion: 200 }, // 第二阶段：步长100，扩展范围200
      { step: 50, expansion: 100 }    // 第三阶段：步长50，扩展范围100
    ];
    
    // 回测方法：只包含排名方法
    const backtestMethods = [];
    // 添加排名方法
    for (let i = 1; i <= 30; i++) {
      backtestMethods.push(`rank${i}`);
    }
    const allResults = [];
    
    // 计算总工作量
    totalSteps = backtestMethods.length * searchStages.length + 3; // 3个初始化和收尾步骤
    
    // 更新进度
    await updateProgress('正在获取最新一期期号..', 10, '获取最新期号');
    currentStep++;
    
    // 获取最后一期期号
    const lastPeriod = await getLastPeriod();
    const nextNextPeriod = (parseInt(lastPeriod) + 2) + '期'; // 使用最近期的期号+2作为下下期期号
    
    // 遍历所有回测方法
    for (const backtestMethod of backtestMethods) {
      let methodName;
      if (backtestMethod.startsWith('rank')) {
        const rankMatch = backtestMethod.match(/^rank(\d+)$/);
        methodName = rankMatch ? `排名第${rankMatch[1]}` : backtestMethod;
      } else {
        methodName = backtestMethod;
      }
      
      // 更新进度
      await updateProgress(`正在搜索回测方法: ${methodName}...`, 15 + (currentStep / totalSteps) * 60, `搜索回测方法: ${methodName}`);
      currentStep++;
      
      // 所有回测方法都从1500期开始
      let currentStart = 1500;
      let currentEnd = totalPeriods;
      let allTestResults = [];
      
      // 执行每个阶段的搜索
      for (let stageIndex = 0; stageIndex < searchStages.length; stageIndex++) {
        const stage = searchStages[stageIndex];
        const { step, expansion } = stage;
        
        // 更新进度
        const stageProgress = 15 + (currentStep / totalSteps) * 60;
        await updateProgress(
          `正在进行${methodName}方法的第${stageIndex + 1}阶段搜索（步长：${step}期）..`, 
          stageProgress, 
          `阶段${stageIndex + 1}，步长${step}`
        );
        currentStep++;
        
        let stageResults = [];
        
        // 生成所有需要测试的期数
        const testPeriods = [];
        for (let i = currentStart; i <= currentEnd; i += step) {
          testPeriods.push(i);
        }
        
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          continue;
        }
        
        // 实时更新进度
        await updateProgress(
          `正在并行测试${testPeriods.length}个统计期..`, 
          15 + ((currentStep - 1) / totalSteps) * 60, 
          `并行测试 ${testPeriods.length} 个期数`
        );
        
        // 并行测试所有统计期
        const promises = testPeriods.map(period => testStatsPeriodSecondLastThreeBall(currentBacktestPeriod, period, backtestMethod));
        const results = await Promise.all(promises);
        
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          continue;
        }
        
        // 添加测试结果
        stageResults.push(...results);
        allTestResults.push(...results);
        
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          break;
        }
        
        // 如果当前阶段没有结果，继续下一阶段
        if (stageResults.length === 0) {
          continue;
        }
        
        // 找出当前阶段的最高正确率
        const highestAccuracy = Math.max(...stageResults.map(result => result.accuracy));
        
        // 找出当前阶段中所有最高正确率的结果
        const highestResultsInStage = stageResults.filter(result => result.accuracy === highestAccuracy);
        
        // 计算下一阶段的搜索范围
        const minStatsPeriod = Math.min(...highestResultsInStage.map(result => result.statsPeriod));
        const maxStatsPeriod = Math.max(...highestResultsInStage.map(result => result.statsPeriod));
        
        // 所有回测方法都使用1500期作为最小限制
        const minLimit = 1500;
        currentStart = Math.max(minLimit, minStatsPeriod - expansion);
        currentEnd = Math.min(totalPeriods, maxStatsPeriod + expansion);
      }
      
      // 从所有测试结果中找出最高正确率
      const highestAccuracy = Math.max(...allTestResults.map(result => result.accuracy));
      
      // 找出所有正确率等于最高值的期数
      const highestPeriods = allTestResults.filter(result => result.accuracy === highestAccuracy);
      
      // 对期数进行去重处理
      const uniquePeriodsMap = new Map();
      highestPeriods.forEach(result => {
        if (!uniquePeriodsMap.has(result.statsPeriod)) {
          uniquePeriodsMap.set(result.statsPeriod, result);
        }
      });
      
      // 将去重后的结果转换回数组，并添加回测方法信息
      const uniqueHighestPeriods = Array.from(uniquePeriodsMap.values()).map(result => ({
        ...result,
        backtestMethod
      }));
      
      // 添加到所有结果中
      allResults.push(...uniqueHighestPeriods);
    }
    
    // 更新进度
    await updateProgress('搜索完成，正在获取前区推荐买号..', 85, '获取前区推荐买号');
    currentStep++;
    
    // 为每个结果获取前区推荐买号，并过滤掉空推荐号码的排名方法结果
    const validResults = [];
    
    // 并行获取前区推荐买号
    const promises = allResults.map(async (result) => {
      if (isBacktestStopped) return null;
      
      result.frontBuyNumbers = await huo_qu_qian_qu_tui_jian_mai_hao_second_last_three_ball(result.statsPeriod, result.backtestMethod);
      
      // 如果是排名方法且没有找到对应排名的号码（返回空数组），则过滤掉该结果
      if (result.backtestMethod.match(/^rank(\d+)$/) && result.frontBuyNumbers.length === 0) {
        return null;
      }
      
      return result;
    });
    
    // 等待所有并行请求完成
    const allResultsWithBuyNumbers = await Promise.all(promises);
    
    // 过滤掉null结果
    for (const result of allResultsWithBuyNumbers) {
      if (result && !isBacktestStopped) {
        validResults.push(result);
      }
    }
    
    // 检查是否需要终止回测
    if (isBacktestStopped) {
      detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">回测已终止</td></tr>';
    } else {
      // 过滤回测结果：如果回测方法相同且下下期前区推荐买号相同，只保留一条
      const uniqueResultsMap = new Map();
      
      validResults.forEach(result => {
        // 基于回测方法和下下期前区推荐买号（排序后）创建唯一键
        const sortedBuyNumbers = [...(result.frontBuyNumbers || [])].sort((a, b) => a - b);
        const uniqueKey = `${result.backtestMethod}_${sortedBuyNumbers.join('_')}`;
        
        // 只保留第一条出现的结果
        if (!uniqueResultsMap.has(uniqueKey)) {
          uniqueResultsMap.set(uniqueKey, result);
        }
      });
      
      // 将过滤后的结果转换回数组
      const filteredResults = Array.from(uniqueResultsMap.values());
      
      // 更新进度
      await updateProgress(`找到 ${filteredResults.length} 个平均率最高的统计期，正在渲染结果...`, 98, '渲染结果');
      currentStep++;
      
      // 渲染详情数据，传递过滤后的结果和下下期期号
      await renderDetailDataSecondLastThreeBall(filteredResults, nextNextPeriod);
      
      // 存储回测结果到全局变量
      backtestResults['secondLastThreeBall'] = {
        results: filteredResults,
        nextPeriod: nextNextPeriod,
        timestamp: new Date().toISOString()
      };
      
      // 更新进度
      await updateProgress('搜索完成，正在隐藏进度条...', 100, '完成');
    }
    
    // 隐藏进度
    await new Promise(resolve => {
      setTimeout(() => {
        progressDiv.style.display = 'none';
        resolve();
      }, 500);
    });
    
  } catch (error) {
    console.error('搜索最高正确率统计期失败', error);
    
    // 更新进度
    await updateProgress('搜索失败，请重试', 100, '搜索失败');
    detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">搜索失败，请重试</td></tr>';
  } finally {
    // 恢复按钮状态
    startBacktestBtn.style.display = 'inline-block';
    stopBacktestBtn.style.display = 'none';
    // 重置终止标志
    isBacktestStopped = false;
  }
}

// 最新一期三球组合平均率最高统计期详情回测函数（旧版本，已替换）
async function performSearchThreeBallOld() {
  try {
    const resultsContainer = document.getElementById('detailResultsThreeBall');
    const progressContainer = document.getElementById('progressThreeBall');
    const buyNumbersContainer = document.getElementById('buyNumbersCollectionThreeBall');
    
    if (progressContainer) {
      progressContainer.style.display = 'block';
    }
    
    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 20px; color: #666;">回测功能开发中</td>
        </tr>
      `;
    }
    
    if (buyNumbersContainer) {
      const buyNumbersContent = document.getElementById('buyNumbersCollectionContentThreeBall');
      if (buyNumbersContent) {
        buyNumbersContent.innerHTML = '<div style="color: #666;">回测功能开发中</div>';
      }
    }
  } catch (error) {
    console.error('执行最新一期三球组合回测失败:', error);
  }
}

// 倒数2期三球组合平均率最高统计期详情回测函数（旧版本，已替换）
async function performSearchSecondLastThreeBallOld() {
  try {
    const resultsContainer = document.getElementById('detailResultsSecondLastThreeBall');
    const progressContainer = document.getElementById('progressSecondLastThreeBall');
    const buyNumbersContainer = document.getElementById('buyNumbersCollectionSecondLastThreeBall');
    
    if (progressContainer) {
      progressContainer.style.display = 'block';
    }
    
    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 20px; color: #666;">回测功能开发中</td>
        </tr>
      `;
    }
    
    if (buyNumbersContainer) {
      const buyNumbersContent = document.getElementById('buyNumbersCollectionContentSecondLastThreeBall');
      if (buyNumbersContent) {
        buyNumbersContent.innerHTML = '<div style="color: #666;">回测功能开发中</div>';
      }
    }
  } catch (error) {
    console.error('执行倒数2期三球组合回测失败:', error);
  }
}

// 倒数3期三球组合平均率最高统计期详情回测函数
async function performSearchThirdLastThreeBall() {
  const progressDiv = document.getElementById('progressThirdLastThreeBall');
  const progressText = document.getElementById('progressTextThirdLastThreeBall');
  const progressBar = document.getElementById('progressBarThirdLastThreeBall');
  const progressPercentage = document.getElementById('progressPercentageThirdLastThreeBall');
  const currentPhase = document.getElementById('currentPhaseThirdLastThreeBall');
  const detailResults = document.getElementById('detailResultsThirdLastThreeBall');
  const startBacktestBtn = document.getElementById('startBacktestBtnThirdLastThreeBall');
  const stopBacktestBtn = document.getElementById('stopBacktestBtnThirdLastThreeBall');
  
  // 进度计算变量
  let totalProgress = 0;
  let currentStep = 0;
  let totalSteps = 0;
  
  // 终止标志
  let isBacktestStopped = false;
  
  // 更新进度的函数
  function updateProgress(text, percentage, phase) {
    return new Promise(resolve => {
      // 减少DOM更新频率，只在百分比变化较大时更新
      const roundedPercentage = Math.round(percentage);
      const currentRoundedPercentage = Math.round(parseFloat(progressBar.style.width || '0%'));
      
      if (Math.abs(roundedPercentage - currentRoundedPercentage) >= 5 || roundedPercentage === 100) {
        // 直接更新DOM，不依赖requestAnimationFrame
        progressText.textContent = text;
        progressBar.style.width = `${percentage}%`;
        progressPercentage.textContent = `${roundedPercentage}%`;
        currentPhase.textContent = phase;
      }
      resolve();
    });
  }
  
  try {
    // 显示终止回测按钮，隐藏开始回测按钮
    startBacktestBtn.style.display = 'none';
    stopBacktestBtn.style.display = 'inline-block';
    
    // 立即显示进度条，直接更新DOM
    await new Promise(resolve => {
      progressDiv.style.display = 'block';
      progressText.textContent = '开始搜索平均率最高的统计期..';
      progressBar.style.width = '0%';
      progressPercentage.textContent = '0%';
      currentPhase.textContent = '正在准备...';
      detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #666;">正在搜索平均率最高的统计期..</td></tr>';
      resolve();
    });
    
    // 重置终止标志
    isBacktestStopped = false;
    
    // 添加终止回测按钮点击事件
    stopBacktestBtn.onclick = function() {
      isBacktestStopped = true;
      updateProgress('回测已终止', 100, '回测终止');
    };
    
    // 使用全局配置的回测期数
    const currentBacktestPeriod = backtestPeriod;
    
    // 更新进度
    await updateProgress('正在获取总期数..', 5, '获取总期数');
    
    const totalPeriods = await getTotalPeriods();
    
    // 多阶段搜索策略，从大到小变化步长
    const searchStages = [
      { step: 200, expansion: 400 }, // 第一阶段：步长200，扩展范围400
      { step: 100, expansion: 200 }, // 第二阶段：步长100，扩展范围200
      { step: 50, expansion: 100 }    // 第三阶段：步长50，扩展范围100
    ];
    
    // 回测方法：只包含排名方法
    const backtestMethods = [];
    // 添加排名方法
    for (let i = 1; i <= 30; i++) {
      backtestMethods.push(`rank${i}`);
    }
    const allResults = [];
    
    // 计算总工作量
    totalSteps = backtestMethods.length * searchStages.length + 3; // 3个初始化和收尾步骤
    
    // 更新进度
    await updateProgress('正在获取最新一期期号..', 10, '获取最新期号');
    currentStep++;
    
    // 获取最后一期期号
    const lastPeriod = await getLastPeriod();
    const nextNextNextPeriod = (parseInt(lastPeriod) + 3) + '期'; // 使用最近期的期号+3作为下下下期期号
    
    // 遍历所有回测方法
    for (const backtestMethod of backtestMethods) {
      let methodName;
      if (backtestMethod.startsWith('rank')) {
        const rankMatch = backtestMethod.match(/^rank(\d+)$/);
        methodName = rankMatch ? `排名第${rankMatch[1]}` : backtestMethod;
      } else {
        methodName = backtestMethod;
      }
      
      // 更新进度
      await updateProgress(`正在搜索回测方法: ${methodName}...`, 15 + (currentStep / totalSteps) * 60, `搜索回测方法: ${methodName}`);
      currentStep++;
      
      // 所有回测方法都从1500期开始
      let currentStart = 1500;
      let currentEnd = totalPeriods;
      let allTestResults = [];
      
      // 执行每个阶段的搜索
      for (let stageIndex = 0; stageIndex < searchStages.length; stageIndex++) {
        const stage = searchStages[stageIndex];
        const { step, expansion } = stage;
        
        // 更新进度
        const stageProgress = 15 + (currentStep / totalSteps) * 60;
        await updateProgress(
          `正在进行${methodName}方法的第${stageIndex + 1}阶段搜索（步长：${step}期）..`, 
          stageProgress, 
          `阶段${stageIndex + 1}，步长${step}`
        );
        currentStep++;
        
        let stageResults = [];
        
        // 生成所有需要测试的期数
        const testPeriods = [];
        for (let i = currentStart; i <= currentEnd; i += step) {
          testPeriods.push(i);
        }
        
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          continue;
        }
        
        // 实时更新进度
        await updateProgress(
          `正在并行测试${testPeriods.length}个统计期..`, 
          15 + ((currentStep - 1) / totalSteps) * 60, 
          `并行测试 ${testPeriods.length} 个期数`
        );
        
        // 并行测试所有统计期
        const promises = testPeriods.map(period => testStatsPeriodThirdLastThreeBall(currentBacktestPeriod, period, backtestMethod));
        const results = await Promise.all(promises);
        
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          continue;
        }
        
        // 添加测试结果
        stageResults.push(...results);
        allTestResults.push(...results);
        
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          break;
        }
        
        // 如果当前阶段没有结果，继续下一阶段
        if (stageResults.length === 0) {
          continue;
        }
        
        // 找出当前阶段的最高正确率
        const highestAccuracy = Math.max(...stageResults.map(result => result.accuracy));
        
        // 找出当前阶段中所有最高正确率的结果
        const highestResultsInStage = stageResults.filter(result => result.accuracy === highestAccuracy);
        
        // 计算下一阶段的搜索范围
        const minStatsPeriod = Math.min(...highestResultsInStage.map(result => result.statsPeriod));
        const maxStatsPeriod = Math.max(...highestResultsInStage.map(result => result.statsPeriod));
        
        // 所有回测方法都使用1500期作为最小限制
        const minLimit = 1500;
        currentStart = Math.max(minLimit, minStatsPeriod - expansion);
        currentEnd = Math.min(totalPeriods, maxStatsPeriod + expansion);
      }
      
      // 从所有测试结果中找出最高正确率
      const highestAccuracy = Math.max(...allTestResults.map(result => result.accuracy));
      
      // 找出所有正确率等于最高值的期数
      const highestPeriods = allTestResults.filter(result => result.accuracy === highestAccuracy);
      
      // 对期数进行去重处理
      const uniquePeriodsMap = new Map();
      highestPeriods.forEach(result => {
        if (!uniquePeriodsMap.has(result.statsPeriod)) {
          uniquePeriodsMap.set(result.statsPeriod, result);
        }
      });
      
      // 将去重后的结果转换回数组，并添加回测方法信息
      const uniqueHighestPeriods = Array.from(uniquePeriodsMap.values()).map(result => ({
        ...result,
        backtestMethod
      }));
      
      // 添加到所有结果中
      allResults.push(...uniqueHighestPeriods);
    }
    
    // 更新进度
    await updateProgress('搜索完成，正在获取前区推荐买号..', 85, '获取前区推荐买号');
    currentStep++;
    
    // 为每个结果获取前区推荐买号，并过滤掉空推荐号码的排名方法结果
    const validResults = [];
    
    // 并行获取前区推荐买号
    const promises = allResults.map(async (result) => {
      if (isBacktestStopped) return null;
      
      result.frontBuyNumbers = await huo_qu_qian_qu_tui_jian_mai_hao_third_last_three_ball(result.statsPeriod, result.backtestMethod);
      
      // 如果是排名方法且没有找到对应排名的号码（返回空数组），则过滤掉该结果
      if (result.backtestMethod.match(/^rank(\d+)$/) && result.frontBuyNumbers.length === 0) {
        return null;
      }
      
      return result;
    });
    
    // 等待所有并行请求完成
    const allResultsWithBuyNumbers = await Promise.all(promises);
    
    // 过滤掉null结果
    for (const result of allResultsWithBuyNumbers) {
      if (result && !isBacktestStopped) {
        validResults.push(result);
      }
    }
    
    // 检查是否需要终止回测
    if (isBacktestStopped) {
      detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">回测已终止</td></tr>';
    } else {
      // 过滤回测结果：如果回测方法相同且下下下期前区推荐买号相同，只保留一条
      const uniqueResultsMap = new Map();
      
      validResults.forEach(result => {
        // 基于回测方法和下下下期前区推荐买号（排序后）创建唯一键
        const sortedBuyNumbers = [...(result.frontBuyNumbers || [])].sort((a, b) => a - b);
        const uniqueKey = `${result.backtestMethod}_${sortedBuyNumbers.join('_')}`;
        
        // 只保留第一条出现的结果
        if (!uniqueResultsMap.has(uniqueKey)) {
          uniqueResultsMap.set(uniqueKey, result);
        }
      });
      
      // 将过滤后的结果转换回数组
      const filteredResults = Array.from(uniqueResultsMap.values());
      
      // 更新进度
      await updateProgress(`找到 ${filteredResults.length} 个平均率最高的统计期，正在渲染结果...`, 98, '渲染结果');
      currentStep++;
      
      // 渲染详情数据，传递过滤后的结果和下下下期期号
      await renderDetailDataThirdLastThreeBall(filteredResults, nextNextNextPeriod);
      
      // 存储回测结果到全局变量
      backtestResults['thirdLastThreeBall'] = {
        results: filteredResults,
        nextPeriod: nextNextNextPeriod,
        timestamp: new Date().toISOString()
      };
      
      // 更新进度
      await updateProgress('搜索完成，正在隐藏进度条...', 100, '完成');
    }
    
    // 隐藏进度
    await new Promise(resolve => {
      setTimeout(() => {
        progressDiv.style.display = 'none';
        resolve();
      }, 500);
    });
    
  } catch (error) {
    console.error('搜索最高正确率统计期失败', error);
    
    // 更新进度
    await updateProgress('搜索失败，请重试', 100, '搜索失败');
    detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">搜索失败，请重试</td></tr>';
  } finally {
    // 恢复按钮状态
    startBacktestBtn.style.display = 'inline-block';
    stopBacktestBtn.style.display = 'none';
    // 重置终止标志
    isBacktestStopped = false;
  }
}