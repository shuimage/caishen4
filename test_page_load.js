const http = require('http');
const fs = require('fs');
const path = require('path');

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

// 简单检查HTML文件是否包含明显的语法错误
function checkHTMLFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 检查script标签是否正确闭合
    const scriptTags = (content.match(/<script/g) || []).length;
    const closeScriptTags = (content.match(/<\/script>/g) || []).length;
    
    if (scriptTags !== closeScriptTags) {
      return { success: false, fileName: filePath, error: `Script标签不匹配，打开: ${scriptTags}，关闭: ${closeScriptTags}` };
    }
    
    // 检查HTML标签是否正确闭合（简单检查）
    const htmlTags = (content.match(/<[a-zA-Z][^>]*>/g) || []).length;
    const closeHtmlTags = (content.match(/<\/[a-zA-Z]+>/g) || []).length;
    
    // 允许一定的误差，因为有些标签是自闭合的
    if (Math.abs(htmlTags - closeHtmlTags) > 10) {
      return { success: false, fileName: filePath, error: `HTML标签可能不匹配，打开: ${htmlTags}，关闭: ${closeHtmlTags}` };
    }
    
    return { success: true, fileName: filePath };
  } catch (error) {
    return { success: false, fileName: filePath, error: `读取文件失败: ${error.message}` };
  }
}

// 主函数
function main() {
  console.log('开始检查HTML文件...');
  
  const htmlFiles = getAllHTMLFiles('d:\\中啦\\caishen4\\qian');
  console.log(`共找到 ${htmlFiles.length} 个HTML文件`);
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];
  
  for (const filePath of htmlFiles) {
    const result = checkHTMLFile(filePath);
    
    if (result.success) {
      console.log(`✓ ${filePath}: 文件结构正常`);
      successCount++;
    } else {
      console.error(`✗ ${filePath}: ${result.error}`);
      errorCount++;
      errors.push(result);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('HTML文件检查完成!');
  console.log(`总文件数: ${htmlFiles.length}`);
  console.log(`结构正常: ${successCount}`);
  console.log(`可能有问题: ${errorCount}`);
  
  if (errorCount > 0) {
    console.log('\n问题详情:');
    errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.fileName}: ${error.error}`);
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
