# 修复下期后区深度预测页面回测结果值问题 - 实现计划

## [ ] Task 1: 分析现有 `extractBuyNumbersCollection` 函数实现
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 分析 `xia_qi_hou_qu_shen_du_yu_ce.html` 中的 `extractBuyNumbersCollection` 函数实现
  - 对比 `xia_qi_hou_qu_kai_jiang_yu_ce.html` 中的推荐买号合集排序逻辑
  - 识别问题所在
- **Acceptance Criteria Addressed**: AC-1, AC-3
- **Test Requirements**:
  - `human-judgment` TR-1.1: 确认两个页面的排序逻辑是否一致
  - `human-judgment` TR-1.2: 识别当前实现的问题
- **Notes**: 重点关注排序逻辑和多球处理部分

## [ ] Task 2: 修复 `extractBuyNumbersCollection` 函数
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 修改 `extractBuyNumbersCollection` 函数，确保正确提取第1名和最后1名的球号
  - 确保正确处理多个球都为第1或最后1名的情况
  - 保持与 `xia_qi_hou_qu_kai_jiang_yu_ce.html` 页面的逻辑一致
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3
- **Test Requirements**:
  - `programmatic` TR-2.1: 测试多个球为第1名的情况
  - `programmatic` TR-2.2: 测试多个球为最后1名的情况
  - `human-judgment` TR-2.3: 确认与参考页面逻辑一致
- **Notes**: 参考 `xia_qi_hou_qu_kai_jiang_yu_ce.js` 中的 `renderDetailDataNewestBack` 函数实现

## [ ] Task 3: 测试修复后的功能
- **Priority**: P1
- **Depends On**: Task 2
- **Description**: 
  - 访问 `xia_qi_hou_qu_shen_du_yu_ce.html` 页面
  - 生成回测数据并检查回测结果值是否正确
  - 验证多个球为第1或最后1名的情况是否正确处理
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `human-judgment` TR-3.1: 验证回测结果值正确显示
  - `human-judgment` TR-3.2: 验证多个球的情况正确处理
- **Notes**: 确保测试不同的回测方法和参数组合

## [ ] Task 4: 验证与参考页面的一致性
- **Priority**: P1
- **Depends On**: Task 3
- **Description**: 
  - 对比 `xia_qi_hou_qu_shen_du_yu_ce.html` 和 `xia_qi_hou_qu_kai_jiang_yu_ce.html` 页面的回测结果
  - 确保两个页面使用相同的回测方法和参数时，结果一致
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgment` TR-4.1: 对比两个页面的回测结果
  - `human-judgment` TR-4.2: 确认结果一致性
- **Notes**: 重点关注推荐买号合集的排序和提取逻辑
