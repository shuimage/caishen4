// Redis配置文件 - 仅使用远程Redis服务器
const redis = require('redis');

// 创建Redis客户端，明确指定使用远程服务器
// 注意：此配置只连接远程Redis，不使用本地Redis
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || '39.96.219.67', // 固定使用远程Redis服务器IP
  port: process.env.REDIS_PORT || 6379 // 固定使用远程Redis服务器端口
});

// 处理连接错误
redisClient.on('error', (err) => {
  console.error('Redis连接错误:', err);
});

// 等待连接成功
redisClient.on('connect', () => {
  console.log('Redis连接成功');
});

// 连接到Redis
redisClient.connect();

// Redis缓存函数
async function cacheSet(key, value, expiry = 3600) {
  try {
    // 确保value是JSON字符串
    const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
    await redisClient.set(key, jsonValue, { EX: expiry });
    return true;
  } catch (error) {
    console.error('Redis缓存设置失败:', error);
    return false;
  }
}

// Redis获取缓存函数
async function cacheGet(key) {
  try {
    const value = await redisClient.get(key);
    if (value) {
      try {
        // 尝试解析JSON
        return JSON.parse(value);
      } catch (e) {
        // 如果不是JSON，直接返回字符串
        return value;
      }
    }
    return null;
  } catch (error) {
    console.error('Redis获取缓存失败:', error);
    return null;
  }
}

// Redis删除缓存函数
async function cacheDel(key) {
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Redis删除缓存失败:', error);
    return false;
  }
}

// 导出Redis客户端和缓存函数
module.exports = {
  redisClient,
  cacheSet,
  cacheGet,
  cacheDel
};