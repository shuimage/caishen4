// 还原九转连环图 JavaScript 文件

// 从后端获取还原九转连环图数据
async function huo_qu_huan_yuan_jiu_zhuan_lian_huan_tu(period = '100') {
  try {
    const response = await fetch(`http://localhost:18889/huan_yuan_jiu_zhuan_lian_huan_tu?period=${period}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      alert('接口失败');
      return null;
    }
  } catch (error) {
    console.error('获取还原九转连环图数据失败:', error);
    alert('接口失败');
    return null;
  }
}

// 绘制还原九转连环图
async function drawHuanYuanChart(data, period) {
  const canvas = document.getElementById('huanYuanChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const isDarkTheme = document.body.classList.contains('dark-theme');
  
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 设置图表样式
  const chartWidth = canvas.width;
  const chartHeight = canvas.height;
  const centerX = chartWidth / 2;
  const centerY = chartHeight / 2;
  
  // 绘制背景
  ctx.fillStyle = isDarkTheme ? '#1a1a1a' : '#ffffff';
  ctx.fillRect(0, 0, chartWidth, chartHeight);
  
  // 绘制标题
  ctx.fillStyle = isDarkTheme ? '#ffffff' : '#333333';
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('还原九转连环图', centerX, 30);
  
  // 绘制中心圆
  ctx.beginPath();
  ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI);
  ctx.fillStyle = '#DF2220';
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // 绘制中心文字
  ctx.fillStyle = '#ffffff';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('中', centerX, centerY);
  
  // 如果没有数据，显示提示信息
  if (!data || data.length === 0) {
    ctx.fillStyle = isDarkTheme ? '#cccccc' : '#666666';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('暂无数据', centerX, centerY + 80);
    return;
  }
  
  // 这里可以根据实际数据绘制更复杂的图表
  // 以下是一个简单的示例
  ctx.fillStyle = isDarkTheme ? '#ffffff' : '#333333';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`统计期数: ${period === 'all' ? '全部期' : `最新${period}期`}`, centerX, chartHeight - 20);
}

// 刷新图表
async function refreshChart() {
  const periodRange = document.getElementById('periodRange');
  const period = periodRange ? periodRange.value : '100';
  
  // 从后端获取数据
  const data = await huo_qu_huan_yuan_jiu_zhuan_lian_huan_tu(period);
  
  if (data) {
    // 绘制图表
    drawHuanYuanChart(data, period);
    
    // 更新统计信息
    updateStatsInfo(data, period);
  }
}

// 更新统计信息
function updateStatsInfo(data, period) {
  const statsInfo = document.getElementById('statsInfo');
  if (!statsInfo) return;
  
  // 清空现有信息
  statsInfo.innerHTML = '';
  
  // 简单的统计示例
  const stats = [
    { label: '统计期数', value: period === 'all' ? '全部期' : `最新${period}期` },
    { label: '数据条数', value: data.length },
    { label: '图表类型', value: '还原九转连环图' },
    { label: '更新时间', value: new Date().toLocaleString() }
  ];
  
  // 渲染统计信息
  stats.forEach(stat => {
    const statDiv = document.createElement('div');
    statDiv.style.cssText = `padding: 10px; border-radius: 8px; background-color: ${document.body.classList.contains('dark-theme') ? '#2d2d2d' : '#f5f5f5'};`;
    statDiv.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 5px;">${stat.label}</div>
      <div style="color: ${document.body.classList.contains('dark-theme') ? '#ffffff' : '#333333'}">${stat.value}</div>
    `;
    statsInfo.appendChild(statDiv);
  });
}

// 页面加载完成后初始化
window.addEventListener('load', async function() {
  try {
    // 初始化图表
    await refreshChart();
    
    // 添加主题切换监听，重新绘制图表
    const observer = new MutationObserver(async function(mutations) {
      mutations.forEach(async function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          // 主题切换时重新绘制图表
          const periodRange = document.getElementById('periodRange');
          const period = periodRange ? periodRange.value : '100';
          const data = await huo_qu_huan_yuan_jiu_zhuan_lian_huan_tu(period);
          if (data) {
            drawHuanYuanChart(data, period);
            updateStatsInfo(data, period);
          }
        }
      });
    });
    
    // 监听body元素的class变化
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
  } catch (error) {
    console.error('页面初始化失败:', error);
    // 显示错误信息
    const chartContainer = document.querySelector('.chart-container');
    if (chartContainer) {
      chartContainer.innerHTML = '<div style="text-align: center; padding: 50px; color: #DF2220; font-weight: bold;">图表加载失败，请刷新重试</div>';
    }
  }
});
