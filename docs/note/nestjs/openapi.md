---
title: OpenAPI
description: 构建swagger接口文档
tag: 
 - Nest.js
---
# 快速创建swagger文档

## 介绍
OpenAPI 规范是一种与语言无关的定义格式，用于描述 RESTful API。Nest 提供了一个专用的 module，它允许通过利用装饰器生成这样的规范。

## 安装
```
$ npm install --save @nestjs/swagger
```

## 引导程序
安装过程完成后，打开 `main.ts` 文件并使用 `SwaggerModule` 类初始化 Swagger

::: code-group
```ts [main.ts]
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
```
:::


运行以下命令来启动 HTTP 服务器：
```
$ npm run start
```

在应用运行时，打开浏览器并导航至 http://localhost:3000/api。就会看到 Swagger UI。

## 命令行插件

使用CLI插件 -> 添加 `plugins` 配置
::: code-group
```json [nest-cli.json]
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "plugins": ["@nestjs/swagger"]
  }
}
```
:::



[官方文档详细说明](https://nest.nodejs.cn/openapi/introduction#介绍)