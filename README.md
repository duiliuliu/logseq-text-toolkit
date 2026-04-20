# Logseq Text Toolkit

[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4%EF%B8%8F-pink)](https://duiliuliu.github.io/sponsor-page/)

一个功能强大、灵活的 Logseq 插件，旨在增强文本编辑和格式化能力，为您的笔记添加丰富的样式和功能。

## 插件概述

Logseq Text Toolkit 是一个为 Logseq 提供强大文本格式化功能的插件，支持多种文本样式、高亮、颜色和注释功能，帮助用户更高效地编辑和组织笔记内容。

### 主要功能特点：
- 丰富的文本格式化选项（加粗、斜体、删除线等）
- 多种颜色的背景高亮
- 自定义文本颜色
- 彩色下划线
- 标注功能
- 支持自定义配置
- 支持 light/dark 主题
- 支持多语言国际化

## 工具栏演示

### 基本使用方法
1. 在 Logseq 中打开任何页面
2. 进入编辑模式
3. **选中需要格式化的文本**
4. 此时会自动弹出格式化工具栏
5. 点击工具栏上的相应按钮进行格式化

### 工具栏功能

#### 文本格式化
- **加粗**：将选中的文本转换为粗体
- **斜体**：将选中的文本转换为斜体
- **删除线**：为选中的文本添加删除线

#### 背景高亮
- **黄色高亮**：为选中的文本添加黄色背景
- **红色高亮**：为选中的文本添加红色背景
- **蓝色高亮**：为选中的文本添加蓝色背景

#### 文本颜色
- **红色文本**：将选中的文本颜色设置为红色
- **蓝色文本**：将选中的文本颜色设置为蓝色

#### 下划线高亮
- **红色下划线**：为选中的文本添加红色下划线

## 安装方法

### 通过 Logseq 插件市场安装（推荐）
1. 打开 Logseq
2. 点击右上角菜单 → **插件**
3. 在插件市场中搜索 `logseq-text-toolkit`
4. 点击 **安装**
5. 安装完成后，插件会自动启用

### 通过 GitHub 链接加载
1. 打开 Logseq
2. 点击右上角菜单 → **插件**
3. 点击 **从 URL 加载插件**
4. 输入插件的 GitHub 链接：`https://github.com/duiliuliu/logseq-text-toolkit/`
5. 点击 **加载**

### 本地开发模式安装
1. 克隆插件代码到本地：`git clone https://github.com/duiliuliu/logseq-text-toolkit.git`
2. 进入插件目录：`cd logseq-text-toolkit`
3. 安装依赖：`npm install`
4. 构建插件：`npm run build`
5. 在 Logseq 中，点击右上角菜单 → **插件** → **加载未打包的插件**
6. 选择插件的根目录

## 使用说明

### 使用工具栏
1. 在 Logseq 中打开任何页面
2. 进入编辑模式
3. **选中需要格式化的文本**
4. 此时会自动弹出格式化工具栏
5. 点击工具栏上的相应按钮进行格式化

### 使用快捷键
- **斜体**：`mod+shift+i`

### 自定义快捷键
1. 点击右上角菜单 → **插件** → 找到 `logseq-text-toolkit` → 点击 **设置**
2. 在配置中找到相应的命令
3. 在 `binding` 字段中设置您想要的快捷键组合
4. 保存配置并重启插件

## 详细功能说明

### 文本格式化功能

#### 基本样式
- **加粗**：选中文本 → 点击工具栏中的加粗按钮 → **粗体文本**
- **斜体**：选中文本 → 点击工具栏中的斜体按钮 → *斜体文本*
- **删除线**：选中文本 → 点击工具栏中的删除线按钮 → ~~删除线文本~~

#### 背景高亮
- **红色高亮**：选中文本 → 点击工具栏中的高亮按钮 → 选择红色
- **黄色高亮**：选中文本 → 点击工具栏中的高亮按钮 → 选择黄色
- **蓝色高亮**：选中文本 → 点击工具栏中的高亮按钮 → 选择蓝色

#### 文本颜色
- **红色文本**：选中文本 → 点击工具栏中的文本颜色按钮 → 选择红色
- **蓝色文本**：选中文本 → 点击工具栏中的文本颜色按钮 → 选择蓝色

#### 下划线高亮
- **红色下划线**：选中文本 → 点击工具栏中的下划线按钮 → 选择红色

## 开发指南

### 安装依赖
```bash
npm install
```

### 开发服务器
```bash
npm run dev
```

### 构建
```bash
npm run build
```

## 配置说明

### 打开配置
1. 点击右上角菜单 → **插件**
2. 找到 `logseq-text-toolkit` → 点击 **设置**

### 主要配置项

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
  "group-custom": {
    "items": [
      {
        "key": "wrap-bold",
        "label": "Bold",                // 显示在工具栏的标签
        "binding": "",                  // 快捷键（可选）
        "template": "**$^**",          // 包裹模板，$^ 代表选中的文本
        "icon": "<svg ...></svg>"    // 图标（支持 SVG 字符串）
      },
      {
        "key": "wrap-italic",
        "label": "Italic",
        "binding": "mod+shift+i",
        "template": "*$^*",
        "icon": "<svg ...></svg>"
      },
      {
        "key": "wrap-strike-through",
        "label": "Strike through",
        "binding": "",
        "template": "~~$^~~",
        "icon": "<svg ...></svg>"
      }
    ]
  },
  "group-hl-custom": {
    "items": [
      {
        "key": "wrap-yellow-hl",
        "label": "Yellow highlight",
        "binding": "",
        "template": "==$^==",
        "icon": "<svg ...></svg>"
      },
      {
        "key": "wrap-red-hl",
        "label": "Red highlight",
        "binding": "",
        "template": "[:mark.red $^]",
        "icon": "<svg ...></svg>"
      },
      {
        "key": "wrap-blue-hl",
        "label": "Blue highlight",
        "binding": "",
        "template": "[:mark.blue $^]",
        "icon": "<svg ...></svg>"
      },
      {
        "key": "wrap-green-hl",
        "label": "Green highlight",
        "binding": "",
        "template": "[:mark.green $^]",
        "icon": "<svg ...></svg>"
      },
      {
        "key": "wrap-purple-hl",
        "label": "Purple highlight",
        "binding": "",
        "template": "[:mark.purple $^]",
        "icon": "<svg ...></svg>"
      }
    ]
  },
  "group-text-color": {
    "items": [
      {
        "key": "wrap-red-text",
        "label": "Red text",
        "binding": "",
        "template": "[:span.red $^]",
        "icon": "<svg ...></svg>"
      },
      {
        "key": "wrap-blue-text",
        "label": "Blue text",
        "binding": "",
        "template": "[:span.blue $^]",
        "icon": "<svg ...></svg>"
      },
      {
        "key": "wrap-yellow-text",
        "label": "Yellow text",
        "binding": "",
        "template": "[:span.yellow $^]",
        "icon": "<svg ...></svg>"
      },
      {
        "key": "wrap-green-text",
        "label": "Green text",
        "binding": "",
        "template": "[:span.green $^]",
        "icon": "<svg ...></svg>"
      },
      {
        "key": "wrap-purple-text",
        "label": "Purple text",
        "binding": "",
        "template": "[:span.purple $^]",
        "icon": "<svg ...></svg>"
      }
    ]
  },
  "group-text-underline": {
    "items": [
      {
        "key": "wrap-red-underline",
        "label": "Red underline",
        "binding": "",
        "template": "[:u.red $^]",
        "icon": "<svg ...></svg>"
      },
      {
        "key": "wrap-blue-underline",
        "label": "Blue underline",
        "binding": "",
        "template": "[:u.blue $^]",
        "icon": "<svg ...></svg>"
      },
      {
        "key": "wrap-yellow-underline",
        "label": "Yellow underline",
        "binding": "",
        "template": "[:u.yellow $^]",
        "icon": "<svg ...></svg>"
      },
      {
        "key": "wrap-green-underline",
        "label": "Green underline",
        "binding": "",
        "template": "[:u.green $^]",
        "icon": "<svg ...></svg>"
      },
      {
        "key": "wrap-purple-underline",
        "label": "Purple underline",
        "binding": "",
        "template": "[:u.purple $^]",
        "icon": "<svg ...></svg>"
      }
    ]
  },
  "wrap-cloze": {
    "label": "Cloze",
    "binding": "",
    "template": " {{cloze $^}}",
    "icon": "<svg ...></svg>"
  }
}
```

## 贡献

欢迎贡献！请随时提交 Pull Request。

## 支持

如果您发现这个项目有帮助，请考虑支持开发者：

[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4%EF%B8%8F-pink)](https://duiliuliu.github.io/sponsor-page/)

## 许可证

MIT