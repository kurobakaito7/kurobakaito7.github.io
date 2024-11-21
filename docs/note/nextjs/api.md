---
title: 路由处理程序
description: 如何定义一个路由处理程序以及写路由处理程序时常遇到的一些问题
tag: 
 - next.js
---

# 路由处理程序

路由处理程序是指使用 Web Request 和 Response API 对于给定的路由自定义处理逻辑。

简单的来说，前后端分离架构中，客户端与服务端之间通过 API 接口来交互。这个“API 接口”在 Next.js 中有个更为正式的称呼，就是路由处理程序。

## 定义路由处理程序

写路由处理程序，需要定义一个名为 `route.js` 的特殊文件。（注意是 `route` 不是 `router`）

该文件必须在 app目录下，可以在 app 嵌套的文件夹下，但是要注意 `page.js`和 `route.js`不能在同一层级同时存在。

### GET 请求

比如写一个获取文章列表的接口

新建 `app/api/posts/route.js` 文件，代码如下：
```js
import { NextResponse } from 'next/server'
 
export async function GET() {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts')
  const data = await res.json()
 
  return NextResponse.json({ data })
}
```

### 支持方法

Next.js 支持 `GET`、`POST`、`PUT`、`PATCH`、`DELETE`、`HEAD` 和 `OPTIONS` 这些 HTTP 请求方法。如果传入了不支持的请求方法，Next.js 会返回 `405 Method Not Allowed`。

```js
// route.js
export async function GET(request) {}
 
export async function HEAD(request) {}
 
export async function POST(request) {}
 
export async function PUT(request) {}
 
export async function DELETE(request) {}
 
export async function PATCH(request) {}
 
// 如果 `OPTIONS` 没有定义, Next.js 会自动实现 `OPTIONS`
export async function OPTIONS(request) {}
```

### 传入参数

每个请求方法的处理函数会被传入两个参数，一个 `request`，一个 `context` 。两个参数都是可选的：

```js
export async function GET(request, context) {}
```

#### request (optional)

request 对象是一个 `NextRequest` 对象，它是基于 `Web Request API` 的扩展。使用 request 可以快捷读取 cookies 和处理 URL

如何获取URL参数

```js
export async function GET(request, context) {
  //  访问 /home, pathname 的值为 /home
	const pathname = request.nextUrl.pathname
	// 访问 /home?name=lee, searchParams 的值为 { 'name': 'lee' }
	const searchParams = request.nextUrl.searchParams
}
```

#### context (optional)

目前`context` 只有一个值就是 `params`，它是一个包含当前动态路由参数的对象。举个例子：

```js
// app/dashboard/[team]/route.js
export async function GET(request, { params }) {
  const team = params.team
}
```

当访问 `/dashboard/1` 时，params 的值为 `{ team: '1' }`

### 缓存行为

#### 默认缓存

默认情况下，使用 `Response` 对象（`NextResponse` 也是一样的）的 GET 请求会被缓存。

> 注意：在开发模式下，并不会被缓存

#### 退出缓存

但也不用担心默认缓存带来的影响。实际上，默认缓存的条件是非常“严苛”的，这些情况都会导致退出缓存：
+ `GET` 请求使用 `Request` 对象
+ 添加其他 HTTP 方法，比如 POST
+ 使用像 cookies、headers 这样的动态函数
+ 路由段配置项手动声明为动态模式

#### 重新验证

除了退出缓存，也可以设置缓存的时效，适用于一些重要性低、时效性低的页面。

有两种常用的方案：一种是使用路由段配置项，还有一种是使用 `next.revalidate` 选项

## 写接口常见的问题

### 如何获取网址参数

```js
// app/api/search/route.js
// 访问 /api/search?query=hello
export function GET(request) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query') // query
}
```

###  如何处理 Cookie

第一种方法是通过 `NextRequest` 对象：

```js
// app/api/route.js
export async function GET(request) {
  const token = request.cookies.get('token')
  request.cookies.set(`token2`, 123)
}
```

第二种方法是通过 `next/headers` 包提供的 `cookies` 方法

因为 cookies 实例只读，如果要设置 Cookie，需要我们返回一个使用 `Set-Cookie` header 的 Response 实例

```js
// app/api/route.js
import { cookies } from 'next/headers'
 
export async function GET(request) {
  const cookieStore = cookies()
  const token = cookieStore.get('token')
 
  return new Response('Hello, Next.js!', {
    status: 200,
    headers: { 'Set-Cookie': `token=${token}` },
  })
}
```

###  如何处理 Headers

第一种方法是通过 `NextRequest` 对象：

```js
// app/api/route.js
export async function GET(request) {
  const headersList = new Headers(request.headers)
  const referer = headersList.get('referer')
}
```

第二种方法是 `next/headers` 包提供的 `headers` 方法

因为 headers 实例只读，如果要设置 headers，需要返回一个使用了新 header 的 Response 实例

```js
// app/api/route.js
import { headers } from 'next/headers'
 
export async function GET(request) {
  const headersList = headers()
  const referer = headersList.get('referer')
 
  return new Response('Hello, Next.js!', {
    status: 200,
    headers: { referer: referer },
  })
}
```

### 如何重定向

重定向使用 `next/navigation` 提供的 `redirect` 方法
```js
import { redirect } from 'next/navigation'
 
export async function GET(request) {
  redirect('https://nextjs.org/')
}
```

### 如何获取请求体的内容

```js
// app/items/route.js 
import { NextResponse } from 'next/server'
 
export async function POST(request) {
  const res = await request.json()
  return NextResponse.json({ res })
}
```

如果请求正文是 FormData 类型：
```js
// app/items/route.js
import { NextResponse } from 'next/server'
 
export async function POST(request) {
  const formData = await request.formData()
  const name = formData.get('name')
  const email = formData.get('email')
  return NextResponse.json({ name, email })
}
```

### 如何设置 CORS

```js
// app/api/route.ts
export async function GET(request) {
  return new Response('Hello, Next.js!', {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
```

### 如何响应无 UI 内容

我们可以返回无UI的内容，如：
```js
// app/rss.xml/route.ts
export async function GET() {
  return new Response(`<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
 
<channel>
  <title>Next.js Documentation</title>
  <link>https://nextjs.org/docs</link>
  <description>The React Framework for the Web</description>
</channel>
 
</rss>`)
}
```
访问 `/rss.xml` 的时候，会返回 XML 结构的内容

> 注：`sitemap.xml`、`robots.txt`、`app icons` 和 `open graph images` 这些特殊的文件，Next.js 都已经提供了内置支持

### Streaming

openai 的打字效果背后用的就是流：

```js
// app/api/chat/route.js
import OpenAI from 'openai'
import { OpenAIStream, StreamingTextResponse } from 'ai'
 
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})
 
export const runtime = 'edge'
 
export async function POST(req) {
  const { messages } = await req.json()
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages,
  })
 
  const stream = OpenAIStream(response)
 
  return new StreamingTextResponse(stream)
}
```

当然也可以直接使用底层的 Web API 实现 Streaming：
```js
// app/api/route.js
// https://developer.mozilla.org/docs/Web/API/ReadableStream#convert_async_iterator_to_stream
function iteratorToStream(iterator) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next()
 
      if (done) {
        controller.close()
      } else {
        controller.enqueue(value)
      }
    },
  })
}
 
function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}
 
const encoder = new TextEncoder()
 
async function* makeIterator() {
  yield encoder.encode('<p>One</p>')
  await sleep(200)
  yield encoder.encode('<p>Two</p>')
  await sleep(200)
  yield encoder.encode('<p>Three</p>')
}
 
export async function GET() {
  const iterator = makeIterator()
  const stream = iteratorToStream(iterator)
 
  return new Response(stream)
}
```