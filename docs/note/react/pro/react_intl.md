---
title: 🔤react-intl 实现国际化
description: 基于 react-intl 实现国际化
tag:
 - react
---

# react-intl 实现国际化

很多应用都要求支持多语言，也就是国际化。我们可以用 `react-intl` 包实现国际化。

## 基本实现

语言可以通过 `navigator.language` 获取

语言的资源包就是一个 json 文件里面有各种 key 对应的不同语言的文案，比如 `zh-CN.json`、`en-US.json` 等，我将它们放在 `locale` 目录下

在 `main.tsx` 引入下 `IntlProvider`，它是用来设置 `locale` 和 `messsages` 资源包的
```tsx
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { IntlProvider } from 'react-intl'
import enUS from './locale/en-US.json'
import zhCN from './locale/zh-CN.json'

const messages: Record<string, any> = {
  'en-US': enUS,
  'zh-CN': zhCN
}
const locale = navigator.language;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <IntlProvider messages={messages[locale]} locale={locale} defaultLocale="zh_CN">
    <App />
  </IntlProvider>
)
```

把组件中的文案换成从资源包取值的方式：

使用 `react-intl` 的 api : `defineMessages` 和 `useIntl`

```tsx
//......
const messsages = defineMessages({
  username: {
    id: "username",
    defaultMessage: '用户名'
  },
  //.....
})

cosnt App: React.FC = () => {
  const intl = useIntl()
  return (
    <div>
      <h1>{intl.formatMessage(messsages.username)}</h1>
      //......
    </div>
  )
}
```

defineMessages 是定义 message，这里的 id 就是资源包里的 key，要对应才行。

此外还可以定义 defaultMessage，也就是资源包没有对应的 key 的时候的默认值

当然，国际化不仅仅只是替换下文案，还可以格式化 日期、时间、数字等

## 组件外用

使用 `createIntl` API

`src/getMessage.ts`：
```ts
import { createIntl, defineMessages } from "react-intl";
import enUS from "./locale/en-US.json";
import zhCN from "./locale/zh-CN.json";

const messages: Record<string, any> = {
  "en-US": enUS,
  "zh-CN": zhCN,
};

const locale = "zh-CN";
const intl = createIntl({
  locale: locale,
  messages: messages[locale],
});

const defines = defineMessages({
    inputYourUsername: {
        id: 'inputYourUsername',
        defaultMessage: ''
    }
});

export default function() {
    return intl.formatMessage(defines.inputYourUsername);
}
```

组件中引入：
```js
useEffect(() => {
    setTimeout(() => {
      alert(getMessage());
    }, 2000)
}, []);
```

## 自动生成资源包

我们会发现把所有需要国际化的地方找出来，然后在资源包里定义一遍很麻烦

`react-intl` 提供了一个工具来自动生成资源包

安装：
```bash
npm i -save-dev @formatjs/cli
```

注意: 用这个工具需要所有 `message` 都有默认值

执行 `extract` 命令从 ts、vue 等文件里提所有 `defineMessage` 定义的消息：
```bash
npx formatjs extract "src/**/*.tsx" --out-file temp.json
```
这个命令 defineMessage 定义的所有 message 都提取了出来，key 是 id，提取到了 `temp.json` 文件中

然后再执行 compile 命令生成资源包 json：
```bash
npx formatjs compile 'temp.json' --out-file src/locale/ja-JP.json
```
它用所有的 message 的 id 和默认值生成了新的资源包，只要把这个资源包交给产品经理或者设计师去翻译就好了

这个demo的[实现代码](https://github.com/kurobakaito7/react-intl)