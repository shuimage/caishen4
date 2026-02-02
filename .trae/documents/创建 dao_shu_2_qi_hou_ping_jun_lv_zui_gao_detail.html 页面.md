# 创建 dao_shu_2_qi_hou_ping_jun_lv_zui_gao_detail.html 页面

## 1. 页面结构创建
- 复制 `sha_hao_hou_ping_jun_lv_zui_gao_detail.html` 页面的基本结构到新文件 `dao_shu_2_qi_hou_ping_jun_lv_zui_gao_detail.html`
- 修改页面标题和所有相关文本内容，将"最新1期"改为"倒数2期"
- 将"下一期后区推荐买号"改为"下下期后区推荐买号"

## 2. API 调用修改
- 修改获取回测数据的函数，从调用 `huo_qu_sha_hao_hou_mai_hao_hui_ce` 改为调用 `huo_qu_dao_shu_2_qi_hou_mai_hao_hui_ce`
- 修改获取后区推荐买号的函数，使用与 `dao_shu_2_qi_liang_qiu_zu_he.html` 页面相同的 API

## 3. 算法实现
- 实现与 `dao_shu_2_qi_liang_qiu_zu_he.html` 页面相同的后区推荐买号算法
- 算法步骤：
  1. 获取后区两球组合分析数据
  2. 初始化汇总计数数组 `backTotalCounts`（索引0不使用，1-12对应后区号码）
  3. 遍历后区组合，统计每个号码的出现次数
  4. 根据回测方法计算对应的后区推荐买号：
     - 出现最多球：找到 `backTotalCounts` 中的最大值对应的号码
     - 出现最少球：找到 `backTotalCounts` 中除0以外的最小值对应的号码
     - 出现平均球：找到 `backTotalCounts` 中次数等于平均值的号码

## 4. 功能测试
- 确保 `dao_shu_2_qi_mai_hao_hui_ce_hou_xiang_qing.html` 页面的"平均率最高"按钮正确链接到新页面
- 测试新页面的搜索功能是否正常工作
- 验证后区推荐买号算法是否正确实现
- 确保页面在不同主题下显示正常

## 5. 文档更新
- 在"文档说明.md"中添加新页面的核心功能说明，包括页面的导航栏、页面的功能、页面的样式等

## 技术要点
- 保持与参考页面的结构和样式一致性
- 确保 API 调用正确，使用倒数2期的相关接口
- 实现与 `dao_shu_2_qi_liang_qiu_zu_he.html` 页面相同的后区推荐买号算法
- 确保页面在不同主题下显示正常
- 遵循项目的命名规范和代码风格