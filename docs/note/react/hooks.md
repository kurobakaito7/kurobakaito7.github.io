---
title: React 内置 Hook
description: Hook 可以帮助在组件中使用不同的 React 功能。我们可以使用内置的 Hook 或使用自定义 Hook。
tag:
 - react
---

# Hooks

## useEffect

`useEffect` 是一个react hook函数，用于在react组件中创建不是由事件引起而是由渲染本身引起的操作，比如发送ajax请求，更改dom等

+ useEffect不同依赖项说明：
1. 没有依赖项   初始 + 组件更新
2. 传入空数组依赖  初始执行一次
3. 传入特定依赖项  初始 + 依赖项变化时执行

+ 清除副作用：
在useEffect中编写的由渲染本身引起的对接组件外部的操作，社区也经常把它叫做副作用操作:

比如在useEffect中开启了一个定时器，我们想在组件卸载时把这个定时器再清理掉，这个过程就是清理副作用
```js
useEffect(() => {
  // 实现副作用操作逻辑
  return () => {
    // 清除副作用逻辑
  }
},[])
```
说明：清除副作用的函数最常见的执行时机是在组件卸载时自动执行


```js
import { useEffect, useState } from 'react'

const URL = 'http://geek.itheima.net/v1_0/channels'

const App = () => {
  const [list, setList] = useState([])
  useEffect(() => {
    async function getList() {
      const res = await fetch(URL);
      const dataRes = await res.json();
      console.log(dataRes);
      setList(dataRes.data.channels)
    }
    getList()
  }, [])
  return (
    <div className="app">
      this is app
      <ul>
        {list.map(item => <li key={item.id}>{item.name}</li>)}
      </ul>
    </div>
  )
}

export default App

```

## useReducer

作用：和 `useState` 的作用类似，用来管理相对复杂的状态数据

```js
// useReducer
import { useReducer } from "react";
// 1. 定义reducer函数 根据不同的action 返回不同的状态
function reducer(state, action) {
  switch (action.type) {
    case "INC":
      return state + 1;
    case "DEC":
      return state - 1;
    case "SET":
      return action.payload;
    default:
      return state;
  }
}
// 2. 组件中调用useReducer(reducer, 0) => [state, dispatch]

// 3. 调用dispatch({type:'INC'}) => 通知reducer产生一个新的状态 使用这个新状态更新UI

function App() {
  const [state, dispatch] = useReducer(reducer, 0);
  return (
    <div className="App">
      <button onClick={() => dispatch({ type: "DEC" })}>-</button>
      App Count {state}
      <button onClick={() => dispatch({ type: "INC" })}>+</button>
      <br />
      <button onClick={() => dispatch({ type: "SET", payload: 100 })}>
        update
      </button>
    </div>
  );
}

export default App;
```

## useMemo

作用：在组件每次重新渲染的时候缓存计算的结果，当消耗非常大的计算的场景可以使用

```js
import { useMemo, useState } from "react";

// 计算斐波那契数列之和
function fib(n) {
  console.log("计算函数执行了");
  if (n < 3) return 1;
  return fib(n - 2) + fib(n - 1);
}

function App() {
  const [count1, setCount1] = useState(0);

  const result = useMemo(() => {
    // 返回计算得到的结果
    return fib(count1);
  }, [count1]); // 指定依赖项
  // const result = fib(count1)

  const [count2, setCount2] = useState(0);
  console.log("组件重新渲染了");

  return (
    <div className="App">
      the result = {result}
      <button onClick={() => setCount1(count1 + 1)}>
        change count1: {count1}
      </button>
      <button onClick={() => setCount2(count2 + 1)}>
        change count2: {count2}
      </button>
    </div>
  );
}

export default App;
```

## useCallback

作用：在组件多次渲染的时候缓存函数

```js
import { memo, useCallback, useState } from "react";

const Input = memo(function Input({ onChange }) {
  console.log("子组件重新渲染");
  return <input type="text" onChange={(e) => onChange(e.target.value)} />;
});

function App() {
  const changeHandler = useCallback((value) => console.log(value), []);
  const [count, setCount] = useState(0);
  return (
    <div className="App">
      <Input onChange={changeHandler} />
      <button onClick={() => setCount(count + 1)}>+</button>count={count}
    </div>
  );
}
export default App;
```

## useImperativeHandle

作用：通过 `ref` 暴露子组件中的方法

```js
import { forwardRef, useImperativeHandle, useRef } from "react";

// 子组件
const Son = forwardRef((props, ref) => {
  // 实现聚焦逻辑
  const inputRef = useRef(null);
  const focusHandler = () => {
    inputRef.current.focus();
  };

  // 把聚焦方法暴露出去
  useImperativeHandle(ref, () => {
    return {
      // 暴露的方法
      focusHandler,
    };
  });
  return <input type="text" ref={inputRef} />;
});

// 父组件
function App() {
  const sonRef = useRef(null);
  const focusHan = () => {
    console.log(sonRef.current);
    sonRef.current.focusHandler();
  };
  return (
    <>
      <Son ref={sonRef} />
      <button onClick={focusHan}>focus</button>
    </>
  );
}

export default App;

```