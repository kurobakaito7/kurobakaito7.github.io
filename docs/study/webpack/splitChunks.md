---
title: ⚙️SplitChunks的使用
description: 使用SplitChunks来提升应用性能
date: 2024-10-18
tag:
 - webpack
---

# 使用 SplitChunks 

Webpack 默认会将尽可能多的模块代码打包在一起，优点是能够减少最终页面的HTTP请求数，但是也有明显的缺点：
1. 页面初始代码包过大，影响首屏渲染性能
2. 无法有效应用浏览器缓存，特别对于 NPM 包这类变动较少的代码，业务代码哪怕改了一行都会导致 NPM 包缓存失效

为此，Webpack 提供了 `SplitChunksPlugin` 插件，专门用于根据产物包的体积、引用次数等做分包优化，规避上述问题，特别适合生产环境使用

## 深入理解 Chunk

Chunk 是  Webpack 内部一个非常重要的底层设计，用于组织、管理、优化最终产物，在构建流程进入生成(Seal)阶段后：
1. Webpack 首先根据 `entry` 配置创建若干 Chunk 对象
2. 遍历构建(Make)阶段找到的所有 Module 对象，同一 Entry 下的模块分配到 Entry 对应的 Chunk 中
3. 遇到异步模块则创建新的 Chunk 对象，并将异步模块放入该 Chunk
4. 分配完毕后，根据 `SplitChunksPlugin` 的启发式算法进一步对这些 Chunk 执行**裁剪、拆分、合并、代码**调优，最终调整成运行性能(可能)更优的形态
5. 最后，将这些 Chunk 一个个输出成最终的产物(Asset)文件，编译工作到此结束

Chunk 在构建流程中起着承上启下的关键作用 —— 一方面作为 Module 容器，根据一系列默认 **分包策略** 决定哪些模块应该合并在一起打包；另一方面根据 `splitChunks` 设定的 **策略** 优化分包，决定最终输出多少产物文件

**Chunk 分包结果的好坏直接影响了最终应用性能**

Webpack 默认会将以下三种模块做分包处理：
+ Initial Chunk：`entry` 模块及相应子模块打包成 Initial Chunk
+ Async Chunk：通过 `import('./xx')` 等语句导入的异步模块及相应子模块组成的 Async Chunk
+ Runtime Chunk：运行时代码抽离成 Runtime Chunk，可通过 `entry.runtime` 配置项实现

## SplitChunksPlugin

`SplitChunksPlugin` 是 Webpack 4 之后内置实现的最新分包方案，与 Webpack3 时代的 `CommonsChunkPlugin` 相比，它能够基于一些更灵活、合理的启发式规则将 Module 编排进不同的 Chunk，最终构建出性能更佳，缓存更友好的应用产物

`SplitChunksPlugin` 的主要能力有：
- `SplitChunksPlugin` 支持根据 Module 路径、Module 被引用次数、Chunk 大小、Chunk 请求数等决定是否对 Chunk 做进一步拆解，这些决策都可以通过 `optimization.splitChunks` 相应配置项调整定制，基于这些能力我们可以实现：
  - 单独打包某些特定路径的内容，例如 `node_modules` 打包为 `vendors`
  - 单独打包使用频率较高的文件
- `SplitChunksPlugin` 还提供了 `optimization.splitChunks.cacheGroup` 概念，用于对不同特点的资源做分组处理，并为这些分组设置更有针对性的分包规则
- `SplitChunksPlugin` 还内置了 `default` 与 `defaultVendors` 两个 `cacheGroup`，提供一些开箱即用的分包特性：
  - `node_modules` 资源会命中 `defaultVendors` 规则，并被单独打包
  - 只有包体超过 20kb 的 Chunk 才会被单独打包
  - 加载 Async Chunk 所需请求数不得超过 30
  - 加载 Initial Chunk 所需请求数不得超过 30
> 这里所说的请求数不能等价对标到 http 资源请求数

## 配置项与最佳实践

### 配置项

- `minChunks`：用于设置引用阈值，被引用次数超过该阈值的 Module 才会进行分包处理
- `maxInitialRequest/maxAsyncRequests`：用于限制 Initial Chunk(或 Async Chunk) 最大并行请求数，本质上是在限制最终产生的分包数量
- `minSize`： 超过这个尺寸的 Chunk 才会正式被分包
- `maxSize`： 超过这个尺寸的 Chunk 会尝试继续做分包
- `maxAsyncSize`： 与 maxSize 功能类似，但只对异步引入的模块生效
- `maxInitialSize`： 与 maxSize 类似，但只对 entry 配置的入口模块生效
- `enforceSizeThreshold`： 超过这个尺寸的 Chunk 会被强制分包，忽略上述其它 size 限制
- `cacheGroups`：用于设置缓存组规则，为不同类型的资源设置更有针对性的分包策略

### 最佳分包策略

+ 针对 `node_modules` 资源
  - 可以将 `node_modules` 模块打包成单独文件(通过 `cacheGroups` 实现)，防止业务代码的变更影响 NPM 包缓存，同时建议通过 `maxSize` 设定阈值，防止 vendor 包体过大
  - 更激进的，如果生产环境已经部署 HTTP2/3 一类高性能网络协议，甚至可以考虑将每一个 NPM 包都打包成单独文件
+ 针对业务代码
  - 设置 `common` 分组，通过 `minChunks` 配置项将使用率较高的资源合并为 Common 资源
  - 首屏用不上的代码，尽量以异步方式引入
  - 设置 `optimization.runtimeChunk` 为 `true`，将运行时代码拆分为独立资源

