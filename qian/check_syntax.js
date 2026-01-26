const fs = require('fs');
const path = require('path');

// 读取HTML文件
const htmlPath = path.join(__dirname, 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// 提取script标签内容
const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/g;
let match;
let scriptIndex = 0;

while ((match = scriptRegex.exec(htmlContent)) !== null) {
  const scriptContent = match[1];
  scriptIndex++;
  
  console.log(`\n=== 检查第 ${scriptIndex} 个script标签 ===`);
  
  // 尝试解析JavaScript，捕获语法错误
  try {
    // 使用Function构造函数来检查语法，这是一个简单的语法检查方法
    new Function(scriptContent);
    console.log('✅ 语法正确');
  } catch (error) {
    console.log('❌ 语法错误:', error.message);
    
    // 尝试定位错误位置
    const errorLine = error.stack.match(/<anonymous>:([0-9]+):([0-9]+)/);
    if (errorLine) {
      const lineNumber = parseInt(errorLine[1]);
      const columnNumber = parseInt(errorLine[2]);
      
      console.log(`   错误位置: 行 ${lineNumber}, 列 ${columnNumber}`);
      
      // 显示错误附近的代码
      const lines = scriptContent.split('\n');
      const startLine = Math.max(0, lineNumber - 3);
      const endLine = Math.min(lines.length - 1, lineNumber + 3);
      
      console.log('   错误附近的代码:');
      for (let i = startLine; i <= endLine; i++) {
        const isErrorLine = i === lineNumber - 1;
        const lineNum = i + 1;
        console.log(`   ${isErrorLine ? '👉' : '  '} ${lineNum}: ${lines[i]}`);
        
        // 显示错误列位置
        if (isErrorLine) {
          console.log(`   ${' '.repeat(6 + lineNum.toString().length)}${' '.repeat(columnNumber)}^`);
        }
      }
    }
  }
}
