---
title: Nest与数据库
description: Nest 与 Sequelize 集成
tag:
 - Nest.js
---

# Sequelize 集成

## 快速使用

安装所需的依赖，使用流行的 MySQL 关系 DBMS
```
$ npm install --save @nestjs/sequelize sequelize sequelize-typescript mysql2
$ npm install --save-dev @types/sequelize
```

安装过程完成后，我们可以将 `SequelizeModule` 导入到根 `AppModule` 中。
::: code-group
```ts [app.module.ts]
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      models: [],
    }),
  ],
})
export class AppModule {}
```
:::


连接mysql，写好model之后，在root中设置autoLoadModels为true才会自动建表

```ts
@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: 'localhost',
      port: 3306,
      username: '[账号]',
      password: '[密码]',
      database: 'nest',
      models: [User],
      autoLoadModels: true 
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
```

## 常用mysql操作  每一句末尾都要加分号
+ show databases;
+ show tables;
+ show columns from tableName;
+ use databaseName;

[官方文档详细使用说明](https://nest.nodejs.cn/techniques/database#sequelize-集成)