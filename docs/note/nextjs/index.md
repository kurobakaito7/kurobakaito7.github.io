---
title: Next.js
hidden: true
description: Next.js学习基本使用
tag: 
 - next.js
---

# Next.js基础部分

## 基于文件路由的机制

### 静态路由

Next.js 在构建时会自动查找根目录的 `pages` 文件夹，`pages` 文件夹中 js 文件对应渲染的 React 组件，就是 js 文件内 `export default` 导出的组件。

### 动态路由

动态路由使用中括号 [variable].js 作为文件名，其中 `variable` 会映射成 URL query 的变量名称，在 React 中可以通过 `useRouter` 获取路由信息：
```js
import {useRouter} from 'next/router'

export default function PortfolioDemo() {
    const router = useRouter();
    console.log(router.pathname);
    console.log(router.query);

    return <>PortfolioDemo</>
}
```

在匹配 URL 时，静态路由优先权大于动态路由。

> `[...slug]` 捕获blog之后的所有路径，并且作为slug数组的元素


### router.push

在代码中，如果需要触发导航逻辑，可以使用 ` router.push` 方法
```js
import {useRouter} from 'next/router'

export default function PortfolioDemo() {
    const router = useRouter();

		const myFunc = () => {
	    router.push("[url]");
	  }

    return <>PortfolioDemo</>
}
```

### 页面(Page)

为了保证路由可以被访问，需要创建一个特殊的名为`page.js` 的文件

### 布局(Layout)

布局是指多个页面共享的 UI。在导航的时候，布局会保留状态、保持可交互性并且不会重新渲染，比如用来实现后台管理系统的侧边导航栏。

定义一个布局，需要新建一个名为 `layout.js` 的文件，该文件默认导出一个 React 组件，该组件应接收一个 `children` prop，`chidren` 表示子布局（如果有的话）或者子页面。

> 同一文件夹下如果有 `layout.js` 和 `page.js`，page 会作为 `children` 参数传入 layout。换句话说，layout 会包裹同层级的 page。
> 布局是支持嵌套的

#### 根布局(Root Layout)

布局支持嵌套，最顶层的布局我们称之为根布局（Root Layout），也就是 `app/layout.js` 它会应用于所有的路由

注意：

1. app 目录必须包含根布局，也就是 `app/layout.js` 这个文件是必需的。
2. 根布局必须包含 html 和 body标签，其他布局不能包含这些标签。如果要更改这些标签，不推荐直接修改
3. 可以使用路由组创建多个根布局。
4. 默认根布局是服务端组件，且不能设置为客户端组件。

### 模版(template)

模板类似于布局，它也会传入每个子布局或者页面。但不会像布局那样维持状态。

模板在路由切换时会为每一个 children 创建一个实例。这就意味着当用户在共享一个模板的路由间跳转的时候，将会重新挂载组件实例，重新创建 DOM 元素，不保留状态。

定义一个模板，需要新建一个名为 `template.js` 的文件，该文件默认导出一个 React 组件，该组件接收一个 `children` prop

### 加载界面(Loading UI)

App Router 提供了用于展示加载界面的 `loading.js`, 这个功能的实现借助了 React 的Suspense API。它实现的效果就是当发生路由变化的时候，立刻展示 fallback UI，等加载完成后，展示数据。

#### 关于 Suspense ——在哪里控制关闭 fallback UI 的呢？

简单的来说，ProfilePage 会 throw 一个数据加载的 promise，Suspense 会捕获这个 promise，追加一个 then 函数，then 函数中实现替换 fallback UI 。当数据加载完毕，promise 进入 resolve 状态，then 函数执行，于是更新替换 fallback UI。

所以加载界面的实现关键在于 `page.js` 导出了一个 async 函数

`loading.js` 的实现原理是将 `page.js` 和下面的 `children` 用 `<Suspense>` 包裹。因为 `page.js` 导出一个 async 函数，Suspense 得以捕获数据加载的 promise，借此实现了 loading 组件的关闭。

### 404

pages 文件夹下创建特殊文件 `404.js`或者`not-found.js`，Next.js 将会在返回 404 错误时，自动加载组件。

相当于用户可以自定义 404 页面

### 静态文件

根目录 `public` 目录下放静态文件，Next.js 会自动处理，放在这个文件夹外的静态文件是无法获取到的

## 链接与导航

### 使用 `<Link>` 组件

基础使用

```js
import Link from 'next/link'
 
export default function Page() {
  return <Link href="/dashboard">Dashboard</Link>
}
```

### 使用 `useRouter Hook`（客户端组件）

这是 Next.js 提供的用于更改路由的 hook

基础使用

```js
'use client'
 
import { useRouter } from 'next/navigation'
 
export default function Page() {
  const router = useRouter()
 
  return (
    <button type="button" onClick={() => router.push('/dashboard')}>
      Dashboard
    </button>
  )
}
```

### 使用 `redirect` 函数（服务端组件）

客户端组件使用 useRouter hook，服务端组件则可以直接使用 redirect 函数，这也是 Next.js 提供的 API

基础使用

```js
import { redirect } from 'next/navigation'
 
async function fetchTeam(id) {
  const res = await fetch('https://...')
  if (!res.ok) return undefined
  return res.json()
}
 
export default async function Profile({ params }) {
  const team = await fetchTeam(params.id)
  if (!team) {
    redirect('/login')
  }
 
  // ...
}
```

### 使用浏览器原生 History API

也可以使用浏览器原生的 `window.history.pushState` 和 `window.history.replaceState` 方法更新浏览器的历史记录堆栈。通常与 `usePathname`（获取路径名的 hook） 和 `useSearchParams`（获取页面参数的 hook） 一起使用。