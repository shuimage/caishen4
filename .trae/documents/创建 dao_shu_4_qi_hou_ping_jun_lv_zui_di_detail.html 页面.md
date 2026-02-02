# 创建 dao_shu_4_qi_hou_ping_jun_lv_zui_di_detail.html 页面

## 1. 页面结构和内容修改

- 参考 `sha_hao_hou_ping_jun_lv_zui_di_detail.html` 页面的结构
- 修改页面标题为"倒数4期两球组合后区平均率最低统计期详情"
- 修改卡片标题和描述，使其与倒数4期相关
- 修改表格列标题为"下下下下期后区推荐买号"

## 2. API 调用修改

- 修改获取回测数据的API调用：从 `huo_qu_sha_hao_hou_mai_hao_hui_ce` 改为 `huo_qu_dao_shu_4_qi_hou_mai_hao_hui_ce`
- 修改获取后区推荐买号的API调用：从 `shuang_sha_fen_xi` 改为 `dao_shu_4_qi_hou_qu_zu_he`
- 确保传递正确的参数，包括回测期数、统计期数和回测方法

## 3. 算法实现修改

- 实现与 `dao_shu_4_qi_liang_qiu_zu_he.html` 页面中"后区推荐买号"卡片相同的算法
- 初始化汇总计数数组，用于统计后区号码的出现次数
- 遍历后区组合，统计每个号码的出现次数
- 根据回测方法（出现最多、出现最少、出现平均）计算推荐买号
- 确保算法逻辑与参考页面完全一致

## 4. 期号计算修改

- 修改 `getLatestPeriod` 函数，使其计算"下下下下期"的期号
- 确保期号计算逻辑正确，与倒数4期的概念一致

## 5. 其他细节修改

- 确保所有变量名和函数名与倒数4期相关
- 确保错误处理和提示信息与其他页面一致
- 确保页面样式和主题支持与其他页面一致
- 确保从 `dao_shu_4_qi_mai_hao_hui_ce_hou_xiang_qing.html` 页面点击"平均率最低"按钮能够正确跳转到新页面

## 6. 测试和验证

- 测试页面加载和导航功能
- 测试回测数据获取和显示功能
- 测试后区推荐买号算法的正确性
- 测试响应式设计和主题切换功能
- 确保所有功能与其他相关页面保持一致

## 实现步骤

1. 复制 `sha_hao_hou_ping_jun_lv_zui_di_detail.html` 文件，并重命名为 `dao_shu_4_qi_hou_ping_jun_lv_zui_di_detail.html`
2. 修改页面标题和内容，使其专注于倒数4期后区数据
3. 修改 API 调用，使用倒数4期相关的接口
4. 实现后区推荐买号算法，与 `dao_shu_4_qi_liang_qiu_zu_he.html` 一致
5. 更新页面渲染逻辑，确保显示后区数据
6. 测试功能，确保所有流程正常运行