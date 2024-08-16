---
title: 内置的 React API
description: react API
tag:
 - react
---

# API

## lazy

`lazy` 能够让组件第一次在被渲染之前延迟加载组件的代码。

用法：使用 `Suspense` 实现懒加载组件

```js
import { Suspense, lazy } from 'react'

// lazy函数对组件进行导入
const Home = lazy(() => import('@/pages/Home'))

// 配置路由实例
const router = createBrowserRouter([
    {
        path: "/",
        element: <Suspense fallback={'加载中'}><Home /></Suspense>
    }
])

export default router;
```

## memo

react默认渲染机制：子组件会跟随父组件一起重新重新渲染

`memo` 允许组件在props没有改变的情况下跳过重新渲染

+ `memo(Component, arePropsEqual?)`
+ 用法
    + 使用memo进行缓存 只有props发生变化的时候才会重新渲染

+ 比较机制：在使用memo缓存组件后，react会对每一个prop使用Object.is比较新值和老值，返回true，表示没有变化
  + 传递一个简单类型的prop  prop变化时组件重新渲染
  + 传递一个引用类型的prop  比较的是新值和旧值的引用是否相等
  + 保证引用稳定 -> useMemo 组件渲染过程中缓存一个值

```js
import { memo, useMemo, useState } from "react";

const MemoSon = memo(function Son(props) {
  console.log("子组件重新渲染");
  //   return <div>this is Son count={props.count}</div>;
  return <div>this is Son list={props.list}</div>;
});

function App() {
  const [count, setCount] = useState(0);

  const list = useMemo(() => {
    return [1, 2, 3];
  }, []);
  return (
    <div className="App">
      <button onClick={() => setCount(count + 1)}>change count</button>
      {/* <MemoSon count={count} /> */}
      <MemoSon list={list} />
    </div>
  );
}

export default App;
```

## forwardRef 

`forwardRef` 允许组件使用 ref 将 DOM 节点暴露给父组件。

+ `const SomeComponent = forwardRef(render)`

```js
import { forwardRef, useRef } from "react";

// 子组件
const Son = forwardRef((props, ref) => {
  return <input type="text" ref={ref} />;
});

// 父组件
function App() {
  const sonref = useRef(null);
  const showRef = () => {
    console.log(sonref);
    sonref.current.focus();
  };
  return (
    <>
      <Son ref={sonref} />
      <button onClick={showRef}>focus</button>
    </>
  );
}

export default App;
```