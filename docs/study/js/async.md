---
title: js异步编程
tag:
 - js
 - promise
---
# JS异步

## Promise

Promise是js中用来处理异步操作的对象。它代表了一个异步操作的最终完成或失败，并且可以获取其结果。避免了回调地狱的问题。
一个Promise实例有两个重要的方法：then()和catch()。
then() 方法用于指定当 Promise 对象状态变为 resolved（完成态）时要执行的回调函数，而 catch() 方法用于指定当 Promise 对象状态变为 rejected（拒绝态）时要执行的回调函数。

### Promise对象有三种状态
Pending（未决）初始状态
Fulfilled（已履行/成功）：操作完成时的状态
Rejected（已拒绝/失败）：操作因错误或异常未能完成时的状态
Promise状态变化的特性是：
Promise状态转变是不可逆且只能发生一次。也就是说，一个Promise对象不能从Fulfilled状态变回Pending状态，也不能从Rejected状态变为Pending或者Fulfilled状态。 一旦Promise从Pending状态变为Fulfilled（resolved）或Rejected（rejected），它就永远不会再改变。
因此，Promise的状态不能重复改变。
Promise.resolve()与Promise.reject()用于创建已确定状态的Promise对象，方便快速返回成功的或失败的结果

### Promise的静态方法

+ Promise.all(iterable)
参数是promise对象数组。只有当所有Promise都变为fulfilled时，返回的Promise才会变为fulfilled，并且结果是一个包含所有Promise结果的数组；只要有一个Promise变为rejected，则整体Promise也会立即变为rejected，返回第一个rejected Promise的理由。
+ Promise.race(iterable)
在传入的 Promise 数组中任何一个 Promise 解决（resolve）或拒绝（reject）时，会立即以那个率先改变状态的 Promise 的结果为准来解决或拒绝。
在这里强调一下细节，其它的promise实例仍然会继续运行，只不过其状态和结果不会归于最终的结果。

> Promise.race 关注的是速度最快的 Promise 的结果，而 Promise.all 关注的是所有 Promise 是否都成功完成。

+ Promise.allSettled(iterable)
和Promise.all()相似，它等待所有Promise都达到settled状态（即无论是fulfilled还是rejected）。一旦所有Promise都决断了，返回的Promise会变成fulfilled，并且结果是一个数组，包含了每个输入Promise的结果描述对象，这些对象具有status（'fulfilled'或'rejected'）和对应的value或reason属性。

> Promise.all() 更关注所有 Promise 是否都成功完成，它适用于需要所有任务成功完成才能继续下一步场景。而 Promise.allSettled() 则允许你观察一组异步操作的所有结果，无论成功与否，这对于获取并处理所有任务的最终状态非常有用。

### promise如何实现链式调用的
#### 原理：
基于 Promise 的状态传递和事件循环机制实现的。当一个 Promise 实例调用 then 方法时，它会返回一个新的 Promise 实例，并在内部将当前 Promise 的状态和值传递给下一个 Promise 实例，同时注册一个回调函数来处理当前 Promise 的状态变化。
1. Promise 状态传递：
当一个 Promise 实例的状态改变时，它会根据其状态选择执行 onFulfilled 或 onRejected 回调函数，并将状态和值传递给这些回调函数。
在调用 then 方法时，会创建一个新的 Promise 实例，根据当前 Promise 的状态决定新 Promise 的状态和值。
2. 事件循环机制：
JavaScript 是单线程的，采用事件循环机制来处理异步操作。每次事件循环都会检查异步任务队列，执行已完成的异步任务的回调函数。
当 Promise 的状态改变时，会将相应的回调函数（onFulfilled 或 onRejected）推入微任务队列中，等待当前执行栈执行完毕后执行。
3. 链式调用的处理：
当一个 Promise 实例调用 then 方法时，会返回一个新的 Promise 实例，新 Promise 的状态和值由当前 Promise 的状态决定。
如果 then 方法中返回的是一个值或者新的 Promise 实例，会被包装成一个新的 Promise 实例返回，作为下一个 then 方法的输入。

## async和await底层原理
async/await是建立与promise之上的语法糖。它使异步代码能够以同步的方式书写。
其底层原理主要依赖于promise的链式调用和js的事件循环机制。

+ 在底层，async/await通过编译器被转换成了Promise的链式调用。编译器会把await表达式转换成Promise.then()的调用，并处理错误。
+ async/await捕获异常：通过async函数内部使用try/catch捕获异常

## Generator函数
Generator是es6引入的一种新的函数类型，它允许函数在执行过程中被暂停和恢复。其原理主要依赖于函数的执行上下文和迭代器协议
1. 执行上下文
2. 迭代器协议