---
title: Next.js
description: Next.js学习基本使用
tag: 
 - next.js
---

# Next.js学习

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

### Link组件

可以使用 Next.js 中的 `Link` 组件来导航至各个页面
```js
import Link from 'next/link';

<Link href="/">
  首页
</Link>
```

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

### 404

pages 文件夹下创建特殊文件 `404.js`，Next.js 将会在返回 404 错误时，自动加载组件。

相当于用户可以自定义 404 页面

### 静态文件

根目录 `public` 目录下放静态文件，Next.js 会自动处理，放在这个文件夹外的静态文件是无法获取到的

### CSS模块

Next.js 通过 `[name].module.css` 文件命名约定来支持 CSS 模块。


## 页面预渲染

传统 React 应用返回的 `HTML` 文件中，不包含应用的信息，因为页面是在客户端进行渲染的，所以服务端返回的源码通常只有一个 `id` 为 `root` 的 `div` 标签，不利于做 SEO（搜索引擎优化）。

而页面预渲染就可以解决这个问题，浏览器收到的 `HTML` 文件源码是包含了页面信息的代码。

Next.js 提供了两种页面预渲染方案，**SSG 与 SSR**

+ SSG
SG 是静态站点生成，就是在文件打包阶段，预先生成页面。

Next.js 默认会预渲染所有没有动态数据的页面，而动态的数据还是像 React 一样在客户端渲染的

  + getStaticProps
    如果要在 HTML 源码中展现动态数据，可以使用 page 下 `getStaticProps` 方法。这个方法是跑在服务端环境下的，可以在服务端获取数据并渲染，并且客户端不会收到方法内任何的代码。
  + getStaticPaths
    上面指的没有动态数据的页面，也不能是动态路由（文件名带[]的js），否则也不会自动生成静态页面。如果需要生成静态页面，需要使用 `getStaticPaths` 方法。

+ SSR
SSR 是服务端渲染，**getServerSideProps** 方法可以针对每次请求作出处理，适用于数据变化比较频繁的页面。
> getStaticProps 与 getServerSideProps 只能二选一。

+ 不适合使用服务端预渲染的情况
  + 数据变化非常频繁的页面（比如股票数据）
  + 与用户身份高度耦合的页面（比如用户最近xxx的xxx）
  + 页面中只有某一小部分数据不同的情况

