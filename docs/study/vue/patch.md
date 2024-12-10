---
title: diff和patch机制
description: Vue在数据状态更新时的差异diff和patch机制
cover: false
date: 2024-09-18
tag:
 - vue
---
# diff和patch机制

## 数据更新视图

当对 `model`(数据模型) 进行操作的时候，会触发对应 `Dep` 中的 `Watcher` 对象。`Watcher` 对象会调用对应的 `update` 来修改视图。最终是将新产生的 VNode 节点与老 VNode 进行一个 `patch` 的过程，比对得出「差异」，最终将这些「差异」更新到视图上。

## 跨平台

