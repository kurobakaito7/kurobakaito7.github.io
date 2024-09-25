---
title: git操作
description: 记录遇到的git问题
tag:
 - git
---

# ⚙️git

## 🔧常用命令

### 克隆仓库

仓库 `git clone '远程仓库地址`

分支 `git clone -b 分支名 '远程仓库http地址'`

### 管理分支

查看分支 `git branch`

查看远程分支 `git branch -r`

查看所有分支 `git branch -a`

本地创建新的分支 `git branch [branch name]`

切换到新的分支 `git checkout [branch name]`

创建+切换分支 `git checkout -b [branch name]`

将新分支推送 `git push origin [branch name]`

删除本地分支 `git branch -d [branch name]`

删除Gitee远程分支 `git push origin :[branch name]`

### git提交本地代码到新分支

1. 切换到新的分支
2. 添加本地需要提交代码 `git add .`
3. 提交本地代码 `git commit -m "..."`
4. push 到git仓库 `git push origin [branch name]`——分支

### 从远程分支拉取最新代码合并到本地分支

1. 获取最新代码到本地 `git fetch origin master`——获取远端的origin/master分支
2. 查看版本差异 `git log -p master..origin/master`——查看本地master与远端origin/master的版本差异
3. 合并最新代码到本地分支 `git merge origin/master`——合并远端分支origin/master到当前分支
4. 完成后直接 `git push`

> 如果是远端的其他分支，将 master 全部改成对应分支名即可

#### git pull和git fetch的区别
+ git pull(拉取) 即从远程仓库抓取本地没有的修改并【自动合并】到远程分支 `git pull origin master`
+ git fetch(提取) 从远程获取最新版本到本地不会自动合并 `git fetch origin master`


### git 将把 dev 分支代码合并到 master 主分支上

1. 首先切换到分支：其中 dev 是分支名字 —— `git checkout dev`
2. 使用 git pull 把分支代码pull下来 —— `git pull | git pull origin dev`
3. 切换到主分支 —— `git checkout master`
4. 把分支的代码merge到主分支 —— `git merge dev`
5. git push推上去 现在 自己分支的代码就合并到主分支上了 —— `git push | git push origin master`

## 🪛实际操作

但是在实际的实习开发过程中，由于我们可能没有权限用 master主分支 来合并我们开发的分支，
所以只有我们开发完后，预先合并master分支，如果有冲突就解决冲突，防止master主分支合并我们开发分支的时候出现冲突

所以步骤应该是：
1. 切换到 master 分支 `git checkout master`
2. pull 最新的master分支 `git pull origin master`
3. 切换到我们开发的分支 `git checkout dev`
4. 合并 master 主分支 —— `git merge master`
5. 推送一下 `git push origin dev`

可以发现跟上面的是反着的😀

## 💡一些知识点

### git运行机制

Git 是一种分布式版本控制系统，其运行机制可以概括为以下几个关键部分：

1. **工作区（Working Directory）：** 存放代码的地方，即开发者进行代码修改的区域。
2. **暂存区（Stage/Index）：** 也称为索引区，是一个临时存储区域。开发者将工作区的代码通过 git add 命令添加到暂存区，告诉 Git 即将对这些代码进行提交。
3. **本地库（Repository）：** 将暂存区的代码通过 git commit 命令提交到本地库，就会生成对应的历史版本。这些版本在本地库中以提交（commit）的形式存在，每个提交都包含了代码的快照和相关的元数据（如作者、日期、提交信息等）。
4. **远程库（Remote Repository）：** 代码托管中心是基于网络服务器的远程代码仓库，用于代码的集中管理和协作。开发者可以通过 git push 将本地库的更改推送到远程库，也可以通过 git pull 或 git fetch 从远程库拉取最新的更改。


### git merge和git rebase的区别
1. git merge: `git merge`会⾃动创建⼀个新的`commit`，如果合并时遇到冲突的话，只需要修改后重新commit。
   + 优点：能记录真实的`commit`情况，包括每个分⽀的详情
   + 缺点：由于每次`merge`会⾃动产⽣⼀个`commit`，因此在使用⼀些可视化的git工具时会看到这些自动产生的commit，这些commit对于程序员来说没有什么特别的意义，多了反而会影响阅读。
2. git rebase: 会合并之前的`commit`历史。
   + 优点：可以得到更简洁的提交历史，去掉了 `merge` 产生的`commit`
   + 缺点：因为合并而产生的代码问题，就不容易定位，因为会重写提交历史信息

+ 场景：
  + 当需要保留详细的合并信息，建议使⽤ `git merge`, 尤其是要合并到`master`上
  + 当发现⾃⼰修改某个功能时提交比较频繁，并觉得过多的合并记录信息对自己来说没有必要，那么可尝试使用 `git rebase`

