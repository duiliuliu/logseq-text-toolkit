# 更新日志 - 2026-04-26

## 新增功能

- 实现了 Hiccup 实时渲染功能，支持在测试页面中实时预览 hiccup 语法的渲染结果
- 集成了 @thi.ng/hiccup 库，提供更可靠的 hiccup 解析和渲染能力

## 代码优化

- 修改了 HiccupRenderer 组件，使用 Function 构造函数代替 eval 来解析 hiccup 字符串，提高安全性
- 优化了 renderComponent 函数，简化了实现逻辑
- 增强了 Hiccup 解析的错误处理，提供更详细的错误信息

## 调试改进

- 在 SettingsModal 和 SelectToolbar 组件中添加了 debug 日志，方便排查主题不一致的问题
- 在 HiccupRenderer 组件中添加了详细的解析和渲染日志，方便排查解析错误

## 其他修改

- 修复了 ReactDOMClient.createRoot() 重复调用的问题
- 修复了 SVG 中的 DOM 属性错误（stroke-linejoin 改为 strokeLinejoin）
