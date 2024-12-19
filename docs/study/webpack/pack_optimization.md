---
title: ⚙️webpack 应用性能优化
description: 一些应用性能优化技巧
date: 2024-10-18
tag:
 - webpack
---

# webpack 应用性能优化

除了使用 splitChunks 分包、代码压缩提升应用执行性能。还有一些普适、细碎的方法，能够有效降低应用体积，提升网络分发性能：

- 使用动态加载，减少首屏资源加载量
- 使用 `externals`、`Tree-Shaking`、`Scope Hoisting` 特性，减少应用体积
- 正确使用 `[hash]` 占位符，优化 HTTP 资源缓存效率

## 动态加载

动态加载是 Webpack 内置能力之一，我们不需要做任何额外配置就可以通过动态导入语句(`import`、`require.ensure`)轻易实现

但是注意，这一特性有时候反而会带来一些新的性能问题：
1. **过度使用会使产物变得过度细碎，产物文件过多，运行时 HTTP 通讯次数也会变多**，在 HTTP 1.x 环境下这可能反而会降低网络性能，得不偿失
2. 使用时 Webpack 需要在客户端注入一大段用于支持动态加载特性的 Runtime，如果动态导入的代码量少于Runtime 代码的体积，那就完全是一笔赔本买卖了

因此，请务必慎重，多数情况下我们没必要为小模块使用动态加载能力！目前社区比较常见的用法是配合 SPA 的前端路由能力实现页面级别的动态加载——如路由懒加载

可以使用较为特殊的组件导入语句：
```js
const Demo = () => import(/* webpackChunkName: "sub-pages" */ "./Demo.vue");
```
`webpackChunkName` 用于指定该异步模块的 Chunk 名称，相同 Chunk 名称的模块最终会打包在一起，这一特性能帮助开发者将一些关联度较高，或比较细碎的模块合并到同一个产物文件，能够用于管理最终产物数量

## HTTP 缓存优化

虽然 Webpack 只是一个工程化构建工具，没有能力决定应用最终在网络分发时的缓存规则，但我们可以调整产物文件的名称(通过 Hash)与内容，使其更适配 HTTP 持久化缓存策略
> Hash 是一种将任意长度的消息压缩到某一固定长度的消息摘要的函数，不同明文计算出的摘要值不同，所以常常被用作内容唯一标识

Webpack 提供了一种模板字符串能力，用于根据构建情况动态拼接产物文件名称(`output.filename`)，从性能的角度上看，可以关注其中的几个占位符：
+ `[fullhash]`：整个项目的内容 Hash 值，项目中任意模块变化都会产生新的 `fullhash`
+ `[chunkhash]`：产物对应 Chunk 的 Hash，Chunk 中任意模块变化都会产生新的 `chunkhash`
+ `[contenthash]`：产物内容 Hash 值，仅当产物内容发生变化时才会产生新的 contenthash，因此实用性较高

用法只需要在 output.filename 值中插入相应的占位符即可，如 `"[name]-[contenthash].js"`
> 也可以通过占位符传入 Hash 位数，如 `[contenthash:7]` ，即可限定生成的 Hash 长度

每个产物文件名都会带上一段由产物内容计算出的唯一 Hash 值，文件内容不变，Hash 也不会变化，这就很适合用作 HTTP 持久缓存 资源

此时，产物文件不会被重复下载，一直到文件内容发生变化，引起 Hash 变化生成不同 URL 路径之后，才需要请求新的资源文件，能有效提升网络性能，因此，生产环境下应尽量使用 `[contenthash]` 生成有版本意义的文件名

Hash 规则很好用，不过有一个边际 Case 需要注意：**异步模块变化会引起主 Chunk Hash 同步发生变化**

此时可以用 `optimization.runtimeChunk` 将这部分代码抽取为单独的 Runtime Chunk

所以建议至少为生成环境启动 `[contenthash]` 功能，并搭配 `optimization.runtimeChunk` 将运行时代码抽离为单独产物文件


## 使用外置依赖

场景：假如我们手头上有 10 个用 React 构建的 SPA 应用，这 10 个应用都需要各自安装、打包、部署、分发同一套相似的 React 基础依赖，最终用户在访问这些应用时也需要重复加载相同基础包代码，那如何节省这部分流量呢？ —— 使用 Webpack 的 `externals` 特性

`externals` 的主要作用是将部分模块排除在 Webpack 打包系统之外

> `externals` 不仅适用于优化产物性能，在特定环境下还能用于跳过若干运行时模块，例如 Node 中的 `fs/net` 等，避免将这部分源码错误打包进 Bundle
> 注意，使用 `externals` 时必须确保这些外置依赖代码已经被正确注入到上下文环境中，这在 Web 应用中通常可以通过 CDN 方式实现

虽然结果上看浏览器还是得消耗这部分流量，但结合 CDN 系统特性，一是能够就近获取资源，缩短网络通讯链路；二是能够将资源分发任务前置到节点服务器，减轻原服务器 QPS 负担；三是用户访问不同站点能共享同一份 CDN 资源副本。所以网络性能效果往往会比重复打包好很多


## 使用 `Tree-Shaking` 删除多余模块导出

Tree-Shaking 是一种**基于 ES Module 规范**的 Dead Code Elimination 技术，它会在运行过程中静态分析模块之间的导入导出，判断哪些模块导出值**没有被其它模块使用** —— 相当于模块层面的 Dead Code，并将其删除

在 Webpack 中，启动 Tree Shaking 功能必须同时满足两个条件：
+ 配置 `optimization.usedExports` 为 `true`，标记模块导入导出列表
+ 启动代码优化功能
  - 配置 `mode = production`
  - 配置 `optimization.minimize = true`
  - 提供 `optimization.minimizer` 数组

```js
// webpack.config.js
module.exports = {
  mode: "production",
  optimization: {
    usedExports: true,
  },
};
```

## 使用 `Scope Hoisting` 合并模块

默认情况下 Webpack 会将模块打包成一个个单独的函数，这种处理方式需要将每一个模块都包裹进一段相似的函数模板代码中，虽然很美观，但是很浪费网络流量。为此，Webpack 提供了 Scope Hoisting 功能，用于 **将符合条件的多个模块合并到同一个函数空间** 中，从而减少产物体积，优化性能

Webpack 提供了三种开启 Scope Hoisting 的方法:
- 使用 `mode = 'production'` 开启生产模式
- 使用 `optimization.concatenateModules` 配置项
- 直接使用 `ModuleConcatenationPlugin` 插件
```js
const ModuleConcatenationPlugin = require('webpack/lib/optimize/ModuleConcatenationPlugin');

module.exports = {
    // 方法1： 将 `mode` 设置为 production，即可开启
    mode: "production",
    // 方法2： 将 `optimization.concatenateModules` 设置为 true
    optimization: {
        concatenateModules: true,
        usedExports: true,
        providedExports: true,
    },
    // 方法3： 直接使用 `ModuleConcatenationPlugin` 插件
    plugins: [new ModuleConcatenationPlugin()]
};
```

三种方法最终都会调用 `ModuleConcatenationPlugin` 完成模块分析与合并操作

与 Tree-Shaking 类似，Scope Hoisting 底层基于 ES Module 方案的 静态特性，推断模块之间的依赖关系，并进一步判断模块与模块能否合并，因此在以下场景下会失效：
1. 非 ESM 模块
2. 模块被多个 Chunk 引用

## 监控产物体积

综合 Code Splitting、压缩、缓存优化、Tree-Shaking 等性能优化的技术，不难看出所谓的应用性能优化几乎都与网络有关，这是因为现代计算机网络环境非常复杂、不稳定，虽然有堪比本地磁盘吞吐速度的 5G 网络，但也还存在大量低速 2G、3G 网络用户，整体而言通过网络实现异地数据交换依然是一种相对低效的 IO 手段，有可能成为 Web 应用执行链条中最大的性能瓶颈

因此，站在生产者角度我们有必要尽可能优化代码在网络上分发的效率，用尽可能少的网络流量交付应用功能。所幸 Webpack 专门为此提供了一套 [性能监控方案](https://github.com/webpack/webpack/issues/3216)，当构建生成的产物体积超过阈值时抛出异常警告，以此帮助我们时刻关注资源体积，避免因项目迭代增长带来过大的网络传输
```js
module.exports = {
  // ...
  performance: {    
    // 设置所有产物体积阈值
    maxAssetSize: 172 * 1024,
    // 设置 entry 产物体积阈值
    maxEntrypointSize: 244 * 1024,
    // 报错方式，支持 `error` | `warning` | false
    hints: "error",
    // 过滤需要监控的文件类型
    assetFilter: function (assetFilename) {
      return assetFilename.endsWith(".js");
    },
  },
};
```