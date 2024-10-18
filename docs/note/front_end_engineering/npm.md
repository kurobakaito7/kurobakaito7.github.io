---
title: 📦发布npm包
description: 将自定义组件库发布到npm
cover: false
tag:
 - npm
---

# 🪛将自己写的组件库发布到npm

当我们写好自己的组件库后，需要将其发布到npm上，供其他项目使用。一般步骤就是构建esm和cjs两种格式的包，然后发布到npm上。

## 构建esm和cjs产物

### 进行 tsc 和 sass 的编译

添加一个 tsconfig.build.json 的配置文件
```json
{
    "compilerOptions": {
      "declaration": true,
      "allowSyntheticDefaultImports": true,
      "target": "es2015",
      "lib": ["ES2020", "DOM", "DOM.Iterable"],
      "module": "ESNext",
      "skipLibCheck": true,
      "moduleResolution": "Node",
      "resolveJsonModule": true,
      "isolatedModules": true,
      "jsx": "react-jsx",  
      "allowImportingTsExtensions":null,
      "strict": true,
    },
    "include": [
      "src"
    ],
    "exclude": [
      "src/**/*.test.tsx",
      "src/**/*.stories.tsx"
    ]
}
```
然后进行编译

```bash
npx tsc -p tsconfig.build.json --module ESNext --outDir dist/esm

npx tsc -p tsconfig.build.json --module commonjs --outDir dist/cjs
```

这样 esm 和 cjs 格式的代码就生成了

然后编译样式

```bash
npx sass ./src/Calendar/index.scss ./dist/esm/Calendar/index.css

npx sass ./src/Calendar/index.scss ./dist/cjs/Calendar/index.css

npx sass ./src/Message/index.scss ./dist/esm/Message/index.css

npx sass ./src/Message/index.scss ./dist/cjs/Message/index.css
```

### 编写 node 脚本来自动查找所有 sass 文件然后编译
```json
{
    "name": "name",
    "version": "0.0.1",
    "scripts": {},
    "main": "dist/cjs/index.js",
    "module": "dist/esm/index.js",
    "types": "dist/esm/index.d.ts",
    "files": [
    "dist",
    "package.json",
    "README.md",
    // 省略
],
}
```

### 优化依赖

```json
{
  "name": "name",
  "version": "0.0.1",
  "scripts": {},
  "main": "dist/cjs/index.js",
  "module": "dist/esm/index.js",
  "types": "dist/esm/index.d.ts",
  "files": [
    "dist",
    "package.json",
    "README.md"
  ],
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  // 省略
}
```

其实用到 react组件库 的项目都会安装 react 和 react-dom 包，不需要把它放在 dependencies 里。

而是放在 peerDependencies 里：

```json
{
  "name": "name",
  "version": "0.0.1",
  "scripts": {},
  "main": "dist/cjs/index.js",
  "module": "dist/esm/index.js",
  "types": "dist/esm/index.d.ts",
  "files": [
    "dist",
    "package.json",
    "README.md"
  ],
  "peerDependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "dependencies": {},
  // 省略
}
```

## npm 发布

### 在 npm 上注册登录账号

```bash
npm adduser
```

### 发布

```bash
npm publish
```

发布完成后就可以在npm上搜索到自己的包了

![npm](/assets/npm包.png)


### 🕳坑

+ 报错：
`npm public提示403 Forbidden - PUT https://..... - You do not have permission`

可能的原因：
1. name 不能重复，最好去npm搜索下
2. package.json 最开始自带的 private 和 type 要删除
3. npm 我们一般用的是淘宝镜像，需要切换为官方的镜像才行，不然会提示不允许发布，无权限等

+ 报错：
`npm login 或者 npm publish 超时timeout`

在网上搜了各种各样的原因，按照前面的步骤都做了，换成官方镜像了，代理什么的都关了，但是还是不行！！！

然后在网上终于看到一个方法，设置一个代理

因为官方镜像在国内没有站点，所以我们需要设置代理，地址就是我们科学上网的代理地址，一般都是`http://127.0.0.1:7890`

```bash
npm config set proxy http://127.0.0.1:7890
```

#### npm 的一些命令

查看当前镜像的版本
```bash
bashnpm config get registry
```

切换为淘宝镜像
```bash
npm config set registry https://registry.npmmirror.com
```

切换为官方镜像
```bash
npm config set registry https://registry.npmjs.org/
```

登录npm
```bash
npm login
```

查看当前登录账号
```bash
npm whoami
```

以上基本上就是所有过程~

然后我们就可以愉快的使用自己的包了啦！