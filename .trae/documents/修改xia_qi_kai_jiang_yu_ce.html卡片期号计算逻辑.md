## 修改计划

### 1. 倒数3期两球组合平均率最高统计期详情
- **当前逻辑**：`nextNextNextPeriod = (parseInt(lastPeriod) + 3) + '期'`
- **要求**：下下下期期号应该是它所在行的当前回测期号的下下下期期号
- **修改位置**：`performSearchThirdLast`函数
- **修改内容**：将下下下期期号的计算改为基于当前回测期号

### 2. 倒数4期两球组合平均率最高统计期详情
- **当前逻辑**：`nextNextNextNextPeriod = (parseInt(lastPeriod) + 4) + '期'`
- **要求**：下下下下期期号应该是它所在行的当前回测期号的下下下下期期号
- **修改位置**：`performSearchFourthLast`函数
- **修改内容**：将下下下下期期号的计算改为基于当前回测期号

### 3. 倒数5期两球组合平均率最高统计期详情
- **预计当前逻辑**：类似倒数3期和倒数4期，基于lastPeriod计算
- **要求**：下下下下下期期号应该是它所在行的当前回测期号的下下下下下期期号
- **修改位置**：`performSearchFifthLast`函数
- **修改内容**：将下下下下下期期号的计算改为基于当前回测期号

### 4. 近两期两球组合平均率最高统计期详情
- **要求**：
  - 当前回测期号应该是"最新1期的期号和倒数2期的期号"
  - 下一期期号应该是最新1期期号的下一期期号
- **修改位置**：`performSearchNearTwoPeriods`函数
- **修改内容**：
  - 修改当前回测期号的显示格式
  - 修改下一期期号的计算逻辑

### 5. 最新1期三球组合平均率最高统计期详情
- **要求**：
  - 当前回测期号应该是最新一期的期号
  - 下一期期号应该是最新1期期号的下一期期号
- **修改位置**：`performSearchThreeBall`函数
- **修改内容**：确保当前回测期号和下一期期号的计算符合要求

## 实施步骤

1. 查看`performSearchFifthLast`函数的期号计算逻辑
2. 查看`performSearchThreeBall`函数的期号计算逻辑
3. 修改`performSearchThirdLast`函数的下下下期期号计算
4. 修改`performSearchFourthLast`函数的下下下下期期号计算
5. 修改`performSearchFifthLast`函数的下下下下下期期号计算
6. 修改`performSearchNearTwoPeriods`函数的期号显示和计算
7. 修改`performSearchThreeBall`函数的期号显示和计算
8. 测试修改后的功能是否符合要求