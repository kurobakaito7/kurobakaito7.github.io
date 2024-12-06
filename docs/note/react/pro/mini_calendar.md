---
title: 封装一个mini calendar
description: 记录一下学习封装一个迷你版日期组件，后面会继续做仿antd版本的日历组件
date: 2024-09-25
tag:
 - react
---

# 封装mini calendar

## 前置知识

### 受控模式 VS 非受控模式

**value 由用户控制就是非受控模式，由代码控制就是受控模式。**

非受控模式就是完全用户自己修改 value，我们只是设置个 defaultValue，可以通过 onChange 或者 ref 拿到表单值。

受控模式是代码来控制 value，用户输入之后通过 onChange 拿到值然后 setValue，触发重新渲染。

写组件想同时支持受控和非受控，可以直接用 ahooks 的 useControllableValue，也可以自己实现。

### 日历实现

#### 日期api

+ `new Date()`：可传入年月日时分秒，`new Date(2024, 9, 12)` 即2024年9月12日，使用 `toLocaleString` 转成当地日期格式字符串：`2024/9/12`
+ Date 的 month 是从 0 开始计数的，取值是 0 到 11
+ 日期 date 是从 1 到 31。 小技巧：当你 date 传 0 的时候，取到的是上个月的最后一天 - 可以用这个来拿到每个月有多少天
+ `getFullYear、getMonth、getDay` 分别可以拿到年、月、星期几

## 实现

new Date 的时候 date 传 0 就能拿到上个月最后一天的日期，然后 getDate 就可以知道那个月有多少天。

然后再通过 getDay 取到这个月第一天是星期几，就知道怎么渲染这个月的日期了。

用 react 实现了这个 Calendar 组件，支持传入 defaultValue 指定初始日期，传入 onChange 作为日期改变的回调。

除了 props 之外，还额外提供 ref 的 api，通过 forwarRef + useImperativeHandle 的方式。

最开始只是非受控组件，后来我们又基于 ahooks 的 useControllableValue 同时支持了受控和非受控的用法。

```ts
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import './index.css';

interface CalendarProps {
  defaultValue?: Date,
  onChange?: (date: Date) => void
}

interface CalendarRef {
  getDate: () => Date,
  setDate: (date: Date) => void,
}

const InternalCalendar: React.ForwardRefRenderFunction<CalendarRef, CalendarProps> = (props, ref) => {
  const {
    defaultValue = new Date(),
    onChange,
  } = props;

  const [date, setDate] = useState(defaultValue);

  useImperativeHandle(ref, () => {
    return {
      getDate() {
        return date;
      },
      setDate(date: Date) {
        setDate(date)
      }
    }
  });

  const handlePrevMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
  };

  const monthNames = [
    '一月',
    '二月',
    '三月',
    '四月',
    '五月',
    '六月',
    '七月',
    '八月',
    '九月',
    '十月',
    '十一月',
    '十二月',
  ];

  const daysOfMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const firstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderDates = () => {
    const days = [];

    const daysCount = daysOfMonth(date.getFullYear(), date.getMonth());
    const firstDay = firstDayOfMonth(date.getFullYear(), date.getMonth());

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="empty"></div>);
    }

    for (let i = 1; i <= daysCount; i++) {
      const clickHandler = () => {
        const curDate = new Date(date.getFullYear(), date.getMonth(), i);
        setDate(curDate);
        onChange?.(curDate);
      }
      if(i === date.getDate()) {
        days.push(<div key={i} className="day selected" onClick={() => clickHandler()}>{i}</div>);  
      } else {
        days.push(<div key={i} className="day" onClick={() => clickHandler()}>{i}</div>);
      }
    }

    return days;
  };

  return (
    <div className="calendar">
    <div className="header">
      <button onClick={handlePrevMonth}>&lt;</button>
      <div>{date.getFullYear()}年{monthNames[date.getMonth()]}</div>
      <button onClick={handleNextMonth}>&gt;</button>
    </div>
    <div className="days">
      <div className="day">日</div>
      <div className="day">一</div>
      <div className="day">二</div>
      <div className="day">三</div>
      <div className="day">四</div>
      <div className="day">五</div>
      <div className="day">六</div>
      {renderDates()}
    </div>
</div>
  );
}
```

```ts
const Calendar = React.forwardRef(InternalCalendar);

function Test() {
  const calendarRef = useRef<CalendarRef>(null);

  useEffect(() => {
    console.log(calendarRef.current?.getDate().toLocaleDateString());
  }, []);

  return <div>
    <Calendar ref={calendarRef} defaultValue={new Date('2024-9-12')}></Calendar>
  </div>
}
export default Test;
```

[源代码仓库](https://github.com/kurobakaito7/calendar-mini)