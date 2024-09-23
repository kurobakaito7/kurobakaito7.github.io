---
title: 🧰封装一个icon组件
description: 记录封装的原理
tag:
 - react
 - 组件
---

# 🧰icon-component

## icon 组件封装

🤓关键代码：
```tsx
import { CSSProperties, forwardRef, PropsWithChildren, SVGAttributes } from "react";
import cs from 'classnames'
import './index.scss'

type BaseIconProps = {
    className?: string;
    style?: CSSProperties;
    size?: string | string[];
    spin?: boolean;
};

export type IconProps = BaseIconProps & Omit<SVGAttributes<SVGElement>, keyof BaseIconProps>;

export const getSize = (size: IconProps['size']) => {
    if(Array.isArray(size) && size.length === 2) {
        return size as string[];
    }

    const width = (size as string) || '1em';
    const height = (size as string) || '1em';

    return [width, height];
}

export const Icon = forwardRef<SVGSVGElement, PropsWithChildren<IconProps>>((props, ref) => {
    const {
        style,
        className,
        size = '1em',
        spin,
        children,
        ...rest
    } = props

    const [width, height] = getSize(size);

    const cn = cs(
        'icon',
        {
            'icon-spin': spin
        },
        className
    )

    return (
        <svg ref={ref} className={cn} style={style} width={width} height={height} fill="currentColor" {...rest}>{children}</svg>
    )
})
```

其中 index.scss 文件中实现 icon spin 等样式

## 创建 icon 组件，接收 svg

😎关键代码：
```tsx
import { forwardRef, ReactNode } from "react";
import { Icon, IconProps } from ".";


interface CreateIconOptions {
    content: ReactNode;
    iconProps?: IconProps;
    viewBox?: string;
}

export function createIcon(options: CreateIconOptions) {
    const { content, iconProps = {}, viewBox = '0 0 1024 1024' } = options;

    return forwardRef<SVGSVGElement, IconProps>((props, ref) => {
        return <Icon ref={ref} viewBox={viewBox} {...iconProps} {...props}>{content}</Icon>
    })
}
```


## 支持从iconfont中创建icon图标

还是关键代码😋：

```tsx
import { forwardRef } from "react";
import { Icon, IconProps } from ".";

const loadedSet = new Set<string>()

export function createFromIconfont(scriptUrl: string) {
    if (
        typeof scriptUrl === 'string'
        && scriptUrl.length
        && !loadedSet.has(scriptUrl)
    ) {
        const script = document.createElement('script');
        script.setAttribute('src', scriptUrl);
        script.setAttribute('data-namespace', scriptUrl);
        document.body.appendChild(script);

        loadedSet.add(scriptUrl);
    }

    const IconFont = forwardRef<SVGSVGElement, IconProps>((props, ref) => {
        const { type, ...rest} = props;

        return (
            <Icon ref={ref} {...rest}>
                {type ? <use xlinkHref={`#${type}`}/> : null}
            </Icon>
        )
    })

    return IconFont;
}
```

🔗🔗[代码仓库](https://github.com/kurobakaito7/icon-component)