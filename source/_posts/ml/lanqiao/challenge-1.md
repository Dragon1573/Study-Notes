---
layout: post
title: 挑战一
date: 2024-05-16 23:42:22
categories: 机器学习
---

# 人口收入普查数据探索

第9题解答逻辑有误，原题为

> 统计男性高收入人群中已婚和未婚（包含离婚和分居）人群各自所占数量。

而答案的计算结果对应为

> 统计男性未婚（包括利益和分居）人群中各收入等级各自所占的人数。

与原题逻辑匹配的参考代码如下：

```python
data[
    (data['salary'] == '>50K') & (data['sex'] == 'Male')
]['marital-status'].isin(
    ['Never-married', 'Separated', 'Divorced']
).replace({True: 'Married', False: 'Not yet'}).value_counts()
```
统计得到其中已婚人数 6004 人，未婚（包括离婚和分居） 658 人。
