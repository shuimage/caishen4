const fs = require('fs');
const path = require('path');

// 读取HTML文件
const htmlPath = path.join(__dirname, 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// 提取script标签内容
const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/g;
let match;
let scriptIndex = 0;
let secondScriptContent = '';

while ((match = scriptRegex.exec(htmlContent)) !== null) {
  scriptIndex++;
  if (scriptIndex === 2) {
    secondScriptContent = match[1];
    break;
  }
}

// 保存第二个script标签的内容到单独的文件
const jsPath = path.join(__dirname, 'second_script.js');
fs.writeFileSync(jsPath, secondScriptContent, 'utf8');

console.log(`已将第二个script标签的内容保存到: ${jsPath}`);
