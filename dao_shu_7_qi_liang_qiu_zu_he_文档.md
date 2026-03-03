# 倒数7期两球组合分析页面详细文档

## 1. 主页面结构

### 1.1 整体布局
- **左侧边栏**：包含顶部快捷栏（显示当前期数）、期数选择区（下拉选择或自定义输入统计范围）
- **右侧主内容区**：包含多个功能区块

### 1.2 功能区块
1. **推荐杀号区域**：显示前区和后区推荐杀号，支持复制功能
2. **最新开奖信息**：显示最新一期的开奖信息（期号、日期、前区号码、后区号码）
3. **倒数第7期开奖信息**：显示倒数第7期的开奖信息
4. **前区推荐买号**：显示前区出现最多球、出现最少球、出现平均球
5. **后区推荐买号**：显示后区出现最多球、出现最少球、出现平均球
6. **前区推荐杀号**：卡片式显示前区推荐杀号，支持复制和回测功能
7. **后区推荐杀号**：卡片式显示后区推荐杀号，支持复制和回测功能
8. **前区两球组合统计**：表格形式显示前区两球组合的统计数据，包含组合号、出现次数、每个前区号码的出现情况
9. **前区号码出现次数分布**：柱状图显示前区号码的出现次数分布，支持排序
10. **后区两球组合统计**：表格形式显示后区两球组合的统计数据
11. **后区号码出现次数分布**：柱状图显示后区号码的出现次数分布，支持排序

## 2. 子页面

### 2.1 组合详情页面
- **页面路径**：`dao_shu_7_qi_liang_qiu_zu_he_xiang_qing.html`
- **触发方式**：点击两球组合统计表格中的组合号或统计值
- **参数说明**：
  - `combination`：组合号（如 "01-02" 或 "01-02-03"）
  - `type`：类型（"first" 表示前区，"last" 表示后区）
  - `stats_range`：统计范围（如 "100" 表示最近100期）

### 2.2 前区买号回测页面
- **页面路径**：`dao_shu_7_qi_mai_hao_hui_ce_xiang_qing.html`
- **触发方式**：点击前区推荐买号区域的回测按钮
- **参数说明**：
  - `backtest_period`：回测期数（固定为50）
  - `stats_period`：统计期数（当前选择的统计范围）

### 2.3 后区买号回测页面
- **页面路径**：`dao_shu_7_qi_mai_hao_hui_ce_hou_xiang_qing.html`
- **触发方式**：点击后区推荐买号区域的回测按钮
- **参数说明**：
  - `backtest_period`：回测期数（固定为50）
  - `stats_period`：统计期数（当前选择的统计范围）

### 2.4 后区杀号回测页面
- **页面路径**：`dao_shu_7_qi_hou_qu_sha_hao_hui_ce_xiang_qing.html`
- **触发方式**：点击后区推荐杀号区域的回测按钮
- **参数说明**：
  - `backtest_period`：回测期数（固定为50）
  - `stats_period`：统计期数（当前选择的统计范围）

## 3. API接口

### 3.1 最新一期开奖信息
- **接口路径**：`http://localhost:18889/sql_zui_xin_yi_qi`
- **请求方式**：GET
- **返回数据结构**：
  ```json
  {
    "success": true,
    "latestDraw": {
      "period": "25120",
      "drawDate": "2025-12-01",
      "firstZoneNumbers": ["01", "02", "03", "04", "05"],
      "lastZoneNumbers": ["01", "02"]
    }
  }
  ```
- **用途**：获取最新一期的开奖信息，用于页面顶部显示和最新开奖信息区块

### 3.2 倒数第7期开奖信息
- **接口路径**：`http://localhost:18889/sql_dao_shu_7_qi`
- **请求方式**：GET
- **返回数据结构**：
  ```json
  {
    "success": true,
    "thirdLastDraw": {
      "period": "25118",
      "drawDate": "2025-11-29",
      "firstZoneNumbers": ["06", "07", "08", "09", "10"],
      "lastZoneNumbers": ["03", "04"]
    }
  }
  ```
- **用途**：获取倒数第7期的开奖信息，用于倒数第7期开奖信息区块

### 3.3 前区两球组合分析数据
- **接口路径**：`http://localhost:18889/dao_shu_7_qi_liang_qiu_zu_he?period=100`
- **请求方式**：GET
- **参数**：
  - `period`：统计期数（如 "100" 表示最近100期，"all" 表示全部期）
- **返回数据结构**：
  ```json
  {
    "success": true,
    "data": {
      "combinations": [
        {
          "combo": "01-02",
          "count": 5,
          "nextDrawNumbers": ["03", "04", "05"]
        }
      ],
      "recommendedFrontKillNumbers": ["01", "02", "03"],
      "latestDraw": {
        "period": "25120"
      }
    }
  }
  ```
- **用途**：获取前区两球组合的分析数据，用于前区两球组合统计表格和推荐杀号

### 3.4 后区两球组合分析数据
- **接口路径**：`http://localhost:18889/dao_shu_7_qi_hou_qu_zu_he?period=100`
- **请求方式**：GET
- **参数**：
  - `period`：统计期数（如 "100" 表示最近100期，"all" 表示全部期）
- **返回数据结构**：
  ```json
  {
    "success": true,
    "data": {
      "combinations": [
        {
          "combo": "01-02",
          "count": 3,
          "nextDrawNumbers": ["03", "04"]
        }
      ]
    }
  }
  ```
- **用途**：获取后区两球组合的分析数据，用于后区两球组合统计表格和推荐杀号

## 4. 处理逻辑

### 4.1 页面初始化
1. 页面加载完成后，调用 `init_data()` 函数初始化数据
2. 立即调用 `xuan_ran_zui_xin_kai_jiang()` 获取并显示最新开奖信息
3. 调用 `renderTableHeaders()` 渲染表格头部（前区1-35号，后区1-12号）
4. 从 localStorage 获取保存的统计范围，如果没有则使用默认值 "100"
5. 设置期数选择下拉框的选中状态
6. 调用 `xuan_ran_dao_shu_7_qi_kai_jiang()` 获取并显示倒数第7期开奖信息
7. 调用 `renderTwoBallAnalysisData(periodValue)` 根据选择的统计范围渲染两球组合分析数据

### 4.2 数据渲染流程
1. **最新开奖信息渲染**：
   - 调用 `huo_qu_zui_xin_kai_jiang()` 获取最新开奖信息
   - 调用 `xuan_ran_zui_xin_kai_jiang()` 渲染到页面

2. **倒数第7期开奖信息渲染**：
   - 调用 `huo_qu_sql_dao_shu_7_qi()` 获取倒数第7期开奖信息
   - 调用 `xuan_ran_dao_shu_7_qi_kai_jiang()` 渲染到页面

3. **前区两球组合数据渲染**：
   - 调用 `huo_qu_dao_shu_7_qi_liang_qiu_zu_he(period)` 获取前区两球组合分析数据
   - 调用 `renderFirstZoneAnalysisData(period)` 渲染数据到表格
   - 计算并显示前区推荐杀号
   - 计算并显示前区推荐买号（出现最多球、出现最少球、出现平均球）
   - 调用 `drawFrontZoneChart(totalCounts, period)` 绘制前区号码出现次数分布图表

4. **后区两球组合数据渲染**：
   - 调用 `huo_qu_dao_shu_7_qi_hou_qu_zu_he(period)` 获取后区两球组合分析数据
   - 调用 `renderSecondZoneAnalysisData(period)` 渲染数据到表格
   - 计算并显示后区推荐杀号
   - 计算并显示后区推荐买号（出现最多球、出现最少球、出现平均球）
   - 调用 `drawBackZoneChart(backTotalCounts, period)` 绘制后区号码出现次数分布图表

### 4.3 统计范围变更处理
1. 当用户选择不同的统计范围时，触发下拉框的 change 事件
2. 更新 `periodValue` 全局变量
3. 保存选择的统计范围到 localStorage
4. 调用 `renderTwoBallAnalysisData(periodValue)` 根据新的统计范围重新渲染数据

### 4.4 图表排序处理
1. 当用户选择不同的图表排序方式时，触发排序选择框的 change 事件
2. 重新调用对应的图表绘制函数，根据选择的排序方式绘制图表

### 4.5 杀号复制功能
1. 当用户点击杀号区域的复制按钮时，触发 `copyKillNumbers(zoneType)` 函数
2. 获取对应区域的杀号文本
3. 提取杀号数字并复制到剪贴板
4. 显示复制成功反馈

### 4.6 组合详情跳转
1. 当用户点击两球组合统计表格中的组合号时，触发点击事件
2. 获取组合号和类型（前区/后区）
3. 跳转到组合详情页面，传递组合号、类型和统计范围参数

4. 当用户点击两球组合统计表格中的统计值时，触发点击事件
5. 获取组合号、选中号码和类型
6. 跳转到组合详情页面，传递格式化的组合号（组合球-目标球）、类型和统计范围参数

### 4.7 回测页面跳转
1. 当用户点击推荐买号或推荐杀号区域的回测按钮时，触发对应的跳转函数
2. 获取当前选择的统计范围
3. 跳转到对应的回测页面，传递回测期数和统计范围参数

## 5. 核心功能实现

### 5.1 推荐杀号计算
- **前区杀号**：从两球组合分析接口获取推荐杀号，同时计算从未在任何组合中出现过的号码作为杀号
- **后区杀号**：计算后区号码中出现次数为0的号码作为推荐杀号

### 5.2 推荐买号计算
- **出现最多球**：找出统计范围内出现次数最多的号码
- **出现最少球**：找出统计范围内出现次数最少（但大于0）的号码
- **出现平均球**：找出统计范围内出现次数等于平均值的号码

### 5.3 图表绘制
- 使用 Canvas API 绘制柱状图
- 支持三种排序方式：按号码顺序、出现次数升序、出现次数降序
- 显示每个号码的出现次数和排名
- 响应主题切换，自动调整图表颜色

### 5.4 数据优化
- 并行获取前区和后区数据，提高加载速度
- 使用 document.createElement 和 appendChild 动态创建DOM元素，避免字符串拼接
- 使用 localStorage 保存用户选择的统计范围，提高用户体验
- 添加接口超时处理，避免页面长时间无响应

## 6. 页面交互

### 6.1 期数选择
- 支持下拉选择预设期数（最近35期、50期、100期、200期、300期、500期、1000期、全部期）
- 支持手动输入自定义期数

### 6.2 图表交互
- 支持切换图表排序方式
- 图表会根据主题切换自动调整颜色

### 6.3 复制功能
- 支持复制前区和后区推荐杀号到剪贴板
- 提供复制成功反馈

### 6.4 响应式设计
- 支持移动端适配，点击导航项后自动关闭侧边栏
- 表格支持横向滚动

## 7. 技术要点

### 7.1 前端技术
- HTML5 + CSS3 + JavaScript
- Canvas API 用于图表绘制
- Fetch API 用于网络请求
- LocalStorage 用于数据持久化
- 响应式设计

### 7.2 性能优化
- 并行数据请求
- DOM 操作优化
- 接口超时处理
- 数据缓存

### 7.3 错误处理
- 接口请求失败时显示 "接口失败" 提示
- 数据格式不正确时的容错处理
- 空数据时的友好提示

## 8. 总结

### 8.1 页面功能
- 提供倒数7期两球组合的详细统计分析
- 显示最新和倒数第7期的开奖信息
- 提供前区和后区的推荐杀号和推荐买号
- 支持多种统计范围选择
- 提供直观的图表展示
- 支持组合详情查看和回测功能

### 8.2 技术特点
- 模块化的代码结构
- 并行数据请求提高性能
- 响应式设计适配不同设备
- 良好的用户交互体验
- 完善的错误处理机制

### 8.3 应用价值
- 为彩票爱好者提供专业的数据分析工具
- 帮助用户快速了解两球组合的出现规律
- 提供基于历史数据的推荐杀号和买号
- 支持用户进行回测验证，提高分析的可靠性

## 9. 接口调用示例

### 9.1 获取最新开奖信息
```javascript
async function huo_qu_zui_xin_kai_jiang() {
  try {
    const response = await fetch('http://localhost:18889/sql_zui_xin_yi_qi');
    if (!response.ok) {
      alert('接口失败');
      return null;
    }
    const result = await response.json();
    if (result && result.success && result.latestDraw) {
      return result.latestDraw;
    }
    return null;
  } catch (error) {
    console.error('获取开奖数据失败:', error);
    alert('接口失败');
    return null;
  }
}
```

### 9.2 获取前区两球组合分析数据
```javascript
async function huo_qu_dao_shu_7_qi_liang_qiu_zu_he(period = '100') {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(`http://localhost:18889/dao_shu_7_qi_liang_qiu_zu_he?period=${period}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`HTTP错误! 状态: ${response.status}`);
    }
    
    const data = await response.json();
    if (data && data.success && data.data) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error('获取倒数7期前区两球组合分析数据失败:', error);
    alert('接口失败: ' + (error.message || '未知错误'));
    return null;
  }
}
```

### 9.3 渲染两球组合分析数据
```javascript
async function renderTwoBallAnalysisData(period = '100') {
  // 并行获取并渲染前区和后区数据
  await Promise.all([
    renderFirstZoneAnalysisData(period),
    renderSecondZoneAnalysisData(period)
  ]);
}
```



