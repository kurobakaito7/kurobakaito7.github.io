---
description: Nest (NestJS) 是一个用于构建高效、可扩展的 Node.js 服务器端应用的框架。
tag:
 - Nest.js
---

# nestjs基础知识

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

#### 定制管道

构建自己的管道

自定义一个简单的简单的 `ValidationPipe` ,让它简单地接受一个输入值并立即返回相同的值，表现得像一个恒等函数。
::: code-group
```ts [validation.pipe.ts]
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    return value;
  }
}
```
:::

### 守卫

守卫是一个用 `@Injectable()` 装饰器注释的类，它实现了 `CanActivate` 接口。

构建一个授权守卫 `AuthGuard` 假设一个经过身份验证的用户（因此，一个令牌附加到请求标头）。它将提取并验证令牌，并使用提取的信息来确定请求是否可以继续。

::: code-group

```ts [auth.guard.ts]
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return validateRequest(request);
  }
}
```

:::

### 拦截器

拦截器是用 `@Injectable()` 装饰器注释并实现 `NestInterceptor` 接口的类。

定义一个超时拦截器，处理路由请求的超时。当端点在一段时间后未返回任何内容时，希望以错误响应终止。

::: code-group

```ts [timeout.interceptor.ts]
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, RequestTimeoutException } from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(5000),
      catchError(err => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException());
        }
        return throwError(() => err);
      }),
    );
  };
};
```
:::
5 秒后，请求处理将被取消。还可以在抛出 `RequestTimeoutException` 之前添加自定义逻辑（例如释放资源）。

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

## 其他小技巧

一键生成CRUD
```
nest g resource
```

其他知识通过nestjs中文网学习：
[NestJs中文文档](https://nest.nodejs.cn/)