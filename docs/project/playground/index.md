---
title: 🗔Playground
hidden: true
---

#  🗔React Playground

仿照 [Vue SFC playground](https://play.vuejs.org/) 做的一个 React 代码编辑器。

## 总结记录一些学习知识点

### 布局和代码编辑器

用 `allotment` 实现的 `split-pane`，两边可以通过拖动改变大小

集成 `@monaco-editor/react` 实现的编辑器

用 `@typescript/ata` 包实现了代码改变时自动下载 dts 类型包的功能——写代码有ts类型提示

### 多文件切换

在 Context 中保存全局数据，比如 files、selectedFileName，还有对应的增删改的方法。

对 Context.Provider 封装了一层来注入初始化数据和方法，提供了 initFiles 的信息。

然后在 FileNameList 里读取 context 里的 files 来渲染文件列表。

点击 tab 的时候切换 selectedFileName，从而切换编辑器的内容。

然后实现了编译以及在 iframe 里预览

### babel编译、iframe 预览

使用 `@babel/standalone` 做的 tsx 代码的编译，编译过程中需要对 `.tsx、.css、.json` 等模块的 import 做处理，变成 blob url 的方式。

### 错误显示

在 iframe 里监听 error 事件，发生错误的时候通过 postMessage 传递给父窗口。

父窗口里监听 message 事件传过来的错误，用 Message 组件显示。

### 主题切换

### 链接分享 和 代码下载

链接分享原理就是把 files 信息 JSON.stringify 之后保存到 location.hash。

然后初始化的时候从 location.hash 读取出来 JSON.parse 之后设置到 files。

这个过程中还要做下压缩，用 fflate 这个包来对字符串进行压缩，然后用 btoa 转为 asc 码字符串。

代码下载则是基于 jszip 和 file saver 包实现的。

这样，playground 里写的代码内容就可以通过 url 分享出去，并且可以下载了。

### 性能优化

用 Performance 分析了页面的 Event Loop，发现有 long task，性能优化的目标就是消除 long task。

分析发现是 babel 编译的逻辑导致的。

通过 Web Worker 把 babel 编译的逻辑放到了 worker 线程跑，通过 message 事件和 postMessage 和主线程通信。

拆分后功能正常，再用 Performance 分析，发现耗时逻辑被转移到了 worker 线程，主线程这个 long task 没有了。


## ✨技术亮点

+ 用 @monaco-editor/react 实现了网页版 typescript 编辑器，并且实现了自动类型导入
+ 通过 @babel/standalone 实现了文件编译，并且写了一个 babel 插件实现了 import 的 source 的修改
+ 通过 blob url 来内联引入其他模块的代码，通过 import maps 来引入 react、react-dom 等第三方包的代码
+ 通过 iframe 实现了预览功能，并且通过 postMessage 和父窗口通信来显示代码运行时的错误
+ 基于 css 变量 + context 实现了主题切换功能
+ 通过 fflate + btoa 实现了文件内容的编码、解码，可以通过链接分享代码
+ 通过 Performance 分析性能问题，并通过 Web Worker 拆分编译逻辑到 worker 线程来进行性能优化，消除了 long lask
