## 问题分析

在 `dao_shu_5_qi_liang_qiu_zu_he.html` 页面的"前区两球组合统计"卡片中，"组合号"字段出现了"NaN和NaN"的错误值。

### 问题根源

1. **数据处理问题**：后端在处理开奖号码时，可能将非数字字符包含在号码中。
2. **类型转换问题**：在 `processBalls` 函数中，将号码转换为字符串并补零后，又尝试转换回数字，但没有处理转换失败的情况。
3. **NaN 传播**：当号码转换失败产生 `NaN` 值后，在计算组合号时会导致 `Math.min` 和 `Math.max` 函数也返回 `NaN`。

## 修复方案

### 1. 修复后端 `processBalls` 函数

修改 `倒数5期两球组合前区.js` 文件中的 `processBalls` 函数，确保它只返回有效的数字字符串：

```javascript
function processBalls(balls) {
  if (!balls) return [];
  // 将球号字符串转换为数组并处理成标准格式
  if (typeof balls === 'string') {
    return balls.split(' ')
      .filter(ball => ball.trim() !== '')
      .map(ball => {
        // 移除非数字字符，只保留数字
        const cleanBall = ball.replace(/[^\d]/g, '');
        return cleanBall ? String(cleanBall).padStart(2, '0') : null;
      })
      .filter(Boolean); // 过滤掉null值
  } else if (Array.isArray(balls)) {
    return balls.map(ball => {
      // 移除非数字字符，只保留数字
      const cleanBall = String(ball).replace(/[^\d]/g, '');
      return cleanBall ? String(cleanBall).padStart(2, '0') : null;
    }).filter(Boolean); // 过滤掉null值
  }
  return [];
}
```

### 2. 修复前端组合号生成逻辑

修改 `倒数5期两球组合前区.js` 文件中生成组合号的部分，确保只使用有效的数字：

```javascript
// 解析前区号码（从red字段中获取）
let frontNumbers = [];
try {
  // 使用processBalls函数处理号码，确保格式一致
  const processedBalls = processBalls(fifthLastDraw.red);
  // 转换回数字数组，并过滤掉非数字值
  frontNumbers = processedBalls.map(num => parseInt(num)).filter(num => !isNaN(num));
  // 确保frontNumbers至少有一些号码，否则记录错误
  if (!frontNumbers.length) {
    console.error('Failed to extract valid front numbers from:', fifthLastDraw.red);
  }
} catch (e) {
  console.error('Error extracting red numbers:', e);
}

// 生成倒数第5期前区号码的所有两球组合
const frontCombinations = [];
for (let i = 0; i < frontNumbers.length; i++) {
  for (let j = i + 1; j < frontNumbers.length; j++) {
    // 确保小球在前，大球在后，保持一致性
    const ball1 = Math.min(frontNumbers[i], frontNumbers[j]);
    const ball2 = Math.max(frontNumbers[i], frontNumbers[j]);
    // 确保ball1和ball2都是有效的数字
    if (!isNaN(ball1) && !isNaN(ball2)) {
      frontCombinations.push(`${ball1}-${ball2}`);
    }
  }
}
```

### 3. 前端添加防御性检查

在前端 `dao_shu_5_qi_liang_qiu_zu_he.html` 文件中，添加防御性检查，确保即使后端返回了无效的组合号，前端也能优雅处理：

```javascript
sortedCombinations.forEach(combo => {
  // 直接使用后端提供的count字段
  const totalCount = combo.count || 0;
  
  // 确保combo.combo是有效的
  const comboText = combo.combo && combo.combo !== 'NaN-NaN' ? combo.combo : '无效组合';
  
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td class="combination-cell" data-combination="${comboText}">${comboText}</td>
    <td class="count">${totalCount}</td>
  `;
  
  // 其余代码保持不变...
});
```

## 修复效果

通过以上修复，"前区两球组合统计"卡片的"组合号"字段将不再显示"NaN和NaN"，而是：
1. 显示有效的组合号（如"1-2"）
2. 当无法生成有效组合时，显示"无效组合"或不显示该组合

这样可以确保页面的美观性和数据的准确性。