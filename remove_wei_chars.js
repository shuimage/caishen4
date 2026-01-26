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

// 移除文件中的所有"围"字符
function removeWeiChars(filePath) {
  try {
    // 使用utf8编码读取文件
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 保存原始内容，用于比较
    const originalContent = content;
    
    // 移除所有"围"字符
    const cleanedContent = content.replace(/围/g, '');
    
    // 如果内容有变化，写入文件
    if (cleanedContent !== originalContent) {
      fs.writeFileSync(filePath, cleanedContent, 'utf8');
      console.log(`修复成功: ${filePath}`);
      return true;
    } else {
      console.log(`无需修复: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`修复失败: ${filePath}，错误: ${error.message}`);
    return false;
  }
}

// 主函数
function main() {
  console.log('开始移除HTML文件中的"围"字符...');
  
  const htmlFiles = getAllHTMLFiles('d:\\中啦\\caishen4\\qian');
  console.log(`共需处理 ${htmlFiles.length} 个HTML文件`);
  
  let successCount = 0;
  let failCount = 0;
  
  // 逐个处理文件
  for (const filePath of htmlFiles) {
    if (removeWeiChars(filePath)) {
      successCount++;
    } else {
      failCount++;
    }
  }
  
  console.log('\n移除完成!');
  console.log(`成功处理: ${successCount} 个文件`);
  console.log(`处理失败: ${failCount} 个文件`);
}

// 执行主函数
main();
