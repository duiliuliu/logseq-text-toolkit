每天的更新聚合写入一个文件中，倒序写入，只做新增不删除

# Logseq Text Toolkit 更新日志

## [v0.11.3] - 2026-04-17
### 改进
- 优化设置功能，支持系统主题和语言配置同步
- 更新 mock Logseq API 的 getUserConfigs 实现，与官方定义保持一致
- 修改 Settings 类型定义，支持 'system' 作为主题和语言选项
- 改进 useSettings.tsx 中的系统配置同步逻辑
- 从 TestAPP 中移除 SelectToolbar 组件
- 修改 main.tsx，使用 getSettings() 替代 defaultSettings
- 优化 mock provideUI 能力，加载到指定容器且默认不显示
- 优化 SelectToolbar 位置计算，避免遮挡选中文字
- 实现 iframe 环境支持，使用 parent.document
- 创建公共工具函数文件 logseq/utils.ts，提供跨环境工具函数

### 修复
- 修复 SettingsModal 保存后不关闭的问题
- 移除未使用的 resetSettings 功能
- 修复 SelectToolbar 滚动时不跟随的问题
- 修复 SelectToolbar 在 iframe 环境中无法正常工作的问题