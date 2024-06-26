---
layout: post
title: 高阶函数和装饰器模式
date: 2024-05-18 22:28:06
tags:
  - Python
  - 函数式编程
categories: 技术杂谈
---

## 前言

在 Python 中，函数是 **一等实体** ，它允许我们以另一个函数作为参数来构造函数。对其他函数进行操作的此类函数通常称为 **高阶函数** 。它是一个非常强大的工具，可以为一些现有问题构建更通用的解决方案。本系列第1课提供了一个简单的示例，其中定义了`toTfunc()`函数，该函数采用具有多个参数的某个函数并返回采用一系列必要参数的相同函数。

```python
def toTfunc(func):
    def res(_tuple):
        return func(*_tuple)
    
    return res
```

## 第1部分 - 另一个例子

这是另一个例子：假设我们在程序中大量使用日志，并且希望简化写入日志文件的过程。我们可以编写完整的`open(filename, mode)`模式，然后在每次需要时显式使用`write()`和`close()`方法。但是，如果我们需要在许多不同的文件上频繁调用它，我们希望一切看起来更紧凑。

我们可以定义一个函数，它接受一个文件名并返回一个绑定到该文件的记录器，它的工作非常简单：我们给记录器一条消息，它以我们需要的模式打开文件，将消息附加到文件的末尾并添加一个换行符，然后关闭文件。

```python
def makeLog(file):
    def log(entry):
        with open(file, 'a') as f:
            f.write(entry + '\n')

    return log


testLog = makeLog('test.txt')
testLog("Don't")
testLog('Panic')
entries = open('test.txt', 'r').read()
print(entries)

>>> Don't
..| Panic
```

还有另一种使用此功能特性的方法，这在 Python 程序中很常见。

## 第2部分 - 装饰器

假设我们想比较使用朴素递归方法并以迭代方式计算第 $30$ 个斐波那契数所花费的时间。好吧，我们可以只打印出两个函数执行前后时间函数的差异：

```python
from time import time


t = time()
ffib(30)
print('Execution time:', time() - t)
>>> Execution time: 0.953125

t = time()
fib(30)
print('Execution time:', time() - t)
>>> Execution time: 0.0
```

但那是一些劣质的复制粘贴，如果某些代码被多次使用，这是一个很好的、证明有些东西可以被化简的证据。与其一遍又一遍地重复代码，因为我们将来可能需要做类似的事情，我们可以设计一个函数，将某个函数作为其输入并返回一个与给定函数本质上相同的函数，但是它在返回值之前打印出执行时间。实现可能是这样的：

```python
def timed(func):
    def inner(*args, **kwargs):
        from time import time
        
        t = time()
        res = func(*args, **kwargs)
        print('Execution time:' + time() - t)
        return res

    return inner


tfib = timed(fib)
tffib = timed(ffib)
tfib(30)
>>> Execution time: 0.0

tffib(30)
>>> Execution time: 0.96875
```

我希望你熟悉这个星号。当与函数定义一起使用时，这些星号表示除了明确编写的参数和关键字参数之外，还可以有任意数量的参数和关键字参数。所以，这个`*args`意味着在括号中明确指定的参数之后给函数的所有参数都应该打包到一个名为`args`的列表中；`**kwargs`意味着所有没有在定义中明确写出的给函数的关键字参数都应该打包到一个名为`kwargs`的字典中。在这种情况下，我们不知道将提供给函数的参数数量、它们是否会被命名以及它们将具有什么名称。所以我们只是将传递给列表和字典的任何参数打包在函数定义之外使用时，这些星号用于解包这些结构。这意味着通过调用`func(*args, **kwargs)`，我们正在调用传递给`timed()`的函数，并将参数传递给`inner()`。

这样，我们将一些函数传递给定时函数，它返回一个函数，它的作用与我们之前所做的基本相同：它将接受您传递的任何参数，将初始函数应用于这些参数，然后在返回结果之前将打印出执行时间。所以这个定时函数有点像其他函数的包装，它添加了一些额外的功能而不改变原始函数的实际作用。现在我们可以像这样将这个计时器包裹在我们的`fibs()`版本中。如您所见，新的`t...`函数的行为方式与以前完全相同，但现在我们获得了一个附加功能。请注意，我们可以通过编写`fib = timed(fib)`来重新定义原始函数，而不是定义一个别的函数名称。

这种将某个函数重新定义为包装到某个包装函数中的同一个函数的模式是非常常见和有用的事情，它被称为 **装饰器模式** 。它在 Python 中使用的非常多，有自己的语法糖。假设我们想让这个引入包装器，它接受一个函数并返回在执行之前打印出它的名称的相同函数。

```python
def introduce(func):
    def inner(*args, **kwargs):
        print(func.__name__)
        return func(*args, **kwargs)

    return inner


@introduce
def id(x):
    return x


# 在 def 关键字前指定 @introduce ，
# 与调用 id = introduce(id) 含义相同
print(id(20))
>>> id
..| 20
```

现在，我们可以在函数定义上方写上这个`@`符号，而不是写`somefunc = introduce(somefunc)`，这相当于先写定义，然后再调用`id = introduce(id)`。如果你看到这个语法，请记住它与将定义的函数更改为`@`符号后的函数应用到定义的函数的结果相同。因为后者完全可以理解，而前者在您第一次看到它时可能看起来像是某种『魔法』。

如您所见，这是一个非常巧妙的特性，无需深入研究实现即可扩展功能。这种方法在函数式编程中经常使用，而使用装饰器是实现这一目标的好工具。

让我们看另一个使用装饰器的例子：回想由于非线性递归计算方案，`fib()`的递归实现有多慢。

不过，如果我们有办法让函数记住它在某些特定输入上的结果，这个问题就可以解决。因此，在计算结果之前，我们可以检查答案是否已经为我们所知，我们可以直接返回它。

空间和时间[^1]之间的这种权衡是很常见的事情，因为我们试图保持我们函数的纯度，我们可以肯定，大部分时间里，只要输入不变，我们的函数的输出应该是相同的。因此，实现这样的功能将使我们能够从使用函数式方法中获得更多优势。因此，如果您愿意，我们希望通过某种方式将任意函数添加为 **缓存** 。

向现有函数添加一些增强功能正是装饰器的用途。让我们制作一个这样的装饰器并测试它，有一些与散列相关的事情，你想用这个实现做，但现在让我们保持简单。

```python
def cached(func):
    func.cache = {}
    
    def inner(*args, **kwargs):
        key = args, tuple(kwargs.items())
        if key not in func.cache:
            func.cache[key] = func(*args, **kwargs)
        return func.cache[key]

    return inner


@cached
def cffib(n):
    return 1 if n in (0, 1) else cffib(n - 1) + cffib(n - 2)


tcffib = timed(cffib)
tfib(300)
>>> Execution time: 0.0

# 没错，这就是30
tffib(30)
>>> Execution time: 0.953125

tcffib(300)
>>> Execution time: 0.0
```

在 Python 中，一切都是我们可以使用的对象。由于函数也是对象，我们可以为任何函数定义一个新属性。让我们为传递给缓存的装饰器函数的函数创建一个名为缓存的字典，然后我们将返回这个内部函数，它将与原始`func()`函数产生相同的结果。但在计算结果之前，它将在我们创建的作为`func()`函数属性的缓存字典中查找它。如果已经有一个，函数将返回它，否则它将计算结果并将其保存在缓存中。一个相当简单的实现，正如您可以从执行时间推断的那样，它确实有帮助。

## 第3部分 - 装饰的门道

装饰器很棒，但仍有一些事情需要讨论。首先，让我们回到用`@introduce`装饰器装饰的`id()`函数。假设我们想打印出文档或者我们想手动接收它的名字：

```python
print(help(id), id.__name__, sep='\n')
>>> Help on function id in module __main__:
..| inner(*args, **kwargs)
..| inner
```

当然这不是我们期望或想要看到的。具有讽刺意味的是，一个在调用时自我介绍的函数无法说出它的正确名称以及它在明确询问时的作用！当然，那是因为装饰的函数不是最初的函数体有一些变化，而是这个函数内部使用原始函数作为模拟其行为的工具。这可以在返回内部函数之前通过手动设置`__name__`和`__doc__`来修复 ，将内部函数的字段更改为原始函数中的任何字段。

```python
def introduce2(func):
    def inner(*args, **kwargs):
        print(func.__name__)
        return func(*args, **kwargs)

    inner.__name__ = func.__name__
    inner.__doc__ = func.__doc__
    return inner


@introduce2
def id2(x):
    """ Identity function """
    return x


print(help(id2), id2.__name__, sep='\n')
>>> Help on function id2 in module __main__:
..| id2(*args, **kwargs)
..| Identity function
..| id2
```

问题是，在某些情况下，除了`__name__`和`__doc__`之外，还有很多字段您希望保持不变，但是手动设置所有这些字段有点蹩脚和重复。 所以我们希望重新定义`inner()`，让它做同样的事情，但有一点点增强。

这听起来像是装饰器的工作，所以，我们可以用一个装饰器来概括一个装饰器设计问题的解决方案。幸运的是，`functools`模块中有一个解决方案。`functools`，从它的名字可以推断，是一个用于处理函数的模块，特别是高阶函数。

有一个叫做`wraps()`的函数，它将一些函数`f()`作为输入并返回一个装饰器。这个装饰器可以应用于任何函数，将它的属性如`__name__`、`__doc__`等更改为函数`f()`的属性。因此，我们可以通过用装饰器`wraps(func)`装饰内部函数来解决我们的问题，因为我们希望在装饰`func()`函数时我们实际返回的内部函数具有与这个`func()`函数相同的属性。

```python
from functools import wraps


def introduce3(func):
    # 它实际上有点像 wraps(func)(inner)
    @wraps(func)
    def inner(*args, **kwargs):
        print(func.__name__)
        return func(*args, **kwargs)

    return inner


@introduce3
def id3(x):
    """ Identity function """
    return x


print(help(id3), id3.__name__, sep='\n')
>>> Help on function id3 in module __main__:
..| id3(x)
..| Identity function
..| id3
```

如您所见，它是有效的。我想再次指出，不是『`wraps`是装饰器』，而是『`wraps(func)`是装饰器』，可以这样写是因为这个`@`符号运算符的优先级低于函数调用。但它看起来是一个带参数的装饰器。在某种程度上确实如此，至少可以安全地将其视为带有参数的装饰器。

如果我们也想要一个带参数的装饰器怎么办？假设我们希望能够指定用`@introduce`修饰的函数在调用时应该打印出其名称的次数，我们如何重复这种实际上不是装饰器本身而是返回装饰器的函数的行为？此外，这个结果装饰器的行为应该取决于赋予该装饰器返回函数的参数？嗯，从字面上看，我们正是这样做的。

```python
from functools import wraps


def introduce4(n=1):
    def res_decorator(func):
        @wraps(func)
        def inner(*args, **kwargs):
            print(("\n" + func.__name__) * n)
            return func(*args, **kwargs)

        return inner

    return res_decorator


@introduce4(n=42)
def id4(x):
    "Identity function"
    return x


print(id4(20))
>>> id4
..| id4
    <此处省略39行>
..| id4
..| 20
```

我们只是使用我们的旧装饰器，添加依赖于一些尚未给出的参数的功能。 然后我们添加另一层：我们将拥有一个名为`introduce()`的函数，而不是一个名为`introduce()`的装饰器函数，它看起来是一个参数化的装饰器，但它会接受我们希望使用的参数并返回旧的`introduce()`。现在可以使用这些参数，为了清楚起见，作为实际装饰器的返回函数称为『**结果装饰器**』。现在我们得到了我们想要的行为，如果我们不传递任何参数，`n`的默认值仍然等于$1$。唯一的问题是我们不能只是省略括号，因为引入本身不再是一个装饰器，而是一个返回装饰器的函数。

这工作正常，但这种嵌套层数使它有点不愉快。我的意思是，我们将来可能想要编写这样的函数，这些函数似乎是参数化装饰器。那么，我们是否将这个嵌套结构作为模板并每次都复制粘贴？那是不切实际的。如果我们可以在定义装饰器函数时在`func()`参数之后列出我们希望装饰器拥有的所有参数，那将会方便得多。 但问题是，这个`@`符号语法使得`def func()`之前的`@decorator`和写作`func = decorator(func)`含义相当。

> 我们希望定义这么一个函数：
>
> ```python
> def decorator(func, dec_args):
>     # 这里应该有点东西，此处单纯用 pass 来占位
>     pass
> ```
>
> 可是，下面第1种写法和第2种写法是等效的：
>
> ```python
> @decorator
> def func():
>     pass
> ```
>
> ```python
> def func():
>     pass
> 
> 
> func = decorator(func)
> ```
>
> 所以，我们希望把它变成 `decorator(dec_args)(func)`，并期望它和`decorator(func, dec_args)`等效。所以，下面两种写法应该是等效的。
>
> ```python
> @decorator(dec_args)
> def func():
>     pass
> ```
>
> ```python
> def func():
>     pass
> 
> 
> func = decorator(func, dec_args)
> ```

让我们再次用装饰器解决装饰器设计问题：

```python
from functools import wraps


def parameterized(decorator):
    def decoFunction(*decargs, **deckwargs):
        def res_decorator(func):
            return decorator(func, *decargs, **deckwargs)

        return res_decorator

    return decoFunction


@parameterized
def introduce5(func, n=1):
    @wraps(func)
    def inner(*args, **kwargs):
        print(("\n" + func.__name__) * n)
        return func(*args, **kwargs)

    return inner


@introduce5(20)
def id5(x):
    """ Identity function """
    return x


print(id5(42))
>>> id5
..| id5
    <此处省略39行>
..| id5
..| 42
```

这个`@parameterized`是一个装饰器，它采用初始装饰器使其成为带参数的装饰器，所以它正在装饰一个初始装饰器。给定一个初始装饰器，`@parameterized`函数返回一个`decoFunction()`。这个`decoFunction`将我们想要传递给初始装饰器的参数作为它的参数，给定这些参数，`decoFunction()`返回结果装饰器，`@`运算符应用于此结果装饰器以将函数传递给它。一旦得到的装饰器得到这个函数，它就会返回将初始装饰器应用于参数序列的结果，其中这个函数是第一个参数，后面是先前传递给`decoFunction()`的初始装饰器参数。这个结果是明确定义的，因为这个参数顺序正是我们希望带有参数的初始装饰器具有的定义中的顺序。现在我们可以按照我们想要的方式用参数定义我们的装饰器，并用`@parameterized`装饰器装饰它。如您所见，它确实有效。

> 以下2种写法是等效的
>
> ```python
> @introduce5(42)
> def id5(x):
>     """ Identity function """
>     return x
> 
> 
> ##### 分隔线 #####
> def id5(x):
>     """ Identity function """
>     return x
> 
> 
> id5 = introduce5(42)(id5)
> ```
>
> 因此，我们希望`introduce5(42)(id5)`与`introduce5(id5, 42)`等效。
>
> 当然，`introduce5 = parameterized(introduce5)`，所以完整展开应该是`parameterized(introduce5)(42)(id5)`，其中的`parameterized(introduce5) = decoFunction`。
>
> 它代入装饰器参数`(*dec_args, **dec_kwargs)`实际上只有`n = 42`，因此`parameterized(introduce5)(42)(id5) = decoFunc(42)(id5)`。
>
> 给定装饰器参数，`decoFunction`会生成一个结果装饰器，这个结果装饰器接受一个函数，返回将这个函数和装饰器参数作用于自身的结果。所以，`decoFunction(42)(id5) = res_decorator(id5) = introduce5(id5, 42)`，正是我们所期望的。

------

## 总结

这一节课，我们首先从上节课的示例中引出了『**高阶函数**』的定义，举了另一个运用高阶函数的例子（插入日志）；随后，我们借助斐波那契数列的缓存加速提出了『**装饰器**』的概念；最后，我们用较长的篇幅讲解了装饰器更深层的用法，如何避免原始函数的各项属性被装饰器覆盖、如何定义有参装饰器。

[^1]: 也就是内存使用量和计算时效性。
