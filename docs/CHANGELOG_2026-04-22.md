## [0.11.8] - 2026-04-22
### 改进
- 使用 `getWindow()` 函数替换 `(window as any).parent.window` 写法，提高代码可读性和安全性
- 优化 `updateToolbarPosition` 函数实现，使用统一的窗口获取方式

### 修复
- 修复 Toolbar 点击 more 后折行展示的问题
  - **问题原因**：Toolbar 容器和 more 下拉菜单的宽度限制导致内容折行
  - **修复方式**：修改 `.ltt-toolbar-container` 样式为 `inline-flex`，添加 `width: auto` 和 `max-width: none`；优化 `.ltt-toolbar-more-dropdown` 样式，确保展开内容在单行显示

### 新增
- 在 main.tsx 中实现 `updateToolbarPosition` 功能，传入 SelectToolbar 组件
- 使用 Logseq API 的 `Editor.getEditingCursorPosition()` 获取光标位置并计算工具栏位置