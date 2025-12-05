## 问题分析

用户需要在dao\_shu\_2\_qi\_san\_qiu\_sha\_hao\_hui\_ce\_xiang\_qing.html页面中增加“回测期数”和“统计期数”下拉框，并实现以下功能：

1. 当回测期数改变后，下方的杀号回测结果列表的数据跟着改变
2. 当统计期数改变后，列表的前区推荐杀号算法也要跟着统计期数改变
3. 在这个页dao\_shu\_2\_qi\_san\_qiu\_zu\_he.html点击“查看回测结果”跳转到dao\_shu\_2\_qi\_san\_qiu\_sha\_hao\_hui\_ce\_xiang\_qing.html时，参数backtest\_period默认预置为50，参数stats\_period取值选择统计范围所选的期数。

## 解决方案

### 1. 修改前端页面，添加回测期数和统计期数下拉框

**文件：`d:\中啦\caishen4\qian\dao_shu_2_qi_san_qiu_sha_hao_hui_ce_xiang_qing.html`**

* 在第96行之后添加回测期数和统计期数下拉框

* 使用与san\_qiu\_sha\_hao\_hui\_ce\_xiang\_qing.html页面类似的HTML结构

### 2. 修改后端代码，使其能够接受backtest\_period和stats\_period两个参数

**文件：`d:\中啦\caishen4\hou\dao_shu_2_qi_san_qiu_sha_hao_hui_ce.js`**

* 修改getDaoShu2QiSanQiuShaHaoHuiCe函数，使其接受backtest\_period和stats\_period两个参数

* 修改SQL查询，使用backtest\_period作为历史数据的查询数量，使用stats\_period作为统计数据的查询数量

* 修改路由处理函数，使其接受backtest\_period和stats\_period两个参数

### 3. 修改前端JavaScript代码，处理下拉框变化并发送请求

**文件：`d:\中啦\caishen4\qian\dao_shu_2_qi_san_qiu_sha_hao_hui_ce_xiang_qing.html`**

* 修改huo\_qu\_dao\_shu\_2\_qi\_san\_qiu\_sha\_hao\_hui\_ce函数，使其接受backtest\_period和stats\_period两个参数

* 修改fetchAndRenderBacktestData函数，使其接受backtest\_period和stats\_period两个参数

* 添加代码，处理回测期数和统计期数下拉框的变化

* 在下拉框变化时，调用fetchAndRenderBacktestData函数，使用新的参数获取数据

## 修复步骤

1. 修改前端页面，添加回测期数和统计期数下拉框
2. 修改后端代码，使其能够接受backtest\_period和stats\_period两个参数
3. 修改前端JavaScript代码，处理下拉框变化并发送请求
4. 测试修复后的功能，确保回测期数和统计期数下拉框正常工作

## 预期效果

* 在dao\_shu\_2\_qi\_san\_qiu\_sha\_hao\_hui\_ce\_xiang\_qing.html页面中增加了“回测期数”和“统计期数”下拉框

* 当回测期数改变后，下方的杀号回测结果列表的数据跟着改变

* 当统计期数改变后，列表的前区推荐杀号算法也要跟着统计期数改变

