// 简单的API测试脚本
import('node-fetch').then(fetchModule => {
  const fetch = fetchModule.default;
  
  async function testAPI() {
    try {
      console.log('正在测试API调用...');
      
      // 测试获取最新开奖信息接口
      const latestResult = await fetch('http://localhost:18889/sql_zui_xin_yi_qi');
      const latestData = await latestResult.json();
      console.log('最新开奖信息API测试结果:', latestData);
      
      // 测试获取推荐杀号接口
      const killNumbersResult = await fetch('http://localhost:18889/huo_qu_qian_qu_tui_jian_sha_hao');
      const killNumbersData = await killNumbersResult.json();
      console.log('推荐杀号API测试结果:', killNumbersData);
      
      console.log('\n测试完成！所有API调用均指向统一服务器 http://localhost:18889');
    } catch (error) {
      console.error('API测试失败:', error.message);
    }
  }
  
  testAPI();
});