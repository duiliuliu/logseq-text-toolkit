# Logseq Text Toolkit 分支更新日志

本文件记录 dev-text-tool 分支的所有变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [0.11.0] - 2026-04-14

### 新增
- 版本更新：发布 0.11.0 版本
- 初始化 Logseq 插件项目结构
- 配置 Vite + React 构建环境
- 实现插件基本初始化逻辑
- 添加应用欢迎语
- 实现测试模式下的控制台欢迎语

### 改进
- 调整项目目录结构，将 test 目录迁移到 src 下
- 优化构建配置
- 更新 workflow 文件中的图标路径
- 重构 testAPP.jsx，使其与 App.jsx 结构一致
- 修改 main.jsx，使用三木运算符根据模式加载不同应用
- 为 CSS 变量添加回退值，提高样式健壮性
- 优化插件初始化逻辑，将其迁移到 App 组件中

---

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

### 修复
- 修复 Toolbar 组件中的 React 组件名称大小写问题
- 修复 dark 主题的背景色问题（CSS 选择器问题）

---

[0.11.0]: https://github.com/duiliuliu/logseq-text-toolkit/releases/tag/branch-0.11.0
[0.11.1]: https://github.com/duiliuliu/logseq-text-toolkit/releases/tag/branch-0.11.1