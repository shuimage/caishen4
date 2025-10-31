// 模拟数据
const mockData = {
  // 首页数据
  indexData: {
    recentDraws: [
      {
        period: '25121',
        week: '6',
        firstZone: ['02', '03', '08', '13', '21'],
        secondZone: [],
        thirdZone: [],
        lastZone: ['07', '12'],
        sum: '47',
        span: '19',
        zoneRatio: '3:2:0',
        oddEvenRatio: '3:2'
      },
      {
        period: '25120',
        week: '3',
        firstZone: ['11', '13'],
        secondZone: ['22', '26'],
        thirdZone: ['35'],
        lastZone: ['02', '08'],
        sum: '107',
        span: '24',
        zoneRatio: '1:2:2',
        oddEvenRatio: '3:2'
      },
      {
        period: '25119',
        week: '1',
        firstZone: ['08'],
        secondZone: ['15'],
        thirdZone: ['27', '29', '31'],
        lastZone: ['01', '07'],
        sum: '110',
        span: '23',
        zoneRatio: '1:1:3',
        oddEvenRatio: '4:1'
      },
      {
        period: '25118',
        week: '6',
        firstZone: ['02'],
        secondZone: ['08', '09', '12'],
        thirdZone: ['21'],
        lastZone: ['04', '05'],
        sum: '52',
        span: '19',
        zoneRatio: '4:1:0',
        oddEvenRatio: '2:3'
      },
      {
        period: '25117',
        week: '3',
        firstZone: ['05', '10'],
        secondZone: ['18', '21'],
        thirdZone: ['29'],
        lastZone: ['05', '07'],
        sum: '83',
        span: '24',
        zoneRatio: '2:2:1',
        oddEvenRatio: '3:2'
      },
      {
        period: '25116',
        week: '1',
        firstZone: ['02', '06'],
        secondZone: ['16', '22'],
        thirdZone: ['29'],
        lastZone: ['08', '12'],
        sum: '75',
        span: '27',
        zoneRatio: '2:2:1',
        oddEvenRatio: '1:4'
      },
      {
        period: '25115',
        week: '6',
        firstZone: ['03'],
        secondZone: ['12', '14'],
        thirdZone: ['21', '35'],
        lastZone: ['01', '05'],
        sum: '85',
        span: '32',
        zoneRatio: '2:2:1',
        oddEvenRatio: '3:2'
      },
      {
        period: '25114',
        week: '3',
        firstZone: ['03', '08', '09'],
        secondZone: ['12', '16'],
        thirdZone: [],
        lastZone: ['01', '05'],
        sum: '48',
        span: '13',
        zoneRatio: '4:1:0',
        oddEvenRatio: '2:3'
      },
      {
        period: '25113',
        week: '1',
        firstZone: ['01'],
        secondZone: ['14', '18'],
        thirdZone: ['28', '35'],
        lastZone: ['02', '03'],
        sum: '96',
        span: '34',
        zoneRatio: '1:2:2',
        oddEvenRatio: '2:3'
      },
      {
        period: '25112',
        week: '1',
        firstZone: ['03', '04'],
        secondZone: ['21', '23', '24'],
        thirdZone: [],
        lastZone: ['09', '12'],
        sum: '75',
        span: '21',
        zoneRatio: '2:3:0',
        oddEvenRatio: '3:2'
      }
    ]
  },
  
  // 双杀分析数据
  killAnalysisData: {
    latestDraw: {
      period: '25120',
      drawDate: '2025-10-22',
      firstZoneNumbers: ['11', '13', '22', '26', '35'],
      lastZoneNumbers: ['02', '08']
    },
    recommendedNumbers: {
      firstZone: ['16', '20', '07', '12'],
      lastZone: ['02', '08', '10', '12']
    },
    firstZoneCombinations: [
      { combination: '11-13', count: 3, stats: [] },
      { combination: '11-22', count: 2, stats: [] },
      { combination: '11-26', count: 2, stats: [] },
      { combination: '11-35', count: 1, stats: [] },
      { combination: '13-22', count: 0, stats: [] },
      { combination: '13-26', count: 2, stats: [] },
      { combination: '13-35', count: 0, stats: [] },
      { combination: '22-26', count: 1, stats: [] },
      { combination: '22-35', count: 0, stats: [] },
      { combination: '26-35', count: 1, stats: [] }
    ],
    lastZoneCombinations: [
      { combination: '02-08', count: 5, stats: [] }
    ]
  },
  
  // 组合详情数据
  combinationDetailData: {
    latestDraw: {
      period: '25120',
      drawDate: '2025-10-22',
      firstZoneNumbers: ['11', '13', '22', '26', '35'],
      lastZoneNumbers: ['02', '08']
    },
    combinationInfo: {
      balls: '11和13',
      statPeriod: 100,
      nextAppearBall: '2',
      appearCount: 1
    },
    records: [
      {
        id: 1,
        combinationPeriod: '25011',
        firstZoneDrawNumbers: '11 13 20 25 29',
        nextPeriod: '25012',
        nextFirstZoneDrawNumbers: '2 5 8 10 30'
      }
    ]
  }
};

// 导出数据
window.mockData = mockData;

// 页面跳转函数
function goToKillAnalysis() {
  window.location.href = 'sha_hao_fen_xi.html';
}

// 获取lottery_results表的总条数
async function huo_qu_lottery_results_total() {
  try {
    const response = await fetch('http://localhost:8085/huo_qu_lottery_results_total');
    const result = await response.json();
    
    if (result.success) {
      return result.total;
    } else {
      alert('接口失败');
      return null;
    }
  } catch (error) {
    console.error('获取总条数失败:', error);
    alert('接口失败');
    return null;
  }
}

async function goToCombinationDetail(combination, type = 'first', statsRange = '100') {
  // 保存选中的组合信息到localStorage
  localStorage.setItem('selectedCombination', combination);
  localStorage.setItem('combinationType', type);
  localStorage.setItem('statsRange', statsRange);
  
  // 如果统计范围是'all'，获取lottery_results表的总条数
  if (statsRange === 'all') {
    const totalCount = await huo_qu_lottery_results_total();
    if (totalCount !== null) {
      statsRange = totalCount.toString();
    }
  }
  
  // 跳转到详情页，传递所有必要参数
  window.location.href = `zu_he_xiang_qing.html?combination=${combination}&type=${type}&stats_range=${statsRange}`;
}

function goBack() {
  window.history.back();
}

// 获取最新大乐透数据
async function fetchLatestLotteryData() {
    try {
        // 从后端API获取最新数据
        console.log('正在请求数据...');
        const response = await fetch('http://localhost:18889/getLatestData');
        
        // 检查响应是否成功
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // 解析JSON响应
        const data = await response.json();
        
        // 检查返回的数据结构是否正确
        if (data.success && Array.isArray(data.latestResults) && data.latestResults.length > 0) {
            console.log('成功获取数据:', data.latestResults.length, '条');
            console.log('数据来源:', data.fromMock ? '模拟数据' : '真实数据');
            return data.latestResults;
        } else if (Array.isArray(data.latestResults) && data.latestResults.length > 0) {
            // 即使success为false，只要有数据也返回
            console.log('获取到数据但服务器报告错误，返回可用数据');
            return data.latestResults;
        } else {
            throw new Error('Invalid data structure received from server');
        }
    } catch (error) {
        console.error('获取数据失败:', error);
        
        // 当请求失败时，返回默认的模拟数据，确保页面能正常显示
        console.log('网络请求失败，使用默认模拟数据...');
        return getDefaultLotteryData();
    }
}

/**
 * 获取默认的大乐透模拟数据，用于网络请求失败时
 * @returns {Array} 默认的模拟数据数组
 */
function getDefaultLotteryData() {
    console.log('使用默认模拟数据');
    return [
        {
            issue: '25121',
            drawDate: '2025-10-25',
            weekday: '6',
            redBalls: ['02', '03', '08', '13', '21'],
            blueBalls: ['07', '12'],
            sum: '47',
            span: '19',
            intervalRatio: '3:2:0',
            parityRatio: '3:2'
        },
        {
            issue: '25120',
            drawDate: '2025-10-22',
            weekday: '3',
            redBalls: ['11', '13', '22', '26', '35'],
            blueBalls: ['02', '08'],
            sum: '107',
            span: '24',
            intervalRatio: '1:2:2',
            parityRatio: '3:2'
        },
        {
            issue: '25119',
            drawDate: '2025-10-20',
            weekday: '1',
            redBalls: ['08', '15', '27', '29', '31'],
            blueBalls: ['01', '07'],
            sum: '110',
            span: '23',
            intervalRatio: '1:1:3',
            parityRatio: '4:1'
        },
        {
            issue: '25118',
            drawDate: '2025-10-18',
            weekday: '6',
            redBalls: ['02', '08', '09', '12', '21'],
            blueBalls: ['04', '05'],
            sum: '52',
            span: '19',
            intervalRatio: '4:1:0',
            parityRatio: '2:3'
        },
        {
            issue: '25117',
            drawDate: '2025-10-15',
            weekday: '3',
            redBalls: ['05', '10', '18', '21', '29'],
            blueBalls: ['05', '07'],
            sum: '83',
            span: '24',
            intervalRatio: '2:2:1',
            parityRatio: '3:2'
        }
    ];
}