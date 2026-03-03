// 导航栏数据
const navigationData = [
  {
    icon: '✕',
    text: '最新1期两球组合分析',
    link: 'sha_hao_fen_xi.html'
  },
  {
    icon: '✖️',
    text: '倒数2期两球组合分析',
    link: 'dao_shu_2_qi_liang_qiu_zu_he.html'
  },
  {
    icon: '✗',
    text: '倒数3期两球组合分析',
    link: 'dao_shu_3_qi_liang_qiu_zu_he.html'
  },
  {
    icon: '✘',
    text: '倒数4期两球组合分析',
    link: 'dao_shu_4_qi_liang_qiu_zu_he.html'
  },
  {
    icon: '✙',
    text: '倒数5期两球组合分析',
    link: 'dao_shu_5_qi_liang_qiu_zu_he.html'
  },
  {
    icon: '✚',
    text: '倒数6期两球组合分析',
    link: 'dao_shu_6_qi_liang_qiu_zu_he.html'
  },
  {
    icon: '✛',
    text: '倒数7期两球组合分析',
    link: 'dao_shu_7_qi_liang_qiu_zu_he.html'
  },
  {
    icon: '✛',
    text: '倒数8期两球组合分析',
    link: 'dao_shu_8_qi_liang_qiu_zu_he.html'
  },
  {
    icon: '✛',
    text: '倒数9期两球组合分析',
    link: 'dao_shu_9_qi_liang_qiu_zu_he.html'
  },
  {
    icon: '🔄',
    text: '倒数X期两球组合分析',
    link: 'dao_shu_x_qi_liang_qiu_zu_he.html'
  },
  {
    icon: '🔄',
    text: '近两期两球组合分析',
    link: 'jin_liang_qi_liang_qiu_zu_he.html'
  },
  {
    icon: '🔺',
    text: '最新1期三球组合分析',
    link: 'san_qiu_fen_xi.html'
  },
  {
    icon: '🔻',
    text: '倒数2期三球组合分析',
    link: 'dao_shu_2_qi_san_qiu_zu_he.html'
  },
  {
    icon: '🔽',
    text: '倒数3期三球组合分析',
    link: 'dao_shu_3_qi_san_qiu_zu_he.html'
  },
  {
    icon: '🔮',
    text: '幻圆九转连环图',
    link: 'huan_yuan_jiu_zhuan_lian_huan_tu.html'
  },
 {
    icon: '🔮',
    text: '下期前区开奖预测',  // 原来是"下期开奖预测"
    link: 'xia_qi_kai_jiang_yu_ce.html'
  },
  {
    icon: '🔮',
    text: '下期后区开奖预测',
    link: 'xia_qi_hou_qu_kai_jiang_yu_ce.html'
  },
  {
    icon: '🔮',
    text: '下期前区开奖必杀',
    link: 'xia_qi_qian_qu_kai_jiang_bi_sha.html'
  },
  {
    icon: '🔮',
    text: '下期后区开奖必杀',
    link: 'xia_qi_hou_qu_kai_jiang_bi_sha.html'
  }
];

// 渲染导航栏函数
function renderNavigation() {
  const navContainer = document.querySelector('.main-nav ul');
  if (!navContainer) return;
  
  // 获取当前页面文件名
  const currentPage = window.location.pathname.split('/').pop();
  
  navContainer.innerHTML = '';
  
  navigationData.forEach(item => {
    const li = document.createElement('li');
    li.className = `nav-item ${item.link === currentPage ? 'active' : ''}`;
    
    li.innerHTML = `
      <span class="nav-icon">${item.icon}</span>
      <a href="${item.link}" style="text-decoration: none; color: inherit;">${item.text}</a>
    `;
    
    navContainer.appendChild(li);
  });
}

// 页面加载时自动渲染导航栏
window.addEventListener('load', renderNavigation);
