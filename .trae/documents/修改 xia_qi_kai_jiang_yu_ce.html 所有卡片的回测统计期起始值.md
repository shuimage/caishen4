## 修改计划

### 目标
将 xia_qi_kai_jiang_yu_ce.html 页面中所有卡片的回测统计期起始值从2000期修改为1500期。

### 需要修改的函数
1. **performSearchNewest** (最新一期两球组合)
   - 修改第968行：`let currentStart = 2000;` → `let currentStart = 1500;`
   - 修改第1035行：`const minLimit = 2000;` → `const minLimit = 1500;`

2. **performSearchSecondLast** (倒数2期两球组合)
   - 修改第1550行：`let currentStart = 2000;` → `let currentStart = 1500;`
   - 修改第1617行：`const minLimit = 2000;` → `const minLimit = 1500;`

3. **performSearchThirdLast** (倒数3期两球组合)
   - 修改第2564行：`let currentStart = 2000;` → `let currentStart = 1500;`
   - 修改第2639行：`const minLimit = 2000;` → `const minLimit = 1500;`

4. **performSearchFourthLast** (倒数4期两球组合)
   - 修改第2873行：`let currentStart = 2000;` → `let currentStart = 1500;`
   - 修改第2948行：`currentStart = Math.max(2000, minStatsPeriod - expansion);` → `currentStart = Math.max(1500, minStatsPeriod - expansion);`

5. **performSearchFifthLast** (倒数5期两球组合)
   - 修改第3172行：`let currentStart = 2000;` → `let currentStart = 1500;`
   - 修改第3247行：`currentStart = Math.max(2000, minStatsPeriod - expansion);` → `currentStart = Math.max(1500, minStatsPeriod - expansion);`

6. **performSearchNearTwoPeriods** (近两期两球组合)
   - 修改第3753行：`let currentStart = 2000;` → `let currentStart = 1500;`
   - 修改第3828行：`const minLimit = 2000;` → `const minLimit = 1500;`

7. **performSearchThreeBall** (最新一期三球组合)
   - 修改第4301行：`let currentStart = 2000;` → `let currentStart = 1500;`
   - 修改第4376行：`const minLimit = 2000;` → `const minLimit = 1500;`

8. **performSearchSecondLastThreeBall** (倒数2期三球组合)
   - 修改第5144行：`let currentStart = 2000;` → `let currentStart = 1500;`
   - 修改第5216行：`const minLimit = 2000;` → `const minLimit = 1500;`

### 修改方法
- 使用 Edit 工具一次性修改所有需要的行
- 确保所有的统计期起始值都从2000期改为1500期
- 验证修改是否正确，确保没有遗漏

### 预期结果
修改后，所有卡片的回测统计期都将从1500期开始进行，符合用户的要求。