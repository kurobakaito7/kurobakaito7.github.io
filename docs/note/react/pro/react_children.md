---
title: React.Children 和 它的两种替代方案
description: 关于 React 中 Children 的 api 也被放到了 Legacy 目录下，并提示用 Children 的 api 会导致代码脆弱，建议用别的方式替代
date: 2024-09-08
tag:
  - react
---

# React.Children

## React.Children 的 API

🔗🔗首先放上官方文档链接[React.Children](https://zh-hans.react.dev/reference/react/Children)

🧿API:

+ Children.count(children)
+ Children.forEach(children, fn, thisArg?)
+ Children.map(children, fn, thisArg?)
+ Children.only(children)
+ Children.toArray(children)

⚠️ 不建议直接用数组方法来操作，而是用 React.Children 的 api

原因有三个：
+ 用数组的方法需要声明 children 为 ReactNode[] 的类型，这样必须传入多个元素才行，如果元素只有一个会报错，而React.Children 不用
+ 用数组的方法不会对 children 做扁平化
+ 用数组的方法不能做排序，因为 children 的元素是只读的，而用 React.Children.toArray 转成数组就行

🍀 说说替代方案

+ 把对 children 的修改封装成一个组件，使用者用它来手动包装
+ 声明一个 props 来接收数据，内部基于它来渲染，而且还可以传入 render props 让使用者定制渲染逻辑

🍃 不过，这两种替代方案易用性都不如 React.Children，各大组件库也依然大量使用 React.Children 的 api。

🍂 所以，遇到需要修改渲染的 children 的情况，用 React.Children 的 api，或是两种替代方案（抽离渲染逻辑为单独组件、传入数据 + render props）都可以。


