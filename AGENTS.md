# AGENTS.md

本文件面向在此仓库中工作的 AI Agent 与开发者，记录项目结构、核心机制、常用命令、编码约定和已知坑点。修改代码前请先阅读本文件；如果变更影响本文描述（技术栈、命令、目录、机制），请同步更新本文。

## 1. 项目概览

- 项目名：`eladmin-web`（仓库名 `unicorn-web`），是 [EL-ADMIN](https://github.com/elunez/eladmin) 的前端，基于 [vue-element-admin](https://github.com/PanJiaChen/vue-element-admin) 模板二次开发。
- 用途：后台管理系统前端。对接 EL-ADMIN 后端（Java/Spring Boot），提供登录、动态菜单/按钮权限、系统管理（用户/角色/菜单/部门/岗位/字典/定时任务）、运维管理（服务器/应用/数据库/部署）、监控、代码生成、工具集等页面。
- 后端接口不在本仓库；本地开发通过 Vite dev server 代理到 `VUE_APP_BASE_API`。
- 许可证：Apache-2.0。Git 主分支 `main`，远端 `github`（`git@github.com:lWoHvYe/unicorn-web.git`）。

## 2. 技术栈

| 分类 | 选型 |
| --- | --- |
| 框架 | Vue 3.5.x（Options API 为主，少量 Composition API） |
| 构建 | Vite 8 + Rolldown，`vite.config.js` |
| UI | Element Plus 2.14（按需引入，中文 locale，默认 size `small`） |
| 路由 | Vue Router 4，hash 模式，后端菜单动态 `addRoute` |
| 状态 | Vuex 4，按模块显式注册 |
| 样式 | SCSS（Dart Sass），`normalize.css`，Element Plus CSS 变量主题 |
| 图表 | ECharts 6.1 + `vue-echarts` 8（监控页）；`echarts-gl`、`echarts-wordcloud` |
| Markdown | `md-editor-v3` 7 |
| 富文本 | wangEditor 5（`@wangeditor/editor` + `editor-for-vue`） |
| 代码编辑/高亮 | CodeMirror 5；`highlight.js` 11（`v-highlightjs` 指令） |
| 头像裁剪 | `cropperjs` 1 |
| Lint | ESLint 10 flat config + `eslint-plugin-vue` 10 |

Vue 2 专用依赖已全部移除：`element-ui`、`vue-router@3`、`vuex@3`、`vue-echarts@5`、`mavon-editor`、`wangeditor@4`、`@riophae/vue-treeselect`、`vue-count-to`、`vue-image-crop-upload`、`vue-highlightjs`、`vue-template-compiler`。`vue3-treeselect` 也因运行时不兼容被替换为 Element Plus `el-tree-select`。

## 3. 目录结构

```
.
├── index.html                # Vite HTML 入口（替代 public/index.html）
├── vite.config.js            # 端口、代理、alias、SVG、分包
├── eslint.config.mjs         # ESLint 10 flat config
├── postcss.config.cjs        # autoprefixer（package.json 为 type: module）
├── .env.development          # VUE_APP_BASE_API / VUE_APP_WS_API
├── .env.production
├── .env.staging
└── src/
    ├── api/                  # 按后端模块划分的接口封装（axios）
    │   ├── data.js           # 通用分页查询 / 文件下载
    │   ├── login.js          # 登录、用户信息、登出
    │   ├── generator/        # 代码生成
    │   ├── mnt/              # 运维（服务器、应用、数据库、部署）
    │   ├── monitor/          # 日志、在线用户
    │   ├── system/           # 系统管理接口
    │   └── tools/            # 七牛、邮件、支付宝、本地存储
    ├── assets/
    │   ├── icons/            # SVG 源文件 + 运行时雪碧图（index.js）
    │   ├── images/           # logo、头像、背景图
    │   └── styles/           # 全局 SCSS、Element 主题覆盖、布局样式
    ├── components/
    │   ├── Crud/             # CRUD 框架（别名 @crud）
    │   ├── Dict/             # 数据字典全局 mixin
    │   ├── Permission/       # v-permission 指令
    │   ├── Echarts/          # 各类 ECharts 封装（自管理实例）
    │   ├── SvgIcon/          # 全局 svg-icon 组件
    │   ├── RichEditor/       # wangEditor 5 封装
    │   ├── AvatarCropper/    # 头像裁剪上传
    │   ├── CountTo/          # 数字滚动（替代 vue-count-to）
    │   └── ...               # 面包屑、搜索、全屏、上传、编辑器等
    ├── layout/               # 主框架：Sidebar / Navbar / TagsView / AppMain / Settings
    ├── mixins/               # 轻量列表/分页 mixin（table.js；CRUD 页面用 @crud）
    ├── plugins/              # element-icons / highlight 等全局插件
    ├── router/
    │   ├── routers.js        # 静态路由 + createRouter
    │   └── index.js          # 全局守卫、NProgress、动态菜单加载
    ├── store/                # Vuex 4：app / user / permission / settings / tagsView / api
    ├── utils/                # request、auth、权限、格式化、上传、校验、主题等
    ├── views/                # 页面（按业务模块分目录）
    ├── App.vue               # el-config-provider（locale + size）
    ├── main.js               # createApp、插件注册、挂载
    └── settings.js           # 站点标题、主题色、token key、超时、布局开关
```

## 4. 常用命令

```bash
npm install                 # 需要 Node ^20.19 或 >=22.12（推荐 Node 24）
npm run dev                 # 开发服务器 http://localhost:8013（不自动打开浏览器）
npm run build               # 生产构建，输出 dist/（assetsDir: static）
npm run build:prod          # 等价于 build --mode production
npm run build:stage         # 使用 .env.staging 构建
npm run preview             # 预览 dist/，端口 8013
npm run lint                # ESLint 检查 src
npm run lint:fix            # ESLint 自动修复
npm run lint:ci             # ESLint + --max-warnings=0（CI 使用）
npm run test:unit           # Vitest 单元测试
npm run check:bundle        # 校验 dist/index.html 首屏预算
npm run verify              # lint + test + build + bundle budget
npm run svgo                # 压缩 src/assets/icons/svg 下的 SVG
```

说明：

- 路由使用 **hash 模式**；生产 `base` 为 `./`，可直接部署到任意静态目录；开发为 `/`。
- 开发代理：`/api`、`/auth`、`/captcha`、`/file`、`/avatar` → `VUE_APP_BASE_API`，`changeOrigin: true`、`secure: false`（兼容本地自签名 HTTPS 后端），不做 path rewrite。
- 生产默认接口前缀 `/server-api`（适合 Nginx 反向代理）；WebSocket 使用 `VUE_APP_WS_API`。
- `VUE_APP_*` 通过 Vite `envPrefix` 注入，访问方式为 `import.meta.env.VUE_APP_XXX`。

## 5. 启动与插件注册

`src/main.js` 的注册顺序：

1. `createApp(App)`；
2. `app.use(store)`、`app.use(router)`；
3. `provideGlobalConfig({ locale: zhCn, size }, app, true)`，并通过 `app.config.globalProperties` 注入 `$message` / `$notify` / `$confirm` 等 Element Plus 全局方法；模板中的 `el-*` 组件与 `v-loading` 由 `unplugin-vue-components` 的 `ElementPlusResolver` 按需导入；
4. `app.use(checkPer)`、`app.use(permission)`、`app.use(dict)`（全局 mixin）、`app.use(svgIcons)`；
5. `app.use(highlight)`（`v-highlightjs` 指令）；
6. `registerElementIcons(app)`：注册模板字符串中使用的 Element Plus 图标及 `el-icon-*` 别名；
7. `applyTheme(Cookies.get('theme') || settings.theme)`，最后 `app.mount('#app')`。

Element Plus 的基础变量/过渡样式在入口显式引入 `element-plus/theme-chalk/base.css`；`ElMessage` / `ElMessageBox` / `ElNotification` / `ElLoading` 的样式由 `main.js` 显式引入。新增 Element Plus 服务或指令时，若未走模板 resolver，需要同时引入对应 `element-plus/es/components/<name>/style/css`。

`src/App.vue` 用 `<el-config-provider :locale="zhCn" :size="size">` 包裹 `<router-view />`，size 来自 Vuex `app.size`（Cookie 持久化，只接受 `large/default/small`）。

## 6. 核心机制

### 6.1 登录与动态权限路由

1. 登录页调用 `store.dispatch('Login')`，token 写入 Cookie（key 见 `settings.js` 的 `TokenKey`）。
2. 全局守卫 `src/router/index.js`：有 token 且 `store.getters.roles` 为空时执行 `GetInfo`，再 `buildMenus()` 拉取后端菜单。
3. `filterAsyncRouter`（`store/modules/permission.js`）把后端菜单的 `component` 字符串映射为组件：
   - `'Layout'` → `src/layout/index.vue`
   - `'ParentView'` → `src/components/ParentView`
   - 其它 → 通过 `import.meta.glob('../../views/**/*.vue')` 的映射动态加载（不是 `require`）
4. `GenerateRoutes` 写入 `permission.routers` / `addRouters`，随后 `rewriteRoutes.forEach(route => router.addRoute(route))`（Vue Router 4 没有 `addRoutes`）。
5. 静态路由末尾有一个兜底 `/:pathMatch(.*)*`，**渲染 404 组件而不是 redirect**，避免刷新动态路由时被提前重定向；菜单加载完成后 `next({ ...to, replace: true })` 会重新匹配到真实路由。未知路径在菜单加载后仍显示 404 内容。
6. `meta.title` 用于 document.title、面包屑、TagsView；`meta.icon` 是 `src/assets/icons/svg` 中的文件名；`meta.affix` 固定标签；`meta.noCache` 不进入 keep-alive。

白名单只有 `/login`；无 token 时统一重定向 `/login?redirect=...`。

### 6.2 请求层

`src/utils/request.js`：

- dev 环境 `baseURL = '/'`（走代理）；生产为 `import.meta.env.VUE_APP_BASE_API`。
- 请求头自动带 `Authorization`（token）；不再强制 `Content-Type: application/json`，由 axios 根据 JSON/FormData 自动设置。
- 响应拦截器直接返回 `response.data`，业务代码拿到的不是 axios response。
- 错误处理兼容 blob 下载错误；`401` 有模块级 `isLoggingOut` 守卫，`LogOut` 内部调用登出接口即使再次 401 也不会递归；`403` 跳 `/401`，其它用 `ElNotification.error` 提示。
- 超时时间默认来自 `settings.js` 的 `timeout`（30 秒）；文件导出使用 `longTimeout`（5 分钟）。
- `LogOut` action 在网络失败时也会在 `finally` 清理 token/roles/user/loadMenus 并 resolve，调用方可以安全 `.then(reload)`。
- 上传统一走 `utils/upload.js` → 共享 request 实例（保留 Authorization 与错误拦截），不再直接使用裸 axios。
- 网络错误/超时分别提示「网络连接异常」「网络请求超时」。

### 6.3 权限

- 按钮级：`v-permission="['admin','roles:add']"`（`src/components/Permission`），无权限时在 `mounted` 钩子移除 DOM。
- 表达式级：`checkPer([...])`（`app.config.globalProperties.checkPer`），常用于 `v-if` 控制表格列。
- 角色列表来自 `store.getters.roles`；后端无角色时默认 `ROLE_SYSTEM_DEFAULT`。

### 6.4 数据字典

- 页面声明 `dicts: ['dept_status', ...]` 后，全局 mixin（`components/Dict/index.js`）自动注入 `dict` 并请求 `/api/dictDetail/...`。
- 模板常用 `dict.xxx`（数组）、`dict.label.xxx[value]`、`dict.dict.xxx[value]`。
- 字典就绪后触发 `dictReady` 事件。
- `Dict.js` 直接给响应式对象赋值，不再使用 `Vue.set`。

### 6.5 CRUD 框架（重要）

`@crud/crud` 是项目自研的 CRUD 抽象，页面通过 mixin 组合：

```js
import CRUD, { presenter, header, form, crud } from '@crud/crud'
export default {
  cruds() { return CRUD({ title, url, sort, crudMethod }) },
  mixins: [presenter(), header(), form(defaultForm), crud()]
}
```

Vue 3 迁移后的关键点：

- `CRUD()` 返回 `reactive()` 对象；**不能 `Object.freeze`**（Vue 3 Proxy 对冻结对象会失去响应性）。
- 组件实例集合 `crud.vms` 使用 `markRaw(Array(4))`；`crud.props.table` 也 `markRaw(table)`，避免 Vue 3 深度代理破坏 Element Plus 内部状态。
- 生命周期已由 `destroyed` 改为 `unmounted`。
- 工具栏“列显示/隐藏”（`CRUD.operation.vue`）改为读取 Element Plus Table 内部：
  - `table.store.states._columns`（ref，取 `.value`）中的 columnConfig；
  - `table.store.commit('insertColumn', config, null, noop)` / `removeColumn(..., null, noop)`；
  - 用 `column.getColumnIndex()` 保持顺序；`noop` 用于满足 `updateOrderFns`；
  - 已隐藏的列配置缓存在组件实例的 `columnConfigs`（非响应式）中。
- 懒加载树表：`crud.attchTable()` 只负责注册 table；展开事件通过模板显式绑定
  `@expand-change="crud.expandChangeHandler"`（已加到 `system/menu`、`system/dept`）。
  新增懒加载树表时务必补上该监听。
- 页面模板通常包含 `<crudOperation>`、`<rrOperation>`、`<udOperation>`、`<pagination>`。
- 钩子名称：`beforeCrudRefresh`、`afterCrudRefresh`、`beforeCrudSubmitCU` 等（见 `CRUD.HOOK`）。

`src/mixins/crud.js` 已移除。`generator/config`、`system/user/center`、`system/timing/log`、`mnt/deploy/sysRestore` 只需要列表/分页/导出，统一改用轻量 `src/mixins/table.js`；新增带增删改表单的页面优先用 `@crud/crud`。

`table.js` 的约定：
- `init()` 先执行 `beforeInit()`（可修改 `url`/`params`/`sort`，返回 false 跳过请求），再请求列表；错误由 request 拦截器提示，`loading` 在 finally 结束。
- `page` 为后端 0 基页码，模板分页使用 `page + 1`；`toQuery()`/`pageChange()`/`sizeChange()` 返回 `init()` 的 Promise，便于测试或串联。
- `downloadMethod()` 导出时带上排序/查询/params，但不带 `page`/`size`，避免只导出当前页。

### 6.6 布局、标签页与缓存

- `layout/components/AppMain.vue` 使用 `<router-view v-slot="{ Component, route }">` + `<keep-alive :include="cachedViews">`；**页面组件的 `name` 必须与路由 `name` 一致**，否则缓存失效。
- `TagsView` 维护 `visitedViews`，支持刷新（跳 `/redirect/...`）、关闭、关闭其他/全部；固定标签由 `meta.affix` 决定。RouterLink 不再使用 `tag="span"`，直接渲染 `<a class="tags-view-item">`。
- 侧边栏宽度、主题色等来自 `settings.js` 与 `src/assets/styles/variables.scss`；JS 侧读取 `src/assets/styles/variables.js`（SCSS 的 `:export` 在 Vite 下不可用）。
- `Settings` 面板可切换主题色、TagsView、固定 Header、Logo、手风琴菜单；主题色写入 Cookie。
- SCSS 已全部迁移到 `@use`（`index.scss` 聚合，`sidebar.scss` / `btn.scss` 各自 `@use 'variables' as *`），新增样式不要再使用 `@import`。
- 主题实现：`src/utils/theme.js` 的 `applyTheme(color)` 直接设置 `--el-color-primary*` CSS 变量；`ThemePicker` 只负责选色/持久化。
- `Screenfull`、`SizeSelect`、`HeaderSearch`、`RightPanel` 为通用布局组件。

### 6.7 图标

- SVG 图标放在 `src/assets/icons/svg/*.svg`。`src/assets/icons/index.js` 用
  `import.meta.glob('./svg/*.svg', { query: '?raw', import: 'default', eager: true })`
  读取原始内容，运行时拼成 `<symbol>` 雪碧图注入 body（等价于原 svg-sprite-loader）。
- 全局组件 `<svg-icon icon-class="user" />`；`icon-class` 也支持外链（mask 样式）。
- Element Plus 字体图标已移除。`src/plugins/element-icons.js` 只注册模板字符串中实际使用的图标（`<el-icon-*>` 标签由 `unplugin-vue-components` 自动解析），同时保留：
  - PascalCase（如 `Plus`）；
  - `el-icon-plus` 形式（历史模板 `icon="el-icon-plus"`、`prefix-icon="el-icon-search"` 仍可用）；
  - 额外兼容 `el-icon-s-grid` / `el-icon-s-tools` / `el-icon-s-promotion`。
- 新代码推荐 `<el-icon-plus />` 或 `:icon="Plus"`（显式 import），少用字符串别名。若新增了模板字符串图标，需要同步加入 `plugins/element-icons.js` 的白名单。

### 6.8 富文本、Markdown、代码编辑

- `components/RichEditor/index.vue` 封装 wangEditor 5（`Toolbar` + `Editor`），自定义图片上传走 `store.getters.imagesUploadApi`；`views/components/Editor.vue` 与 `views/tools/email/send.vue` 复用它。`Editor.vue` 的 HTML 预览经 DOMPurify 清洗后再 `v-html`。
- `views/components/MarkDown.vue` 使用 `md-editor-v3` 的 `<MdEditor v-model>`，图片上传回调 `onUploadImg`。
- `components/JavaEdit`、`components/YamlEdit` 使用 CodeMirror 5（`fromTextArea`），保持 `changed` / `input` 事件。
- `v-highlightjs="code"` 由 `src/plugins/highlight.js` 实现（highlight.js + atom-one-dark 主题）。

### 6.9 图表

- 普通 2D 组件（Bar/Pie/Radar/Line/Funnel/Gauge/Graph/HeatMap/Scatter/Sunburst/Sankey/ThemeRiver）统一从 `src/utils/echarts.js` 导入按需注册的 `echarts/core`，不再各自 `import * as echarts from 'echarts'`；注册项与主题对象分别见 `src/utils/echarts.js`、`src/utils/echarts-theme.js`。
- `components/Echarts/*.vue` 每个组件自行 `echarts.init(this.$el, 'macarons')`，监听 resize，`beforeUnmount` 中 `dispose`。主题 `macarons` 由本地纯对象注册，避免 `import 'echarts/theme/macarons'` 把完整 ECharts 带入包体。
- 首页图表使用 `defineAsyncComponent` 异步加载，先渲染面板骨架；监控页 `views/monitor/server/index.vue` 仍使用 `vue-echarts` 8：`<v-chart :option="..." autoresize />`，并显式 `use([LineChart, GridComponent, TooltipComponent, CanvasRenderer])`。
- `echarts-gl` 只在 `Line3D.vue` 中按需引入；`echarts-wordcloud` 只在 `WordCloud.vue` 中引入。两者保留完整 ECharts/插件导入，体积较大但均为示例页懒加载。
- `echarts-wordcloud` 的 peer 仍声明 `echarts ^5`，项目通过 `.npmrc` 的 `legacy-peer-deps=true` 与 ECharts 6 共存；该组件仅用于组件示例页，如后续出现运行时不兼容需单独降级/替换。
- 新增 2D 图表时，如果用到新的 series/component，必须在 `src/utils/echarts.js` 的 `use([])` 中登记，否则运行时会提示未注册。

### 6.10 日期范围与头像上传

- `components/DateRangePicker` 已重写为 Element Plus 包装组件：`v-model` 使用 `modelValue/update:modelValue`；`shortcuts` 使用 EP 的 `{ text, value: () => [start, end] }` 结构；`value-format` 默认改为 dayjs 标记 `YYYY-MM-DD HH:mm:ss`。
- `components/AvatarCropper` 使用 cropperjs 替代 `vue-image-crop-upload`，裁剪后以 `FormData` 上传（字段名默认 `avatar`），事件名保持 `crop-upload-success`。
- `components/UploadExcel` 使用 `read-excel-file/browser`，只支持 `.xlsx`，返回 `{ header, results }`；替换 `xlsx` 是为了消除原型污染/ReDoS 高危漏洞。

## 7. 编码约定

- 2 空格缩进、单引号、无分号；ESLint 规则见 `eslint.config.mjs`。
- Vue 组件文件使用 PascalCase 目录 + `index.vue`；页面组件 `name` 与路由 `name` 一致（影响 keep-alive）。
- 别名：`@` = `src`，`@crud` = `src/components/Crud`。Vite 已配置省略 `.vue` 后缀的解析。
- API 文件只做接口封装；页面不直接写 axios。
- 提示统一用 `this.$message` / `this.$notify` / `this.$confirm`；请求错误已在拦截器统一提示。
- 新增页面流程：`src/views/<module>/index.vue` → 后端菜单配置 `component` 路径（相对 `src/views`，不带扩展名）→ 权限标识（`module:action`）与后端菜单按钮权限一致。
- 表单弹窗统一 `el-dialog`；复杂可见性表达式用 `:model-value` + `before-close`，简单场景用 `v-model`。
- Element Plus 新写法（避免弃用警告）：
  - 文本按钮用 `link`，不要用 `type="text"`；
  - `el-radio` / `el-radio-button` 的值用 `value`，不要用 `label`；
  - `el-popover` 用 `v-model:visible`，关闭用 `hide()`（没有 `doClose()`）；
  - 具名插槽用 `<template #name>`，`slot-scope` 改为 `#default="scope"`。
- 时间格式化统一用 `utils/index.js` 的 `parseTime`；导出用 `downloadFile`。
- 新建组件时不要再引入 `path`、`process.env`、`require.context` 等 Node/webpack 专属能力；路径处理用 `@/utils/path`。
- SCSS 使用 `@use`；需要变量时在文件顶部写 `@use 'variables' as *;`，不要再用 `@import`。

## 8. 已知问题与坑点

1. **ECharts 6 视觉细节**：已升级到 ECharts 6.1 + `vue-echarts` 8；图表 option 大多兼容，但仍建议对监控页、首页和组件示例页做视觉 QA。控制台可能出现 “ticks may be not readable when set min/max” 警告，可按需调整 `min`/`max`/`splitNumber` 或忽略。
2. **WebGL**：`echarts-gl` / `components/Echarts/Line3D.vue` 以及 Live2D 看板娘都需要 WebGL；无 GPU/无头浏览器会报 WebGL 错误，属环境限制。
3. **Live2D 与 WebSocket**：Live2D 默认关闭（`VITE_ENABLE_LIVE2D='false'`），避免从第三方 CDN 动态执行脚本；启用时才会加载 `live2d-widgets` 与模型 CDN，可用 `VITE_LIVE2D_BASE`、`VITE_LIVE2D_MODEL_CDN` 覆盖地址。WebSocket 消息按纯文本渲染，不再使用 `dangerouslyUseHTMLString`；Layout 启动时连接 `VUE_APP_WS_API`，后端未启动时出现连接错误通知属预期。
4. **构建分包与首屏预算**：已移除自定义 `manualChunks`，由 Rolldown 自动按路由/模块拆分；`npm run check:bundle` 校验 `dist/index.html` 首屏资源（当前约 0.95MB raw / 0.30MB gzip），禁止 editor/echarts chunk 进入首屏。首页 ECharts 已改为按需注册 + 异步组件，仪表盘图表包约从 1.2MB 降到 0.9MB；Element Plus 已改为按需引入。
5. **Element 图标与 resolver**：`registerElementIcons` 仍注册模板字符串里用到的图标别名；`unplugin-vue-components` 会把形如 `<el-icon-xxx>` 的标签解析为 `@element-plus/icons-vue` 组件。注意不要给本地组件起 `elXxx` 这类名字（例如 `elFrame` 会被误判为 Element Plus 组件），本项目已改为 `AppFrame`。图标模块 `@element-plus/icons-vue` 目前仍会整体进入首屏 chunk（约 170KB），这是后续可继续优化的点。
6. **列表 mixin**：`src/mixins/table.js` 只负责列表/分页/导出，不再包含增删改表单；`@crud/crud` 负责完整 CRUD 页面。4 个历史页面（用户中心、定时任务日志、代码生成配置、系统还原）已迁移到 `table.js`。
7. **测试与 CI**：已加入 Vitest 单元测试（`npm run test:unit`）与 GitHub Actions；提交/合并前建议执行 `npm run verify`。E2E 仍暂缺。
8. **`build:stage`**：`.env.staging` 是占位配置（默认 `/server-api`），部署前按实际 staging 环境修改。
9. **SCSS 模块系统**：样式已迁移到 `@use`，构建时不应再出现 `@import` 弃用警告；新增 SCSS 请沿用 `@use` 写法。
10. **token key 拼写**：`settings.js` 中为历史拼写 `EL-ADMIN-TOEKN`，改名会使所有用户登录态失效。
11. **主题色持久化**：默认主色 `#1890ff`；Cookie 里的旧主题色若非法会被 `applyTheme` 忽略。Element Plus 的 `--el-color-primary-*` 变量在 `src/assets/styles/element-variables.scss` 中初始化，运行时由 `applyTheme` 覆盖。
12. **dev server 不自动开浏览器**：`vite.config.js` 中 `server.open: false`，避免 CI/Agent 环境弹出浏览器；需要时手动访问 `http://localhost:8013`。
13. **`eslint` 与 `type: module`**：`package.json` 为 ESM，PostCSS 配置使用 `postcss.config.cjs`；新增 Node 配置脚本时注意扩展名。
