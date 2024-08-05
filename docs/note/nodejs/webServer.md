---
description: Web Server (Web 服务器) 开发通常是指 Web 后端服务开发。
tags: 
 - node.js
---

## Web Server

#### 一些流行的开发框架
国外：
+ NestJS：用于构建高效、可扩展的 Node.js 服务器端应用程序的开发框架；
+ Express：高度包容、快速而极简的 Node.js Web 框架；
+ Koa：基于 Node.js 平台的下一代 web 开发框架；
+ fastify：快速并且低开销的 web 框架，专为 Node.js 平台量身打造。
国内（都是阿里出品）：
+ Egg：Egg.js 为企业级框架和应用而生；
+ Midway：Node.js 框架，通过自研的依赖注入容器，搭配各种上层模块，组合出适用于不同场景的解决方案。

其中 `NestJS`, `Egg`, `Midway` 等是最适合开发大型项目的，`Express`，`Koa` 适合中小型项目。

#### HTTP介绍

#### RESTful API 介绍
在当下的 Web 开发中，REST (Representational State Transfer) 架构风格被广泛采用。

RESTful API 是一个基于 REST 架构风格构建的 Web 服务。

它对数据的操作分别使用 HTTP 协议提供的 GET (获取数据)、POST (添加数据)、PUT (更新数据)、DELETE (删除数据) 等方法来表示。

同时还可以配合路由传参，来编写更加语义化的 API。
例如：/api/users/:id