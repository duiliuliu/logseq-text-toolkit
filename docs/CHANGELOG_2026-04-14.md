每天的更新聚合写入一个文件中，倒序写入，只做新增不删除

# Logseq Text Toolkit 更新日志

本项目的所有重要变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [0.10.7] - 2026-04-14

### 新增
- 版本更新：发布 0.10.7 版本
- 新增 state.js 模块，集中管理全局变量

### 改进
- 去掉 onSelectionChange 函数的多余参数，简化代码
- 为所有代码函数添加详细的 JSDoc 注释
- 清理 test 模式相关的代码，保持代码简洁
- 优化状态管理，减少全局变量的使用

---

## [0.10.6] - 2026-04-14

### 新增
- 版本更新：发布 0.10.6 版本
- 更新插件图标，使用新的文本工具包主题图标

### 改进
- 保持代码稳定性
- 确保所有功能正常运行
- 更新 workflow 配置文件，修复 icon 路径引用

---

## [0.10.5] - 2026-04-14

### 新增
- 完成代码模块化重构：
  - 新增 annotation.js 模块，处理注解和评论功能
  - 完善所有工具模块的功能
  - 重构 index.jsx 为纯初始化和协调文件
- 更新插件图标，使用现代化设计的新图标

### 改进
- 优化代码结构，提高可维护性
- 改进模块化设计，逻辑更加内聚
- 确保所有功能正常工作

### 修复
- 确保所有模块正确集成
- 验证项目构建成功

---

## [0.10.4] - 2026-04-14

### 新增
- 代码重构：将index.jsx中的逻辑分组到多个文件中，提高代码可维护性
- 创建utils目录，包含以下模块：
  - definitions.js: 工具栏项定义
  - styles.js: 样式提供
  - settings.js: 设置管理
  - toolbar.js: 工具栏相关逻辑
  - commands.js: 命令注册和执行

### 改进
- 优化index.jsx，大幅减少代码行数，逻辑更加清晰
- 改进代码结构，便于后续开发和维护
- 修复选中文字后出现"0"而非toolbar的问题
- 创建docs目录，用于存放文档文件

### 修复
- 修复Toolbar组件渲染问题，通过添加key属性解决显示"0"的bug

---

## [0.10.3] - 2026-04-13

### 新增
- 实现测试模式，提供本地网页环境用于插件功能测试
- 添加完整的 Logseq API 模拟，支持在测试模式下使用所有插件功能
- 创建开发指南文档
- 创建更新日志文档
- 添加测试模式页面 test.html，包含所有功能按钮和测试结果显示

### 改进
- 优化测试模式页面，添加编辑模式和显示模式两个区域
- 实现显示模式的样式体现功能，当编辑区域失去焦点时自动展示格式化效果
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
- 完整的用户指南
- 中文和英文 README 文档

### 改进
- 优化工具栏样式和交互
- 改进主题支持（浅色/深色模式）
- 优化文本格式化逻辑
- 改进用户体验

---

[0.10.7]: https://github.com/duiliuliu/logseq-text-toolkit/releases/tag/v0.10.7
[0.10.6]: https://github.com/duiliuliu/logseq-text-toolkit/releases/tag/v0.10.6
[0.10.5]: https://github.com/duiliuliu/logseq-text-toolkit/releases/tag/v0.10.5
[0.10.4]: https://github.com/duiliuliu/logseq-text-toolkit/releases/tag/v0.10.4
[0.10.3]: https://github.com/duiliuliu/logseq-text-toolkit/releases/tag/v0.10.3
[0.10.2]: https://github.com/duiliuliu/logseq-text-toolkit/releases/tag/v0.10.2
