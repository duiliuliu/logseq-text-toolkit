# Logseq Text Toolkit ✨

一个功能强大、灵活的 Logseq 插件，增强文本编辑和格式化能力。

[English Version](README.en.md) | 中文版本

👉 [在线预览](https://duiliuliu.github.io/logseq-text-toolkit/) | [实验版本预览](https://duiliuliu.github.io/logseq-text-toolkit/dev/) | [用户详细操作指导](docs/USER_GUIDE.md)

---

## 一、示例展示

<table>
  <tr>
    <td align="center">
      <img width="280" alt="文本操作" src="https://github.com/user-attachments/assets/4be36305-3d06-443d-8548-a121894cb46d" />
      <br>文本操作
    </td>
    <td align="center">
      <img width="280" alt="工具栏" src="https://github.com/user-attachments/assets/ff0810d8-b201-4680-b316-683e03013133" />
      <br>工具栏按钮
    </td>
      <td align="center">
      <img width="280" alt="任务进度" src="https://github.com/user-attachments/assets/8bb1861d-0b07-4056-a6b4-b5ebd40c5e68" />
      <br>任务进度追踪
    </td>
  </tr>
  <tr>
    <td align="center">
       <img width="280" alt="toolbar设置面板" src="https://github.com/user-attachments/assets/383a176b-f94a-4f1c-b50a-a4f738d0ac0f" />
      <br>Toolbar 设置面板
    </td>
      <td align="center">
       <img width="280" alt="taskprogress设置面板" src="https://github.com/user-attachments/assets/73c9eb90-2c4f-4ace-99ea-a9eb510f7bcf" />
      <br>Task Progress 设置面板
    </td>
    <td align="center">
      <img width="280" height="200" alt="heatmap" src="docs/screenshots/heatmap.png" />
      <br>Heatmap 热力图
    </td>
  </tr>
  <tr>
    <td align="center">
      <img width="280" alt="BlockView Table" src="docs/screenshots/tableView.png" />
      <br>块视图 - 表格
    </td>
    <td align="center">
      <img width="280" alt="BlockView Gallery" src="docs/screenshots/gallery.png" />
      <br>块视图 - 画廊
    </td>
    <td align="center">
      <img width="280" alt="BlockView Board" src="docs/screenshots/board.png" />
      <br>块视图 - 看板
    </td>
  </tr>
  <tr>
    <td align="center">
      <img width="280" alt="Mind View" src="docs/screenshots/mindView.png" />
      <br>思维视图 (实验) 🧪
    </td>
  </tr>
</table>

---

## 二、主要功能

### 📝 文本格式化

| 功能 | 说明 |
|------|------|
| 加粗、斜体、删除线、下标、上标、代码块 | 常用格式快捷操作 |
| 背景高亮 | 红/黄/蓝/绿/紫 五色可选 |
| 文本颜色 | 多种颜色可选 |
| 彩色下划线 | 红/黄/蓝/绿/紫 五色 |
| 文件链接 | 快速插入文件链接 |

**使用方式**：选中文本 → 工具栏自动弹出 → 点击相应按钮

---

### 📊 任务进度追踪

| 功能 | 说明 |
|------|------|
| 展示样式 | 微型圆环、点阵进度、状态光标、进度胶囊、阶梯进度 |
| 嵌套统计 | 支持 1-N 层嵌套，仅统计叶子任务 |
| 状态识别 | 自动识别 todo/doing/done/waiting/in-review 等 |
| 自定义颜色 | 支持自定义状态颜色 |
| 🎆 成就烟花 | 任务全部完成时绽放绚丽烟花（可开关） |

**基本使用**：
```markdown
- 我的项目 {{renderer :taskprogress}}
  - 任务1 #task status:: todo
  - 任务2 #task status:: doing
  - 任务3 #task status:: done
```

---

### 🔥 Heatmap 热力图

| 功能 | 说明 |
|------|------|
| 视图 | year / month / week 三视图 |
| 查询 | 支持 tag / page / property 三种查询方式 |
| 配色 | 支持 min/max 渐变颜色与两种计算公式 |
| 快捷创建 | 支持点击 month 和周数创建对应日期页面 |

**基本使用**：
```markdown
{{renderer :heatmap, month, tag=work}}
{{renderer :heatmap, view=year, tag=work}}
{{renderer :heatmap, view=month, page=My Page}}
```

---

### 📋 块视图 (Block View) 🆕

| 功能 | 说明 |
|------|------|
| 视图类型 | 列表、表格、画廊、看板 |
| 主题支持 | 默认、Notion、Linear、深色、渐变、Tana、自定义 |
| 自定义主题 | 支持各视图独立配置颜色、边框、圆角等 |
| 视图切换栏 | 可显示/隐藏 |

**基本使用**：
```markdown
{{renderer :block-view}}
{{renderer :block-view, view=table}}
{{renderer :block-view, view=gallery}}
{{renderer :block-view, view=board}}
```

**指定主题**：
```markdown
{{renderer :block-view, theme=notion}}
{{renderer :block-view, view=table, theme=linear}}
```

**参数说明**：
| 参数 | 说明 | 可选值 |
|------|------|--------|
| view | 视图类型 | list, table, gallery, board |
| theme | 主题风格 | default, notion, linear, dark, gradient, tana, custom |
| hideBar | 隐藏切换栏 | true, false |

---

### 🧠 思维视图 (Mind View) 🧪

| 功能 | 说明 |
|------|------|
| 思维导图 | 以思维导图形式展示块之间的层级关系 |
| 自动布局 | 自动计算节点位置，美观排列 |
| 节点样式 | 支持多种节点样式和颜色配置 |
| 交互操作 | 支持折叠/展开、缩放等操作 |

> ⚠️ 思维视图是实验功能，正在持续优化中。

**基本使用**：
```markdown
{{renderer :mind-view}}
```

---

### 📝 总结生成 (Summary) ⚠️

| 功能 | 说明 |
|------|------|
| 总结类型 | 周度、月度、年度、自定义时间范围 |
| 模板支持 | GTD 工作回顾、极简仪表盘、子弹日记、OKR 回顾、学习总结 |
| AI 增强 | 支持 OpenAI/Claude 接入 |

> ⚠️ 总结功能正在开发中，暂时不可用。

---

### 🎛️ 工具栏

| 功能 | 说明 |
|------|------|
| 自动弹出 | 选中文本自动显示工具栏 |
| 快捷键 | 支持自定义快捷键绑定 |
| 按钮国际化 | 使用 emoji 图标，支持多语言显示 |

---

### ⚙️ 主题与多语言

| 功能 | 说明 |
|------|------|
| 主题 | light / dark 自动跟随 Logseq |
| 多语言 | 中文、English、日语 |
| 扩展性 | CSS 样式覆盖、语言文件扩展 |

---

### 🎨 CSS 自定义

在 Logseq 设置中可通过 CSS 覆盖默认样式：

```css
/* 自定义工具栏样式 */
.ltt-toolbar {
  --ltt-bg: #ffffff;
  --ltt-border: #e5e7eb;
}

/* 自定义任务进度颜色 */
.ltt-task-progress {
  --ltt-done-color: #22c55e;
}
```

---

## 三、安装

### 方式一：插件市场（推荐）

1. Logseq → 右上角菜单 → **插件**
2. 搜索 `logseq-text-toolkit` → **安装**

### 方式二：GitHub 加载

1. Logseq → 右上角菜单 → **插件**
2. 点击 **从 URL 加载插件**
3. 输入：`https://github.com/duiliuliu/logseq-text-toolkit/`

---

## 四、功能使用详细说明

### 4.1 文本格式化

选中文本 → 自动弹出工具栏 → 点击相应按钮

**颜色选项**：
- 🔴 红色
- 🟡 黄色  
- 🔵 蓝色
- 🟢 绿色
- 🟣 紫色

### 4.2 任务进度追踪

#### 支持的任务状态

| 状态 | 标识 | 说明 |
|------|------|------|
| todo | 待办 | 尚未开始的任务 |
| doing | 进行中 | 正在执行的任务 |
| in-review | 审核中 | 等待审核的任务 |
| done | 已完成 | 已完成的任务 |
| waiting | 等待中 | 等待其他任务的任务 |
| canceled | 已取消 | 被取消的任务 |

#### 展示样式参数

| 样式 | 命令参数 |
|------|---------|
| 微型圆环 | mini-circle |
| 点阵进度 | dot-matrix |
| 状态光标 | status-cursor |
| 进度胶囊 | progress-capsule |
| 阶梯进度 | step-progress |

#### 嵌套层级

| 嵌套层级 | 说明 |
|---------|------|
| 仅当前层 | 只统计直接子任务 |
| 向下2层 | 统计当前层和下一层 |
| 向下3层 | 统计当前层和下两层 |
| 全部层级 | 统计所有嵌套层级 |

### 4.3 Heatmap

#### 视图类型

| 视图 | 参数 | 说明 |
|------|------|------|
| 年度视图 | year | 显示整年的热力图 |
| 月度视图 | month | 显示单月热力图 |
| 周度视图 | week | 显示单周热力图 |

#### 查询方式

| 查询类型 | 参数格式 | 示例 |
|---------|---------|------|
| 标签查询 | tag=标签名 | tag=work |
| 页面查询 | page=页面名 | page=My Page |
| 属性查询 | property=属性::值 | property=category::work |

### 4.4 块视图

#### 主题风格

| 主题 | 特点 | 适用场景 |
|------|------|---------|
| Default | 简洁清晰 | 通用场景 |
| Notion | 无边框、极简 | 追求简洁 |
| Linear | 科技感强 | 程序员风格 |
| Dark | 深色配色 | 夜间使用 |
| Gradient | 渐变效果 | 追求美观 |
| Tana | 柔和配色 | 清新风格 |
| Custom | 完全自定义 | 按需配置 |

### 4.5 思维视图 (Mind View)

#### 功能特性

思维视图是实验性功能，以思维导图形式直观地展示块之间的层级关系。

| 功能 | 说明 |
|------|------|
| 层级可视化 | 自动解析块的嵌套关系，形成思维导图结构 |
| 自动布局 | 智能算法计算节点位置，美观排列 |
| 样式配置 | 支持节点颜色、边框、圆角等样式自定义 |
| 交互操作 | 支持鼠标拖拽、缩放、折叠/展开等操作 |

#### 使用示例

```markdown
{{renderer :mind-view}}
```

#### 注意事项

> ⚠️ 思维视图是实验功能，在以下情况下可能需要优化：
> - 非常大的层级结构（100+ 节点）
> - 深层嵌套（超过 6 层）
> - 包含大量特殊字符或格式的块

### 4.6 工具栏配置

在设置面板的 **Toolbar** 标签页可通过 JSON 配置工具栏元素：

```json
[
  {
    "id": "format-bold",
    "label": "加粗",
    "icon": "**",
    "invoke": "editor/insert-batch-edit",
    "invokeParams": {
      "texts": [["**{{selected}}**", "{{selected}}**"]]
    }
  }
]
```

**配置字段说明**：
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 唯一标识符 |
| label | string | 按钮显示名称 |
| icon | string | 按钮图标（支持 emoji） |
| invoke | string | 调用的 Logseq 命令 |
| invokeParams | object | 命令参数 |
| hidden | boolean | 是否隐藏按钮 |

### 4.7 自定义语言和国际化

插件支持多语言扩展，您可以添加新的语言包或修改现有翻译。

#### 当前支持的语言

| 语言代码 | 语言名称 | 文件路径 |
|---------|---------|---------|
| zh-CN | 简体中文 | translations/zh-CN.json |
| en | English | translations/en.json |
| ja | 日本語 | translations/ja.json |

#### 添加新语言

需要两步：

**步骤 1：在 `dist/translations/` 添加语言文件**

创建新的语言文件（如 `de.json` 表示德语）：

```json
{
  "toolbar": {
    "bold": "Fett",
    "highlight": "Hervorheben"
  },
  "settings": {
    "title": "Einstellungen"
  }
}
```

**步骤 2：在 Settings 中注册语言**

在 `src/settings/defaultSettings.json` 的 `meta.language.languages` 数组中添加配置：

```json
{
  "code": "de",
  "name": "Deutsch",
  "path": "translations/de.json"
}
```

完整的 languages 配置示例：

```json
"languages": [
  {
    "code": "zh-CN",
    "name": "简体中文",
    "path": "translations/zh-CN.json"
  },
  {
    "code": "en",
    "name": "English",
    "path": "translations/en.json"
  },
  {
    "code": "ja",
    "name": "日本語",
    "path": "translations/ja.json"
  },
  {
    "code": "de",
    "name": "Deutsch",
    "path": "translations/de.json"
  }
]
```

#### 修改现有翻译

直接编辑 `dist/translations/` 目录下的对应 JSON 文件：

```bash
# 编辑中文翻译
vim dist/translations/zh-CN.json

# 编辑英文翻译  
vim dist/translations/en.json
```

修改后需要重启插件使更改生效。

#### 翻译文件结构说明

每个语言 JSON 文件的结构：

```json
{
  "toolbar": {
    "bold": "加粗",
    "highlight": "高亮",
    "fileLink": "文件链接",
    "comment": "评论"
  },
  "settings": {
    "title": "设置",
    "tabs": {
      "general": "⚙️ 通用设置",
      "toolbar": "🛠️ 工具栏设置"
    },
    "enabled": "启用",
    "disabled": "禁用"
  },
  "blockView": {
    "description": "配置块视图模块的全局默认行为。",
    "enabled": "启用块视图功能"
  }
}
```

### 4.8 自定义 CSS 样式

插件的 CSS 文件位于 `dist/` 目录，您可以通过修改 CSS 文件来自定义样式。

#### CSS 文件说明

| 文件名 | 说明 |
|--------|------|
| `toolbar.css` | 工具栏样式 |
| `taskProgress.css` | 任务进度样式 |
| `heatmap.css` | 热力图样式 |
| `blockView.css` | 块视图基础样式 |
| `tableView.css` | 表格视图样式 |
| `galleryView.css` | 画廊视图样式 |
| `boardView.css` | 看板视图样式 |
| `settingsModal.css` | 设置面板样式 |
| `summary.css` | 总结生成样式 |
| `customSelect.css` | 自定义下拉框样式 |

#### 自定义样式方法

**方法一：直接修改 CSS 文件（推荐用于深度定制）**

找到 `dist/` 目录下的对应 CSS 文件进行修改，重启插件使更改生效：

```bash
# 编辑工具栏样式
vim dist/toolbar.css

# 编辑表格视图样式
vim dist/tableView.css
```

**方法二：使用 Logseq CSS 覆盖（推荐用于简单定制）**

在 Logseq 的 `custom.css` 文件中添加覆盖样式：

```css
/* 自定义工具栏样式 */
.ltt-toolbar {
  --ltt-bg: #ffffff;
  --ltt-border: #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 自定义任务进度颜色 */
.ltt-task-progress {
  --ltt-done-color: #22c55e;
  --ltt-todo-color: #94a3b8;
}

/* 自定义表格视图样式 */
.ltt-table-root {
  --ltt-border: #e2e8f0;
  --ltt-header-bg: #f8fafc;
  --ltt-radius: 8px;
}

/* 自定义块视图切换栏 */
.ltt-view-bar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 6px;
}

/* 深色模式自定义 */
.dark .ltt-toolbar {
  --ltt-bg: #1e2128;
  --ltt-border: rgba(255, 255, 255, 0.1);
}
```

#### CSS 变量参考

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `--ltt-bg` | 背景色 | `#ffffff` |
| `--ltt-border` | 边框色 | `#e5e7eb` |
| `--ltt-text` | 文字色 | `#333333` |
| `--ltt-primary` | 主色调 | `#3b82f6` |
| `--ltt-hover` | 悬停色 | `rgba(0,0,0,0.05)` |

#### 自定义主题示例

**Notion 风格主题**：

```css
.ltt-table-root.theme-notion {
  --ltt-border: #f0f0f0;
  --ltt-header-bg: #ffffff;
  --ltt-radius: 0px;
  --ltt-shadow: none;
}
```

**深色科技风格**：

```css
.dark .ltt-table-root.theme-linear {
  --ltt-border: rgba(255, 255, 255, 0.08);
  --ltt-header-bg: #1e2128;
  --ltt-header-text: #5e6ad2;
  --ltt-cell-text: #b8c0cc;
}
```

#### 注意事项

1. **优先级**：Logseq 的 custom.css 优先级高于插件自带 CSS
2. **覆盖方式**：使用 `!important` 可以强制覆盖
3. **深色模式**：插件会自动跟随 Logseq 的深色模式，建议同时配置 `.dark` 选择器
4. **备份**：修改前建议备份原始 CSS 文件
5. **调试**：使用浏览器开发者工具查看实际应用的样式

---

## 五，开发说明

### 开发环境

```bash
npm install          # 安装依赖
npm run dev          # 开发服务器 (http://localhost:3000)
npm run build        # 构建生产版本
npm run test         # 测试模式
```

### 项目结构

```
src/
├── components/       # React 组件
│   ├── Toolbar/     # 工具栏组件
│   ├── TaskProgress/# 任务进度组件
│   ├── Heatmap/     # 热力图组件
│   ├── BlockView/   # 块视图组件
│   ├── Summary/     # 总结生成组件
│   └── SettingsModal/# 设置面板
├── lib/            # 业务逻辑
│   ├── blockView/  # 块视图逻辑
│   ├── summary/    # 总结生成逻辑
│   └── render/     # 渲染器相关
├── settings/       # 设置管理
├── translations/    # 国际化文件
└── utils/          # 工具函数
```

### CSS 变量

| 变量名 | 说明 |
|--------|------|
| --ltt-bg | 背景色 |
| --ltt-border | 边框色 |
| --ltt-text | 文字色 |
| --ltt-primary | 主色调 |
| --ltt-hover | 悬停色 |

---

## 六、许可证

MIT
