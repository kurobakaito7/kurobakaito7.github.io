---
title: ⚙️webpack持久化缓存
description: 通过Webpack持久化缓存，大幅提升构建性能
date: 2024-10-18
tag:
 - webpack
---

# Webpack中的持久化缓存

持久化缓存算得上是 Webpack 5 最令人振奋的特性之一，它能够将首次构建的过程与结果数据持久化保存到本地文件系统，
在下次执行构建时跳过解析、链接、编译等一系列非常消耗性能的操作，直接复用上次的 Module/ModuleGraph/Chunk 对象数据，迅速构建出最终产物

## 设置持久化缓存

仅仅需要设置 `cache.type = 'filesystem'` 即可开启持久化缓存
```js
module.exports = {
    //...
    cache: {
        type: 'filesystem'
    },
    //...
};
```

`cache` 配置项: 
+ `cache.type`：缓存类型，支持 `'memory' | 'filesystem'`，需要设置为 `filesystem` 才能开启持久缓存
+ `cache.cacheDirectory`：缓存文件路径，默认为 `node_modules/.cache/webpack`
+ `cache.buildDependencies`：额外的依赖文件，当这些文件内容发生变化时，缓存会完全失效而执行完整的编译构建，通常可设置为各种配置文件
+ `cache.managedPaths`：受控目录，Webpack 构建时会跳过新旧代码哈希值与时间戳的对比，直接使用缓存副本，默认值为 `['./node_modules']`
+ `cache.profile`：是否输出缓存处理过程的详细日志，默认为 `false`
+ `cache.maxAge`：缓存失效时间，默认值为 `5184000000`


## 缓存原理

Webpack5 会将首次构建出的 Module、Chunk、ModuleGraph 等对象序列化后保存到硬盘中，后面再运行的时候，就可以跳过许多耗时的编译动作，直接复用缓存数据

Webpack的构建过程：
+ 初始化：根据配置信息设置内置的各类插件
+ Make-构建阶段，从 `entry` 模块开始，执行：
  + 读入文件内容
  + 调用 Loader 转译文件内容
  + 调用 acorn 生成AST结构
  + 分析 AST ，确定模块依赖列表
  + 遍历模块依赖列表，对每一个模块重新执行上述流程，直到生成完整的模块依赖图——ModuleGraph对象
+ Seal-生成阶段，过程：
  + 遍历模块依赖图，对每个模块执行：
    + 代码转译，如 `import` 转换为 `require` 调用
    + 分析运行时依赖
  + 合并模块代码与运行时代码，生成 chunk
  + 执行产物优化操作，如 Tree-shaking
  + 将最终结果写出到产物文件

过程中存在许多 CPU 密集型操作，例如调用 Loader 链加载文件时，遇到 `babel-loader`、`eslint-loader`、`ts-loader` 等工具时可能需要重复生成 AST；分析模块依赖时则需要遍历 AST，执行大量运算；Seal 阶段也同样存在大量 AST 遍历，以及代码转换、优化操作，等等。假设业务项目中有 1000 个文件，则每次执行 `npx webpack` 命令时，都需要从 0 开始执行 1000 次构建、生成逻辑。

而 Webpack5 的持久化缓存功能则将构建结果保存到文件系统中，在下次编译时对比每一个文件的内容哈希或时间戳，未发生变化的文件跳过编译操作，直接使用缓存副本，减少重复计算；发生变更的模块则重新执行编译流程

Webpack 在首次构建完毕后将 Module、Chunk、ModuleGraph 三类对象的状态序列化并记录到缓存文件中；在下次构建开始时，尝试读入并恢复这些对象的状态，从而跳过执行 Loader 链、解析 AST、解析依赖等耗时操作，提升编译性能

## Webpack4缓存

Webpack5 的持久化缓存用法简单，效果出众，但可惜在 Webpack4 及之前版本原生还没有相关实现，只能借助一些第三方组件实现类似效果

+ 使用 `cache-loader`: 针对 Loader 运行结果的通用缓存方案
+ 使用 `hard-source-webpack-plugin`: 针对 Webpack 全生命周期的通用缓存方案
+ 使用  Loader（如 `babel-loader`、`eslint-loader`）自带的缓存能力


## 使用组件自带的缓存功能

可以使用 Webpack 组件自带的缓存能力提升特定领域的编译性能，这一类组件有：
+ babel-loader: 针对 Babel 工具的专用缓存能力
+ eslint-loader/eslint-webpack-plugin: 针对 ESLint 的专用缓存方案
+ stylelint-webpack-plugin: 针对 StyleLint 的专用缓存方案

> 思考🤔：持久化缓存很好，但是缺点是什么？为什么不是默认开启？使用场景有哪些？
> 可以看看👉[官方文档](https://github.com/webpack/changelog-v5/blob/master/guides/persistent-caching.md)