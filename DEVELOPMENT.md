# 开发指南

## 项目结构

```
/workspace
├── src/
│   ├── translations/         # 翻译文件
│   ├── Toolbar.jsx          # 工具栏组件
│   ├── ToolbarItem.jsx      # 工具栏项组件
│   ├── index.html           # 插件入口HTML
│   └── index.jsx            # 插件主逻辑
├── test.html                # 测试模式页面
├── CHANGELOG.md             # 更新日志
├── DEVELOPMENT.md           # 开发指南
├── README.md                # 中文README
├── README.en.md             # 英文README
├── USER_GUIDE.md            # 用户指南
├── package.json             # 项目配置
└── rollup.config.mjs        # Rollup构建配置
```

## 开发流程

1. **代码开发**：在`src`目录中进行代码开发
2. **测试模式验证**：使用`test.html`页面验证功能
3. **构建**：运行`npm run build`构建插件
4. **部署**：提交代码到GitHub，更新tag触发release
5. **安装**：在Logseq开发者模式中通过weburl安装插件

## 测试模式

测试模式页面(`test.html`)用于验证插件的核心功能，包含两个显示区域：

1. **编辑模式**：支持各种编辑输入，以及工具的使用
2. **显示模式**：失去焦点后，该文字的样式体现

### 测试步骤

1. 打开`test.html`页面
2. 在编辑模式中输入文本并选择
3. 使用工具栏进行文本格式化
4. 点击"渲染显示"按钮查看效果
5. 验证样式是否正确显示

## 截图标准

### 截图要求

1. **清晰明了**：确保截图清晰，能够清楚展示功能效果
2. **完整展示**：包含完整的功能界面，避免裁剪重要内容
3. **一致性**：保持截图风格一致，包括分辨率、缩放比例等
4. **标注说明**：对关键功能点进行标注说明

### 截图类型

1. **功能截图**：展示插件的核心功能效果
2. **界面截图**：展示插件的整体界面布局
3. **操作流程截图**：展示功能的操作流程

### 截图工具

- 推荐使用系统自带的截图工具
- 对于复杂操作，可以使用录屏工具记录操作过程

### 截图存储

- 功能截图应添加到`CHANGELOG.md`中
- 界面截图应添加到`README.md`和`README.en.md`中

## 测试模式 vs 正式模式

### 测试模式

- 运行环境：浏览器
- 数据存储：本地临时
- 功能验证：核心功能验证
- 适用场景：开发过程中的快速验证

### 正式模式

- 运行环境：Logseq插件系统
- 数据存储：Logseq数据库
- 功能验证：完整功能验证
- 适用场景：最终用户使用

## 构建和部署

### 构建命令

```bash
npm run build
```

### 热更新开发

1. **启动热更新构建**：
   ```bash
   npm run dev
   ```

2. **启动本地服务**：
   ```bash
   npm run serve
   ```

3. **Logseq插件安装**：
   - 在Logseq开发者模式中，通过weburl加载插件
   - 输入本地服务地址，例如：`http://localhost:3000`
   - 这样可以实时查看代码修改的效果

### 参考项目

参考了 [logseq-plugin-template-react](https://github.com/pengx17/logseq-plugin-template-react) 项目的热更新配置方式。

### 部署流程

1. 提交代码到GitHub master分支
2. 更新tag，触发release
3. 等待最新的release包产出
4. 在Logseq开发者模式、插件、通过weburl加载
5. 输入`https://github.com/duiliuliu/logseq-text-toolkit`链接安装
6. 安装前请卸载旧版本

## 插件API

参考官方文档：[Logseq Plugin API](https://logseq.github.io/plugins/)

### 版本要求

- db对应的版本是0.2.12+