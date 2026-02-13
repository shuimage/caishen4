# 分析dao_shu_4_qi_ping_jun_lv_zui_gao_detail.html的处理逻辑

## 核心逻辑分析
1. **回测数据获取**：通过`huo_qu_dao_shu_4_qi_mai_hao_hui_ce`函数调用后端接口获取回测数据
2. **统计期测试**：使用`testStatsPeriod`函数测试单个统计期的平均正确率
3. **多阶段搜索**：在`performSearch`函数中使用多阶段搜索策略，从大到小变化步长寻找平均率最高的统计期
4. **排名方法支持**：支持从rank1到rank30的排名方法
5. **推荐买号计算**：通过`huo_qu_qian_qu_tui_jian_mai_hao`函数计算前区推荐买号
6. **结果渲染**：使用`renderDetailData`函数渲染回测结果

# 修改dao_shu_4_qi_hou_ping_jun_lv_zui_gao_detail.html的计划

## 修改内容
1. **更新后区推荐买号函数**：
   - 修改`huo_qu_hou_qu_tui_jian_mai_hao`函数，添加对排名方法的支持
   - 实现与dao_shu_4_qi_liang_qiu_zu_he.html相同的排名算法

2. **修改执行搜索函数**：
   - 将搜索起始期从20期改为1500期
   - 只使用排名方法（rank1-rank12），移除"出现最多"、"出现最少"、"出现平均"方法
   - 使用顺序测试而非并行回测
   - 添加结果过滤逻辑：如果回测方法、正确率和推荐买号都相同，则去重
   - 添加排序逻辑：按平均正确率降序排序

3. **更新渲染函数**：
   - 修改`renderDetailData`函数，支持显示排名方法的中文名称

4. **确保接口调用正确**：
   - 确保调用正确的后区接口`dao_shu_4_qi_hou_mai_hao_hui_ce`

## 具体步骤
1. 分析dao_shu_4_qi_liang_qiu_zu_he.html中的后区排名算法
2. 修改huo_qu_hou_qu_tui_jian_mai_hao函数，添加排名方法支持
3. 修改performSearch函数，实现从1500期开始的顺序搜索
4. 添加结果过滤和排序逻辑
5. 更新renderDetailData函数，支持排名方法显示
6. 测试修改后的功能是否正常工作