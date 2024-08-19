---
title: WebSocket即时通信
description: Nest 开发 WebSocket 服务
tag:
 - Nest.js
---

# Nest 中进行 WebSocket 服务

## 使用 websocket 原因

我们最常用的网络协议是 HTTP，它是一问一答的模式，客户端发送请求，服务端返回响应。

有时候也会用 Server Sent Event，它是基于 HTTP 的，客户端发送请求，服务端返回 text/event-stream 类型的响应，可以多次返回数据。

但是 HTTP 不能服务端向客户端推送数据，SSE 适合一次请求之后服务端多次推送数据的场景。

类似聊天室这种，需要实时的双向通信的场景，还是得用 WebSocket。

## 快速开始

创建项目

```
nest new nest-websocket
```

进入项目，安装用到的包：

```
npm i --save @nestjs/websockets @nestjs/platform-socket.io
```
然后创建个 websocket 模块：

```
nest g resource ws
```

涉及的装饰器：

- `@WebSocketGateWay：` 声明这是一个处理 weboscket 的类。

- `@SubscribeMessage：` 声明处理的消息。

- `@MessageBody：` 取出传过来的消息内容。

- `@WebSocketServer：` 取出 Socket 实例对象

- `@ConnectedSocket：` 取出 Socket 实例对象注入方法

客户端也是使用 `socket.io` 来连接。

如果想响应接收和返回消息用不同的名字以及进行多重响应，需要分别指定 event 和 data ，然后添加监听。

如果想异步返回消息，就通过 `rxjs` 的 `Observer` 来异步多次返回。


## 坑

服务端：开启网关后记得配置跨域
```ts
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { Socket } from "socket.io";
@WebSocketGateway(80, {
    cors: {
        origin: '*',
    }, })

export class EventsGateway {
    @SubscribeMessage('events')
    chufashijian(
        @MessageBody() data: string,
     @ConnectedSocket() client: Socket,
    ): string {
        return data;
    }

    @SubscribeMessage('connection')
    t(
        @MessageBody() data: string,
        @ConnectedSocket() client: Socket,
    ): string {
        console.log("连接成功");
        return data;
    }
}
```

客户端：类似于cdn引入入全局io函数，且需要传入url

```ts
import   '../node_modules/socket.io/client-dist/socket.io.js';
 
let socket = io('http://localhost:80')
    socket.emit('connection', {
      name: 'test'
    })
    return () => {
    }
```