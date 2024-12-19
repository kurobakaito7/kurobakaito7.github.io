---
title: ⚙️webpack核心配置结构
description: Webpack 是一种 「配置」 驱动的构建工具，所以站在应用的角度，必须深入学习 Webpack 的各项配置规则，才能灵活应对各种构建需求。
date: 2024-10-18
tag:
 - webpack
---

# webpack核心配置结构

## 配置结构详解

Webpack一般都以单文件导出单个配置对象方式实现，实际上，Webpack 还支持数组、函数方式配置运行参数，以适配不同场景应用需求，它们之间大致上区别：

+ 单个配置对象：比较常用的一种方式，逻辑简单，适合大多数业务项目；
+ 配置对象数组：每个数组项都是一个完整的配置对象，每个对象都会触发一次单独的构建，通常用于需要为同一份代码构建多种产物的场景，如 Library；
+ 函数：Webpack 启动时会执行该函数获取配置，我们可以在函数中根据环境参数(如 `NODE_ENV`)动态调整配置对象。

### 使用配置数组
```js
// webpack.config.js
module.exports = [{
  entry: './src/index.js',
  // 其它配置...
}, {
  entry: './src/index.js',
  // 其它配置...
}];
```

使用数组方式时，Webpack 会在启动后创建多个 `Compilation` `实例，并行执行构建工作，但需要注意，Compilation` 实例间基本上不作通讯，这意味着这种并行构建对运行性能并没有任何正向收益，例如某个 Module 在 `Compilation` 实例 A 中完成解析、构建后，在其它 `Compilation` 中依然需要完整经历构建流程，无法直接复用结果。

数组方式主要用于应对“同一份代码打包出多种产物”的场景，例如在构建 Library 时，我们通常需要同时构建出 ESM/CMD/UMD 等模块方案的产物，如：

```js
// webpack.config.js
module.exports = [
  {
    output: {
      filename: './dist-amd.js',
      libraryTarget: 'amd',
    },
    name: 'amd',
    entry: './app.js',
    mode: 'production',
  },
  {
    output: {
      filename: './dist-commonjs.js',
      libraryTarget: 'commonjs',
    },
    name: 'commonjs',
    entry: './app.js',
    mode: 'production',
  },
];
```
此时适合使用配置数组方式解决；若是“多份代码打包多份产物”的场景，则建议使用 entry 配置多个应用入口。

> 提示：使用配置数组时，还可以通过 `--config-name` 参数指定需要构建的配置对象，例如上例配置中若执行 `npx webpack --config-name='amd'`，则仅使用数组中 `name='amd'` 的项做构建。

使用数组方式时，我们还可以借助 webpack-merge 工具简化配置逻辑，如：
```js
const { merge } = require("webpack-merge");

const baseConfig = {
  output: {
    path: "./dist"
  },
  name: "amd",
  entry: "./app.js",
  mode: "production",
};

module.exports = [
  merge(baseConfig, {
    output: {
      filename: "[name]-amd.js",
      libraryTarget: "amd",
    },
  }),
  merge(baseConfig, {
    output: {
      filename: "./[name]-commonjs.js",
      libraryTarget: "commonjs",
    },
  }),
];
```
将公共配置抽取为 `baseConfig` 对象，之后配合 `webpack-merge` 创建不同目标数组项，这种方式可有效减少重复的配置代码，非常推荐使用

### 使用配置数组

配置函数方式要求在配置文件中导出一个函数，并在函数中返回 `Webpack` 配置对象，或配置数组，或 Promise 对象

```js
module.exports = function(env, argv) {
  // ...
  return {
    entry: './src/index.js',
    // 其它配置...
  }
}
```

运行时，Webpack会传入两个环境参数对象：
+ `env`：通过 `--env` 传递的命令行参数，适用于自定义参数，例如：

```md
| 命令： | env 参数值： |
| --- | --- |
|npx webpack --env prod	| { prod: true } |
|npx webpack --env prod --env min |	{ prod: true, min: true } |
|npx webpack --env platform=app --env production | { platform: "app", production: true } |
|npx webpack --env foo=bar=app | { foo: "bar=app"} |
|npx webpack --env app.platform="staging" --env app.name="test" | { app: { platform: "staging", name: "test" } } |
```

+ `argv`：命令行 Flags 参数，支持 `entry/output-path/mode/merge` 等

“配置函数”这种方式的意义在于，允许用户根据命令行参数动态创建配置对象，可用于实现简单的多环境治理策略

### 环境治理策略

在现代前端工程化实践中，通常需要将同一个应用项目部署在不同环境(如生产环境、开发环境、测试环境)中，以满足项目参与各方的不同需求。这就要求我们能根据部署环境需求，对同一份代码执行各有侧重的打包策略，例如：

+ 开发环境需要使用 webpack-dev-server 实现 Hot Module Replacement；
+ 测试环境需要带上完整的 Soucemap 内容，以帮助更好地定位问题；
+ 生产环境需要尽可能打包出更快、更小、更好的应用代码，确保用户体验。

### 核心配置项汇总

包括：流程配置、性能优化类配置、日志类配置、开发效率类配置等，这里面较常用，需要着重学习的配置有：

+ `entry`：声明项目入口文件，Webpack 会从这个文件开始递归找出所有文件依赖；
+ `output`：声明构建结果的存放位置；
+ `target`：用于配置编译产物的目标运行环境，支持 web、node、electron 等值，不同值最终产物会有所差异；
+ `mode`：编译模式短语，支持 development、production 等值，Webpack 会根据该属性推断默认配置；
+ `optimization`：用于控制如何优化产物包体积，内置 Dead Code Elimination、Scope Hoisting、代码混淆、代码压缩等功能；
+ `module`：用于声明模块加载规则，例如针对什么类型的资源需要使用哪些 Loader 进行处理；
+ `plugin`：Webpack 插件列表。


