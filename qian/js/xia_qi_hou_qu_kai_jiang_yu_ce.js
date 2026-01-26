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
    try {
      // 调用现有的sql_zui_xin_yi_qi接口获取最新开奖信息
      const response = await fetch('http://localhost:18889/sql_zui_xin_yi_qi');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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
  async function huo_qu_dao_shu_2_qi() {
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
  async function huo_qu_dao_shu_3_qi() {
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

  // 主函数，页面初始化时调用
  async function main() {
    // 获取最新开奖信息
    const latestDraw = await huo_qu_zui_xin_kai_jiang();
    if (latestDraw) {
      // 更新最新开奖信息
      const currentPeriod = document.querySelector('.current-period');
      if (currentPeriod) {
        currentPeriod.textContent = latestDraw.period;
      }
      
      // 更新最新开奖信息卡片
      if (latestDrawInfo) {
        latestDrawInfo.innerHTML = `
          <div style="font-weight: bold; color: #DF2220; font-size: 16px;">
            期号: ${latestDraw.period}
          </div>
          <div>
            日期: ${latestDraw.drawDate}
          </div>
          <div>
            前区: ${latestDraw.firstZoneNumbers.map(num => `<span class="red-ball">${num}</span>`).join(' ')}
          </div>
          <div>
            后区: ${latestDraw.lastZoneNumbers.map(num => `<span class="blue-ball">${num}</span>`).join(' ')}
          </div>
        `;
      }
    }
    
    // 其他卡片暂时显示加载中
    if (secondLastDrawInfo) {
      secondLastDrawInfo.innerHTML = '<div style="text-align: center; padding: 20px;">加载中..</div>';
    }
    if (thirdLastDrawInfo) {
      thirdLastDrawInfo.innerHTML = '<div style="text-align: center; padding: 20px;">加载中..</div>';
    }
    if (fourthLastDrawInfo) {
      fourthLastDrawInfo.innerHTML = '<div style="text-align: center; padding: 20px;">加载中..</div>';
    }
    if (fifthLastDrawInfo) {
      fifthLastDrawInfo.innerHTML = '<div style="text-align: center; padding: 20px;">加载中..</div>';
    }
  }
});