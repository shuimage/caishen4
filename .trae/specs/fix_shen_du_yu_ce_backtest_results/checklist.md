# 修复深度预测页面回测结果问题 - 验证清单

- [ ] 检查 `huo_qu_hou_qu_tui_jian_mai_hao_second_last` 函数是否正确调用后端 API
- [ ] 检查 `huo_qu_hou_qu_tui_jian_mai_hao_second_last` 函数是否正确处理后端 API 返回的数据
- [ ] 检查 `huo_qu_hou_qu_tui_jian_mai_hao_second_last` 函数是否正确根据排名方法返回对应的号码
- [ ] 检查 `executeCardBacktest` 函数是否正确处理倒数2期的回测逻辑
- [ ] 检查 `executeCardBacktest` 函数是否正确调用 `huo_qu_hou_qu_tui_jian_mai_hao_second_last` 函数
- [ ] 检查 `executeCardBacktest` 函数是否正确处理回测结果并生成推荐买号合集
- [ ] 检查 `extractBuyNumbersCollection` 函数是否正确计算推荐买号合集的第1名和最后1名
- [ ] 检查 `extractBuyNumbersCollection` 函数是否正确处理回测结果数据
- [ ] 检查 `extractBuyNumbersCollection` 函数是否正确排序号码并返回第1名和最后1名
- [ ] 测试回测26025期，回测期数20，倒数2期的结果是否为第1名是9，最后1名是5,2,11,12
- [ ] 测试其他回测方法的结果是否正常显示
- [ ] 验证页面是否能正常加载和运行
- [ ] 比较深度预测页面和开奖预测页面的回测逻辑是否一致
- [ ] 比较深度预测页面和开奖预测页面的回测结果是否相同
