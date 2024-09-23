---
title: 🖌️封装一个watermark组件
description: 记录封装的原理
tag:
 - react
 - 组件
---

# 🖌️水印组件 Watermark

## 总结

水印的实现原理就是加一个和目标元素宽高一样的 `div` 覆盖在上面，设置 `pointer-events:none` 不响应鼠标事件。

然后背景用水印图片 `repeat` 实现。

这个水印图片是用 canvas 画的，传入文字或者图片，会计算 gap、文字宽高等，在正确的位置绘制出来。

之后转成 base64 之后设置为 `background-image`。

## 防删除功能

用 `MutationObserver` 监听水印节点的属性变动、节点删除等，有变化就重新绘制一个。

创建完水印节点后，首先 `disnonnect` 去掉之前的 `MutationObserver` 的监听，然后创建新的 `MutationObserver` 监听 `container` 的变动。

```ts

const mutationObserver = useRef<MutationObserver>();

function drawWatermark() {
    // .....代码省略

    getCanvasData(mergedOptions).then(({ base64Url, width, height }) => {
        // .... 代码省略
         if (container) {
        mutationObserver.current?.disconnect();

        mutationObserver.current = new MutationObserver((mutations) => {
          const isChanged = mutations.some((mutation) => {
            let flag = false;
            if (mutation.removedNodes.length) {
              flag = Array.from(mutation.removedNodes).some((node) => node === watermarkDiv.current);
            }
            if (mutation.type === 'attributes' && mutation.target === watermarkDiv.current) {
              flag = true;
            }
            return flag;
          });
          if (isChanged) {
            watermarkDiv.current = undefined;
            drawWatermark();
          }
        });

        mutationObserver.current.observe(container, {
          attributes: true,
          subtree: true,
          childList: true,
        });
     }
    }
}
```

说实话，太细节了，弄懂了，但是自己写不出来。。。

🔗🔗🔗[源码](https://github.com/kurobakaito7/watermark-component)