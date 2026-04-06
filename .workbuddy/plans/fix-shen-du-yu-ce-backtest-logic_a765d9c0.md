---
name: fix-shen-du-yu-ce-backtest-logic
overview: 将 xia_qi_hou_qu_shen_du_yu_ce.html 中的回测逻辑（extractBuyNumbersCollection 函数）改成与 xia_qi_hou_qu_kai_jiang_yu_ce.js 中"后区推荐买号合集"完全一致的排序逻辑，使第1名/最后1名的结果值正确。
todos:
  - id: fix-extract-logic
    content: 修改 xia_qi_hou_qu_shen_du_yu_ce.html 中的 extractBuyNumbersCollection 函数，将其替换为与 xia_qi_hou_qu_kai_jiang_yu_ce.js 中 renderDetailDataSecondLastBack 完全一致的号码累加正确率排序逻辑
    status: completed
---

## 用户需求

`xia_qi_hou_qu_shen_du_yu_ce.html` 在回测26025期、倒数2期两球组合、回测期数20时，第1名结果是5和9，最后1名是3。而 `xia_qi_hou_qu_kai_jiang_yu_ce.html` 在同条件下"后区推荐买号合集"第1名是9，最后1名是5、2、11和12。要求将深度预测页的回测结果提取逻辑改成与开奖预测页完全一致。

## 产品概述

`xia_qi_hou_qu_shen_du_yu_ce.html` 是下期后区深度预测页，支持对指定期号范围进行批量回测，并将每期的第1名和最后1名回测结果写入表格。其核心函数 `extractBuyNumbersCollection` 负责从回测结果中提取"第1名"和"最后1名"的推荐买号。

## 核心问题

当前 `extractBuyNumbersCollection` 函数直接对回测方法结果列表按正确率排序，取第一/最后一个元素的 `backBuyNumbers` 作为排名结果。这与开奖预测页的逻辑不一致——开奖预测页是先对所有回测方法结果进行去重、过滤、排序，再建立"号码→累加正确率"映射表，最终以**号码自身的累加正确率**来确定第1名和最后1名。

## 核心功能

- 将 `extractBuyNumbersCollection` 函数替换为与 `xia_qi_hou_qu_kai_jiang_yu_ce.js` 中 `renderDetailDataSecondLastBack` 完全一致的号码排序逻辑
- 第1名 = numberAccuracyMap 按累加正确率降序排列后第一个号码（数组）
- 最后1名 = numberAccuracyMap 按累加正确率降序排列后最后一个号码（数组）
- 保持原有的去重、空值过滤、同回测方法只保留最高正确率等规则

## 技术栈

- 纯前端 HTML + JavaScript（原地修改，无需引入任何新依赖）

## 实现思路

`xia_qi_hou_qu_shen_du_yu_ce.html` 中第1742-1778行的 `extractBuyNumbersCollection` 函数与开奖预测页存在根本逻辑差异：

| 对比项 | 深度预测页（当前错误） | 开奖预测页（正确参考） |
| --- | --- | --- |
| 排序维度 | 按**回测方法**的正确率排序，取第一/最后条目的号码组 | 按**号码自身**的累加正确率排序，取第一/最后号码 |
| 去重处理 | 无 | 按 `backtestMethod_accuracy_sortedBuyNumbers` 去重 |
| 空值过滤 | 无 | 过滤 backBuyNumbers 为空的结果 |
| 同方法处理 | 无 | 同回测方法只保留正确率最高的 |
| 不同方法处理 | 无 | 累加正确率 |


**修改方案**：完全替换 `extractBuyNumbersCollection` 函数体，使其：

1. 先对 backtestResults 做去重（唯一键：`backtestMethod_accuracy.toFixed(3)_sortedBuyNumbers`）
2. 过滤空 backBuyNumbers
3. 按 accuracy 降序排序（filteredResults）
4. 遍历 filteredResults 建立 `numberAccuracyMap`（同方法保留最大，不同方法累加）
5. 将 map 转为数组按累加正确率**降序**排列得 `sortedNumbers`
6. 取 `sortedNumbers[0].number` 的数组形式作为 `first`
7. 取 `sortedNumbers[sortedNumbers.length-1].number` 的数组形式作为 `last`

## 实现注意事项

- `extractBuyNumbersCollection` 的返回值结构（`{ first, last, all }`）保持不变，调用方无需改动
- `first` 和 `last` 需从 `sortedNumbers` 中取单个号码包装成数组 `[item.number]`，与原来直接返回 `backBuyNumbers`（可能多球）的语义不同——参考开奖预测页，号码维度的第1名就是一个号码，需明确以 `[item.number]` 包装
- `all` 字段保持原有逻辑（所有出现过的号码 Set）
- null 判断：`sortedNumbers` 长度为0时 first/last 均返回 null

## 目录结构

```
qian/
└── xia_qi_hou_qu_shen_du_yu_ce.html   # [MODIFY] 替换第1742-1778行的 extractBuyNumbersCollection 函数
```