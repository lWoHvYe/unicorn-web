# ELADMIN-WEB

EL-ADMIN 前端源码，当前技术栈：**Vue 3 + Vite + Element Plus**。

#### 项目源码

|     |   后端源码  |   前端源码  |
|---  |--- | --- |
|  原项目-github   |  https://github.com/elunez/eladmin   |  https://github.com/elunez/eladmin-web   |
|  原项目-码云   |  https://gitee.com/elunez/eladmin   |  https://gitee.com/elunez/eladmin-web   |
|  github   |   https://github.com/lWoHvYe/eladmin |    https://github.com/lWoHvYe/unicorn-web |

#### 开发文档

- EL-ADMIN 文档：[https://el-admin.vip](https://el-admin.vip)
- 本仓库开发约定与架构说明：[AGENTS.md](./AGENTS.md)

#### 技术栈

| 分类 | 选型 |
| --- | --- |
| 框架 | Vue 3.5 |
| 构建 | Vite 8 |
| UI | Element Plus 2.14 |
| 路由 | Vue Router 4（hash 模式） |
| 状态 | Vuex 4 |
| 图表 | ECharts 5 + vue-echarts 7 |
| 编辑器 | md-editor-v3、wangEditor 5、CodeMirror 5 |
| Lint | ESLint 10（flat config） |

#### 环境要求

- Node.js **^20.19 或 >=22.12**（推荐 Node 24，已在 Node 24.22 验证）
- npm >= 10

#### Build Setup

```bash
# 安装依赖
npm install

# 启动服务 http://localhost:8013（不自动打开浏览器）
npm run dev

# 生产构建（输出 dist/）
npm run build:prod

# 预览生产构建
npm run preview

# 代码检查
npm run lint
```

#### 环境变量

配置文件：`.env.development`、`.env.production`、`.env.staging`。

```bash
# 后端接口地址（开发环境由 Vite dev server 代理）
VUE_APP_BASE_API='https://localhost:8081'
# WebSocket 地址
VUE_APP_WS_API='wss://localhost:8081'

# Live2D 看板娘资源 CDN（可选，默认 fastly.jsdelivr.net）
# VITE_LIVE2D_BASE='https://fastly.jsdelivr.net/npm/live2d-widgets@0/'
# VITE_LIVE2D_MODEL_CDN='https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/'
```

说明：

- 开发代理路径：`/api`、`/auth`、`/captcha` → `VUE_APP_BASE_API`，并允许自签名证书。
- 生产默认接口前缀 `/server-api`，请根据 Nginx 反向代理配置调整。
- 路由使用 hash 模式，生产 `base` 为 `./`，可部署到任意静态目录。

#### 目录与架构

详见 [AGENTS.md](./AGENTS.md)，其中包含：

- 动态菜单/权限路由加载流程
- axios 请求层与错误处理
- `v-permission` / `checkPer`
- 数据字典 mixin
- 自研 CRUD 框架（`@crud`）
- 布局、TagsView、keep-alive 缓存约定
- SVG 图标与 Element Plus 图标兼容方案
- Element Plus 主题覆盖与主题切换
- Vue 3 迁移过程中的注意事项与已知问题

#### 与旧版（Vue 2）的差异

- 构建工具由 Vue CLI 4 / webpack 迁移为 Vite 8，入口改为根目录 `index.html`。
- UI 由 Element UI 2 迁移为 Element Plus 2；`slot-scope`、`.sync`、`.native` 等 Vue 2 语法已清理。
- `vue-router@3` → `vue-router@4`（`addRoutes` → `addRoute`），`vuex@3` → `vuex@4`。
- `mavon-editor` → `md-editor-v3`；wangEditor 4 → wangEditor 5；`vue-count-to`/`vue-image-crop-upload`/`vue-highlightjs` 由本地组件或 `highlight.js` 替代。
- `@riophae/vue-treeselect`（及不兼容 Vue 3 的 `vue3-treeselect`）替换为 Element Plus `el-tree-select`。
- ECharts 4 → 5，图表 option 中的 `normal` 嵌套已扁平化。
- 已移除 `node-sass`、`babel`、`jest`、`plop` 等 Vue 2 时代工具链。

#### 常见问题

1. **Node 版本**：Vite 8 要求 Node 20.19+；低版本 Node 请升级，不再需要 `NODE_OPTIONS=--openssl-legacy-provider`。
2. **本地后端为 HTTPS 自签名证书**：Vite 代理已设置 `secure: false`；如接口仍报证书错误，请检查后端证书或改用 HTTP。
3. **首页 WebSocket 报错**：Layout 启动时会连接 `VUE_APP_WS_API`，后端未启动时出现连接失败提示属正常现象。
4. **Live2D 看板娘不显示**：默认从 jsDelivr 加载脚本和模型，并依赖浏览器 WebGL；如网络无法访问 CDN，可设置 `VITE_LIVE2D_BASE`（脚本资源）和 `VITE_LIVE2D_MODEL_CDN`（模型资源）指向可用镜像。控制台搜索 `[Live2D]` 可查看回退日志。
5. **构建 chunk 过大**：Element Plus、ECharts、编辑器均为大依赖，构建时会出现 chunk 体积警告；页面已按路由懒加载，可在 `vite.config.js` 的 `manualChunks` 中继续优化。
6. **没有测试用例**：仓库暂未包含单元/E2E 测试，提交前以 `npm run lint` + `npm run build` 为准。

#### 特别鸣谢

- 感谢 [JetBrains](https://www.jetbrains.com/) 提供的非商业开源软件开发授权

- 感谢 [PanJiaChen](https://github.com/PanJiaChen/vue-element-admin) 大佬提供的前端模板

- 感谢 [Moxun](https://github.com/moxun1639) 大佬提供的前端 Crud 通用组件

- 感谢 [zhy6599](https://gitee.com/zhy6599) 大佬提供的后端运维管理相关功能

- 感谢 [j.yao.SUSE](https://github.com/everhopingandwaiting) 大佬提供的匿名接口与Redis限流等功能

- 感谢 [d15801543974](https://github.com/d15801543974) 大佬提供的基于注解的通用查询方式

#### 反馈交流

- QQ交流群：一群：<strike>891137268</strike> 已满、二群：947578238
