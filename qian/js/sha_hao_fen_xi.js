// 杀号分析页面的JavaScript代码

// 从接口获取最新开奖信息
async function huo_qu_zui_xin_kai_jiang() {
  try {
    const response = await fetch('http://localhost:18889/sql_zui_xin_yi_qi');
    const result = await response.json();
    
    if (result.success) {
      return result.latestDraw;
    } else {
      alert('接口失败');
      return null;
    }
  } catch (error) {
    console.error('获取最新开奖信息失败', error);
    alert('接口失败');
    return null;
  }
}

// 从后端获取最新一期杀号分析数据
async function huo_qu_shuang_sha_fen_xi(period = '100') {
  try {
    const response = await fetch(`http://localhost:18889/shuang_sha_fen_xi?period=${period}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        alert('获取杀号分析数据失败：' + result.message);
        return null;
      }
    } catch (error) {
      console.error('获取杀号分析数据失败', error);
      alert('获取杀号分析数据失败');
      return null;
    }
}

// 复制杀号到剪贴板
function copyKillNumbers(zoneType) {
  let killNumbers = [];
  let container;
  
  if (zoneType === 'first') {
    container = document.getElementById('firstZoneRecommendations');
    // 获取前区杀号
    const balls = container.querySelectorAll('.red-ball');
    killNumbers = Array.from(balls).map(ball => ball.textContent);
  } else {
    container = document.getElementById('lastZoneRecommendations');
    // 获取后区杀号
    const balls = container.querySelectorAll('.blue-ball');
    killNumbers = Array.from(balls).map(ball => ball.textContent);
  }
  
  if (killNumbers.length === 0) {
    // 检查是否显示"暂无推荐杀号"
    if (container.textContent.includes('暂无推荐杀号')) {
      alert('暂无推荐杀号可复制');
    }
    return;
  }
  
  // 复制到剪贴板
  const textToCopy = killNumbers.join(' ');
  
  navigator.clipboard.writeText(textToCopy).then(() => {
    // 显示复制成功反馈
    const copyBtn = container.closest('.section').querySelector('.copy-btn');
    if (copyBtn) {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = '已复制';
      copyBtn.style.backgroundColor = '#2196F3';
      
      // 恢复原始状态
      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.backgroundColor = '#4CAF50';
      }, 1500);
    }
  }).catch(err => {
    console.error('复制失败:', err);
    alert('复制失败，请手动复制');
  });
}

// 复制从未出现前区球杀号到剪贴板
function copyNeverAppearedNumbers() {
  let killNumbers = [];
  const container = document.getElementById('neverAppearedNumbers');
  
  if (container) {
    // 获取从未出现前区球杀号
    const balls = container.querySelectorAll('.red-ball');
    killNumbers = Array.from(balls).map(ball => ball.textContent);
  }
  
  if (killNumbers.length === 0) {
    // 检查是否显示"暂无数据"
    if (container.textContent.includes('暂无数据')) {
      alert('暂无数据可复制');
    }
    return;
  }
  
  // 复制到剪贴板
  const textToCopy = killNumbers.join(' ');
  
  navigator.clipboard.writeText(textToCopy).then(() => {
    // 显示复制成功反馈
    const copyBtn = container.closest('.section').querySelector('.copy-btn');
    if (copyBtn) {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = '已复制';
      copyBtn.style.backgroundColor = '#2196F3';
      
      // 恢复原始状态
      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.backgroundColor = '#4CAF50';
      }, 1500);
    }
  }).catch(err => {
    console.error('复制失败:', err);
    alert('复制失败，请手动复制');
  });
}

// 跳转到前区回测页面
function goToBacktestPage() {
  const statsPeriod = getSelectedStatsRange();
  window.location.href = `sha_hao_hui_ce_xiang_qing.html?backtest_period=50&stats_period=${statsPeriod}`;
}

// 跳转到后区回测页面
function goToBacktestHouPage() {
  const statsPeriod = getSelectedStatsRange();
  window.location.href = `sha_hao_hui_ce_hou_xiang_qing.html?backtest_period=50&stats_period=${statsPeriod}`;
}

// 跳转到前区买号回测页面
function goToFrontBuyBacktestPage() {
  const statsPeriod = getSelectedStatsRange();
  window.location.href = `sha_hao_mai_hao_hui_ce_xiang_qing.html?backtest_period=50&stats_period=${statsPeriod}`;
}

// 跳转到后区买号回测页面
function goToBackBuyBacktestPage() {
  const statsPeriod = getSelectedStatsRange();
  window.location.href = `sha_hao_hou_mai_hao_hui_ce_xiang_qing.html?backtest_period=50&stats_period=${statsPeriod}`;
}

// 保存统计范围到localStorage
function savePeriodSelection(periodValue) {
  try {
    localStorage.setItem('selectedPeriodRange', periodValue);
  } catch (e) {
    console.error('保存统计范围失败:', e);
  }
}

// 从localStorage读取保存的统计范围
function getSavedPeriodSelection() {
  try {
    return localStorage.getItem('selectedPeriodRange') || '100';
  } catch (e) {
    console.error('读取统计范围失败:', e);
    return '100';
  }
}

// 获取当前选择的统计范围期数
function getSelectedStatsRange() {
  const periodDropdown = document.querySelector('.period-dropdown');
  const customPeriodInput = document.getElementById('customPeriod');
  
  // 首先检查手动输入框
  if (customPeriodInput && customPeriodInput.value.trim() && parseInt(customPeriodInput.value) > 0) {
    return customPeriodInput.value.trim();
  }
  
  // 然后检查下拉框
  if (periodDropdown) {
    const selectedText = periodDropdown.value;
    if (selectedText === '最新100期') return '100';
    else if (selectedText === '最新50期') return '50';
    else if (selectedText === '最新35期') return '35';
    else if (selectedText === '最新200期') return '200';
    else if (selectedText === '最新300期') return '300';
    else if (selectedText === '最新500期') return '500';
    else if (selectedText === '最新1000期') return '1000';
    else if (selectedText === '最新1500期') return '1500';
    else if (selectedText === '最新2000期') return '2000';
    else if (selectedText === '全部期') return 'all';
  }
  return '100'; // 默认值
}

// 定义全局变量
let currentSort = {
  column: null,
  direction: 'asc' // 'asc' 升序, 'desc' 降序
};

// 全局存储汇总数据，用于主题切换时重新绘制图表
let globalTotalCounts = [];
let globalBackTotalCounts = [];

// 更新顶部快捷栏的期数显示
function updateCurrentPeriod(period) {
  document.querySelector('.current-period').textContent = period;
}

// 根据period值设置下拉框选中状态
function setPeriodDropdownSelection(periodValue) {
  const periodDropdown = document.querySelector('.period-dropdown');
  const customPeriodInput = document.getElementById('customPeriod');
  if (periodDropdown) {
    if (periodValue === '100') periodDropdown.value = '最新100期';
    else if (periodValue === '50') periodDropdown.value = '最新50期';
    else if (periodValue === '35') periodDropdown.value = '最新35期';
    else if (periodValue === '200') periodDropdown.value = '最新200期';
    else if (periodValue === '300') periodDropdown.value = '最新300期';
    else if (periodValue === '500') periodDropdown.value = '最新500期';
    else if (periodValue === '1000') periodDropdown.value = '最新1000期';
    else if (periodValue === '1500') periodDropdown.value = '最新1500期';
    else if (periodValue === '2000') periodDropdown.value = '最新2000期';
    else if (periodValue === 'all') periodDropdown.value = '全部期';
    else {
      // 自定义期数，清空下拉框选中状态，设置输入框值
      periodDropdown.selectedIndex = -1;
      if (customPeriodInput) {
        customPeriodInput.value = periodValue;
      }
    }
  }
}

// 渲染表格头部
function renderTableHeaders() {
  // 渲染前区表格头部
  const firstZoneHeader = document.getElementById('firstZoneTableHeader');
  const firstZoneRow = firstZoneHeader.querySelector('tr');
  for (let i = 1; i <= 35; i++) {
    const th = document.createElement('th');
    th.textContent = String(i).padStart(2, '0');
    th.className = 'sortable-header';
    th.dataset.column = i;
    th.addEventListener('click', () => handleHeaderClick(i));
    firstZoneRow.appendChild(th);
  }
  
  // 渲染后区表格头部
  const lastZoneHeader = document.getElementById('lastZoneTableHeader');
  const lastZoneRow = lastZoneHeader.querySelector('tr');
  for (let i = 1; i <= 12; i++) {
    const th = document.createElement('th');
    th.textContent = String(i).padStart(2, '0');
    th.className = 'sortable-header';
    th.dataset.column = i;
    th.addEventListener('click', () => handleBackZoneHeaderClick(i));
    lastZoneRow.appendChild(th);
  }
}

// 处理前区表头点击事件
function handleHeaderClick(column) {
  // 如果点击的是当前排序列，切换排序方向
  if (currentSort.column === column) {
    currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
  } else {
    // 否则设置为新的排序列，默认升序
    currentSort.column = column;
    currentSort.direction = 'asc';
  }
  
  // 更新表头样式
  updateHeaderStyles();
  
  // 重新渲染数据，使用新的排序条件
  renderKillAnalysisData(periodValue);
}

// 处理后区表头点击事件
function handleBackZoneHeaderClick(column) {
  // 后区排序逻辑，暂时复用前区排序变量
  if (currentSort.column === -column) {
    currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
  } else {
    currentSort.column = -column;
    currentSort.direction = 'asc';
  }
  
  // 更新表头样式
  updateHeaderStyles();
  
  // 重新渲染数据，使用新的排序条件
  renderKillAnalysisData(periodValue);
}

// 更新表头样式，显示排序状态
function updateHeaderStyles() {
  // 重置所有表头样式
  document.querySelectorAll('.sortable-header').forEach(th => {
    th.style.background = '';
    th.textContent = th.dataset.column.replace('-', '');
  });
  
  // 高亮当前排序列
  if (currentSort.column) {
    const isBackZone = currentSort.column < 0;
    const columnIndex = Math.abs(currentSort.column);
    const headerSelector = isBackZone ? '#lastZoneTableHeader' : '#firstZoneTableHeader';
    const headers = document.querySelector(headerSelector).querySelectorAll('.sortable-header');
    
    // 找到对应的表头并更新样式
    headers.forEach((th, index) => {
      if (parseInt(th.dataset.column) === columnIndex) {
        th.style.background = 'var(--primary-color)';
        th.style.color = 'white';
        // 添加排序方向指示器
        th.textContent += currentSort.direction === 'asc' ? ' ↑' : ' ↓';
      }
    });
  }
}

// 渲染杀号分析数据
async function renderKillAnalysisData(period = '100') {
  console.log('开始渲染杀号分析数据，期数:', period);
  // 获取双杀分析数据
  const analysisData = await huo_qu_shuang_sha_fen_xi(period);
  
  if (!analysisData) {
    // 接口调用失败，不使用模拟数据
    return;
  }
  
  // 渲染最新开奖信息
  const latestDraw = analysisData.latestDraw;
  // 更新顶部快捷栏的期数显示
  updateCurrentPeriod(latestDraw.issue);
  // 处理日期格式，只显示年月日
  let formattedDate = latestDraw.drawDate;
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
  const latestDrawInfo = document.getElementById('latestDrawInfo');
  latestDrawInfo.innerHTML = `
    <div style="font-weight: bold; color: #DF2220; font-size: 16px;">
      期号: ${latestDraw.issue}
    </div>
    <div>
      开奖日期: ${formattedDate}
    </div>
    <div>
      前区号码: ${latestDraw.frontNumbers.map(num => `<span class="red-ball">${num}</span>`).join(' ')}
    </div>
    <div>
      后区号码: ${latestDraw.backNumbers.map(num => `<span class="blue-ball">${num}</span>`).join(' ')}
    </div>
  `;
  
  // 渲染前区两球组合统计
  const firstZoneCombinations = document.getElementById('firstZoneCombinations');
  firstZoneCombinations.innerHTML = ''; // 清空现有数据
  
  // 初始化汇总计数数组
  const totalCounts = new Array(36).fill(0); // 索引0不使用，1-35对应前区号码
  let totalOccurrences = 0; // 总出现次数
  
  // 对前区数据进行排序
  let sortedFrontCombinations = [...analysisData.frontCombinations];
  if (currentSort.column && currentSort.column > 0) {
    // 前区排序
    const sortColumn = currentSort.column;
    sortedFrontCombinations.sort((a, b) => {
      const countA = a.numberCounts[sortColumn] || 0;
      const countB = b.numberCounts[sortColumn] || 0;
      return currentSort.direction === 'asc' ? countA - countB : countB - countA;
    });
  }
  
  sortedFrontCombinations.forEach(combo => {
    const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${combo.combination}</td>
        <td class="count" style="background-color: #cce5ff;">${combo.nextDrawNumbers?.length || 0}</td>
      `;
    
    // 添加35个单元格，对应前区号码1-35
    for (let i = 1; i <= 35; i++) {
      const td = document.createElement('td');
      const count = combo.numberCounts[i] || 0;
      
      // 累加汇总计数
      totalCounts[i] += count;
      
      if (count > 0) {
          td.textContent = count;
          td.className = 'highlight';
          td.onclick = () => goToCombinationDetail(`${combo.combination}-${String(i).padStart(2, '0')}`, 'first', periodValue);
        }
      
      tr.appendChild(td);
    }
    
    // 累加总出现次数
    totalOccurrences += combo.nextDrawNumbers?.length || 0;
    
    firstZoneCombinations.appendChild(tr);
  });
  
  // 添加汇总行
  const summaryTr = document.createElement('tr');
  summaryTr.className = 'summary-row';
  summaryTr.innerHTML = `
    <td class="summary-cell">汇总</td>
    <td class="count summary-cell">${totalOccurrences}</td>
  `;
  
  // 添加35个汇总单元格
  for (let i = 1; i <= 35; i++) {
    const td = document.createElement('td');
    const count = totalCounts[i];
    
    if (count > 0) {
        td.textContent = count;
        td.className = 'highlight summary-highlight';
      }
    
    summaryTr.appendChild(td);
  }
  
  firstZoneCombinations.appendChild(summaryTr);
  
  // 绘制前区图表
  await drawFrontZoneChart(totalCounts, period);
  // 更新全局汇总数据
  globalTotalCounts = totalCounts;
  
  // 渲染后区两球组合统计
  const lastZoneCombinations = document.getElementById('lastZoneCombinations');
  lastZoneCombinations.innerHTML = ''; // 清空现有数据
  
  // 初始化后区汇总计数数组
  const backTotalCounts = new Array(13).fill(0); // 索引0不使用，1-12对应后区号码
  let backTotalOccurrences = 0; // 后区总出现次数
  
  // 对后区数据进行排序
  let sortedBackCombinations = [...analysisData.backCombinations];
  if (currentSort.column && currentSort.column < 0) {
    // 后区排序
    const sortColumn = Math.abs(currentSort.column);
    sortedBackCombinations.sort((a, b) => {
      const countA = a.numberCounts[sortColumn] || 0;
      const countB = b.numberCounts[sortColumn] || 0;
      return currentSort.direction === 'asc' ? countA - countB : countB - countA;
    });
  }
  
  sortedBackCombinations.forEach(combo => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${combo.combination}</td>
      <td class="count" style="background-color: #cce5ff;">${combo.nextDrawNumbers?.length || 0}</td>
    `;
    
    // 添加12个单元格，对应后区号码1-12
    for (let i = 1; i <= 12; i++) {
      const td = document.createElement('td');
      const count = combo.numberCounts[i] || 0;
      
      // 累加后区汇总计数
      backTotalCounts[i] += count;
      
      if (count > 0) {
          td.textContent = count;
          td.className = 'highlight';
          td.onclick = () => goToCombinationDetail(`${combo.combination}-${String(i).padStart(2, '0')}`, 'last', periodValue);
        }
      
      tr.appendChild(td);
    }
    
    // 累加后区总出现次数
    backTotalOccurrences += combo.nextDrawNumbers?.length || 0;
    
    lastZoneCombinations.appendChild(tr);
  });
  
  // 添加后区汇总行
  const backSummaryTr = document.createElement('tr');
  backSummaryTr.className = 'summary-row';
  backSummaryTr.innerHTML = `
    <td class="summary-cell">汇总</td>
    <td class="count summary-cell">${backTotalOccurrences}</td>
  `;
  
  // 添加12个后区汇总单元格
  for (let i = 1; i <= 12; i++) {
    const td = document.createElement('td');
    const count = backTotalCounts[i];
    
    if (count > 0) {
        td.textContent = count;
        td.className = 'highlight summary-highlight';
      }
    
    backSummaryTr.appendChild(td);
  }
  
  lastZoneCombinations.appendChild(backSummaryTr);
  
  // 绘制后区图表
  await drawBackZoneChart(backTotalCounts, period);
  // 更新全局汇总数据
  globalBackTotalCounts = backTotalCounts;
  
  // 渲染推荐买号
  // 计算前区推荐买号的三种类型：出现最多球、出现最少球、出现平均球
  
  // 1. 出现最多球：找到totalCounts中的最大值对应的号码
  const firstZoneMostOccurrences = document.getElementById('firstZoneMostOccurrences');
  firstZoneMostOccurrences.innerHTML = '';
  // 找到前区汇总计数中的最大值
  const maxFirstCount = Math.max(...totalCounts);
  if (maxFirstCount > 0) {
    // 找出所有最大值对应的号码
    const mostOccurrenceNumbers = [];
    for (let i = 1; i <= 35; i++) {
      if (totalCounts[i] === maxFirstCount) {
        mostOccurrenceNumbers.push(i);
      }
    }
    // 渲染出现最多球
    mostOccurrenceNumbers.forEach(num => {
      const ball = document.createElement('span');
      ball.className = 'red-ball';
      ball.textContent = num;
      firstZoneMostOccurrences.appendChild(ball);
    });
  } else {
    firstZoneMostOccurrences.textContent = '暂无数据';
  }
  
  // 2. 出现最少球：找到totalCounts中除0以外的最小值对应的号码
  const firstZoneLeastOccurrences = document.getElementById('firstZoneLeastOccurrences');
  firstZoneLeastOccurrences.innerHTML = '';
  // 过滤非零值，找到最小值
  const nonZeroCounts = totalCounts.filter(count => count > 0);
  if (nonZeroCounts.length > 0) {
    const minFirstCount = Math.min(...nonZeroCounts);
    // 找出所有最小值对应的号码
    const leastOccurrenceNumbers = [];
    for (let i = 1; i <= 35; i++) {
      if (totalCounts[i] === minFirstCount) {
        leastOccurrenceNumbers.push(i);
      }
    }
    // 渲染出现最少球
    leastOccurrenceNumbers.forEach(num => {
      const ball = document.createElement('span');
      ball.className = 'red-ball';
      ball.textContent = num;
      firstZoneLeastOccurrences.appendChild(ball);
    });
  } else {
    firstZoneLeastOccurrences.textContent = '暂无数据';
  }
  
  // 3. 出现平均球：找到totalCounts中次数等于平均值的号码
  const firstZoneAverageOccurrences = document.getElementById('firstZoneAverageOccurrences');
  firstZoneAverageOccurrences.innerHTML = '';
  // 计算前区号码的平均出现次数
  const nonZeroTotalCounts = totalCounts.filter(count => count > 0);
  if (nonZeroTotalCounts.length > 0) {
    const sumCounts = nonZeroTotalCounts.reduce((sum, count) => sum + count, 0);
    const averageCount = Math.round(sumCounts / nonZeroTotalCounts.length);
    // 找出所有等于平均值的号码
    const averageOccurrenceNumbers = [];
    for (let i = 1; i <= 35; i++) {
      if (totalCounts[i] === averageCount) {
        averageOccurrenceNumbers.push(i);
      }
    }
    // 渲染出现平均球
    if (averageOccurrenceNumbers.length > 0) {
      averageOccurrenceNumbers.forEach(num => {
        const ball = document.createElement('span');
        ball.className = 'red-ball';
        ball.textContent = num;
        firstZoneAverageOccurrences.appendChild(ball);
      });
    } else {
      firstZoneAverageOccurrences.textContent = '暂无数据';
    }
  } else {
    firstZoneAverageOccurrences.textContent = '暂无数据';
  }
  
  // 后区推荐买号的三种类型：出现最多球、出现最少球、出现平均球
  
  // 1. 出现最多球：找到backTotalCounts中的最大值对应的号码
  const lastZoneMostOccurrences = document.getElementById('lastZoneMostOccurrences');
  lastZoneMostOccurrences.innerHTML = '';
  // 找到后区汇总计数中的最大值
  const maxLastCount = Math.max(...backTotalCounts);
  if (maxLastCount > 0) {
    // 找出所有最大值对应的号码
    const mostOccurrenceNumbers = [];
    for (let i = 1; i <= 12; i++) {
      if (backTotalCounts[i] === maxLastCount) {
        mostOccurrenceNumbers.push(i);
      }
    }
    // 渲染出现最多球
    mostOccurrenceNumbers.forEach(num => {
      const ball = document.createElement('span');
      ball.className = 'blue-ball';
      ball.textContent = num;
      lastZoneMostOccurrences.appendChild(ball);
    });
  } else {
    lastZoneMostOccurrences.textContent = '暂无数据';
  }
  
  // 2. 出现最少球：找到backTotalCounts中除0以外的最小值对应的号码
  const lastZoneLeastOccurrences = document.getElementById('lastZoneLeastOccurrences');
  lastZoneLeastOccurrences.innerHTML = '';
  // 过滤非零值，找到最小值
  const nonZeroBackCounts = backTotalCounts.filter(count => count > 0);
  if (nonZeroBackCounts.length > 0) {
    const minLastCount = Math.min(...nonZeroBackCounts);
    // 找出所有最小值对应的号码
    const leastOccurrenceNumbers = [];
    for (let i = 1; i <= 12; i++) {
      if (backTotalCounts[i] === minLastCount) {
        leastOccurrenceNumbers.push(i);
      }
    }
    // 渲染出现最少球
    leastOccurrenceNumbers.forEach(num => {
      const ball = document.createElement('span');
      ball.className = 'blue-ball';
      ball.textContent = num;
      lastZoneLeastOccurrences.appendChild(ball);
    });
  } else {
    lastZoneLeastOccurrences.textContent = '暂无数据';
  }
  
  // 3. 出现平均球：找到backTotalCounts中次数等于平均值的号码
  const lastZoneAverageOccurrences = document.getElementById('lastZoneAverageOccurrences');
  lastZoneAverageOccurrences.innerHTML = '';
  // 计算后区号码的平均出现次数
  const nonZeroTotalBackCounts = backTotalCounts.filter(count => count > 0);
  if (nonZeroTotalBackCounts.length > 0) {
    const sumBackCounts = nonZeroTotalBackCounts.reduce((sum, count) => sum + count, 0);
    const averageBackCount = Math.round(sumBackCounts / nonZeroTotalBackCounts.length);
    // 找出所有等于平均值的号码
    const averageOccurrenceNumbers = [];
    for (let i = 1; i <= 12; i++) {
      if (backTotalCounts[i] === averageBackCount) {
        averageOccurrenceNumbers.push(i);
      }
    }
    // 渲染出现平均球
    if (averageOccurrenceNumbers.length > 0) {
      averageOccurrenceNumbers.forEach(num => {
        const ball = document.createElement('span');
        ball.className = 'blue-ball';
        ball.textContent = num;
        lastZoneAverageOccurrences.appendChild(ball);
      });
    } else {
      lastZoneAverageOccurrences.textContent = '暂无数据';
    }
  } else {
    lastZoneAverageOccurrences.textContent = '暂无数据';
  }
  
  // 渲染推荐杀号
  const firstZoneRecommendations = document.getElementById('firstZoneRecommendations');
  firstZoneRecommendations.innerHTML = '';
  
  // 1. 原有的推荐杀号
  const originalKillNumbers = analysisData.recommendedFrontKillNumbers || [];
  
  // 2. 计算从未出现球杀号（在至少一个组合中从未出现过的球）
  const neverAppearedNumbers = new Set();
  
  // 遍历所有组合，找出每个组合中从未出现过的号码
  sortedFrontCombinations.forEach(combo => {
    // 对于当前组合，检查每个号码是否出现过
    for (let i = 1; i <= 35; i++) {
      // 如果该号码在当前组合中从未出现过（numberCounts[i]为0或undefined）
      if (combo.numberCounts[i] === 0 || combo.numberCounts[i] === undefined) {
        neverAppearedNumbers.add(i);
      }
    }
  });
  
  // 将Set转换为数组，排序后使用
  const neverAppearedArray = Array.from(neverAppearedNumbers).sort((a, b) => a - b);
  
  // 3. 渲染原有的推荐杀号
  if (originalKillNumbers.length > 0) {
    const killMethodDiv = document.createElement('div');
    killMethodDiv.style.marginTop = '10px';
    killMethodDiv.innerHTML = '<strong>推荐杀号：</strong>';
    firstZoneRecommendations.appendChild(killMethodDiv);
    
    const numbersDiv = document.createElement('div');
    numbersDiv.style.display = 'inline-flex';
    numbersDiv.style.flexWrap = 'wrap';
    numbersDiv.style.gap = '8px';
    numbersDiv.style.marginLeft = '10px';
    
    originalKillNumbers.forEach(num => {
      const ball = document.createElement('span');
      ball.className = 'red-ball';
      ball.textContent = num;
      numbersDiv.appendChild(ball);
    });
    
    firstZoneRecommendations.appendChild(numbersDiv);
  } else {
    firstZoneRecommendations.textContent = '暂无推荐杀号';
  }
  
  // 4. 渲染从未出现前区球杀号到新卡片
  const neverAppearedNumbersDiv = document.getElementById('neverAppearedNumbers');
  neverAppearedNumbersDiv.innerHTML = '';
  
  if (neverAppearedArray.length > 0) {
    neverAppearedArray.forEach(num => {
      const ball = document.createElement('span');
      ball.className = 'red-ball';
      ball.textContent = num;
      neverAppearedNumbersDiv.appendChild(ball);
    });
  } else {
    neverAppearedNumbersDiv.innerHTML = '<span style="color: #999;">暂无数据</span>';
  }
  
  // 后区推荐杀号渲染保持不变
  const lastZoneRecommendations = document.getElementById('lastZoneRecommendations');
  lastZoneRecommendations.innerHTML = '';
  if (analysisData.recommendedBackKillNumbers && analysisData.recommendedBackKillNumbers.length > 0) {
    analysisData.recommendedBackKillNumbers.forEach(num => {
      const ball = document.createElement('span');
      ball.className = 'blue-ball';
      ball.textContent = num;
      lastZoneRecommendations.appendChild(ball);
    });
  } else {
    lastZoneRecommendations.textContent = '暂无推荐杀号';
  }
  
  // 更新统计信息
  const firstZoneSection = document.querySelector('.section');
  if (firstZoneSection && firstZoneSection.querySelector('.section-header')) {
    firstZoneSection.querySelector('.section-header').innerHTML = `
      <h3 style="margin: 0;">前区两球组合统计</h3>
      <div style="color: #DF2220;">
        共有${analysisData.frontCombinations.length}种前区两球组合，
        ${analysisData.frontCombinations.filter(c => c.nextDrawNumbers.length > 0).length}种组合在历史下期出现过号码
      </div>
    `;
  }
  
  if (analysisData.backCombinations.length > 0) {
    const lastCombo = analysisData.backCombinations[0];
    const backZoneSections = document.querySelectorAll('.section');
    if (backZoneSections.length > 2 && backZoneSections[2].querySelector('.section-header')) {
      backZoneSections[2].querySelector('.section-header').innerHTML = `
        <h3 style="margin: 0;">后区两球组合统计</h3>
        <div style="color: #DF2220;">
          最新开奖后区两球组合：${lastCombo.combination} 历史下期出现${lastCombo.nextDrawNumbers.length}次相关号码
        </div>
      `;
    }
  }
}

// 绘制前区汇总数据图表
async function drawFrontZoneChart(totalCounts, periodValue) {
  console.log('绘制前区汇总数据图表，期数:', periodValue);
  const canvas = document.getElementById('firstZoneChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const isDarkTheme = document.body.classList.contains('dark-theme');
  
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 设置图表样式
  const chartWidth = canvas.width;
  const chartHeight = canvas.height;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartInnerWidth = chartWidth - padding.left - padding.right;
  const chartInnerHeight = chartHeight - padding.top - padding.bottom;
  
  // 准备数据
  const data = [];
  for (let i = 1; i <= 35; i++) {
    data.push({
      number: i,
      count: totalCounts[i] || 0
    });
  }
  
  // 获取排序方式
  const sortSelect = document.getElementById('firstZoneChartSort');
  const sortType = sortSelect ? sortSelect.value : 'number';
  
  // 根据选择的排序方式对数据进行排序
  switch (sortType) {
    case 'count_asc':
      // 按出现次数升序
      data.sort((a, b) => a.count - b.count);
      break;
    case 'count_desc':
      // 按出现次数降序
      data.sort((a, b) => b.count - a.count);
      break;
    case 'number':
    default:
      // 按号码顺序
      data.sort((a, b) => a.number - b.number);
      break;
  }
  
  // 计算最大值
  const maxCount = Math.max(...data.map(item => item.count), 1);
  
  // 绘制背景
  ctx.fillStyle = isDarkTheme ? '#222' : '#fff';
  ctx.fillRect(0, 0, chartWidth, chartHeight);
  
  // 绘制坐标轴
  ctx.strokeStyle = isDarkTheme ? '#666' : '#333';
  ctx.lineWidth = 1;
  
  // Y轴
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, chartHeight - padding.bottom);
  ctx.stroke();
  
  // X轴
  ctx.beginPath();
  ctx.moveTo(padding.left, chartHeight - padding.bottom);
  ctx.lineTo(chartWidth - padding.right, chartHeight - padding.bottom);
  ctx.stroke();
  
  // 绘制Y轴刻度和标签
  const yAxisSteps = 5;
  ctx.fillStyle = isDarkTheme ? '#ccc' : '#333';
  ctx.font = '10px Arial';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  
  for (let i = 0; i <= yAxisSteps; i++) {
    const y = padding.top + (chartInnerHeight / yAxisSteps) * i;
    const count = Math.round(maxCount * (1 - i / yAxisSteps));
    
    // 绘制刻度线
    ctx.beginPath();
    ctx.moveTo(padding.left - 5, y);
    ctx.lineTo(padding.left, y);
    ctx.stroke();
    
    // 绘制标签
    ctx.fillText(count.toString(), padding.left - 10, y);
  }
  
  // 绘制X轴标签
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (let i = 0; i < data.length; i++) {
    const x = padding.left + (chartInnerWidth / data.length) * (i + 0.5);
    const y = chartHeight - padding.bottom + 5;
    ctx.fillText(data[i].number.toString(), x, y);
  }
  
  // 绘制柱状图
  const barWidth = chartInnerWidth / data.length * 0.8;
  const isSorting = currentSort.column && currentSort.column > 0;
  
  data.forEach((item, index) => {
    const barHeight = (item.count / maxCount) * chartInnerHeight;
    const x = padding.left + (chartInnerWidth / data.length) * index + (chartInnerWidth / data.length - barWidth) / 2;
    const y = chartHeight - padding.bottom - barHeight;
    
    // 颜色设置
    if (isSorting && currentSort.column === item.number) {
      // 当前排序列使用主色调
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
    } else {
      // 根据数值大小调整颜色深度
      const intensity = item.count / maxCount;
      ctx.fillStyle = `rgba(223, 34, 32, ${0.5 + intensity * 0.5})`;
    }
    
    // 绘制柱子
    ctx.fillRect(x, y, barWidth, barHeight);
    
    // 绘制数字
    ctx.fillStyle = isDarkTheme ? '#fff' : '#333';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    if (item.count > 0) {
      ctx.fillText(item.count.toString(), x + barWidth / 2, y - 2);
    }
  });
  
  // 绘制统计期数信息
  ctx.fillStyle = isDarkTheme ? '#ccc' : '#333';
  ctx.font = '12px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  
  // 获取并显示具体期数
  let periodText;
  if (periodValue === 'all') {
    // 暂时硬编码返回值，避免调用异步函数
    const totalPeriods = 1000;
    periodText = `${totalPeriods}期`;
  } else {
    periodText = `最新${periodValue}期`;
  }
  
  // 计算总出现次数和平均次数
  const totalOccurrences = data.reduce((sum, item) => sum + item.count, 0);
  const averageCount = Math.round(totalOccurrences / 35); // 前区共35个号码
  
  ctx.fillText(`统计期数: ${periodText} | 平均次数: ${averageCount}`, padding.left + 5, padding.top + 15);
}

// 绘制后区汇总数据图表
async function drawBackZoneChart(backTotalCounts, periodValue) {
  console.log('绘制后区汇总数据图表，期数:', periodValue);
  const canvas = document.getElementById('lastZoneChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const isDarkTheme = document.body.classList.contains('dark-theme');
  
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 设置图表样式
  const chartWidth = canvas.width;
  const chartHeight = canvas.height;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartInnerWidth = chartWidth - padding.left - padding.right;
  const chartInnerHeight = chartHeight - padding.top - padding.bottom;
  
  // 准备数据
  const data = [];
  for (let i = 1; i <= 12; i++) {
    data.push({
      number: i,
      count: backTotalCounts[i] || 0
    });
  }
  
  // 获取排序方式
  const sortSelect = document.getElementById('lastZoneChartSort');
  const sortType = sortSelect ? sortSelect.value : 'number';
  
  // 根据选择的排序方式对数据进行排序
  switch (sortType) {
    case 'count_asc':
      // 按出现次数升序
      data.sort((a, b) => a.count - b.count);
      break;
    case 'count_desc':
      // 按出现次数降序
      data.sort((a, b) => b.count - a.count);
      break;
    case 'number':
    default:
      // 按号码顺序
      data.sort((a, b) => a.number - b.number);
      break;
  }
  
  // 计算最大值
  const maxCount = Math.max(...data.map(item => item.count), 1);
  
  // 绘制背景
  ctx.fillStyle = isDarkTheme ? '#222' : '#fff';
  ctx.fillRect(0, 0, chartWidth, chartHeight);
  
  // 绘制坐标轴
  ctx.strokeStyle = isDarkTheme ? '#666' : '#333';
  ctx.lineWidth = 1;
  
  // Y轴
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, chartHeight - padding.bottom);
  ctx.stroke();
  
  // X轴
  ctx.beginPath();
  ctx.moveTo(padding.left, chartHeight - padding.bottom);
  ctx.lineTo(chartWidth - padding.right, chartHeight - padding.bottom);
  ctx.stroke();
  
  // 绘制Y轴刻度和标签
  const yAxisSteps = 5;
  ctx.fillStyle = isDarkTheme ? '#ccc' : '#333';
  ctx.font = '10px Arial';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  
  for (let i = 0; i <= yAxisSteps; i++) {
    const y = padding.top + (chartInnerHeight / yAxisSteps) * i;
    const count = Math.round(maxCount * (1 - i / yAxisSteps));
    
    // 绘制刻度线
    ctx.beginPath();
    ctx.moveTo(padding.left - 5, y);
    ctx.lineTo(padding.left, y);
    ctx.stroke();
    
    // 绘制标签
    ctx.fillText(count.toString(), padding.left - 10, y);
  }
  
  // 绘制X轴标签
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  data.forEach((item, index) => {
    const x = padding.left + (chartInnerWidth / data.length) * (index + 0.5);
    const y = chartHeight - padding.bottom + 5;
    ctx.fillText(item.number.toString(), x, y);
  });
  
  // 绘制柱状图
  const barWidth = chartInnerWidth / data.length * 0.8;
  const isSorting = currentSort.column && currentSort.column < 0;
  
  data.forEach((item, index) => {
    const barHeight = (item.count / maxCount) * chartInnerHeight;
    const x = padding.left + (chartInnerWidth / data.length) * index + (chartInnerWidth / data.length - barWidth) / 2;
    const y = chartHeight - padding.bottom - barHeight;
    
    // 颜色设置
    if (isSorting && Math.abs(currentSort.column) === item.number) {
      // 当前排序列使用主色调
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
    } else {
      // 根据数值大小调整颜色深度
      const intensity = item.count / maxCount;
      ctx.fillStyle = `rgba(164, 98, 248, ${0.5 + intensity * 0.5})`;
    }
    
    // 绘制柱子
    ctx.fillRect(x, y, barWidth, barHeight);
    
    // 绘制数字
    ctx.fillStyle = isDarkTheme ? '#fff' : '#333';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    if (item.count > 0) {
      ctx.fillText(item.count.toString(), x + barWidth / 2, y - 2);
    }
  });
  
  // 绘制统计期数信息
  ctx.fillStyle = isDarkTheme ? '#ccc' : '#333';
  ctx.font = '12px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  
  // 获取并显示具体期数
  let periodText;
  if (periodValue === 'all') {
    // 暂时硬编码返回值，避免调用异步函数
    const totalPeriods = 1000;
    periodText = `${totalPeriods}期`;
  } else {
    periodText = `最新${periodValue}期`;
  }
  
  // 计算总出现次数和平均次数
  const totalOccurrences = data.reduce((sum, item) => sum + item.count, 0);
  const averageCount = Math.round(totalOccurrences / 12); // 后区共12个号码
  
  ctx.fillText(`统计期数: ${periodText} | 平均次数: ${averageCount}`, padding.left + 5, padding.top + 15);
}

// 移动端侧边栏切换
function toggleSidebar() {
  const sidebar = document.querySelector('.left-sidebar');
  sidebar.classList.toggle('open');
}

// 页面加载完成后渲染数据
window.addEventListener('load', async function() {
  console.log('页面加载完成，开始初始化');
  
  renderTableHeaders();
  
  // 获取保存的统计范围，如果没有则使用默认值100
  periodValue = getSavedPeriodSelection();
  
  // 设置下拉框选中状态
  setPeriodDropdownSelection(periodValue);
  
  // 使用保存的统计范围渲染数据
  renderKillAnalysisData(periodValue);
  
  // 为统计范围下拉选择框添加事件监听器
  const periodDropdown = document.querySelector('.period-dropdown');
  if (periodDropdown) {
    periodDropdown.addEventListener('change', function() {
      const selectedText = this.value;
      const customPeriodInput = document.getElementById('customPeriod');
      
      // 根据选择的文本确定对应的period值
      if (selectedText === '最新100期') periodValue = '100';
      else if (selectedText === '最新50期') periodValue = '50';
      else if (selectedText === '最新35期') periodValue = '35';
      else if (selectedText === '最新200期') periodValue = '200';
      else if (selectedText === '最新300期') periodValue = '300';
      else if (selectedText === '最新500期') periodValue = '500';
      else if (selectedText === '最新1000期') periodValue = '1000';
      else if (selectedText === '最新1500期') periodValue = '1500';
      else if (selectedText === '最新2000期') periodValue = '2000';
      else if (selectedText === '全部期') periodValue = 'all';
      
      // 清空手动输入框
      if (customPeriodInput) {
        customPeriodInput.value = '';
      }
      
      // 保存选择的统计范围
      savePeriodSelection(periodValue);
      
      // 根据选择的统计范围重新渲染数据
      renderKillAnalysisData(periodValue);
    });
  }
  
  // 为手动输入期数添加事件监听器
  const customPeriodInput = document.getElementById('customPeriod');
  if (customPeriodInput) {
    // 监听回车键
    customPeriodInput.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        const inputValue = this.value.trim();
        if (inputValue && parseInt(inputValue) > 0) {
          // 更新全局变量
          periodValue = inputValue;
          
          // 保存选择的统计范围
          savePeriodSelection(periodValue);
          
          // 清空下拉框选中状态
          if (periodDropdown) {
            periodDropdown.selectedIndex = -1;
          }
          
          // 根据选择的统计范围重新渲染数据
          renderKillAnalysisData(periodValue);
        }
      }
    });
    
    // 监听失去焦点事件
    customPeriodInput.addEventListener('blur', function() {
      const inputValue = this.value.trim();
      if (inputValue && parseInt(inputValue) > 0) {
        // 更新全局变量
        periodValue = inputValue;
        
        // 保存选择的统计范围
        savePeriodSelection(periodValue);
        
        // 清空下拉框选中状态
        if (periodDropdown) {
          periodDropdown.selectedIndex = -1;
        }
        
        // 根据选择的统计范围重新渲染数据
        renderKillAnalysisData(periodValue);
      }
    });
  }
  
  // 快捷期数按钮已隐藏，移除相关事件监听器
  
  // 添加主题切换监听，重新绘制图表
  const observer = new MutationObserver(async function(mutations) {
    mutations.forEach(async function(mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        // 主题切换时重新绘制图表
        if (globalTotalCounts.length > 0) {
          const currentPeriodValue = getSavedPeriodSelection();
          await drawFrontZoneChart(globalTotalCounts, currentPeriodValue);
        }
        if (globalBackTotalCounts.length > 0) {
          const currentPeriodValue = getSavedPeriodSelection();
          await drawBackZoneChart(globalBackTotalCounts, currentPeriodValue);
        }
      }
    });
  });
  
  // 监听body元素的class变化
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  // 为前区图表排序选择框添加事件监听器
  const firstZoneSortSelect = document.getElementById('firstZoneChartSort');
  if (firstZoneSortSelect) {
    firstZoneSortSelect.addEventListener('change', async function() {
      // 重新绘制前区图表
      if (globalTotalCounts.length > 0) {
        const currentPeriodValue = getSavedPeriodSelection();
        await drawFrontZoneChart(globalTotalCounts, currentPeriodValue);
      }
    });
  }
  
  // 为后区图表排序选择框添加事件监听器
  const lastZoneSortSelect = document.getElementById('lastZoneChartSort');
  if (lastZoneSortSelect) {
    lastZoneSortSelect.addEventListener('change', async function() {
      // 重新绘制后区图表
      if (globalBackTotalCounts.length > 0) {
        const currentPeriodValue = getSavedPeriodSelection();
        await drawBackZoneChart(globalBackTotalCounts, currentPeriodValue);
      }
    });
  }
});

// 定义全局变量用于存储当前选择的统计范围
let periodValue = '100'; // 默认值
