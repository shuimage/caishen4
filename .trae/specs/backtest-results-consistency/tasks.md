# 回测结果一致性修复 - 实现计划

## [/] Task 1: 分析两个页面的回测结果计算逻辑
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 分析xia_qi_hou_qu_kai_jiang_yu_ce.html页面的回测结果计算逻辑
  - 分析xia_qi_hou_qu_shen_du_yu_ce.html页面的回测结果计算逻辑
  - 找出导致结果不一致的差异
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgement` TR-1.1: 确认主页面的回测结果计算逻辑
  - `human-judgement` TR-1.2: 确认深度预测页面的回测结果计算逻辑
  - `human-judgement` TR-1.3: 找出两个页面逻辑的具体差异
- **Notes**: 重点关注extractBuyNumbersCollection函数和相关的回测结果处理逻辑

## [ ] Task 2: 修改深度预测页面的回测结果计算逻辑
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 根据Task 1的分析结果，修改xia_qi_hou_qu_shen_du_yu_ce.html页面的回测结果计算逻辑
  - 确保修改后的逻辑与主页面完全一致
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `human-judgement` TR-2.1: 确认修改后的逻辑与主页面一致
  - `human-judgement` TR-2.2: 确认修改不影响其他回测方法或期数的结果
- **Notes**: 确保修改只影响回测结果值的计算，不影响其他功能

## [ ] Task 3: 验证修复后的结果
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 在深度预测页面执行回测（期号26027，方法：最新一期，期数：10）
  - 验证回测结果值第1名是2和9，最后1名是8
  - 确认与主页面的结果一致
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgement` TR-3.1: 验证回测结果值第1名是2和9
  - `human-judgement` TR-3.2: 验证回测结果值最后1名是8
  - `human-judgement` TR-3.3: 确认与主页面的结果一致
- **Notes**: 确保在相同的回测条件下进行验证