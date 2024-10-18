import { defineConfig } from "vitepress";

// 导入主题的配置
import { blogTheme } from "./blog-theme";

// 如果使用 GitHub/Gitee Pages 等公共平台部署
// 通常需要修改 base 路径，通常为“/仓库名/”
// 如果项目名已经为 name.github.io 域名，则不需要修改！
// const base = process.env.GITHUB_ACTIONS === 'true'
//   ? '/vitepress-blog-sugar-template/'
//   : '/'

// Vitepress 默认配置
// 详见文档：https://vitepress.dev/reference/site-config
export default defineConfig({
  // 继承博客主题(@sugarat/theme)
  extends: blogTheme,
  // base,
  lang: "zh-cn",
  title: "Kurobakaito",
  description: "粥里有勺糖的博客主题，基于 vitepress 实现",
  lastUpdated: true,
  // 详见：https://vitepress.dev/zh/reference/site-config#head
  head: [
    // 配置网站的图标（显示在浏览器的 tab 上）
    // ['link', { rel: 'icon', href: `${base}favicon.ico` }], // 修改了 base 这里也需要同步修改
    ["link", { rel: "icon", href: "/favicon.ico" }],
  ],
  themeConfig: {
    // 展示 2,3 级标题在目录中
    outline: {
      level: [2, 3],
      label: "目录",
    },
    // 默认文案修改
    returnToTopLabel: "回到顶部",
    sidebarMenuLabel: "相关文章",
    lastUpdatedText: "上次更新于",

    // 设置logo
    logo: "/logo.png",
    // editLink: {
    //   pattern:
    //     'https://github.com/kurobakaito7/kurobakaito7.github.io',
    //   text: '去 GitHub 上编辑内容'
    // },
    nav: [
      { text: "首页", link: "/" },
      {
        text: "学习笔记",
        items: [
          { text: "nodejs", link: "/note/nodejs/" },
          { text: "nestjs", link: "/note/nestjs/" },
          { text: "nextjs", link: "/note/nextjs/" },
          { text: "react", link: "/note/react/" },
        ],
      },
      {
        text: "知识汇总",
        items: [
          { text: "浏览器原理", link: "/study/browser/" },
          { text: "计算机网络", link: "/study/internet/" },
          { text: "JavaScript", link: "/study/js/" },
          { text: "Vue", link: "/study/vue/" },
        ],
      },
      { text: "项目笔记",
        items: [
          { text: "Playground", link: "/project/playground/"}
        ]
      },
      { text: "日常记录", link: "/life/"}
    ],
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/kurobakaito7/kurobakaito7.github.io",
      },
    ],
  },
});
