每天的更新聚合写入一个文件中，倒序写入，只做新增不删除

# Logseq Text Toolkit 更新日志

## [0.11.2] - 2026-04-15

### 新增
- 创建 SelectToolbar 组件，支持指定页面元素并监听其文本选择事件
- 实现 Toolbar 跟随选中文字滚动的功能
- 为 Toolbar 添加 hoverDelay 参数，支持自定义下拉子元素的延时隐藏时间
- 实现 Toolbar 根据页面空间自动选择显示位置（上方或下方）的功能

### 改进
- 调整 Toolbar 默认宽度为 110px，默认高度为 24px
- 优化下拉子元素的大小和间距，使其比 Toolbar 元素小 2px
- 调整下拉容器的内边距，使左右边界间距比 Toolbar 小 4px
- 优化 label 提示的样式，减小字体大小和内边距
- 改进鼠标交互，添加 0.5 秒延时隐藏下拉子元素，提升用户体验

### 修复
- 修复 testAPP 中 more 按钮点击失效的问题（事件冒泡冲突）
- 修复页面无法滚动的问题（移除 overflow: hidden）
- 修复 contentRef 重复应用的问题

## [0.11.1] - 2026-04-15

### 新增
- 支持 lucide-react 图标库
- 为下拉元素添加无边框选项
- 为 testData 上的叶子节点增加 funcmode 和 clickfunc 属性
- 实现 Toolbar 元素点击事件处理，支持打印功能
- 为 Toolbar 添加宽度自定义支持，通过 width 参数控制
- 在 testAPP 中实现选中文字后在文字上方显示 toolbar 的功能
- 实现点击 toolbar 元素时打印元素名称、function 和选中的文字的功能

### 改进
- 调整 Toolbar 宽度和图标大小，确保图标对齐
- 优化 Toolbar 组件代码结构，提取 renderIcon 函数
- 更新测试数据，使用 lucide-react 图标
- 在 APP 中添加 dark 主题的 Toolbar 示例
- 移除 Toolbar 的边框，使界面更简洁
- 调整 dark 主题的样式，使其与 light 主题有明显区别
- 清理无用的代码，保持代码简洁内聚

### 修复
- 修复 Toolbar 组件中的 React 组件名称大小写问题
- 修复 dark 主题的背景色问题（CSS 选择器问题）
- 重写 CSS 样式，解决 dark 模式不生效的问题，使用极简干净的样式结构
- 优先使用 CSS 变量，变量读取失败时使用回退值，确保主题切换更加可靠
- 修复 toolbar 叶子节点的 label 在 light 模式下显示为深色的问题

[0.11.2]: https://github.com/duiliuliu/logseq-text-toolkit/releases/tag/branch-0.11.2
[0.11.1]: https://github.com/duiliuliu/logseq-text-toolkit/releases/tag/branch-0.11.1