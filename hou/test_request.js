const http = require('http');

const options = {
  hostname: 'localhost',
  port: 18889,
  path: '/zuhe/dao_shu_6_qi_liang_qiu_zu_he_xiang_qing',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(JSON.stringify({
      latest_period: '25120',
      type: 'front',
      combinations: ['34-35-09'],
      stats_range: 2000,
      target_ball: '09'
    }))
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Response:', data);
    const response = JSON.parse(data);
    console.log('\nNumber of records:', response.data ? response.data.length : 0);
    
    // 检查下下下下下下期开奖号码是否包含目标球
    if (response.data) {
      console.log('\nChecking target ball in next_next_next_next_next_draw_info:');
      const targetBall = '09';
      let count = 0;
      response.data.forEach((record, index) => {
        const nextDrawInfo = record.next_next_next_next_next_draw_info;
        if (nextDrawInfo && nextDrawInfo.includes(targetBall)) {
          count++;
          console.log(`Record ${index + 1}: ${record.period} -> ${record.next_next_next_next_next_period}: ${nextDrawInfo} (contains ${targetBall})`);
        }
      });
      console.log(`\nTotal records containing target ball ${targetBall}: ${count}`);
    }
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.write(JSON.stringify({
  latest_period: '25120',
  type: 'front',
  combinations: ['34-35-09'],
  stats_range: 2000,
  target_ball: '09'
}));

req.end();
