## 问题分析

san_qiu_fen_xi.html页面的“前区号码出现次数分布”图表不随统计范围变化，主要原因是：

1. **函数参数传递错误**：在`renderThreeBallAnalysisData`函数中，调用`drawFrontZoneChart`时传递了未定义的`period`变量
2. **事件监听器参数处理错误**：主题切换监听器和图表排序事件监听器中，传递了完整的对象而不是统计期数字符串

## 修复方案

### 1. 修改renderThreeBallAnalysisData函数
**文件：** `d:\中啦\caishen4\qian\san_qiu_fen_xi.html`
**修改位置：** 第416行
**修改内容：** 将`drawFrontZoneChart(totalCounts, period)`改为`drawFrontZoneChart(totalCounts, statsPeriod)`，使用正确的函数参数

### 2. 修改主题切换监听器
**文件：** `d:\中啦\caishen4\qian\san_qiu_fen_xi.html`
**修改位置：** 第617-618行
**修改内容：** 将`getSavedPeriodSelection()`返回的对象改为提取其中的`statsPeriod`属性

### 3. 修改图表排序事件监听器
**文件：** `d:\中啦\caishen4\qian\san_qiu_fen_xi.html`
**修改位置：** 第636-637行
**修改内容：** 同样将`getSavedPeriodSelection()`返回的对象改为提取其中的`statsPeriod`属性

## 预期效果

修复后，当用户在左侧导航栏或页面中部选择不同的统计范围时：
1. 图表会根据新的统计范围重新绘制
2. 图表显示的统计期数和平均次数会正确更新
3. 主题切换和图表排序功能也能正常工作

## 修复步骤

1. 使用`Edit`工具修改`renderThreeBallAnalysisData`函数中的`drawFrontZoneChart`调用
2. 修改主题切换监听器中的参数处理
3. 修改图表排序事件监听器中的参数处理
4. 测试页面功能，确保图表能随统计范围变化