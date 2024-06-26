---
layout: post
title: 挑战五
date: 2024-05-18 00:57:51
categories: 机器学习
---

# 构建信用评分预测分类模型

## 信用评分预测任务

### 问题

- 对于分类问题，可以在统计学函数 `pandas.Series.value_counts()` 中传入 `normalize=True` 参数，*Pandas* 会帮我们将数据标准化为比例，不需要由我们执行 `series.value_counts() / len(series)` 的操作。

## 区间估计

- 问题：对延迟还款的客户的平均年龄进行间隔估计，置信水平设为 90％。区间估计结果是多少？

  > ```python
  > # 指定随机种子
  > np.random.seed(0)
  >
  > def bootstrap_samples(data: np.ndarray, n_samples: np.int):
  >  """ 用 BootStrap 法生成样本
  >
  >      Parameters
  >      ----------
  >      data: np.ndarray
  >          用于抽样的原始数据集
  >      n_samples: np.int
  >          生成样本的数据量
  >
  >      Returns
  >      -------
  >      bs_data: np.ndarray
  >          抽样完成后的数据集
  >  """
  >  indices = np.random.randint(0, data.shape[0], (n_samples, data.shape[0]))
  >  return data[indices]
  >
  > def stat_intervals(stat: np.ndarray, alpha: np.float):
  >  """ 执行区间估计
  >
  >      Parameters
  >      ----------
  >      stat: np.ndarray
  >          数据集
  >      alpha: np.float
  >          1 - 置信度
  >  """
  >  return np.percentile(
  >      stat, [100 * alpha / 2, 100 * (1 - alpha / 2)]
  >  )
  >
  > # 获取违约用户的年龄数据
  > churn = data[data['SeriousDlqin2yrs'] == 1]['age'].values
  > churn_mean_scores = [np.mean(sample) for sample in bootstrap_samples(churn, 1000)]
  > print('平均值的置信区间为', stat_intervals(churn_mean_scores, 0.1))
  > ```
  >
  > 平均值间隔估计的流程：
  >
  > 1. 对原始数据集进行 *Bootstrap* 抽样
  > 2. 对抽样后的扩增数据集分别求平均值，生成由平均值组成的新数据集
  > 3. 使用 `numpy.percentile()` 获取置信区间边界

## 逻辑回归分类器

- 问题：请使用 `scoring='roc_auc'` 作为评估指标，并运用网格搜索方法来搜索最佳 C 参数，最优值为多少？

  ```python
  grid_search = GridSearchCV(
      estimator=lr, param_grid=parameters, scoring='roc_auc',
      n_jobs=-1, cv=skf, verbose=2, return_train_score=True
  )
  grid_search.fit(X, y)
  ```

- 问题：如果模型测试集上的标准差小于 0.005，则认为模型是稳定的。上面得到的最佳 C 值能否保证模型稳定？

  > ```python
  > # 三个正则化参数对应的测试集评分标准差
  > grid_search.cv_results_['std_test_score']
  > ```
  >
  > 我们得到的 3 个值都大于 0.005 ，因此用于网格搜索的 3 个正则化系数都无法保证模型稳定。

## 特征重要性

- 问题：特征重要性由其相应系数的绝对值定义。首先，您需要使用 `StandardScaler` 规范化所有特征值以便于正确比较。那么，上面得到的最佳逻辑回归模型中，哪个特征最为重要？

  > ```python
  > from sklearn.preprocessing import StandardScaler
  >
  > # 标准规范化
  > X_scaled = StandardScaler().fit_transform(X)
  > # 构建并训练逻辑回归模型
  > lr = LogisticRegression(C=0.001, random_state=5, class_weight='balanced')
  > lr.fit(X_scaled, y)
  > # 导出特征相关性排名
  > pd.DataFrame({
  >  'Feature': independent_columns_names,
  >  'Coefficent': lr.coef_.flatten()
  > }).sort_values(by='Coefficent', ascending=False)
  > ```
  >
  > 特征的重要性可以从逻辑回归模型的 **相关系数** `.coef_` 中得出，此参数会得到一个 $(n_f,1)$ 格式的二维数组，需要调用 `.flatten()` 进行降维。

## 随机森林

- 问题：使用随机森林方法得到的最佳参数比上文中逻辑回归最佳参数在 ROC AUC 指标上高多少？

  > ```python
  > grid_search_rfc = GridSearchCV(
  >  estimator=rf, param_grid=parameters, scoring='roc_auc',
  >  n_jobs=-1, cv=skf, verbose=1, return_train_score=True
  > )
  > grid_search_rfc.fit(X, y)
  > grid_search_rfc.best_score_ - grid_search.best_score_
  > ```
  >
  > 计算结果约为 0.02673。

- 问题：随机森林方法最优模型中，特征重要性最弱的是哪一项？

  > ```python
  > independent_columns_names[np.argmin(
  >  grid_search_rfc.best_estimator_.feature_importances_
  > )]
  > ```
  >
  > 1. 对于网格搜索实例对象，我们可以调用 `.best_estimator_` 获取最优模型
  > 2. 在最优模型上，调用 `.feature_importances_` 获取各特征的重要性指数
  > 3. 调用 `np.argmin()` 函数获取数组中最小值的索引
  > 4. 通过下标索引还原为列名
