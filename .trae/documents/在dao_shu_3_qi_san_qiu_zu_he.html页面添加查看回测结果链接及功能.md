# 在dao_shu_3_qi_san_qiu_zu_he.html页面添加查看回测结果链接及功能

## 需求分析
用户要求在dao_shu_3_qi_san_qiu_zu_he.html页面的“前区推荐杀号”区域添加"查看回测结果"链接，点击后跳转到"倒数3期三球组合前区杀号回测结果页"，实现回测统计范围内的推荐杀号与真实开奖结果对比功能。

## 实现步骤

### 1. 检查现有文件和接口
- 检查是否存在 `dao_shu_3_qi_san_qiu_sha_hao_hui_ce_xiang_qing.html` 页面
- 检查后端是否存在 `dao_shu_3_qi_san_qiu_sha_hao_hui_ce.js` 接口

### 2. 修改 `dao_shu_3_qi_san_qiu_zu_he.html` 页面
- 在“前区推荐杀号”区域的section-header中添加"查看回测结果"链接
- 为链接添加点击事件，跳转到回测结果页面
- 确保链接样式与页面整体风格一致

### 3. 创建回测结果页面（如果不存在）
- 创建 `dao_shu_3_qi_san_qiu_sha_hao_hui_ce_xiang_qing.html` 页面
- 页面结构参考其他回测结果页面
- 包含回测结果列表，显示所需字段

### 4. 创建后端回测接口（如果不存在）
- 创建 `dao_shu_3_qi_san_qiu_sha_hao_hui_ce.js` 接口
- 实现与 `dao_shu_3_qi_san_qiu_zu_he` 相同的前区推荐杀号算法
- 实现回测逻辑，计算下下下期的正确杀号数量和错误杀号数量
- 返回符合要求的回测结果格式

### 5. 测试验证
- 确保链接正常显示和跳转
- 确保回测接口返回正确的数据格式
- 确保回测结果页面正确显示数据
- 确保回测算法逻辑与原页面一致

## 技术要点
- 使用与原页面相同的推荐杀号算法
- 回测结果包含：当前回测期号、前区推荐杀号、下下下期开奖期号、下下下期实际开奖前区、正确杀号数量、错误杀号数量
- 保持页面样式的一致性
- 确保前后端数据格式匹配

## 具体修改内容

### 1. 修改 `dao_shu_3_qi_san_qiu_zu_he.html` 页面
在第134行之后添加"查看回测结果"链接：
```html
<div class="section-header" style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
  <h3 style="margin: 0;">前区推荐杀号</h3>
  <div>
    <a href="dao_shu_3_qi_san_qiu_sha_hao_hui_ce_xiang_qing.html" style="color: #1890ff; text-decoration: none;">查看回测结果</a>
  </div>
</div>
```

### 2. 创建回测结果页面
参考其他回测结果页面结构，创建包含回测结果列表的页面

### 3. 创建后端回测接口
实现与 `dao_shu_3_qi_san_qiu_zu_he` 相同的推荐杀号算法，并添加回测逻辑

### 4. 配置后端路由
在 `server.js` 中添加回测接口路由

## 预期效果
- 在dao_shu_3_qi_san_qiu_zu_he.html页面的“前区推荐杀号”区域显示"查看回测结果"链接
- 点击链接跳转到回测结果页面
- 回测结果页面显示符合要求的回测数据
- 回测算法逻辑与原页面一致