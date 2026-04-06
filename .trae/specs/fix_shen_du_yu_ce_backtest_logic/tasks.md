# 修复下期后区深度预测页面回测逻辑 - 实现计划

## [x] Task 1: 分析现有回测逻辑
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 分析 xia_qi_hou_qu_shen_du_yu_ce.html 页面的现有回测逻辑
  - 分析 xia_qi_hou_qu_kai_jiang_yu_ce.html 页面的"倒数2期两球组合后区平均率最高统计期详情"卡片的回测方法
  - 识别两者之间的差异
- **Acceptance Criteria Addressed**: [AC-1]
- **Test Requirements**:
  - `human-judgement` TR-1.1: 确认两个页面的回测逻辑差异
  - `human-judgement` TR-1.2: 确认正确的回测方法实现
- **Notes**: 重点关注统计方法和推荐买号合集的提取逻辑

## [x] Task 2: 修复统计方法
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 修改 xia_qi_hou_qu_shen_du_yu_ce.html 页面中的统计方法
  - 确保使用与 xia_qi_hou_qu_kai_jiang_yu_ce.html 页面相同的统计逻辑
  - 正确处理 combo.nextDrawNumbers 数据
- **Acceptance Criteria Addressed**: [AC-1, AC-2]
- **Test Requirements**:
  - `programmatic` TR-2.1: 验证统计方法返回正确的结果
  - `human-judgement` TR-2.2: 代码逻辑与参考页面一致
- **Notes**: 参考 xia_qi_hou_qu_kai_jiang_yu_ce.js 中的实现

## [x] Task 3: 测试和验证
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 测试回测26025期，回测期数20，倒数2期的结果
  - 验证第1名是否为9，最后1名是否为5,2,11,12
  - 验证多球情况的处理
- **Acceptance Criteria Addressed**: [AC-1, AC-3]
- **Test Requirements**:
  - `programmatic` TR-3.1: 验证26025期的回测结果正确
  - `human-judgement` TR-3.2: 验证多球显示正确
- **Notes**: 确保测试环境与生产环境一致

## [x] Task 4: 清理和优化
- **Priority**: P1
- **Depends On**: Task 3
- **Description**: 
  - 清理测试代码
  - 优化代码结构和性能
  - 确保代码风格一致
- **Acceptance Criteria Addressed**: [NFR-1, NFR-2]
- **Test Requirements**:
  - `human-judgement` TR-4.1: 代码风格与现有代码一致
  - `human-judgement` TR-4.2: 代码结构清晰
- **Notes**: 不改变功能逻辑，只做代码优化
