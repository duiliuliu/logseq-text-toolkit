# Logseq Text Toolkit 插件用户指南

## 1. 插件概述

Logseq Text Toolkit 是一个为 Logseq 提供强大文本格式化功能的插件，支持多种文本样式、高亮、颜色和注释功能，帮助用户更高效地编辑和组织笔记内容。

### 主要功能特点：
- 丰富的文本格式化选项（加粗、斜体、删除线等）
- 多种颜色的背景高亮
- 自定义文本颜色
- 彩色下划线
- 标注功能
- 页面和日记评论功能
- 支持自定义配置
- 支持 light/dark 主题
- 支持多语言国际化（英文、日文、中文）

## 2. 安装方法

### 2.1 通过 Logseq 插件市场安装（推荐）
1. 打开 Logseq
2. 点击右上角菜单 → **插件**
3. 在插件市场中搜索 `logseq-text-toolkit`
4. 点击 **安装**
5. 安装完成后，插件会自动启用

### 2.2 通过 GitHub 链接加载
1. 打开 Logseq
2. 点击右上角菜单 → **插件**
3. 点击 **从 URL 加载插件**
4. 输入插件的 GitHub 链接：`https://github.com/duiliuliu/logseq-text-toolkit/`
5. 点击 **加载**

### 2.3 本地开发模式安装
1. 克隆插件代码到本地：`git clone https://github.com/duiliuliu/logseq-text-toolkit.git`
2. 进入插件目录：`cd logseq-text-toolkit`
3. 安装依赖：`npm install`
4. 构建插件：`npm run build`
5. 在 Logseq 中，点击右上角菜单 → **插件** → **加载未打包的插件**
6. 选择插件的根目录

## 3. 基本使用方法

### 3.1 使用工具栏
1. 在 Logseq 中打开任何页面
2. 进入编辑模式
3. **选中需要格式化的文本**
4. 此时会自动弹出格式化工具栏
5. 点击工具栏上的相应按钮进行格式化

### 3.2 使用快捷键
- **斜体**：`mod+shift+i`
- **移除格式**：`mod+shift+x`

### 3.3 自定义快捷键
1. 点击右上角菜单 → **插件** → 找到 `logseq-text-toolkit` → 点击 **设置**
2. 在配置中找到相应的命令
3. 在 `binding` 字段中设置您想要的快捷键组合
4. 保存配置并重启插件

## 4. 详细功能说明

### 4.1 文本格式化功能

#### 4.1.1 基本样式

| 功能 | 操作步骤 | 效果 | 语法 |
|------|----------|------|------|
| 加粗 | 选中文本 → 点击工具栏中的加粗按钮 | **粗体文本** | `**文本**` |
| 斜体 | 选中文本 → 点击工具栏中的斜体按钮 | *斜体文本* | `*文本*` |
| 删除线 | 选中文本 → 点击工具栏中的删除线按钮 | ~~删除线文本~~ | `~~文本~~` |

**效果图：**
- 基本样式：
  ![基本样式效果](screenshots/2026-04-23-15-17-17.png)
- 文本加粗：
  ![文本加粗效果](screenshots/2026-04-23-15-17-39.png)
- 工具栏加粗选项：
  ![工具栏加粗选项](screenshots/toolbar-bold.png)
- 工具栏斜体选项：
  ![工具栏斜体选项](screenshots/toolbar-italic.png)

#### 4.1.2 背景高亮

| 功能 | 操作步骤 | 效果 | 语法 |
|------|----------|------|------|
| 红色高亮 | 选中文本 → 点击工具栏中的高亮按钮 → 选择红色 | <mark class="red">红色高亮文本</mark> | `[:mark.red 文本]` |
| 黄色高亮 | 选中文本 → 点击工具栏中的高亮按钮 → 选择黄色 | <mark class="yellow">黄色高亮文本</mark> | `[:mark.yellow 文本]` |
| 蓝色高亮 | 选中文本 → 点击工具栏中的高亮按钮 → 选择蓝色 | <mark class="blue">蓝色高亮文本</mark> | `[:mark.blue 文本]` |
| 绿色高亮 | 选中文本 → 点击工具栏中的高亮按钮 → 选择绿色 | <mark class="green">绿色高亮文本</mark> | `[:mark.green 文本]` |
| 紫色高亮 | 选中文本 → 点击工具栏中的高亮按钮 → 选择紫色 | <mark class="purple">紫色高亮文本</mark> | `[:mark.purple 文本]` |

**效果图：**
- 文本背景红色高亮：
  ![红色高亮效果](screenshots/2026-04-23-15-18-12.png)
- 文本背景紫色高亮：
  ![紫色高亮效果](screenshots/2026-04-23-15-18-25.png)
- 工具栏高亮选项：
  ![工具栏高亮选项](screenshots/toolbar-highlight.png)

#### 4.1.3 文本颜色

| 功能 | 操作步骤 | 效果 | 语法 |
|------|----------|------|------|
| 红色文本 | 选中文本 → 点击工具栏中的文本颜色按钮 → 选择红色 | <span class="red">红色文本</span> | `[:span.red 文本]` |
| 黄色文本 | 选中文本 → 点击工具栏中的文本颜色按钮 → 选择黄色 | <span class="yellow">黄色文本</span> | `[:span.yellow 文本]` |
| 蓝色文本 | 选中文本 → 点击工具栏中的文本颜色按钮 → 选择蓝色 | <span class="blue">蓝色文本</span> | `[:span.blue 文本]` |
| 绿色文本 | 选中文本 → 点击工具栏中的文本颜色按钮 → 选择绿色 | <span class="green">绿色文本</span> | `[:span.green 文本]` |
| 紫色文本 | 选中文本 → 点击工具栏中的文本颜色按钮 → 选择紫色 | <span class="purple">紫色文本</span> | `[:span.purple 文本]` |

**效果图：**
- 文本字体蓝色高亮：
  ![蓝色文本效果](screenshots/2026-04-23-15-19-18.png)
- 文本字体黄色高亮：
  ![黄色文本效果](screenshots/2026-04-23-15-19-02.png)

#### 4.1.4 下划线高亮

| 功能 | 操作步骤 | 效果 | 语法 |
|------|----------|------|------|
| 红色下划线 | 选中文本 → 点击工具栏中的下划线按钮 → 选择红色 | <mark class="red-underline">红色下划线文本</mark> | `[:u.red 文本]` |
| 黄色下划线 | 选中文本 → 点击工具栏中的下划线按钮 → 选择黄色 | <mark class="yellow-underline">黄色下划线文本</mark> | `[:u.yellow 文本]` |
| 蓝色下划线 | 选中文本 → 点击工具栏中的下划线按钮 → 选择蓝色 | <mark class="blue-underline">蓝色下划线文本</mark> | `[:u.blue 文本]` |
| 绿色下划线 | 选中文本 → 点击工具栏中的下划线按钮 → 选择绿色 | <mark class="green-underline">绿色下划线文本</mark> | `[:u.green 文本]` |
| 紫色下划线 | 选中文本 → 点击工具栏中的下划线按钮 → 选择紫色 | <mark class="purple-underline">紫色下划线文本</mark> | `[:u.purple 文本]` |

**效果图：**
- 文本绿色下划线：
  ![绿色下划线效果](screenshots/2026-04-23-15-18-43.png)

#### 4.1.5 文件链接功能

| 功能 | 操作步骤 | 效果 | 语法 |
|------|----------|------|------|
| 文件链接 | 选中文本 → 点击工具栏中的文件链接按钮 | [[链接文本]] | `[[文本]]` |

**效果图：**
![文件链接效果](screenshots/file_link_effect.png)

### 4.2 标注功能

#### 操作步骤：
1. 选中需要添加标注的文本
2. 点击工具栏中的标注按钮

#### 功能效果：
- 在当前页面尾部添加 `## annotation` 标题（如果不存在）
- 将选中的文本作为子节点添加到 `## annotation` 下
- 在子节点下创建空白节点，光标定位到此处，让用户输入标注内容

**效果图：**
![标注功能效果](screenshots/annotation_effect.png)

### 4.3 评论功能

#### 4.3.1 页面内评论

**操作步骤：**
1. 选中需要添加评论的文本
2. 点击工具栏中的页面评论按钮

**功能效果：**
- 在当前页面创建 `## comment` 标题（如果不存在）
- 创建子节点，内容为选中节点的引用
- 在子节点下创建空白节点，光标定位到此处，让用户输入评论内容

**效果图：**
![页面内评论效果](screenshots/page_comment_effect.png)

#### 4.3.2 日记评论

**操作步骤：**
1. 选中需要添加评论的文本
2. 点击工具栏中的日记评论按钮

**功能效果：**
- 在当前日期的日记页面创建 `## comment` 标题（如果不存在）
- 创建子节点，内容为选中节点的引用
- 在子节点下创建空白节点，光标定位到此处，让用户输入评论内容

**效果图：**
![日记评论效果](screenshots/journal_comment_effect.png)

## 5. 配置详解

### 5.1 打开配置
1. 点击右上角菜单 → **插件**
2. 找到 `logseq-text-toolkit` → 点击 **设置**

### 5.2 主要配置项

#### 基础配置
```json
{
  "disabled": false,          // 是否禁用插件
  "toolbar": true,            // 是否显示工具栏
  "toolbarShortcut": ""       // 工具栏显示/隐藏的快捷键
}
```

#### 包裹命令配置 (wrap-*)
```json
{
  "wrap-bold": {
    "label": "Bold",                // 显示在工具栏的标签
    "binding": "",                  // 快捷键（可选）
    "template": "**$^**",          // 包裹模板，$^ 代表选中的文本
    "icon": "<svg ...></svg>"    // 图标（支持 SVG 字符串或 lucide-react 图标）
  }
}
```

#### 支持的图标格式
- **SVG 字符串**：直接提供 SVG 代码，例如 `<svg width="20" height="20" viewBox="0 0 24 24"><path d="M6 4h7a4 4 0 0 1 4 4v1a4 4 0 0 1-4 4H6V4zm0 7h7a4 4 0 0 1 4 4v1a4 4 0 0 1-4 4H6V11z" fill="currentColor"/></svg>`
- **lucide-react 图标**：使用 lucide-react 图标库中的图标组件，例如 `Bold`、`Italic`、`Underline` 等

**示例：**
```javascript
// 使用 SVG 字符串
"icon": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\"><path d=\"M6 4h7a4 4 0 0 1 4 4v1a4 4 0 0 1-4 4H6V4zm0 7h7a4 4 0 0 1 4 4v1a4 4 0 0 1-4 4H6V11z\" fill=\"currentColor\"/></svg>"

// 使用 lucide-react 图标
import { Bold } from 'lucide-react'
"icon": Bold
```

#### 分组配置 (group-*)
```json
{
  "group-style": {
    "wrap-bold": { ... },
    "wrap-italic": { ... }
  }
}
```

## 6. 工具栏样式自定义

您可以通过添加自定义 CSS 来修改工具栏的样式：

```css
/* 工具栏背景颜色 */
:root {
  --kef-wrap-tb-bg: #333e;
}
:root.dark {
  --kef-wrap-tb-bg: #777e;
}

/* 工具栏样式 */
#kef-wrap-toolbar {
  background: #333;
}

/* 工具栏按钮样式 */
.kef-wrap-tb-item {
}

/* 工具栏按钮悬停样式 */
.kef-wrap-tb-item:hover {
  filter: drop-shadow(0 0 3px #fff);
}

/* 图标样式 */
.kef-wrap-tb-item img {
  width: 20px;
  height: 20px;
}
```

## 7. 测试模式

插件提供了测试模式，可以在不加载到 Logseq 的情况下测试功能：

1. 启动测试模式服务器：`npm run test`
2. 在浏览器中访问：`http://localhost:3000/`
3. 在测试页面中测试所有功能

测试模式使用模拟的 Logseq API，适合快速功能验证。

## 8. 常见问题

### Q: 工具栏没有显示？
A: 请检查插件配置中的 `toolbar` 选项是否设置为 `true`。

### Q: 如何自定义快捷键？
A: 在插件设置中找到相应的命令，在 `binding` 字段中设置您想要的快捷键组合。

### Q: 配置修改后不生效？
A: 尝试重新加载插件或重启 Logseq。

### Q: 如何卸载插件？
A: 在 Logseq 插件市场中找到该插件，点击卸载即可。

## 9. 技术支持

如遇到问题或有建议，欢迎：
- 查看项目 README
- 在项目仓库提交 Issue
- 通过赞赏链接支持作者

---

**祝您使用愉快！**