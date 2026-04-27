# Logseq Text Toolkit

一个功能强大、灵活的Logseq插件，为您的笔记提供丰富的文本格式化和编辑工具。

## 🚀 功能特性

### 核心功能
- **智能选择工具栏**：选中文本时自动弹出，支持智能定位和滚动跟随
- **丰富的文本格式化**：加粗、斜体、下划线、删除线等
- **多彩高亮效果**：黄色、红色、蓝色、绿色、紫色等多种高亮颜色
- **文本颜色设置**：自定义文本颜色
- **彩色下划线**：支持多种颜色的下划线效果
- **Cloze 挖空功能**：快速创建挖空卡片
- **清除格式**：一键清除所有文本格式
- **标注功能**：为选中文本添加标注
- **评论功能**：支持页面内评论和日记评论

### 技术特性
- **主题支持**：浅色和深色模式自动切换
- **系统主题同步**：支持与系统主题同步
- **多语言国际化**：支持中文、英文、日文
- **可自定义配置**：灵活的工具栏配置选项
- **智能定位**：根据可用空间自动显示在选中文本的上方或下方
- **滚动跟踪**：滚动时跟随选中文本
- **iframe 环境支持**：完美兼容 Logseq 插件的 iframe 运行环境
- **自定义语言支持**：支持通过配置添加新语言和修改现有翻译

## 📦 安装方法

### 方法一：通过 Logseq 插件市场安装（推荐）
1. 打开 Logseq
2. 点击右上角菜单 → **插件**
3. 在插件市场中搜索 `logseq-text-toolkit`
4. 点击 **安装**
5. 安装完成后，插件会自动启用

### 方法二：通过 GitHub 链接加载
1. 打开 Logseq
2. 点击右上角菜单 → **插件**
3. 点击 **从 URL 加载插件**
4. 输入插件的 GitHub 链接：`https://github.com/duiliuliu/logseq-text-toolkit/`
5. 点击 **加载**

### 方法三：本地开发模式安装
1. 克隆插件代码到本地：`git clone https://github.com/duiliuliu/logseq-text-toolkit.git`
2. 进入插件目录：`cd logseq-text-toolkit`
3. 安装依赖：`npm install`
4. 构建插件：`npm run build`
5. 在 Logseq 中，点击右上角菜单 → **插件** → **加载未打包的插件**
6. 选择插件的根目录

## 🎯 使用方法

### 基本使用
1. 在 Logseq 中打开任何页面
2. 进入编辑模式
3. **选中需要格式化的文本**
4. 此时会自动弹出格式化工具栏
5. 点击工具栏上的相应按钮进行格式化

### 快捷键
- **斜体**：`mod+shift+i`
- **移除格式**：`mod+shift+x`

### 自定义配置
1. 点击右上角菜单 → **插件**
2. 找到 `logseq-text-toolkit` → 点击 **设置**
3. 根据需要调整各项配置
4. 保存配置

### 自定义语言
Logseq Text Toolkit 支持通过修改语言文件来自定义和添加新语言：

1. **语言文件位置**：语言文件位于插件目录下的 `translations/` 文件夹
2. **编辑现有语言**：直接修改对应的 JSON 文件，然后重新加载插件即可生效
3. **添加新语言**：
   - 在 `translations/` 文件夹中创建新的语言 JSON 文件（例如 `fr.json`）
   - 在插件设置中，找到 `meta.language.languages` 数组，添加新语言配置：
     ```json
     {
       "code": "fr",
       "name": "Français",
       "path": "translations/fr.json"
     }
     ```
   - 重新加载插件
4. **语言选项**：设置中的语言下拉菜单会自动从配置中加载语言选项

## 📚 文档

- [用户指南](docs/USER_GUIDE.md) - 详细的使用说明和功能介绍
- [开发指南](docs/DEVELOPMENT.md) - 开发者文档和贡献指南
- [更新日志](docs/CHANGELOG_2026-04-14.md) - 版本更新历史

## 🛠️ 开发

### 安装依赖
```bash
npm install
```

### 开发服务器
```bash
npm run dev
```

### 测试模式
```bash
npm run test
```

### 构建插件
```bash
npm run build
```

## 🌟 项目结构

```
logseq-text-toolkit/
├── src/
│   ├── components/          # 组件目录
│   │   ├── Toolbar/         # 基础工具栏组件
│   │   ├── SelectToolbar/   # 选择工具栏组件
│   │   ├── SettingsModal/   # 设置模态框组件
│   │   └── Toast/           # 提示消息组件
│   ├── config/              # 配置目录
│   ├── logseq/              # Logseq API 集成
│   ├── hooks/               # 自定义 Hooks
│   ├── utils/               # 工具函数
│   └── test/                # 测试相关
├── docs/                    # 文档目录
└── package.json
```

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。在提交之前，请确保：

1. 代码符合项目的代码风格
2. 所有测试通过
3. 更新相关文档

## 💖 支持

如果您发现这个项目有帮助，请考虑支持开发者：

[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4%EF%B8%8F-pink)](https://duiliuliu.github.io/sponsor-page/)

## 📄 许可证

MIT

---

**祝您使用愉快！** 🎉
