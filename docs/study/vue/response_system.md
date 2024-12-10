---
title: 响应式系统
description: 响应式系统基本原理
cover: false
date: 2024-09-16
tag:
 - vue
---

# 响应式系统

Vue 通过 `Object.defineProperty` 对数据进行响应化

## 数据响应化

### Object.defineProperty

使用方法：
```js
/*
    obj: 目标对象
    prop: 需要操作的目标对象的属性名
    descriptor: 描述符
    
    return value 传入对象
*/
Object.defineProperty(obj, prop, descriptor)
```

descriptor 的一些属性：
- `enumerable`，属性是否可枚举，默认 false。
- `configurable`，属性是否可以被修改或者删除，默认 false。
- `get`，获取属性的方法。
- `set`，设置属性的方法。

### Observer

通过 `Object.defineProperty` 对数据进行响应化

定义一个 `cb` 函数，这个函数用来模拟视图更新，调用它即代表更新视图，内部是一些更新视图的方法。
```js
function cb(val) {
    console.log(`视图更新啦，新值为：${val}`);
}
```

定义一个 `defineReactive` ，这个方法通过 `Object.defineProperty` 来实现对对象的「**响应式**」化，入参是一个 obj（需要绑定的对象）、key（obj的某一个属性），val（具体的值）。经过 `defineReactive` 处理以后，obj 的 key 属性在「**读**」的时候会触发 `reactiveGetter` 方法，而在该属性被「**写**」的时候则会触发 `reactiveSetter` 方法。

```js
function defineReactive(obj, key, val) {
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter(){
        return val; // 实际上这里是进行依赖收集
    },
    set: function reactiveSetter(newVal){
        if (newVal === val) return;
        cb(newVal)
    }
  })
}
```

## 依赖收集

### 为什么要进行依赖收集？

### 实现依赖收集

首先实现一个订阅者 Dep ，它的主要作用是用来存放 `Watcher` 观察者对象。
```js
class Dep {
    constructor () {
        /* 用来存放Watcher对象的数组 */
        this.subs = [];
    }

    /* 在subs中添加一个Watcher对象 */
    addSub (sub) {
        this.subs.push(sub);
    }

    /* 通知所有Watcher对象更新视图 */
    notify () {
        this.subs.forEach((sub) => {
            sub.update();
        })
    }
}
```
> 用 `addSub` 方法可以在目前的 Dep 对象中增加一个 `Watcher` 的订阅操作；
> 用 `notify` 方法通知目前 Dep 对象的 `subs` 中的所有 `Watcher` 对象触发更新操作。

修改一下 `defineReactive` 函数
```js
function defineReactive (obj, key, val) {
    /* 一个Dep类对象 */
    const dep = new Dep();
    
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function reactiveGetter () {
            /* 将Dep.target（即当前的Watcher对象存入dep的subs中） */
            dep.addSub(Dep.target);
            return val;         
        },
        set: function reactiveSetter (newVal) {
            if (newVal === val) return;
            /* 在set的时候触发dep的notify来通知所有的Watcher对象更新视图 */
            dep.notify();
        }
    });
}
```
在闭包中增加了一个 Dep 类的对象，用来收集 `Watcher` 对象。在对象被「**读**」的时候，会触发 `reactiveGetter` 函数把当前的 `Watcher` 对象（存放在 `Dep.target` 中）收集到 Dep 类中去。之后如果当该对象被「**写**」的时候，则会触发 `reactiveSetter` 方法，通知 Dep 类调用 `notify` 来触发所有 `Watcher` 对象的 `update` 方法更新对应视图。

## 封装一个 Vue 类

在上面写的 `defineReactive` 函数上再封装一层 `observer` 。这个函数传入一个 `value`（需要「**响应式**」化的对象），通过遍历所有属性的方式对该对象的每一个属性都通过 `defineReactive` 处理。
> 注：实际上 `observer` 会进行递归调用，为了便于理解去掉了递归的过程

```js
function observer (value) {
    if (!value || (typeof value !== 'object')) {
        return;
    }
    
    Object.keys(value).forEach((key) => {
        defineReactive(value, key, value[key]);
    });
}
```

在 Vue 的构造函数中，对 `options` 的 `data` 进行处理，这里的 `data` 就是平时写 Vue 项目时组件中的 `data` 属性
> 实际上是一个函数，这里当作一个对象来简单处理

```js
class Vue {
    constructor(options) {
        this._data = options.data;
        observer(this._data);
        // 新建一个Watcher观察者对象，这时候Dep.target会指向这个Watcher对象
        new Watcher();
        // 在这里模拟render的过程，为了触发test属性的get函数
        console.log('render~', this._data.test);
    }
}
```

## 总结

首先在 `Observer` 的过程中，会注册 `get` 方法，该方法进行「**依赖收集**」。在它的闭包中有一个 `Dep` 对象，这个对象用来存放 `Watcher` 实例。

所以其实「**依赖收集**」的过程就是把 `Watcher` 实例存放到对应的 `Dep` 对象中去。

`get` 方法可以让当前的 `Watcher` 对象（`Dep.target`）存放到它的 `subs` 中（`addSub``）方法，在数据变化时，set` 会调用 `Dep` 对象的 `notify` 方法通知它内部所有的 `Watcher` 对象进行视图更新。
> 以上就是 `Object.defineProperty` 的 `set/get` 方法处理的事情

「**依赖收集**」的前提条件还有两个：
- 触发 `get` 方法；
- 新建一个 `Watcher` 对象。

在 Vue 的构造类中，新建一个 `Watcher` 对象只需要 new 一个 `Watcher` 即可，这时候 `Dep.target` 已经指向了这个 new 出来的 `Watcher` 对象来。

而触发 `get` 方法也很简单，实际上只要把 render function 进行渲染，那么其中的依赖的对象都会被「**读取**」，只是在上面是通过打印来模拟这个过程，读取 test 来触发 `get` 进行「依赖收集」。

> 本文为学习[剖析 Vue.js 内部运行机制](https://juejin.cn/book/6844733705089449991)时的笔记
