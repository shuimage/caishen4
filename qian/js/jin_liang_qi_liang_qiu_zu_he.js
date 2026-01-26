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

// 获取选中的统计范围
function getSelectedPeriod() {
  const customPeriodInput = document.getElementById('customPeriod');
  // 首先检查手动输入框
  if (customPeriodInput && customPeriodInput.value.trim() && parseInt(customPeriodInput.value) > 0) {
    return customPeriodInput.value.trim();
  }
  
  // 然后检查下拉框
  const periodDropdown = document.querySelector('.period-dropdown');
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

// 期数变化时重新加载数据
function onPeriodChange(event) {
  const selectedText = event.target.value;
  console.log('选择的统计范围', selectedText);
  
  // 根据选择的文本确定对应的period值
  let periodValue;
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
  const customPeriodInput = document.getElementById('customPeriod');
  if (customPeriodInput) {
    customPeriodInput.value = '';
  }
  
  // 保存选择的统计范围
  savePeriodSelection(periodValue);
  
  // 重新加载数据
  loadAllData(periodValue);
}

// 从接口获取近两期开奖信息
async function huo_qu_jin_liang_qi_kai_jiang() {
  try {
    console.log('开始请求近两期开奖信息接口');
    const response = await fetch('http://localhost:18889/sql_jin_liang_qi');
    console.log('接口响应状态', response.status);
    const result = await response.json();
    console.log('接口返回数据:', result);
    
    if (result.success) {
      console.log('成功获取近两期开奖信息');
      return result.data;
    } else {
      throw new Error('获取近两期开奖信息失败: ' + (result.message || '未知错误'));
    }
  } catch (error) {
    console.error('获取近两期开奖信息失败', error);
    alert('接口失败');
    return null;
  }
}

// 从接口获取前区两球组合统计数据
async function huo_qu_qian_qu_zu_he_tong_ji(periodRange) {
  try {
    console.log('开始请求前区两球组合统计数据接口');
    const response = await fetch('http://localhost:18889/jin_liang_qi_liang_qiu_zu_he_front', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ stats_range: periodRange }),
      mode: 'cors'
    });
    console.log('接口响应状态', response.status);
    const result = await response.json();
    console.log('前区两球组合统计数据:', result);
    
    if (result.success) {
      console.log('成功获取前区两球组合统计数据');
      return result.data;
    } else {
      throw new Error('获取前区两球组合统计数据失败: ' + (result.message || '未知错误'));
    }
  } catch (error) {
    console.error('获取前区两球组合统计数据失败:', error);
    alert('接口失败');
    return null;
  }
}

// 从接口获取后区两球组合统计数据
async function huo_qu_hou_qu_zu_he_tong_ji(periodRange) {
  try {
    console.log('开始请求后区两球组合统计数据接口');
    const response = await fetch('http://localhost:18889/jin_liang_qi_liang_qiu_zu_he_back', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ stats_range: periodRange }),
      mode: 'cors'
    });
    console.log('接口响应状态', response.status);
    const result = await response.json();
    console.log('后区两球组合统计数据:', result);
    
    if (result.success) {
      console.log('成功获取后区两球组合统计数据');
      return result.data;
    } else {
      throw new Error('获取后区两球组合统计数据失败: ' + (result.message || '未知错误'));
    }
  } catch (error) {
    console.error('获取后区两球组合统计数据失败:', error);
    alert('接口失败');
    return null;
  }
}

// 定义全局变量
let currentSort = {
  column: null,
  direction: 'asc' // 'asc' 升序, 'desc' 降序
};

// 保存汇总计数的全局变量
let globalFrontTotalCounts = [];
let globalBackTotalCounts = [];

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
  const periodRange = getSelectedPeriod();
  loadAllData(periodRange);
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
  const periodRange = getSelectedPeriod();
  loadAllData(periodRange);
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

// 更新顶部快捷栏的期数显示
function updateCurrentPeriod(period) {
  document.querySelector('.current-period').textContent = period;
}

// 渲染近两期开奖信息
function renderLatestDrawInfo(latestDraws) {
  if (!latestDraws || latestDraws.length === 0) return;
  
  let html = '';
  
  latestDraws.forEach((draw, index) => {
    // 处理日期格式，只显示年月日
    let formattedDate = draw.drawDate || draw.draw_date;
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
    
    html += `
      <div style="margin-bottom: 10px;">
        <strong>第${index + 1}期：</strong>
        期号：${draw.period || draw.issue} 开奖日期：${formattedDate} <br>
        前区号码：${Array.isArray(draw.red) ? draw.red.map(num => `<span class="red-ball">${num}</span>`).join(' ') : draw.red} <br>
        后区号码：${Array.isArray(draw.blue) ? draw.blue.map(num => `<span class="blue-ball">${num}</span>`).join(' ') : draw.blue}
      </div>
    `;
  });
  
  // 渲染到现有区域
  const latestDrawInfo = document.getElementById('latestDrawInfo');
  if (latestDrawInfo) {
    latestDrawInfo.innerHTML = html;
  }
}

// 更新推荐杀号显示
function updateRecommendedKillNumbers(frontKillNumbers, backKillNumbers) {
  // 更新顶部推荐杀号区域
  const frontKillNumbersElement = document.getElementById('front-kill-numbers');
  const backKillNumbersElement = document.getElementById('back-kill-numbers');
  
  if (frontKillNumbers && frontKillNumbers.length > 0) {
    frontKillNumbersElement.innerHTML = frontKillNumbers.map(num => 
      `<span style="display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; margin: 3px; background-color: #DF2220; border-radius: 50%; font-size: 14px; color: #ffffff; font-weight: bold;">${num}</span>`
    ).join(' ');
  } else {
    frontKillNumbersElement.textContent = '暂无推荐杀号';
  }
  
  if (backKillNumbers && backKillNumbers.length > 0) {
    backKillNumbersElement.innerHTML = backKillNumbers.map(num => 
      `<span style="display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; margin: 3px; background-color: #A462F8; border-radius: 50%; font-size: 14px; color: #ffffff; font-weight: bold;">${num}</span>`
    ).join(' ');
  } else {
    backKillNumbersElement.textContent = '暂无推荐杀号';
  }
  
  // 更新卡片推荐杀号区域
  const firstZoneKillNumbersElement = document.getElementById('firstZoneKillNumbers');
  const secondZoneKillNumbersElement = document.getElementById('secondZoneKillNumbers');
  
  if (frontKillNumbers && frontKillNumbers.length > 0) {
    firstZoneKillNumbersElement.innerHTML = frontKillNumbers.map(num => 
      `<span style="display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; margin: 3px; background-color: #DF2220; border-radius: 50%; font-size: 14px; color: #ffffff; font-weight: bold;">${num}</span>`
    ).join(' ');
  } else {
    firstZoneKillNumbersElement.textContent = '暂无推荐杀号';
  }
  
  if (backKillNumbers && backKillNumbers.length > 0) {
    secondZoneKillNumbersElement.innerHTML = backKillNumbers.map(num => 
      `<span style="display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; margin: 3px; background-color: #A462F8; border-radius: 50%; font-size: 14px; color: #ffffff; font-weight: bold;">${num}</span>`
    ).join(' ');
  } else {
    secondZoneKillNumbersElement.textContent = '暂无推荐杀号';
  }
}

// 渲染前区两球组合统计数据
function renderFrontCombinationTable(combinations) {
  const frontCombinationTable = document.getElementById('frontCombinationTable');
  frontCombinationTable.innerHTML = '';
  
  // 初始化汇总计数数组
  const totalCounts = new Array(36).fill(0); // 索引0不使用，1-35对应前区号码
  let totalOccurrences = 0; // 总出现次数
  
  // 对前区数据进行排序
  let sortedFrontCombinations = [...combinations];
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
    const statsRange = getSelectedPeriod();
    
    // 组合号单元格
    const comboTd = document.createElement('td');
    comboTd.textContent = combo.combination;
    tr.appendChild(comboTd);
    
    // 出现次数单元格，创建可点击链接
    const countTd = document.createElement('td');
    countTd.className = 'count';
    countTd.style.backgroundColor = '#cce5ff';
    countTd.style.position = 'relative';
    
    const countLink = document.createElement('a');
    countLink.textContent = combo.count || 0;
    countLink.href = `jin_liang_qi_liang_qiu_zu_he_xiang_qing.html?combination=${combo.combination}&stats_range=${statsRange}&type=first`;
    countLink.target = '_self';
    countLink.style.textDecoration = 'none';
    countLink.style.color = '#DF2220';
    countLink.style.fontWeight = 'bold';
    countLink.style.cursor = 'pointer';
    countLink.style.zIndex = '1';
    countLink.style.position = 'relative';
    
    // 添加点击事件日志
    countLink.addEventListener('click', function(e) {
      console.log('点击了前区组合', combo.combination, '统计范围:', statsRange);
      console.log('链接URL:', this.href);
      // 确保事件正常触发
      e.preventDefault();
      window.location.href = this.href;
    });
    
    countTd.appendChild(countLink);
    tr.appendChild(countTd);
    
    // 添加35个单元格，对应前区号码1-35
    for (let i = 1; i <= 35; i++) {
      const td = document.createElement('td');
      const count = combo.numberCounts[i] || 0;
      
      // 累加汇总计数
      totalCounts[i] += count;
      
      if (count > 0) {
          td.textContent = count;
          td.className = 'highlight';
          td.style.cursor = 'pointer';
          
          // 添加点击事件，跳转到详情页
          td.addEventListener('click', function() {
            // 构建包含目标球的组合号
            const targetCombination = `${combo.combination}-${i}`;
            // 跳转到详情页，包含目标球信息
            window.location.href = `jin_liang_qi_liang_qiu_zu_he_xiang_qing.html?combination=${targetCombination}&stats_range=${statsRange}&type=first`;
          });
        }
      
      tr.appendChild(td);
    }
    
    // 累加总出现次数
    totalOccurrences += combo.nextDrawNumbers?.length || 0;
    
    frontCombinationTable.appendChild(tr);
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
  
  frontCombinationTable.appendChild(summaryTr);
  
  // 更新全局汇总数据
  globalFrontTotalCounts = totalCounts;
  
  // 绘制前区图表
  drawFrontZoneChart(totalCounts, getSelectedPeriod());
  
  // 计算前区推荐杀号：汇总值为0的号码
  const frontKillNumbers = [];
  for (let i = 1; i <= 35; i++) {
    if (totalCounts[i] === 0) {
      frontKillNumbers.push(i);
    }
  }
  
  // 获取当前后区杀号（如果已有值）
  const backKillNumbers = document.getElementById('back-kill-numbers').textContent.trim() === '暂无推荐杀号' ? [] : 
    document.getElementById('back-kill-numbers').textContent.match(/\d+/g)?.map(Number) || [];
  
  // 渲染前区推荐买号
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
  
  // 更新推荐杀号显示
  updateRecommendedKillNumbers(frontKillNumbers, backKillNumbers);
}

// 渲染后区两球组合统计数据
function renderBackCombinationTable(combinations) {
  const backCombinationTable = document.getElementById('backCombinationTable');
  backCombinationTable.innerHTML = '';
  
  // 初始化汇总计数数组
  const totalCounts = new Array(13).fill(0); // 索引0不使用，1-12对应后区号码
  let totalOccurrences = 0; // 总出现次数
  
  // 对后区数据进行排序
  let sortedBackCombinations = [...combinations];
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
    const statsRange = getSelectedPeriod();
    
    // 组合号单元格
    const comboTd = document.createElement('td');
    comboTd.textContent = combo.combination;
    tr.appendChild(comboTd);
    
    // 出现次数单元格，创建可点击链接
    const countTd = document.createElement('td');
    countTd.className = 'count';
    countTd.style.backgroundColor = '#cce5ff';
    countTd.style.position = 'relative';
    
    const countLink = document.createElement('a');
    countLink.textContent = combo.count || 0;
    countLink.href = `jin_liang_qi_liang_qiu_zu_he_xiang_qing.html?combination=${combo.combination}&stats_range=${statsRange}&type=last`;
    countLink.target = '_self';
    countLink.style.textDecoration = 'none';
    countLink.style.color = '#2154F0';
    countLink.style.fontWeight = 'bold';
    countLink.style.cursor = 'pointer';
    countLink.style.zIndex = '1';
    countLink.style.position = 'relative';
    
    // 添加点击事件日志
    countLink.addEventListener('click', function(e) {
      console.log('点击了后区组合', combo.combination, '统计范围:', statsRange);
      console.log('链接URL:', this.href);
      // 确保事件正常触发
      e.preventDefault();
      window.location.href = this.href;
    });
    
    countTd.appendChild(countLink);
    tr.appendChild(countTd);
    
    // 添加12个单元格，对应后区号码1-12
    for (let i = 1; i <= 12; i++) {
      const td = document.createElement('td');
      const count = combo.numberCounts[i] || 0;
      
      // 累加后区汇总计数
      totalCounts[i] += count;
      
      if (count > 0) {
          td.textContent = count;
          td.className = 'highlight';
          td.style.cursor = 'pointer';
          
          // 添加点击事件，跳转到详情页
          td.addEventListener('click', function() {
            // 构建包含目标球的组合号
            const targetCombination = `${combo.combination}-${i}`;
            // 跳转到详情页，包含目标球信息
            window.location.href = `jin_liang_qi_liang_qiu_zu_he_xiang_qing.html?combination=${targetCombination}&stats_range=${statsRange}&type=last`;
          });
        }
      
      tr.appendChild(td);
    }
    
    // 累加总出现次数
    totalOccurrences += combo.nextDrawNumbers?.length || 0;
    
    backCombinationTable.appendChild(tr);
  });
  
  // 添加汇总行
  const summaryTr = document.createElement('tr');
  summaryTr.className = 'summary-row';
  summaryTr.innerHTML = `
    <td class="summary-cell">汇总</td>
    <td class="count summary-cell">${totalOccurrences}</td>
  `;
  
  // 添加12个汇总单元格
  for (let i = 1; i <= 12; i++) {
    const td = document.createElement('td');
    const count = totalCounts[i];
    
    if (count > 0) {
        td.textContent = count;
        td.className = 'highlight summary-highlight';
      }
    
    summaryTr.appendChild(td);
  }
  
  backCombinationTable.appendChild(summaryTr);
  
  // 更新全局汇总数据
  globalBackTotalCounts = totalCounts;
  
  // 绘制后区图表
  drawBackZoneChart(totalCounts, getSelectedPeriod());
  
  // 计算后区推荐杀号：汇总值为0的号码
  const backKillNumbers = [];
  for (let i = 1; i <= 12; i++) {
    if (totalCounts[i] === 0) {
      backKillNumbers.push(i);
    }
  }
  
  // 获取当前前区杀号（如果已有值）
  const frontKillNumbers = document.getElementById('front-kill-numbers').textContent.trim() === '暂无推荐杀号' ? [] : 
    document.getElementById('front-kill-numbers').textContent.match(/\d+/g)?.map(Number) || [];
  
  // 后区推荐买号的三种类型：出现最多球、出现最少球、出现平均球
  
  // 1. 出现最多球：找到totalCounts中的最大值对应的号码
  const lastZoneMostOccurrences = document.getElementById('lastZoneMostOccurrences');
  lastZoneMostOccurrences.innerHTML = '';
  // 找到后区汇总计数中的最大值
  const maxLastCount = Math.max(...totalCounts);
  if (maxLastCount > 0) {
    // 找出所有最大值对应的号码
    const mostOccurrenceNumbers = [];
    for (let i = 1; i <= 12; i++) {
      if (totalCounts[i] === maxLastCount) {
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
  
  // 2. 出现最少球：找到totalCounts中除0以外的最小值对应的号码
  const lastZoneLeastOccurrences = document.getElementById('lastZoneLeastOccurrences');
  lastZoneLeastOccurrences.innerHTML = '';
  // 过滤非零值，找到最小值
  const nonZeroBackCounts = totalCounts.filter(count => count > 0);
  if (nonZeroBackCounts.length > 0) {
    const minLastCount = Math.min(...nonZeroBackCounts);
    // 找出所有最小值对应的号码
    const leastOccurrenceNumbers = [];
    for (let i = 1; i <= 12; i++) {
      if (totalCounts[i] === minLastCount) {
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
  
  // 3. 出现平均球：找到totalCounts中次数等于平均值的号码
  const lastZoneAverageOccurrences = document.getElementById('lastZoneAverageOccurrences');
  lastZoneAverageOccurrences.innerHTML = '';
  // 计算后区号码的平均出现次数
  const nonZeroTotalBackCounts = totalCounts.filter(count => count > 0);
  if (nonZeroTotalBackCounts.length > 0) {
    const sumBackCounts = nonZeroTotalBackCounts.reduce((sum, count) => sum + count, 0);
    const averageBackCount = Math.round(sumBackCounts / nonZeroTotalBackCounts.length);
    // 找出所有等于平均值的号码
    const averageOccurrenceNumbers = [];
    for (let i = 1; i <= 12; i++) {
      if (totalCounts[i] === averageBackCount) {
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
  
  // 更新推荐杀号显示
  updateRecommendedKillNumbers(frontKillNumbers, backKillNumbers);
}

// 跳转到前区买号回测页面
function goToFrontBuyBacktestPage() {
  const statsPeriod = getSelectedPeriod();
  window.location.href = `jin_liang_qi_mai_hao_hui_ce_xiang_qing.html?backtest_period=50&stats_period=${statsPeriod}&type=front`;
}

// 跳转到后区买号回测页面
function goToBackBuyBacktestPage() {
  const statsPeriod = getSelectedPeriod();
  window.location.href = `jin_liang_qi_mai_hao_hou_qu_hui_ce_xiang_qing.html?backtest_period=50&stats_period=${statsPeriod}&type=back`;
}

// 跳转到前区回测页面
function goToBacktestQianPage() {
  const periodValue = getSelectedPeriod();
  window.location.href = `jin_liang_qi_qian_qu_sha_hao_hui_ce_xiang_qing.html?backtest_period=50&stats_period=${periodValue}`;
}

// 跳转到后区回测页面
function goToBacktestHouPage() {
  const periodValue = getSelectedPeriod();
  window.location.href = `jin_liang_qi_hou_qu_sha_hao_hui_ce_xiang_qing.html?backtest_period=50&stats_period=${periodValue}`;
}

// 绘制前区汇总数据图表
async function drawFrontZoneChart(totalCounts, periodValue) {
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
  data.forEach((item, index) => {
    const x = padding.left + (chartInnerWidth / data.length) * (index + 0.5);
    const y = chartHeight - padding.bottom + 5;
    ctx.fillText(item.number.toString(), x, y);
  });
  
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
async function drawBackZoneChart(totalCounts, periodValue) {
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
      count: totalCounts[i] || 0
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
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color');
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

// 复制杀号到剪贴板
function copyKillNumbers(zoneType) {
  let killNumbers = [];
  let container;
  
  if (zoneType === 'front') {
    container = document.getElementById('firstZoneKillNumbers');
    // 获取前区杀号
    const balls = container.querySelectorAll('.red-ball');
    killNumbers = Array.from(balls).map(ball => ball.textContent);
  } else {
    container = document.getElementById('secondZoneKillNumbers');
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
    const copyBtns = document.querySelectorAll('.copy-btn');
    let copyBtn;
    if (zoneType === 'front') {
      copyBtn = Array.from(copyBtns)[0]; // 第一个复制按钮是前区杀号复制按钮
    } else {
      copyBtn = Array.from(copyBtns)[1]; // 第二个复制按钮是后区杀号复制按钮
    }
    
    if (copyBtn) {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = '已复制';
      copyBtn.style.backgroundColor = '#2196F3';
      
      // 恢复原始状态
      setTimeout(() => {
        copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
        copyBtn.style.backgroundColor = '#4CAF50';
      }, 1500);
    }
  }).catch(err => {
    console.error('复制失败:', err);
    alert('复制失败，请手动复制');
  });
}

// 加载所有数据
async function loadAllData(periodRange) {
  // 获取近两期开奖信息
  const latestDraws = await huo_qu_jin_liang_qi_kai_jiang();
  if (latestDraws) {
    renderLatestDrawInfo(latestDraws);
    // 更新顶部快捷栏的期数显示
    if (latestDraws.length > 0) {
      updateCurrentPeriod(latestDraws[0].period || latestDraws[0].issue);
    }
  }
  
  // 初始化推荐杀号显示
  updateRecommendedKillNumbers([], []);
  
  // 获取前区两球组合统计数据
  const frontCombinations = await huo_qu_qian_qu_zu_he_tong_ji(periodRange);
  if (frontCombinations) {
    renderFrontCombinationTable(frontCombinations);
  }
  
  // 获取后区两球组合统计数据
  const backCombinations = await huo_qu_hou_qu_zu_he_tong_ji(periodRange);
  if (backCombinations) {
    renderBackCombinationTable(backCombinations);
  }
}

// 页面加载完成后初始化数据
document.addEventListener('DOMContentLoaded', function() {
  renderTableHeaders();
  
  // 获取保存的统计范围，如果没有则使用默认值100
  const savedPeriod = getSavedPeriodSelection();
  
  // 设置下拉框选中状态
  setPeriodDropdownSelection(savedPeriod);
  
  // 使用保存的统计范围渲染数据
  loadAllData(savedPeriod);
  
  // 为统计范围下拉选择框添加事件监听器
  const periodDropdown = document.querySelector('.period-dropdown');
  if (periodDropdown) {
    // 移除已有的事件监听器，避免重复添加
    periodDropdown.onchange = null;
    // 添加新的事件监听器
    periodDropdown.addEventListener('change', onPeriodChange);
  }
  
  // 为手动输入期数添加事件监听器
  const customPeriodInput = document.getElementById('customPeriod');
  if (customPeriodInput) {
    // 监听回车键
    customPeriodInput.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        const inputValue = this.value.trim();
        if (inputValue && parseInt(inputValue) > 0) {
          // 保存选择的统计范围
          savePeriodSelection(inputValue);
          
          // 清空下拉框选中状态
          if (periodDropdown) {
            periodDropdown.selectedIndex = -1;
          }
          
          // 重新加载数据
          loadAllData(inputValue);
        }
      }
    });
    
    // 监听失去焦点事件
    customPeriodInput.addEventListener('blur', function() {
      const inputValue = this.value.trim();
      if (inputValue && parseInt(inputValue) > 0) {
        // 保存选择的统计范围
        savePeriodSelection(inputValue);
        
        // 清空下拉框选中状态
        if (periodDropdown) {
          periodDropdown.selectedIndex = -1;
        }
        
        // 重新加载数据
        loadAllData(inputValue);
      }
    });
  }
  
  // 添加主题切换监听，重新绘制图表
  const observer = new MutationObserver(async function(mutations) {
    mutations.forEach(async function(mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        // 主题切换时重新绘制图表
        if (globalFrontTotalCounts.length > 0) {
          const currentPeriodValue = getSavedPeriodSelection();
          await drawFrontZoneChart(globalFrontTotalCounts, currentPeriodValue);
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
      if (globalFrontTotalCounts.length > 0) {
        const currentPeriodValue = getSavedPeriodSelection();
        await drawFrontZoneChart(globalFrontTotalCounts, currentPeriodValue);
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