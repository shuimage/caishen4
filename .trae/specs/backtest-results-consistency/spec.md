# 回测结果一致性修复 - 产品需求文档

## Overview
- **Summary**: 修复xia_qi_hou_qu_shen_du_yu_ce.html页面的回测结果值，使其与xia_qi_hou_qu_kai_jiang_yu_ce.html页面的结果保持一致。
- **Purpose**: 确保两个页面在相同回测条件下返回相同的回测结果，满足用户对一致性的要求。
- **Target Users**: 彩票分析系统的用户。

## Goals
- 修复xia_qi_hou_qu_shen_du_yu_ce.html页面的回测结果值计算逻辑
- 确保在相同回测条件下，两个页面返回相同的回测结果
- 验证修复后的结果与用户期望一致

## Non-Goals (Out of Scope)
- 不修改xia_qi_hou_qu_kai_jiang_yu_ce.html页面的逻辑
- 不改变其他回测方法或期数的结果
- 不修改后端API的实现

## Background & Context
- xia_qi_hou_qu_kai_jiang_yu_ce.html页面在回测期号为26027期，回测方法为：最新一期，回测期数为10时，“最新一期两球组合后区平均率最高统计期详情”卡片中的“后区推荐买号合集”的第1名是2和9，最后1名是8。
- xia_qi_hou_qu_shen_du_yu_ce.html页面在相同条件下，回测结果值第1名是7和10，最后1名是6。
- 用户期望两个页面使用完全一样的逻辑和算法，深度预测页面的结果应该与主页面一致。

## Functional Requirements
- **FR-1**: 分析两个页面的回测结果计算逻辑，找出差异
- **FR-2**: 修改xia_qi_hou_qu_shen_du_yu_ce.html页面的逻辑，使其与主页面一致
- **FR-3**: 验证修复后的结果与用户期望一致

## Non-Functional Requirements
- **NFR-1**: 修复后的代码应该与主页面的代码逻辑保持一致
- **NFR-2**: 修复过程应该不影响其他回测方法或期数的结果
- **NFR-3**: 修复后的代码应该具有良好的可读性和可维护性

## Constraints
- **Technical**: 只修改前端代码，不修改后端API
- **Dependencies**: 依赖后端API返回的数据

## Assumptions
- 后端API返回的数据是正确的
- 主页面的回测结果计算逻辑是正确的

## Acceptance Criteria

### AC-1: 分析两个页面的回测结果计算逻辑
- **Given**: 两个页面的代码
- **When**: 分析它们的回测结果计算逻辑
- **Then**: 找出导致结果不一致的差异
- **Verification**: `human-judgment`

### AC-2: 修改深度预测页面的逻辑
- **Given**: 深度预测页面的代码
- **When**: 修改其回测结果计算逻辑
- **Then**: 使其与主页面的逻辑一致
- **Verification**: `human-judgment`

### AC-3: 验证修复后的结果
- **Given**: 修复后的深度预测页面
- **When**: 执行回测（期号26027，方法：最新一期，期数：10）
- **Then**: 回测结果值第1名是2和9，最后1名是8
- **Verification**: `human-judgment`

## Open Questions
- [ ] 两个页面的回测结果计算逻辑具体差异是什么？
- [ ] 如何确保修复后的逻辑与主页面完全一致？