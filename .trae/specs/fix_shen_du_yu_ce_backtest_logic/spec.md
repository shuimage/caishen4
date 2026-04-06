# 修复下期后区深度预测页面回测逻辑 - 产品需求文档

## Overview
- **Summary**: 修复 xia_qi_hou_qu_shen_du_yu_ce.html 页面中倒数2期两球组合后区回测逻辑，使其与 xia_qi_hou_qu_kai_jiang_yu_ce.html 页面的"倒数2期两球组合后区平均率最高统计期详情"卡片使用相同的回测方法，并正确提取后区推荐买号合集的第1名和最后1名。
- **Purpose**: 确保深度预测页面的回测结果与开奖预测页面的逻辑一致，提供准确的后区推荐买号数据。
- **Target Users**: 彩票分析系统用户，需要准确的后区号码预测数据。

## Goals
- 修复 xia_qi_hou_qu_shen_du_yu_ce.html 页面中倒数2期两球组合后区的回测逻辑
- 确保回测结果与 xia_qi_hou_qu_kai_jiang_yu_ce.html 页面的逻辑一致
- 正确提取后区推荐买号合集的第1名和最后1名
- 确保当第1名或最后1名有多个球时，能够正确显示多个球

## Non-Goals (Out of Scope)
- 不修改其他期数的回测逻辑
- 不修改前区的回测逻辑
- 不修改其他页面的功能

## Background & Context
- 目前 xia_qi_hou_qu_shen_du_yu_ce.html 页面的倒数2期回测逻辑存在问题，导致回测结果不正确
- 正确的逻辑应该参考 xia_qi_hou_qu_kai_jiang_yu_ce.html 页面的"倒数2期两球组合后区平均率最高统计期详情"卡片
- 问题出现在统计方法和推荐买号合集的提取逻辑上

## Functional Requirements
- **FR-1**: 实现与 xia_qi_hou_qu_kai_jiang_yu_ce.html 页面相同的回测方法
- **FR-2**: 正确统计后区号码的出现次数
- **FR-3**: 正确计算后区推荐买号合集
- **FR-4**: 正确提取推荐买号合集的第1名和最后1名
- **FR-5**: 当第1名或最后1名有多个球时，显示所有球

## Non-Functional Requirements
- **NFR-1**: 回测逻辑执行效率不低于现有实现
- **NFR-2**: 代码风格与现有代码保持一致
- **NFR-3**: 不引入新的依赖

## Constraints
- **Technical**: 必须使用现有的前端技术栈，不引入新的库或框架
- **Dependencies**: 依赖现有的后端API接口

## Assumptions
- 后端API返回的数据格式正确
- 现有的前端代码结构保持不变

## Acceptance Criteria

### AC-1: 回测逻辑正确性
- **Given**: 测试回测26025期，回测期数20，倒数2期
- **When**: 执行回测
- **Then**: 第1名显示为9，最后1名显示为5,2,11,12
- **Verification**: `programmatic`

### AC-2: 推荐买号合集提取
- **Given**: 多个回测结果
- **When**: 计算推荐买号合集
- **Then**: 正确提取正确率最高的号码作为第1名，正确率最低的号码作为最后1名
- **Verification**: `programmatic`

### AC-3: 多球处理
- **Given**: 第1名或最后1名有多个球
- **When**: 显示回测结果
- **Then**: 显示所有符合条件的球
- **Verification**: `human-judgment`

## Open Questions
- [ ] 回测期数20的具体含义是什么？是指遍历20个统计期还是只使用20期的数据？
