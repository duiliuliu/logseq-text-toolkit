## [0.11.7] - 2026-04-23
### 改进
- 优化 SettingsModal 响应式设计，支持窄屏模式下的正常展示
- 确保输入框在窄屏模式下可见且自适应宽度
- 为不同屏幕尺寸添加针对性的样式调整
- 将 textProcessor.ts 迁移到 Toolbar 目录，提高代码组织性
- 优化 textProcessor.ts 代码结构，添加详细注释，提高可维护性
- 简化 processSelectedData 函数逻辑，直接使用 replaceSelectedText 的返回值
- 重构 replaceSelectedText 函数，使其返回处理后的文本
- 提取 updateBlockContent 子函数，提高代码可读性
- 简化 remove-formatting 功能的正则表达式，使其更简洁高效
- 移除 textProcessor.ts 中的测试数据，保持代码整洁
- 为文档添加工具栏操作的截图，提高用户体验

### 修复
- 修复窄屏场景下输入框不可见的问题
- 修复 JSON 编辑器在窄屏模式下的布局问题

### 新增
- 支持 `regexReplace` 功能，可通过配置正则表达式处理选中的文本
- 支持国际化，所有提示信息现在可以通过 i18n 翻译
- 在 USER_GUIDE.md 和 README.md 中添加工具栏操作的截图
- 创建 screenshots 目录用于存放文档图片