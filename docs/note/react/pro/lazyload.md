---
title: 🚬手写react-lazyload
description: 手写react-lazyload，并实现图片以及组件懒加载
tag:
 - react
 - pro
---

# 🚬my-lazyload

## 😋原理

当图片进入可视区域才加载的时候，可以用 react-lazyload。

它支持设置 `placeholder` 占位内容，设置 `offset` 距离多少距离进入可视区域触发加载。

此外，它也可以用来实现组件进入可视区域时再加载，配合 React.lazy + import() 即可。

它的实现原理就是 `IntersectionObserver`，我们可以自己实现了一遍，设置 `rootMargin` 也就是 `offset`，设置 `threshold` 为 `0` 也就是一进入可视区域就触发。

## 🤓思路

所以思路就比较简单，主要有两点：
1. 未触发加载就用 `placeholder` 中的内容，触发了就用 `children` 中的内容
2. 监视元素进入视口或者距离 offset 到视口的时候触发


具体细节可看[源码](https://github.com/kurobakaito7/my-lazyload)
