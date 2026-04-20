# 更新日志

## 2025年更新

### 1. 修复 Toolbar 组件 more 展开后元素混乱的问题

- 修复了 Toolbar 组件中 more 展开时元素显示的问题
- 将 more 展开的元素放在一个独立的 dropdown 容器中
- 添加了相应的 CSS 样式来正确显示展开的元素

### 2. 优化 testAPP.tsx

- 移除了工具栏横幅部分
- 简化了测试页面的结构

### 3. 优化 defaultSettings.ts

- 添加了一个隐藏的代码块功能按钮
- 按钮默认设置为隐藏状态

### 4. 优化 ToolbarSettings.tsx

- 优化了 JSON 输入的处理，添加了防抖功能
- 优化了粘贴处理逻辑，不再预先验证是否是有效的 JSON
- 使用 logseqAPI.showMsg 来提示用户
- 替换了普通的 textarea 为 shadcn style 的 Textarea 组件

### 5. 添加 shadcn Textarea 组件

- 创建了一个新的 Textarea 组件，具有更好的视觉效果和交互体验
- 添加了相应的 CSS 样式

### 6. 优化构建配置

- npm run build 默认使用 test 模式
- npm run build:plugin 用于构建插件

## 测试结果

- 所有更改都通过了 npm run build 测试
- 构建成功完成

