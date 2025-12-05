# 实现计划

## 1. 修改dao_shu_3_qi_san_qiu_sha_hao_hui_ce_xiang_qing.html

### 1.1 添加URL参数处理功能
- 添加`getURLParameters`函数，用于从URL参数中获取`backtest_period`和`stats_period`
- 修改页面加载逻辑，优先使用URL参数，其次使用localStorage保存的值，最后使用默认值

### 1.2 确保下拉框样式正确
- 确保"回测期数"和"统计期数"下拉框在同一行显示
- 优化CSS样式，确保下拉框和标签对齐

### 1.3 验证动态更新功能
- 确认回测期数改变时，杀号回测结果列表数据会跟着改变
- 确认统计期数改变时，前区推荐杀号算法会跟着统计期数改变

## 2. 修改dao_shu_3_qi_san_qiu_zu_he.html

### 2.1 添加获取统计范围的函数
- 添加`getSelectedStatsRange`函数，用于获取当前选择的统计范围期数

### 2.2 修改"查看回测结果"链接
- 修改前区推荐杀号区域的"查看回测结果"链接
- 修改前区三球组合统计区域的"查看回测结果"按钮
- 确保跳转时传递正确的参数：`backtest_period=50`和`stats_period`为当前选择的统计范围期数

### 2.3 添加事件监听器
- 为统计范围下拉框添加事件监听器，当选择改变时，更新所有"查看回测结果"链接的参数

## 3. 测试功能

### 3.1 测试页面跳转
- 从dao_shu_3_qi_san_qiu_zu_he.html点击"查看回测结果"
- 验证URL参数是否正确：`backtest_period=50`和`stats_period`为当前选择的统计范围期数

### 3.2 测试动态更新
- 在dao_shu_3_qi_san_qiu_sha_hao_hui_ce_xiang_qing.html中改变回测期数
- 验证杀号回测结果列表数据是否更新
- 改变统计期数
- 验证前区推荐杀号算法是否重新计算

## 4. 代码优化

### 4.1 统一变量命名
- 确保前后端变量命名一致
- 优化代码可读性

### 4.2 增强错误处理
- 添加适当的错误提示
- 确保接口调用失败时友好提示用户

## 5. 验证服务状态

### 5.1 检查后端服务
- 确保后端服务运行在http://localhost:18889
- 验证接口是否正常响应

### 5.2 检查前端服务
- 确保前端服务运行在http://localhost:8000
- 验证页面是否可以正常访问

通过以上修改，将实现：
1. dao_shu_3_qi_san_qiu_sha_hao_hui_ce_xiang_qing.html的下拉框功能，支持动态更新数据
2. 从dao_shu_3_qi_san_qiu_zu_he.html跳转到dao_shu_3_qi_san_qiu_sha_hao_hui_ce_xiang_qing.html时传递正确的参数
3. 确保所有功能正常工作，用户体验良好