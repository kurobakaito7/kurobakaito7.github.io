---
title: ⚙️webpack核心流程与性能分析
description: 学习 Webpack 打包的核心流程以及借助一些可视化工具分析Webpack的编译性能
date: 2024-10-18
tag:
 - webpack
---

# ⚙️webpack核心流程与性能分析

Webpack 最大的优势在于它的功能非常强大、全面，加之繁荣活跃的组件生态，已经足够应对几乎所有 Web 构建需求，包括：SPA、MPA、SSR、桌面应用、Node 程序、WebAssemsbly、PWA、微前端等等，所以即使在近几年工程化领域异军突起、百花齐放的背景下，Webpack 也依然能保持老大哥的位置。

但软件世界没有银弹！Webpack 在大型项目中通常性能表现不佳，这一方面是因为 JavaScript 语言的单线程架构决定了 Webpack 的运算效率就不可能很高；另一方面则是因为在大型项目中，Webpack 通常需要借助许多组件（插件、Loader）完成大量的文件读写、代码编译操作。

幸运的是，站在开发者视角，我们有许多行之有效的性能优化方法，包括缓存、并发、优化文件处理步骤等，但在着手优化之前，有必要先简单了解一下 Webpack 打包的核心流程；了解哪些步骤比较耗时，可能会造成性能卡点；以及，如何借助一些可视化工具分析 Webpack 的编译性能。

## 核心流程

Webpack 最最核心的功能

一是使用适当Loader将任意类型文件转译成JavaScrip代码，例如将 CSS 代码转译为 JS 字符串，将多媒体文件转译为 Base64 代码等；

二是将这些经过Loader处理的文件资源合并、打包成向下兼容的文件产物

### Webpack工作流程
1. 初始化阶段：
   + 初始化参数：从配置文件、 配置对象、Shell 参数中读取，与默认配置结合得出最终的参数
   + 创建编译器对象：用上一步得到的参数创建 Compiler 对象
   + 初始化编译环境：包括注入内置插件、注册各种模块工厂、初始化 RuleSet 集合、加载配置的插件等
   + 开始编译：执行 compiler 对象的 run 方法，创建 Compilation 对象
   + 确定入口：根据配置中的 `entry` 找出所有的入口文件，调用 `compilation.addEntry` 将入口文件转换为 `dependence` 对象
2. 构建阶段：
   + 编译模块(make)：从 `entry` 文件开始，调用 `loader` 将模块转译为标准 JS 内容，调用 JS 解析器将内容转换为 AST 对象，从中找出该模块依赖的模块，再 递归 处理这些依赖模块，直到所有入口依赖的文件都经过了本步骤的处理
   + 完成模块编译：上一步递归处理所有能触达到的模块后，得到了每个模块被翻译后的内容以及它们之间的依赖关系图
3. 封装阶段：
   + 合并(seal)：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 `Chunk`
   + 优化(optimization)：对上述 `Chunk` 施加一系列优化操作，包括：`tree-shaking`、`terser`、`scope-hoisting`、压缩、`Code Split` 等
   + 写入文件系统(emitAssets)：在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统

在这个过程中有不少可能会造成性能问题的地方

+ 构建阶段：
    + 首先需要将文件的相对引用路径转换为绝对路径，这个过程可能涉及多次 IO 操作，执行效率取决于 文件层次深度
    + 找到具体文件后，需要读入文件内容并调用 loader-runner 遍历 Loader 数组完成内容转译，这个过程需要执行较密集的 CPU 操作，执行效率取决于 Loader 的数量与复杂度
    + 需要将模块内容解析为 AST 结构，并遍历 AST 找出模块的依赖资源，这个过程同样需要较密集的 CPU 操作，执行效率取决于 代码复杂度
    + 递归处理依赖资源，执行效率取决于 模块数量
+ 封装阶段：
    + 根据 splitChunks 配置、entry 配置、动态模块引用语句等，确定模块与 Chunk 的映射关系，其中 splitChunks 相关的分包算法非常复杂，涉及大量 CPU 计算
    + 根据 optimization 配置执行一系列产物优化操作，特别是 `Terser` 插件需要执行大量 AST 相关的运算，执行效率取决于 产物代码量

可以看出，Webpack 需要执行非常密集的 IO 与 CPU 操作，计算成本高，再加上 Webpack 以及大多数组件都使用 JavaScript 编写，无法充分利用多核 CPU 能力，所以在中大型项性能通常表现较差。

## 性能分析

有许多被反复实践、行之有效的构建性能优化手段，包括并行编译、缓存、缩小资源搜索范围等等

### 收集、分析Webpack打包过程中的性能数据

Webpack内置了 `stats` 接口，专门用于统计模块构建耗时、模块依赖关系等信息

用法：
1. 添加 `profile = true` 配置：
   ```js
   // webpack.config.js
   module.exports = {
     // ...
     profile: true
   }
   ```
2. 运行编译命令，并添加 `--json` 参数，参数值为最终生成的统计文件名
   ```sh
   npx webpack --json=stats.json
   ```
上述命令执行完毕后，会在文件夹下生成 `stats.json` 文件，大致如下：
```json
{
  "hash": "2c0b66247db00e494ab8",
  "version": "5.36.1",
  "time": 81,
  "builtAt": 1620401092814,
  "publicPath": "",
  "outputPath": "/Users/tecvan/learn-webpack/hello-world/dist",
  "assetsByChunkName": { "main": ["index.js"] },
  "assets": [
    // ...
  ],
  "chunks": [
    // ...
  ],
  "modules": [
    // ...
  ],
  "entrypoints": {
    // ...
  },
  "namedChunkGroups": {
    // ...
  },
  "errors": [
    // ...
  ],
  "errorsCount": 0,
  "warnings": [
    // ...
  ],
  "warningsCount": 0,
  "children": [
    // ...
  ]
}
```

`stats` 对象收集了 Webpack 运行过程中许多值得关注的信息，包括：
+ `modules`：本次打包处理的所有模块列表，内容包含模块的大小、所属 `chunk`、构建原因、依赖模块等，特别是 `modules.profile` 属性，包含了构建该模块时，解析路径、编译、打包、子模块打包等各个环节所花费的时间，非常有用
+ `chunks`：构建过程生成的 `chunks` 列表，数组内容包含 `chunk` 名称、大小、包含了哪些模块等
+ `assets`：编译后最终输出的产物列表、文件路径、文件大小等
+ `entrypoints`：`entry` 列表，包括动态引入所生产的 `entry` 项也会包含在这里面
+ `children`：子 `Compiler` 对象的性能数据，例如 `extract-css-chunk-plugin` 插件内部就会调用 `compilation.createChildCompiler` 函数创建出子 Compiler 来做 CSS 抽取的工作

我们可以从这些数据中分析出模块之间的依赖关系、体积占比、编译构建耗时等，Webpack还提供了很多优秀的分析工具，能够将这些数据转换各种风格的可视化图表，帮助我们更高效地找出性能卡点
+ Webpack Analysis ：Webpack 官方提供的，功能比较全面的 stats 可视化工具
+ Statoscope：主要侧重于模块与模块、模块与 chunk、chunk 与 chunk 等，实体之间的关系分析
+ Webpack Visualizer：一个简单的模块体积分析工具
+ Webpack Bundle Analyzer：应该是使用率最高的性能分析工具之一，主要实现以 Tree Map 方式展示各个模块的体积占比
+ Webpack Dashboard：能够在编译过程实时展示编译进度、模块分布、产物信息等
Unused Webpack Plugin：能够根据 stats 数据反向查找项目中未被使用的文件