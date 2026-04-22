## [0.11.7] - 2026-04-22
### 改进
- 将设置按钮图片引用改为 SVG 图标
- 优化 Toolbar 点击 more 后的展示逻辑，将所有元素都展示在 Toolbar 上，不折行
- 优化 deploy-pages workflow，参考 branch-release.yml 的配置

### 修复
- 修复 Toolbar 点击 more 后折行问题，让所有元素都在一行展示
- 修复 deploy-pages workflow 的依赖安装问题，添加 NPM_CONFIG_REGISTRY 配置
