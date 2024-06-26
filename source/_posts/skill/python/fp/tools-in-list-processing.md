---
layout: post
title: 列表处理中的工具
date: 2024-05-18 22:33:09
tags:
  - Python
  - 函数式编程
categories: 技术杂谈
---

## 前言

```python
from toolz import compose, curry
from functools import partial
from operator import add, mul, methodcaller as method
```

也许你早已知道，某个知名函数式编程语言—— LISP ，它的名字正是`LISt Processor`的缩写。函数式语言因其优秀的列表处理能力被广为人知。我们可以认为列表是 Python 常用数据结构之一，因此学习一些函数式特性会相当实用。让我们创建一个列表，它包含前 $10$ 个正整数。

```python
nums = list(range(1, 11))
```

## 第1部分 - 映射、过滤和累积

其中一个在可遍历数据结构中非常有用的函数是 **映射**（`map`），它需要传入 $2$ 个参数：一个单参数函数和一个列表。它会返回一个新列表，其中的每一个元素是原始列表各元素应用了给定函数的结果[^1]。例如，我们可以借助平方函数将前 $10$ 个正整数的列表映射为它们各自的平方。在这，你能看到映射的列表生成器表达法。

```python
# list(map(func, seq)) == [func(x) for x in seq]
squares = list(map(lambda x: x ** 2, nums))
print(squares)
>>> [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]
```

{% note warning %}

`map`函数并不是真的返回了一个列表！在 Python 2.x 中确实是列表，但在 Python 3.x 中，`map`函数返回一个特殊的『映射对象』，我们可以调用`list`函数将它转化为结果列表。但如果你只是需要这么一个对象用于遍历，【一定**不要**】将它转换为列表，这个对象本身是可遍历的，请只在你需要这个结果列表时进行转换。

和`map`函数相同，下面展示的、可以作用于任意可遍历对象上的所有函数都会返回一个特定的可迭代对象（除非是一个具体的数值），但为了直观，我会统一将它们转换为列表的形式。

{% endnote %}

如果我们在`map`里使用了一个具有多个参数的函数，我们既可以部分应用[^2]这个函数，也可以向`map`函数传入多个可遍历数据结构。随后，所有的可遍历结构会被压缩（`zip`）到一起去，而压缩获得的元组（`tuple`）会被作为参数传入到前面的函数中。例如，我们可以像下面这样用`map`映射一个具有 $2$ 个参数的函数。需要注意的是，如果其中一个可遍历对象比另一个短，`map`函数会忽略那些相对最短对象多出来的『冗余』元素。

```python
numsPlusSquares = list(map(add, nums, squares))
print(numsPlusSquares)
>>> [2, 6, 12, 20, 30, 42, 56, 72, 90, 110]
```

另一个常用函数是 **过滤**（`filter`），它传入一个 **谓语表达式** [^3]和一个列表，并只返回那些满足谓语表达式条件的元素。例如，我们可以从`nums`列表中过滤掉非偶数。

```python
# list(filter(pred, seq)) == [x for x in seq if pred(x)]
evens = list(filter(lambda x: not x % 2, nums))
```

还有一个有用的函数是位于`itertools`模块中的 **累积**（`accumulate`）函数。它传入一个列表和一个可选参数——一个拥有 $2$ 个参数的累积函数。如果这个函数没有被特殊指定，那么会被默认设置为加和函数。`accumulate`函数返回一个列表。

结果列表生成的逻辑和下面这样差不多：

```python
acc_value = raw_list[0]
res_list = [acc_value]
for element in raw_list[1:]:
    acc_value = acc_func(acc_value, element)
    res_list.append(acc_value)
```

这是一个例子：

```python
from itertools import accumulate


cumsum = accumulate(nums)
cumprod = accumulate(nums, mul)
numsCopy = acculumate(nums, lambda a, b: b)
print(list(cumsum), list(cumprod), list(numsCopy), sep='\n')
>>> [1, 3, 6, 10, 15, 21, 28, 36, 45, 55]
..| [1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800]
..| [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
```

注意第 $3$ 个例子，我们通过一个累积函数复制了原始列表，这个函数传入 $2$ 个参数，忽略了第 $1$ 个参数并仅返回第 $2$ 个参数。

## 第2部分 - 用归约折叠列表

回忆一下我们使用`listfunc`、`headfunc`、`gluefunc`之类的列表处理函数去递归实现一些常见函数。

```python
def fsum(list):
    return 0 if not list else head(list) + fsum(tail(list))


def flength(list):
    return 0 if not list else 1 + flength(tail(list))
```

这种模式是非常受欢迎的，或许还包含了你可能需要使用的、用于列表处理的大量函数。在函数式编程语言中，它一般叫做 **折叠** ，因为我们将整个列表折叠成了一个结果。同样地，在 Python 中，它被称为 **归约**（`reduce`）。`reduce`这个函数目前位于`functools`模块中，尽管 Python 2.x 可以不导入任何内容直接使用它。它传入一个双参数函数、一个列表和一个初始值，你可以将它想象成将初始值插入到列表开头，然后取最左侧的 $2$ 个元素并替换为给定函数调用的结果，所以函数每次会缩短 $1$ 个元素长度。整个过程一直持续到只剩最后 $2$ 个元素，它会调用传入的函数并得到只有 $1$ 个元素的列表，这唯一的元素会被作为`reduce`函数的结果返回。例如，我们可以将列表求和表示为以 $0$ 为初始值、以加和函数为归约函数的规约过程。

```python
from functools import reduce
from operator import add


total = reduce(add, nums, 0)
print(total)
>>> 55
```

顺便提一句，在 Python 中使用归约会比使用递归更快、效率更高，但它总归还是一种函数式解决方案。

## 第3部分 - 例子

让我们构建另一个函数式计算阶乘的过程。为了清楚起见，我们实现了`ints`函数和`product`函数，它们和计算列表求和差不多，只不过它计算的是乘积。然后我们可以将 $n$ 的阶乘定义为直到 $n$ 的所有正整数的乘积。

```python
product = lambda seq: reduce(mul, seq, 1)
ints = lambda n: range(1, n + 1)
ffactorial2 = lambda n: product(ints(n))
print(ffactorial2(5))
>>> 120
```

另一个用于列表处理的常用函数是`zipWith`函数。基本上，它只需要一个对元组进行操作的函数（这里称为`tfunc`），然后它返回一个函数，给定一个列表序列，它将执行以下操作：它将首先压缩列表以获取元组列表，然后将此`tfunc`映射到此列表上。这是一个使用它的例子：假设我们要为存储为相同长度的 Python 列表的两个向量定义一个点积函数，我们可以像这样直接定义这个函数。

```python
multuply = lambda tuple: tuple[0] * tuple[1]
zipWith = lambda tfunc: compose(partial(map, tfunc), zip)
dot_prod2 = compose(sum, zipWith(multuply))
print(dot_prod2([2, 3, 4], [4, 3, 2]))
>>> 25
```

让我们再举一个使用这些函数和其他功能工具的例子：假设我们将此文本格式化为一个逗号分隔文件（`*.csv`），其中包含一个表格，除了标题之外的每一行都包含有关一个人的信息，我们想要制作一个字典列表，其中每个字典都代表一个人，以标题元素作为字典键、相应的表格值作为字典值。

```python
csvFile = '''
firstName;LastName;Birth;Death
Alonzo;Church;14.06.1903;11.07.1995
Haskell;Curry;12.09.1900;01.09.1982
John;Neumann;28.12.1903;08.02.1957
Alan;Turing;23.06.1912;07.06.1954
'''
```

首先，我们想分别定义函数以分号和换行符拆分字符串，因此我们用`methodcaller`创建一个偏函数`split`，然后从结果函数中构造`splitLines`和`splitFields`两个函数。

```python
split = partial(method, 'split')
splitLines = split('\n')
splitFields = split(';')
```

然后我们拆分文本以获得行列表，我们在字段上拆分这些行中的每一行以获取列表的列表，其中每个列表是表格的一行。

```python
table = list(map(splitFields, splitLines(csvFile)))
```

接着我们分别取表头和表的其余部分。

```python
header = head(table)
data = tail(table)
```

现在我们只想映射表的其余部分，并将作为表行的每个列表转换为记录。

```python
records = list(map(makeRecord, data))
```

为此，我们需要创建一个函数来映射列表列表并执行以下操作：它应该获取代表一行的每个列表，压缩标题和此列表，然后使用字典构造函数将结果元组转换到字典中。

```python
makeRecord = partial(compose(dict, zip), header)
```

让我们试试它是否真的有用。

```python
for record in records:
    print(record)

>>> {'firstName': 'Alonzo', 'Death': '11.07.1995', 'Birth': '14.06.1903', 'LastName': 'Church'}
..| {'firstName': 'Haskell', 'Death': '01.09.1982', 'Birth': '12.09.1900', 'LastName': 'Curry'}
..| {'firstName': 'John', 'Death': '08.02.1957', 'Birth': '28.12.1903', 'LastName': 'Neumann'}
..| {'firstName': 'Alan', 'Death': '07.06.1954', 'Birth': '23.06.1912', 'LastName': 'Turing'}
```

## 第4部分 - itertools工具箱

在`itertools`模块中可以找到大量有用的工具来处理可遍历结构，我将快速回顾其中一些：

```python
from itertools import chain, compress, dropwith, takewhile, starmap, groupby
```

`chain`函数非常的简单：它输入一组可遍历对象并将它们拼在一起，有点像通用的拼接函数。再一次，它的输出是一个可以转换为列表的特殊对象。

```python
day1 = [112.35, 813.21, 34.55, 891.44]
day2 = [233.37,  761.09, 871.59,  725.84]
day3 = [41.81, 67.65, 109.46, 177.11]
allDays = chain(day1, day2, day3)
print(list(allDays))
>>> [112.35, 813.21, 34.55, 891.44, 233.37, 761.09, 871.59, 725.84, 41.81, 67.65, 109.46, 177.11]
```

在列表处理中使用了两个函数，其中一个可以很容易地基于`chain`函数编写，另一个只是常用函数组合的简写（类似于`zipWith`）。`concat`获取一个由可遍历对象组成的可遍历对象，并从这些内部对象构造一个可迭代对象。`concatMap`只是映射一个可迭代对象并将`concat`应用于结果。

`compress`是一个函数，它接受两个可遍历对象，其中一个被认为是 **掩码** ：也就是说，它是一个包含布尔值的可遍历对象。它返回将此掩码应用于第二个给定的可迭代对象的结果，即过滤掉掩码中所有与`False`对应的元素。

```python
mask = [0,1,1,1,0,0,1,1, 0,1,1,1,0,0,0,0, 0,1,1,0,0,0,0,1, 0,1,1,0,1,1,0,1]
data = [3,1,4,1,5,9,2,6,5,3,5,8,9,7,9,3,2,3,8,4,6,2,6,4,3,3,8,3,2,7,9,5]
filtered = compress(data, mask)
print(list(filtered))
>>> [1, 4, 1, 2, 6, 3, 5, 8, 3, 8, 4, 3, 8, 2, 7, 5]
```

`takewhile`和`dropwhile`函数接受一个谓词表达式和一个可遍历对象，然后它们只在这个谓词表达式成立时获取（或删除）可迭代对象的元素[^4]。

```python
# bool(odd(nums[0])) == False
odd = lambda x: x % 2

nums = [2, 7, 1, 8, 2, 8, 1, 8, 2, 8, 4, 5, 9]

# 由于首元素不满足谓词表达式，函数逻辑会直接中止，后续元素被忽略，因此得到一个空列表
nums2 = list(takewhile(odd, nums))
# 由于首元素不满足谓词表达式，函数逻辑会直接中止，后续元素全数保留，所以没有元素被移除
nums3 = list(dropwhile(odd, nums))

print(nums2, nums3, sep='\n')
>>> []
..| [2, 7, 1, 8, 2, 8, 1, 8, 2, 8, 4, 5, 9]
```

`starmap`与`map`类似，不同之处在于它不使用多个序列来获取给定函数的参数，而是映射一系列元组，获取每个元组，对其应用`*`运算符，即解包以获取元组中的任何内容，然后使用解压缩的值作为给定函数的参数。结果是一个原始序列，但不是元组，而是将此函数应用于每个元组的元素的结果。这是一个例子：我们想要获取一个字符串列表，而不是这个引号字典，其中每个字符串都是我们在此处定义的形式的引号。

```python
quotes = {  
    'Poincare' : 'The essential characteristic of reasoning by recurrence is that it contains, condensed, so to speak, in a single formula, an infinity of syllogisms',
    'Turing' : 'We can only see a short distance ahead, but we can see plenty there that needs to be done',
    'Gauss' : 'God does arithmetic'
}
newQuotes = starmap(lambda n, q: q + ' -- ' + n, list(quotes.items()))
for q in list(newQuotes):
    print(q)

>>> God does arithmetic -- Gauss
..| We can only see a short distance ahead, but we can see plenty there that needs to be done -- Turing
..| The essential characteristic of reasoning by recurrence is that it contains, condensed, so to speak, in a single formula, an infinity of syllogisms -- Poincare
```

`groupby`接受两个参数：我们希望分组的元素序列和我们希望将它们分组的特征函数。这个特征函数应用于序列的每个元素，然后为这个特征函数的每个唯一值创建一个组。`groupby`函数返回一个元组列表，其中第一个元素是定义一个组的特征函数的值，第二个元素是原始序列的所有元素的列表，这些元素就特征函数的值而言属于该组。这是一个示例，我们按长度对所谓的元变量名称进行分组。

```python
vars = ['foo', 'bar', 'baz', 'qux', 'quux', 'corge', 'grault', 'garply']
groups = groupby(vars, len)
for (l, g) in groups:      
    print(l, list(g))

>>> 3 ['foo', 'bar', 'baz', 'qux']
..| 4 ['quux']
..| 5 ['corge']
..| 6 ['grault', 'garply']
```

最后一个：`product`函数。您可能希望将名称`product`用于其他用途，尤其是列表的乘积，但您也可能不喜欢编写完整的限定名称`itertools.product`。此函数返回给定可迭代对象的 **笛卡尔积** ，也就是说，给定一些可遍历对象，它返回所有可能元组的列表，其中第一个元素来自第一个可迭代对象，第二个元素来自第二个可迭代对象，依此类推。有一个名为`repeat`的可选参数，默认情况下设置为 $1$ ，它确定您希望重复指定笛卡尔积的次数。笛卡尔积的一种常见用法是减少嵌套循环的数量：假设您想获得掷骰子十次的所有可能结果，您可以编写 $10$ 个嵌套循环或显式递归过程，但这不是一个很好的解决方案。相反，您可以将其作为正整数 $1$ 到 $6$ 的 $10$ 次笛卡尔幂。正如目前讨论的大多数其他函数一样，这个`cartProduct`返回一个可遍历对象，如果需要也可以将其转换为列表。

```python
from itertools import product as cartProduct


rolls = cartProduct(ints(6), repeat = 10)
for outcome in rolls:
    print(outcome)

>>> (1, 1, 1, 1, 1, 1, 1, 1, 1, 1)
..| (1, 1, 1, 1, 1, 1, 1, 1, 1, 2)
    <此处省略约6046万行>
..| (6, 6, 6, 6, 6, 6, 6, 6, 6, 6)
```

## 第5部分 - 还有一个例子

让我们举一个使用这些工具的例子，有许多基于生成和操作组合对象的经典问题。下面的`perms`函数接受一些可遍历对象并返回其成员的所有排列。有一个辅助的`remove`函数，它完全符合`pyrsistent`模块中`pvector`的`remove`方法的作用：返回原始列表的副本，但首个与给定值相等的元素被丢弃。然后，我们使用以下原则定义我们的函数：要获得`[1, 2, 3]`的所有排列，我们需要获得`[1, 2, 3]`的所有以`1`开头的排列、所有以`2`开头的排列，以此类推。但是要获取以`1`开头的`[1, 2, 3]`的所有排列，与获取`[2, 3]`的所有排列并在所有排列的开头附加`1`相同，所以这里有一个递归的思想。如果我们有一个元素列表，要获得所有排列，我们需要取每个元素并对它应用以下函数：将其转换为除这个元素之外的所有元素的排列列表，然后将此元素附加到所有这些排列。结果结构将是一个排列列表的列表：`[[[1, ...], ...], [[2, ...], ...], [[3, ...], ...]]`，所以我们想把它展平以得到一个简单的排列列表。这就是为什么在映射我们之前定义的函数之后，我们需要对结果使用`concat`。最后，我们需要一个边缘情况：一旦我们有一个元素来对它进行排列就足够合理了，因为我们事先知道一个元素的唯一可能排列。

```python
from operator import ne as neq  


def remove(e, seq):                                             
    p = partial(neq, e)
    return list(chain(
            takewhile(p, seq), 
            tail(list(dropwhile(p, seq)))
        ))


def perms(list):
    mapfunc = lambda x: map(partial(add, [x]), perms(remove(x, list)))
    if len(list) == 1:
        return [list]
    else:
        return concatMap(mapfunc, list)


list(perms([1, 2, 3]))
>>> [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]
```

## 总结

这一课，我们讲解了大量的与列表处理有关的函数，包括映射、过滤、累积、归约，还举了一堆例子来说明如何使用它们；我们还特地提到了 Python 内置的`itertools`模块，讲解了其中常用函数的用法；最后我们举了一个稍微复杂的例子，在一个处理流程中使用了上述所有的函数。

[^1]: Scala 也有这样的函数算符，不过它的写法更像是`seq.map(func)`而不是 Python 的`map(func, seq)`形式。
[^2]: 就像前几课提到的『偏函数』那样。
[^3]: 一个返回布尔值的函数。
[^4]: 若谓词表达式不成立，则直接中断函数，不再继续处理后续元素！

