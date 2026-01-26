const fs = require('fs');
const path = require('path');

// 提取HTML文件中的JavaScript代码
function extractJavaScript(htmlContent) {
  // 使用正则表达式匹配<script>标签中的内容
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/g;
  let matches;
  const scripts = [];
  
  while ((matches = scriptRegex.exec(htmlContent)) !== null) {
    scripts.push(matches[1]);
  }
  
  return scripts;
}

// 检查JavaScript代码的语法
function checkJavaScriptSyntax(jsCode, fileName) {
  try {
    // 使用Node.js的vm模块检查语法
    const vm = require('vm');
    vm.createScript(jsCode);
    return { success: true, fileName };
  } catch (error) {
    return { success: false, fileName, error: error.message, line: error.lineNumber };
  }
}

// 读取HTML文件并检查其JavaScript语法
function checkHTMLFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const scripts = extractJavaScript(content);
    
    const results = scripts.map((script, index) => {
      return checkJavaScriptSyntax(script, `${filePath} (script #${index + 1})`);
    });
    
    return results;
  } catch (error) {
    return [{ success: false, fileName: filePath, error: `读取文件失败: ${error.message}` }];
  }
}

// 获取所有HTML文件
function getAllHTMLFiles(dirPath) {
  const files = [];
  
  function traverse(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.name.endsWith('.html')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dirPath);
  return files;
}

// 主函数
function main() {
  console.log('开始检查HTML文件中的JavaScript语法...');
  
  const htmlFiles = getAllHTMLFiles('d:\\中啦\\caishen4\\qian');
  console.log(`共找到 ${htmlFiles.length} 个HTML文件`);
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];
  
  for (const filePath of htmlFiles) {
    console.log(`\n检查文件: ${filePath}`);
    
    const results = checkHTMLFile(filePath);
    
    for (const result of results) {
      if (result.success) {
        console.log(`  ✓ ${result.fileName}: 语法正确`);
        successCount++;
      } else {
        console.error(`  ✗ ${result.fileName}: 语法错误，${result.error}（行号: ${result.line}）`);
        errorCount++;
        errors.push(result);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('语法检查完成!');
  console.log(`总检查项: ${successCount + errorCount}`);
  console.log(`语法正确: ${successCount}`);
  console.log(`语法错误: ${errorCount}`);
  
  if (errorCount > 0) {
    console.log('\n错误详情:');
    errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.fileName}: ${error.error}（行号: ${error.line}）`);
    });
  }
  
  return errorCount === 0;
}

// 执行主函数
if (require.main === module) {
  const success = main();
  process.exit(success ? 0 : 1);
}

module.exports = { checkHTMLFile, getAllHTMLFiles };
