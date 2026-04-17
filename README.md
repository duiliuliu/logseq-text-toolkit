# Logseq Text Toolkit

一个功能强大、灵活的Logseq插件工具栏组件，旨在增强文本编辑和格式化能力。

## 功能特性

### 核心组件
- **Toolbar**: 可自定义的工具栏，支持图标、分组和下拉菜单
- **SelectToolbar**: 选中文本时自动出现，具有智能定位功能

### 关键特性
- **自定义尺寸**: 支持自定义宽度和高度
- **主题支持**: 浅色和深色模式
- **图标支持**: 兼容 lucide-react 图标和 SVG 图标
- **智能定位**: 根据可用空间自动显示在选中文本的上方或下方
- **滚动跟踪**: 滚动时跟随选中文本
- **延迟隐藏**: 可配置的下拉菜单延迟，改善用户体验
- **事件处理**: 支持自定义点击函数和模式
- **iframe 环境支持**: 兼容 Logseq 插件的 iframe 运行环境
- **精确文本替换**: 支持选中文本的精确替换

## 使用方法

### 基本工具栏
```jsx
import Toolbar from './components/Toolbar'

<Toolbar 
  items={toolbarItems} 
  theme="light"
  width="110px"
  height="24px"
/>
```

### 选择工具栏
```jsx
import SelectToolbar from './components/SelectToolbar'

<SelectToolbar 
  targetElement={document.getElementById('content')}
  items={toolbarItems} 
  theme="light"
  hoverDelay={500}
/>
```

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

## 项目结构

- `src/components/` - 组件目录
  - `Toolbar/` - 基础工具栏组件
  - `SelectToolbar/` - 选择工具栏组件
  - `SettingsModal/` - 设置模态框组件
  - `Toast/` - 提示消息组件

- `src/config/` - 配置目录
  - `useSettings.tsx` - 设置管理
  - `defaultSettings.ts` - 默认设置
  - `types.ts` - 类型定义

- `src/logseq/` - Logseq 相关
  - `index.ts` - Logseq API 管理
  - `mock/` - 模拟 Logseq API
  - `utils.ts` - 工具函数

- `src/test/` - 测试目录
  - `testAPP.tsx` - 测试应用
  - `testData.ts` - 测试数据

## 配置说明

### 工具栏项目配置

```typescript
const toolbarItems = {
  "wrap-bold": {
    id: "wrap-bold",
    label: "加粗",
    binding: "",
    icon: "bold",
    funcmode: "replace",
    clickfunc: "**${selectedText}**"
  },
  "group-style": {
    id: "group-style",
    isGroup: true,
    label: "样式",
    items: {
      // 子项目...
    }
  }
}
```

### 支持的功能模式
- `replace`: 替换选中文本
- `add`: 添加内容
- `invoke`: 调用函数
- `console`: 控制台操作

## 贡献

欢迎贡献！请随时提交 Pull Request。

## 支持

如果您发现这个项目有帮助，请考虑支持开发者：

[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4%EF%B8%8F-pink)](https://duiliuliu.github.io/sponsor-page/)

## 许可证

MIT
