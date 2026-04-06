# 修复下期后区深度预测页面回测逻辑 - 实现计划

## [/] Task 1: 分析"倒数2期"和"倒数3期"回测逻辑代码
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 分析深度预测页面中"倒数2期"和"倒数3期"的回测逻辑代码
  - 对比"最新一期"、"倒数4期"、"倒数5期"的代码实现
  - 找出代码差异和问题原因
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgment` TR-1.1: 找出"倒数2期"和"倒数3期"与其他回测方法的代码差异
  - `human-judgment` TR-1.2: 确认问题原因是否与数据处理逻辑或API调用有关
- **Notes**: 重点关注数据处理逻辑和API调用部分

## [ ] Task 2: 修复"倒数2期"和"倒数3期"的回测逻辑
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 根据分析结果，修改"倒数2期"和"倒数3期"的回测逻辑
  - 确保修复后的逻辑与其他回测方法一致
  - 确保修复后的逻辑与开奖预测页面一致
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `human-judgment` TR-2.1: 修复后的代码逻辑与其他回测方法一致
  - `human-judgment` TR-2.2: 修复后的代码逻辑与开奖预测页面一致
- **Notes**: 注意保持代码风格和可读性

## [ ] Task 3: 验证修复结果
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 测试回测26025期，回测期数20，所有回测方法
  - 验证"倒数2期"和"倒数3期"的回测结果是否正确
  - 验证其他回测方法的结果是否不受影响
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` TR-3.1: "倒数2期"的回测结果第1名为9，最后1名为5, 2, 11, 12
  - `programmatic` TR-3.2: "倒数3期"的回测结果计算正确
  - `programmatic` TR-3.3: 其他回测方法的结果保持正确
- **Notes**: 确保测试环境与生产环境一致