// 主题独有配置
import { getThemeConfig } from "@sugarat/theme/node";

// 所有配置项，详见文档: https://theme.sugarat.top/
const blogTheme = getThemeConfig({
  // markdown 图表支持（会增加一定的构建耗时）
  mermaid: true,

  // 看板娘集成
  oml2d: {
    mobileDisplay: true,
    models: [
      {
        path: "https://oml2d-models.sugarat.top/mai/model.json",
        scale: 0.1,
        position: [-10, -15],
      },
      // {
      //   path: "https://model.oml2d.com/kobayaxi/model.json",
      //   scale: 0.1,
      //   position: [-10, 0],
      // },
    ],
  },
  // 页脚
  footer: {
    // message 字段支持配置为HTML内容，配置多条可以配置为数组
    // message: '下面 的内容和图标都是可以修改的噢（当然本条内容也是可以隐藏的）',
    copyright: "MIT License | Kurobakaito",
    /* icpRecord: {
      name: "蜀ICP备19011724号",
      link: "https://beian.miit.gov.cn/",
    }, */
    /* securityRecord: {
      name: '公网安备xxxxx',
      link: 'https://www.beian.gov.cn/portal/index.do'
    }, */
  },

  // 相关文章
  recommend: {
    title: "🔍 相关文章",
    nextText: "换一组",
    pageSize: 9,
    empty: "暂无相关文章",
    style: "sidebar",
    sort: "date",
    showDate: true,
    showNum: true,
  },

  // 主题色修改
  themeColor: "el-blue",

  // 文章默认作者
  author: "Kurobakaito",
});

export { blogTheme };
