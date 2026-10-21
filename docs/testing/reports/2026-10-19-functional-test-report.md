# Text Toolkit 功能测试报告

- **日期**：2026-10-19
- **插件版本**：1.2.25
- **测试方式**：Electron 42 + Host mock，加载真实 `dist/index.js`
- **结果**：**E2E 25/25 PASS；单元/集成 718/718 PASS**

> 截图包含 Electron Host mock 与真实 Logseq 2.0.2 test 图两组；真实 Logseq 仍需按 [Real-Logseq-Smoke-Test.md](../../architecture/Real-Logseq-Smoke-Test.md) 做发版前人工确认。

## 环境

| 项 | 值 |
|---|---|
| OS | macOS 26.3.2 (Build 25D2150) |
| Electron | 42.11.15 |
| Chromium | 148.0.7778.280 |
| Node.js | 24.17.0 |
| Plugin | logseq-text-toolkit 1.2.25 |
| SDK floor | @logseq/libs 0.3.1+ / host 2.0.2 |
| Runner | scripts/e2e (Electron + Host mock) |

## 真实 Logseq 2.0.2 Smoke

2026-10-21 在真实 Logseq 2.0.2 test DB 图构造 `TT Full Test` 数据并逐项验证：

- Settings 打开、Tab 切换/滚动、关闭、版本号显示
- 选中文本 toolbar；Comment 弹窗输入/关闭
- 文本格式化/评论链路（Toolbar 实际渲染）
- BlockView Table / Gallery / Board：真实 DB 块 class 与视觉均生效
- TaskProgress：真实任务 2/4（todo/doing/done/done）
- Heatmap：真实 `#tt-e2e` 月度数据与统计
- Milestone：真实 compact 节点
- HTML asset 预览、标注写入 asset 子块、Dashboard `block:<uuid>` 打开
- Summary：E2E 3/3（本地页面生成/替换），真实 modal 通过 slash command 入口存在

### 本轮真实 Host 修复

- Settings 默认布尔值被 Host 空 settings 覆盖，导致 toolbar 不初始化
- Modal 关闭后透明 overlay 残留，阻挡点击
- Comment overlay 祖先 `pointer-events:none` + z-index 过低
- BlockView 跨 iframe realm 的 `instanceof HTMLElement` 永远为 false，导致真实 DB 块找不到
- BlockView 视图 class 在 Host 异步 settings 前未落地
- HTML Format 图标被 `svg.ltt-toolbar-icon` 的 18px 规则覆盖

> 真实测试修改 test 图：新增 `TT Full Test`、`TT Summary UI`、`HTML Test` 页面、任务/标签、HTML asset、标注块。

## 结果总览

| 套件 | 通过 | 总数 | 覆盖 |
|---|---:|---:|---|
| 主功能套件 | 13 | 13 | 插件注册、设置、选区工具栏、评论、BlockView、TaskProgress、Heatmap、Milestone、Summary、slash commands |
| Summary 专项 | 3 | 3 | 自定义日期范围、年度模板/页面名、同名总结安全替换 |
| HTML 阅读器 | 5 | 5 | 附件列表、文字标注、高亮、面板控制、Dashboard、持久化 |
| 旧 Host fallback | 2 | 2 | 无 onInputSelectionEnd；原生 textarea 选区 |
| SDK 静默 fallback | 2 | 2 | 暴露 SDK hook 但从不发事件；原生选区仍可用 |

```text
Electron E2E: 25/25 passed
Vitest:      80 files / 718 tests passed
```

## 功能覆盖

| 功能 | 验证点 |
|---|---|
| 设置弹窗 | 7 个 Tab；BlockView Tab 可切换；保存成功；hit-test 在弹窗内 |
| 选区工具栏 | SDK onInputSelectionEnd → 工具栏 → 加粗 → updateBlock |
| 评论 | 工具栏评论项 → 弹窗 → 保存 → inline-comment |
| BlockView | list/table/gallery/board；Table 3 个 grid track；表格行 control 不再占用 grid 列；设置实时刷新 |
| TaskProgress | 1/2；tag-only 无 status 任务计入 todo |
| Heatmap | 年度/月度/周度切换；42 个 week cell；scheduled 日期属性 |
| Milestone | Initiation / Planning 两个阶段渲染 |
| Summary | GTD 生成、活跃块数、自动洞察、view=week 热力图宏、自定义范围、年度页面 |
| HTML 阅读器 | HTML 附件列表/预览；选区标注/备注；高亮/跳回；左侧/右侧/全屏；Dashboard；持久化 |
| Slash commands | TaskProgress / Heatmap / BlockView / Milestone 四条宏插入 |

## 截图

### 设置弹窗

![设置弹窗](assets/01-settings-modal.png)

7 个设置 Tab，BlockView 设置页可进入。

### 选区工具栏

![选区工具栏](assets/02-selection-toolbar.png)

SDK 选区事件后在块附近显示 B / C 工具栏。

### 评论弹窗

![评论弹窗](assets/03-comment-modal.png)

评论项打开 inline comment 弹窗，选中文本为 “world”。

### BlockView：Table

![BlockView：Table](assets/04-blockview-table.png)

修复行 control 占用 grid 后，首列为 Row one/Row two，后续为 Cell 11/12、21/22。

### TaskProgress（放大）

![TaskProgress（放大）](assets/05-taskprogress.png)

tag-only 任务无 status 时仍计入；显示 1/2。

### Heatmap

![Heatmap](assets/06-heatmap.png)

月度视图、Task 标签、年度/月度/周度切换。

### Milestone

![Milestone](assets/07-milestone.png)

Initiation → Planning，两个阶段均渲染。

### Summary 弹窗

![Summary 弹窗](assets/08-summary-modal.png)

默认类型、默认模板、取消/生成按钮；弹窗层级可点击。

### HTML 阅读器：附件列表

![HTML 阅读器：附件列表](assets/09-html-viewer-assets.png)

右侧面板列出当前图谱的 HTML 附件。

### HTML 阅读器：预览

![HTML 阅读器：预览](assets/10-html-viewer.png)

自包含 HTML 在沙箱 iframe 中渲染；右侧为标注列表。

### HTML 阅读器：标注

![HTML 阅读器：标注](assets/11-html-viewer-annotation.png)

选中文字生成高亮和标注卡片；可写回 HTML asset 子块（失败回退标注页面）。

### HTML Dashboard

![HTML Dashboard](assets/12-html-dashboard.png)

设置定期生成的 HTML 为 Dashboard，全屏打开；链接可跳 Logseq 页面/块。

### HTML 阅读器设置

![HTML 阅读器设置](assets/13-html-viewer-settings.png)

Dashboard 选择、全屏开关、标注写回、脚本/远程资源开关。

### 真实 Logseq：功能页

![真实 Logseq：功能页](assets/14-real-features.png)

TaskProgress / Heatmap / Milestone / BlockView 在真实 test 图渲染。

### 真实 Logseq：BlockView Table

![真实 Logseq：BlockView Table](assets/15-real-blockview-table.png)

真实 DB 块应用 ltt-table-root，两行数据正确成表。

### 真实 Logseq：BlockView Gallery

![真实 Logseq：BlockView Gallery](assets/16-real-blockview-gallery.png)

真实 DB 块切换 Gallery 后的卡片视图。

### 真实 Logseq：TaskProgress

![真实 Logseq：TaskProgress](assets/17-real-taskprogress.png)

真实任务状态 2/4 进度与 tooltip。

### 真实 Logseq：Heatmap

![真实 Logseq：Heatmap](assets/18-real-heatmap.png)

真实 tag=tt-e2e 月度热力图与统计。

### 真实 Logseq：Milestone

![真实 Logseq：Milestone](assets/19-real-milestone.png)

真实 compact 里程碑节点与状态。

## 报告生成过程中发现并修复的问题

| 问题 | 影响 | 修复 |
|---|---|---|
| Table 行 `.block-control-wrap` 直接参与 grid | 首列被 control 占用，单元格错位/换行 | 隐藏 table row 的 control wrap；E2E 新增 hit/grid 断言 |
| Summary/Settings/Comment 的 fixed 容器无 z-index | 后续主内容可能盖住弹窗点击区域 | 容器 `z-index:10000` + overlay `pointer-events:auto`；E2E 新增 elementFromPoint 校验 |

## 复现

```bash
npm ci
npm i -D electron   # 或设置 ELECTRON_BIN
npm run e2e:no-build
```

无 Electron 时只跑单元/集成：

```bash
npm test
```

## 限制

- Host mock 覆盖插件自身 UI/API 契约，不覆盖真实 Logseq 编辑器、真实 DB、插件 reload 和跨 graph 行为。
- 真实 DB Datalog 另用 `logseq query` 验证；真实应用最终确认见 smoke checklist。
- AI 设置只验证了禁用/fallback 与请求解析单测；真实网络/PROXY/CORS 应在真实 Logseq 手工验证。
- 截图环境为 1400×1000 CSS 像素、Retina 2x；真实 Logseq 的窗口布局可能不同。
