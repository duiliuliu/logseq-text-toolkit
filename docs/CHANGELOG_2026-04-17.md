每天的更新聚合写入一个文件中，倒序写入，只做新增不删除

# Logseq Text Toolkit 更新日志

## [v0.11.3] - 2026-04-17
### 改进
- 优化设置功能，支持系统主题和语言配置同步
- 更新 mock Logseq API 的 getUserConfigs 实现，与官方定义保持一致
- 修改 Settings 类型定义，支持 'system' 作为主题和语言选项
- 改进 useSettings.tsx 中的系统配置同步逻辑

### 修复
- 修复 SettingsModal 保存后不关闭的问题
- 移除未使用的 resetSettings 功能

## [v0.11.2] - 2026-04-16
### 改进
- 优化 mock logseq 目录结构，模块化实现各个API
- 完善 mock settings API，使用 localStorage 实现设置持久化
- 更新 useSettings 以使用 logseqAPI 而非全局 logseq 对象

### 修复
- 修复 Toolbar 文本替换功能不触发的问题
- 修复 more 按钮点击不生效的问题
- 修复 Target element undefined 错误

## [v0.11.1] - 2026-04-15
### 改进
- 默认启用赞赏栏
- 优化文本替换逻辑
- 移除不必要的 isTestMode 检查

### 修复
- 修复文本替换时 "选中的文字在块内容中未找到" 错误
- 修复点击事件不响应的问题

## [v0.11.0] - 2026-04-14
### 新增
- 实现 Toolbar 组件的下拉菜单功能
- 添加文本格式化工具（加粗、斜体、删除线等）
- 实现背景高亮和文本颜色功能
- 添加测试模式支持

### 改进
- 优化 Toolbar 组件的事件处理
- 改进文本选择和替换逻辑
- 增加设置面板支持