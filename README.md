<h1 align="center">vue3-h5-template</h1>

**🌱 基于 Vue3 全家桶、Vite 构建工具、TypeScript，开箱即用的移动端项目基础模板**

* [x] ⚡ Vue3 + Vite5
* [x] 🍕 TypeScript
* [x] ✨ Vant4 组件库
* [x] 🍍 Pinia 状态管理
* [x] 🌀 UnoCSS 原子化 CSS 引擎
* [x] 🌓 支持深色模式
* [x] Vue-router 4
* [x] Axios 封装
* [x] 支持 SVG 图标自动注册组件
* [x] 打包资源 gzip 压缩
* [x] 开发环境支持 Mock
* [x] 首屏加载动画
* [x] 开发环境调试面板
* [x] CDN 生产环境依赖

## 运行项目

注意：要求 Node 版本 18+，可使用 [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) 进行本地 Node 版
本管理，同时建议使用 [pnpm](https://pnpm.io/zh/installation) 包管理器。

```shell
# 克隆项目
git clone https://gitee.com/mj-project/vue3-h5-template.git

# 进入项目目录
cd vue3-h5-template

# 安装依赖
pnpm install

# 启动服务
pnpm dev

# 打包代码
pnpm build
```

## 文档引导

> - [按需引入 vant 组件](#vant)
> - [开发环境 Mock](#mock)
> - [SVG 图标使用](#svg)
> - [调试面板 eruda](#console)
> - [路由缓存 & 命名注意](#router)
> - [UnoCSS 原子化 CSS 引擎](#unocss)
> - [CDN 生产环境依赖](#CDN)
> - [Git 提交信息规范](#git)

### - <span id="vant">按需引入 vant 组件</span>

全量引入组件库太过臃肿，项目中使用 `unplugin-vue-components` 插件进行按需自动引入组件，可通过[官方文档](https://vant-ui.github.io/vant/#/zh-CN/quickstart#2.-pei-zhi-cha-jian)了解更多。

### - <span id="mock">开发环境 Mock</span>

本项目开发环境支持 mock 请求数据，在 `mock` 目录中可配置接口和数据，具体见[文档](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/blob/main/README.zh-CN.md)。

### - <span id="svg">SVG 图标使用</span>

> ① 将 svg 图标文件放在 `src/icons/svg` 目录下
>  
> ② 在项目中直接使用 `<svg-icon name="svg图标文件命名" />` 即可

例如：本项目 `src/icons/svg` 中放了个叫 `check-in.svg` 的图标文件，然后在组件 `name` 属性中填入文件的命名即可

> 项目中使用了 `unplugin-vue-components` 自动引入组件，所以 `main.ts` 中无需注册全局图标组件。

```vue
<svg-icon name="check-in" />
```

> svg 图标素材网站推荐1：https://yesicon.app/
>  
> svg 图标素材网站推荐2：https://iconpark.oceanengine.com/official

### - <span id="console">调试面板 eruda</span>

为了方便移动端查看 log 信息和调试，开发环境引入了 eruda 调试面板的 cdn。如果你的开发环境不需要的话请在 `.env.development` 中修改 `VITE_ENABLE_ERUDA` 值为 `false`

```html
# .env.development
VITE_ENABLE_ERUDA = "true"
```

### - <span id="router">路由缓存 & 命名注意</span>

组件默认开启缓存，如某个组件需关闭缓存，在对应路由 `meta` 内的 `noCache` 字段赋值为 `true` 即可。

```typescript
// src/router/routes.ts
const routes: Array<RouteRecordRaw> = [
	// ...
	{
		path: "about",
		name: "About",
		component: () => import("/@/views/about/index.vue"),
		meta: {
			title: "关于",
			noCache: true, // 关闭缓存
		},
	},
];
```

为了保证页面能被正确缓存，请确保**组件**的 `name` 值和对应路由的 `name` 命名完全相同。

```vue
<!-- src/views/about/index.vue -->
<script setup lang="ts" name="About">
// 使用了 `vite-plugin-vue-setup-extend` 插件，可在 `setup` 语法糖标签上添加 `name` 属性为组件命名
</script>

<template>
	<div>about</div>
</template>
```

### - <span id="unocss">UnoCSS 原子化 CSS 引擎</span>

官方文档（英文）：https://unocss.dev/

文档翻译（中文）：https://unocss-cn.pages.dev/

建议阅读由 UnoCSS 的创建者 Anthony Fu 撰写的博客文章 [重新构想原子化 CSS](https://antfu.me/posts/reimagine-atomic-css-zh) 以更好地理解 UnoCSS 背后的动机。

### - <span id="CDN">CDN 生产环境依赖</span>

本模板生产环境默认不开启 CDN 加载依赖，如需开启生产环境加载 CDN 依赖，在根目录生产环境变量文件
`.env.production` 中修改 `VITE_CDN_DEPS` 的值为 `true` 重新打包即可。

### - <span id="git">Git 提交信息规范</span>

建议遵循社区主流的
[Angular](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular)
规范。

```
feat 增加新功能
fix 修复问题/BUG
style 代码风格相关无影响运行结果的
perf 优化/性能提升
refactor 重构
revert 撤销修改
test 测试相关
docs 文档/注释
chore 依赖更新/脚手架配置修改等
workflow 工作流改进
ci 持续集成
types 类型定义文件更改
wip 开发中
```

## 参考项目

[yulimchen/vue3-h5-template](https://github.com/yulimchen/vue3-h5-template)

[CharleeWa/vue3-vant-mobile](https://github.com/CharleeWa/vue3-vant-mobile)

## License

[MIT license](https://gitee.com/mj-project/vue3-h5-template/blob/master/LICENSE).
