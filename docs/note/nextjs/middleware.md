---
title: 中间件(Middleware)
description: Next.js 中间件
tag: 
 - next.js
---

# 中间件

使用中间件，可以拦截并控制应用里的所有请求和响应。

例如我们可以基于传入的请求，重写、重定向、修改请求或响应头、甚至直接响应内容。

一个比较常见的应用就是鉴权，在打开页面渲染具体的内容前，先判断用户是否登录，如果未登录，则跳转到登录页面。

## 定义

写中间件，需要在项目的根目录定义一个名为 `middleware.js` 的文件。
> 注意：这里说的项目根目录指的是和 `pages` 或 `app` 同级。但如果项目用了 `src` 目录，则放在 `src`下。

例如：
```js
// middleware.js
import { NextResponse } from 'next/server'
 
// 中间件可以是 async 函数，如果使用了 await
export function middleware(request) {
  return NextResponse.redirect(new URL('/home', request.url))
}

// 设置匹配路径
export const config = {
  matcher: '/about/:path*',
}
```
我们通过 `config.matcher` 设置中间件生效的路径，在 `middleware` 函数中设置中间件的逻辑，作用是将` /about、/about/xxx、/about/xxx/xxx` 这样的的地址统一重定向到 `/home`

## 设置匹配路径

有两种方法可以指定中间件的匹配路径

### matcher 配置项

第一种是使用 `matcher` 配置项

`matcher` 不仅支持字符串形式，也支持数组形式，用于匹配多个路径

```js
export const config = {
  matcher: ['/about/:path*', '/dashboard/:path*'],
}
```
`:path*` 这种用法来自于 `path-to-regexp` 库, 作用就是将 `/user/:name`这样的路径字符串转换为正则表达式

`path-to-regexp` 通过在参数名前加一个冒号来定义**命名参数**（Named Parameters），`matcher` 支持命名参数，比如 `/about/:path`匹配 `/about/a`和 `/about/b`，但是不匹配 `/about/a/c`

命名参数可以使用修饰符，其中 `*` 表示 0 个或 1 个或多个，`?`表示 0 个或 1 个，`+`表示 1 个或多个

> 注意：路径必须以 `/`开头。`matcher` 的值必须是常量，这样可以在构建的时候被静态分析。使用变量之类的动态值会被忽略。

matcher 的强大可远不止正则表达式，matcher 还可以判断查询参数、cookies、headers
```js
export const config = {
  matcher: [
    {
      source: '/api/*',
      has: [
        { type: 'header', key: 'Authorization', value: 'Bearer Token' },
        { type: 'query', key: 'userId', value: '123' },
      ],
      missing: [{ type: 'cookie', key: 'session', value: 'active' }],
    },
  ],
}
```
在这个例子中，不仅匹配了路由地址，还要求 `header` 的 `Authorization` 必须是 `Bearer Token`，查询参数的 `userId` 为 `123`，且 `cookie` 里的 `session` 值不是 `active`。

### 条件语句

第二种方法是使用条件语句
```js
import { NextResponse } from 'next/server'
 
export function middleware(request) {
  if (request.nextUrl.pathname.startsWith('/about')) {
    return NextResponse.rewrite(new URL('/about-2', request.url))
  }
 
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.rewrite(new URL('/dashboard/user', request.url))
  }
}
```

## 中间件逻辑

```js
export function middleware(request) {
  // 如何读取和设置 cookies ？
  // 如何读取 headers ？
  // 如何直接响应?
}
```

### 如何读取和设置 cookies？

用法跟路由处理程序一致，使用 `NextRequest` 和 `NextResponse` 快捷读取和设置 cookies。

对于传入的请求，`NextRequest` 提供了 `get`、`getAll`、`set`和 `delete`方法处理 cookies，你也可以用 `has`检查 cookie 或者 `clear`删除所有的 cookies。

对于返回的响应，`NextResponse` 同样提供了 `get`、`getAll`、`set`和 `delete`方法处理 cookies。

```js
import { NextResponse } from 'next/server'
 
export function middleware(request) {
  // 假设传入的请求 header 里 "Cookie:nextjs=fast"
  let cookie = request.cookies.get('nextjs')
  console.log(cookie) // => { name: 'nextjs', value: 'fast', Path: '/' }
  const allCookies = request.cookies.getAll()
  console.log(allCookies) // => [{ name: 'nextjs', value: 'fast' }]
 
  request.cookies.has('nextjs') // => true
  request.cookies.delete('nextjs')
  request.cookies.has('nextjs') // => false
 
  // 设置 cookies
  const response = NextResponse.next()
  response.cookies.set('vercel', 'fast')
  response.cookies.set({
    name: 'vercel',
    value: 'fast',
    path: '/',
  })
  cookie = response.cookies.get('vercel')
  console.log(cookie) // => { name: 'vercel', value: 'fast', Path: '/' }
  
  // 响应 header 为 `Set-Cookie:vercel=fast;path=/test`
  return response
}
```

### 如何读取和设置 headers？

用法跟路由处理程序一致，使用 `NextRequest` 和 `NextResponse` 快捷读取和设置 headers。

```js
// middleware.js 
import { NextResponse } from 'next/server'
 
export function middleware(request) {
  //  clone 请求标头
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-hello-from-middleware1', 'hello')
 
  // 也可以在 NextResponse.rewrite 中设置请求标头
  const response = NextResponse.next({
    request: {
      // 设置新请求标头
      headers: requestHeaders,
    },
  })
 
  // 设置新响应标头 `x-hello-from-middleware2`
  response.headers.set('x-hello-from-middleware2', 'hello')
  return response
}
```

#### CORS

设置CORS

```js
import { NextResponse } from 'next/server'
 
const allowedOrigins = ['https://acme.com', 'https://my-app.org']
 
const corsOptions = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}
 
export function middleware(request) {
  // Check the origin from the request
  const origin = request.headers.get('origin') ?? ''
  const isAllowedOrigin = allowedOrigins.includes(origin)
 
  // Handle preflighted requests
  const isPreflight = request.method === 'OPTIONS'
 
  if (isPreflight) {
    const preflightHeaders = {
      ...(isAllowedOrigin && { 'Access-Control-Allow-Origin': origin }),
      ...corsOptions,
    }
    return NextResponse.json({}, { headers: preflightHeaders })
  }
 
  // Handle simple requests
  const response = NextResponse.next()
 
  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }
 
  Object.entries(corsOptions).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
 
  return response
}
 
export const config = {
  matcher: '/api/:path*',
}
```

### 如何直接响应？

用法跟路由处理程序一致，使用 `NextResponse` 设置返回的 Response。

```js
import { NextResponse } from 'next/server'
import { isAuthenticated } from '@lib/auth'

export const config = {
  matcher: '/api/:function*',
}
 
export function middleware(request) {
  // 鉴权判断
  if (!isAuthenticated(request)) {
    // 返回错误信息
    return new NextResponse(
      JSON.stringify({ success: false, message: 'authentication failed' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    )
  }
}
```

## 执行顺序

在 Next.js 中，有很多地方都可以设置路由的响应，比如 `next.config.js` 中可以设置，中间件中可以设置，具体的路由中可以设置，所以要注意它们的执行顺序：
1. `headers`（`next.config.js`）
2. `redirects`（`next.config.js`）
3. 中间件（`rewrites`, `redirects` 等）
4. `beforeFiles` (`next.config.js`中的`rewrites`)
5. 基于文件系统的路由 (`public/`, `_next/static/`, `pages/`, `app/` 等)
6. `afterFiles` (`next.config.js`中的`rewrites`)
7. 动态路由 (`/blog/[slug]`)
8. `fallback`中的 (`next.config.js`中的`rewrites`)

## 运行时

使用 Middleware 的时候还要注意一点，那就是目前 Middleware 只支持 Edge runtime，并不支持 Node.js runtime。这意味着写 Middleware 的时候，尽可能使用 Web API，避免使用 Node.js API

例如有的库是用在nodejs环境下的，然而目前 Middleware 只支持 Edge runtime，并不支持 Node.js runtime，在`middleware.js`中使用会报错