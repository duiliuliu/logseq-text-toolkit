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
  </tr>
  <tr>
    <td align="center">
      <img width="280" alt="任务进度" src="https://github.com/user-attachments/assets/8bb1861d-0b07-4056-a6b4-b5ebd40c5e68" />
      <br>任务进度追踪
    </td>
    <td align="center">
      <img width="280" alt="设置面板" src="https://github.com/user-attachments/assets/placeholder" />
      <br>设置面板
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
{{renderer :taskprogress :Step Progress}}
{{renderer :taskprogress :阶梯进度}}
```
支持样式：mini-circle / 微型圆环、dot-matrix / 点阵进度、status-cursor / 状态光标、progress-capsule / 进度胶囊、step-progress / 阶梯进度

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
npm run dev          # 开发服务器 (http://localhost:3004)
npm run build        # 构建
npm run test         # 测试模式
```

---

## 许可证

MIT
