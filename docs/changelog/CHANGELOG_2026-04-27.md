# 更新日志 2026-04-27

## 项目介绍

### Logseq Text Toolkit
A powerful and flexible toolbar component for Logseq plugins, designed to enhance text editing and formatting capabilities.

## 核心功能

### 核心组件
- **Toolbar**: 可自定义的工具栏，支持图标、分组和下拉菜单
- **SelectToolbar**: 文本选择时自动出现，智能定位

### 关键特性
- **可自定义尺寸**: 支持自定义宽度和高度
- **主题支持**: 明暗模式
- **图标支持**: 兼容 lucide-react 图标和 SVG 图标
- **智能定位**: 根据可用空间自动显示在选中文本的上方或下方
- **滚动跟踪**: 滚动时跟随选中文本
- **延迟隐藏**: 可配置下拉菜单的延迟时间，改善用户体验
- **事件处理**: 支持自定义点击函数和模式
- **Iframe 环境支持**: 兼容 Logseq 插件的 iframe 运行环境
- **精确文本替换**: 支持精确替换选中文本

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

## 开发

### 安装
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
  - `Toolbar/` - 基本工具栏组件
  - `SelectToolbar/` - 选择工具栏组件
  - `SettingsModal/` - 设置模态框组件
  - `Toast/` - 提示消息组件

- `src/config/` - 配置目录
  - `useSettings.tsx` - 设置管理
  - `defaultSettings.ts` - 默认设置
  - `types.ts` - 类型定义

- `src/logseq/` - Logseq 相关
  - `index.ts` - Logseq API 管理
  - `mock/` - Mock Logseq API
  - `utils.ts` - 工具函数

- `src/test/` - 测试目录
  - `testAPP.tsx` - 测试应用
  - `testData.ts` - 测试数据

## 配置

### 工具栏项目配置

```typescript
const toolbarItems = {
  "wrap-bold": {
    id: "wrap-bold",
    label: "Bold",
    binding: "",
    icon: "bold",
    funcmode: "replace",
    clickfunc: "**${selectedText}**"
  },
  "group-style": {
    id: "group-style",
    isGroup: true,
    label: "Style",
    items: {
      // sub-items...
    }
  }
}
```

### 支持的功能模式
- `replace`: 替换选中文本
- `add`: 添加内容
- `invoke`: 调用函数
- `console`: 控制台操作

## 功能优化

### Hiccup 渲染器优化
- 重写了 Hiccup 解析器，使用递归下降解析法提高解析准确性
- 支持 Logseq 风格的属性格式，如 `[:span.inline-comment {:data-comment "评论"} "Text"]`
- 实现了文本按换行处理，每个换行的元素都可以被尝试从 Hiccup 转换为 HTML
- 支持 Hiccup 文本前后有普通文本的情况，如 `前[:u.red "Logseq"]  后面`

## 问题修复
- 修复了 Hiccup 解析器在处理复杂属性时的崩溃问题
- 修复了页面白屏问题，确保 Hiccup 渲染器稳定运行

## 技术改进
- 提高了 Hiccup 解析的健壮性和准确性
- 优化了错误处理机制，确保即使解析失败也不会影响整体功能
- 改进了代码结构，使其更易于维护和扩展

## 测试验证
- 验证了基础文本、带属性元素、嵌套元素、混合文本等多种 Hiccup 格式的正确渲染
- 确保服务稳定运行，页面正常显示

## 2026-04-27 其他更新

### 实现功能
- 实现了CSS文件打包优化方案
- 将CSS文件打包到插件根目录，支持用户自定义样式
- 实现了动态加载CSS文件的功能，修改后重新加载插件即可生效
- 提供内置CSS作为fallback，确保插件在CSS文件不存在时仍能正常运行

### 代码优化
- 修改了Vite构建配置，启用CSS代码分割
- 添加了copy-css脚本，用于将CSS文件复制到dist目录
- 实现了loadCSS函数，动态加载CSS文件
- 移除了各个组件中的CSS提供代码，统一由loadCSS函数处理

### 测试验证
- 构建成功，CSS文件已正确复制到dist目录
- 测试服务地址：http://localhost:3001/
