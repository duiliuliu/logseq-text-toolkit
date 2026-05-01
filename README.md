# Logseq Text Toolkit

一个功能强大、灵活的Logseq插件，旨在增强文本编辑和格式化能力，为您的笔记添加丰富的样式和功能。

👉 [在线预览页面](https://duiliuliu.github.io/logseq-text-toolkit/)

## 插件概述

Logseq Text Toolkit 是一个为 Logseq 提供强大文本格式化功能的插件，支持多种文本样式、高亮、颜色和注释功能，帮助用户更高效地编辑和组织笔记内容。

### 主要功能特点：
- ✅ 丰富的文本格式化选项（加粗、斜体、删除线等）
- ✅ 多种颜色的背景高亮
- ✅ 自定义文本颜色
- ✅ 彩色下划线
- ✅ 标注功能
- ✅ 页面和日记评论功能
- ✅ **任务进度追踪**（新增）
  - 微型三色圆环
  - 点阵进度
  - 状态光标
  - 进度胶囊
  - 阶梯进度
- ✅ 支持自定义配置
- ✅ 支持 light/dark 主题
- ✅ 支持多语言国际化（英文、日文、中文）

<table>
  <tr>
    <td align="center">
      <img width="180" alt="image" src="https://github.com/user-attachments/assets/4be36305-3d06-443d-8548-a121894cb46d" />
      <br>文本操作
    </td>
    <td align="center">
      <img width="180" alt="image" src="https://github.com/user-attachments/assets/ff0810d8-b201-4680-b316-683e03013133" />
      <br>文本操作工具栏
    </td>
    <td align="center">
      <img width="180" alt="image" src="https://github.com/user-attachments/assets/8bb1861d-0b07-4056-a6b4-b5ebd40c5e68" />
      <br>任务进度追踪
    </td>
  </tr>
</table>

## 安装方法

### 通过 Logseq 插件市场安装（推荐）
1. 打开 Logseq
2. 点击右上角菜单 → **插件**
3. 在插件市场中搜索 `logseq-text-toolkit`
4. 点击 **安装**
5. 安装完成后，插件会自动启用

### 通过 GitHub 链接加载
1. 打开 Logseq
2. 点击右上角菜单 → **插件**
3. 点击 **从 URL 加载插件**
4. 输入插件的 GitHub 链接：`https://github.com/duiliuliu/logseq-text-toolkit/`
5. 点击 **加载**

### 本地开发模式安装
1. 克隆插件代码到本地：`git clone https://github.com/duiliuliu/logseq-text-toolkit.git`
2. 进入插件目录：`cd logseq-text-toolkit`
3. 安装依赖：`npm install`
4. 构建插件：`npm run build`
5. 在 Logseq 中，点击右上角菜单 → **插件** → **加载未打包的插件**
6. 选择插件的根目录

## 基本使用方法

### 使用工具栏
1. 在 Logseq 中打开任何页面
2. 进入编辑模式
3. **选中需要格式化的文本**
4. 此时会自动弹出格式化工具栏
5. 点击工具栏上的相应按钮进行格式化

### 使用快捷键
- **斜体**：`mod+shift+i`
- **移除格式**：`mod+shift+x`

### 自定义快捷键
1. 点击右上角菜单 → **插件** → 找到 `logseq-text-toolkit` → 点击 **设置**
2. 在配置中找到相应的命令
3. 在 `binding` 字段中设置您想要的快捷键组合
4. 保存配置并重启插件

## 详细功能说明

### 文本格式化功能

#### 基本样式
- **加粗**：选中文本 → 点击工具栏中的加粗按钮 → **粗体文本**
  ![工具栏加粗选项](docs/screenshots/toolbar-bold.png)
- **斜体**：选中文本 → 点击工具栏中的斜体按钮 → *斜体文本*
  ![工具栏斜体选项](docs/screenshots/toolbar-italic.png)
- **删除线**：选中文本 → 点击工具栏中的删除线按钮 → ~~删除线文本~~
- **下标**：选中文本 → 点击工具栏中的下标按钮 → <sub>下标文本</sub>
- **上标**：选中文本 → 点击工具栏中的上标按钮 → <sup>上标文本</sup>
- **代码块**：选中文本 → 点击工具栏中的代码块按钮 → `代码文本`

#### 背景高亮
- **红色高亮**：选中文本 → 点击工具栏中的高亮按钮 → 选择红色
- **黄色高亮**：选中文本 → 点击工具栏中的高亮按钮 → 选择黄色
- **蓝色高亮**：选中文本 → 点击工具栏中的高亮按钮 → 选择蓝色
- **绿色高亮**：选中文本 → 点击工具栏中的高亮按钮 → 选择绿色
- **紫色高亮**：选中文本 → 点击工具栏中的高亮按钮 → 选择紫色
  ![工具栏高亮选项](docs/screenshots/toolbar-highlight.png)

#### 文本颜色
- **红色文本**：选中文本 → 点击工具栏中的文本颜色按钮 → 选择红色
- **黄色文本**：选中文本 → 点击工具栏中的文本颜色按钮 → 选择黄色
- **蓝色文本**：选中文本 → 点击工具栏中的文本颜色按钮 → 选择蓝色
- **绿色文本**：选中文本 → 点击工具栏中的文本颜色按钮 → 选择绿色
- **紫色文本**：选中文本 → 点击工具栏中的文本颜色按钮 → 选择紫色

#### 下划线高亮
- **红色下划线**：选中文本 → 点击工具栏中的下划线按钮 → 选择红色
- **黄色下划线**：选中文本 → 点击工具栏中的下划线按钮 → 选择黄色
- **蓝色下划线**：选中文本 → 点击工具栏中的下划线按钮 → 选择蓝色
- **绿色下划线**：选中文本 → 点击工具栏中的下划线按钮 → 选择绿色
- **紫色下划线**：选中文本 → 点击工具栏中的下划线按钮 → 选择紫色

#### 文件链接功能
- **文件链接**：选中文本 → 点击工具栏中的文件链接按钮 → [[链接文本]]

---

## 📊 任务进度追踪功能

### 功能概述
任务进度追踪功能让您可以在 Logseq 中可视化展示任务完成进度，支持五种不同的展示方式。

### 使用方法
1. 在需要展示进度的父任务块中输入：
   ```
   {{renderer :taskprogress}}
   ```
2. 或者使用斜杠命令：输入 `/` 然后选择「[Text Toolkit] Insert Task Progress」
3. 子任务识别条件（满足任一即可）：
   - 包含 `#task` 标签
   - 块属性中有 `status`

### 示例
```
- 我的项目 {{renderer :taskprogress}}
  - 任务1 #task status:: todo
  - 任务2 #task status:: doing
  - 任务3 #task status:: done
  - 任务4 #task status:: in review
```

### 五种进度展示方式

#### 1. 微型三色圆环 (Mini Circle)
![微型三色圆环](docs/screenshots/task-progress-mini-circle.png)
- SVG 圆环分段展示，每段代表一种状态
- 圆环中心显示完成率或完成数/总数
- 支持显示百分比或分数标签

#### 2. 点阵进度 (Dot Matrix)
![点阵进度](docs/screenshots/task-progress-dot-matrix.png)
- 横向排列的彩色点阵
- 每个点代表一个任务，颜色表示状态
- 任务超过10个时自动显示+N

#### 3. 状态光标 (Status Cursor)
![状态光标](docs/screenshots/task-progress-status-cursor.png)
- 简洁的图标+数字展示方式
- 使用✓(done)、○(doing)、●(todo)等图标
- 鼠标悬停显示详细状态统计

#### 4. 进度胶囊 (Progress Capsule)
![进度胶囊](docs/screenshots/task-progress-capsule.png)
- 胶囊形状的进度条
- 内部进度条分段着色，按状态比例显示
- 右侧显示完成数/总数

#### 5. 阶梯进度 (Step Progress)
![阶梯进度](docs/screenshots/task-progress-step.png)
- 阶梯形状的垂直进度条
- 每级阶梯代表一种状态
- 阶梯高度根据状态数量比例动态变化

### 设置选项
在插件设置中，您可以：
- 选择默认的进度展示方式
- 配置是否显示标签
- 设置标签格式（百分比/分数）
- 自定义各状态的颜色
- 选择尺寸大小（小/中/大）

---

## 开发指南

### 安装依赖
```bash
npm install
```

### 开发服务器
```bash
npm run dev
```

### 构建
```bash
npm run build
```

### 测试模式
```bash
npm run test
```

在浏览器中访问：`http://localhost:3004/` 即可测试插件功能。

## 项目结构

- `src/components/` - 组件目录
  - `Toolbar/` - 基础工具栏组件
  - `SelectToolbar/` - 选择工具栏组件
  - `SettingsModal/` - 设置模态框组件
  - `Toast/` - 提示消息组件

- `src/config/` - 配置目录
  - `useSettings.tsx` - 设置管理
  - `defaultSettings.ts` - 默认设置
  - `types.ts` - 类型定义

- `src/logseq/` - Logseq 相关
  - `index.ts` - Logseq API 管理
  - `mock/` - 模拟 Logseq API
  - `utils.ts` - 工具函数

- `src/test/` - 测试目录
  - `testAPP.tsx` - 测试应用
  - `testData.ts` - 测试数据
  - `components/` - 测试组件
    - `HiccupRenderer/` - Hiccup 渲染器组件

## 配置说明

### 打开配置
1. 点击右上角菜单 → **插件**
2. 找到 `logseq-text-toolkit` → 点击 **设置**

### 主要配置项

#### 基础配置
```json
{
  "disabled": false,          // 是否禁用插件
  "toolbar": true,            // 是否显示工具栏
  "toolbarShortcut": ""       // 工具栏显示/隐藏的快捷键
}
```

#### 包裹命令配置 (wrap-*)
```json
{
  "wrap-bold": {
    "label": "Bold",                // 显示在工具栏的标签
    "binding": "",                  // 快捷键（可选）
    "template": "**$^**",          // 包裹模板，$^ 代表选中的文本
    "icon": "<svg ...></svg>"    // 图标（支持 SVG 字符串或 lucide-react 图标）
  }
}
```

## 自定义样式

### CSS文件替换

Logseq Text Toolkit 支持通过修改CSS文件来自定义插件样式。插件会在启动时尝试加载以下CSS文件：

- `settingsModal.css` - 设置模态框样式
- `modal.css` - 基础模态框样式
- `toolbar.css` - 工具栏样式
- `inlineComment.css` - 行内评论样式
- `customsToolbarItems.css` - 自定义工具栏项目样式

### 使用方法

1. 在插件目录（通常是 `logseq-text-toolkit` 目录）中找到上述CSS文件
2. 修改CSS文件来自定义样式
3. 在Logseq中重新加载插件
4. 插件重新加载后，新的样式立即生效

### 注意事项

- 如果CSS文件不存在，插件会使用内置的CSS样式作为fallback
- 修改CSS文件时，建议保留原始文件的结构和类名，只修改样式属性
- 重新加载插件后，新的样式会立即应用，无需重新构建插件

## 自定义语言

### 语言文件管理

Logseq Text Toolkit 支持通过修改语言文件来自定义和添加新语言。插件会在启动时尝试加载以下语言文件：

- `translations/zh-CN.json` - 中文语言文件
- `translations/en.json` - 英文语言文件
- `translations/ja.json` - 日文语言文件

### 添加新语言

1. 在 `dist/translations/` 目录中创建新的语言文件，如 `fr.json`
2. 修改 `settings.json` 文件，在 `meta.language.languages` 中添加新语言配置：

```json
{
  "meta": {
    "language": {
      "languages": [
        // 现有语言...
        {
          "code": "fr",
          "name": "Français",
          "path": "translations/fr.json"
        }
      ],
      "fallbackLanguage": "zh-CN"
    }
  }
}
```

3. 在 Logseq 中重新加载插件
4. 新语言将出现在设置的语言下拉选项中

### 自定义语言文件

1. 编辑 `dist/translations/` 目录中的语言文件
2. 在 Logseq 中重新加载插件
3. 新的翻译将立即生效

### 注意事项

- 如果语言文件不存在，插件会使用内置的语言文件作为fallback
- 新添加的语言文件必须包含所有必要的翻译键
- 语言文件路径必须是相对于插件根目录的相对路径

## 贡献

欢迎贡献！请随时提交 Pull Request。

## 支持

如果您发现这个项目有帮助，请考虑支持开发者：

[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4%EF%B8%8F-pink)](https://duiliuliu.github.io/sponsor-page/)

## 许可证

MIT
