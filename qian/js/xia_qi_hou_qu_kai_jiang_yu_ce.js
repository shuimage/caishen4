// 主题切换功能 - 仅从localStorage读取设置，不在此页面提供切换按钮
document.addEventListener('DOMContentLoaded', function() {
  // 从localStorage读取主题设置
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark-theme');
  }
});

// 页面加载完成后执行主函数
window.addEventListener('load', async function() {
  // 获取DOM元素
  const latestDrawInfo = document.getElementById('latestDrawInfo');
  const secondLastDrawInfo = document.getElementById('secondLastDrawInfo');
  const thirdLastDrawInfo = document.getElementById('thirdLastDrawInfo');
  const fourthLastDrawInfo = document.getElementById('fourthLastDrawInfo');
  const fifthLastDrawInfo = document.getElementById('fifthLastDrawInfo');
  
  // 总回测控制相关元素
  const startAllBacktestBtn = document.getElementById('startAllBacktestBtn');
  const stopAllBacktestBtn = document.getElementById('stopAllBacktestBtn');
  const totalProgress = document.getElementById('totalProgress');
  const totalProgressText = document.getElementById('totalProgressText');
  const totalProgressBar = document.getElementById('totalProgressBar');
  const totalProgressPercentage = document.getElementById('totalProgressPercentage');
  const totalCurrentPhase = document.getElementById('totalCurrentPhase');
  
  // 复制按钮
  const copyAllBuyNumbersBtn = document.getElementById('copyAllBuyNumbersBtn');
  
  // 绘制图表按钮
  const refreshChartBtn = document.getElementById('refreshChartBtn');
  
  // 保存和加载回测结果按钮
  const saveBacktestResultsBtn = document.getElementById('saveBacktestResultsBtn');
  const loadBacktestResultsBtn = document.getElementById('loadBacktestResultsBtn');
  
  // 标记是否正在回测
  let isBacktesting = false;
  let isStopped = false;
  
  // 初始化保存回测结果按钮状态
  updateSaveButtonStatus();
  
  // 添加保存回测结果按钮事件监听器
  if (saveBacktestResultsBtn) {
    saveBacktestResultsBtn.addEventListener('click', bao_cun_hui_ce_jie_guo_quan_bu);
  }
  
  // 添加加载回测结果按钮事件监听器
  if (loadBacktestResultsBtn) {
    loadBacktestResultsBtn.addEventListener('click', jia_zai_hui_ce_jie_guo);
  }
  
  // 最新一期两球组合后区平均率最高统计期详情 - 开始回测按钮
  const startBacktestBtnNewestBack = document.getElementById('startBacktestBtnNewestBack');
  const stopBacktestBtnNewestBack = document.getElementById('stopBacktestBtnNewestBack');
  const progressNewestBack = document.getElementById('progressNewestBack');
  const progressTextNewestBack = document.getElementById('progressTextNewestBack');
  const progressBarNewestBack = document.getElementById('progressBarNewestBack');
  const progressPercentageNewestBack = document.getElementById('progressPercentageNewestBack');
  const currentPhaseNewestBack = document.getElementById('currentPhaseNewestBack');
  const detailResultsNewestBack = document.getElementById('detailResultsNewestBack');
  
  // 倒数2期两球组合后区平均率最高统计期详情 - 开始回测按钮
  const startBacktestBtnSecondLastBack = document.getElementById('startBacktestBtnSecondLastBack');
  const stopBacktestBtnSecondLastBack = document.getElementById('stopBacktestBtnSecondLastBack');
  const progressSecondLastBack = document.getElementById('progressSecondLastBack');
  const progressTextSecondLastBack = document.getElementById('progressTextSecondLastBack');
  const progressBarSecondLastBack = document.getElementById('progressBarSecondLastBack');
  const progressPercentageSecondLastBack = document.getElementById('progressPercentageSecondLastBack');
  const currentPhaseSecondLastBack = document.getElementById('currentPhaseSecondLastBack');
  const detailResultsSecondLastBack = document.getElementById('detailResultsSecondLastBack');
  
  // 倒数3期两球组合后区平均率最高统计期详情 - 开始回测按钮
  const startBacktestBtnThirdLastBack = document.getElementById('startBacktestBtnThirdLastBack');
  const stopBacktestBtnThirdLastBack = document.getElementById('stopBacktestBtnThirdLastBack');
  const progressThirdLastBack = document.getElementById('progressThirdLastBack');
  const progressTextThirdLastBack = document.getElementById('progressTextThirdLastBack');
  const progressBarThirdLastBack = document.getElementById('progressBarThirdLastBack');
  const progressPercentageThirdLastBack = document.getElementById('progressPercentageThirdLastBack');
  const currentPhaseThirdLastBack = document.getElementById('currentPhaseThirdLastBack');
  const detailResultsThirdLastBack = document.getElementById('detailResultsThirdLastBack');
  
  // 倒数4期两球组合后区平均率最高统计期详情 - 开始回测按钮
  const startBacktestBtnFourthLastBack = document.getElementById('startBacktestBtnFourthLastBack');
  const stopBacktestBtnFourthLastBack = document.getElementById('stopBacktestBtnFourthLastBack');
  const progressFourthLastBack = document.getElementById('progressFourthLastBack');
  const progressTextFourthLastBack = document.getElementById('progressTextFourthLastBack');
  const progressBarFourthLastBack = document.getElementById('progressBarFourthLastBack');
  const progressPercentageFourthLastBack = document.getElementById('progressPercentageFourthLastBack');
  const currentPhaseFourthLastBack = document.getElementById('currentPhaseFourthLastBack');
  const detailResultsFourthLastBack = document.getElementById('detailResultsFourthLastBack');
  
  // 倒数5期两球组合后区平均率最高统计期详情 - 开始回测按钮
  const startBacktestBtnFifthLastBack = document.getElementById('startBacktestBtnFifthLastBack');
  const stopBacktestBtnFifthLastBack = document.getElementById('stopBacktestBtnFifthLastBack');
  const progressFifthLastBack = document.getElementById('progressFifthLastBack');
  const progressTextFifthLastBack = document.getElementById('progressTextFifthLastBack');
  const progressBarFifthLastBack = document.getElementById('progressBarFifthLastBack');
  const progressPercentageFifthLastBack = document.getElementById('progressPercentageFifthLastBack');
  const currentPhaseFifthLastBack = document.getElementById('currentPhaseFifthLastBack');
  const detailResultsFifthLastBack = document.getElementById('detailResultsFifthLastBack');
  
  // 近两期两球组合后区平均率最高统计期详情 - 开始回测按钮
  const startBacktestBtnNearTwoPeriodsBack = document.getElementById('startBacktestBtnNearTwoPeriodsBack');
  const stopBacktestBtnNearTwoPeriodsBack = document.getElementById('stopBacktestBtnNearTwoPeriodsBack');
  const progressNearTwoPeriodsBack = document.getElementById('progressNearTwoPeriodsBack');
  const progressTextNearTwoPeriodsBack = document.getElementById('progressTextNearTwoPeriodsBack');
  const progressBarNearTwoPeriodsBack = document.getElementById('progressBarNearTwoPeriodsBack');
  const progressPercentageNearTwoPeriodsBack = document.getElementById('progressPercentageNearTwoPeriodsBack');
  const currentPhaseNearTwoPeriodsBack = document.getElementById('currentPhaseNearTwoPeriodsBack');
  const detailResultsNearTwoPeriodsBack = document.getElementById('detailResultsNearTwoPeriodsBack');
  
  // 调用主函数，加载开奖信息
  await main();
  
  // 从URL参数中获取回测方法
  function getURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const backtestMethod = urlParams.get('backtest_method') || 'average';
    return { backtestMethod };
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
          frontNumbers: drawInfo.firstZoneNumbers || drawInfo.frontNumbers || [],
          backNumbers: drawInfo.lastZoneNumbers || drawInfo.backNumbers || []
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
    
    // 确保 frontNumbers 和 backNumbers 是数组
    const frontNumbers = Array.isArray(drawInfo.frontNumbers) ? drawInfo.frontNumbers : [];
    const backNumbers = Array.isArray(drawInfo.backNumbers) ? drawInfo.backNumbers : [];
    
    container.innerHTML = `
      <div style="font-weight: bold; color: #DF2220; font-size: 16px;">
        期号: ${drawInfo.issue}
      </div>
      <div>
        日期: ${formattedDate}
      </div>
      <div>
        前区: ${frontNumbers.map(num => `<span class="red-ball">${num}</span>`).join(' ')}
      </div>
      <div>
        后区: ${backNumbers.map(num => `<span class="blue-ball">${num}</span>`).join(' ')}
      </div>
    `;
  }

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

  // 从后端获取回测数据
  async function huo_qu_sha_hao_hou_mai_hao_hui_ce(backtestPeriod = '50', statsPeriod = '100', backtestMethod = 'most') {
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

  // 获取最新开奖信息
  async function huo_qu_zui_xin_kai_jiang() {
    return await huo_qu_kai_jiang_info('http://localhost:18889/sql_zui_xin_yi_qi', 'latestDraw');
  }

  // 获取后区推荐买号
  async function huo_qu_hou_qu_tui_jian_mai_hao(statsPeriod, backtestMethod) {
    try {
      // 调用sha_hao_fen_xi.html对应的API获取组合数据
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
          // 累加每个号码的出现次数
          for (let i = 1; i <= 12; i++) {
            const count = combo.numberCounts[i] || 0;
            backTotalCounts[i] += count;
          }
        });
        
        // 根据回测方法计算对应的后区推荐买号
        if (backtestMethod === 'most') {
          // 1. 出现最多球：找到backTotalCounts中的最大值对应的号码
          const maxLastCount = Math.max(...backTotalCounts);
          if (maxLastCount > 0) {
            // 找出所有最大值对应的号码
            for (let i = 1; i <= 12; i++) {
              if (backTotalCounts[i] === maxLastCount) {
                backBuyNumbers.push(i);
              }
            }
          }
        } else if (backtestMethod === 'least') {
          // 2. 出现最少球：找到backTotalCounts中除0以外的最小值对应的号码
          const nonZeroBackCounts = backTotalCounts.filter(count => count > 0);
          if (nonZeroBackCounts.length > 0) {
            const minLastCount = Math.min(...nonZeroBackCounts);
            // 找出所有最小值对应的号码
            for (let i = 1; i <= 12; i++) {
              if (backTotalCounts[i] === minLastCount) {
                backBuyNumbers.push(i);
              }
            }
          }
        } else if (backtestMethod === 'average') {
          // 3. 出现平均球：找到backTotalCounts中次数等于平均值的号码
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
          }
        } else if (backtestMethod.match(/^rank(\d+)$/)) {
          // 排名方法：根据排名选择号码
          const rankMatch = backtestMethod.match(/^rank(\d+)$/);
          const rank = parseInt(rankMatch[1]);
          
          // 按出现次数降序排序号码（包括出现次数为0的号码）
          const sortedNumbers = [];
          for (let i = 1; i <= 12; i++) {
            sortedNumbers.push({ number: i, count: backTotalCounts[i] || 0 });
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
          for (let i = 1; i <= 12; i++) {
            if (rankMap[i] === rank) {
              backBuyNumbers.push(i);
            }
          }
        }
        
        // 对于排名方法，如果没有找到对应排名的号码，返回空数组
        // 对于其他方法，如果没有找到对应号码，返回所有后区号码作为默认值
        if (backBuyNumbers.length === 0 && !backtestMethod.match(/^rank(\d+)$/)) {
          // 如果所有条件都不满足，返回所有后区号码作为默认值
          for (let i = 1; i <= 12; i++) {
            backBuyNumbers.push(i);
          }
        }
        
        return backBuyNumbers;
      } else {
        alert('接口失败');
        return [];
      }
    } catch (error) {
      console.error('获取后区推荐买号失败:', error);
      return [];
    }
  }

  // 测试单个统计期值的平均正确率
  async function testStatsPeriod(backtestPeriod, statsPeriod, backtestMethod) {
    try {
      const backtestData = await huo_qu_sha_hao_hou_mai_hao_hui_ce(backtestPeriod, statsPeriod, backtestMethod);
      if (!backtestData || !backtestData.backtestResults || backtestData.backtestResults.length === 0) {
        return { statsPeriod, accuracy: 0 };
      }
      
      let successBuyCount = 0;
      backtestData.backtestResults.forEach(result => {
        if (result.backCorrectBuy > 0) {
          successBuyCount++;
        }
      });
      
      const totalPeriods = backtestData.backtestResults.length;
      const averageCorrectRate = totalPeriods > 0 ? 
        ((successBuyCount / totalPeriods) * 100) : 0;
      
      return { statsPeriod, accuracy: averageCorrectRate }; // 这里变量名错误，应该是averageCorrectRate
    } catch (error) {
      console.error(`测试统计期${statsPeriod} 失败:`, error);
      return { statsPeriod, accuracy: 0 };
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
        // 获取最新一期期号，去掉"期"字
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
  
  // 获取倒数2期期号
  async function huo_qu_dao_shu_2_qi_qi_hao() {
    try {
      const response = await fetch('http://localhost:18889/sql_dao_shu_2_qi');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        // 获取倒数2期期号，去掉"期"字
        const secondLastPeriod = result.secondLastDraw.period.replace('期', '');
        return secondLastPeriod;
      } else {
        alert('接口失败');
        // 备选方案：使用最新一期期号计算
        const lastPeriod = await getLastPeriod();
        return (parseInt(lastPeriod) - 1).toString();
      }
    } catch (error) {
      console.error('获取倒数2期期号失败', error);
      alert('接口失败');
      // 备选方案：使用最新一期期号计算
      const lastPeriod = await getLastPeriod();
      return (parseInt(lastPeriod) - 1).toString();
    }
  }
  
  // 获取倒数3期期号
  async function huo_qu_dao_shu_3_qi_qi_hao() {
    try {
      const response = await fetch('http://localhost:18889/sql_dao_shu_3_qi');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        // 获取倒数3期期号，去掉"期"字
        const thirdLastPeriod = result.thirdLastDraw.period.replace('期', '');
        return thirdLastPeriod;
      } else {
        alert('接口失败');
        // 备选方案：使用最新一期期号计算
        const lastPeriod = await getLastPeriod();
        return (parseInt(lastPeriod) - 2).toString();
      }
    } catch (error) {
      console.error('获取倒数3期期号失败', error);
      alert('接口失败');
      // 备选方案：使用最新一期期号计算
      const lastPeriod = await getLastPeriod();
      return (parseInt(lastPeriod) - 2).toString();
    }
  }
  
  // 计算下一期期号
  function calculateNextPeriod(currentPeriod) {
    const periodNum = parseInt(currentPeriod);
    return (periodNum + 1).toString();
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

  // 收集所有卡片的回测结果
  function collectAllBacktestResults() {
    const backtestResultsMap = {
      '最新一期两球组合后区': [],
      '倒数2期两球组合后区': [],
      '倒数3期两球组合后区': [],
      '倒数4期两球组合后区': [],
      '倒数5期两球组合后区': [],
      '近两期两球组合后区': []
    };
    
    const tbodyIds = {
      '最新一期两球组合后区': 'detailResultsNewestBack',
      '倒数2期两球组合后区': 'detailResultsSecondLastBack',
      '倒数3期两球组合后区': 'detailResultsThirdLastBack',
      '倒数4期两球组合后区': 'detailResultsFourthLastBack',
      '倒数5期两球组合后区': 'detailResultsFifthLastBack',
      '近两期两球组合后区': 'detailResultsNearTwoPeriodsBack'
    };
    
    for (const [name, tbodyId] of Object.entries(tbodyIds)) {
      const tbody = document.getElementById(tbodyId);
      if (tbody) {
        const rows = tbody.querySelectorAll('tr');
        rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 8) {
            // 提取回测结果数据
            const method = cells[0].textContent;
            const backtestPeriod = cells[1].textContent;
            const statsPeriod = cells[2].textContent;
            const accuracy = cells[3].textContent;
            const currentPeriod = cells[4].textContent;
            const nextPeriod = cells[5].textContent;
            const recommendedNumbers = cells[6].textContent;
            
            backtestResultsMap[name].push({
              method,
              backtestPeriod,
              statsPeriod,
              accuracy,
              currentPeriod,
              nextPeriod,
              recommendedNumbers
            });
          }
        });
      }
    }
    
    return backtestResultsMap;
  }

  // 保存回测结果到localStorage
  function bao_cun_hui_ce_jie_guo_quan_bu() {
    const backtestResults = collectAllBacktestResults();
    localStorage.setItem('backtestResults', JSON.stringify(backtestResults));
    alert('回测结果已保存');
  }

  // 从localStorage加载回测结果
  function jia_zai_hui_ce_jie_guo() {
    const savedResults = localStorage.getItem('backtestResults');
    if (savedResults) {
      const backtestResults = JSON.parse(savedResults);
      // TODO: 根据加载的结果更新UI
      alert('回测结果已加载');
    } else {
      alert('没有保存的回测结果');
    }
  }

  // 更新保存按钮状态
  function updateSaveButtonStatus() {
    // 检查是否有回测结果可以保存
    const hasResults = false; // 初始状态为false
    if (saveBacktestResultsBtn) {
      if (hasResults) {
        saveBacktestResultsBtn.style.opacity = '1';
        saveBacktestResultsBtn.style.cursor = 'pointer';
        saveBacktestResultsBtn.style.backgroundColor = '#FF9800';
        saveBacktestResultsBtn.style.color = 'white';
      } else {
        saveBacktestResultsBtn.style.opacity = '0.5';
        saveBacktestResultsBtn.style.cursor = 'not-allowed';
        saveBacktestResultsBtn.style.backgroundColor = '#cccccc';
        saveBacktestResultsBtn.style.color = '#666666';
      }
    }
  }

  // 渲染详情数据 - 最新一期两球组合后区
  async function renderDetailDataNewestBack(allResults, nextPeriod) {
    const detailResults = document.getElementById('detailResultsNewestBack');
    
    try {
      // 清空当前内容
      detailResults.innerHTML = '';
      
      // 如果没有结果，显示提示
      if (allResults.length === 0) {
        detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #666;">未找到平均率最高的统计期</td></tr>';
        return;
      }
      
      // 过滤回测结果：如果回测方法相同，正确率也相同，下一期后区推荐买号的值也相同，则任意显示一个
      const uniqueResultsMap = new Map();
      
      allResults.forEach(result => {
        // 基于回测方法、正确率和下一期后区推荐买号（排序后）创建唯一键
        const sortedBuyNumbers = [...(result.backBuyNumbers || [])].sort((a, b) => a - b);
        const uniqueKey = `${result.backtestMethod}_${result.accuracy.toFixed(3)}_${sortedBuyNumbers.join('_')}`;
        
        // 只保留第一条出现的结果
        if (!uniqueResultsMap.has(uniqueKey)) {
          uniqueResultsMap.set(uniqueKey, result);
        }
      });
      
      // 将过滤后的结果转换回数组
      let filteredResults = Array.from(uniqueResultsMap.values());
      
      // 过滤掉下一期后区推荐买号为空的结果
      filteredResults = filteredResults.filter(result => {
        return result.backBuyNumbers && result.backBuyNumbers.length > 0;
      });
      
      // 按平均正确率降序排序
      filteredResults.sort((a, b) => b.accuracy - a.accuracy);
      
      // 遍历过滤后的结果
      for (const result of filteredResults) {
        const { statsPeriod, accuracy, backtestMethod, backBuyNumbers } = result;
        
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
        
        // 格式化后区推荐买号
        const backBuyNumbersStr = backBuyNumbers.map(num => `<span class="blue-ball">${num}</span>`).join(' ');
        
        // 创建表格行
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${backtestMethodText}</td>
          <td>50期</td>
          <td>${statsPeriod}期</td>
          <td>${averageCorrectRate}%</td>
          <td>${nextPeriod}</td>
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
      detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">加载失败，请重试</td></tr>';
    }
  }

  // 最新一期两球组合后区平均率最高统计期详情回测函数
  async function performSearchNewestBack() {
    const progressDiv = document.getElementById('progressNewestBack');
    const progressText = document.getElementById('progressTextNewestBack');
    const progressBar = document.getElementById('progressBarNewestBack');
    const progressPercentage = document.getElementById('progressPercentageNewestBack');
    const currentPhase = document.getElementById('currentPhaseNewestBack');
    const detailResults = document.getElementById('detailResultsNewestBack');
    const startBacktestBtn = document.getElementById('startBacktestBtnNewestBack');
    const stopBacktestBtn = document.getElementById('stopBacktestBtnNewestBack');
    
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
      
      const backtestPeriod = '50'; // 固定回测期数为50期
      
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
      for (let i = 1; i <= 12; i++) {
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
      
      // 遍历回测方法
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
        
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          break;
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
      
      // 检查是否需要终止回测
      if (isBacktestStopped) {
        detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">回测已终止</td></tr>';
      } else {
        // 更新进度
        await updateProgress('搜索完成，正在获取后区推荐买号..', 85, '获取后区推荐买号');
        currentStep++;
        
        // 为每个结果获取后区推荐买号
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
            `正在获取统计期${result.statsPeriod}期，${methodName}方法的后区推荐买号..`, 
            buyProgress, 
            `处理结果 ${i + 1}/${allResults.length}`
          );
          
          result.backBuyNumbers = await huo_qu_hou_qu_tui_jian_mai_hao(result.statsPeriod, result.backtestMethod);
        }
        
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">回测已终止</td></tr>';
        } else {
          // 更新进度
          await updateProgress(`找到 ${allResults.length} 个平均率最高的统计期，正在渲染结果...`, 98, '渲染结果');
          currentStep++;
          
          // 渲染详情数据，传递所有结果和下一期期号
          await renderDetailDataNewestBack(allResults, nextPeriod);
          
          // 更新进度
          await updateProgress('搜索完成，正在隐藏进度条...', 100, '完成');
        }
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

  // 渲染详情数据 - 倒数2期两球组合后区
  async function renderDetailDataSecondLastBack(allResults, nextPeriod) {
    const detailResults = document.getElementById('detailResultsSecondLastBack');
    
    try {
      // 清空当前内容
      detailResults.innerHTML = '';
      
      // 如果没有结果，显示提示
      if (allResults.length === 0) {
        detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #666;">未找到平均率最高的统计期</td></tr>';
        return;
      }
      
      // 过滤回测结果：如果回测方法相同，正确率也相同，下下期后区推荐买号的值也相同，则任意显示一个
      const uniqueResultsMap = new Map();
      
      allResults.forEach(result => {
        // 基于回测方法、正确率和下下期后区推荐买号（排序后）创建唯一键
        const sortedBuyNumbers = [...(result.backBuyNumbers || [])].sort((a, b) => a - b);
        const uniqueKey = `${result.backtestMethod}_${result.accuracy.toFixed(3)}_${sortedBuyNumbers.join('_')}`;
        
        // 只保留第一条出现的结果
        if (!uniqueResultsMap.has(uniqueKey)) {
          uniqueResultsMap.set(uniqueKey, result);
        }
      });
      
      // 将过滤后的结果转换回数组
      let filteredResults = Array.from(uniqueResultsMap.values());
      
      // 过滤掉下下期后区推荐买号为空的结果
      filteredResults = filteredResults.filter(result => {
        return result.backBuyNumbers && result.backBuyNumbers.length > 0;
      });
      
      // 按平均正确率降序排序
      filteredResults.sort((a, b) => b.accuracy - a.accuracy);
      
      // 遍历过滤后的结果
      for (const result of filteredResults) {
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
        
        // 格式化后区推荐买号
        const backBuyNumbersStr = backBuyNumbers.map(num => `<span class="blue-ball">${num}</span>`).join(' ');
        
        // 创建表格行
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${backtestMethodText}</td>
          <td>50期</td>
          <td>${statsPeriod}期</td>
          <td>${averageCorrectRate}%</td>
          <td>${nextPeriod}</td>
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
      detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">加载失败，请重试</td></tr>';
    }
  }

  // 渲染详情数据 - 倒数3期两球组合后区
  async function renderDetailDataThirdLastBack(allResults, nextPeriod) {
    const detailResults = document.getElementById('detailResultsThirdLastBack');
    
    try {
      // 清空当前内容
      detailResults.innerHTML = '';
      
      // 如果没有结果，显示提示
      if (allResults.length === 0) {
        detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #666;">未找到平均率最高的统计期</td></tr>';
        return;
      }
      
      // 过滤回测结果：如果回测方法相同，正确率也相同，下下下期后区推荐买号的值也相同，则任意显示一个
      const uniqueResultsMap = new Map();
      
      allResults.forEach(result => {
        // 基于回测方法、正确率和下下下期后区推荐买号（排序后）创建唯一键
        const sortedBuyNumbers = [...(result.backBuyNumbers || [])].sort((a, b) => a - b);
        const uniqueKey = `${result.backtestMethod}_${result.accuracy.toFixed(3)}_${sortedBuyNumbers.join('_')}`;
        
        // 只保留第一条出现的结果
        if (!uniqueResultsMap.has(uniqueKey)) {
          uniqueResultsMap.set(uniqueKey, result);
        }
      });
      
      // 将过滤后的结果转换回数组
      let filteredResults = Array.from(uniqueResultsMap.values());
      
      // 过滤掉下下下期后区推荐买号为空的结果
      filteredResults = filteredResults.filter(result => {
        return result.backBuyNumbers && result.backBuyNumbers.length > 0;
      });
      
      // 按平均正确率降序排序
      filteredResults.sort((a, b) => b.accuracy - a.accuracy);
      
      // 遍历过滤后的结果
      for (const result of filteredResults) {
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
        
        // 格式化后区推荐买号
        const backBuyNumbersStr = backBuyNumbers.map(num => `<span class="blue-ball">${num}</span>`).join(' ');
        
        // 创建表格行
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${backtestMethodText}</td>
          <td>50期</td>
          <td>${statsPeriod}期</td>
          <td>${averageCorrectRate}%</td>
          <td>${nextPeriod}</td>
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
      detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">加载失败，请重试</td></tr>';
    }
  }

  // 渲染详情数据 - 倒数4期两球组合后区
  async function renderDetailDataFourthLastBack(allResults, nextPeriod) {
    const detailResults = document.getElementById('detailResultsFourthLastBack');
    
    try {
      // 清空当前内容
      detailResults.innerHTML = '';
      
      // 如果没有结果，显示提示
      if (allResults.length === 0) {
        detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #666;">未找到平均率最高的统计期</td></tr>';
        return;
      }
      
      // 过滤结果：过滤空推荐号码并实现去重
      const filteredResults = [];
      const seenResults = new Set();
      
      for (const result of allResults) {
        // 如果是排名方法且没有找到对应排名的号码（返回空数组），则跳过该结果
        if (result.backtestMethod.match(/^rank(\d+)$/) && result.backBuyNumbers.length === 0) {
          continue;
        }
        
        // 去重：使用回测方法、正确率和推荐买号的组合作为唯一标识
        const buyNumbersKey = result.backBuyNumbers.sort((a, b) => a - b).join(',');
        const resultKey = `${result.backtestMethod}-${result.accuracy.toFixed(3)}-${buyNumbersKey}`;
        if (!seenResults.has(resultKey)) {
          seenResults.add(resultKey);
          filteredResults.push(result);
        }
      }
      
      // 按平均正确率进行降序排序
      filteredResults.sort((a, b) => b.accuracy - a.accuracy);
      
      // 遍历过滤后的结果
      for (const result of filteredResults) {
        const { statsPeriod, accuracy, backtestMethod, backBuyNumbers } = result;
        
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
        
        // 格式化后区推荐买号
        const backBuyNumbersStr = backBuyNumbers.map(num => `<span class="blue-ball">${num}</span>`).join(' ');
        
        // 创建表格行
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${backtestMethodText}</td>
          <td>50期</td>
          <td>${statsPeriod}期</td>
          <td>${averageCorrectRate}%</td>
          <td>${nextPeriod}</td>
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
      detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">加载失败，请重试</td></tr>';
    }
  }

  // 渲染详情数据 - 倒数5期两球组合后区
  async function renderDetailDataFifthLastBack(allResults, nextPeriod) {
    const detailResults = document.getElementById('detailResultsFifthLastBack');
    
    try {
      // 清空当前内容
      detailResults.innerHTML = '';
      
      // 如果没有结果，显示提示
      if (allResults.length === 0) {
        detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #666;">未找到平均率最高的统计期</td></tr>';
        return;
      }
      
      // 过滤结果：过滤空推荐号码并实现去重
      const filteredResults = [];
      const seenResults = new Set();
      
      for (const result of allResults) {
        // 如果是排名方法且没有找到对应排名的号码（返回空数组），则跳过该结果
        if (result.backtestMethod.match(/^rank(\d+)$/) && result.backBuyNumbers.length === 0) {
          continue;
        }
        
        // 去重：使用回测方法、正确率和推荐买号的组合作为唯一标识
        const buyNumbersKey = result.backBuyNumbers.sort((a, b) => a - b).join(',');
        const resultKey = `${result.backtestMethod}-${result.accuracy.toFixed(3)}-${buyNumbersKey}`;
        if (!seenResults.has(resultKey)) {
          seenResults.add(resultKey);
          filteredResults.push(result);
        }
      }
      
      // 按平均正确率进行降序排序
      filteredResults.sort((a, b) => b.accuracy - a.accuracy);
      
      // 遍历过滤后的结果
      for (const result of filteredResults) {
        const { statsPeriod, accuracy, backtestMethod, backBuyNumbers } = result;
        
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
        
        // 格式化后区推荐买号
        const backBuyNumbersStr = backBuyNumbers.map(num => `<span class="blue-ball">${num}</span>`).join(' ');
        
        // 创建表格行
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${backtestMethodText}</td>
          <td>50期</td>
          <td>${statsPeriod}期</td>
          <td>${averageCorrectRate}%</td>
          <td>${nextPeriod}</td>
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
      detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">加载失败，请重试</td></tr>';
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
      const response = await fetch(`http://localhost:18889/dao_shu_4_qi_hou_mai_hao_hui_ce?backtest_period=${backtestPeriod}&stats_period=${statsPeriod}&backtest_method=${backtestMethod}`);
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
      const response = await fetch(`http://localhost:18889/dao_shu_5_qi_hou_mai_hao_hui_ce?backtest_period=${backtestPeriod}&stats_period=${statsPeriod}&backtest_method=${backtestMethod}`);
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

  // 测试单个统计期值的平均正确率 - 倒数2期后区
  async function testStatsPeriodSecondLastBack(backtestPeriod, statsPeriod, backtestMethod) {
    try {
      const backtestData = await huo_qu_dao_shu_2_qi_hou_mai_hao_hui_ce(backtestPeriod, statsPeriod, backtestMethod);
      if (!backtestData || !backtestData.backtestResults || backtestData.backtestResults.length === 0) {
        return { statsPeriod, accuracy: 0 };
      }
      
      let successBuyCount = 0;
      backtestData.backtestResults.forEach(result => {
        if (result.backCorrectBuy > 0) {
          successBuyCount++;
        }
      });
      
      const totalPeriods = backtestData.backtestResults.length;
      const averageCorrectRate = totalPeriods > 0 ? 
        ((successBuyCount / totalPeriods) * 100) : 0;
      
      return { statsPeriod, accuracy: averageCorrectRate };
    } catch (error) {
      console.error(`测试统计期${statsPeriod} 失败:`, error);
      return { statsPeriod, accuracy: 0 };
    }
  }

  // 测试单个统计期值的平均正确率 - 倒数3期后区
  async function testStatsPeriodThirdLastBack(backtestPeriod, statsPeriod, backtestMethod) {
    try {
      const backtestData = await huo_qu_dao_shu_3_qi_hou_mai_hao_hui_ce(backtestPeriod, statsPeriod, backtestMethod);
      if (!backtestData || !backtestData.backtestResults || backtestData.backtestResults.length === 0) {
        return { statsPeriod, accuracy: 0 };
      }
      
      let successBuyCount = 0;
      backtestData.backtestResults.forEach(result => {
        if (result.backCorrectBuy > 0) {
          successBuyCount++;
        }
      });
      
      const totalPeriods = backtestData.backtestResults.length;
      const averageCorrectRate = totalPeriods > 0 ? 
        ((successBuyCount / totalPeriods) * 100) : 0;
      
      return { statsPeriod, accuracy: averageCorrectRate };
    } catch (error) {
      console.error(`测试统计期${statsPeriod} 失败:`, error);
      return { statsPeriod, accuracy: 0 };
    }
  }

  // 测试单个统计期值的平均正确率 - 倒数4期后区
  async function testStatsPeriodFourthLastBack(backtestPeriod, statsPeriod, backtestMethod) {
    try {
      const backtestData = await huo_qu_dao_shu_4_qi_hou_mai_hao_hui_ce(backtestPeriod, statsPeriod, backtestMethod);
      if (!backtestData || !backtestData.backtestResults || backtestData.backtestResults.length === 0) {
        return { statsPeriod, accuracy: 0 };
      }
      
      let successBuyCount = 0;
      backtestData.backtestResults.forEach(result => {
        if (result.backCorrectBuy > 0) {
          successBuyCount++;
        }
      });
      
      const totalPeriods = backtestData.backtestResults.length;
      const averageCorrectRate = totalPeriods > 0 ? 
        ((successBuyCount / totalPeriods) * 100) : 0;
      
      return { statsPeriod, accuracy: averageCorrectRate };
    } catch (error) {
      console.error(`测试统计期${statsPeriod} 失败:`, error);
      return { statsPeriod, accuracy: 0 };
    }
  }

  // 测试单个统计期值的平均正确率 - 倒数5期后区
  async function testStatsPeriodFifthLastBack(backtestPeriod, statsPeriod, backtestMethod) {
    try {
      const backtestData = await huo_qu_dao_shu_5_qi_hou_mai_hao_hui_ce(backtestPeriod, statsPeriod, backtestMethod);
      if (!backtestData || !backtestData.backtestResults || backtestData.backtestResults.length === 0) {
        return { statsPeriod, accuracy: 0 };
      }
      
      let successBuyCount = 0;
      backtestData.backtestResults.forEach(result => {
        if (result.backCorrectBuy > 0) {
          successBuyCount++;
        }
      });
      
      const totalPeriods = backtestData.backtestResults.length;
      const averageCorrectRate = totalPeriods > 0 ? 
        ((successBuyCount / totalPeriods) * 100) : 0;
      
      return { statsPeriod, accuracy: averageCorrectRate };
    } catch (error) {
      console.error(`测试统计期${statsPeriod} 失败:`, error);
      return { statsPeriod, accuracy: 0 };
    }
  }

  // 获取后区推荐买号 - 使用与dao_shu_2_qi_liang_qiu_zu_he.html相同的算法
  async function huo_qu_hou_qu_tui_jian_mai_hao_second_last(statsPeriod, backtestMethod) {
    try {
      // 调用与dao_shu_2_qi_liang_qiu_zu_he.html相同的接口获取倒数2期两球组合数据
      const response = await fetch(`http://localhost:18889/dao_shu_2_qi_hou_qu_liang_qiu_zu_he?period=${statsPeriod}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        const analysisData = result.data;
        const backCombinations = analysisData.combinations;
        let backBuyNumbers = [];
        
        // 初始化汇总计数数组 - 与dao_shu_2_qi_liang_qiu_zu_he.html完全相同
        const backTotalCounts = new Array(13).fill(0); // 索引0不使用，1-12对应后区号码
        
        // 遍历后区组合，统计每个号码的出现次数 - 与dao_shu_2_qi_liang_qiu_zu_he.html完全相同
        backCombinations.forEach(combo => {
          // 累加每个号码的出现次数
          for (let i = 1; i <= 12; i++) {
            const count = combo.count || 0;
            backTotalCounts[i] += count;
          }
        });
        
        // 根据回测方法计算对应的后区推荐买号 - 与dao_shu_2_qi_liang_qiu_zu_he.html完全相同
        if (backtestMethod === 'most') {
          // 1. 出现最多球：找到backTotalCounts中的最大值对应的号码
          const maxLastCount = Math.max(...backTotalCounts);
          if (maxLastCount > 0) {
            // 找出所有最大值对应的号码
            for (let i = 1; i <= 12; i++) {
              if (backTotalCounts[i] === maxLastCount) {
                backBuyNumbers.push(i);
              }
            }
          }
        } else if (backtestMethod === 'least') {
          // 2. 出现最少球：找到backTotalCounts中除0以外的最小值对应的号码
          const nonZeroBackCounts = backTotalCounts.filter(count => count > 0);
          if (nonZeroBackCounts.length > 0) {
            const minLastCount = Math.min(...nonZeroBackCounts);
            // 找出所有最小值对应的号码
            for (let i = 1; i <= 12; i++) {
              if (backTotalCounts[i] === minLastCount) {
                backBuyNumbers.push(i);
              }
            }
          }
        } else if (backtestMethod === 'average') {
          // 3. 出现平均球：找到backTotalCounts中次数等于平均值的号码
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
          }
        }
        
        return backBuyNumbers;
      } else {
        alert('接口失败');
        return [];
      }
    } catch (error) {
      console.error('获取后区推荐买号失败:', error);
      return [];
    }
  }

  // 获取后区推荐买号 - 使用与dao_shu_3_qi_liang_qiu_zu_he.html相同的算法
  async function huo_qu_hou_qu_tui_jian_mai_hao_third_last(statsPeriod, backtestMethod) {
    try {
      // 调用与dao_shu_3_qi_liang_qiu_zu_he.html相同的接口获取倒数3期两球组合数据
      const response = await fetch(`http://localhost:18889/dao_shu_3_qi_hou_qu_zu_he?period=${statsPeriod}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        const analysisData = result.data;
        const backCombinations = analysisData.combinations;
        let backBuyNumbers = [];
        
        // 初始化汇总计数数组 - 与dao_shu_3_qi_liang_qiu_zu_he.html完全相同
        const backTotalCounts = new Array(13).fill(0); // 索引0不使用，1-12对应后区号码
        
        // 遍历后区组合，统计每个号码的出现次数 - 与dao_shu_3_qi_liang_qiu_zu_he.html完全相同
        backCombinations.forEach(combo => {
          // 累加每个号码的出现次数
          for (let i = 1; i <= 12; i++) {
            const numStr = i.toString();
            if (combo.nextDrawNumbers && Array.isArray(combo.nextDrawNumbers)) {
              const count = combo.nextDrawNumbers.filter(n => n === numStr).length;
              backTotalCounts[i] += count;
            }
          }
        });
        
        // 排名方法：根据排名选择号码
        if (backtestMethod.match(/^rank(\d+)$/)) {
          const rankMatch = backtestMethod.match(/^rank(\d+)$/);
          const rank = parseInt(rankMatch[1]);
          
          // 按出现次数降序排序号码（包括出现次数为0的号码） - 与dao_shu_3_qi_liang_qiu_zu_he.html完全一致
          const sortedNumbers = [];
          for (let i = 1; i <= 12; i++) {
            sortedNumbers.push({ number: i, count: backTotalCounts[i] || 0 });
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
          for (let i = 1; i <= 12; i++) {
            if (rankMap[i] === rank) {
              backBuyNumbers.push(i);
            }
          }
        } else if (backtestMethod === 'most') {
          // 1. 出现最多球：找到backTotalCounts中的最大值对应的号码
          const maxLastCount = Math.max(...backTotalCounts);
          if (maxLastCount > 0) {
            // 找出所有最大值对应的号码
            for (let i = 1; i <= 12; i++) {
              if (backTotalCounts[i] === maxLastCount) {
                backBuyNumbers.push(i);
              }
            }
          }
        } else if (backtestMethod === 'least') {
          // 2. 出现最少球：找到backTotalCounts中除0以外的最小值对应的号码
          const nonZeroBackCounts = backTotalCounts.filter(count => count > 0);
          if (nonZeroBackCounts.length > 0) {
            const minLastCount = Math.min(...nonZeroBackCounts);
            // 找出所有最小值对应的号码
            for (let i = 1; i <= 12; i++) {
              if (backTotalCounts[i] === minLastCount) {
                backBuyNumbers.push(i);
              }
            }
          }
        } else if (backtestMethod === 'average') {
          // 3. 出现平均球：找到backTotalCounts中次数等于平均值的号码
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
          }
        }
        
        return backBuyNumbers;
      } else {
        alert('接口失败');
        return [];
      }
    } catch (error) {
      console.error('获取后区推荐买号失败:', error);
      return [];
    }
  }

  // 获取后区推荐买号 - 使用与dao_shu_4_qi_liang_qiu_zu_he.html相同的算法
  async function huo_qu_hou_qu_tui_jian_mai_hao_fourth_last(statsPeriod, backtestMethod) {
    try {
      // 调用与dao_shu_4_qi_liang_qiu_zu_he.html相同的接口获取倒数4期两球组合数据
      const response = await fetch(`http://localhost:18889/dao_shu_4_qi_hou_qu_zu_he?period=${statsPeriod}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        const analysisData = result.data;
        const backCombinations = analysisData.combinations;
        let backBuyNumbers = [];
        
        // 初始化汇总计数数组 - 与dao_shu_4_qi_liang_qiu_zu_he.html完全相同
        const backTotalCounts = new Array(13).fill(0); // 索引0不使用，1-12对应后区号码
        
        // 遍历后区组合，统计每个号码的出现次数 - 与dao_shu_4_qi_liang_qiu_zu_he.html完全相同
        backCombinations.forEach(combo => {
          // 累加每个号码的出现次数
          for (let i = 1; i <= 12; i++) {
            const numStr = String(i); // 后端使用数字作为键，不需要补0
            let count = 0;
            if (combo.nextDrawNumbers && Array.isArray(combo.nextDrawNumbers)) {
              count = combo.nextDrawNumbers.filter(n => n === numStr).length;
            }
            backTotalCounts[i] += count;
          }
        });
        
        // 排名方法：根据排名获取对应的号码
        if (backtestMethod.startsWith('rank')) {
          const rankMatch = backtestMethod.match(/^rank(\d+)$/);
          if (rankMatch) {
            const targetRank = parseInt(rankMatch[1]);
            
            // 计算排名 - 与dao_shu_4_qi_liang_qiu_zu_he.html完全相同
            const backRankMap = {};
            const backSortedNumbers = [];
            for (let i = 1; i <= 12; i++) {
              backSortedNumbers.push({ number: i, count: backTotalCounts[i] || 0 });
            }
            // 按出现次数降序排序
            backSortedNumbers.sort((a, b) => b.count - a.count);
            // 计算排名
            let backCurrentRank = 1;
            for (let i = 0; i < backSortedNumbers.length; i++) {
              if (i > 0 && backSortedNumbers[i].count !== backSortedNumbers[i - 1].count) {
                backCurrentRank++;
              }
              backRankMap[backSortedNumbers[i].number] = backCurrentRank;
            }
            
            // 找出对应排名的号码
            for (let i = 1; i <= 12; i++) {
              if (backRankMap[i] === targetRank) {
                backBuyNumbers.push(i);
              }
            }
          }
        } else if (backtestMethod === 'most') {
          // 1. 出现最多球：找到backTotalCounts中的最大值对应的号码
          const maxLastCount = Math.max(...backTotalCounts);
          if (maxLastCount > 0) {
            // 找出所有最大值对应的号码
            for (let i = 1; i <= 12; i++) {
              if (backTotalCounts[i] === maxLastCount) {
                backBuyNumbers.push(i);
              }
            }
          }
        } else if (backtestMethod === 'least') {
          // 2. 出现最少球：找到backTotalCounts中除0以外的最小值对应的号码
          const nonZeroBackCounts = backTotalCounts.filter(count => count > 0);
          if (nonZeroBackCounts.length > 0) {
            const minLastCount = Math.min(...nonZeroBackCounts);
            // 找出所有最小值对应的号码
            for (let i = 1; i <= 12; i++) {
              if (backTotalCounts[i] === minLastCount) {
                backBuyNumbers.push(i);
              }
            }
          }
        } else if (backtestMethod === 'average') {
          // 3. 出现平均球：找到backTotalCounts中次数等于平均值的号码
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
          }
        }
        
        return backBuyNumbers;
      } else {
        alert('接口失败');
        return [];
      }
    } catch (error) {
      console.error('获取后区推荐买号失败:', error);
      return [];
    }
  }

  // 获取后区推荐买号 - 使用与dao_shu_5_qi_liang_qiu_zu_he.html相同的算法
  async function huo_qu_hou_qu_tui_jian_mai_hao_fifth_last(statsPeriod, backtestMethod) {
    try {
      // 调用与dao_shu_5_qi_liang_qiu_zu_he.html相同的接口获取倒数5期两球组合数据
      const response = await fetch(`http://localhost:18889/dao_shu_5_qi_hou_qu_zu_he?period=${statsPeriod}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        const analysisData = result.data;
        const backCombinations = analysisData.combinations;
        let backBuyNumbers = [];
        
        // 初始化汇总计数数组 - 与dao_shu_5_qi_liang_qiu_zu_he.html完全相同
        const backTotalCounts = new Array(13).fill(0); // 索引0不使用，1-12对应后区号码
        
        // 遍历后区组合，统计每个号码的出现次数 - 与dao_shu_5_qi_liang_qiu_zu_he.html完全相同
        backCombinations.forEach(combo => {
          // 累加每个号码的出现次数
          for (let i = 1; i <= 12; i++) {
            const count = combo.numberCounts[i] || 0;
            backTotalCounts[i] += count;
          }
        });
        
        // 排名方法：根据排名获取对应的号码
        if (backtestMethod.startsWith('rank')) {
          const rankMatch = backtestMethod.match(/^rank(\d+)$/);
          if (rankMatch) {
            const targetRank = parseInt(rankMatch[1]);
            
            // 计算排名 - 与其他函数完全相同
            const backRankMap = {};
            const backSortedNumbers = [];
            for (let i = 1; i <= 12; i++) {
              backSortedNumbers.push({ number: i, count: backTotalCounts[i] || 0 });
            }
            // 按出现次数降序排序
            backSortedNumbers.sort((a, b) => b.count - a.count);
            // 计算排名
            let backCurrentRank = 1;
            for (let i = 0; i < backSortedNumbers.length; i++) {
              if (i > 0 && backSortedNumbers[i].count !== backSortedNumbers[i - 1].count) {
                backCurrentRank++;
              }
              backRankMap[backSortedNumbers[i].number] = backCurrentRank;
            }
            
            // 找出对应排名的号码
            for (let i = 1; i <= 12; i++) {
              if (backRankMap[i] === targetRank) {
                backBuyNumbers.push(i);
              }
            }
          }
        } else if (backtestMethod === 'most') {
          // 1. 出现最多球：找到backTotalCounts中的最大值对应的号码
          const maxLastCount = Math.max(...backTotalCounts);
          if (maxLastCount > 0) {
            // 找出所有最大值对应的号码
            for (let i = 1; i <= 12; i++) {
              if (backTotalCounts[i] === maxLastCount) {
                backBuyNumbers.push(i);
              }
            }
          }
        } else if (backtestMethod === 'least') {
          // 2. 出现最少球：找到backTotalCounts中除0以外的最小值对应的号码
          const nonZeroBackCounts = backTotalCounts.filter(count => count > 0);
          if (nonZeroBackCounts.length > 0) {
            const minLastCount = Math.min(...nonZeroBackCounts);
            // 找出所有最小值对应的号码
            for (let i = 1; i <= 12; i++) {
              if (backTotalCounts[i] === minLastCount) {
                backBuyNumbers.push(i);
              }
            }
          }
        } else if (backtestMethod === 'average') {
          // 3. 出现平均球：找到backTotalCounts中次数等于平均值的号码
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
          }
        }
        
        return backBuyNumbers;
      } else {
        alert('接口失败');
        return [];
      }
    } catch (error) {
      console.error('获取后区推荐买号失败:', error);
      return [];
    }
  }

  // 倒数2期两球组合后区平均率最高统计期详情回测函数
  async function performSearchSecondLastBack() {
    const progressDiv = document.getElementById('progressSecondLastBack');
    const progressText = document.getElementById('progressTextSecondLastBack');
    const progressBar = document.getElementById('progressBarSecondLastBack');
    const progressPercentage = document.getElementById('progressPercentageSecondLastBack');
    const currentPhase = document.getElementById('currentPhaseSecondLastBack');
    const detailResults = document.getElementById('detailResultsSecondLastBack');
    const startBacktestBtn = document.getElementById('startBacktestBtnSecondLastBack');
    const stopBacktestBtn = document.getElementById('stopBacktestBtnSecondLastBack');
    
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
      
      const backtestPeriod = '50'; // 固定回测期数为50期
      
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
      for (let i = 1; i <= 12; i++) {
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
      const nextPeriod = (parseInt(lastPeriod) + 2) + '期'; // 使用最近期的期号+2作为下下期期号
      
      // 遍历回测方法
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
        
        // 所有回测方法都从2000期开始
        let currentStart = 2000;
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
            
            const result = await testStatsPeriodSecondLastBack(backtestPeriod, i, backtestMethod);
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
          // 所有回测方法都使用2000期作为最小限制
          const minLimit = 2000;
          currentStart = Math.max(minLimit, minStatsPeriod - expansion);
          currentEnd = Math.min(totalPeriods, maxStatsPeriod + expansion);
        }
        
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          break;
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
      
      // 检查是否需要终止回测
      if (isBacktestStopped) {
        detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">回测已终止</td></tr>';
      } else {
        // 更新进度
        await updateProgress('搜索完成，正在获取后区推荐买号..', 85, '获取后区推荐买号');
        currentStep++;
        
        // 为每个结果获取后区推荐买号
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
            `正在获取统计期${result.statsPeriod}期，${methodName}方法的后区推荐买号..`, 
            buyProgress, 
            `处理结果 ${i + 1}/${allResults.length}`
          );
          
          result.backBuyNumbers = await huo_qu_hou_qu_tui_jian_mai_hao(result.statsPeriod, result.backtestMethod);
        }
        
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">回测已终止</td></tr>';
        } else {
          // 更新进度
          await updateProgress(`找到 ${allResults.length} 个平均率最高的统计期，正在渲染结果...`, 98, '渲染结果');
          currentStep++;
          
          // 渲染详情数据，传递所有结果和下下期期号
          await renderDetailDataSecondLastBack(allResults, nextPeriod);
          
          // 更新进度
          await updateProgress('搜索完成，正在隐藏进度条...', 100, '完成');
        }
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

  // 倒数3期两球组合后区平均率最高统计期详情回测函数
  async function performSearchThirdLastBack() {
    const progressDiv = document.getElementById('progressThirdLastBack');
    const progressText = document.getElementById('progressTextThirdLastBack');
    const progressBar = document.getElementById('progressBarThirdLastBack');
    const progressPercentage = document.getElementById('progressPercentageThirdLastBack');
    const currentPhase = document.getElementById('currentPhaseThirdLastBack');
    const detailResults = document.getElementById('detailResultsThirdLastBack');
    const startBacktestBtn = document.getElementById('startBacktestBtnThirdLastBack');
    const stopBacktestBtn = document.getElementById('stopBacktestBtnThirdLastBack');
    
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
      
      const backtestPeriod = '50'; // 固定回测期数为50期
      
      // 更新进度
      await updateProgress('正在获取总期数..', 5, '获取总期数');
      
      const totalPeriods = await getTotalPeriods();
      
      // 多阶段搜索策略，从大到小变化步长
      const searchStages = [
        { step: 100, expansion: 200 }, // 第一阶段：步长100，扩展范围200
        { step: 50, expansion: 100 },   // 第二阶段：步长50，扩展范围100
        { step: 20, expansion: 50 },    // 第三阶段：步长20，扩展范围50
        { step: 10, expansion: 30 },    // 第四阶段：步长10，扩展范围30
        { step: 5, expansion: 20 }      // 第五阶段：步长5，扩展范围20
      ];
      
      // 回测方法：只包含排名方法
      const backtestMethods = [];
      // 添加排名方法
      for (let i = 1; i <= 12; i++) {
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
      
      // 遍历回测方法
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
            
            const result = await testStatsPeriodThirdLastBack(backtestPeriod, i, backtestMethod);
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
        
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          break;
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
      
      // 检查是否需要终止回测
      if (isBacktestStopped) {
        detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">回测已终止</td></tr>';
      } else {
        // 更新进度
        await updateProgress('搜索完成，正在获取后区推荐买号..', 85, '获取后区推荐买号');
        currentStep++;
        
        // 为每个结果获取后区推荐买号
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
            `正在获取统计期${result.statsPeriod}期，${methodName}方法的后区推荐买号..`, 
            buyProgress, 
            `处理结果 ${i + 1}/${allResults.length}`
          );
          
          result.backBuyNumbers = await huo_qu_hou_qu_tui_jian_mai_hao(result.statsPeriod, result.backtestMethod);
        }
        
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">回测已终止</td></tr>';
        } else {
          // 更新进度
          await updateProgress(`找到 ${allResults.length} 个平均率最高的统计期，正在渲染结果...`, 98, '渲染结果');
          currentStep++;
          
          // 渲染详情数据，传递所有结果和下下下期期号
          await renderDetailDataThirdLastBack(allResults, nextPeriod);
          
          // 更新进度
          await updateProgress('搜索完成，正在隐藏进度条...', 100, '完成');
        }
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

  // 倒数4期两球组合后区平均率最高统计期详情回测函数
  async function performSearchFourthLastBack() {
    const progressDiv = document.getElementById('progressFourthLastBack');
    const progressText = document.getElementById('progressTextFourthLastBack');
    const progressBar = document.getElementById('progressBarFourthLastBack');
    const progressPercentage = document.getElementById('progressPercentageFourthLastBack');
    const currentPhase = document.getElementById('currentPhaseFourthLastBack');
    const detailResults = document.getElementById('detailResultsFourthLastBack');
    const startBacktestBtn = document.getElementById('startBacktestBtnFourthLastBack');
    const stopBacktestBtn = document.getElementById('stopBacktestBtnFourthLastBack');
    
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
      
      const backtestPeriod = '50'; // 固定回测期数为50期
      
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
      for (let i = 1; i <= 12; i++) {
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
      
      // 遍历回测方法
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
        
        // 从1500期开始搜索
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
            
            const result = await testStatsPeriodFourthLastBack(backtestPeriod, i, backtestMethod);
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
          
          // 扩展搜索范围，确保不遗漏相邻区域，且统计期数始终从1500期开始
          currentStart = Math.max(1500, minStatsPeriod - expansion);
          currentEnd = Math.min(totalPeriods, maxStatsPeriod + expansion);
        }
        
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          break;
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
      
      // 检查是否需要终止回测
      if (isBacktestStopped) {
        detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">回测已终止</td></tr>';
      } else {
        // 更新进度
        await updateProgress('搜索完成，正在获取后区推荐买号..', 85, '获取后区推荐买号');
        currentStep++;
        
        // 为每个结果获取后区推荐买号
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
            `正在获取统计期${result.statsPeriod}期，${methodName}方法的后区推荐买号..`, 
            buyProgress, 
            `处理结果 ${i + 1}/${allResults.length}`
          );
          
          result.backBuyNumbers = await huo_qu_hou_qu_tui_jian_mai_hao_fourth_last(result.statsPeriod, result.backtestMethod);
        }
        
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">回测已终止</td></tr>';
        } else {
          // 更新进度
          await updateProgress(`找到 ${allResults.length} 个平均率最高的统计期，正在渲染结果...`, 98, '渲染结果');
          currentStep++;
          
          // 渲染详情数据，传递所有结果和下下下下期期号
          await renderDetailDataFourthLastBack(allResults, nextPeriod);
          
          // 更新进度
          await updateProgress('搜索完成，正在隐藏进度条...', 100, '完成');
        }
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

  // 倒数5期两球组合后区平均率最高统计期详情回测函数
  async function performSearchFifthLastBack() {
    const progressDiv = document.getElementById('progressFifthLastBack');
    const progressText = document.getElementById('progressTextFifthLastBack');
    const progressBar = document.getElementById('progressBarFifthLastBack');
    const progressPercentage = document.getElementById('progressPercentageFifthLastBack');
    const currentPhase = document.getElementById('currentPhaseFifthLastBack');
    const detailResults = document.getElementById('detailResultsFifthLastBack');
    const startBacktestBtn = document.getElementById('startBacktestBtnFifthLastBack');
    const stopBacktestBtn = document.getElementById('stopBacktestBtnFifthLastBack');
    
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
      
      const backtestPeriod = '50'; // 固定回测期数为50期
      
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
      for (let i = 1; i <= 12; i++) {
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
      const nextPeriod = (parseInt(lastPeriod) + 5) + '期'; // 使用最近期的期号+5作为下下下下下期期号
      
      // 遍历回测方法
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
        
        // 从1500期开始搜索
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
            
            const result = await testStatsPeriodFifthLastBack(backtestPeriod, i, backtestMethod);
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
          
          // 扩展搜索范围，确保不遗漏相邻区域，且统计期数始终从1500期开始
          currentStart = Math.max(1500, minStatsPeriod - expansion);
          currentEnd = Math.min(totalPeriods, maxStatsPeriod + expansion);
        }
        
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          break;
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
      
      // 检查是否需要终止回测
      if (isBacktestStopped) {
        detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">回测已终止</td></tr>';
      } else {
        // 更新进度
        await updateProgress('搜索完成，正在获取后区推荐买号..', 85, '获取后区推荐买号');
        currentStep++;
        
        // 为每个结果获取后区推荐买号
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
            `正在获取统计期${result.statsPeriod}期，${methodName}方法的后区推荐买号..`, 
            buyProgress, 
            `处理结果 ${i + 1}/${allResults.length}`
          );
          
          result.backBuyNumbers = await huo_qu_hou_qu_tui_jian_mai_hao_fifth_last(result.statsPeriod, result.backtestMethod);
        }
        
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">回测已终止</td></tr>';
        } else {
          // 更新进度
          await updateProgress(`找到 ${allResults.length} 个平均率最高的统计期，正在渲染结果...`, 98, '渲染结果');
          currentStep++;
          
          // 渲染详情数据，传递所有结果和下下下下下期期号
          await renderDetailDataFifthLastBack(allResults, nextPeriod);
          
          // 更新进度
          await updateProgress('搜索完成，正在隐藏进度条...', 100, '完成');
        }
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

  // 近两期两球组合后区平均率最高统计期详情回测函数
  async function performSearchNearTwoPeriodsBack() {
    const progressDiv = document.getElementById('progressNearTwoPeriodsBack');
    const progressText = document.getElementById('progressTextNearTwoPeriodsBack');
    const progressBar = document.getElementById('progressBarNearTwoPeriodsBack');
    const progressPercentage = document.getElementById('progressPercentageNearTwoPeriodsBack');
    const currentPhase = document.getElementById('currentPhaseNearTwoPeriodsBack');
    const detailResults = document.getElementById('detailResultsNearTwoPeriodsBack');
    const startBacktestBtn = document.getElementById('startBacktestBtnNearTwoPeriodsBack');
    const stopBacktestBtn = document.getElementById('stopBacktestBtnNearTwoPeriodsBack');
    
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
      
      const backtestPeriod = '50'; // 固定回测期数为50期
      
      // 更新进度
      await updateProgress('正在获取总期数..', 5, '获取总期数');
      
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
      await updateProgress('正在获取最新一期期号..', 10, '获取最新期号');
      currentStep++;
      
      // 获取最后一期期号
      const lastPeriod = await getLastPeriod();
      const nextPeriod = (parseInt(lastPeriod) + 1) + '期'; // 使用最近期的期号+1作为下一期期号
      
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
          
          // 找出当前阶段的最高正确率
          const highestAccuracy = Math.max(...stageResults.map(result => result.accuracy));
          
          // 找出当前阶段中所有最高正确率的结果
          const highestResultsInStage = stageResults.filter(result => result.accuracy === highestAccuracy);
          
          // 计算下一阶段的搜索范围
          const minStatsPeriod = Math.min(...highestResultsInStage.map(result => result.statsPeriod));
          const maxStatsPeriod = Math.max(...highestResultsInStage.map(result => result.statsPeriod));
          
          // 扩展搜索范围，确保不遗漏相邻区域
          currentStart = Math.max(20, minStatsPeriod - expansion);
          currentEnd = Math.min(totalPeriods, maxStatsPeriod + expansion);
        }
        
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          break;
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
      
      // 检查是否需要终止回测
      if (isBacktestStopped) {
        detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">回测已终止</td></tr>';
      } else {
        // 更新进度
        await updateProgress('搜索完成，正在获取后区推荐买号..', 85, '获取后区推荐买号');
        currentStep++;
        
        // 为每个结果获取后区推荐买号
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
            `正在获取统计期${result.statsPeriod}期，${methodName}方法的后区推荐买号..`, 
            buyProgress, 
            `处理结果 ${i + 1}/${allResults.length}`
          );
          
          result.backBuyNumbers = await huo_qu_hou_qu_tui_jian_mai_hao(result.statsPeriod, result.backtestMethod);
        }
        
        // 检查是否需要终止回测
        if (isBacktestStopped) {
          detailResults.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff0000;">回测已终止</td></tr>';
        } else {
          // 更新进度
          await updateProgress(`找到 ${allResults.length} 个平均率最高的统计期，正在渲染结果...`, 98, '渲染结果');
          currentStep++;
          
          // 渲染详情数据，传递所有结果和下一期期号
          await renderDetailDataNewestBack(allResults, nextPeriod);
          
          // 更新进度
          await updateProgress('搜索完成，正在隐藏进度条...', 100, '完成');
        }
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

  // 总回测执行函数
  async function performAllBacktests() {
    // 显示总回测进度条
    totalProgress.style.display = 'block';
    totalProgressText.textContent = '开始总回测..';
    totalProgressBar.style.width = '0%';
    totalProgressPercentage.textContent = '0%';
    totalCurrentPhase.textContent = '正在准备...';
    
    // 隐藏开始回测按钮，显示终止回测按钮
    startAllBacktestBtn.style.display = 'none';
    stopAllBacktestBtn.style.display = 'inline-block';
    
    // 重置终止标志
    isStopped = false;
    
    // 定义回测任务列表
    const backtestTasks = [
      { name: '最新一期', function: performSearchNewestBack },
      { name: '倒数2期', function: performSearchSecondLastBack },
      { name: '倒数3期', function: performSearchThirdLastBack },
      { name: '倒数4期', function: performSearchFourthLastBack },
      { name: '倒数5期', function: performSearchFifthLastBack },
      { name: '近两期', function: performSearchNearTwoPeriodsBack }
    ];
    
    const totalTasks = backtestTasks.length;
    
    try {
      // 依次执行每个回测任务
      for (let i = 0; i < totalTasks; i++) {
        // 检查是否需要终止回测
        if (isStopped) {
          totalProgressText.textContent = '总回测已终止';
          totalProgressBar.style.width = '100%';
          totalProgressPercentage.textContent = '100%';
          totalCurrentPhase.textContent = '回测终止';
          break;
        }
        
        const task = backtestTasks[i];
        const progress = (i / totalTasks) * 100;
        
        // 更新总回测进度
        totalProgressText.textContent = `正在执行${task.name}回测..`;
        totalProgressBar.style.width = `${progress}%`;
        totalProgressPercentage.textContent = `${Math.round(progress)}%`;
        totalCurrentPhase.textContent = `执行任务 ${i + 1}/${totalTasks}：${task.name}`;
        
        // 执行回测任务
        await task.function();
      }
      
      // 检查是否需要终止回测
      if (!isStopped) {
        // 所有回测任务执行完成
        totalProgressText.textContent = '总回测完成';
        totalProgressBar.style.width = '100%';
        totalProgressPercentage.textContent = '100%';
        totalCurrentPhase.textContent = '回测完成';
      }
    } catch (error) {
      console.error('总回测失败:', error);
      totalProgressText.textContent = '总回测失败';
      totalProgressBar.style.width = '100%';
      totalProgressPercentage.textContent = '100%';
      totalCurrentPhase.textContent = '回测失败';
    } finally {
      // 隐藏总回测进度条
      setTimeout(() => {
        totalProgress.style.display = 'none';
        // 恢复按钮状态
        startAllBacktestBtn.style.display = 'inline-block';
        stopAllBacktestBtn.style.display = 'none';
        // 重置终止标志
        isStopped = false;
      }, 1000);
    }
  }

  // 总回测终止函数
  function stopAllBacktests() {
    isStopped = true;
    totalProgressText.textContent = '总回测已终止';
    totalProgressBar.style.width = '100%';
    totalProgressPercentage.textContent = '100%';
    totalCurrentPhase.textContent = '回测终止';
  }

  // 主函数，页面初始化时调用
  async function main() {
    // 获取最新开奖信息
    const latestDraw = await huo_qu_zui_xin_kai_jiang();
    if (latestDraw) {
      // 更新最新开奖信息卡片
      renderDrawInfo('latestDrawInfo', latestDraw, true);
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
    
    // 为最新一期两球组合后区平均率最高统计期详情添加事件监听器
    if (startBacktestBtnNewestBack) {
      startBacktestBtnNewestBack.addEventListener('click', performSearchNewestBack);
    }
    
    // 为倒数2期两球组合后区平均率最高统计期详情添加事件监听器
    if (startBacktestBtnSecondLastBack) {
      startBacktestBtnSecondLastBack.addEventListener('click', performSearchSecondLastBack);
    }
    
    // 为倒数3期两球组合后区平均率最高统计期详情添加事件监听器
    if (startBacktestBtnThirdLastBack) {
      startBacktestBtnThirdLastBack.addEventListener('click', performSearchThirdLastBack);
    }
    
    // 为倒数4期两球组合后区平均率最高统计期详情添加事件监听器
    if (startBacktestBtnFourthLastBack) {
      startBacktestBtnFourthLastBack.addEventListener('click', performSearchFourthLastBack);
    }
    
    // 为倒数5期两球组合后区平均率最高统计期详情添加事件监听器
    if (startBacktestBtnFifthLastBack) {
      startBacktestBtnFifthLastBack.addEventListener('click', performSearchFifthLastBack);
    }
    
    // 为近两期两球组合后区平均率最高统计期详情添加事件监听器
    if (startBacktestBtnNearTwoPeriodsBack) {
      startBacktestBtnNearTwoPeriodsBack.addEventListener('click', performSearchNearTwoPeriodsBack);
    }
    
    // 为总回测控制按钮添加事件监听器
    if (startAllBacktestBtn) {
      startAllBacktestBtn.addEventListener('click', performAllBacktests);
    }
    
    // 为总回测终止按钮添加事件监听器
    if (stopAllBacktestBtn) {
      stopAllBacktestBtn.addEventListener('click', stopAllBacktests);
    }
  }
});