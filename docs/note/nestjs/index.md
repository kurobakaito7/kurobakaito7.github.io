---
description: Nest (NestJS) 是一个用于构建高效、可扩展的 Node.js 服务器端应用的框架。
---

# 企业级node框架nestjs学习

## 基础架构

### controller 控制器

负责处理传入请求并向客户端返回响应。使用`@Controller()`装饰器

### providers 提供器

作为依赖注入，提供程序是在 **module** 中声明为 `providers` 的纯 JavaScript 类。

#### service服务

提供业务逻辑代码类，可使用 `@Injectable()` 装饰器。

### module 模块

模块是用 `@Module()` 装饰器注释的类。`@Module()` 装饰器提供 Nest 用于组织应用结构的元数据。

@Module() 装饰器采用单个对象，其属性描述模块：
| providers | 将由 Nest 注入器实例化并且至少可以在该模块中共享的提供程序 |
| controllers | 此模块中定义的必须实例化的控制器集 |
| imports | 导出此模块所需的提供程序的导入模块列表 | 
| exports | 这个模块提供的 providers 的子集应该在导入这个模块的其他模块中可用。可以使用提供器本身或仅使用其令牌（provide 值） |


### 中间件 

中间件是在路由处理程序之前调用的函数。中间件函数可以访问 **request 和 response** 对象，以及应用请求-响应周期中的 `next()` 中间件函数。下一个中间件函数通常由名为 `next` 的变量表示。

### 异常过滤器

Nest 带有一个内置的异常层，负责处理应用中所有未处理的异常。当应用代码未处理异常时，该层会捕获该异常，然后自动发送适当的用户友好响应。

#### 抛出异常

Nest 提供了一个内置的 `HttpException` 类，从 `@nestjs/common` 包中暴露出来。对于典型的基于 HTTP REST/GraphQL API 的应用，最佳做法是在发生某些错误情况时发送标准 HTTP 响应对象。

```js
@Get()
async findAll() {
  throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
} 
```

### 管道

管道是用 `@Injectable()` 装饰器注释的类，它实现了 `PipeTransform` 接口。

#### 内置管道
+ `ValidationPipe`
+ `ParseIntPipe`
+ `ParseFloatPipe`
+ `ParseBoolPipe`
+ `ParseArrayPipe`
+ `ParseUUIDPipe`
+ `ParseEnumPipe`
+ `DefaultValuePipe`
+ `ParseFilePipe`

它们是从 `@nestjs/common` 包中导出的

### 守卫

守卫是一个用 `@Injectable()` 装饰器注释的类，它实现了 `CanActivate` 接口。

### 拦截器

拦截器是用 `@Injectable()` 装饰器注释并实现 `NestInterceptor` 接口的类。

### 自定义装饰器

在 Node.js 世界中，将属性附加到请求对象是常见的做法。然后在每个路由处理程序中手动提取它们，使用如下代码：
```js
const user = req.user;
```
为了使代码更具可读性和透明性，我们可以创建一个 `@User()` 装饰器并在所有控制器中重复使用它。
```js
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```
然后，我们就可以在任何符合要求的地方简单地使用它了。
```js
@Get()
async findOne(@User() user: UserEntity) {
  console.log(user);
}
```

### 其他小技巧

一键生成CRUD
```
nest g resource
```

其他知识通过nestjs中文网学习：
[NestJs中文文档](https://nest.nodejs.cn/)