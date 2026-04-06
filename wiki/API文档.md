# API 文档

本文档详细介绍彩神4项目的所有 API 接口。

**基础 URL**: `http://localhost:18889`

**响应格式**: 所有接口返回 JSON 格式数据

```json
{
  "success": true|false,
  "data": {},
  "message": "提示信息"
}
```

---

## 目录

1. [系统接口](#1-系统接口)
2. [数据获取接口](#2-数据获取接口)
3. [组合分析接口](#3-组合分析接口)
4. [回测接口](#4-回测接口)
5. [深度预测接口](#5-深度预测接口)
6. [幻圆回测接口](#6-幻圆回测接口)

---

## 1. 系统接口

### 1.1 健康检查

检查后端服务运行状态。

```
GET /health
```

**响应示例**:
```json
{
  "status": "ok",
  "message": "后端服务运行正常",
  "routes": 45
}
```

### 1.2 API 列表

获取所有已加载的 API 路由列表。

```
GET /api/list
```

**响应示例**:
```json
{
  "total": 45,
  "routes": ["/huo_qu_sql_shu_ju", "/sql_zui_xin_yi_qi", "/shuang_sha_fen_xi", ...]
}
```

### 1.3 获取 lottery_results 总条数

```
GET /huo_qu_lottery_results_total
```

**响应示例**:
```json
{
  "success": true,
  "total": 2500
}
```

---

## 2. 数据获取接口

### 2.1 获取 SQL 数据

从数据库查询开奖数据。

```
GET /huo_qu_sql_shu_ju
```

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| type | string | 否 | 期数类型: 10, 30, 35, 50, 120, all |
| startIssue | string | 否 | 开始期号 |
| endIssue | string | 否 | 结束期号 |

**请求示例**:
```
GET /huo_qu_sql_shu_ju?type=10
GET /huo_qu_sql_shu_ju?startIssue=25100&endIssue=25121
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "issue": "25121",
      "redBalls": ["1", "5", "12", "23", "30"],
      "blueBalls": ["2", "7"],
      "weekday": "3",
      "sum": "71",
      "span": "29",
      "intervalRatio": "1:2:2",
      "parityRatio": "3:2"
    }
  ],
  "message": "获取开奖数据成功"
}
```

### 2.2 获取最新一期数据

```
GET /sql_zui_xin_yi_qi
```

**响应示例**:
```json
{
  "success": true,
  "latestDraw": {
    "period": "25121",
    "drawDate": "2025-10-22",
    "firstZoneNumbers": ["1", "5", "12", "23", "30"],
    "lastZoneNumbers": ["2", "7"]
  },
  "lastIssue": "25121"
}
```

### 2.3 获取倒数第 N 期数据

支持倒数2-9期，以及通用X期接口。

```
GET /sql_dao_shu_2_qi
GET /sql_dao_shu_3_qi
GET /sql_dao_shu_4_qi
GET /sql_dao_shu_5_qi
GET /sql_dao_shu_6_qi
GET /sql_dao_shu_7_qi
GET /sql_dao_shu_8_qi
GET /sql_dao_shu_9_qi
GET /sql_dao_shu_x_qi?offset=N
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "issue": "25120",
    "draw_date": "2025-10-20",
    "red": "[3, 8, 15, 24, 33]",
    "blue": "[5, 11]"
  }
}
```

### 2.4 获取近两期数据

```
GET /sql_jin_liang_qi
```

### 2.5 根据期号获取开奖信息

```
GET /sql_kai_jiang_info?period=25121
```

**响应示例**:
```json
{
  "success": true,
  "drawInfo": {
    "period": "25121",
    "drawDate": "2025-10-22",
    "firstZoneNumbers": [1, 5, 12, 23, 30],
    "lastZoneNumbers": [2, 7]
  }
}
```

### 2.6 获取近五期开奖数据

```
GET /huo_qu_jin_wu_qi_kai_jiang
```

### 2.7 获取体彩数据（外部数据源）

从 sporttery.cn 获取最新开奖数据（不写入数据库）。

```
GET /huo_qu_ti_cai_shu_ju
```

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startIssue | string | 否 | 起始期号，只返回大于此期号的数据 |

**响应示例**:
```json
{
  "success": true,
  "message": "获取体彩开奖数据成功",
  "latestResults": [
    {
      "issue": "25121",
      "drawDate": "2025-10-22",
      "weekday": "3",
      "redBalls": ["01", "05", "12", "23", "30"],
      "blueBalls": ["02", "07"],
      "sum": "71",
      "span": "29",
      "intervalRatio": "1:2:2",
      "parityRatio": "3:2"
    }
  ],
  "lastIssue": "25121"
}
```

### 2.8 更新开奖数据

从 sporttery.cn 获取数据并同步到数据库。

```
GET /geng_xin
```

**响应示例**:
```json
{
  "success": true,
  "message": "成功更新了 3 条新数据",
  "updatedCount": 3,
  "lastIssue": "25121",
  "latestResults": [...]
}
```

### 2.9 获取最新数据列表

```
GET /getLatestData
```

---

## 3. 组合分析接口

### 3.1 双杀分析（最新1期）

分析最新一期前区两球组合在下一期的出现情况。

```
GET /shuang_sha_fen_xi
```

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| period | string | 是 | 统计周期: 35, 50, 100, 200, 300, 500, 1000, all |
| target_period | string | 否 | 目标期号，不填则使用最新一期 |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "latestDraw": {
      "issue": "25121",
      "frontNumbers": [1, 5, 12, 23, 30],
      "backNumbers": [2, 7]
    },
    "frontCombinations": [...],
    "backCombinations": [...],
    "recommendedFrontKillNumbers": [2, 3, 4, ...],
    "recommendedBackKillNumbers": [1, 3, 4, ...]
  }
}
```

### 3.2 倒数第2期双杀分析

```
GET /dao_shu_2_qi_shuang_sha_fen_xi
```

### 3.3 三球分析

```
GET /san_qiu_fen_xi
```

### 3.4 倒数第 N 期两球组合（前区）

```
GET /dao_shu_2_qi_liang_qiu_zu_he?period=100
GET /dao_shu_3_qi_liang_qiu_zu_he?period=100
GET /dao_shu_4_qi_liang_qiu_zu_he?period=100
GET /dao_shu_5_qi_liang_qiu_zu_he?period=100
GET /dao_shu_6_qi_liang_qiu_zu_he?period=100
GET /dao_shu_7_qi_liang_qiu_zu_he?period=100
GET /dao_shu_8_qi_liang_qiu_zu_he?period=100
GET /dao_shu_9_qi_liang_qiu_zu_he?period=100
```

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| period | string | 是 | 统计周期 |
| target_period | string | 否 | 目标期号 |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "secondLastDraw": {
      "issue": "25120",
      "firstZoneNumbers": [3, 8, 15, 24, 33]
    },
    "combinations": [
      {
        "combo": "3-8",
        "count": 5,
        "nextDrawNumbers": [...],
        "numberCounts": {"1": 2, "5": 3, ...}
      }
    ],
    "recommendedFrontKillNumbers": [2, 4, 6, ...]
  }
}
```

### 3.5 倒数第 N 期两球组合（后区）

```
GET /dao_shu_2_qi_hou_qu_zu_he?period=100
GET /dao_shu_3_qi_hou_qu_zu_he?period=100
...
GET /dao_shu_9_qi_hou_qu_zu_he?period=100
```

### 3.6 近两期两球组合

```
GET /jin_liang_qi_liang_qiu_zu_he_front?period=100  # 前区
GET /jin_liang_qi_liang_qiu_zu_he_back?period=100   # 后区
```

### 3.7 倒数第 N 期三球组合

```
GET /dao_shu_2_qi_san_qiu_zu_he?period=100
GET /dao_shu_3_qi_san_qiu_zu_he?period=100
```

---

## 4. 回测接口

### 4.1 杀号回测（最新1期）

```
GET /huo_qu_sha_hao_hui_ce
```

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| backtest_period | string | 是 | 回测期数 |
| stats_period | string | 是 | 统计期数 |
| backtest_method | string | 是 | 回测方法: most, least, average, rank |

### 4.2 倒数第 N 期杀号回测（前区）

```
GET /dao_shu_2_qi_sha_hao_hui_ce?backtest_period=100&stats_period=100&backtest_method=most
GET /dao_shu_3_qi_sha_hao_hui_ce?...
GET /dao_shu_4_qi_sha_hao_hui_ce?...
GET /dao_shu_5_qi_sha_hao_hui_ce?...
```

### 4.3 倒数第 N 期杀号回测（后区）

```
GET /dao_shu_2_qi_hou_qu_sha_hao_hui_ce?...
GET /dao_shu_3_qi_hou_qu_sha_hao_hui_ce?...
GET /dao_shu_4_qi_hou_qu_sha_hao_hui_ce?...
GET /dao_shu_5_qi_hou_qu_sha_hao_hui_ce?...
```

### 4.4 近两期杀号回测

```
GET /jin_liang_qi_qian_qu_sha_hao_hui_ce?...   # 前区
GET /jin_liang_qi_hou_qu_sha_hao_hui_ce?...    # 后区
```

### 4.5 三球杀号回测

```
GET /san_qiu_sha_hao_hui_ce?...                # 最新1期
GET /dao_shu_2_qi_san_qiu_sha_hao_hui_ce?...   # 倒数2期
GET /dao_shu_3_qi_san_qiu_sha_hao_hui_ce?...   # 倒数3期
```

### 4.6 买号回测（最新1期前区）

```
GET /huo_qu_sha_hao_mai_hao_hui_ce
```

### 4.7 买号回测（最新1期后区）

```
GET /huo_qu_sha_hao_hou_mai_hao_hui_ce
```

### 4.8 倒数第 N 期买号回测（前区）

```
GET /dao_shu_2_qi_mai_hao_hui_ce?...
GET /dao_shu_3_qi_mai_hao_hui_ce?...
GET /dao_shu_4_qi_mai_hao_hui_ce?...
GET /dao_shu_5_qi_mai_hao_hui_ce?...
GET /dao_shu_6_qi_mai_hao_hui_ce?...
```

### 4.9 倒数第 N 期买号回测（后区）

```
GET /huo_qu_dao_shu_2_qi_hou_mai_hao_hui_ce?...
GET /huo_qu_dao_shu_3_qi_hou_mai_hao_hui_ce?...
GET /huo_qu_dao_shu_4_qi_hou_mai_hao_hui_ce?...
GET /huo_qu_dao_shu_5_qi_hou_mai_hao_hui_ce?...
```

### 4.10 近两期买号回测

```
GET /jin_liang_qi_mai_hao_hui_ce?...           # 前区
GET /jin_liang_qi_hou_qu_mai_hao_hui_ce?...    # 后区
```

### 4.11 三球买号回测

```
GET /san_qiu_mai_hao_hui_ce?...
GET /dao_shu_2_qi_san_qiu_mai_hao_hui_ce?...
GET /dao_shu_3_qi_san_qiu_mai_hao_hui_ce?...
```

### 4.12 保存回测结果

```
POST /bao_cun_hui_ce_jie_guo
```

**请求体**:
```json
{
  "cache_key": "backtest_front_most_100_25121",
  "backtest_results": [...],
  "current_period": "25121",
  "backtest_period": "100"
}
```

### 4.13 获取回测结果

```
GET /huo_qu_hui_ce_jie_guo?cache_key=backtest_front_most_100_25121
```

---

## 5. 深度预测接口

### 5.1 前区深度预测

#### 保存深度预测数据

```
POST /qian_qu_shen_du_yu_ce/save_shen_du_yu_ce_data
```

**请求体**:
```json
{
  "period": 25121,
  "backtest_period": 100,
  "backtest_results": [
    {
      "cardIndex": 0,
      "cardName": "卡片1",
      "buyNumbersCollection": [...]
    }
  ]
}
```

#### 获取深度预测数据

```
GET /qian_qu_shen_du_yu_ce/get_shen_du_yu_ce_data?period=25121&backtest_period=100
```

#### 删除深度预测数据

```
DELETE /qian_qu_shen_du_yu_ce/delete_shen_du_yu_ce_data?period=25121&backtest_period=100
```

### 5.2 后区深度预测

#### 保存深度预测数据

```
POST /hou_qu_shen_du_yu_ce/save_shen_du_yu_ce_data
```

#### 获取深度预测数据

```
GET /hou_qu_shen_du_yu_ce/get_shen_du_yu_ce_data?period=25121&backtest_period=100
```

#### 删除深度预测数据

```
DELETE /hou_qu_shen_du_yu_ce/delete_shen_du_yu_ce_data?period=25121&backtest_period=100
```

---

## 6. 幻圆回测接口

### 6.1 镜像对称回测

```
GET /huan_yuan_hui_ce_jing_xiang?backtest_period=100&backtest_method=most
```

### 6.2 轴线对称回测

```
GET /huan_yuan_hui_ce_zhou_xian?backtest_period=100&backtest_method=most
```

### 6.3 圆环对称回测

```
GET /huan_yuan_hui_ce_yuan_huan?backtest_period=100&backtest_method=most
```

### 6.4 互补对称回测

```
GET /huan_yuan_hui_ce_hu_bu?backtest_period=100&backtest_method=most
```

### 6.5 冷热对称回测

```
GET /huan_yuan_hui_ce_re_leng?backtest_period=100&backtest_method=most
```

**幻圆回测通用参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| backtest_period | string | 是 | 回测期数或 all |
| stats_period | string | 否 | 统计期数（已弃用，默认100） |
| backtest_method | string | 否 | 回测方法: most, least, average |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "backtestResults": [
      {
        "period": "25120",
        "nextPeriod": "25121",
        "frontNumbers": [3, 8, 15, 24, 33],
        "nextFrontNumbers": [1, 5, 12, 23, 30],
        "recommendedKillNumbers": [2, 4, 6, ...],
        "frontCorrectKill": 3,
        "frontWrongKill": 0
      }
    ],
    "backtestMethod": "most",
    "backtestPeriod": "100",
    "statsPeriod": "100"
  }
}
```

---

## 7. 组合详情接口

### 7.1 通用组合详情

```
POST /zuhe/zu_he_xiang_qing
```

**请求体**:
```json
{
  "latest_period": "25121",
  "type": "front",
  "combinations": ["1-5", "12-23"],
  "stats_range": 100,
  "target_ball": null
}
```

### 7.2 倒数第 N 期两球组合详情

```
POST /zuhe/dao_shu_2_qi_liang_qiu_zu_he_xiang_qing
POST /zuhe/dao_shu_3_qi_liang_qiu_zu_he_xiang_qing
...
POST /zuhe/dao_shu_9_qi_liang_qiu_zu_he_xiang_qing
```

### 7.3 近两期两球组合详情

```
POST /zuhe/jin_liang_qi_liang_qiu_zu_he_xiang_qing
```

### 7.4 倒数第 N 期三球组合详情

```
GET /dao_shu_2_qi_san_qiu_zu_he_xiang_qing
GET /dao_shu_3_qi_san_qiu_zu_he_xiang_qing
```

---

## 8. 其他接口

### 8.1 期号开奖信息

```
GET /qi_hao_kai_jiang_xin_xi?period=25121
```

**响应示例**:
```json
{
  "success": true,
  "drawInfo": {
    "period": "25121",
    "drawDate": "2025-10-22",
    "firstZoneNumbers": [1, 5, 12, 23, 30],
    "lastZoneNumbers": [2, 7]
  }
}
```

### 8.2 还原九转连环图

```
GET /huan_yuan_jiu_zhuan_lian_huan_tu
```

### 8.3 倒数2期推荐杀号

```
GET /dao_shu_2_qi_tui_jian_sha_hao
```

---

## 附录：回测方法说明

| 方法 | 说明 |
|------|------|
| most | 选择出现次数最多的号码作为买号 |
| least | 选择出现次数最少的号码作为买号 |
| average | 选择出现次数接近平均值的号码 |
| rank | 按排名选择号码 |

---

*了解算法实现细节，请参考 [核心算法](./核心算法.md)*
