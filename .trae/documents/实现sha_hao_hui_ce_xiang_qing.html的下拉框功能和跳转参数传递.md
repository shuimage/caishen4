# 实现计划

## 1. 修改sha_hao_hui_ce_xiang_qing.html

### 1.1 添加下拉框和URL参数处理
- 添加"回测期数"和"统计期数"下拉框，确保它们在同一行显示
- 添加`getURLParameters`函数，用于从URL参数中获取`backtest_period`和`stats_period`
- 修改页面加载逻辑，优先使用URL参数，其次使用localStorage保存的值，最后使用默认值

### 1.2 修改JavaScript代码
- 修改`huo_qu_sha_hao_hui_ce`函数，支持`backtest_period`和`stats_period`参数
- 修改`fetchAndRenderBacktestData`函数，传递这两个参数
- 添加下拉框事件监听器，当选择改变时重新获取数据

### 1.3 优化CSS样式
- 确保下拉框和标签对齐
- 优化下拉框的宽度和间距

## 2. 修改sha_hao_fen_xi.html

### 2.1 修改"查看回测结果"链接
- 修改前区推荐杀号区域的"查看回测结果"链接
- 确保跳转时传递正确的参数：`backtest_period=50`和`stats_period`为当前选择的统计范围期数

### 2.2 添加辅助函数
- 添加`getSelectedStatsRange`函数，用于获取当前选择的统计范围期数
- 添加`updateBacktestLink`函数，用于更新"查看回测结果"链接的参数

### 2.3 添加事件监听器
- 为统计范围下拉框添加事件监听器，当选择改变时，更新"查看回测结果"链接的参数

## 3. 修改杀号回测.js

### 3.1 修改后端函数
- 修改`getKillNumberBacktest`函数，支持`backtest_period`和`stats_period`参数
- 修改历史数据查询SQL，使用`backtest_period`限制查询范围
- 修改统计数据查询SQL，使用`stats_period`限制查询范围

### 3.2 修改接口定义
- 修改接口路由，接受`backtest_period`和`stats_period`参数
- 更新API文档注释

## 4. 测试功能

### 4.1 测试页面跳转
- 从sha_hao_fen_xi.html点击"查看回测结果"
- 验证URL参数是否正确：`backtest_period=50`和`stats_period`为当前选择的统计范围期数

### 4.2 测试动态更新
- 在sha_hao_hui_ce_xiang_qing.html中改变回测期数
- 验证杀号回测结果列表数据是否更新
- 改变统计期数
- 验证前区推荐杀号算法是否重新计算

## 5. 代码优化

### 5.1 统一变量命名
- 确保前后端变量命名一致
- 优化代码可读性

### 5.2 增强错误处理
- 添加适当的错误提示
- 确保接口调用失败时友好提示用户

## 6. 验证服务状态

### 6.1 检查后端服务
- 确保后端服务运行在http://localhost:18889
- 验证接口是否正常响应

### 6.2 检查前端服务
- 确保前端服务运行在http://localhost:8000
- 验证页面是否可以正常访问

通过以上修改，将实现：
1. sha_hao_hui_ce_xiang_qing.html的下拉框功能，支持动态更新数据
2. 从sha_hao_fen_xi.html跳转到sha_hao_hui_ce_xiang_qing.html时传递正确的参数
3. 确保所有功能正常工作，用户体验良好