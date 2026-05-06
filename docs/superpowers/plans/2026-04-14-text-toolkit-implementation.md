# Text Toolkit 插件实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个 Logseq 插件，增强选中文字的编辑体验，包括 toolbar 功能、样式支持和多语言国际化。

**Architecture:** 采用模块化设计，将核心功能拆分为多个独立模块，包括状态管理、工具栏渲染、命令执行、样式管理和国际化支持。使用 React 组件化开发，结合 Logseq API 实现插件功能。

**Tech Stack:** React, Vite, Logseq Plugin API, CSS Modules, i18n

---

## 目录结构设计

```
/src
  /components          # React 组件
    /Toolbar          # 工具栏组件
    /ToolbarItem      # 工具栏项组件
    /Modal            # 弹窗组件
  /utils              # 工具函数
    /commands.js      # 命令注册和执行
    /state.js         # 状态管理
    /styles.js        # 样式管理
    /i18n.js          # 国际化支持
    /annotations.js   # 注解和评论功能
  /translations       # 语言文件
    /en.json          # 英文翻译
    /ja.json          # 日文翻译
    /zh-CN.json       # 中文翻译
  /styles             # 样式文件
    /toolbar.css      # 工具栏样式
    /modal.css        # 弹窗样式
    /themes           # 主题样式
  /hooks              # 自定义 hooks
  main.jsx            # 插件主入口
  App.jsx             # 应用主组件
/public               # 静态资源
  /icons              # 图标文件
```

## 任务分解

### 任务 1: 项目结构搭建

**Files:**
- Create: `/src/components/Toolbar/index.jsx`
- Create: `/src/components/ToolbarItem/index.jsx`
- Create: `/src/components/Modal/index.jsx`
- Create: `/src/utils/commands.js`
- Create: `/src/utils/state.js`
- Create: `/src/utils/styles.js`
- Create: `/src/utils/i18n.js`
- Create: `/src/utils/annotations.js`
- Create: `/src/translations/en.json`
- Create: `/src/translations/ja.json`
- Create: `/src/translations/zh-CN.json`
- Create: `/src/styles/toolbar.css`
- Create: `/src/styles/modal.css`
- Create: `/src/styles/themes/light.css`
- Create: `/src/styles/themes/dark.css`
- Create: `/src/hooks/useLogseq.js`

- [ ] **Step 1: 创建目录结构**

```bash
mkdir -p src/components/{Toolbar,ToolbarItem,Modal} src/utils src/translations src/styles/themes src/hooks
```

- [ ] **Step 2: 创建基础文件**

创建各个目录下的基础文件，包含基本结构和导出语句。

- [ ] **Step 3: 配置 i18n 翻译文件**

在 `translations` 目录下创建三个语言文件，包含基本的翻译内容。

### 任务 2: 核心状态管理

**Files:**
- Modify: `/src/utils/state.js`

- [ ] **Step 1: 实现状态管理功能**

```javascript
// src/utils/state.js

// 全局状态管理
const state = {
  selectedText: '',
  toolbarVisible: false,
  toolbarPosition: { x: 0, y: 0 },
  currentTheme: 'light',
  currentLanguage: 'zh-CN'
};

// 设置选中的文本
export const setSelectedText = (text) => {
  state.selectedText = text;
};

// 获取选中的文本
export const getSelectedText = () => state.selectedText;

// 设置工具栏可见性
export const setToolbarVisible = (visible) => {
  state.toolbarVisible = visible;
};

// 获取工具栏可见性
export const getToolbarVisible = () => state.toolbarVisible;

// 设置工具栏位置
export const setToolbarPosition = (position) => {
  state.toolbarPosition = position;
};

// 获取工具栏位置
export const getToolbarPosition = () => state.toolbarPosition;

// 设置当前主题
export const setCurrentTheme = (theme) => {
  state.currentTheme = theme;
};

// 获取当前主题
export const getCurrentTheme = () => state.currentTheme;

// 设置当前语言
export const setCurrentLanguage = (language) => {
  state.currentLanguage = language;
};

// 获取当前语言
export const getCurrentLanguage = () => state.currentLanguage;

export default state;
```

- [ ] **Step 2: 测试状态管理功能**

编写简单的测试代码，验证状态管理功能是否正常工作。

### 任务 3: 工具栏组件开发

**Files:**
- Modify: `/src/components/Toolbar/index.jsx`
- Modify: `/src/components/ToolbarItem/index.jsx`
- Modify: `/src/styles/toolbar.css`

- [ ] **Step 1: 实现 ToolbarItem 组件**

```jsx
// src/components/ToolbarItem/index.jsx
import React from 'react';
import './index.css';

const ToolbarItem = ({ icon, label, onClick, children, isGroup = false }) => {
  return (
    <div className="toolbar-item" onClick={onClick}>
      {icon && <span className="toolbar-icon">{icon}</span>}
      {label && <span className="toolbar-label">{label}</span>}
      {isGroup && children && (
        <div className="toolbar-group">
          {children}
        </div>
      )}
    </div>
  );
};

export default ToolbarItem;
```

- [ ] **Step 2: 实现 Toolbar 组件**

```jsx
// src/components/Toolbar/index.jsx
import React from 'react';
import ToolbarItem from '../ToolbarItem';
import { getToolbarPosition, getCurrentTheme } from '../../utils/state';
import './index.css';

const Toolbar = ({ items, onItemClick }) => {
  const position = getToolbarPosition();
  const theme = getCurrentTheme();

  return (
    <div 
      className={`toolbar toolbar-${theme}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      {items.map((item, index) => (
        <ToolbarItem
          key={index}
          icon={item.icon}
          label={item.label}
          onClick={() => onItemClick(item.id)}
          isGroup={item.isGroup}
        >
          {item.children && item.children.map((child, childIndex) => (
            <ToolbarItem
              key={childIndex}
              icon={child.icon}
              label={child.label}
              onClick={() => onItemClick(child.id)}
            />
          ))}
        </ToolbarItem>
      ))}
    </div>
  );
};

export default Toolbar;
```

- [ ] **Step 3: 编写工具栏样式**

在 `src/styles/toolbar.css` 中编写工具栏的样式，包括 light 和 dark 主题。

### 任务 4: 弹窗组件开发

**Files:**
- Modify: `/src/components/Modal/index.jsx`
- Modify: `/src/styles/modal.css`

- [ ] **Step 1: 实现 Modal 组件**

```jsx
// src/components/Modal/index.jsx
import React, { useState } from 'react';
import { getCurrentTheme } from '../../utils/state';
import './index.css';

const Modal = ({ title, onClose, onSubmit, placeholder = '请输入内容' }) => {
  const [content, setContent] = useState('');
  const theme = getCurrentTheme();

  const handleSubmit = () => {
    onSubmit(content);
    setContent('');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className={`modal modal-${theme}`}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <textarea
            className="modal-input"
            placeholder={placeholder}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />
        </div>
        <div className="modal-footer">
          <button className="modal-cancel" onClick={onClose}>取消</button>
          <button className="modal-submit" onClick={handleSubmit}>确定</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
```

- [ ] **Step 2: 编写弹窗样式**

在 `src/styles/modal.css` 中编写弹窗的样式，包括 light 和 dark 主题。

### 任务 5: 命令执行功能

**Files:**
- Modify: `/src/utils/commands.js`

- [ ] **Step 1: 实现命令注册和执行**

```javascript
// src/utils/commands.js
import { getSelectedText } from './state';

// 命令定义
const commands = {
  'bold': {
    label: '加粗',
    execute: (text) => `**${text}**`
  },
  'highlight': {
    label: '高亮',
    execute: (text) => `==${text}==`
  },
  'file-link': {
    label: '文件链接',
    execute: (text) => `[[${text}]]`
  },
  'comment': {
    label: '评论',
    execute: (text, comment) => {
      // 这里需要与注解功能集成
      return text;
    }
  }
};

// 注册命令
export const registerCommands = () => {
  Object.keys(commands).forEach((commandId) => {
    try {
      logseq.App.registerCommand({
        id: `text-toolkit:${commandId}`,
        label: commands[commandId].label,
        handler: () => {
          const selectedText = getSelectedText();
          if (selectedText) {
            const result = commands[commandId].execute(selectedText);
            // 这里需要实现替换选中文本的逻辑
            console.log(`执行命令 ${commandId}，结果: ${result}`);
          }
        }
      });
    } catch (error) {
      console.error(`注册命令 ${commandId} 失败:`, error);
    }
  });
};

// 执行命令
export const executeCommand = (commandId, ...args) => {
  if (commands[commandId]) {
    const selectedText = getSelectedText();
    if (selectedText) {
      return commands[commandId].execute(selectedText, ...args);
    }
  }
  return null;
};

export default commands;
```

### 任务 6: 注解和评论功能

**Files:**
- Modify: `/src/utils/annotations.js`

- [ ] **Step 1: 实现注解和评论功能**

```javascript
// src/utils/annotations.js

// 存储注解数据
const annotations = [];

// 添加注解
export const addAnnotation = (text, comment, pageId) => {
  const annotation = {
    id: Date.now().toString(),
    text,
    comment,
    pageId,
    createdAt: new Date().toISOString()
  };
  annotations.push(annotation);
  // 这里需要实现将注解数据保存到 Logseq 页面的逻辑
  return annotation;
};

// 获取页面的注解
export const getAnnotationsByPageId = (pageId) => {
  return annotations.filter(annotation => annotation.pageId === pageId);
};

// 删除注解
export const deleteAnnotation = (annotationId) => {
  const index = annotations.findIndex(annotation => annotation.id === annotationId);
  if (index !== -1) {
    annotations.splice(index, 1);
    // 这里需要实现从 Logseq 页面删除注解数据的逻辑
    return true;
  }
  return false;
};

export default annotations;
```

### 任务 7: 国际化支持

**Files:**
- Modify: `/src/utils/i18n.js`
- Modify: `/src/translations/en.json`
- Modify: `/src/translations/ja.json`
- Modify: `/src/translations/zh-CN.json`

- [ ] **Step 1: 实现 i18n 功能**

```javascript
// src/utils/i18n.js
import { getCurrentLanguage } from './state';
import en from '../translations/en.json';
import ja from '../translations/ja.json';
import zhCN from '../translations/zh-CN.json';

const translations = {
  'en': en,
  'ja': ja,
  'zh-CN': zhCN
};

// 获取翻译
export const t = (key, defaultValue = '') => {
  const lang = getCurrentLanguage();
  const translation = translations[lang] || translations['zh-CN'];
  return translation[key] || defaultValue;
};

// 初始化 i18n
export const initI18n = () => {
  // 这里可以从 Logseq 获取用户的语言设置
  // 暂时使用默认语言
};

export default {
  t,
  initI18n
};
```

- [ ] **Step 2: 配置翻译文件**

在三个语言文件中添加基本的翻译内容。

### 任务 8: 样式管理

**Files:**
- Modify: `/src/utils/styles.js`
- Modify: `/src/styles/themes/light.css`
- Modify: `/src/styles/themes/dark.css`

- [ ] **Step 1: 实现样式管理功能**

```javascript
// src/utils/styles.js
import { getCurrentTheme } from './state';

// 主题样式映射
const themes = {
  light: {
    toolbar: {
      background: '#ffffff',
      border: '1px solid #e0e0e0',
      color: '#333333'
    },
    modal: {
      background: '#ffffff',
      border: '1px solid #e0e0e0',
      color: '#333333'
    }
  },
  dark: {
    toolbar: {
      background: '#333333',
      border: '1px solid #555555',
      color: '#ffffff'
    },
    modal: {
      background: '#333333',
      border: '1px solid #555555',
      color: '#ffffff'
    }
  }
};

// 获取当前主题样式
export const getThemeStyles = () => {
  const theme = getCurrentTheme();
  return themes[theme] || themes.light;
};

// 应用主题样式
export const applyTheme = (theme) => {
  // 这里可以实现动态应用主题样式的逻辑
};

export default {
  getThemeStyles,
  applyTheme
};
```

- [ ] **Step 2: 编写主题样式文件**

在 `light.css` 和 `dark.css` 中编写主题样式。

### 任务 9: 主应用集成

**Files:**
- Modify: `/src/App.jsx`
- Modify: `/src/main.jsx`

- [ ] **Step 1: 更新 App 组件**

```jsx
// src/App.jsx
import React, { useState, useEffect } from 'react';
import Toolbar from './components/Toolbar';
import Modal from './components/Modal';
import { setSelectedText, setToolbarVisible, setToolbarPosition, setCurrentTheme, setCurrentLanguage } from './utils/state';
import { registerCommands, executeCommand } from './utils/commands';
import { addAnnotation } from './utils/annotations';
import { initI18n, t } from './utils/i18n';
import './App.css';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalType, setModalType] = useState('');

  useEffect(() => {
    // 初始化插件
    const initPlugin = async () => {
      try {
        await logseq.ready();
        console.log('Logseq plugin ready');
        
        // 注册命令
        registerCommands();
        
        // 初始化 i18n
        initI18n();
        
        // 获取用户配置
        const userConfigs = await logseq.App.getUserConfigs();
        setCurrentTheme(userConfigs.darkMode ? 'dark' : 'light');
        setCurrentLanguage(userConfigs.preferredLanguage || 'zh-CN');
        
        // 监听选择事件
        logseq.App.on('selectionChange', handleSelectionChange);
        
      } catch (error) {
        console.error('Failed to initialize plugin:', error);
      }
    };
    
    initPlugin();
    
    // 清理
    return () => {
      logseq.App.off('selectionChange');
    };
  }, []);

  const handleSelectionChange = async (e) => {
    try {
      if (e?.text) {
        setSelectedText(e.text);
        setToolbarVisible(true);
        
        // 计算工具栏位置
        if (e?.rect) {
          setToolbarPosition({
            x: e.rect.left,
            y: e.rect.top - 50
          });
        }
      } else {
        setToolbarVisible(false);
      }
    } catch (error) {
      console.error('Error handling selection change:', error);
    }
  };

  const handleToolbarItemClick = (itemId) => {
    switch (itemId) {
      case 'bold':
      case 'highlight':
      case 'file-link':
        const result = executeCommand(itemId);
        if (result) {
          // 这里需要实现替换选中文本的逻辑
          console.log('Command result:', result);
        }
        break;
      case 'comment':
        setModalTitle(t('comment.title', '添加评论'));
        setModalType('comment');
        setIsModalOpen(true);
        break;
      default:
        break;
    }
  };

  const handleModalSubmit = async (content) => {
    if (modalType === 'comment') {
      const selectedText = getSelectedText();
      if (selectedText) {
        // 获取当前页面
        const currentPage = await logseq.Editor.getCurrentPage();
        if (currentPage) {
          addAnnotation(selectedText, content, currentPage.id);
        }
      }
    }
  };

  // 工具栏项配置
  const toolbarItems = [
    {
      id: 'bold',
      icon: 'B',
      label: t('toolbar.bold', '加粗')
    },
    {
      id: 'highlight',
      icon: 'H',
      label: t('toolbar.highlight', '高亮')
    },
    {
      id: 'file-link',
      icon: 'L',
      label: t('toolbar.fileLink', '文件链接')
    },
    {
      id: 'comment',
      icon: 'C',
      label: t('toolbar.comment', '评论')
    }
  ];

  return (
    <div className="App">
      {/* 工具栏 */}
      {getToolbarVisible() && (
        <Toolbar 
          items={toolbarItems} 
          onItemClick={handleToolbarItemClick} 
        />
      )}
      
      {/* 弹窗 */}
      {isModalOpen && (
        <Modal
          title={modalTitle}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
          placeholder={t('modal.placeholder', '请输入内容')}
        />
      )}
    </div>
  );
}

export default App;
```

- [ ] **Step 2: 更新 main.jsx**

```jsx
// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 任务 10: 构建和测试

**Files:**
- Modify: `/package.json`

- [ ] **Step 1: 构建项目**

```bash
npm run build
```

- [ ] **Step 2: 测试插件**

在 Logseq 中安装并测试插件功能。

- [ ] **Step 3: 提交代码**

```bash
git add .
git commit -m "feat: implement text toolkit plugin"
git push origin dev-text-tool
```

---

## 开发指南

### 目录结构

项目采用模块化设计，目录结构如下：

- **src/components/**: 包含所有 React 组件
- **src/utils/**: 包含工具函数和核心逻辑
- **src/translations/**: 包含国际化翻译文件
- **src/styles/**: 包含样式文件
- **src/hooks/**: 包含自定义 hooks

### 开发流程

1. **安装依赖**：`npm install`
2. **开发模式**：`npm run dev`
3. **构建项目**：`npm run build`
4. **测试插件**：在 Logseq 中安装构建后的插件

### 功能扩展

要添加新功能，需要：

1. 在 `src/utils/commands.js` 中添加新命令
2. 在 `src/components/Toolbar/index.jsx` 中添加新的工具栏项
3. 在翻译文件中添加相应的翻译
4. 实现新功能的逻辑

### 主题和国际化

- **主题**：在 `src/styles/themes/` 目录下添加新的主题样式
- **国际化**：在 `src/translations/` 目录下添加新的语言文件

### 最佳实践

1. **模块化**：将功能拆分为独立的模块
2. **类型安全**：使用适当的类型定义
3. **错误处理**：添加适当的错误处理
4. **测试**：为关键功能编写测试
5. **文档**：为代码添加适当的注释和文档

---

## 总结

本实现计划涵盖了 Logseq Text Toolkit 插件的核心功能，包括：

1. 工具栏功能：支持加粗、高亮、文件链接和评论
2. 样式支持：支持 light 和 dark 主题
3. 国际化：支持英文、日文和中文
4. 注解和评论功能：支持对选中文字添加评论

通过模块化设计和组件化开发，插件具有良好的可扩展性，可以轻松添加新功能。