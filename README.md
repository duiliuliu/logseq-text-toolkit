# Logseq Text Toolkit

一个功能强大、灵活的 Logseq 插件，增强文本编辑和格式化能力。

[English Version](README.en.md) | 中文版本

👉 [在线预览](https://duiliuliu.github.io/logseq-text-toolkit/) | [实验页面](https://duiliuliu.github.io/logseq-text-toolkit/dev/)

---

## 示例展示

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
      <br>toolbar设置面板
    </td>
      <td align="center">
       <img width="280" alt="taskprogress设置面板" src="https://github.com/user-attachments/assets/73c9eb90-2c4f-4ace-99ea-a9eb510f7bcf" />
      <br>taskprogress设置面板
    </td>
    <td align="center">
      <img width="280" alt="heatmap" src="docs/screenshots/heatmap.png" />
      <br>heatmap
    </td>
  </tr>
</table>

---

## 主要功能

### 📝 文本格式化
| 功能 | 说明 |
|------|------|
| 加粗、斜体、删除线、下标、上标、代码块 | 常用格式快捷操作 |
| 背景高亮 | 红/黄/蓝/绿/紫 五色可选 |
| 文本颜色 | 多种颜色可选 |
| 彩色下划线 | 红/黄/蓝/绿/紫 五色 |
| 文件链接 | 快速插入文件链接 |

### 📊 任务进度追踪
| 功能 | 说明 |
|------|------|
| 展示样式 | 微型圆环、点阵进度、状态光标、进度胶囊、阶梯进度 |
| 嵌套统计 | 支持 1-N 层嵌套，仅统计叶子任务 |
| 状态识别 | 自动识别 todo/doing/done/waiting/in-review 等 |
| 自定义颜色 | 支持自定义状态颜色 |
| 🎆 成就烟花 | 任务全部完成时绽放绚丽烟花（可开关） |

### 🔥 heatmap
| 功能 | 说明 |
|------|------|
| 视图 | year / month / week 三视图 |
| 查询 | 支持 tag / page / property 三种查询方式 |
| 配色 | 支持 min/max 渐变颜色与两种计算公式 |

### 📋 块视图 (Block View) 🆕
| 功能 | 说明 |
|------|------|
| 视图类型 | 列表、表格、画廊、看板 |
| 主题支持 | 默认、Notion、Linear、深色、渐变、Tana、自定义 |
| 自定义主题 | 支持各视图独立配置颜色、边框、圆角等 |
| 视图切换栏 | 可显示/隐藏 |

**使用方式**：
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

### 📝 总结生成 (Summary) ⚠️ **暂不可用**
| 功能 | 说明 |
|------|------|
| 总结类型 | 周度、月度、年度、自定义时间范围 |
| 模板支持 | GTD 工作回顾、极简仪表盘、子弹日记、OKR 回顾、学习总结 |
| AI 增强 | 支持 OpenAI/Claude 接入 |
| 数据分析 | 块、任务、页面统计 |

> ⚠️ 总结功能正在开发中，暂时不可用。

### 🎛️ 工具栏
- 选中文本自动弹出
- 支持快捷键自定义
- 按钮表情国际化（✨/📝/🎨 等）

### ⚙️ 主题与多语言
| 功能 | 说明 |
|------|------|
| 主题 | light / dark 自动跟随 Logseq |
| 多语言 | 中文、English、日语 |
| 扩展性 | CSS 样式覆盖、语言文件扩展 |

---

## 安装

### 方式一：插件市场（推荐）
1. Logseq → 右上角菜单 → **插件**
2. 搜索 `logseq-text-toolkit` → **安装**

### 方式二：GitHub 加载
1. Logseq → 右上角菜单 → **插件**
2. 点击 **从 URL 加载插件**
3. 输入：`https://github.com/duiliuliu/logseq-text-toolkit/`

---

## 使用方法

### 文本格式化
选中文本 → 自动弹出工具栏 → 点击相应按钮

### 任务进度追踪
```markdown
- 我的项目 {{renderer :taskprogress}}
  - 任务1 #task status:: todo
  - 任务2 #task status:: doing
  - 任务3 #task status:: done
```

**指定展示样式**：
```markdown
{{renderer :taskprogress, step-progress}}
{{renderer :taskprogress, display=step-progress, size=small}}
```
支持样式：mini-circle / 微型圆环、dot-matrix / 点阵进度、status-cursor / 状态光标、progress-capsule / 进度胶囊、step-progress / 阶梯进度

### heatmap
```markdown
{{renderer :heatmap, month, tag=work}}
```
更多参数示例（推荐 key=value）：
```markdown
{{renderer :heatmap, view=year, tag=work}}
{{renderer :heatmap, view=month, page=My Page}}
{{renderer :heatmap, view=week, property=category::work, week=20, year=2026}}
```

### 块视图 (Block View)
```markdown
{{renderer :block-view}}
{{renderer :block-view, view=table}}
{{renderer :block-view, view=gallery}}
{{renderer :block-view, view=board}}
```

**参数说明**：
| 参数 | 说明 | 可选值 |
|------|------|-------|
| view | 视图类型 | list, table, gallery, board |
| theme | 主题风格 | default, notion, linear, dark, gradient, tana, custom |
| hideBar | 隐藏切换栏 | true, false |

---

## 配置说明

### 语言设置
| 选项 | 说明 |
|------|------|
| 系统跟随 | 自动跟随 Logseq 语言设置 |
| 简体中文 | 中文界面 |
| English | 英文界面 |
| 日本語 | 日语界面 |

语言文件位于 `dist/translations/` 目录，支持扩展新的语言包。

### CSS 定制
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

### 工具栏配置
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
| binding | string | 快捷键绑定（功能开发中） |
| subItems | array | 分组，包含多个子元素 |

---

## 开发

```bash
npm install          # 安装依赖
npm run dev          # 开发服务器 (http://localhost:3000)
npm run build        # 构建
npm run test         # 测试模式
```

---

## 许可证

MIT
