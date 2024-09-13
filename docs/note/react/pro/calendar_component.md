---
title: 封装一个日历组件
description: 记录一下学习封装一个仿antd版本的日历组件
tag:
 - react
 - pro
---

# Calendar-component

## 简单记录一下

这是一个仿照antd的日历组件，实现了基本的日历功能

首先写一个日历组件的核心是拿到每月的天数，每月的第一天是星期几

使用dayjs 的 api 来进行获取：
+ daysInMonth方法拿到这个月的天数：`dayjs('2024-9-13').daysInMonth()`
+ startOf 和 endOf 拿到这个月的第一天和最后一天：`dayjs('2024-9-13').startOf()  dayjs('2024-9-13').endOf()`

`dateRender` 和 `dateInnerContent` 用于修改日期单元格的内容的， 比如显示节日、日程安排等

配置一下国际化——`locale` 参数的处理

创建 `zh-CN` 和 `en-US` 两个资源包，通过 `locale` 参数进行切换

通过 `createContext` 创建 `context` 对象来保存 `locale` 配置，然后通过 `provider` 修改其中的值，通过 `useContext` 取出就知道当前语言

最后使用 `ahooks` 的 `useControllableValue` 同时支持受控和非受控


[代码仓库](https://github.com/kurobakaito7/calendar-component)

