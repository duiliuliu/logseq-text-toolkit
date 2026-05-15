# Logseq Text Toolkit ✨

让 Logseq 笔记更有趣、功能更强大！

👉 [在线预览](https://duiliuliu.github.io/logseq-text-toolkit/) | [实验页面](https://duiliuliu.github.io/logseq-text-toolkit/dev/) | [用户手册](docs/USER_GUIDE.md)

---

## 🚀 快速开始

```markdown
{{renderer :block-view, view=table}}
{{renderer :taskprogress}}
{{renderer :heatmap, month, tag=work}}
```

**使用方式**：在任意块中输入宏命令即可

---

## 🎯 核心功能

### 📋 块视图 (Block View)
多视图展示 Logseq 内容，支持列表、表格、画廊、看板

![Block View Table](docs/screenshots/tableView.png)

| 功能 | 说明 |
|------|------|
| **多种视图** | 列表 📋 / 表格 📊 / 画廊 🖼️ / 看板 📋 |
| **7 种主题** | Default、Notion、Linear、Dark、Gradient、Tana、自定义 |
| **主题切换** | 点击视图切换栏即时切换 |
| **自定义配置** | 支持各视图独立颜色、边框、圆角等配置 |

**使用示例**：
```markdown
{{renderer :block-view}}
{{renderer :block-view, view=table}}
{{renderer :block-view, view=gallery}}
{{renderer :block-view, view=board, theme=notion}}
```

### 📊 任务进度追踪
自动统计任务完成情况，支持多种展示样式

| 样式 | 命令参数 |
|------|---------|
| 微型圆环 | `mini-circle` |
| 点阵进度 | `dot-matrix` |
| 状态光标 | `status-cursor` |
| 进度胶囊 | `progress-capsule` |
| 阶梯进度 | `step-progress` |

**使用示例**：
```markdown
- 项目 {{renderer :taskprogress}}
  - 任务1 #task status:: todo
  - 任务2 #task status:: doing
  - 任务3 #task status:: done
```

### 🔥 Heatmap 热力图
可视化任务/活动分布，支持年/月/周视图

**使用示例**：
```markdown
{{renderer :heatmap, view=year, tag=work}}
{{renderer :heatmap, view=month, page=MyPage}}
```

### 🖼️ Gallery 画廊视图
卡片形式展示内容

![Gallery View](docs/screenshots/gallery.png)

### 📋 Board 看板视图
看板列展示，适合任务管理

![Board View](docs/screenshots/board.png)

### 📝 文本格式化
选中文本自动弹出工具栏，支持加粗、斜体、高亮、颜色等

---

## ⚙️ 安装

### 方式一：插件市场（推荐）
1. Logseq → 右上角菜单 → **插件**
2. 搜索 `logseq-text-toolkit` → **安装**

### 方式二：GitHub 加载
```
https://github.com/duiliuliu/logseq-text-toolkit/
```

---

## 🎨 主题与多语言

| 设置项 | 选项 |
|--------|------|
| **主题** | 跟随系统 / 浅色 / 深色 |
| **语言** | 中文、English、日语 |
| **工具栏** | 支持自定义按钮和快捷键 |

---

## 📖 详细文档

👉 [中文用户手册](docs/USER_GUIDE.md) - 包含所有功能详细说明和配置指南

---

## 📝 块视图参数说明

| 参数 | 说明 | 可选值 |
|------|------|--------|
| `view` | 视图类型 | `list`, `table`, `gallery`, `board` |
| `theme` | 主题风格 | `default`, `notion`, `linear`, `dark`, `gradient`, `tana`, `custom` |
| `hideBar` | 隐藏切换栏 | `true`, `false` |

---

## 🛠️ 开发

```bash
npm install          # 安装依赖
npm run dev          # 开发服务器
npm run build        # 构建
```

---

## 📄 许可证

MIT
