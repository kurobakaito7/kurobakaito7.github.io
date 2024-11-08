---
title: ⚙️webpack中图像的加载与优化
description: 深入理解图像加载原理与最佳实践
tag:
 - webpack
---

# webpack中的图像

图形图像资源是当代 Web 应用的最常用、实惠的内容、装饰元素之一，但在 Webpack 出现之前对图像资源的处理复杂度特别高，需要借助一系列工具(甚至 Photoshop)完成压缩、雪碧图、hash、部署等操作。

而在 Webpack 中，图像以及其它多媒体资源都被提升为一等公民 —— 能够像引用普通 JavaScript 模块一样通过 `import/require` 语句导入资源模块，这种开发模式允许我们将图像相关的处理合入统一的心智模型中，提升开发效率。

## 图像加载

在 Webpack 5 之前，我们需要使用 `file-loader`、`url-loader` 等 Loader 加载图片或其它多媒体资源文件，这些加载器各有侧重点，需要根据实际场景择优选用；而 Webpack 5 之后引入了 `Asset Module` 模型，自此我们只需要设置适当的 `module.rules.type` 配置即可，不需要为多媒体资源专门引入 Loader。

## 图像优化

### 图像压缩：减少网络上需要传输的流量

在 Webpack 生态中有不少优秀的图像压缩组件，包括：`image-webpack-loader、imagemin-webpack-plugin、image-minimizer-webpack-plugin` 等

使用 `image-webpack-loader`

```js
module.exports = {
  // ...
  module: {
    rules: [{
      test: /\.(gif|png|jpe?g|svg)$/i,
      // type 属性适用于 Webpack5，旧版本可使用 file-loader
      type: "asset/resource",
      use: [{
        loader: 'image-webpack-loader',
        options: {
          // jpeg 压缩配置
          mozjpeg: {
            quality: 80
          },
        }
      }]
    }],
  },
};
```

`image-webpack-loader` 底层依赖于 `imagemin` 及一系列的图像优化工具：

+ mozjpeg：用于压缩 JPG(JPEG) 图片；
+ optipng：用于压缩 PNG 图片；
+ pngquant：同样用于压缩 PNG 图片；
+ svgo：用于压缩 SVG 图片；
+ gifsicle：用于压缩 Gif 图；
+ webp：用于将 JPG/PNG 图压缩并转化为 WebP 图片格式。

> 图像压缩是一种非常耗时的操作，建议只在生产环境下开启
```js
module.exports = {
  // ...
  module: {
    rules: [{
      // ...
      use: [{
        loader: 'image-webpack-loader',
        options: {
+         disable: process.env.NODE_ENV === 'development'
          // ...
        }
      }]
    }],
  },
};
```

### 雪碧图：减少 HTTP 请求次数

在 HTTP 2 之前，HTTP 请求-响应是一种性能低下的通讯模型，即使是为了请求一个非常少的数据，也可能需要完整经历：建立 TCP 连接 => 发送 HTTP 请求 => 服务端处理 => 返回响应数据整个过程，加之 HTTP 协议的队首阻塞、浏览器并发请求数限制等原因，迫使我们必须尽量减少 HTTP 请求数以提升网络通讯效率。

我们可以将许多细小的图片合并成一张大图 —— 从而将复数次请求合并为一次请求，之后配合 CSS 的 `background-position` 控制图片的可视区域，这种技术被称作“雪碧图”。

在 Webpack 中，我们可以使用 `webpack-spritesmith` 插件自动实现雪碧图效果

配置：
```js
module.exports = {
  // ...
  resolve: {
    modules: ["node_modules", "assets"]
  },
  plugins: [
    new SpritesmithPlugin({
      // 需要
      src: {
        cwd: path.resolve(__dirname, 'src/icons'),
        glob: '*.png'
      },
      target: {
        image: path.resolve(__dirname, 'src/assets/sprite.png'),
        css: path.resolve(__dirname, 'src/assets/sprite.less')
      }
    })
  ]
};
```
关键在于，`webpack-spritesmith` 插件会将 `src.cwd` 目录内所有匹配 `src.glob` 规则的图片合并成一张大图并保存到 `target.image` 指定的文件路径，同时生成兼容 SASS/LESS/Stylus 预处理器的 mixins 代码

> 雪碧图曾经是一种使用广泛的性能优化技术，但 HTTP2 实现 TCP 多路复用之后，雪碧图的优化效果已经微乎其微 —— 甚至是反优化，可以预见随 HTTP2 普及率的提升，未来雪碧图的必要性会越来越低

### 响应式图片：根据客户端设备情况下发适当分辨率的图片，有助于减少网络流量

移动互联网时代，我们需要面对的客户端设备越来越多样复杂，分辨率从 PC 到平板电脑再到移动终端跨度极大，这会带来一个问题：

同一张图片(主要是位图)在不同设备中，如果显示尺寸大于原始尺寸，最终效果会有明显颗粒感

而如果显示尺寸小于原始尺寸，又会造成带宽浪费。理想的解决方案是为不同设备提供不同的分辨率、不同尺寸的图片 —— 也就是所谓的响应式图片。

Webpack 中有不少能够自动生成响应式图片的组件，例如： `resize-image-loader、html-loader-srcset、responsive-loader` 等

以 `responsive-loader` 为例配置：
```js
module.exports = {
  // ...
  module: {
    rules: [{
      test: /\.(png|jpg)$/,
      oneOf: [{
        type: "javascript/auto",
        resourceQuery: /sizes?/,
        use: [{
          loader: "responsive-loader",
          options: {
            adapter: require("responsive-loader/sharp"),
          },
        }],
      }, {
        type: "asset/resource",
      }],
    }],
  }
};
```

注意，实践中我们通常没必要对项目里所有图片都施加响应式特性，因此这里使用 `resourceQuery` 过滤出带 `size/sizes` 参数的图片引用，使用方法：
```js
// 引用图片，并设置响应式参数
import responsiveImage from './webpack.jpg?sizes[]=300,sizes[]=600,sizes[]=1024';

const Picture = function () {
  return (
    <img
      srcSet={responsiveImage.srcSet}
      src={responsiveImage.src}
      sizes="(min-width: 1024px) 1024px, 100vw"
      loading="lazy"
    />
  );
};
```
上例的引用参数 `'./webpack.jpg?sizes[]=300,sizes[]=600,sizes[]=1024'`; 最终将生成宽度分别为 300、600、1024 三张图片，之后设置 `img` 标签的 `srcset` 属性即可实现图片响应式功能。

此外，我们还能简单地通过 `size` 参数精确控制不同条件下的图像尺寸：
```css
.foo {
    background: url("./webpack.jpg?size=1024");
}

@media (max-width: 480px) {
    .foo {
        background: url("./webpack.jpg?size=300");
    }
}
```


### CDN：减少客户端到服务器之间的物理链路长度，提升传输效率

