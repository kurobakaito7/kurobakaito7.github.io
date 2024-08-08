---
description: 浏览器同源策略指的是协议、域名、端口三者必须保持一致。跨域问题其实就是浏览器的同源策略造成的。
tag:
 - 浏览器
 - 跨域
---

# 浏览器同源策略
1. 什么是同源策略？
   **同源策略**指的是协议、域名、端口三者必须保持一致。
   跨域问题其实就是浏览器的同源策略造成的。
   > 同源策略限制了从同一个源加载的文档或脚本如何与另一个源的资源进行交互。这是浏览器的一个用于隔离潜在恶意文件的重要的安全机制。
   同源政策主要限制了三个方面：
      + 当前域下的 js 脚本不能够访问其他域下的 cookie、localStorage 和 indexDB。
      + 当前域下的 js 脚本不能够操作访问操作其他域下的 DOM。
      + 当前域下 ajax 无法发送跨域请求。
2. 如何解决跨域问题
   1. CORS（跨域资源共享）：在服务器端设置响应头，允许跨域请求。通过在响应头中添加特定的 CORS 头部。
      + 如果是简单请求，在服务器内，至少要设置字段：`Access-Control-Allow-Origin`
      + 非简单请求：对服务器有特殊要求的请求，比如请求方法为DELETE或者PUT等。非简单请求的CORS请求会在正式通信之前进行一次HTTP查询请求，称为预检请求。浏览器会询问服务器，当前所在的网页是否在服务器允许访问的范围内，以及可以使用哪些HTTP请求方式和头信息字段，只有得到肯定的回复，才会进行正式的HTTP请求，否则就会报错。至少需要设置的字段：`Access-Control-Allow-Origin`、`Access-Control-Allow-Methods`、`Access-Control-Allow-Headers`
      #### CORS中传递Cookie
      在CORS请求中，如果想要传递Cookie，就要满足以下三个条件：
         + 在请求中设置 `withCredentials`：默认情况下在跨域请求，浏览器是不带 cookie 的。但是我们可以通过设置 withCredentials 来进行传递 cookie.
         + `Access-Control-Allow-Credentials` 设置为 true
         + `Access-Control-Allow-Origin` 设置为非`*`
   2. JSONP
      jsonp的原理就是利用 `<script>` 标签没有跨域限制，通过 `<script>` 标签src属性，发送带有callback参数的GET请求，服务端将接口返回数据拼凑到callback函数中，返回给浏览器，浏览器解析执行，从而前端拿到callback函数返回的数据。
      #### 缺点：
         + 具有局限性，仅支持get方法
         + 不安全，易遭受XSS攻击
   3. WebSocket协议跨域
      WebSocket protocol是HTML5一种新的协议。它实现了浏览器与服务器全双工通信，同时允许跨域通讯，是server push技术的一种很好的实现。其本身就支持跨域。
   4. postMessage跨域
      postMessage是HTML5 XMLHttpRequest Level 2中的API，且是为数不多可以跨域操作的window属性之一，它可用于解决以下方面的问题：
         + 页面和其打开的新窗口的数据传递
         + 多窗口之间消息传递
         + 页面与嵌套的iframe消息传递
         + 上面三个场景的跨域数据传递
   5. nodejs中间件代理跨域
      node中间件实现跨域代理，通过启一个代理服务器，实现数据的转发，也可以通过设置cookieDomainRewrite参数修改响应头中cookie中域名，实现当前域的cookie写入，方便接口登录认证。
      1. **非vue框架的跨域：** 使用node + express + http-proxy-middleware搭建一个proxy服务器。
      2. **vue框架的跨域：** node + vue + webpack + webpack-dev-server搭建的项目，跨域请求接口，直接修改webpack.config.js配置。开发环境下，vue渲染服务和接口代理服务都是webpack-dev-server同一个，所以页面与代理接口之间不再跨域。
         webpack.config.js配置：
         ```js
         module.exports = {
             entry: {},
             module: {},
             ...
             devServer: {
                 historyApiFallback: true,
                 proxy: [{
                     context: '/login',
                     target: 'http://www.target.com:8080',  // 代理跨域目标接口
                     changeOrigin: true,// 允许跨域  
                     secure: false,  // 当代理某些https服务报错时用
                     cookieDomainRewrite: 'www.local.com'  // 可以为false，表示不修改
                 }],
                 noInfo: true
             }
         }
         ```


