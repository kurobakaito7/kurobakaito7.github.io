---
title: ⚙️webpack 构建性能优化
description: 一些构建性能优化技巧
date: 2024-10-18
tag:
 - webpack
---

# Webpack 构建性能优化

Webpack 可以借助若干工具分析构建性能，以及可以使用缓存与多进程能力提升构建性能，这些方法可以通过简单的配置，极大提升大型项目的编译效率

除此之外，还可以通过一些普适、细碎的最佳实践，减少编译范围、编译步骤提升性能，包括：
+ 使用最新版的 Webpack、Node
+ 配置 `resolve` 控制资源搜索范围
+ 针对 npm 包设置 `module.noParse` 跳过编译步骤

## 使用最新版本

+ V3 到 V4 重写 `Chunk` 依赖逻辑，将原来的父子树状关系调整为 `ChunkGroup` 表达的有序图关系，提升代码分包效率
+ V4 到 V5 引入 `cache` 功能，支持将模块、模块关系图、产物等核心要素持久化缓存到硬盘，减少重复工作
+ Webpack5 引入 cache（持久化缓存）、lazyCompilation（按需编译）

## 使用 `lazyCompilation`

Webpack 5.17.0 之后引入实验特性 `lazyCompilation`，用于实现 `entry` 或异步引用模块的按需编译，这是一个非常实用的新特性

```js
// webpack.config.js
module.exports = {
  // ...
  experiments: {
    lazyCompilation: true,
  },
};
```

启动 `lazyCompilation` 后，代码中通过异步引用语句如 `import('./xxx')` 导入的模块（以及未被访问到的 `entry`）都不会被立即编译，而是直到页面正式请求该模块资源（例如切换到该路由）时才开始构建，效果与 Vite 相似，能够极大提升冷启速度

不过，`lazyCompilation` 还处于实验阶段，无法保证稳定性，接口形态也可能发生变更，建议只在开发环境使用

## 约束 Loader 执行范围

Loader 组件用于将各式文件资源转换为可被 Webpack 理解、构建的标准 JavaScript 代码，正是这一特性支撑起 Webpack 强大的资源处理能力。不过，Loader 在执行内容转换的过程中可能需要比较密集的 CPU 运算，如 `babel-loader`、`eslint-loader`、`vue-loader` 等，需要反复执行代码到 AST，AST 到代码的转换

因此开发者可以根据实际场景，使用 `module.rules.include`、`module.rules.exclude` 等配置项，限定 Loader 的执行范围 —— 通常可以排除 `node_module` 文件夹


## 使用 `noParse` 跳过文件编译

有不少 NPM 库已经提前做好打包处理（文件合并、Polyfill、ESM 转 CJS 等），不需要二次编译就可以直接放在浏览器上运行，如：
+ Vue2 的 `node_modules/vue/dist/vue.runtime.esm.js` 文件
+ React 的 `node_modules/react/umd/react.production.min.js` 文件
+ Lodash 的 `node_modules/lodash/lodash.js` 文件

对我们来说，这些资源文件都是独立、内聚的代码片段，没必要重复做代码解析、依赖分析、转译等操作，此时可以使用 `module.noParse` 配置项跳过这些资源
```js
// webpack.config.js
module.exports = {
  //...
  module: {
    noParse: /lodash|react/,
  },
};
```

配置后，所有匹配该正则的文件都会跳过前置的构建、分析动作，直接将内容合并进 Chunk，从而提升构建速度

## 开发模式禁用产物优化

Webpack 提供了许多产物优化功能，例如：`Tree-Shaking`、`SplitChunks`、`Minimizer` 等，这些能力能够有效减少最终产物的尺寸，提升生产环境下的运行性能，但这些优化在开发环境中意义不大，反而会增加构建器的负担

因此，开发模式下建议关闭这一类优化功能:
+ 确保 `mode='development'` 或 `mode = 'none'`，关闭默认优化策略
+ `optimization.minimize` 保持默认值或 `false`，关闭代码压缩
+ `optimization.concatenateModules` 保持默认值或 `false`，关闭模块合并
+ `optimization.splitChunks` 保持默认值或 `false`，关闭代码分包
+ `optimization.usedExports` 保持默认值或 `false`，关闭 `Tree-shaking` 功能

建议开发环境配置：
```js
module.exports = {
  // ...
  mode: "development",
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
    minimize: false,
    concatenateModules: false,
    usedExports: false,
  },
};
```

## 最小化 `watch` 监控范围

在 `watch` 模式下（通过 `npx webpack --watch` 命令启动），Webpack 会持续监听项目目录中所有代码文件，发生变化时执行 `rebuild` 命令。

不过，通常情况下前端项目中部分资源并不会频繁更新，例如 `node_modules` ，此时可以设置 `watchOptions.ignored` 属性忽略这些文件

```js
// webpack.config.js
module.exports = {
  //...
  watchOptions: {
    ignored: /node_modules/
  },
};
```

## 跳过 TS 类型检查

类型检查涉及 AST 解析、遍历以及其它非常消耗 CPU 的操作，会给工程化流程带来比较大的性能负担，因此我们可以选择关闭 `ts-loader` 的类型检查功能
```js
module.exports = {
  // ...
  module: {
    rules: [{
      test: /\.ts$/,
      use: [
        {
          loader: 'ts-loader',
          options: {
            // 设置为“仅编译”，关闭类型检查
            transpileOnly: true
          }
        }
      ],
    }],
  }
};
```
而 TS 类型检查的功能，我们可以：
+ 可以借助编辑器的 TypeScript 插件实现代码检查
+ 使用 `fork-ts-checker-webpack-plugin` 插件将类型检查能力剥离到 子进程 执行

## 优化 ESLint 性能

在开发模式下使用 `eslint-loader` 实现实时代码检查，会带来比较高昂且不必要的性能成本，我们可以选择其它更聪明的方式接入 ESLint

例如，使用新版本插件 `eslint-webpack-plugin` 替代旧版 `eslint-loader`，两者差异在于，`eslint-webpack-plugin` 在模块构建完毕（`compilation.hooks.succeedModule` 钩子）后执行检查，不会阻断文件加载流程，性能更优

或者，可以选择在特定条件、场景下执行 ESLint，减少对构建流程的影响
+ 使用编辑器插件完成 ESLint 检查、错误提示、自动 Fix，如 VS Code 的 `dbaeumer.vscode-eslint` 插件
+ 使用 `husky`，仅在代码提交前执行 ESLint 代码检查
+ 仅在 `production` 构建中使用 ESLint，能够有效提高开发阶段的构建效率

## 慎用 `source-map`

`source-map` 是一种将经过编译、压缩、混淆的代码映射回源码的技术，它能够帮助开发者迅速定位到更有意义、更结构化的源码中，方便调试。不过，`source-map` 操作本身也有很大构建性能开销，所以我们应该根据实际场景慎重选择最合适的 `source-map` 方案

针对 `source-map` 功能，Webpack 提供了 `devtool` 选项，可以配置 `eval`、`source-map`、`cheap-source-map` 等值，不考虑其它因素的情况下，最佳实践：

+ 开发环境使用 `eval` ，确保最佳编译速度
+ 生产环境使用 `source-map`，获取最高质量

## 设置 `resolve` 缩小搜索范围

Webpack 默认提供了一套同时兼容 CMD、AMD、ESM 等模块化方案的资源搜索规则——`enhanced-resolve`，
它能将各种模块导入语句准确定位到模块对应的物理资源路径

+ `import 'lodash'` 这一类引入 NPM 包的语句会被 `enhanced-resolve` 定位到对应包体文件路径 `node_modules/lodash/index.js`
+ `import './a'` 这类不带文件后缀名的语句，则可能被定位到 `./a.js` 文件
+ `import '@/a'` 这类化名路径的引用，则可能被定位到 `$PROJECT_ROOT/src/a.js` 文件

需要注意，这类增强资源搜索体验的特性背后涉及许多 IO 操作，本身可能引起较大的性能消耗，开发者可根据实际情况调整 `resolve` 配置，缩小资源搜索范围

