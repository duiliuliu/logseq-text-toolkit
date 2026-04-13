# Logseq Text Toolkit 开发指南

## 1. 项目概述

Logseq Text Toolkit 是一个为 Logseq 提供强大文本格式化功能的插件。本指南将帮助开发者了解项目的开发流程、测试方法和部署步骤。

### 技术栈
- **框架**: Preact + JavaScript
- **构建工具**: Rollup
- **Logseq API**: 0.2.12+
- **官方文档**: https://logseq.github.io/plugins/

## 2. 开发环境设置

### 2.1 环境要求
- Node.js 16.x 或更高版本
- npm 或 yarn
- Git

### 2.2 安装依赖
```bash
git clone https://github.com/duiliuliu/logseq-text-toolkit.git
cd logseq-text-toolkit
npm install
```

### 2.3 项目结构
```
logseq-text-toolkit/
├── src/
│   ├── index.jsx          # 主插件入口文件
│   ├── Toolbar.jsx        # 工具栏组件
│   ├── index.html         # 插件HTML模板
│   └── translations/      # 翻译文件
│       └── zh-CN.json
├── dist/                  # 构建输出目录
├── test.html              # 测试模式页面
├── package.json           # 项目配置
├── rollup.config.js       # Rollup配置
├── README.md              # 中文README
├── README.en.md           # 英文README
├── USER_GUIDE.md          # 用户指南
├── DEVELOPMENT.md         # 开发指南（本文档）
└── CHANGELOG.md           # 更新日志
```

## 3. 开发流程

### 3.1 开发整体节奏

1. **先开发编译可通过**
   - 确保代码无语法错误
   - 运行 `npm run build` 验证构建成功

2. **测试模式验证可通过**
   - 使用测试模式页面验证功能
   - 确保核心功能正常工作

3. **关闭测试模式，通过Logseq验证**
   - 在真实Logseq环境中测试
   - 确保所有功能在Logseq中正常工作

4. **功能验证OK后更新文档**
   - 更新 README.md 和 README.en.md
   - 添加功能操作和效果截图

5. **每次更新记录更新日志**
   - 倒序记录（最新的在最前面）
   - 记录重要变更和功能改进

### 3.2 开发步骤

#### 步骤1：代码开发
```bash
# 编辑代码文件
# 主要在 src/index.jsx 中开发
```

#### 步骤2：编译验证
```bash
# 构建项目
npm run build

# 确保构建成功，没有错误
```

#### 步骤3：测试模式验证
```bash
# 启动本地服务器
npx http-server dist -p 12345

# 在浏览器中打开
# http://127.0.0.1:12345/test.html
```

#### 步骤4：Logseq环境验证
1. 提交代码到 GitHub master 分支
2. 更新 tag 触发 release
3. 等待最新的 release 包产出
4. 在 Logseq 开发者模式中：
   - 先卸载旧版本插件
   - 通过 web url 加载：`https://github.com/duiliuliu/logseq-text-toolkit`

## 4. 测试模式

### 4.1 测试模式概述

测试模式提供了一个本地网页环境，可以在不加载插件到 Logseq 的情况下测试功能，大大降低了测试成本。

### 4.2 测试模式功能

- **一键配置**：无需任何特殊配置即可使用
- **Logseq API Mock**：完整模拟 Logseq 的核心 API
- **核心功能验证**：支持所有文本编辑功能的测试
- **实时反馈**：立即看到操作结果

### 4.3 如何使用测试模式

1. 确保项目已构建：`npm run build`
2. 确保 test.html 在 dist 目录中
3. 启动本地服务器：`npx http-server dist -p 12345`
4. 在浏览器中访问：`http://127.0.0.1:12345/test.html`
5. 在页面中测试所有功能

### 4.4 测试模式验证清单

- [ ] 文本格式化（加粗、斜体、删除线）
- [ ] 背景高亮（红、黄、蓝、绿、紫）
- [ ] 文本颜色（红、黄、蓝、绿、紫）
- [ ] 下划线高亮（红、黄、蓝、绿、紫）
- [ ] Cloze 功能
- [ ] 标注功能
- [ ] 页面评论功能
- [ ] 日记评论功能

## 5. 部署流程

### 5.1 GitHub 部署流程

1. **提交代码到 master 分支**
   ```bash
   git add .
   git commit -m "描述你的变更"
   git push origin master
   ```

2. **创建并推送 tag**
   ```bash
   # 创建 tag（遵循语义化版本）
   git tag v0.10.3
   
   # 推送 tag
   git push origin v0.10.3
   ```

3. **等待 GitHub Actions 自动构建和发布**
   - 查看 Actions 页面：https://github.com/duiliuliu/logseq-text-toolkit/actions
   - 等待 build 和 release 完成

4. **在 Logseq 中测试新版本**
   - 打开 Logseq
   - 进入开发者模式
   - 插件 → 卸载旧版本
   - 从 URL 加载插件：`https://github.com/duiliuliu/logseq-text-toolkit`

### 5.2 版本号规范

遵循语义化版本（Semantic Versioning）：
- **主版本号**：不兼容的 API 修改
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

示例：`v0.10.3`

## 6. 文档更新

### 6.1 更新 README.md 和 README.en.md

在功能验证通过后，需要更新 README 文件：

1. 添加新功能的描述
2. 更新功能列表
3. 添加操作说明
4. 包含效果截图

### 6.2 截图指南

截图应包括：
- 功能操作步骤
- 功能效果展示
- 工具栏显示
- 格式化后的文本效果

截图保存位置：`screenshots/` 目录

### 6.3 截图标准说明

#### 标准清除
- **测试模式**：刷新页面即可清除所有测试数据，确保截图环境干净
- **正式模式**：在 Logseq 中测试时，建议创建新的测试页面，避免干扰现有数据

#### 截图规范
- 使用清晰的分辨率（至少 1920x1080）
- 确保界面元素完整可见
- 突出显示功能效果
- 避免包含敏感信息
- 为截图添加适当的说明文字

#### 测试模式与正式模式的区别
- **测试模式**：本地网页环境，使用模拟的 Logseq API，适合快速功能验证
- **正式模式**：真实的 Logseq 环境，使用实际的 Logseq API，适合最终功能验证

在更新日志和文档中，应明确标注截图是在测试模式还是正式模式下拍摄的

## 7. 更新日志

每次发布新版本时，必须更新 [CHANGELOG.md](file:///workspace/CHANGELOG.md)。

### 7.1 更新日志格式

```markdown
## [版本号] - 日期
### 新增
- 功能描述

### 改进
- 改进描述

### 修复
- 修复描述
```

### 7.2 注意事项

- 倒序记录（最新的在最前面）
- 每个版本有明确的发布日期
- 清晰分类：新增、改进、修复
- 使用简洁明了的描述

## 8. 常见问题

### Q: 本地模式加载失败怎么办？
A: 目前本地模式加载失败，主要依赖 GitHub 加载。请按照部署流程使用 GitHub URL 加载。

### Q: 测试模式如何配置？
A: 测试模式支持一键配置，无需任何特殊配置。直接访问 test.html 即可使用。

### Q: 如何确保代码可编译？
A: 运行 `npm run build` 命令，确保没有错误输出。

### Q: Logseq API 版本要求？
A: 插件要求 Logseq API 版本 0.2.12+。

## 9. 参考资源

- **Logseq 插件 API 文档**: https://logseq.github.io/plugins/
- **Logseq DB 插件 API Skill**: https://github.com/kerim/logseq-db-plugin-api-skill
- **项目仓库**: https://github.com/duiliuliu/logseq-text-toolkit
- **用户指南**: [USER_GUIDE.md](file:///workspace/USER_GUIDE.md)

---

**开发愉快！**
