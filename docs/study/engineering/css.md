---
title: ⚙️预处理器、PostCSS构建现代CSS工程环境
description: 预处理器、PostCSS构建现代CSS工程环境
tag:
 - webpack
---

# ⚙️预处理器、PostCSS构建现代CSS工程环境

##  Webpack 处理 CSS 资源

+ `css-loader`：该 Loader 会将 CSS 等价翻译为形如 `module.exports = "${css}"` 的JavaScript 代码，使得 Webpack 能够如同处理 JS 代码一样解析 CSS 内容与资源依赖；
+ `style-loader`：该 Loader 将在产物中注入一系列 runtime 代码，这些代码会将 CSS 内容注入到页面的 `<style>` 标签，使得样式生效；
+ `mini-css-extract-plugin`：该插件会将 CSS 代码抽离到单独的 .css 文件，并将文件通过 `<link>` 标签方式插入到页面中。

三种组件各司其职：`css-loader` 让 Webpack 能够正确理解 CSS 代码、分析资源依赖；`style-loader`、`mini-css-extract-plugin` 则通过适当方式将 CSS 插入到页面，对页面样式产生影响

+ `css-loader` 提供了很多处理 CSS 代码的基础能力，包括 CSS 到 JS 转译、依赖解析、Sourcemap、css-in-module 等，基于这些能力，Webpack 才能像处理 JS 模块一样处理 CSS 模块代码。

经过 `css-loader` 处理后，CSS 代码会被转译为等价 JS 字符串，但这些字符串还不会对页面样式产生影响，需要继续接入 `style-loader` 加载器。

1. 开发环境：使用 `style-loader` 将样式代码注入到页面 `<style>` 标签；

与其它 Loader 不同，`style-loader` 并不会对代码内容做任何修改，而是简单注入一系列运行时代码，用于将 `css-loader` 转译出的 JS 字符串插入到页面的 `style` 标签。

经过 `style-loader + css-loader` 处理后，样式代码最终会被写入 Bundle 文件，并在运行时通过 `style` 标签注入到页面。这种将 JS、CSS 代码合并进同一个产物文件的方式有几个问题：

+ JS、CSS 资源无法并行加载，从而降低页面性能；
+ 资源缓存粒度变大，JS、CSS 任意一种变更都会致使缓存失效。

因此，生产环境中通常会用 `mini-css-extract-plugin` 插件替代 `style-loader`，将样式代码抽离成单独的 CSS 文件

2. 生产环境：使用 `mini-css-extract-plugin` 将样式代码抽离到单独产物文件，并以 `<link>` 标签方式引入到页面中。

注意：

+ `mini-css-extract-plugin` 库同时提供 Loader、Plugin 组件，需要同时使用
+ `mini-css-extract-plugin` 不能与 style-loader 混用，否则报错，需要判断 `process.env.NODE_ENV` 环境变量决定使用那个 Loader
+ `mini-css-extract-plugin` 需要与 `html-webpack-plugin` 同时使用，才能将产物路径以 `link` 标签方式插入到 html 中


## 使用预处理器

CSS —— Cascading Style Sheet-级联样式表，最初设计用于描述 Web 界面样式的描述性语言，经过这么多年的发展其样式表现力已经突飞猛进，但核心功能、基本语法没有发生太大变化，至今依然没有提供诸如循环、分支判断、扩展复用、函数、嵌套之类的特性，以至于原生 CSS 已经难以应对当代复杂 Web 应用的开发需求。

为此，社区在 CSS 原生语法基础上扩展出一些更易用，功能更强大的 CSS 预处理器(Preprocessor)，比较知名的有 `Less、Sass、Stylus` 。这些工具各有侧重，但都在 CSS 之上补充了扩展了一些逻辑判断、数学运算、嵌套封装等特性，基于这些特性，我们能写出复用性、可读性、可维护性更强，条理与结构更清晰的样式代码

## 使用 post-css

与上面的 `Less/Sass/Stylus` 这一类预处理器类似，PostCSS 也能在原生 CSS 基础上增加更多表达力、可维护性、可读性更强的语言特性。两者主要区别在于预处理器通常定义了一套 CSS 之上的超集语言；PostCSS 并没有定义一门新的语言，而是与 `@babel/core` 类似，只是实现了一套将 CSS 源码解析为 AST 结构，并传入 PostCSS 插件做处理的流程框架，具体功能都由插件实现。
> 预处理器之于 CSS，就像 TypeScript 与 JavaScript 的关系；而 PostCSS 之于 CSS，则更像 Babel 与 JavaScript。

PostCSS 最大的优势在于其简单、易用、丰富的插件生态，基本上已经能够覆盖样式开发的方方面面。实践中，经常使用的插件有：

+ autoprefixer：基于 Can I Use 网站上的数据，自动添加浏览器前缀
+ postcss-preset-env：一款将最新 CSS 语言特性转译为兼容性更佳的低版本代码的插件
+ postcss-less：兼容 Less 语法的 PostCSS 插件，类似的还有：postcss-sass、poststylus
+ stylelint：一个现代 CSS 代码风格检查器，能够帮助识别样式代码中的异常或风格问题

## style-loader 与 mini-css-extract-plugin 实现的效果有什么区别？对页面性能会产生什么影响？

+ `style-loader`:

    + 工作方式: `style-loader` 将 CSS 文件通过 `<style>` 标签动态插入到 HTML 文件的 `<head>` 中。这意味着 CSS 样式会在 JavaScript 文件加载后立即应用到页面上。
    + 优点: 开发过程中实时看到样式变化，无需刷新页面。
    + 缺点: 由于 CSS 是在 JavaScript 加载后插入的，这可能会导致页面加载时间延长，尤其是在 JavaScript 文件较大或网络较慢的情况下。
+ `mini-css-extract-plugin`:

    + 工作方式:` mini-css-extract-plugin` 将 CSS 文件提取到单独的文件中，然后在 HTML 文件中通过 `<link>` 标签引入。这样，CSS 文件可以与 JavaScript 文件并行加载，从而提高页面加载速度。
    + 优点: 提高页面加载速度，因为 CSS 文件可以并行加载。
    + 缺点: 在开发过程中，每次修改 CSS 文件后都需要重新编译，才能看到样式变化。

对页面性能的影响:

+ `style-loader`: 在开发环境中，使用 `style-loader` 可以提供即时的样式反馈，但在生产环境中，它可能会导致页面加载时间延长，因为 JavaScript 文件的加载会阻塞 CSS 的加载和应用。
+ `mini-css-extract-plugin`: 在生产环境中，使用 `mini-css-extract-plugin` 可以显著提高页面加载速度，因为 CSS 文件可以与 JavaScript 文件并行加载。在开发环境中，虽然需要额外的编译步骤，但这通常是可以接受的，因为开发环境更注重的是开发效率和实时反馈。 