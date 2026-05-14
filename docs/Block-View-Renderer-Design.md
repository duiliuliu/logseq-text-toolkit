# Block View Renderer 设计方案

**版本**: v3.1
**日期**: 2026-05-14
**状态**: 设计中
**分支**: trae/solo-agent-14EEAQ

---

## 1. 概述

Block 视图渲染器允许用户以多种视图（List、Table、Gallery、Board）展示 block 内容，保持原生编辑体验。

### 功能列表

| 功能 | 说明 | 优先级 |
| :--- | :--- | :--- |
| 视图切换Bar | Block上方显示视图选择器 | P0 |
| List 视图 | 默认块列表视图 | P0 |
| Table 视图 | 表格形式，支持列宽调整 | P0 |
| Gallery 视图 | 卡片画廊视图 | P1 |
| Board 视图 | 看板视图 | P2 |

---

## 2. 宏命令格式规范

### 2.1 基础语法

```
{{renderer :blockview [视图类型] [, view=视图类型]}}
```

### 2.2 宏命令组合类型

#### 完整组合表

| # | 宏命令格式 | 说明 | 示例 |
| :--- | :--- | :--- | :--- |
| 1 | `{{renderer :blockview}}` | 最简形式，使用 Settings 默认值 | 默认 List |
| 2 | `{{renderer :blockview list}}` | 位置参数指定视图 | List 视图 |
| 3 | `{{renderer :blockview table}}` | 位置参数指定视图 | Table 视图 |
| 4 | `{{renderer :blockview gallery}}` | 位置参数指定视图 | Gallery 视图 |
| 5 | `{{renderer :blockview board}}` | 位置参数指定视图 | Board 视图 |
| 6 | `{{renderer :blockview, view=list}}` | 命名参数指定视图 | List 视图 |
| 7 | `{{renderer :blockview, view=table}}` | 命名参数指定视图 | Table 视图 |
| 8 | `{{renderer :blockview, view=gallery}}` | 命名参数指定视图 | Gallery 视图 |
| 9 | `{{renderer :blockview, view=board}}` | 命名参数指定视图 | Board 视图 |
| 10 | `{{renderer :blockview table, view=gallery}}` | 位置+命名参数（后者优先） | Gallery 视图 |

#### 参数优先级

```
命名参数 (view=xxx) > 位置参数 (第一个单词) > Settings 默认值
```

### 2.3 使用场景示例

| 场景 | 宏命令 | 说明 |
| :--- | :--- | :--- |
| 快速创建默认视图 | `{{renderer :blockview}}` | 使用 Settings 中配置的默认视图 |
| 固定为表格视图 | `{{renderer :blockview, view=table}}` | 不管 Settings 如何，都显示表格 |
| 团队模板固定视图 | `{{renderer :blockview table}}` | 位置参数方式，语义更明确 |
| 个人偏好覆盖 | `{{renderer :blockview gallery}}` | 当前页面使用画廊，其他页面用默认 |

### 2.4 宏命令参数解析流程

```
┌─────────────────────────────────────────────────────────────────┐
│                    宏命令参数解析流程                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 接收 tokens = ['table', ',', 'view=gallery']                │
│                          │                                      │
│                          ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 步骤1: 解析命名参数 (Named Args)                          │   │
│  │   - 扫描所有形如 key=value 的 tokens                     │   │
│  │   - 提取 view=gallery → argMap.view = 'gallery'          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          │                                      │
│                          ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 步骤2: 解析位置参数 (Positional Args)                     │   │
│  │   - 按顺序扫描非命名参数                                  │   │
│  │   - 第一个有效视图类型作为位置值: 'table'                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          │                                      │
│                          ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 步骤3: 确定最终视图类型                                   │   │
│  │   if (argMap.view exists) → return argMap.view          │   │
│  │   else if (positional view exists) → return it         │   │
│  │   else → return Settings.defaultView                    │   │
│  │                                                         │   │
│  │   本例: argMap.view = 'gallery' → return 'gallery'      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          │                                      │
│                          ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 步骤4: 应用视图样式                                       │   │
│  │   - 添加 class: ltt-gallery-root                        │   │
│  │   - 渲染视图切换 Bar（除非 hideViewBar=true）           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 核心设计

### 2.1 视图切换 Bar

在 block 上方显示紧凑的视图切换工具条，不影响编辑体验：

```
┌─────────────────────────────────┐
│ [📋 List] [📊 Table] [🖼 Gallery] │
└─────────────────────────────────┘
```

#### SVG 图标定义

```typescript
const VIEW_ICONS: Record<ViewType, string> = {
  list: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round">
    <path d="M3 3.5h8"/><path d="M3 7h8"/><path d="M3 10.5h8"/>
    <circle cx="1.5" cy="3.5" r=".5" fill="currentColor" stroke="none"/>
    <circle cx="1.5" cy="7" r=".5" fill="currentColor" stroke="none"/>
    <circle cx="1.5" cy="10.5" r=".5" fill="currentColor" stroke="none"/>
  </svg>`,
  
  table: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
    <rect x="1.5" y="2" width="11" height="10" rx="2"/>
    <path d="M5 2v10"/><path d="M1.5 5.5h11"/>
  </svg>`,
  
  gallery: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
    <rect x="1.5" y="2" width="4" height="4" rx="1"/>
    <rect x="8.5" y="2" width="4" height="4" rx="1"/>
    <rect x="1.5" y="8" width="4" height="4" rx="1"/>
    <rect x="8.5" y="8" width="4" height="4" rx="1"/>
  </svg>`,
  
  board: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
    <rect x="1.5" y="2" width="3" height="10" rx="1"/>
    <rect x="5.5" y="2" width="3" height="7" rx="1"/>
    <rect x="9.5" y="2" width="3" height="8" rx="1"/>
  </svg>`
};
```

#### 视图切换 Bar 样式

```css
.ltt-view-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  margin-bottom: 8px;
  background: var(--ls-secondary-background-color);
  border: 1px solid var(--ls-border-color);
  border-radius: 8px;
  font-size: 12px;
  width: fit-content;
}

.ltt-view-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--ls-secondary-text-color);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.ltt-view-btn:hover {
  background: var(--ls-hover-color);
  color: var(--ls-primary-text-color);
}

.ltt-view-btn.active {
  background: var(--ls-primary-color);
  color: white;
  font-weight: 500;
}

.ltt-view-btn svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}
```

### 2.2 视图类型定义

```typescript
// src/lib/blockView/ViewTypes.ts

export type ViewType = 'list' | 'table' | 'gallery' | 'board';

export interface ViewConfig {
  id: ViewType;
  name: string;
  icon: string;
  cssClass: string;
}

export const VIEW_REGISTRY: Record<ViewType, ViewConfig> = {
  'list': {
    id: 'list',
    name: 'List',
    icon: VIEW_ICONS.list,
    cssClass: 'ltt-list-root',
  },
  'table': {
    id: 'table',
    name: 'Table',
    icon: VIEW_ICONS.table,
    cssClass: 'ltt-table-root',
  },
  'gallery': {
    id: 'gallery',
    name: 'Gallery',
    icon: VIEW_ICONS.gallery,
    cssClass: 'ltt-gallery-root',
  },
  'board': {
    id: 'board',
    name: 'Board',
    icon: VIEW_ICONS.board,
    cssClass: 'ltt-board-root',
  },
};
```

---

## 3. 宏命令注册

### 3.1 注册入口

参考 taskprogress 和 heatmap 的注册模式：

```typescript
// src/lib/blockView/register.ts

import { logseqAPI } from '../../logseq';
import { getDocument } from '../../logseq/utils';
import { getSettingsWithSystem } from '../../settings';
import { VIEW_REGISTRY, ViewType } from './ViewTypes';
import { registerRendererArgModel, splitRendererArgs, parseRendererArgs } from '../render';
import logger from '../logger';

const MACRO_PREFIX = ':blockview';
const PLUGIN_ID = 'text-toolkit-blockview';

registerRendererArgModel(MACRO_PREFIX, { positional: ['view'] });

export function registerBlockView(): void {
  // 注册宏渲染器
  logseqAPI.App.onMacroRendererSlotted(async ({ payload, slot }) => {
    const split = splitRendererArgs(payload.arguments);
    const type = split?.type || '';
    const tokens = split?.tokens || [];
    
    if (!type.startsWith(MACRO_PREFIX)) return;
    
    const blockId = payload.uuid;
    logger.debug('[BlockView] Macro triggered', { blockId, type, tokens });
    
    await renderViewBar(blockId, slot, tokens);
  });
  
  // 注册斜杠命令
  logseqAPI.Editor.registerSlashCommand(
    '[Text Toolkit] Insert Block View',
    async () => {
      const block = await logseqAPI.Editor.getCurrentBlock();
      if (block?.uuid) {
        await logseqAPI.Editor.insertAtEditingCursor(
          `{{renderer ${MACRO_PREFIX}}}`
        );
      }
    }
  );
  
  logger.info('✅ BlockView: Registered successfully');
}
```

### 3.2 渲染视图切换 Bar

```typescript
async function renderViewBar(blockId: string, slot: string, tokens: string[]): Promise<void> {
  const doc = getDocument();
  const containerId = `${PLUGIN_ID}__${slot}`;
  
  // 获取 settings
  const settings = await getSettingsWithSystem();
  const blockViewSettings = settings?.blockView || { defaultView: 'list', hideViewBar: false };
  
  // 如果设置了隐藏视图 Bar，直接返回不渲染
  if (blockViewSettings.hideViewBar) {
    // 但还是要应用视图样式，通过宏参数获取视图类型
    const currentView = getCurrentViewFromParams(tokens, blockViewSettings.defaultView);
    await applyViewStyle(blockId, currentView);
    return;
  }
  
  // 从宏命令参数获取当前视图类型，没有则从 settings 获取默认值
  const currentView = getCurrentViewFromParams(tokens, blockViewSettings.defaultView);
  
  // 生成视图 Bar HTML
  const viewBarHtml = `
    <div class="ltt-view-bar" data-block-id="${blockId}">
      ${Object.values(VIEW_REGISTRY).map(view => `
        <button 
          class="ltt-view-btn ${view.id === currentView ? 'active' : ''}"
          data-view="${view.id}"
          title="${view.name}"
        >
          ${view.icon}
          <span>${view.name}</span>
        </button>
      `).join('')}
    </div>
  `;
  
  // 渲染到 slot
  logseqAPI.provideUI({
    key: containerId,
    slot,
    reset: true,
    template: `<div id="${containerId}">${viewBarHtml}</div>`,
  });
  
  // 立即应用视图样式
  await applyViewStyle(blockId, currentView);
  
  // 绑定点击事件
  setTimeout(() => {
    const container = doc.getElementById(containerId);
    if (container) {
      bindViewEvents(container, blockId);
    }
  }, 1);
}

function getCurrentViewFromParams(tokens: string[], defaultView: ViewType): ViewType {
  const argMap = parseRendererArgs(MACRO_PREFIX, tokens);
  
  // 优先从参数获取
  if (argMap.view && VIEW_REGISTRY[argMap.view as ViewType]) {
    return argMap.view as ViewType;
  }
  
  // 从位置参数获取
  for (const token of tokens) {
    const t = token.trim().toLowerCase();
    if (t && VIEW_REGISTRY[t as ViewType]) {
      return t as ViewType;
    }
  }
  
  // 使用默认值
  return defaultView;
}

async function applyViewStyle(blockId: string, viewType: ViewType): Promise<void> {
  const doc = getDocument();
  
  // 查找 block 元素
  const blockElement = doc.querySelector(`[data-block-id="${blockId}"]`);
  if (!blockElement) {
    logger.warn('[BlockView] Block element not found', { blockId });
    return;
  }
  
  // 定义所有视图 class
  const VIEW_CLASSES = [
    'ltt-list-root',
    'ltt-table-root', 
    'ltt-gallery-root',
    'ltt-board-root'
  ];
  
  // 移除所有旧视图样式
  blockElement.classList.remove(...VIEW_CLASSES);
  
  // 添加新视图样式
  const newClass = `ltt-${viewType}-root`;
  if (!blockElement.classList.contains(newClass)) {
    blockElement.classList.add(newClass);
  }
  
  logger.debug('[BlockView] View style applied', { blockId, viewType });
}

function bindViewEvents(container: HTMLElement, blockId: string): void {
  const buttons = container.querySelectorAll('.ltt-view-btn');
  
  buttons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const viewType = btn.getAttribute('data-view') as ViewType;
      if (!viewType) return;
      
      // 更新 UI 状态
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // 切换视图并更新宏参数
      await switchView(blockId, viewType);
    });
  });
}
```

### 3.3 视图切换核心逻辑（更新宏参数）

使用 `rendererArgs.ts` 中的 `createRendererArgUpdater` 来更新宏参数：

```typescript
import { createRendererArgUpdater } from '../render/rendererArgs';

// 创建 blockview 宏参数更新器
const { updateRendererArgs: updateBlockViewArgs } = createRendererArgUpdater([':blockview']);

async function switchView(blockId: string, viewType: ViewType): Promise<void> {
  const doc = getDocument();
  
  // 1. 查找 block 元素
  const blockElement = doc.querySelector(`[data-block-id="${blockId}"]`);
  if (!blockElement) {
    logger.warn('[BlockView] Block element not found', { blockId });
    return;
  }
  
  // 2. 定义所有视图 class
  const VIEW_CLASSES = [
    'ltt-list-root',
    'ltt-table-root', 
    'ltt-gallery-root',
    'ltt-board-root'
  ];
  
  // 3. 移除所有旧视图样式
  blockElement.classList.remove(...VIEW_CLASSES);
  
  // 4. 添加新视图样式
  const newClass = `ltt-${viewType}-root`;
  if (!blockElement.classList.contains(newClass)) {
    blockElement.classList.add(newClass);
  }
  
  // 5. 更新 block 内容中的宏命令参数
  try {
    const currentBlock = await logseqAPI.Editor.getBlock(blockId);
    if (currentBlock?.content) {
      const updatedContent = updateBlockViewArgs(currentBlock.content, { view: viewType });
      
      if (updatedContent !== currentBlock.content) {
        await logseqAPI.Editor.updateBlock(blockId, updatedContent);
        logger.debug('[BlockView] Macro parameter updated', { blockId, viewType });
      }
    }
  } catch (err) {
    logger.error('[BlockView] Failed to update macro parameter', err);
  }
}
```

---

## 4. Settings 配置

### 4.1 Settings 类型定义

```typescript
// src/settings/types.ts

// 在现有类型定义后添加
export interface BlockViewSettings {
  defaultView: 'list' | 'table' | 'gallery' | 'board';
  hideViewBar: boolean;
}

// 在 Settings 接口中添加
export interface Settings {
  // ... 现有字段
  blockView?: BlockViewSettings;
}
```

### 4.2 BlockViewSettings Tab UI 文本草稿图

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Settings Modal                                         │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │  ⚙️ General   🔧 Toolbar   📊 Task Progress   🌡️ Heatmap   📋 Block View   ⚡ Advanced │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                           │  │
│  │  📋 Block 视图                                                             │  │
│  │                                                                           │  │
│  │  配置 Block 视图模块的全局默认行为                                           │  │
│  │                                                                           │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                                                                     │  │  │
│  │  │  默认视图                                          [▼ List      ▾] │  │  │
│  │  │                                                                     │  │  │
│  │  │  ───────────────────────────────────────────────────────────────   │  │  │
│  │  │                                                                     │  │  │
│  │  │  隐藏视图切换栏                                      [  ○───●  ] │  │  │
│  │  │                                                                     │  │  │
│  │  │  ┌─────────────────────────────────────────────────────────────┐ │  │  │
│  │  │  │ ℹ️ 提示: 隐藏视图切换栏后，将使用默认视图展示，仍然可以      │ │  │  │
│  │  │  │    通过修改宏参数 view=xxx 来切换视图                       │ │  │  │
│  │  │  └─────────────────────────────────────────────────────────────┘ │  │  │
│  │  │                                                                     │  │  │
│  │  └─────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                           │  │
│  │                                                                           │  │
│  │                         [ 💾 保存设置 ]                                    │  │
│  │                                                                           │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

界面说明：
  • Tab 标签栏：点击 "📋 Block View" 切换到此 Tab
  • 说明文字：灰色小字，简短描述此模块功能
  • 设置项容器：带边框的卡片区域
  • 下拉选择器：点击展开可选择 List/Table/Gallery/Board
  • 开关按钮：开启/关闭隐藏视图切换栏功能
  • 提示信息：灰色背景的信息框，解释设置效果
  • 保存按钮：点击后保存所有修改到 Settings
```

### 4.3 BlockViewSettings Tab UI

```tsx
// src/components/SettingsModal/tabs/BlockViewSettings.tsx

import { t } from '../../../translations/i18n';
import CustomSelect from '../../CustomSelect';
import { Settings, BlockViewSettings } from '../../../settings/types';
import { TabComponentProps } from '../index';

function BlockViewSettings({ settings, setSettings, onSave, isSaving, language }: TabComponentProps) {
  const blockViewSettings: BlockViewSettings = settings?.blockView || {
    defaultView: 'list',
    hideViewBar: false,
  };

  const handleSettingChange = (key: keyof BlockViewSettings, value: any) => {
    setSettings(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        blockView: {
          ...blockViewSettings,
          [key]: value,
        },
      };
    });
  };

  const viewOptions = [
    { value: 'list', label: t('settings.blockView.viewList', language) || 'List' },
    { value: 'table', label: t('settings.blockView.viewTable', language) || 'Table' },
    { value: 'gallery', label: t('settings.blockView.viewGallery', language) || 'Gallery' },
    { value: 'board', label: t('settings.blockView.viewBoard', language) || 'Board' },
  ];

  return (
    <div className="ltt-settings-tab-content">
      <p className="ltt-tab-section-description-small">
        {t('settings.blockView.description', language) || 'Configure block view settings'}
      </p>
      
      <div className="ltt-setting-item">
        <label>{t('settings.blockView.defaultView', language) || 'Default view'}</label>
        <CustomSelect
          options={viewOptions}
          value={blockViewSettings.defaultView}
          onChange={(value) => handleSettingChange('defaultView', value)}
        />
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.blockView.hideViewBar', language) || 'Hide view switcher bar'}</label>
        <label className="ltt-switch">
          <input
            type="checkbox"
            checked={blockViewSettings.hideViewBar}
            onChange={(e) => handleSettingChange('hideViewBar', e.target.checked)}
          />
          <span className="ltt-switch-slider"></span>
        </label>
      </div>

      <div style={{ margin: '-8px 0 16px 0', fontSize: '12px', color: 'var(--ls-secondary-text-color-plugin, #999)', lineHeight: 1.4 }}>
        {language?.startsWith('zh') 
          ? '隐藏视图切换栏后，将使用默认视图展示，仍然可以通过修改宏参数 view=xxx 来切换视图'
          : 'When view switcher bar is hidden, default view will be used. You can still switch views by modifying the macro parameter view=xxx'}
      </div>

      <div className="ltt-settings-actions">
        <button 
          className="ltt-settings-btn ltt-settings-btn-save"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? t('settings.saving', language) : t('settings.saveBlockViewSettings', language) || 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

export default BlockViewSettings;
```

### 4.3 更新 SettingsModal 主组件

```tsx
// src/components/SettingsModal/index.tsx

// 1. 导入新组件
import BlockViewSettings from './tabs/BlockViewSettings';

// 2. 在 tabComponents 中添加
const tabComponents: Record<string, React.FC<TabComponentProps>> = {
  general: GeneralSettings,
  toolbar: ToolbarSettings,
  taskProgress: TaskProgressSettings,
  heatmap: HeatmapSettings,
  blockView: BlockViewSettings, // 新增
  advanced: AdvancedSettings,
};

// 3. 在 tabs 配置中添加（在 heatmap 之后添加）
const tabs = [
  { id: 'general', icon: '⚙️', label: 'settings.general' },
  { id: 'toolbar', icon: '🔧', label: 'settings.toolbar' },
  { id: 'taskProgress', icon: '📊', label: 'settings.taskProgress' },
  { id: 'heatmap', icon: '🌡️', label: 'settings.heatmap' },
  { id: 'blockView', icon: '📋', label: 'settings.blockView' }, // 新增
  { id: 'advanced', icon: '⚡', label: 'settings.advanced' },
];
```

---

## 5. 翻译配置

```json
// 在 src/translations/zh-CN.json 中添加
{
  "settings": {
    "blockView": "Block 视图",
    "blockView.description": "配置 Block 视图设置",
    "blockView.defaultView": "默认视图",
    "blockView.viewList": "列表",
    "blockView.viewTable": "表格",
    "blockView.viewGallery": "画廊",
    "blockView.viewBoard": "看板",
    "blockView.hideViewBar": "隐藏视图切换栏",
    "saveBlockViewSettings": "保存设置"
  }
}
```

---

## 6. CSS 架构

### 6.1 显式 Root Class 策略

```css
/* 正确 - 显式 root class，不向上污染 */
.ltt-table-root {
  /* Table 样式 */
}

.ltt-table-root > .block-children-container {
  /* Container 样式 */
}

/* 所有选择器从 root 开始 */
.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block {
  /* Row 样式 */
}
```

### 6.2 Table 视图 CSS

```css
/* src/lib/blockView/css/tableView.css */

.ltt-table-root {
  --ltt-border: rgba(0,0,0,.065);
  --ltt-border-strong: rgba(0,0,0,.1);
  --ltt-hover: rgba(0,0,0,.022);
  --ltt-header-bg: linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.035));
  --ltt-cell-bg: rgba(255,255,255,.55);
  --ltt-radius: 14px;
  --ltt-shadow: 0 1px 2px rgba(0,0,0,.03), 0 8px 24px rgba(0,0,0,.035);
  --ltt-col-1-width: 260px;
  margin: 26px 32px !important;
}

.dark .ltt-table-root {
  --ltt-border: rgba(255,255,255,.075);
  --ltt-border-strong: rgba(255,255,255,.12);
  --ltt-hover: rgba(255,255,255,.03);
  --ltt-header-bg: linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.045));
  --ltt-cell-bg: rgba(255,255,255,.015);
  --ltt-shadow: 0 1px 2px rgba(0,0,0,.35), 0 10px 30px rgba(0,0,0,.28);
}

.ltt-table-root > .block-children-container {
  border: 1px solid var(--ltt-border);
  border-radius: var(--ltt-radius);
  overflow-x: auto;
  background: var(--ltt-cell-bg);
  box-shadow: var(--ltt-shadow);
  padding: 0 !important;
}

.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block {
  display: grid !important;
  grid-template-columns: var(--ltt-col-1-width) repeat(999, minmax(220px,1fr));
  position: relative;
}

.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-main-container {
  position: sticky;
  left: 0;
  z-index: 20;
  width: var(--ltt-col-1-width);
  min-width: var(--ltt-col-1-width);
  background: var(--ltt-header-bg);
  border-right: 2px solid var(--ltt-border-strong);
  font-weight: 600;
  padding: 14px 18px !important;
}

.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-children-container > .block-children > .blocks-list-wrap > .ls-block {
  border-right: 1px solid var(--ltt-border);
  background: var(--ltt-cell-bg);
  padding: 14px 22px !important;
}

/* 隐藏 header 行 bullets */
.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-main-container .block-control-wrap {
  display: none !important;
}

/* 恢复 cell 行 bullets */
.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-children-container > .block-children > .blocks-list-wrap > .ls-block .block-control-wrap {
  display: flex !important;
  opacity: .72;
}
```

### 6.3 Gallery 视图 CSS

```css
.ltt-gallery-root > .block-children-container > .block-children > .blocks-list-wrap {
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(280px,1fr));
  gap: 20px;
  padding: 20px !important;
}

.ltt-gallery-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block {
  background: var(--ls-secondary-background-color);
  border: 1px solid var(--ls-border-color);
  border-radius: 12px;
  padding: 16px !important;
  margin: 0 !important;
  transition: all 0.2s ease;
}

.ltt-gallery-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}
```

### 6.4 Board 视图 CSS

```css
.ltt-board-root > .block-children-container > .block-children > .blocks-list-wrap {
  display: flex !important;
  gap: 20px;
  padding: 20px !important;
  overflow-x: auto;
}

.ltt-board-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block {
  min-width: 300px;
  max-width: 300px;
  background: var(--ls-secondary-background-color);
  border-radius: 12px;
  padding: 12px !important;
  margin: 0 !important;
}
```

### 5.3 视图切换 Bar 渲染流程

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         视图切换 Bar 渲染流程                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  用户输入宏命令                                                                    │
│  {{renderer :blockview, view=table}}                                            │
│          │                                                                       │
│          ▼                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │ Logseq 解析宏命令 → onMacroRendererSlotted 回调触发                        │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│          │                                                                       │
│          ▼                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │ renderViewBar(blockId, slot, tokens)                                     │    │
│  │                                                                         │    │
│  │  1. 获取 Settings: blockView.defaultView, blockView.hideViewBar         │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│          │                                                                       │
│          ▼                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │ 判断 hideViewBar                                                          │    │
│  │                                                                         │    │
│  │  ├── true  → 仅应用视图样式，结束                                         │    │
│  │  │                                                                         │    │
│  │  └── false → 继续渲染视图切换 Bar                                         │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│          │                                                                       │
│          ▼                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │ getCurrentViewFromParams(tokens, defaultView)                            │    │
│  │                                                                         │    │
│  │  参数解析: ['table']                                                     │    │
│  │  ↓                                                                      │    │
│  │  提取 view 参数: 无                                                       │    │
│  │  ↓                                                                      │    │
│  │  扫描位置参数: 'table' 是有效视图 → return 'table'                        │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│          │                                                                       │
│          ▼                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │ generateViewBarHtml(currentView)                                         │    │
│  │                                                                         │    │
│  │  生成 HTML:                                                              │    │
│  │  <div class="ltt-view-bar">                                              │    │
│  │    <button data-view="list">List</button>                               │    │
│  │    <button data-view="table" class="active">Table</button>  ← 高亮当前    │    │
│  │    <button data-view="gallery">Gallery</button>                         │    │
│  │    <button data-view="board">Board</button>                             │    │
│  │  </div>                                                                  │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│          │                                                                       │
│          ▼                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │ logseqAPI.provideUI({ slot, template })                                 │    │
│  │                                                                         │    │
│  │  渲染到 DOM slot 位置                                                    │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│          │                                                                       │
│          ▼                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │ bindViewEvents(container, blockId)                                       │    │
│  │                                                                         │    │
│  │  给每个 button 绑定点击事件                                                │    │
│  │  点击 → switchView(blockId, viewType) → 更新 class 和宏参数                │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│          │                                                                       │
│          ▼                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │ applyViewStyle(blockId, 'table')                                        │    │
│  │                                                                         │    │
│  │  移除: ltt-list-root, ltt-gallery-root, ltt-board-root                 │    │
│  │  添加: ltt-table-root                                                   │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│          │                                                                       │
│          ▼                                                                       │
│      渲染完成                                                                      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 5.4 视图切换核心流程

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         视图切换（点击事件）流程                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  用户点击 "Gallery" 按钮                                                         │
│          │                                                                       │
│          ▼                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │ click event handler                                                      │    │
│  │                                                                         │    │
│  │  1. 更新 UI: 移除其他 active，添加当前 active                             │    │
│  │  2. 调用 switchView(blockId, 'gallery')                                 │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│          │                                                                       │
│          ▼                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │ switchView(blockId, 'gallery')                                           │    │
│  │                                                                         │    │
│  │  1. 查找元素: doc.querySelector('[data-block-id="xxx"]')                │    │
│  │  2. 移除所有视图 class                                                   │    │
│  │  3. 添加新视图 class: ltt-gallery-root                                   │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│          │                                                                       │
│          ▼                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │ 更新 block 内容中的宏命令参数                                              │    │
│  │                                                                         │    │
│  │  原始: {{renderer :blockview, view=table}}                               │    │
│  │  更新: {{renderer :blockview, view=gallery}}  ← 替换 view 参数           │    │
│  │                                                                         │    │
│  │  await logseqAPI.Editor.updateBlock(blockId, updatedContent)            │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│          │                                                                       │
│          ▼                                                                       │
│      完成                                                                       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. 代码修改位置评估

### 6.1 新增文件清单

| 文件路径 | 说明 | 工作量评估 |
| :--- | :--- | :--- |
| `src/lib/blockView/index.ts` | 模块入口 | ★☆☆☆☆ 简单 |
| `src/lib/blockView/register.ts` | 宏命令注册 | ★★☆☆☆ 中等 |
| `src/lib/blockView/ViewTypes.ts` | 类型定义 | ★☆☆☆☆ 简单 |
| `src/lib/blockView/css/tableView.css` | Table 视图样式 | ★★★☆☆ 较复杂 |
| `src/lib/blockView/css/galleryView.css` | Gallery 视图样式 | ★★☆☆☆ 中等 |
| `src/lib/blockView/css/boardView.css` | Board 视图样式 | ★★☆☆☆ 中等 |
| `src/components/SettingsModal/tabs/BlockViewSettings.tsx` | Settings Tab | ★★☆☆☆ 中等 |
| `src/styles/blockView.css` | 视图 Bar 样式 | ★★☆☆☆ 简单 |

### 6.2 需修改的现有文件

| 文件路径 | 修改内容 | 工作量评估 | 风险等级 |
| :--- | :--- | :--- | :--- |
| `src/settings/types.ts` | 添加 BlockViewSettings 类型定义 | ★☆☆☆☆ 简单 | 🟢 低 |
| `src/components/SettingsModal/index.tsx` | 导入并注册 BlockViewSettings Tab | ★★☆☆☆ 简单 | 🟢 低 |
| `src/translations/zh-CN.json` | 添加中文翻译 | ★☆☆☆☆ 简单 | 🟢 低 |
| `src/translations/en.json` | 添加英文翻译 | ★☆☆☆☆ 简单 | 🟢 低 |
| `src/index.tsx` 或主入口 | 调用 registerBlockView() | ★☆☆☆☆ 简单 | 🟢 低 |

### 6.3 依赖关系分析

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              依赖关系图                                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐                                                            │
│  │    src/index    │                                                            │
│  │   (主入口)       │                                                            │
│  └────────┬────────┘                                                            │
│           │ registerBlockView()                                                 │
│           ▼                                                                     │
│  ┌─────────────────────────┐                                                    │
│  │  src/lib/blockView/     │                                                    │
│  │  ├── index.ts           │──┐                                                 │
│  │  ├── register.ts        │◄─┤ 调用                                           │
│  │  └── ViewTypes.ts       │  │                                                 │
│  └────────┬────────────────┘  │                                                 │
│           │                   │                                                 │
│           ▼                   │                                                 │
│  ┌───────────────────────────┼─────────────────────────────────────────┐        │
│  │ src/logseq/utils.ts      │  getDocument()                          │        │
│  └───────────────────────────┼─────────────────────────────────────────┘        │
│                              │                                                 │
│           ┌──────────────────┴──────────────────┐                             │
│           ▼                                     ▼                             │
│  ┌─────────────────────────┐       ┌─────────────────────────────┐            │
│  │ src/settings/           │       │ src/translations/           │            │
│  │ types.ts               │       │ zh-CN.json, en.json         │            │
│  │ (添加 BlockViewSettings)│       │ (添加 blockView 翻译)        │            │
│  └────────┬────────────────┘       └─────────────┬───────────────┘            │
│           │                                       │                             │
│           └───────────────┬───────────────────────┘                             │
│                           │                                                     │
│                           ▼                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  src/components/SettingsModal/                                         │   │
│  │  ├── index.tsx  ── 添加 BlockViewSettings Tab ── tabs/BlockViewSettings.tsx │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 6.4 实现优先级与检查点

#### P0 实现路径（必须）

```
步骤1: 类型定义
  ├── 修改 src/settings/types.ts
  └── 检查点: TypeScript 编译无错误

步骤2: 基础注册
  ├── 创建 src/lib/blockView/ViewTypes.ts
  ├── 创建 src/lib/blockView/index.ts
  ├── 创建 src/lib/blockView/register.ts
  └── 检查点: 宏命令能触发回调

步骤3: 视图切换 UI
  ├── 创建 src/styles/blockView.css
  ├── 实现 renderViewBar()
  ├── 实现 applyViewStyle()
  └── 检查点: 视图切换 Bar 显示正常

步骤4: 视图样式
  ├── 创建 src/lib/blockView/css/tableView.css
  └── 检查点: Table 视图样式正确应用

步骤5: Settings 集成
  ├── 创建 src/components/SettingsModal/tabs/BlockViewSettings.tsx
  ├── 修改 src/components/SettingsModal/index.tsx
  ├── 添加翻译
  └── 检查点: Settings Tab 能保存配置
```

---

## 7. 文件结构

```
src/
├── components/
│   └── SettingsModal/
│       └── tabs/
│           └── BlockViewSettings.tsx  # 新增
│
├── lib/
│   └── blockView/
│       ├── index.ts              # 入口
│       ├── register.ts           # 宏命令注册
│       ├── ViewTypes.ts          # 类型定义
│       └── css/
│           ├── tableView.css
│           ├── galleryView.css
│           └── boardView.css
│
├── settings/
│   └── types.ts                  # 添加 BlockViewSettings 类型
│
└── styles/
    └── blockView.css             # 视图 Bar 样式
```

---

## 8. 实现计划

### P0
- [ ] 宏命令注册 (`{{renderer :blockview}}`)
- [ ] 视图切换 Bar UI
- [ ] List 视图（默认）
- [ ] Table 视图 CSS
- [ ] 视图切换逻辑（带宏参数更新）
- [ ] Settings Tab UI
- [ ] Settings 类型定义

### P1
- [ ] Gallery 视图
- [ ] Table 列宽调整
- [ ] Micro 宏命令参数支持（更多样式参数）

### P2
- [ ] Board 视图
- [ ] 增强美化效果

---

## 9. API 参考

### Logseq API

```typescript
// 宏渲染器
logseqAPI.App.onMacroRendererSlotted(handler)

// 获取 block
logseqAPI.Editor.getBlock(blockId)

// 更新 block 内容
logseqAPI.Editor.updateBlock(blockId, content)

// 工具函数
import { getDocument, getWindow } from '../../logseq/utils'
```

---

**文档结束**
