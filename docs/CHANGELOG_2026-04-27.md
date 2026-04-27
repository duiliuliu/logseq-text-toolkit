# Logseq Text Toolkit 更新日志

## [0.11.4] - 2026-04-27

### 新增
- 实现国际化配置自定义功能，支持通过配置添加新语言
- 支持手动修改语言文件来自定义翻译
- 将语言文件打包到 dist/translations/ 目录下
- 语言下拉选项自动从配置的 meta.language.languages 中加载
- 添加降级机制，当外部语言文件加载失败时使用内置语言

### 改进
- 优化 i18n.ts 实现，支持动态加载语言文件
- 扩展设置类型，添加 LanguageConfig 和 LanguageMeta 接口
- 更新默认设置，包含语言配置
- 优化构建脚本，添加 copy-assets 命令
- 更新 README.md，添加自定义语言使用说明
- 添加 Internationalization-Customization-Plan.md 设计文档

### 技术实现
- 在设置中添加 meta.language 部分，用于管理语言配置
- 实现 loadLanguageFile 函数，从 dist 目录加载语言文件
- 实现 initI18n 函数，在插件启动时初始化语言
- 更新 t 函数，优先使用动态加载的翻译，降级到内置翻译
- 在 GeneralSettings.tsx 中，语言下拉选项从配置中动态获取
