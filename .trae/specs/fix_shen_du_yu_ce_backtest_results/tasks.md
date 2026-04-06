# 修复深度预测页面回测结果问题 - 实现计划

## [ ] Task 1: 分析倒数2期两球组合回测结果问题
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 分析 xia_qi_hou_qu_shen_du_yu_ce.html 页面中 `huo_qu_hou_qu_tui_jian_mai_hao_second_last` 函数的实现
  - 分析 `executeCardBacktest` 函数中处理倒数2期的逻辑
  - 分析为什么倒数2期两球组合的回测结果会返回所有号码
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `programmatic` TR-1.1: 验证 `huo_qu_hou_qu_tui_jian_mai_hao_second_last` 函数是否正确调用后端 API
  - `programmatic` TR-1.2: 验证 `executeCardBacktest` 函数是否正确处理倒数2期的回测逻辑
  - `human-judgment` TR-1.3: 分析问题根源并提出修复方案
- **Notes**: 重点关注倒数2期两球组合的 API 调用和数据处理逻辑

## [ ] Task 2: 修复 `huo_qu_hou_qu_tui_jian_mai_hao_second_last` 函数
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 修复 `huo_qu_hou_qu_tui_jian_mai_hao_second_last` 函数，确保它能正确获取倒数2期两球组合的后区推荐买号
  - 确保函数能正确处理后端 API 返回的数据
  - 确保函数能正确根据排名方法返回对应的号码
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-2.1: 验证 `huo_qu_hou_qu_tui_jian_mai_hao_second_last` 函数能正确调用后端 API
  - `programmatic` TR-2.2: 验证 `huo_qu_hou_qu_tui_jian_mai_hao_second_last` 函数能正确处理后端 API 返回的数据
  - `programmatic` TR-2.3: 验证 `huo_qu_hou_qu_tui_jian_mai_hao_second_last` 函数能正确根据排名方法返回对应的号码
- **Notes**: 参考开奖预测页面的 `huo_qu_hou_qu_tui_jian_mai_hao_second_last` 函数实现

## [ ] Task 3: 修复 `executeCardBacktest` 函数
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 修复 `executeCardBacktest` 函数，确保它能正确处理倒数2期的回测逻辑
  - 确保函数能正确调用 `huo_qu_hou_qu_tui_jian_mai_hao_second_last` 函数
  - 确保函数能正确处理回测结果并生成推荐买号合集
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `programmatic` TR-3.1: 验证 `executeCardBacktest` 函数能正确处理倒数2期的回测逻辑
  - `programmatic` TR-3.2: 验证 `executeCardBacktest` 函数能正确调用 `huo_qu_hou_qu_tui_jian_mai_hao_second_last` 函数
  - `programmatic` TR-3.3: 验证 `executeCardBacktest` 函数能正确处理回测结果并生成推荐买号合集
- **Notes**: 参考开奖预测页面的 `performSearchSecondLastBack` 函数实现

## [ ] Task 4: 验证 `extractBuyNumbersCollection` 函数
- **Priority**: P1
- **Depends On**: Task 3
- **Description**: 
  - 验证 `extractBuyNumbersCollection` 函数能正确计算推荐买号合集的第1名和最后1名
  - 确保函数能正确处理回测结果数据
  - 确保函数能正确排序号码并返回第1名和最后1名
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-4.1: 验证 `extractBuyNumbersCollection` 函数能正确计算推荐买号合集的第1名和最后1名
  - `programmatic` TR-4.2: 验证 `extractBuyNumbersCollection` 函数能正确处理回测结果数据
  - `programmatic` TR-4.3: 验证 `extractBuyNumbersCollection` 函数能正确排序号码并返回第1名和最后1名
- **Notes**: 参考开奖预测页面的 `renderDetailDataSecondLastBack` 函数中的推荐买号合集计算逻辑

## [ ] Task 5: 测试修复后的回测结果
- **Priority**: P0
- **Depends On**: Task 4
- **Description**: 
  - 在 xia_qi_hou_qu_shen_du_yu_ce.html 页面测试回测26025期，回测期数20，倒数2期的结果
  - 验证结果是否为第1名是9，最后1名是5,2,11,12
  - 验证其他回测方法是否不受影响
- **Acceptance Criteria Addressed**: AC-1, AC-3
- **Test Requirements**:
  - `programmatic` TR-5.1: 验证回测26025期，回测期数20，倒数2期的结果是否为第1名是9，最后1名是5,2,11,12
  - `programmatic` TR-5.2: 验证其他回测方法的结果是否正常显示
  - `human-judgment` TR-5.3: 验证页面是否能正常加载和运行
- **Notes**: 确保测试环境的后端服务正常运行

## [ ] Task 6: 验证与开奖预测页面逻辑一致
- **Priority**: P1
- **Depends On**: Task 5
- **Description**: 
  - 在 xia_qi_hou_qu_kai_jiang_yu_ce.html 页面查看倒数2期两球组合后区平均率最高统计期详情
  - 比较两个页面的回测逻辑和结果
  - 确保两个页面的回测逻辑一致，结果相同
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `human-judgment` TR-6.1: 比较两个页面的回测逻辑是否一致
  - `human-judgment` TR-6.2: 比较两个页面的回测结果是否相同
- **Notes**: 重点关注两个页面的 API 调用、数据处理和推荐买号合集计算逻辑
