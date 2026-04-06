# 修复下期后区深度预测页面回测结果值问题 - 产品需求文档

## Overview
- **Summary**: 修复 `xia_qi_hou_qu_shen_du_yu_ce.html` 页面的回测结果列表中回测结果值不正确的问题，确保根据回测结果排名正确提取第1名和最后1名的球号。
- **Purpose**: 确保回测结果值的准确性，使页面能够正确显示每个回测方法的后区推荐买号合集中的第1名和最后1名球号。
- **Target Users**: 使用彩票预测系统的用户，特别是需要查看后区号码深度预测结果的用户。

## Goals
- 修复回测结果值不正确的问题
- 确保根据回测结果排名正确提取第1名和最后1名的球号
- 正确处理多个球都为第1或最后1名的情况
- 确保与 `xia_qi_hou_qu_kai_jiang_yu_ce.html` 页面的回测方法和推荐买号合集保持一致

## Non-Goals (Out of Scope)
- 不修改页面的整体布局和样式
- 不更改其他功能模块的实现
- 不添加新的回测方法或功能

## Background & Context
- 现有实现中，`extractBuyNumbersCollection` 函数基于当前页面的回测结果计算推荐买号合集
- 但根据需求，应该从 `xia_qi_hou_qu_kai_jiang_yu_ce.html` 页面的每个回测方法的后区推荐买号合集中提取第1名和最后1名
- 现有实现可能没有正确处理多个球都为第1或最后1名的情况

## Functional Requirements
- **FR-1**: 修复 `extractBuyNumbersCollection` 函数，确保正确提取每个回测方法的后区推荐买号合集中的第1名和最后1名
- **FR-2**: 确保正确处理多个球都为第1或最后1名的情况，提取所有符合条件的球号
- **FR-3**: 确保与 `xia_qi_hou_qu_kai_jiang_yu_ce.html` 页面的回测方法和推荐买号合集保持一致的排序和计算逻辑

## Non-Functional Requirements
- **NFR-1**: 修复后的代码应保持与现有代码风格一致
- **NFR-2**: 修复后的功能应在各种浏览器中正常运行
- **NFR-3**: 修复不应影响其他功能的正常运行

## Constraints
- **Technical**: 必须使用现有的技术栈和框架，不能引入新的依赖
- **Business**: 修复应在不影响现有用户体验的情况下完成
- **Dependencies**: 依赖于 `xia_qi_hou_qu_kai_jiang_yu_ce.html` 页面的回测方法和推荐买号合集逻辑

## Assumptions
- 假设 `xia_qi_hou_qu_kai_jiang_yu_ce.html` 页面的回测方法和推荐买号合集逻辑是正确的
- 假设后端API返回的数据格式是正确的
- 假设用户会按照预期使用页面功能

## Acceptance Criteria

### AC-1: 回测结果值正确显示
- **Given**: 用户访问 `xia_qi_hou_qu_shen_du_yu_ce.html` 页面并生成回测数据
- **When**: 系统计算回测结果值时
- **Then**: 回测结果值应正确显示每个回测方法的后区推荐买号合集中的第1名和最后1名球号
- **Verification**: `human-judgment`

### AC-2: 正确处理多个球的情况
- **Given**: 多个球都为第1名或最后1名
- **When**: 系统提取回测结果值时
- **Then**: 系统应提取所有符合条件的球号，而不是只提取一个
- **Verification**: `programmatic`

### AC-3: 与参考页面逻辑一致
- **Given**: 对比 `xia_qi_hou_qu_shen_du_yu_ce.html` 和 `xia_qi_hou_qu_kai_jiang_yu_ce.html` 页面的回测结果
- **When**: 两个页面使用相同的回测方法和参数时
- **Then**: 两个页面的回测结果值应保持一致
- **Verification**: `human-judgment`

## Open Questions
- [ ] 确认 `xia_qi_hou_qu_kai_jiang_yu_ce.html` 页面的推荐买号合集排序逻辑是否与当前实现一致
- [ ] 确认后端API返回的数据格式是否需要调整
