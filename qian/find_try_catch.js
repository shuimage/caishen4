const fs = require('fs');

// 读取HTML文件内容
const content = fs.readFileSync('index.html', 'utf8');

// 提取script标签内容
const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/);

if (scriptMatch && scriptMatch[1]) {
  const scriptContent = scriptMatch[1];
  
  // 查找所有try和catch/finally语句
  const tryPositions = [];
  const catchPositions = [];
  const finallyPositions = [];
  
  let tryIndex = scriptContent.indexOf('try {');
  while (tryIndex !== -1) {
    tryPositions.push(tryIndex);
    tryIndex = scriptContent.indexOf('try {', tryIndex + 5);
  }
  
  let catchIndex = scriptContent.indexOf('catch (');
  while (catchIndex !== -1) {
    catchPositions.push(catchIndex);
    catchIndex = scriptContent.indexOf('catch (', catchIndex + 7);
  }
  
  let finallyIndex = scriptContent.indexOf('finally {');
  while (finallyIndex !== -1) {
    finallyPositions.push(finallyIndex);
    finallyIndex = scriptContent.indexOf('finally {', finallyIndex + 9);
  }
  
  console.log('try语句数量:', tryPositions.length);
  console.log('catch语句数量:', catchPositions.length);
  console.log('finally语句数量:', finallyPositions.length);
  
  // 检查try-catch匹配情况
  if (tryPositions.length !== catchPositions.length + finallyPositions.length) {
    console.log('\n❌ 发现不匹配的try-catch/finally语句!');
    
    // 查看前2000字符的详细内容，包括行号
    const lines = scriptContent.substring(0, 2000).split('\n');
    console.log('\n前2000字符的详细内容(带行号):');
    for (let i = 0; i < lines.length; i++) {
      console.log(`${i + 1}: ${lines[i]}`);
    }
  } else {
    console.log('\n✓ try-catch/finally语句匹配');
  }
} else {
  console.error('没有找到script标签内容');
}