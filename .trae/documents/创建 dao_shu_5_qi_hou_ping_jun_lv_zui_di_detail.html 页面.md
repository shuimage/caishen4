# 创建 dao_shu_5_qi_hou_ping_jun_lv_zui_di_detail.html 页面

## 需求分析
- 创建新页面 `dao_shu_5_qi_hou_ping_jun_lv_zui_di_detail.html`
- 从 `dao_shu_5_qi_mai_hao_hui_ce_hou_xiang_qing.html` 页面点击"平均率最低"按钮进入
- 参考 `sha_hao_hou_ping_jun_lv_zui_di_detail.html` 页面的结构
- 使用倒数5期的数据
- 实现与 `dao_shu_5_qi_liang_qiu_zu_he.html` 页面相同的"后区推荐买号"算法

## 实现计划

### 1. 复制参考页面结构
- 复制 `sha_hao_hou_ping_jun_lv_zui_di_detail.html` 页面的基本结构
- 修改页面标题和所有相关文本内容，以反映倒数5期的上下文

### 2. 修改API调用
- 修改获取后区推荐买号的API调用，使用倒数5期相关的接口
- 确保所有接口调用都使用正确的端点和参数

### 3. 实现算法
- 修改 `huo_qu_hou_qu_tui_jian_mai_hao` 函数
- 实现与 `dao_shu_5_qi_liang_qiu_zu_he.html` 页面相同的算法
- 算法步骤：
  1. 从 `dao_shu_5_qi_hou_qu_zu_he` 接口获取后区组合数据
  2. 统计每个号码的出现次数
  3. 根据回测方法（出现最多、出现最少、出现平均）计算推荐买号

### 4. 更新页面内容
- 修改页面标题为"倒数5期两球组合后区平均率最低统计期详情"
- 更新所有卡片标题和相关文本
- 确保页面导航和返回按钮正常工作

### 5. 测试和验证
- 确保页面可以正常加载
- 测试API调用是否正常
- 验证算法是否正确实现
- 确保页面在不同主题下显示正常

## 关键技术点
- 使用与 `dao_shu_5_qi_liang_qiu_zu_he.html` 页面相同的后区推荐买号算法
- 修改API调用以使用倒数5期相关的接口
- 保持与参考页面相同的整体结构和用户体验
- 确保代码风格和命名约定与现有代码一致