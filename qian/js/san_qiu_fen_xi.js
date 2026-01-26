// 主题切换功能 - 仅从localStorage读取设置，不在此页面提供切换按钮
document.addEventListener('DOMContentLoaded', function() {
  // 从localStorage读取主题设置
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark-theme');
  }
});

// 从sql_zui_xin_yi_qi接口获取最新一期开奖信息
async function huo_qu_zui_xin_kai_jiang() {
  try {
    const response = await fetch('http://localhost:18889/huo_qu_sql_shu_ju?type=10');
    const result = await response.json();
    
    // 处理新的数据格式
    if (result && result.success && result.data && result.data.length > 0) {
      // 获取最新一期数据并转换为前端期望的格式
      const latestData = result.data[0];
      return {
        period: latestData.issue,
        drawDate: new Date().toISOString().split('T')[0], // 使用当前日期作为开奖日期
        firstZoneNumbers: latestData.redBalls,
        lastZoneNumbers: latestData.blueBalls
      };
    } else {
      console.error('接口返回数据格式不正确', result);
      alert('获取开奖数据失败');
      return null;
    }
  } catch (error) {
    console.error('获取开奖数据失败', error);
    alert('网络请求失败');
    return null;
  }
}

// 渲染最新开奖信息
async function xuan_ran_zui_xin_kai_jiang() {
  const latestDraw = await huo_qu_zui_xin_kai_jiang();
  
  if (!latestDraw) {
    return;
  }
  
  // 更新顶部快捷栏的期数显示
  updateCurrentPeriod(latestDraw.period);
  
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
      期号: ${latestDraw.period}
    </div>
    <div>
      开奖日期: ${formattedDate}
    </div>
    <div>
      前区号码: ${Array.isArray(latestDraw.firstZoneNumbers) ? latestDraw.firstZoneNumbers.map(num => `<span class="red-ball">${num}</span>`).join(' ') : ''}
    </div>
    <div>
      后区号码: ${Array.isArray(latestDraw.lastZoneNumbers) ? latestDraw.lastZoneNumbers.map(num => `<span class="blue-ball">${num}</span>`).join(' ') : ''}
    </div>
  `;
}

// 从后端获取三球组合分析数据
async function huo_qu_san_qiu_fen_xi(statsPeriod = '100') {
  try {
    const response = await fetch(`http://localhost:18889/san_qiu_fen_xi?stats_period=${statsPeriod}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      alert('接口失败');
      return null;
    }
  } catch (error) {
    console.error('获取三球组合分析数据失败:', error);
    alert('接口失败');
    return null;
  }
}

// 获取总期数
async function huo_qu_lottery_results_total() {
  try {
    const response = await fetch('http://localhost:18889/huo_qu_lottery_results_total');
    const result = await response.json();
    if (result.success) {
      return result.data.totalPeriods;
    } else {
      console.error('获取总期数失败', result.message);
      return null;
    }
  } catch (error) {
    console.error('获取总期数失败', error);
    return null;
  }
}

// 全局存储汇总数据，用于主题切换时重新绘制图表
let globalTotalCounts = [];

// 渲染三球组合分析数据
async function renderThreeBallAnalysisData(statsPeriod = '100') {
  // 获取三球组合分析数据
  const analysisData = await huo_qu_san_qiu_fen_xi(statsPeriod);
  
  if (!analysisData) {
    // 接口调用失败，不使用模拟数据
    return;
  }
  
  // 注意：最新开奖信息已通过专门的接口获取，这里不再重复设置
  // 但仍然需要更新顶部期数显示，以保持一致性
  if (analysisData.latestDraw && analysisData.latestDraw.issue) {
    updateCurrentPeriod(analysisData.latestDraw.issue);
  }
  
  // 渲染前区三球组合统计
  const firstZoneCombinations = document.getElementById('firstZoneCombinations');
  firstZoneCombinations.innerHTML = ''; // 清空现有数据
  
  console.log('渲染三球组合数据，共', analysisData.frontCombinations.length, '个组合');
  console.log('第一个组合数据结构', analysisData.frontCombinations[0]);
  
  // 初始化汇总计数数组
  const totalCounts = new Array(36).fill(0); // 索引0不使用，1-35对应前区号码
  let totalOccurrences = 0; // 总出现次数  
  // 为了更好的用户体验，先按照出现次数降序排序
  const sortedCombinations = [...analysisData.frontCombinations].sort((a, b) => {
    // 直接使用后端提供的count字段
    return (b.count || 0) - (a.count || 0);
  });
  
  sortedCombinations.forEach(combo => {
    // 直接使用后端提供的count字段
    const totalCount = combo.count || 0;
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="combination-cell" data-combination="${combo.combination}">${combo.combination}</td>
      <td class="count">${totalCount}</td>
    `;
    
    // 添加35个单元格，对应前区号码1-35
    for (let i = 1; i <= 35; i++) {
      const td = document.createElement('td');
      const numStr = String(i); // 后端使用数字作为键，不需要补0
      // 安全访问numberCounts属性
      const count = combo.numberCounts[numStr] || 0;
      
      // 累加汇总计数
      totalCounts[i] += count;
      
      // 当值为0时不显示，只显示大于0的统计值
      td.textContent = count > 0 ? count : '';
      
      // 只有当count大于0时才高亮显示
      if (count > 0) {
        td.className = 'highlight';
        
        // 添加一些视觉效果，根据count值设置不同的背景色深度
        const opacity = 0.2 + (count * 0.1); // 基础透明度0.2，每增加1次出现增加0.1的不透明度
        const clampedOpacity = Math.min(opacity, 0.9); // 最大不透明度为0.9
        td.style.backgroundColor = `rgba(223, 34, 32, ${clampedOpacity})`;
        td.style.color = '#fff';
        td.style.cursor = 'pointer'; // 添加鼠标指针样式
        td.style.transition = 'background-color 0.2s'; // 添加过渡效果
        
        // 为有统计值的单元格添加点击事件
        td.addEventListener('click', function() {
          const combination = combo.combination;
          const selectedNumber = i;
          console.log('点击组合统计值', combination, selectedNumber);
          // 跳转到三球组合详情页面，传递组合和号码参数
          window.location.href = `san_qiu_zu_he_xiang_qing.html?combination=${combination}&number=${selectedNumber}`;
        });
        
        // 添加鼠标悬停效果
        td.addEventListener('mouseenter', function() {
          this.style.backgroundColor = 'rgba(223, 34, 32, 1)';
        });
        
        td.addEventListener('mouseleave', function() {
          this.style.backgroundColor = `rgba(223, 34, 32, ${clampedOpacity})`;
        });
      }
      
      tr.appendChild(td);
    }
    
    // 累加总出现次数
    totalOccurrences += totalCount;
    
    // 为组合号单元格添加点击事件
      const combinationCell = tr.querySelector('.combination-cell');
      combinationCell.addEventListener('click', function() {
        const combination = this.getAttribute('data-combination');
        console.log('点击组合:', combination);
        // 跳转到三球组合详情页面，传递组合参数
        window.location.href = `san_qiu_zu_he_xiang_qing.html?combination=${combination}`;
      });
    
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
  await drawFrontZoneChart(totalCounts, statsPeriod);
  // 更新全局汇总数据
  globalTotalCounts = totalCounts;
  
  // 如果没有数据，显示提示信息
  if (sortedCombinations.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 37; // 组合号 + 出现次数 + 35个号码
    td.textContent = '暂无三球组合统计数据';
    td.style.textAlign = 'center';
    td.style.padding = '20px';
    tr.appendChild(td);
    firstZoneCombinations.appendChild(tr);
  }
  
  // 渲染推荐杀号（仅前区）
  const firstZoneRecommendations = document.getElementById('firstZoneRecommendations');
  firstZoneRecommendations.innerHTML = '';
  if (analysisData.recommendedFrontKillNumbers && analysisData.recommendedFrontKillNumbers.length > 0) {
    analysisData.recommendedFrontKillNumbers.forEach(num => {
      const ball = document.createElement('span');
      ball.className = 'red-ball';
      ball.textContent = num;
      firstZoneRecommendations.appendChild(ball);
    });
  } else {
    firstZoneRecommendations.textContent = '暂无推荐杀号';
  }
  
  // 更新统计信息
    const firstZoneSection = document.querySelector('.section:last-child');
    if (firstZoneSection && firstZoneSection.querySelector('.section-header')) {
      // 计算总出现次数
      const totalOccurrences = analysisData.frontCombinations.reduce((sum, combo) => sum + combo.count, 0);
      
      firstZoneSection.querySelector('.section-header').innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
          <h3 style="margin: 0;">前区三球组合统计</h3>
          <!-- 统计期数下拉选项 -->
          <div style="display: flex; align-items: center; gap: 10px;">
            <label for="statsPeriod">统计期数：</label>
            <select id="statsPeriod" class="period-dropdown">
              <option value="50" ${statsPeriod === '50' ? 'selected' : ''}>50期</option>
              <option value="100" ${statsPeriod === '100' ? 'selected' : ''}>100期</option>
              <option value="200" ${statsPeriod === '200' ? 'selected' : ''}>200期</option>
              <option value="300" ${statsPeriod === '300' ? 'selected' : ''}>300期</option>
              <option value="500" ${statsPeriod === '500' ? 'selected' : ''}>500期</option>
              <option value="1000" ${statsPeriod === '1000' ? 'selected' : ''}>1000期</option>
              <option value="all" ${statsPeriod === 'all' ? 'selected' : ''}>全部期</option>
            </select>
          </div>
        </div>
        <div style="color: #DF2220;">
          共有${analysisData.frontCombinations.length}种前区三球组合，
          总计出现${totalOccurrences}次，
          数据范围：${statsPeriod === 'all' ? '全部期' : `最新${statsPeriod}期`}
        </div>
      `;
    }
    
    // 更新查看回测结果链接
    updateBacktestLink();
    
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
}

// 跳转到前区买号回测页面
function goToFrontBuyBacktestPage() {
  const statsPeriod = document.getElementById('statsPeriod').value;
  window.location.href = `san_qiu_mai_hao_hui_ce_xiang_qing.html?backtest_period=50&stats_period=${statsPeriod}`;
}

// 更新查看回测结果链接
function updateBacktestLink() {
  const statsPeriod = document.getElementById('statsPeriod').value;
  const backtestLink = document.querySelector('a[href*="san_qiu_sha_hao_hui_ce_xiang_qing.html"]');
  if (backtestLink) {
    backtestLink.href = `san_qiu_sha_hao_hui_ce_xiang_qing.html?backtest_period=50&stats_period=${statsPeriod}`;
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
    firstZoneRow.appendChild(th);
  }
}

// 更新顶部快捷栏的期数显示
function updateCurrentPeriod(period) {
  document.querySelector('.current-period').textContent = period;
}

// 保存回测期数和统计期数到localStorage
function savePeriodSelection(backtestPeriod, statsPeriod) {
  try {
    localStorage.setItem('backtestPeriod', backtestPeriod);
    localStorage.setItem('statsPeriod', statsPeriod);
  } catch (e) {
    console.error('保存期数设置失败:', e);
  }
}

// 从localStorage读取保存的回测期数和统计期数
function getSavedPeriodSelection() {
  try {
    const backtestPeriod = localStorage.getItem('backtestPeriod') || '100';
    const statsPeriod = localStorage.getItem('statsPeriod') || '100';
    return { backtestPeriod, statsPeriod };
  } catch (e) {
    console.error('读取期数设置失败:', e);
    return { backtestPeriod: '100', statsPeriod: '100' };
  }
}

// 页面加载完成后渲染数据
window.addEventListener('load', async function() {
  renderTableHeaders();
  
  // 获取保存的统计期数
  const { statsPeriod } = getSavedPeriodSelection();
  
  // 获取下拉选项元素
  const statsPeriodSelect = document.getElementById('statsPeriod');
  // 获取左侧导航栏的选择统计范围下拉框元素
  const sidebarPeriodSelect = document.querySelector('.period-selection .period-dropdown');
  
  // 设置下拉选项的初始值
  statsPeriodSelect.value = statsPeriod;
  
  // 首先获取并显示最新开奖信息
  await xuan_ran_zui_xin_kai_jiang();
  
  // 使用保存的统计期数渲染数据
  renderThreeBallAnalysisData(statsPeriod);
  
  // 为统计期数下拉选择框添加事件监听器
  statsPeriodSelect.addEventListener('change', function() {
    const newStatsPeriod = this.value;
    // 保存选择的统计期数
    savePeriodSelection('50', newStatsPeriod);
    // 根据选择的统计期数重新渲染数据
    renderThreeBallAnalysisData(newStatsPeriod);
  });
  
  // 为左侧导航栏的选择统计范围下拉框添加事件监听器
  const customPeriodInput = document.getElementById('customPeriod');
  if (sidebarPeriodSelect) {
    sidebarPeriodSelect.addEventListener('change', function() {
      // 将左侧导航栏的选择统计范围文本转换为右侧统计期数下拉框的值
      const selectedText = this.value;
      let newStatsPeriod;
      
      switch(selectedText) {
        case '最新50期':
          newStatsPeriod = '50';
          break;
        case '最新35期':
          newStatsPeriod = '35';
          break;
        case '最新200期':
          newStatsPeriod = '200';
          break;
        case '最新300期':
          newStatsPeriod = '300';
          break;
        case '最新500期':
          newStatsPeriod = '500';
          break;
        case '最新1000期':
          newStatsPeriod = '1000';
          break;
        case '最新1500期':
          newStatsPeriod = '1500';
          break;
        case '最新2000期':
          newStatsPeriod = '2000';
          break;
        case '全部期':
          newStatsPeriod = 'all';
          break;
        default:
          newStatsPeriod = '100';
      }
      
      // 清空手动输入框
      if (customPeriodInput) {
        customPeriodInput.value = '';
      }
      
      // 更新右侧的统计期数下拉框的值
      statsPeriodSelect.value = newStatsPeriod;
      
      // 保存选择的统计期数
      savePeriodSelection('50', newStatsPeriod);
      
      // 根据选择的统计期数重新渲染数据
      renderThreeBallAnalysisData(newStatsPeriod);
    });
  }
  
  // 为手动输入期数添加事件监听器
  if (customPeriodInput) {
    // 监听回车键
    customPeriodInput.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        const inputValue = this.value.trim();
        if (inputValue && parseInt(inputValue) > 0) {
          const newStatsPeriod = inputValue;
          
          // 清空下拉框选中状态
          if (sidebarPeriodSelect) {
            sidebarPeriodSelect.selectedIndex = -1;
          }
          
          // 更新右侧的统计期数下拉框的值
          statsPeriodSelect.value = newStatsPeriod;
          
          // 保存选择的统计期数
          savePeriodSelection('50', newStatsPeriod);
          
          // 根据选择的统计期数重新渲染数据
          renderThreeBallAnalysisData(newStatsPeriod);
        }
      }
    });
    
    // 监听失去焦点事件
    customPeriodInput.addEventListener('blur', function() {
      const inputValue = this.value.trim();
      if (inputValue && parseInt(inputValue) > 0) {
        const newStatsPeriod = inputValue;
        
        // 清空下拉框选中状态
        if (sidebarPeriodSelect) {
          sidebarPeriodSelect.selectedIndex = -1;
        }
        
        // 更新右侧的统计期数下拉框的值
        statsPeriodSelect.value = newStatsPeriod;
        
        // 保存选择的统计期数
        savePeriodSelection('50', newStatsPeriod);
        
        // 根据选择的统计期数重新渲染数据
        renderThreeBallAnalysisData(newStatsPeriod);
      }
    });
  }
  
  // 快捷期数按钮已隐藏，移除相关事件监听
  
  // 添加主题切换监听，重新绘制图表
  const observer = new MutationObserver(async function(mutations) {
    mutations.forEach(async function(mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        // 主题切换时重新绘制图表
        if (globalTotalCounts.length > 0) {
          const { statsPeriod } = getSavedPeriodSelection();
          await drawFrontZoneChart(globalTotalCounts, statsPeriod);
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
        const { statsPeriod } = getSavedPeriodSelection();
        await drawFrontZoneChart(globalTotalCounts, statsPeriod);
      }
    });
  }
});

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
  for (let i = 0; i < data.length; i++) {
    const x = padding.left + (chartInnerWidth / data.length) * (i + 0.5);
    const y = chartHeight - padding.bottom + 5;
    ctx.fillText(data[i].number.toString(), x, y);
  }
  
  // 绘制柱状图
  const barWidth = chartInnerWidth / data.length * 0.8;
  
  data.forEach((item, index) => {
    const barHeight = (item.count / maxCount) * chartInnerHeight;
    const x = padding.left + (chartInnerWidth / data.length) * index + (chartInnerWidth / data.length - barWidth) / 2;
    const y = chartHeight - padding.bottom - barHeight;
    
    // 颜色设置
    // 根据数值大小调整颜色深度
    const intensity = item.count / maxCount;
    ctx.fillStyle = `rgba(223, 34, 32, ${0.5 + intensity * 0.5})`;
    
    // 绘制柱子
    ctx.fillRect(x, y, barWidth, barHeight);
    
    // 绘制数值
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
    // 获取总期数
    const totalPeriods = await huo_qu_lottery_results_total();
    periodText = totalPeriods ? `${totalPeriods}期` : '全部期';
  } else {
    periodText = `最新${periodValue}期`;
  }
  
  // 计算总出现次数和平均次数
  const totalOccurrences = data.reduce((sum, item) => sum + item.count, 0);
  const averageCount = Math.round(totalOccurrences / 35); // 前区35个号码  
  ctx.fillText(`统计期数: ${periodText} | 平均次数: ${averageCount}`, padding.left + 5, padding.top + 15);
}

// 移动端侧边栏切换
function toggleSidebar() {
  const sidebar = document.querySelector('.left-sidebar');
  sidebar.classList.toggle('open');
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

// 导航项点击事件- 只处理没有<a>标签的导航项，避免与默认<a>标签事件冲突
document.querySelectorAll('.nav-item').forEach(item => {
  // 检查当前导航项是否包含<a>标签，如果包含则跳过，使用<a>标签的默认行为
  const hasLink = item.querySelector('a') !== null;
  if (hasLink) {
    return; // 跳过包含<a>标签的导航项
  }
  
  item.addEventListener('click', function() {
    // 移除所有导航项的活动状态
    document.querySelectorAll('.nav-item').forEach(navItem => {
      navItem.classList.remove('active');
    });
    // 添加当前导航项的活动状态
    this.classList.add('active');
    
    // 获取当前点击项的文本内容
    const navText = this.textContent.trim();
    console.log('点击的导航项文本:', navText);
    
    // 使用更精确的匹配，优先检查特定的导航项
    let navTextContent;
    const spanElement = this.querySelector('span:not(.nav-icon)');
    
    if (spanElement) {
      navTextContent = spanElement.textContent.trim();
    } else {
      navTextContent = this.textContent.trim();
    }
    console.log('点击的导航项文本:', navTextContent);
    
    if (navTextContent.includes('倒数2期两球')) {
      console.log('跳转到倒数2期两球组合分析页面');
      window.location.href = 'dao_shu_2_qi_liang_qiu_zu_he.html';
    } else if (navTextContent.includes('倒数2期三球')) {
      console.log('跳转到倒数2期三球组合分析页面');
      window.location.href = 'dao_shu_2_qi_san_qiu_zu_he.html';
    } else if (navTextContent.includes('倒数3期三球')) {
      console.log('跳转到倒数3期三球组合分析页面');
      window.location.href = 'dao_shu_3_qi_san_qiu_zu_he.html';
    } else if (navTextContent.includes('两球组合分析')) {
      console.log('跳转到最新一期两球组合分析页面');
      window.location.href = 'zu_he_xiang_qing.html';
    } else if (navTextContent.includes('两球') || navTextContent.includes('双球')) {
      console.log('跳转到最新一期两球组合分析页面');
      window.location.href = 'sha_hao_fen_xi.html';
    } else if (navTextContent.includes('三球')) {
      console.log('跳转到最新一期三球组合分析页面');
      window.location.href = 'san_qiu_fen_xi.html';
    }
    
    // 在移动端点击导航后关闭侧边栏
    if (window.innerWidth <= 768) {
      toggleSidebar();
    }
  });
});
