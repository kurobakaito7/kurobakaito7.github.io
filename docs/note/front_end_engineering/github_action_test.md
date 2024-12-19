---
title: 🔧自动化部署群聊机器人
description: github actions 自动化部署一个群机器人每天自动发送日期消息
date: 2024-10-15
cover: false
tag:
 - github
---

# 🔧 自动化部署群聊机器人

机器人没什么好说的，就是一个简单的http请求，然后把信息发送到机器人的webhook中。

主要是如何对github actions进行配置。

## 目录结构

```
├──.github
│   └── workflows
│       └── wechat-robot.yml
└── wechatRobot.js
```

## 配置

举个yml文件实例:

```yaml
name: 自动部署
on:
# push 到 main 分支时触发
    push:
        branches:
            - main
# 定时触发
    schedule:
        - cron: '0 0 * * *'
jobs:
    build:
        # runs-on 指定job任务运行所需要的虚拟机环境(必填字段)
        runs-on: ubuntu-latest
        steps:
            # 获取源码
            - name: 迁出代码
              # 使用action库  actions/checkout获取源码
              uses: actions/checkout@v3

            # # 安装Node10
            # - name: 安装node.js
            # # 使用action库  actions/setup-node安装node
            #   uses: actions/setup-node@v2.5.1
            #   with:
            #       node-version: 14.0.0

            # 安装依赖
            - name: 安装依赖
              run: npm install

            # # 构建
            # - name: 构建
            #   run: npm run build
            
            # 运行
            - name: 运行
              run: node wechatRobot.js
```

通过配置上传到github仓库中，github就可以给我们的脚本自动部署了。

> github actions 主要是部署像博客，文档这些纯前端项目