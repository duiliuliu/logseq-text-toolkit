# Logseq Text Toolkit

一个功能强大、灵活的 Logseq 插件，增强文本编辑和格式化能力。

[English Version](README.en.md) | 中文版本

👉 [在线预览](https://duiliuliu.github.io/logseq-text-toolkit/) | [实验页面](https://duiliuliu.github.io/logseq-text-toolkit/dev/)

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

## 示例展示

<table>
  <tr>
    <td align="center">
      <img width="180" alt="文本操作" src="https://github.com/user-attachments/assets/4be36305-3d06-443d-8548-a121894cb46d" />
      <br>文本操作
    </td>
    <td align="center">
      <img width="180" alt="工具栏" src="https://github.com/user-attachments/assets/ff0810d8-b201-4680-b316-683e03013133" />
      <br>工具栏按钮
    </td>
    <td align="center">
      <img width="180" alt="任务进度" src="https://github.com/user-attachments/assets/8bb1861d-0b07-4056-a6b4-b5ebd40c5e68" />
      <br>任务进度追踪
    </td>
  </tr>
</table>

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
