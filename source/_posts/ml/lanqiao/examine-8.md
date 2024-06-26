---
layout: post
title: 实验八
date: 2024-05-18 01:06:04
categories: 机器学习
mathjax: true
---

# 随机梯度下降和独热编码

## 随机梯度下降

- 一种优化算法，理解简单

- 复杂模型或数据上难以获得较好的优化效果

- 向函数切线下降方向移动，能更快地找到函数的极小值（极小是局部最小值）

- 损失函数：
  $$
  SE(w_0, w_1) = \frac{1}{2}\sum_{i=1}^{n}(y_i - (w_0 + w_1x_{i}))^2 \rightarrow \min_{w_0, w_1}
  $$

- 偏导数，其中 $\eta$ 为学习率：
  $$
  \begin{align}
  w_0^{(t+1)} = w_0^{(t)} -\eta \frac{\partial SE}{\partial w_0} |_{t}
  = w_0^{(t)} + \eta \sum_{i=1}^{n}(y_i - w_0^{(t)} - w_1^{(t)}x_i) \\
  w_1^{(t+1)} = w_1^{(t)} -\eta \frac{\partial SE}{\partial w_1} |_{t}
  = w_1^{(t)} + \eta \sum_{i=1}^{n}(y_i - w_0^{(t)} - w_1^{(t)}x_i)x_i
  \end{align}
  $$

- 每次迭代仅用一些小样本来进行运算，然后迭代更新权重，极大的提高了计算效率

- 一小批数据并不一定等同于整体数据，其梯度与整体数据可能不同，需要更多次迭代才能收敛

- 在随机梯度下降方法中，随着迭代次数的增加，权重的更新方向会更难预测

### 在线学习方法

- 核心思想：将训练数据集 $(X,y)$​ 存储在电脑的硬盘中而不将其加载到运行内存中，然后在训练模型时逐个读取，并更新模型的权重：
  $$
  \begin{align}
  w_0^{(t+1)} = w_0^{(t)} + \eta (y_i - w_0^{(t)} - w_1^{(t)}x_i) \\
  w_1^{(t+1)} = w_1^{(t)} + \eta (y_i - w_0^{(t)} - w_1^{(t)}x_i)x_i
  \end{align}
  $$

*sklearn* 提供了 `sklearn.linear_model.SGDClassifier` 和 `sklearn.linear_model.SGDRegressor` 实现随机梯度下降分类和回归。

## 类别型特征处理

- 将类别型数据转换成为数值型数据最直接的解决方法就是将此特征的每个值映射到一个唯一的数字
- `sklearn.preprocessing.LabelEncoder` 可以帮助我们实现离散特征编码

### 独热编码

- *One-Hot Encoding* ，仅使用布尔向量表示类别特征
- 若一个特征存在 $n$ 个类别值，则将其转换为 $n$ 维布尔向量
- `sklearn.preprocessing.OneHotEncoder` 可以帮助我们实现编码
- `OneHotEncoder` 默认使用稀疏矩阵（*Sparse Matrix*）节省内存空间

## 扩展知识

- 梯度下降的数学运算过程：[《深度学习》](http://www.deeplearningbook.org/contents/numerical.html)
- 吴恩达《机器学习》课程：[Coursea](https://www.coursera.org/learn/machine-learning)
- 随机梯度下降算法原理：[《凸优化》](https://www.amazon.com/Convex-Optimization-Stephen-Boyd/dp/0521833787)
- 另一种在线学习方法：[Vowpal Wabbit](https://github.com/JohnLangford/vowpal_wabbit/wiki)
- [深度学习](http://www.deeplearningbook.org/)
- [VW 快速学习方法](http://fastml.com/blog/categories/vw/)
