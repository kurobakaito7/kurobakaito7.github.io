---
title: react原理
description: react渲染原理
tag:
 - react
---

# react 原理

## react 转换过程

我们在组件里通过 JSX 描述页面

jsx 会被 babel 或者 tsc 等编译器编译成 render function，也就是类似 React.createElement

然后 render function 执行后产生 React Element 对象，也就是常说的虚拟 dom——vdom （React Element）是一个通过 chilren 串联起来的树

之后 React 会把 React Element 树转换为 fiber 结构，它是一个链表——React Element 只有 children 属性来链接父子节点，但是转为 fiber 结构之后就有了 child、sibling、return 属性来关联父子、兄弟节点。![fiber linktable](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c24402bd7f224b32a5c16ef901d9be72~tplv-k3u1fbpfcp-jj-mark:2079:0:0:0:q75.awebp#?w=1514&h=394&s=31640&e=png&b=ffffff)

### 链表

按照 child、sibling、sibling、return、sibling、return 之类的遍历顺序，可以把整个 vdom 树变成线性的链表结构，这样一个循环就可以遍历整个树

react 在处理 fiber 链表的时候通过一个叫 workInProgress 的指针指向当前 fiber 节点

**而 react 之所以能实现并发特性，就是基于 fiber 的链表结构**

因为之前的 React Element 树里只有 children，没有 parent、sibling 信息，这样只能一次性处理完，不然中断了就找不到它的 parent 和 sibling 节点了。

但是 fiber 不同，它额外保存了 return、sibling 节点，这样就算打断了也可以找到下一个节点继续处理。

所以现在完全可以先处理这个 fiber 树的某几个节点，然后暂停，处理其它的 fiber 树，之后再回来继续处理，这也就是 React 所谓的并发

### fiber结构

浏览器里是通过 Event Loop 跑一个个 task

如果某个 task 执行时间过长，就会阻塞渲染，导致丢帧，也就是页面卡顿

之前直接基于 React Element 递归渲染的时候，很容易计算量过多导致页面卡顿

而改成 fiber 结构再渲染之后，可以在每次渲染 fiber 节点之前判断是否超过一定的时间间隔，是的话就放到下个任务里跑，这样就不会阻塞渲染了

#### 时间分片

fiber 架构版本的 react，每个任务都是固定的时间内跑完的，这就是 react 的时间分片机制

#### 优点

**通过记录 parent、slibling 信息，让树变成链表，可以打断。每次处理一个 fiber 节点，处理每个 fiber 节点前判断是否到了固定的时间间隔，也就是时间分片，通过时间分片把处理 fiber 的过程放到多个任务里跑，这样页面内容多了也不会导致卡顿。**

## react 渲染流程

如图![react 渲染](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4b061ec85d9641799a8469d68738aa13~tplv-k3u1fbpfcp-jj-mark:2079:0:0:0:q75.awebp#?w=1304&h=740&s=251224&e=png&b=fefdfd)

JSX 通过 babel、tsc 等编译成 render function，执行后变成 React Element 的树。

然后 React Element 转成 fiber 结构，这个过程叫做 reconcile。

之前 React Element 是这样的：![react element](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2365411a4943452d80c2131c0d9e4921~tplv-k3u1fbpfcp-jj-mark:2079:0:0:0:q75.awebp#?w=958&h=552&s=243470&e=png&b=1e1d1d)

转成fiber节点：![fiber](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9af31e4963164a4782bbe45573b4be15~tplv-k3u1fbpfcp-jj-mark:2079:0:0:0:q75.awebp#?w=800&h=710&s=111403&e=png&b=1f1f1f)

根据 fiber 的类型做不同的处理:![begin work](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4914c89a34c447c3a1d3e317a336162e~tplv-k3u1fbpfcp-jj-mark:2079:0:0:0:q75.awebp#?w=954&h=1152&s=207539&e=png&b=202020)

function 组件、Provider、Lazy 组件等类型的 fiber 节点，都会做相应的处理。

当然，reconcile 并不只是创建新的 fiber 节点，当更新的时候，还会和之前的 fiber 节点做 diff，判断是新增、修改、还是删除，然后打上对应的标记。

reconcile 完之后，fiber 链表也就构建好了，并且在每个 fiber 节点上保存了当前一些额外的信息。

比如 function 组件要执行的 effect 函数。

之后会再次遍历构建好的这个 fiber 链表，处理其中的 effect，根据增删改的标记来更新 dom，这个阶段叫做 commit。

这样，React 的渲染流程就结束了。

### 整体分为两大段

**render 阶段**：把 React Element 树（也可以叫 vdom） 转成 fiber 链表的 reconcile 过程，由 Scheduler 负责调度，通过时间分片来把计算分到多个任务里去。

**commit 阶段**：reconcile 结束就有了完整的 fiber 链表，再次遍历这个 fiber 链表，执行其中的 effect、增删改 dom等。

commit阶段也分成了三个小阶段:
+ before mutation：操作 dom 之前
+ mutation：操作 dom
+ layout：操作 dom 之后

以上就是react的基本原理