---
title: babel 编译 + iframe 预览
description: babel 进行代码编译后 用 iframe 进行预览
tag:
 - project
 - babel
---

# babel 编译 + iframe 预览

## 编译代码

使用的是 @babel/standalone 这个包

安装
```bash
npm install --save @babel/standalone

npm install --save-dev @types/babel__standalone
```

使用方法
```js
import { transform } from '@babel/standalone'

export const babelTransform = (filename, code, files) => {
  let result = ''
  try {
    result = transform(code, {
      presets: ['react', 'typescript'],
      filename,
      plugins: [],
      retainLines: true
    }).code!
  } catch (e) {
    console.error('编译出错', e);
  }
  return result
}

export const compile = (files) => {
  const main = files['入口文件名']
  return babelTransform('入口文件名', main.value, files)
}
```

调用 babel 的 transform 方法进行编译。

presets 指定 react 和 typescript，也就是对 jsx 和 ts 语法做处理。

retainLines 是编译后保持原有行列号不变。

在 compile 方法里，对 入口文件(如main.tsx) 的内容做编译，返回编译后的代码

## 处理引用模块

但是编译后的代码还不能直接放到 iframe 里跑

我们只编译了入口文件，它引入的模块没有做处理

通过 babel 插件来处理 import 语句，转换成 **blob url** 的方式


### 分析 babel 的编译流程

流程分为 parse、transform、generate 三个阶段(具体的下来看看)

可以通过 astexplorer.net 看下对应的 AST 结构

发现要改的就是 ImportDeclaration 节点的 source.value 的内容——这对应的就是模块的路径文件

分别对 css、json 还有 tsx、ts 等后缀名的 import 做替换

```ts
import { PluginObj } from '@babel/core';

function customResolver(files: Files): PluginObj {
    return {
      visitor: {
        ImportDeclaration(path) {
            const modulePath = path.node.source.value
                if(modulePath.startsWith('.')) {
                    const file = getModuleFile(files, modulePath)
                    if(!file) 
                        return

                    if (file.name.endsWith('.css')) {
                        path.node.source.value = css2Js(file)
                    } else if (file.name.endsWith('.json')) {
                        path.node.source.value = json2Js(file)
                    } else {
                        path.node.source.value = URL.createObjectURL(
                            new Blob([babelTransform(file.name, file.value, files)], {
                                type: 'application/javascript',
                            })
                        )
                    }
                }
        },
      },
    }
}
```

### 总结逻辑：

首先得到文件名——如App.tsx, 然后通过文件名字找到内容（就是我们平时写的代码），将内容转换成对应的 blob url：
```js
path.node.source.value = URL.createObjectURL(
    new Blob([babelTransform(file.name, file.value, files)], {
        type: 'application/javascript',
    })
)
```
其中 ts 文件的处理就是用 babel 编译下，然后用 URL.createObjectURL 把编译后的文件内容作为 url。

而 css 和 json 文件则是要再做一下处理：

json 文件的处理比较简单，就是把 export 一下这个 json，然后作为 blob url 即可

而 css 文件，则是要通过 js 代码把它添加到 head 里的 style 标签里

这样引入的模块内容编译之后变为了 blob url

### 注意：

比如 App.tsx 的 jsx 内容编译后变成了 React.createElement，但是我们并没有引入 React，这样运行会报错。

做下处理：babel 编译之前，判断下文件内容有没有 import React，没有就 import 一下

```js
export const beforeTransformCode = (filename: string, code: string) => {
    let _code = code
    const regexReact = /import\s+React/g
    if ((filename.endsWith('.jsx') || filename.endsWith('.tsx')) && !regexReact.test(code)) {
      _code = `import React from 'react';\n${code}`
    }
    return _code
}

export const babelTransform = (filename: string, code: string, files: Files) => {
    let _code = beforeTransformCode(filename, code);
    let result = ''
    try {
        result = transform(_code, {
        presets: ['react', 'typescript'],
        filename,
        plugins: [customResolver(files)],
        retainLines: true
        }).code!
    } catch (e) {
        console.error('编译出错', e);
    }
    return result
}
```
如果没引入 React 就会自动引入

这样，编译过后的这段代码就可以直接在浏览器里跑啦

## 加入 iframe

加一个 iframe 标签，src url 同样是用 blob url 的方式。

用 ?raw 的 import 引入 使用的 html 的文件内容

```html
<iframe src={iframeUrl} />
```
