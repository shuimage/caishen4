# 修复深度预测页面回测结果问题 - 产品需求文档

## Overview
- **Summary**: 修复 xia_qi_hou_qu_shen_du_yu_ce.html 页面在回测26025期，回测期数20，倒数2期时的回测结果问题，确保结果与用户期望一致（第1名是9，最后1名是5,2,11,12）。
- **Purpose**: 解决深度预测页面回测结果不正确的问题，确保回测逻辑与开奖预测页面一致。
- **Target Users**: 彩票分析系统用户，需要准确的回测结果进行彩票号码分析。

## Goals
- 修复 xia_qi_hou_qu_shen_du_yu_ce.html 页面的回测结果计算逻辑
- 确保回测26025期，回测期数20，倒数2期时的结果正确（第1名是9，最后1名是5,2,11,12）
- 确保深度预测页面的回测逻辑与开奖预测页面一致

## Non-Goals (Out of Scope)
- 不修改其他页面的回测逻辑
- 不修改后端API的实现
- 不修改其他期数或回测方法的结果

## Background & Context
- 用户在测试 xia_qi_hou_qu_shen_du_yu_ce.html 页面时，发现回测26025期，回测期数20，倒数2期的结果与期望不一致
- 期望结果：第1名是9，最后1名是5,2,11,12
- 实际结果：倒数2期两球组合的第1名和最后1名都是所有号码（1-12）
- 问题可能出在 `huo_qu_hou_qu_tui_jian_mai_hao_second_last` 函数或 `executeCardBacktest` 函数中

## Functional Requirements
- **FR-1**: 修复 `huo_qu_hou_qu_tui_jian_mai_hao_second_last` 函数，确保它能正确获取倒数2期两球组合的后区推荐买号
- **FR-2**: 修复 `executeCardBacktest` 函数，确保它能正确处理倒数2期的回测逻辑
- **FR-3**: 确保 `extractBuyNumbersCollection` 函数能正确计算推荐买号合集的第1名和最后1名

## Non-Functional Requirements
- **NFR-1**: 修复后的代码应与开奖预测页面的逻辑保持一致
- **NFR-2**: 修复后的代码应能处理各种边界情况，如空数据、错误数据等
- **NFR-3**: 修复后的代码应具有良好的可读性和可维护性

## Constraints
- **Technical**: 前端使用 JavaScript，后端使用 Node.js，数据库使用 MySQL
- **Business**: 修复应在不影响其他功能的情况下完成
- **Dependencies**: 依赖后端 API 提供正确的回测数据

## Assumptions
- 后端 API 能正确返回倒数2期两球组合的后区推荐买号数据
- 开奖预测页面的回测逻辑是正确的
- 回测26025期，回测期数20，倒数2期的正确结果是第1名是9，最后1名是5,2,11,12

## Acceptance Criteria

### AC-1: 修复倒数2期两球组合的回测结果
- **Given**: 用户在 xia_qi_hou_qu_shen_du_yu_ce.html 页面设置回测期号为26025，回测期数为20，选择倒数2期方法
- **When**: 用户点击"生成回测数据"按钮
- **Then**: 回测结果显示第1名为9，最后1名为5,2,11,12
- **Verification**: `programmatic`

### AC-2: 确保与开奖预测页面逻辑一致
- **Given**: 用户在 xia_qi_hou_qu_kai_jiang_yu_ce.html 页面查看倒数2期两球组合后区平均率最高统计期详情
- **When**: 用户比较两个页面的回测逻辑
- **Then**: 两个页面的回测逻辑一致，结果相同
- **Verification**: `human-judgment`

### AC-3: 确保其他回测方法不受影响
- **Given**: 用户在 xia_qi_hou_qu_shen_du_yu_ce.html 页面使用其他回测方法
- **When**: 用户点击"生成回测数据"按钮
- **Then**: 其他回测方法的结果正常显示
- **Verification**: `programmatic`

## Open Questions
- [ ] 为什么倒数2期两球组合的回测结果会返回所有号码？
- [ ] 后端 API 是否能正确返回倒数2期两球组合的后区推荐买号数据？
- [ ] 开奖预测页面的回测逻辑是否完全正确？
