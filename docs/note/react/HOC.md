---
title: 高阶组件(HOC)
description: 关于高阶组件
cover: false
tag:
 - react
---

# 高阶组件能解决什么问题？

> HOC的产生根本作用就是解决大量的代码复用，逻辑复用问题。

具体：

- 权限隔离拦截问题，本质上是对渲染的控制，对渲染的控制可不仅仅指是否渲染组件，还可以像 dva 中 dynamic 那样懒加载/动态加载组件。
- 还有一种场景，比如项目中想让一个非 Route 组件，也能通过 props 获取路由实现跳转，但是不想通过父级路由组件层层绑定 props ，这个时候就需要一个 HOC 把改变路由的 history 对象混入 props 中，于是 withRoute 诞生了。所以 HOC 还有一个重要的作用就是让 props 中混入一些我们需要的东西。
- 还有一种情况，如果不想改变组件，只是监控组件的内部状态，对组件做一些赋能，HOC 也是一个不错的选择，比如对组件内的点击事件做一些监控，或者加一次额外的生命周期

## 基础概念

高阶函数是一个将函数作为参数并且返回值也是函数的函数，那么高阶组件是以组件作为参数，返回组件的函数。返回的组件把传进去的组件进行功能强化。

## 两种不同的高阶组件

常用的高阶组件有**属性代理**和**反向继承**两种

### 属性代理

属性代理，就是用组件包裹一层代理组件，在代理组件上，可以做一些，对源组件的强化操作。

注意属性代理返回的是一个新组件，被包裹的原始组件，将在新的组件里被挂载。
```js
function HOC(WrapComponent){
    return class Advance extends React.Component{
       state={
           name:'alien'
       }
       render(){
           return <WrapComponent  { ...this.props } { ...this.state }  />
       }
    }
}
```

优点：
- 属性代理可以和业务组件低耦合，零耦合，对于条件渲染和 props 属性增强，只负责控制子组件渲染和传递额外的 props 就可以了，所以无须知道，业务组件做了些什么。所以正向属性代理，更适合做一些开源项目的 HOC ，目前开源的 HOC 基本都是通过这个模式实现的。
- 同样适用于类组件和函数组件
- 可以完全隔离业务组件的渲染，因为属性代理说白了是一个新的组件，相比反向继承，可以完全控制业务组件是否渲染。
- 可以嵌套使用，多个 HOC 是可以嵌套使用的，而且一般不会限制包装 HOC 的先后顺序。

缺点：
- 一般无法直接获取原始组件的状态，如果想要获取，需要 `ref` 获取组件实例。
- 无法直接继承静态属性。如果需要继承需要手动处理，或者引入第三方库。
- 因为本质上是产生了一个新组件，所以需要配合 `forwardRef` 来转发 ref。

### 反向继承

反向继承和属性代理有一定的区别，在于包装后的组件继承了原始组件本身，所以此时无须再去挂载业务组件。

```js
class Index extends React.Component{
  render(){
    return <div> hello,world  </div>
  }
}
function HOC(Component){
    return class wrapComponent extends Component{ /* 直接继承需要包装的组件 */
        
    }
}
export default HOC(Index) 
```
优点：
- 方便获取组件内部状态，比如 `state`, `props`, 生命周期, 绑定的事件函数等
- es6 继承可以良好继承静态属性。所以无须对静态属性和方法进行额外的处理

缺点：
- 函数组件无法使用
- 和被包装的组件耦合度高，需要知道被包装的原始组件的内部状态，具体做了些什么
- 如果多个反向继承 HOC 嵌套在一起，当前状态会覆盖上一个状态。这样带来的隐患是非常大的，比如说有多个 `componentDidMount` ，当前 `componentDidMount` 会覆盖上一个 `componentDidMount` 。这样副作用串联起来，影响很大。

## 如何编写高阶组件

### 强化props

强化 props 就是在原始组件的 props 基础上，加入一些其他的 props ，强化原始组件功能。举个例子，为了让组件也可以获取到路由对象，进行路由跳转等操作，所以 React Router 提供了类似 withRouter 的 HOC 。

```js
function withRouter(Component) {
  const displayName = `withRouter(${Component.displayName || Component.name})`;
  const C = props => {
      /*  获取 */
    const { wrappedComponentRef, ...remainingProps } = props;
    return (
      <RouterContext.Consumer>
        {context => {
          return (
            <Component
              {...remainingProps} // 组件原始的props 
              {...context}        // 存在路由对象的上下文，history  location 等 
              ref={wrappedComponentRef}
            />
          );
        }}
      </RouterContext.Consumer>
    );
  };

  C.displayName = displayName;
  C.WrappedComponent = Component;
  /* 继承静态属性 */
  return hoistStatics(C, Component);
}
export default withRouter
```

### 控制渲染

**渲染劫持**

HOC 反向继承模式，可以通过 super.render() 得到 render 之后的内容，利用这一点，可以做渲染劫持 ，更有甚者可以修改 render 之后的 React element 对象。

**动态加载**

dva 中 dynamic 就是配合 import ，实现组件的动态加载的，而且每次切换路由，都会有 Loading 效果

### 组件赋能

**ref获取实例**

对于属性代理虽然不能直接获取组件内的状态，但是可以通过 ref 获取组件实例，获取到组件实例，就可以获取组件的一些状态，或是手动触发一些事件，进一步强化组件，但是注意的是：类组件才存在实例，函数组件不存在实例。
```js
function Hoc(Component){
  return class WrapComponent extends React.Component{
      constructor(){
        super()
        this.node = null /* 获取实例，可以做一些其他的操作。 */
      }
      render(){
        return <Component {...this.props}  ref={(node) => this.node = node }  />
      }
  }
}
```

**事件监控**

HOC 不一定非要对组件本身做些什么，也可以单纯增加一些事件监听，错误监控。

例如做一个 HOC ，只对组件内的点击事件做一个监听效果。

## 高阶组件注意事项

### 1. 谨慎修改原型链

### 2. 不要在函数组件内部或类组件的 render 函数中使用HOC

类组件中🙅错误写法：
```js
class Index extends React.Component{
  render(){
     const WrapHome = HOC(Home)
     return <WrapHome />
  }
}
```

函数组件中🙅错误写法：
```js
function Index(){
     const WrapHome = HOC(Home)
     return  <WrapHome />
}
```

这么写的话每一次类组件触发 render 或者函数组件执行都会产生一个新的WrapHome，`react diff` 会判定两次不是同一个组件，那么就会卸载老组件，重新挂载新组件，老组件内部的真实 DOM 节点，都不会合理的复用，从而造成了性能的浪费，而且原始组件会被初始化多次。


