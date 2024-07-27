# onlinejudge3-fe

一个现代化的 OJ 前端，响应快速、UX 友好，支持 Dark Mode。

## 技术栈

依赖以下组件：

- Node.js（推荐使用 14.x，高版本无法确保依赖可以运行）

前端框架和组件库：
- React
- UmiJS
- Ant Design

## 本地开发

### 0. 先决条件

- Node.js 16+
- 启动 `onlinejudge3-be` 后端开发服务

### 1. 配置环境与代理

> 仅首次启动需要执行此步

配置 hosts（编辑 `/etc/hosts` 手动追加或使用其他工具如 [SwitchHosts](https://switchhosts.vercel.app/zh)）：
```plain
127.0.0.1 oj3.local
```

配置代理，以 [whistle](https://wproxy.org/whistle/) 为例：
```plain
oj3.local/onlinejudge3/socket.io 127.0.0.1:7002/onlinejudge3/socket.io
oj3.local/api/(.*) 127.0.0.1:7001/$1
$oj3.local/ redirect://onlinejudge3/
oj3.local 127.0.0.1:8102
```

### 2. 初始化项目

> 首次启动需要执行此步；子模块/依赖发生改变时亦需要执行相应命令更新

```bash
git submodule init && git submodule update
npm i
```

### 3. 启动本地开发服务

启动前端本地开发服务：

```bash
npm run dev
```

【可选】启动竞赛端（为 *CPC 竞赛设计的精简版 OJ）开发服务：
```bash
COMPETITION_SIDE=1 npm run dev
```

访问 `http://oj3.local/`。

## 部署

可以根据需求，修改 `src/configs/constants.ts` 中的部分配置。

构建：
```bash
npm run build
```

【可选】构建竞赛端：
```bash
npm run build:competition-side
```

## 开发指导

### 组件和页面开发

前端项目是基于传统 React 和 UmiJS 较早版本开发的，如果你对这些技术栈不熟悉，可以先搜索阅读其文档。

项目开发时依赖后端提供服务，因此最好先启动 `onlinejudge3-be` 后端开发服务。

可以从页面路由开始寻找到页面对应的源码，例如 `src/pages/problems/$id.tsx` 对应的是题目详情页。页面组件只负责声明页面的 Content 部分，整个页面结构是由 `src/layouts/index.tsx` 组织的。每个页面内的数据都使用 DvaJS 作为状态管理工具。

页面间公用的组件在 `src/components` 目录下。

### 样式开发

样式采用 Less 作为预处理器，通常由于样式并不复杂，可以直接在 `src/global.less` 中写全局样式，在 `src/dark.less` 中写全局覆盖的 Dark Mode 样式。

由于截至 OJ3 初版实现 Dark Mode 时，所用的组件库 Ant Design 尚不支持动态 Dark Mode（即使后来的 v4 依然没有提供很好的支持），我们使用了 duplicated styles 方式把 antd 样式拷贝了一份并替换了颜色变量，如果要使用 antd 中我们尚未移植的新组件，请参考 antd 3.11.6 版本源码，拷贝对应组件的样式源码至 `src/styles/dark_antd`，并在 `src/theme_dark.less` 中添加引用。
