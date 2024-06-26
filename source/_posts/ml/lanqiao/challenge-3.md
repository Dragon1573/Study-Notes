---
layout: post
title: 挑战三
date: 2024-05-16 23:47:58
categories: 机器学习
mathjax: true
---

# 决策树和随机森林分析应用

## 简单示例练习

### 创建示例数据集

在 *Jupyter Notebook* 提供的示例代码中，我们调用了 `pandas.get_dummies()` 函数以实现哑元沉默。其实我们也可以借助这个方法：

和处理 `Will_go` 列相同，我们使用了 `sklearn.preprocessing.LabelEncoder` 对字符串类别字段进行了编码，只要将类别字段数值化，就能够为构建决策树带来帮助。

哑元沉默与类别值映射的区别在于，哑元沉默会将一个类别特征列扩展为多个布尔特征列，扩展过程中的各类别值不存在顺序或强弱关系；但类别值映射（尤其是存在多个类别值时）可能会引入顺序问题，对决策树构建产生误导。

## 计算熵和信息增益

- 问题：请根据前面的实验内容实现香农熵计算函数 `entropy()`。

  > ```python
  > def entropy(array):
  >     from collections import Counter
  >     c = Counter(array)
  >     _entropy, total = 0, len(array)
  >     return - np.sum(v / total * np.log2(v / total) for v in c.values())
  > ```
  >
  > 首先，借助 `collections.Counter` 类可以方便地统计列表中各元素值的数量；随后，根据公式累计各元素值部分产生的香农熵，即可获得总体香农熵。

- 问题：请实现信息增益的计算函数 `information_gain()` 。

  > 条件熵计算公式为
  > $$
  > H(Y|X)=\sum_{x\in X}{p(x)H(Y|X=x)}
  > $$
  > 信息增益计算公式为
  > $$
  > G=S-\sum_{x\in X}{P(X=x)H(Y|X=x)}
  > $$
  >
  > ```python
  > def information_gain(root, left, right):
  >     _root, _left, _right = len(root), len(left), len(right)
  >     return entropy(root) - _left / _root * entropy(left) - _right / _root * entropy(right)
  > ```

## 建立默认参数决策树模型

- 问题：按挑战要求构建决策树，并输出其在测试集上的准确度？

  > ```python
  > tree = DecisionTreeClassifier(max_depth=3, random_state=17)
  > tree.fit(X_train, y_train)
  > accuracy_score(y_test, tree.predict(X_test))
  > ```

## 对决策树模型进行调参

- 问题：使用 GridSearchCV 网格搜索对决策树进行调参并返回最佳参数，其中决策树参数 `random_state = 17`，GridSearchCV 参数 `cv=5`，并对 `max_depth` 参数在 $[8,10]$ 范围进行网格搜索。

  > ```python
  > tree = DecisionTreeClassifier(random_state=17)
  > param_grid = {'max_depth': range(8, 11)}
  > gscv = GridSearchCV(tree, param_grid, cv=5)
  > ```

- 问题：构建上面最佳参数决策树，并输出其在测试集上的准确度？

  > ```python
  > gscv.fit(X_train, y_train)
  > accuracy_score(y_test, gscv.best_estimator_.predict(X_test))
  > ```
  >
  > 对于 `GridSearchCV` 实例，在调用 `.fit()` 进行学习后，可以通过 `.best_estimator_` 获取最优学习器。

## 建立随机森林分类模型

- 问题：构建 RandomForestClassifier 随机森林分类器。挑战规定参数 `n_estimators=100` 且 `random_state=17`，其余默认。

  > ```python
  > forest = RandomForestClassifier(n_estimators=100, random_state=17)
  > forest.fit(X_train, y_train)
  > ```

- 问题：输出在测试集上的分类预测准确度。

  > ```python
  > accuracy_score(y_test, forest.predict(X_test))
  > ```
