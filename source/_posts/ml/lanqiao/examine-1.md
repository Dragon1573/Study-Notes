---
title: 实验一
date: 2024-05-16 23:41:45
layout: post
categories: 机器学习
---

# 使用 Pandas 进行数据探索

## 列名、行名和行号的索引

在 `pandas.DataFrame` 中，表格切片 `df[:n]` 和 `df[:-n]` 可以分别使用 `df.head(n)` 和 `df.tail(n)` 替换。

## DataFrame.apply + lambda 实现条件过滤

示例中的过滤条件 `df['State'].apply(lambda state: state[0] == 'W')` 可以进一步简化为 `df['State'].str[0] == 'W'` ，使用 `.str` 方法将 `pandas.Series` 数据类型转换为字符串，用下标索引或数组切片方式获取所有元素的指定字符串片段。

## Groupby 分组

Pandas 对数据分组提供了『惰性求值』特性支持，在对分组结果调用统计学函数（例如 `describe()` 和 `agg()`）之前并不会对 DataFrame 数据集实际执行分组操作。

## DataFrame 列求和

在『增减 DataFrame 的行列』一节中，我们通过加法运算符累计4列数据统计出所有用户的总通话次数。此处，我们可以借助 Pandas 内置的 `.sum(axis=1)` 方法对给定列进行求和。

```python
total_calls = df[['Total day calls', 'Total eve calls',
                  'Total night calls', 'Total intl calls']].sum(axis=1)
```
