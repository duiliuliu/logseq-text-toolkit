# Live Dashboard（Logseq 内部版）

## 入口

在 Logseq 打开页面 `工作台`：

```text
工作台
└── 工作台 Dashboard {{renderer :dashboard}}
```

宏由插件 `1.2.26+` 注册，直接读取当前 graph：

- 任务：`:block/tags "Task"` + 状态 / 更新时间
- 标签：`:block/tags` 引用量
- 业务 / 金融：`业务看板`、`金融报告` 页面里的内部 HTML asset 附件

点击报告会使用插件内置 HTML Viewer 打开 `assets/<uuid>.html`，不需要外部路径。

## 报告页面结构

```text
业务看板
├── 最新简报
├── 按周归档
│   └── 2026-W42
├── 按月归档
│   └── 2026-10
└── AI 写入规则

金融报告
├── 最新报告
├── 按周归档
│   └── 2026-W42
├── 按月归档
│   └── 2026-10
└── AI 写入规则
```

AI 定时任务只需要把 HTML 作为**内部 asset 附件**挂到对应节点，并在最新/周期节点同步挂载。

## 不要设置外部路径

`Settings → HTML Viewer → Dashboard asset` 应保持为空，或使用 `block:<uuid>` 的内部 asset 节点。不要填：

```text
file:///...
/Users/...
```

Live Dashboard 不需要该设置，直接渲染 `{{renderer :dashboard}}`。

## 重新渲染

宏会在页面重新打开/刷新时重新查询；点击卡片右上角“刷新数据”可立即更新。报告附件由 AI 写入后，刷新即可看到。
