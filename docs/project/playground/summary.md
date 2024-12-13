---
title: ⛄playground 项目总结
description: 项目收工啦，做一些总结！
cover: false
date: 2024-10-20
tag:
 - project
---

# ⛄playground 项目总结

## 实现思路

- 编译用的`@babel/standalone`，这个是babel的浏览器版本

- 关于文件中 import 导入 文件问题

   - 思路：
     - 1. 像vite 的dev server那样做一个根据 moduleId 返回编译后的模块内容的服务（但是这是一个纯前端的项目，所以不适合）
     - 使用blob url：将要导入的文件转化为一个blob url，然后替换import 的路径，达到浏览器能运行的目的
- 还有就是 react 和 react-dom 包问题，它不是左侧的代码文件，那么如何实现引入问题？
   - 思路：
     - 利用 import-maps 机制，使用 [esm.sh] 专门提供 esm 模块的CDN服务 

### 如何替换import的路径？

编写一个babel 插件 在babel 的transform阶段，对ImportDeclaration 的AST做处理，把 source.value 替换为对应文件的 blob url ————babel 的编译流程、AST的构成

### 编译器部分

用的@monaco-editor/react 周下载量 82万

monaco editor 还是 VS Code 的编译器核心，功能十分强大，提供了丰富的代码提示、错误检测、API查找等功能，使体验十分接近 VS Code

还可以设置TS的compilerOptions

其他考虑的库是 CodeMirror、React SimpleMDE、React Quill等

- 拖动改变代码区和预览区的宽度：使用 allotment第三方组件

- 引入第三方包或者写TS支持代码提示：使用 @typescript/ata 包
用 ts 包去分析代码，然后自动下载用到的类型包，编辑器挂载的时候调用一下，实现代码改变时自动下载 dts 类型包的功能

### 多文件切换
使用 Context 保存数据

context 在传递跨层数据方面很好用，在组件库中使用很多，但是有一些性能上的缺点：
- context 如果是一个对象，传递多个属性的数据，不管任意属性变了，都会导致依赖其他属性的组件跟着重新渲染，这时候的解决方案就是拆分 context，每种数据放在独立的一个context中
- 但是会出现一个问题：Provider嵌套过深。所以context存放一些配置数据还好，例如theme，size等，如果有很多业务数据，就需要使用 redux、zustand、jotai 等状态管理库，它们不是基于context实现的，就不会出现这些问题
- 用 memo 包裹子组件

### 预览部分

使用 iframe + 通信机制

左边编译的结果传给 iframe 渲染

编写插件处理import 语句，转换成blob url的形式，将文件内容转成对应的url

#### **文件的处理规则：**
- ts文件的处理就是用 babel 编译下，然后用 URL.createObjectURL 把编译后的文件内容作为 url。
```js
URL.creactObjectURL(new Blob([文件内容], {type: 'application/javascript'}))
```
- json 文件的处理比较简单，就是把 export 一下这个 json，然后作为 blob url。
```js
const js = `export default ${file.value}`
return URL.createObjectURL(new Blob([js], { type: 'application/javascript' }))
```
-  css 文件，则是要通过 js 代码把它添加到 head 里的 style 标签里：
```js
const js = `
(() => {
    const stylesheet = document.createElement('style')
    stylesheet.setAttribute('id', 'style_${randomId}_${file.name}')
    document.head.appendChild(stylesheet)

    const styles = document.createTextNode(\`${file.value}\`)
    stylesheet.innerHTML = ''
    stylesheet.appendChild(styles)
})()
    `
return URL.createObjectURL(new Blob([js], { type: 'application/javascript' }))
```

#### **babel 编译**
插件写好后就开始写babel的编译，调用 babel 的 transform 方法进行编译，指定 react 和 typescript，也就是对 jsx 和 ts 语法做处理，并把插件加载一下,运行之后就得到了可以在浏览器上运行的blob url

> 注意 jsx 文件经过babel编译之后会变成 React.createElement,如果文件没有引入React，这样运行会报错，需要做处理：
在babel 编译之前，判断下文件内容有没有 import React，没有就 import 一下，来实现自动引入
```js
export const beforeTransformCode = (filename: string, code: string) => {
    let _code = code
    const regexReact = /import\s+React/g
    if ((filename.endsWith('.jsx') || filename.endsWith('.tsx')) && !regexReact.test(code)) {
      _code = `import React from 'react';\n${code}`
    }
    return _code
}
```

### 错误显示

预览出错的时候，iframe 会白屏，并不会显示错误。但是在devtools可以看到错误信息，需要做这些信息的展示

错误的内容从iframe 传出，在iframe中监听错误，通过 postMessage 传递消息给父窗口（这也是一种跨域的手段）
```js
window.addEventListener('error', (e) => {
   window.parent.postMessage({type: 'ERROR', message: e.message})
})
```
父窗口预览组件中监听消息：
```js
useEffect(() => {
   window.addEventListener('message', handleMessage)
   return () => {
      window.removeEventListener('message', handleMessage)
   }
}, [])
```


### 链接分享

链接分享原理是将files信息 JSON.stringfy 成字符串，对字符串 `encodeURIComponent` 下，把 url 里不支持的字符做下转换之后保存到 location.hash
```js
useEffect(() => {
    const hash = JSON.stringify(files)
    window.location.hash = encodeURIComponent(hash)
}, [files])
```
然后初始化的时候是从 location.hash 读取出来 JSON.parse 之后设置到 files
```js
const getFilesFromUrl = () => {
  let files: Files | undefined
  try {
      const hash = decodeURIComponent(window.location.hash.slice(1))
      files = JSON.parse(hash)
  } catch (error) {
    console.error(error)
  }
  return files
}
```
但是文件内容组成的hash非常长，需要做下压缩，用 fflate 这个包来对字符串进行压缩，然后用 btoa 转为 asc 码字符串。

将链接复制到剪切板：
使用copy-to-clipboard库

### 文件下载

把多个文件压缩成zip包 jszip

触发文件下载 file-saver

## 性能优化

### 查看性能

查看 Performance 录制的性能数据，发现代表babel编译的babelTransform方法十分耗时，是一个long task

long task 会导致主线程一直被占据，阻塞渲染，表现出来的就是页面卡顿。

性能优化的目标就是消除这种 long task。

分析这段代码发现，这是 babel 内部代码，这段代码计算量比较大，我们把它放到单独的 worker 线程来跑就好了，这样就不会占用主线程的时间。

### web worker使用

查看 vite 官方文档，里面有vite 项目 web worker 的使用方法

使用postMessage 和监听message 事件进行主线程和worker线程的通信：

主线程这边给 worker 线程传递 files，然后拿到 woker 线程传回来的编译后的代码，而 worker 线程这边则是监听主线程的 message，传递 files 编译后的代码给主线程

### 其他优化
而且每次 files 变化没必要频繁的触发编译，加一个防抖优化一下

main.tsx 编译器报错说 StrictMode 不是一个jsx，因为不影响运行，所以没有解决这个，可以自己改动模版，将其删去即可


> 收工啦嘻嘻🥰🥰