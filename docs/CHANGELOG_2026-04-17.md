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