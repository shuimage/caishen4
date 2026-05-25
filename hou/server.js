const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const https = require('https');

const app = express();
const PORT = 18889;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// AI分析代理接口 - 解决CORS跨域问题
app.post('/ai_analysis', async (req, res) => {
  const { data } = req.body;
  
  if (!data || !Array.isArray(data)) {
    return res.status(400).json({ success: false, message: '数据格式不正确' });
  }
  
  const apiKey = 'sk-sp-6370558950ce4ffa90ddb5667a56eb6b';
  const baseUrl = 'https://coding.dashscope.aliyuncs.com/v1';
  const model = 'qwen3.6-plus';
  
  // 构建提示词
  const prompt = `
    你是一位彩票数据分析专家。请根据以下回测结果数据，使用统计学、概率学等数学算法，分析并预测即将开奖的下一期的5个前区球号。
    
    数据说明：
    - period: 回测期号
    - backtestMethod: 回测方法（如最新一期两球组合、倒数2期两球组合等）
    - backtestPeriod: 回测期数（如10期、20期、30期、50期）
    - resultRank: 回测结果排名（第1名或最后1名）
    - resultValue: 预测的球号
    - nextPeriod: 下期期号
    - nextFrontNumbers: 下期实际开奖号
    - isCorrect: 是否预测正确
    - correctBalls: 预测正确的球号
    - correctRate: 正确率
    
    回测数据：
    ${JSON.stringify(data, null, 2)}
    
    请基于以上数据，通过统计分析：
    1. 分析各球号出现的频率和概率分布
    2. 分析不同回测方法的准确率
    3. 找出最可能出现的5个球号
    4. 为每个推荐的球号提供详细的推荐理由和数学依据
    
    请以结构化的JSON格式输出，包含以下字段：
    {
        "recommendedBalls": [球号数组，按推荐优先级排序，必须是5个球号],
        "analysis": "整体分析说明",
        "ballReasons": {
            "球号1": "详细的推荐理由和数学依据",
            "球号2": "详细的推荐理由和数学依据",
            "球号3": "详细的推荐理由和数学依据",
            "球号4": "详细的推荐理由和数学依据",
            "球号5": "详细的推荐理由和数学依据"
        },
        "confidence": "整体置信度评估（高/中/低）"
    }
    
    注意：ballReasons中每个球号都必须给出推荐的详细证据，包括统计数据支持。输出必须是有效的JSON格式。
  `.trim();
  
  const requestData = JSON.stringify({
    model: model,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: 4096,
    temperature: 0.7
  });
  
  const options = {
    hostname: 'coding.dashscope.aliyuncs.com',
    port: 443,
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Content-Length': Buffer.byteLength(requestData)
    }
  };
  
  const proxyReq = https.request(options, (proxyRes) => {
    let responseData = '';
    
    proxyRes.on('data', (chunk) => {
      responseData += chunk;
    });
    
    proxyRes.on('end', () => {
      try {
        const parsedData = JSON.parse(responseData);
        const content = parsedData.choices?.[0]?.message?.content || '';
        
        // 尝试提取JSON部分
        let jsonContent = content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonContent = jsonMatch[0];
        }
        
        // 验证是否为有效JSON
        try {
          JSON.parse(jsonContent);
          res.json({ success: true, data: jsonContent });
        } catch (e) {
          // 如果不是有效JSON，返回原始内容
          res.json({ success: true, data: content });
        }
      } catch (error) {
        res.status(500).json({ success: false, message: 'AI响应解析失败', error: error.message });
      }
    });
  });
  
  proxyReq.on('error', (error) => {
    console.error('AI API请求失败:', error);
    res.status(500).json({ success: false, message: 'AI API请求失败', error: error.message });
  });
  
  proxyReq.write(requestData);
  proxyReq.end();
});

// 获取所有路由文件
const routesPath = __dirname;
const jsFiles = fs.readdirSync(routesPath).filter(f => f.endsWith('.js') && f !== 'server.js');

console.log(`找到 ${jsFiles.length} 个路由文件`);

// 动态加载所有路由
let loadedRoutes = 0;
jsFiles.forEach(file => {
  try {
    const route = require(path.join(routesPath, file));
    if (route && (route.get || route.post || route.router)) {
      // 如果是 router 对象，直接挂载
      const routeName = file.replace('.js', '').replace(/_/g, '/');
      app.use(`/${routeName}`, route);
      loadedRoutes++;
      console.log(`  ✅ 加载: /${routeName}`);
    }
  } catch (err) {
    console.log(`  ❌ 加载失败: ${file} - ${err.message}`);
  }
});

console.log(`\n成功加载 ${loadedRoutes} 个路由\n`);

// 健康检查路由
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: '后端服务运行正常',
    routes: loadedRoutes
  });
});

// 列出所有可用 API
app.get('/api/list', (req, res) => {
  const routes = jsFiles.map(f => `/${f.replace('.js', '').replace(/_/g, '/')}`);
  res.json({ 
    total: routes.length,
    routes: routes 
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器错误: ' + err.message });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n========================================`);
  console.log(`✅ 后端服务器运行在 http://0.0.0.0:${PORT}`);
  console.log(`📝 健康检查: http://localhost:${PORT}/health`);
  console.log(`📋 API 列表: http://localhost:${PORT}/api/list`);
  console.log(`========================================\n`);
});
