---
title: ⚙️代码压缩
description: Webpack中的代码压缩
tag:
 - webpack
---

# 代码压缩

**代码压缩** 是指在不改变代码功能的前提下，从声明式（HTML、CSS）或命令式（JavaScript）语言中删除所有不必要的字符（备注、变量名压缩、逻辑语句合并等），减少代码体积的过程，这在 Web 场景中能够有效减少浏览器从服务器获取代码资源所需要消耗的传输量，降低网络通讯耗时，提升页面启动速度，是一种非常基础且性价比特别高的应用性能优化方案

## 代码压缩原理

代码压缩最关键的问题是：如何用**更精简**的代码表达**同一套**程序逻辑

“更精简” 意味着可以适当 —— 甚至完全牺牲可读性、语义、优雅度而力求用最少字符数的方式书写代码

“同一套”意味着修改前后必须保持一致的代码逻辑、执行流程、功能效果等

为了应对这两个挑战，很自然的我们可以先将字符串形态的代码转换为结构化、容易分析处理的 AST（抽象语法树）形态，之后在 AST 上应用上面的规则做各种语法、语义、逻辑推理与简化替换，最后按精简过的 AST 生成结果代码

社区曾经出现过非常非常多 JavaScript、HTML、CSS 代码压缩工具，基本上都是按照上面这种套路实现的，包括：`Terser、ESBuild、CSS-Nano、babel-minify、htmlMinifierTerser` 等， 在Webpack 中可以使用 `optimization.minimizer` 数组接入代码压缩插件，实现代码压缩

## 使用 `TerserWebpackPlugin` 压缩 JS

Terser 是当下 最为流行 的 ES6 代码压缩工具之一，支持 `Dead-Code Eliminate`、删除注释、删除空格、代码合并、变量名简化等等一系列代码压缩功能。Terser 的前身是大名鼎鼎的 UglifyJS，它在 UglifyJS 基础上增加了 ES6 语法支持，并重构代码解析、压缩算法，使得执行效率与压缩率都有较大提升

Webpack5.0 后默认使用 `Terser` 作为 JavaScript 代码压缩器，简单用法只需通过 `optimization.minimize` 配置项开启压缩功能即可：
```js
module.exports = {
  //...
  optimization: {
    minimize: true
  }
};
```
> 提示：使用 `mode = 'production'` 启动生产模式构建时，默认也会开启 Terser 压缩

多数情况下使用默认 Terser 配置即可，必要时也可以手动创建 `terser-webpack-plugin` 实例并传入压缩配置实现更精细的压缩功能
```js
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  // ...
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            reduce_vars: true,
            pure_funcs: ["console.log"],
          },
          // ...
        },
      }),
    ],
  },
};
```

## 使用 `CssMinimizerWebpackPlugin` 压缩 CSS

```js
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  //...
  module: {
    rules: [
      {
        test: /.css$/,
        // 注意，这里用的是 `MiniCssExtractPlugin.loader` 而不是 `style-loader`
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      // Webpack5 之后，约定使用 `'...'` 字面量保留默认 `minimizer` 配置
      "...",
      new CssMinimizerPlugin(),
    ],
  },
  // 需要使用 `mini-css-extract-plugin` 将 CSS 代码抽取为单独文件
  // 才能命中 `css-minimizer-webpack-plugin` 默认的 `test` 规则
  plugins: [new MiniCssExtractPlugin()],
};
```

## 使用 `HtmlMinifierTerser` 压缩 HTML

现代 Web 应用大多会选择使用 React、Vue 等 MVVM 框架，这衍生出来的一个副作用是原生 HTML 的开发需求越来越少，HTML 代码占比越来越低，所以大多数现代 Web 项目中其实并不需要考虑为 HTML 配置代码压缩工作流。不过某些场景如 SSG 或官网一类偏静态的应用中就存在大量可被优化的 HTML 代码，为此社区也提供了一些相关的工程化工具，例如 `html-minifier-terser`

`html-minifier-terser` 是一个基于 JavaScript 实现的、高度可配置的 HTML 压缩器，支持一系列 压缩特性

```js
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlMinimizerPlugin = require("html-minimizer-webpack-plugin");

module.exports = {
  // ...
  optimization: {
    minimize: true,
    minimizer: [
      // Webpack5 之后，约定使用 `'...'` 字面量保留默认 `minimizer` 配置
      "...",
      new HtmlMinimizerPlugin({
        minimizerOptions: {
          // 折叠 Boolean 型属性
          collapseBooleanAttributes: true,
          // 使用精简 `doctype` 定义
          useShortDoctype: true,
          // ...
        },
      }),
    ],
  },
  plugins: [
    // 简单起见，这里我们使用 `html-webpack-plugin` 自动生成 HTML 演示文件
    new HtmlWebpackPlugin({
      templateContent: `<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>webpack App</title>
      </head>
      <body>
        <input readonly="readonly"/>
        <!-- comments -->
        <script src="index_bundle.js"></script>
      </body>
    </html>`,
    }),
  ],
};
```

> 代码压缩与代码混淆的区别：
> 代码压缩侧重的是减少代码体积，而代码混淆侧重的是降低代码可读性，从而达到保护代码，降低代码被别有用心的人利用的目的。代码压缩是代码混淆的一种实现手段，因为代码压缩必然会导致代码可读性降低，但代码混淆的手段却不止有代码压缩，并且代码混淆有时候还会导致代码体积的膨胀，比如说现在常用到的流程平坦化，这种混淆方式就会使代码体积膨胀，但对于降低可读性却具有重要作用