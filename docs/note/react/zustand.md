---
title: zustand
description: 基于 Flux 模型实现的小型、快速和可扩展的状态管理解决方案，拥有基于 hooks 的舒适的API，非常地灵活且有趣.
tag:
 - 状态管理
---

# zustand 使用

## 基础使用demo

在react中尝试使用zustand

```js
import { create } from "zustand";
import { useEffect } from "react";

const URL = "http://geek.itheima.net/v1_0/channels";
// 创建store
const useStore = create((set) => {
  // 返回一个对象
  return {
    // 状态数据
    count: 0,
    num: 100,
    // 同步修改数据的方法
    inc: () => {
      // 参数需要使用老数据
      set((state) => ({ count: state.count + 1 }));
      // 参数直接是一个对象
      set({ num: 10 });
    },
    channelList: [],
    // 异步支持
    fetchGetList: async () => {
      const res = await fetch(URL);
      const jsonRes = await res.json();
      // console.log(jsonRes);
      set({
        channelList: jsonRes.data.channels,
      });
    },
  };
});

// 绑定store到组件
function App() {
  const { count, num, inc, fetchGetList, channelList } = useStore();

  useEffect(() => {
    fetchGetList();
  }, [fetchGetList]);
  return (
    <>
      count={count}
      num={num}
      <button onClick={inc}>change</button>
      <ul>
        {channelList.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </>
  );
}

export default App;
```

## zustand 切片模式

```js
import { create } from "zustand";

const URL = "http://geek.itheima.net/v1_0/channels";

// 拆分store
const createCountStore = (set) => {
  return {
    // 状态数据
    count: 0,
    num: 100,
    // 修改数据的方法
    inc: () => {
      // 参数需要使用老数据
      set((state) => ({ count: state.count + 1 }));
      // 参数直接是一个对象
      set({ num: 10 });
    },
  };
};

const createChannelStore = (set) => {
  return {
    channelList: [],
    fetchGetList: async () => {
      const res = await fetch(URL);
      const jsonRes = await res.json();
      // console.log(jsonRes);
      set({
        channelList: jsonRes.data.channels,
      });
    },
  };
};

// 组合
const useStore = create((...a) => {
  return {
    ...createCountStore(...a),
    ...createChannelStore(...a),
  };
});
```

+ [zustand官方文档](https://awesomedevin.github.io/zustand-vue/docs/introduce/what-is-zustand)