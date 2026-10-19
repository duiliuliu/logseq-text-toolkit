# Logseq DB 2.0.2 / SDK 适配审计

审计范围：Text Toolkit 除 SelectToolbar / BlockView 之外的功能模块。

## 已完成的适配

### 1. 查询 schema

DB 图的块文本属性从 `:block/content` 改为 `:block/title`，以下模块已统一：

- TaskProgress：`:block/title` + `:logseq.property/status`
- Heatmap：移除 `type=all` 对 `:block/content` 的依赖
- Summary：blocks/tasks/pages 查询改用 `:block/title`，页面用 `:block/name` 识别
- Milestone：阶段/标签/属性查询改用 `:block/title`

同时修复：

- Summary 任务查询支持“有 status 但无 Task 标签”的 DB 任务
- Summary 页面统计不再依赖 `:block/tags "Page"`
- Milestone 属性键统一补 `:`，并支持 `:user.property/`、`:logseq.property/`、`:plugin.property.*/`
- Milestone 父块 UUID 查询改用字符串集合匹配，避免 `["uuid"]` 查询不生效
- Heatmap 自定义日期属性支持 DB 直接属性（`:user.property/...`）
- Heatmap 页面名查询统一使用小写 `:block/name`

### 2. Macro slot 挂载

`onMacroRendererSlotted` 的 slot UI 是异步挂载的，固定 `setTimeout(1ms)` 不可靠。

新增 `src/lib/render/slot.ts` 的 `waitForElementById`，已用于：

- TaskProgress
- Heatmap
- Milestone
- Summary Modal
- Settings Modal
- Comment App
- SelectToolbar

### 3. 页面创建 / 跳转

- Heatmap 创建页面不再默认插入空块
- 不再把模板内容误传给 `App.insertTemplate(target, name)`
- Summary 生成后改用 `App.pushState('page', { name })` 跳转

### 4. 选区 / 行内格式

- SelectToolbar 使用 `Editor.onInputSelectionEnd`
- 文本替换按 `start/end` 精确替换
- Comment 的行内 hiccup 在 2.0.2 仍由 `Inline_Hiccup` 渲染，可继续使用

## 兼容性基线

### DB 版本

已对比 Logseq `2.0.1-alpha.20260710`、`20260819`、`20260826`、`20260926` 与 `2.0.2` 的 DB schema：

- `:block/title`
- `:block/name`
- `:logseq.property/status`
- `:block/created-at` / `:block/updated-at`

这些属性在以上 DB 版本中均存在，本次查询适配不是只针对 2.0.2 写死。

### SDK 版本

本次使用的 API 在 `@logseq/libs` `0.3.1` 中均已存在：

- `onInputSelectionEnd`
- `getBlockProperties`
- `getPageBlocksTree`
- `createPage({ createFirstBlock })`
- `provideUI({ slot })`
- `App.pushState`

插件 `minSDKVersion` 设为 `0.3.1`，`@logseq/libs` 构建依赖保持 `^0.3.4`。

### 双路径选区

旧版 Host 可能存在 `onInputSelectionEnd` 但不实际派发事件。SelectToolbar 现在：

- 订阅 SDK 事件
- 同时保留原生 `mouseup` 回退
- 600ms 内 SDK 已处理则跳过原生路径

因此新旧 Host 都能工作。

### 图类型

插件只支持 DB 图，`package.json.logseq.supportsDBOnly = true`，file 图不应加载。

## 仍存在的限制

1. **大列表虚拟滚动**：BlockView 的 CSS 型 Table/Gallery/Board 只能样式化已挂载行，大列表建议 List 或后续 SDK 数据渲染。
2. **原生视图重叠**：2.0.2 原生已有 Table / List / Gallery（tag/class/query），插件 BlockView 定位为任意块子块视图 + Kanban。
3. **原生评论 API**：SDK 未暴露评论创建 API，插件的 `[:span.inline-comment ...]` 仍是独立实现，不与原生评论线程互通。
4. **全量 `tsc`**：仓库历史上仍有 test demo / 设置类型错误，发布链路使用 `npm run check`（含 `typecheck:render` + 测试 + 构建）。
5. **Milestone/Settings 的既有类型问题**：部分旧代码类型未完全收敛，本次优先保证运行时 schema 与 DB 2.0.2 一致。
