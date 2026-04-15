# Logseq Text Toolkit 开发指南

## 1. 项目概述

Logseq Text Toolkit 是一个为 Logseq 提供强大文本格式化功能的插件。本指南将帮助开发者了解项目的开发流程、测试方法和部署步骤。

### 技术栈
- **框架**: React + JavaScript
- **构建工具**: Vite
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
├── src/                  # 源码目录
│   ├── index.html         # 插件HTML模板
│   ├── main.jsx           # 插件主入口文件
│   ├── App.jsx            # 应用主组件
│   ├── index.css          # 全局样式
│   ├── App.css            # 应用样式
│   └── components/        # React 组件（待实现）
├── test/                  # 测试目录
│   ├── test.html          # 测试模式页面
│   ├── css/               # 测试样式
│   │   └── style.css
│   └── mock/              # Mock 数据和 API
│       └── mock.js
├── docs/                  # 文档目录
│   ├── DEVELOPMENT.md     # 开发指南（本文档）
│   ├── USER_GUIDE.md      # 用户指南
│   ├── CHANGELOG_YYYY-MM-DD.md  # 更新日志（带日期）
│   └── branch-YYYY-MM-DD-changelog.md  # 分支更新日志
├── dist/                  # 构建输出目录
├── icon.png               # 插件图标
├── package.json           # 项目配置
├── vite.config.js         # Vite配置
└── .gitignore             # Git忽略文件
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
# 主要在 src/ 目录中开发
```

#### 步骤2：编译验证
```bash
# 构建项目
npm run build

# 确保构建成功，没有错误
```

#### 步骤3：测试模式验证
```bash
# 启动测试模式服务器
npm run test

# 在浏览器中打开
# http://localhost:3000/
```

#### 步骤4：Logseq环境验证
1. 提交代码到 GitHub 分支
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

1. 启动测试模式服务器：`npm run test`
2. 在浏览器中访问：`http://localhost:3000/`
3. 在页面中测试所有功能

### 4.4 测试模式验证清单

- [ ] 文本格式化（加粗、斜体、删除线）
- [ ] 背景高亮（红、黄、蓝、绿、紫）
- [ ] 文本颜色（红、黄、蓝、绿、紫）
- [ ] 下划线高亮（红、黄、蓝、绿、紫）
- [ ] 文件链接功能
- [ ] 评论/注解功能

## 5. 部署流程

### 5.1 GitHub 部署流程

1. **提交代码到分支**
   ```bash
   git add .
   git commit -m "描述你的变更"
   git push origin dev-text-tool
   ```

2. **创建并推送 tag**
   ```bash
   # 创建 tag（遵循语义化版本）
   git tag v0.11.0
   
   # 推送 tag
   git push origin v0.11.0
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

示例：`v0.11.0`

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

## 7. 开发规范

### 7.1 文档管理规范

#### 7.1.1 文档目录结构
所有文档文件必须放置在 `docs/` 目录下，包括：
- `DEVELOPMENT.md` - 开发指南（本文档）
- `USER_GUIDE.md` - 用户指南
- `CHANGELOG_YYYY-MM-DD.md` - 更新日志（带日期）
- `branch-YYYY-MM-DD-changelog.md` - 分支更新日志

#### 7.1.2 更新日志规范

**文件命名规则：**
- 文件名格式：`CHANGELOG_YYYY-MM-DD.md`
- 例如：`CHANGELOG_2026-04-14.md`

**文件内容要求：**
- 首行必须备注：`每天的更新聚合写入一个文件中，倒序写入，只做新增不删除`
- 每天的更新聚合写入一个文件中
- 倒序写入（最新的在最前面）
- 只做新增，不删除历史记录

**更新日志格式：**
```markdown
每天的更新聚合写入一个文件中，倒序写入，只做新增不删除

# Logseq Text Toolkit 更新日志

## [版本号] - 日期
### 新增
- 功能描述

### 改进
- 改进描述

### 修复
- 修复描述
```

#### 7.1.3 用户指南更新规范

**更新时机：**
- 每次有新功能发布时必须更新
- 每次有功能优化时必须更新
- 功能使用方式发生变化时必须更新

**更新内容：**
- 添加新功能的使用说明
- 更新功能列表
- 添加操作步骤
- 包含效果截图
- 更新功能描述

### 7.2 代码结构规范

#### 7.2.1 代码模块化
- 主入口文件 `main.jsx` 应保持简洁，只负责插件初始化和协调
- 业务逻辑应拆分到独立模块中
- 每个模块应有单一职责，便于维护和测试

### 7.3 CSS 样式规范

#### 7.3.1 样式文件结构
- 全局样式：`src/main.css` - 包含主题变量和基础样式
- 组件样式：`src/styles/` 目录下按组件分类
- 主题样式：`src/styles/themes/` 目录下包含 light 和 dark 主题

#### 7.3.2 主题变量
- 使用 CSS 变量定义主题颜色和样式
- 支持从 Logseq 获取主题设置
- 支持手动切换主题（light/dark/system）

#### 7.3.3 样式覆盖
- 可以通过配置覆盖默认样式
- 参考 `https://github.com/duiliuliu/logseq-plugin-files-manager/blob/main/src/main.css` 的实现方式
- 使用 `--ls-primary-background-color-plugin` 等变量确保与 Logseq 主题一致

#### 7.3.4 最佳实践
- 使用 CSS 变量提高可维护性
- 避免硬编码颜色值
- 确保样式在 light 和 dark 主题下都能正常显示
- 保持样式简洁，避免过度使用复杂选择器

### 7.4 图标支持

#### 7.4.1 支持的图标格式
- **SVG 字符串**：直接提供 SVG 代码
- **lucide-react 图标**：使用 lucide-react 图标库中的图标组件

#### 7.4.2 使用 lucide-react 图标
1. 安装 lucide-react 依赖：
   ```bash
   npm install lucide-react
   ```

2. 导入并使用图标：
   ```javascript
   import { Bold, Italic, Underline } from 'lucide-react'
   
   // 在配置中使用
   const toolbarItems = {
     "wrap-bold": {
       "label": "Bold",
       "icon": Bold
     }
   }
   ```

#### 7.4.3 图标大小和对齐
- 图标默认大小为 18x18px
- 所有图标会自动居中对齐
- 对于 SVG 字符串，建议使用 18x18px 的 viewBox 以确保一致的显示效果

## 8. 更新日志

每次发布新版本时，必须更新 `docs/CHANGELOG_YYYY-MM-DD.md`。

### 8.1 更新日志格式

```markdown
## [版本号] - 日期
### 新增
- 功能描述

### 改进
- 改进描述

### 修复
- 修复描述
```

### 8.2 注意事项

- 倒序记录（最新的在最前面）
- 每个版本有明确的发布日期
- 清晰分类：新增、改进、修复
- 使用简洁明了的描述
- 文件名必须包含日期

## 9. 常见问题

### Q: 本地模式加载失败怎么办？
A: 目前本地模式加载失败，主要依赖 GitHub 加载。请按照部署流程使用 GitHub URL 加载。

### Q: 测试模式如何配置？
A: 测试模式支持一键配置，无需任何特殊配置。直接运行 `npm run test` 即可使用。

### Q: 如何确保代码可编译？
A: 运行 `npm run build` 命令，确保没有错误输出。

### Q: Logseq API 版本要求？
A: 插件要求 Logseq API 版本 0.2.12+。

## 10. 参考资源

- **Logseq 插件 API 文档**: https://logseq.github.io/plugins/
- **Logseq DB 插件 API Skill**: https://github.com/kerim/logseq-db-plugin-api-skill
- **Logseq Files Manager 插件**: https://github.com/duiliuliu/logseq-plugin-files-manager/blob/main/src/main.tsx
- **项目仓库**: https://github.com/duiliuliu/logseq-text-toolkit
- **用户指南**: [USER_GUIDE.md](file:///workspace/docs/USER_GUIDE.md)

---

**开发愉快！**