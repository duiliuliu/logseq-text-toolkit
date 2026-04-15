每天的更新聚合写入一个文件中，倒序写入，只做新增不删除

# Logseq Text Toolkit 更新日志

## [0.11.1] - 2026-04-15

### 新增
- 支持 lucide-react 图标库
- 为下拉元素添加无边框选项
- 为 testData 上的叶子节点增加 funcmode 和 clickfunc 属性
- 实现 Toolbar 元素点击事件处理，支持打印功能

### 改进
- 调整 Toolbar 宽度和图标大小，确保图标对齐
- 优化 Toolbar 组件代码结构，提取 renderIcon 函数
- 更新测试数据，使用 lucide-react 图标
- 在 APP 中添加 dark 主题的 Toolbar 示例
- 移除 Toolbar 的边框，使界面更简洁
- 调整 dark 主题的样式，使其与 light 主题有明显区别

### 新增
- 实现选中文字后在文字上方显示 toolbar 的功能
- 点击 toolbar 元素时打印元素名称、功能和选中的文字

### 修复
- 修复 Toolbar 组件中的 React 组件名称大小写问题
- 修复 dark 主题的背景色问题（CSS 选择器问题）
- 重写 CSS 样式，解决 dark 模式不生效的问题，使用极简干净的样式结构
- 优先使用 CSS 变量，变量读取失败时使用回退值，确保主题切换更加可靠

[0.11.1]: https://github.com/duiliuliu/logseq-text-toolkit/releases/tag/branch-0.11.1