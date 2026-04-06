# 后区深度预测页面重新实现 - 实现计划

## [x] Task 1: 删除现有的后区深度预测页面文件
- **Priority**: P0
- **Depends On**: None
- **Description**: 删除现有的「下期后区深度预测」页的前端文件 `xia_qi_hou_qu_shen_du_yu_ce.html`
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-1.1: 确认 `xia_qi_hou_qu_shen_du_yu_ce.html` 文件已被删除
- **Notes**: 保留 `xia_qi_hou_qu_shen_du_yu_ce_bak.html` 作为备份

## [x] Task 2: 复制前区深度预测页面作为基础
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 复制 `xia_qi_qian_qu_shen_du_yu_ce.html` 文件，重命名为 `xia_qi_hou_qu_shen_du_yu_ce.html`
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-2.1: 确认 `xia_qi_hou_qu_shen_du_yu_ce.html` 文件已创建
  - `human-judgment` TR-2.2: 确认文件内容与前区页面一致
- **Notes**: 这是重新实现的基础，后续需要修改特定部分以适配后区数据

## [x] Task 3: 修改页面标题和相关文本
- **Priority**: P1
- **Depends On**: Task 2
- **Description**: 修改页面标题、页面标题和相关文本，将「前区」改为「后区」
- **Acceptance Criteria Addressed**: AC-2, AC-3
- **Test Requirements**:
  - `human-judgment` TR-3.1: 确认页面标题已改为「下期后区深度预测」
  - `human-judgment` TR-3.2: 确认所有相关文本已从「前区」改为「后区」
- **Notes**: 包括页面标题、按钮文本、表格表头、提示信息等

## [x] Task 4: 修改API调用路径
- **Priority**: P0
- **Depends On**: Task 3
- **Description**: 修改API调用路径，将前区相关的API路径改为后区相关的API路径
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` TR-4.1: 确认API调用路径已修改为后区相关的路径
  - `programmatic` TR-4.2: 确认API调用参数正确
- **Notes**: 主要修改 `loadBacktestData` 函数中的API调用路径

## [x] Task 5: 修改排名计算逻辑
- **Priority**: P0
- **Depends On**: Task 4
- **Description**: 修改排名计算逻辑，确保后区排名不超过12
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic` TR-5.1: 确认排名计算逻辑已限制在1-12之间
  - `programmatic` TR-5.2: 确认生成的排名方法只到rank12
- **Notes**: 修改 `calculateBuyNumbers` 函数和生成排名方法的循环

## [x] Task 6: 修改回测结果表格
- **Priority**: P1
- **Depends On**: Task 5
- **Description**: 修改回测结果表格，将「下期前区开奖号」改为「下期后区开奖号」
- **Acceptance Criteria Addressed**: AC-2, AC-3
- **Test Requirements**:
  - `human-judgment` TR-6.1: 确认表格表头已修改
  - `human-judgment` TR-6.2: 确认表格数据正确显示后区开奖号
- **Notes**: 确保表格数据与后区数据对应

## [x] Task 7: 测试页面功能
- **Priority**: P0
- **Depends On**: Task 6
- **Description**: 测试页面的所有功能，包括设置期号范围、选择回测期数、选择回测方法、执行回测、查看结果、计算统计、查看图表
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `human-judgment` TR-7.1: 确认所有功能正常工作
  - `programmatic` TR-7.2: 确认回测结果中排名不超过12
  - `programmatic` TR-7.3: 确认只回测后区数据
- **Notes**: 测试时需要确保后端服务正在运行

## [x] Task 8: 验证与前区页面的一致性
- **Priority**: P1
- **Depends On**: Task 7
- **Description**: 验证后区深度预测页面与前区深度预测页面的样式和交互是否一致
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `human-judgment` TR-8.1: 确认页面样式与前区页面一致
  - `human-judgment` TR-8.2: 确认交互逻辑与前区页面一致
- **Notes**: 包括布局、颜色、字体、按钮样式等

## [x] Task 9: 清理临时文件
- **Priority**: P2
- **Depends On**: Task 8
- **Description**: 清理测试过程中产生的临时文件（如果有）
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-9.1: 确认临时文件已被清理
- **Notes**: 确保项目目录整洁