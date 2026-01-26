const fs = require('fs');

// 读取HTML文件内容
const content = fs.readFileSync('index.html', 'utf8');

// 提取script标签内容
const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/);

if (scriptMatch && scriptMatch[1]) {
  const scriptContent = scriptMatch[1];
  console.log('JavaScript代码总长度:', scriptContent.length);
  
  // 尝试分段执行，找出具体错误位置
  let currentPosition = 0;
  const chunkSize = 1000;
  
  while (currentPosition < scriptContent.length) {
    const endPosition = Math.min(currentPosition + chunkSize, scriptContent.length);
    const chunk = scriptContent.substring(0, endPosition);
    
    try {
      new Function(chunk);
      console.log(`✓ 前${endPosition}字符语法正常`);
      currentPosition = endPosition;
    } catch (error) {
      console.error(`✗ 在前${endPosition}字符处发现语法错误:`);
      console.error(`  错误信息: ${error.message}`);
      
      // 显示错误位置附近的代码
      const lines = chunk.split('\n');
      const errorLine = error.stack.split(':', 3)[2] || lines.length;
      const startLine = Math.max(0, parseInt(errorLine) - 10);
      const endLine = Math.min(lines.length, parseInt(errorLine) + 5);
      
      console.error(`  错误位置附近的代码:`);
      for (let i = startLine; i < endLine; i++) {
        const lineNumber = i + 1;
        const marker = lineNumber === parseInt(errorLine) ? '>>> ' : '    ';
        console.error(`${marker}${lineNumber}: ${lines[i]}`);
      }
      break;
    }
  }
} else {
  console.error('没有找到script标签内容');
}