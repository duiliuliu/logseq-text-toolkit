# Logseq Text Toolkit 更新日志

本项目的所有重要变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [未发布]

## [0.10.3] - 2026-04-13

### 新增
- 实现测试模式，提供本地网页环境用于插件功能测试
- 添加完整的 Logseq API 模拟，支持在测试模式下使用所有插件功能
- 创建 [DEVELOPMENT.md](file:///workspace/DEVELOPMENT.md) 开发指南文档
- 创建 [CHANGELOG.md](file:///workspace/CHANGELOG.md) 更新日志文档
- 添加测试模式页面 test.html，包含所有功能按钮和测试结果显示

### 改进
- 优化插件代码，添加测试模式检测逻辑
- 改进工具栏创建逻辑，在测试模式下不尝试创建 Logseq UI 元素
- 优化更新块文本逻辑，在测试模式下直接更新页面中的 textarea 元素
- 为标注和评论功能添加测试模式处理逻辑
- 改进 beforeunload 事件处理，在测试模式下不尝试移除不存在的元素监听器
- 改进 onSelectionChange 事件处理，在测试模式下不尝试定位工具栏

### 修复
- 修复测试模式下的兼容性问题
- 确保插件代码在测试模式和 Logseq 环境下都能正常工作

---

## [0.10.2] - 之前

### 新增
- 文本格式化功能（加粗、斜体、删除线）
- 背景高亮功能（红、黄、蓝、绿、紫）
- 文本颜色功能（红、黄、蓝、绿、紫）
- 下划线高亮功能（红、黄、蓝、绿、紫）
- Cloze 功能
- 标注功能
- 页面评论功能
- 日记评论功能
- 完整的用户指南 [USER_GUIDE.md](file:///workspace/USER_GUIDE.md)
- 中文和英文 README 文档

### 改进
- 优化工具栏样式和交互
- 改进主题支持（浅色/深色模式）
- 优化文本格式化逻辑
- 改进用户体验

---

[未发布]: https://github.com/duiliuliu/logseq-text-toolkit/compare/v0.10.3...HEAD
[0.10.3]: https://github.com/duiliuliu/logseq-text-toolkit/releases/tag/v0.10.3
[0.10.2]: https://github.com/duiliuliu/logseq-text-toolkit/releases/tag/v0.10.2
