## [0.11.7] - 2026-04-22
### 改进
- 将设置按钮图片引用改为 SVG 图标
- 优化 Toolbar 点击 more 后的展示逻辑，将所有元素都展示在 Toolbar 上，不折行
- 优化 deploy-pages workflow，参考 branch-release.yml 的配置
- 修改 SelectToolbar 组件，使用 logseqAPI.Editor.getEditingCursorPosition() 获取光标位置
- 添加降级逻辑，当 logseqAPI 失败时使用原来的实现
- 优化 SettingsModal 响应式设计，支持窄屏幕模式下的正常展示
- 将 CSS 配置文件名调整为 customsToolbarItems.css

### 修复
- 修复 Toolbar 点击 more 后折行问题，让所有元素都在一行展示
- 修复 deploy-pages workflow 的依赖安装问题，添加 NPM_CONFIG_REGISTRY 配置
- 修复元素配置后不生效的问题
- 修复背景高亮样式问题，使用 --mark-* 变量替代 --ctl-highlight-color

### 其他
- 将设置模态框中的"工具栏元素配置"改名为"元素配置"
