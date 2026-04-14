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

[0.11.0]: https://github.com/duiliuliu/logseq-text-toolkit/releases/tag/branch-0.11.0