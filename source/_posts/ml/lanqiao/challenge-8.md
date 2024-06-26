---
layout: post
title: 挑战八
date: 2024-05-18 01:07:03
categories: 机器学习
---

# 线性回归和随机梯度下降

- 问题：按下面的要求实现随机梯度下降线性回归类。
  - 类名为 `SGDRegressor`，其继承自 `sklearn.base.BaseEstimator`
  - 构造函数接受参数 `eta` 学习率（默认为 $10^{-3}$ ）和 `n_epochs` 全数据集迭代次数（默认为 3）
  - 构造函数创建 `mse_` 和 `weights_` 列表，以便在梯度下降迭代期间追踪均方误差和权重向量
  - 该类需包含 `fit` 和 `predict` 方法用于训练和预测
  - `fit` 方法可接受矩阵 `X` 和向量 `y`（`numpy.array` 对象）作为参数。该方法可自动在 `X` 左侧追加一列全为 `1` 的值作为截距项系数，权重 `w` 则统一用零初始化。然后进行 `n_epochs` 权重更新迭代，并将每次迭代后的均方误差 MSE 和权重向量记录在预先初始化的空列表中
  - `fit` 方法返回 `SGDRegressor` 类的当前实例，即 `self`
  - `predict` 方法可接受矩阵 `X` 矩阵，同样需支持自动在 `X` 左侧追加一列全为 `1` 的值作为截距项系数，并使用由 `fit` 方法得到的权重向量 `w_` 计算后返回预测向量

  ```python
  class SGDRegressor(BaseEstimator):
    def __init__(self, eta=1e-3, n_epochs=3):
        self.eta = eta
        self.n_epochs = n_epochs
        self.mse_ = []
        self.weights_ = []
  
    def fit(self, X, y):
        X = np.hstack([np.ones([X.shape[0], 1]), X])
        w = np.zeros(X.shape[1])
        for it in tqdm(range(self.n_epochs)):
            for i in range(X.shape[0]):
                new_w = w.copy()
                new_w[0] += self.eta * (y[i] - w.dot(X[i, :]))
                for j in range(1, X.shape[1]):
                    new_w[j] += self.eta * (y[i] - w.dot(X[i, :])) * X[i, j]
                w = new_w.copy()
                self.weights_.append(w)
                self.mse_.append(mean_squared_error(y, X.dot(w)))
        self.w_ = self.weights_[np.argmin(self.mse_)]
        return self
  
    def predict(self, X):
        X = np.hstack([np.ones([X.shape[0], 1]), X])
        return X.dot(self.w_)
  ```
