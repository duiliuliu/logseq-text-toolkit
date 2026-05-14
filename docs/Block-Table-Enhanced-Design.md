# Block Table View 增强方案

**版本**: v3.0
**日期**: 2026-05-14
**状态**: 设计完成
**分支**: trae/solo-agent-14EEAQ

---

## 1. 概述

本方案在 [Block-View-Renderer-Design.md](./Block-View-Renderer-Design.md) 基础上，重点增强 **Table 视图** 的功能：

1. **列宽手动调整** - 每个列都支持拖拽调整宽度，调整后保存到宏命令参数
2. **样式自定义** - 支持宏命令和 Settings 全局设置（宏命令优先级 > Settings）
3. **预设主题与自定义主题** - 简化参数，提供预设主题，自定义参数归为自定义主题

---

## 2. 宏命令设计

### 2.1 宏命令格式

Table 视图通过 `:blockview` 宏命令的参数来配置：

```markdown
{{renderer :blockview table}}
{{renderer :blockview table, theme=notion}}
{{renderer :blockview table, theme=notion, colWidths=[260,200,180,220]}}
```

### 2.2 参数说明

| 参数 | 类型 | 说明 | 默认值 |
| :--- | :--- | :--- | :--- |
| `view` | string | 视图类型 | Settings 中的 defaultView |
| `theme` | string | 预设主题名称 | Settings 中的 defaultTheme |
| `colWidths` | string | 列宽数组，格式 `[w1,w2,w3,...]` | 默认列宽 |

### 2.3 预设主题

| 主题名称 | 说明 |
| :--- | :--- |
| `default` | 默认简约风格 |
| `notion` | Notion 风格 |
| `linear` | Linear 风格 |
| `dark` | 深色主题 |
| `gradient` | 渐变风格 |
| `custom` | 自定义主题（使用以下参数） |

### 2.4 自定义主题参数（仅当 theme=custom 时生效）

| 参数 | 说明 |
| :--- | :--- |
| `headerBg` | 表头背景色 |
| `headerText` | 表头文字颜色 |
| `borderColor` | 边框颜色 |
| `borderRadius` | 圆角大小 |
| `cellBg` | 单元格背景 |
| `cellAltBg` | 斑马纹行背景 |
| `textColor` | 文字颜色 |
| `hoverBg` | 悬停背景 |
| `shadow` | 阴影效果 |
| `stripe` | 是否显示斑马纹 |
| `glass` | 是否启用玻璃态效果 |
| `glow` | 是否启用微光效果 |

### 2.5 示例

#### 基础用法
```markdown
{{renderer :blockview table}}

任务名称 | 负责人 | 状态 | 优先级
任务 A | 张三 | 进行中 | 高
任务 B | 李四 | 已完成 | 中
```

#### 使用预设主题
```markdown
{{renderer :blockview table, theme=notion}}

任务名称 | 负责人 | 状态 | 优先级
任务 A | 张三 | 进行中 | 高
```

#### 自定义主题
```markdown
{{renderer :blockview table, theme=custom, headerBg=#1e293b, headerText=#ffffff, borderColor=#334155, stripe=true}}

任务名称 | 负责人 | 状态 | 优先级
任务 A | 张三 | 进行中 | 高
```

#### 自定义列宽
```markdown
{{renderer :blockview table, colWidths=[260,200,180,220]}}

任务名称 | 负责人 | 状态 | 优先级
任务 A | 张三 | 进行中 | 高
```

---

## 3. Settings 配置

### 3.1 Settings 类型定义

```typescript
// src/settings/types.ts

export interface BlockViewSettings {
  defaultView: 'list' | 'table' | 'gallery' | 'board';
  hideViewBar: boolean;
  defaultTableTheme: 'default' | 'notion' | 'linear' | 'dark' | 'gradient' | 'custom';
  defaultColWidths: number[];
  minColumnWidth: number;
  enableResize: boolean;
  customTheme: TableTheme;
}

export interface TableTheme {
  headerBg: string;
  headerText: string;
  borderColor: string;
  borderRadius: string;
  cellBg: string;
  cellAltBg: string;
  textColor: string;
  hoverBg: string;
  shadow: string;
  stripe: boolean;
  glass: boolean;
  glow: boolean;
}

// 在 Settings 接口中添加
export interface Settings {
  // ... 现有字段
  blockView?: BlockViewSettings;
}
```

### 3.2 BlockViewSettings Tab UI 更新

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
│  │  │ 默认视图                                          [▼ List      ▾]   │  │  │
│  │  ───────────────────────────────────────────────────────────────────────   │  │
│  │  │ 隐藏视图切换栏                                      [  ○───●  ]     │  │  │
│  │  ───────────────────────────────────────────────────────────────────────   │  │
│  │  │ 默认 Table 主题                                   [▼ Default   ▾]   │  │  │
│  │  ───────────────────────────────────────────────────────────────────────   │  │
│  │  │ 最小列宽                                                      [180px]   │  │  │
│  │  ───────────────────────────────────────────────────────────────────────   │  │
│  │  │ 启用列宽调整                                              [✓]         │  │  │
│  │  ───────────────────────────────────────────────────────────────────────   │  │
│  │  │ [展开] 自定义主题配置                                              ▾   │  │  │
│  │  │   表头背景色 [__________] 表头文字色 [__________]                     │  │  │
│  │  │   边框颜色 [__________]  圆角大小 [_____px]                         │  │  │
│  │  │   斑马纹 [✓] 玻璃态 [ ] 微光效果 [ ]                                │  │  │
│  │  └─────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                           │  │
│  │                         [ 💾 保存设置 ]                                    │  │
│  │                                                                           │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Settings Modal Tab 组件

```tsx
// src/components/SettingsModal/tabs/BlockViewSettings.tsx

import { t } from '../../../translations/i18n';
import CustomSelect from '../../CustomSelect';
import { Settings, BlockViewSettings, TableTheme } from '../../../settings/types';
import { TabComponentProps } from '../index';

const DEFAULT_TABLE_THEME: TableTheme = {
  headerBg: '#f8fafc',
  headerText: 'inherit',
  borderColor: '#e2e8f0',
  borderRadius: '12px',
  cellBg: '#ffffff',
  cellAltBg: '#f8fafc',
  textColor: 'inherit',
  hoverBg: '#f1f5f9',
  shadow: '0 1px 3px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.05)',
  stripe: false,
  glass: false,
  glow: false,
};

const THEME_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'notion', label: 'Notion' },
  { value: 'linear', label: 'Linear' },
  { value: 'dark', label: 'Dark' },
  { value: 'gradient', label: 'Gradient' },
  { value: 'custom', label: 'Custom' },
];

function BlockViewSettings({ settings, setSettings, onSave, isSaving, language }: TabComponentProps) {
  const blockViewSettings: BlockViewSettings = settings?.blockView || {
    defaultView: 'list',
    hideViewBar: false,
    defaultTableTheme: 'default',
    defaultColWidths: [260, 200, 180],
    minColumnWidth: 180,
    enableResize: true,
    customTheme: DEFAULT_TABLE_THEME,
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

  const handleCustomThemeChange = (key: keyof TableTheme, value: any) => {
    setSettings(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        blockView: {
          ...blockViewSettings,
          customTheme: {
            ...blockViewSettings.customTheme,
            [key]: value,
          },
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

      <div className="ltt-setting-item">
        <label>{t('settings.blockView.defaultTableTheme', language) || 'Default Table theme'}</label>
        <CustomSelect
          options={THEME_OPTIONS}
          value={blockViewSettings.defaultTableTheme}
          onChange={(value) => handleSettingChange('defaultTableTheme', value)}
        />
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.blockView.minColumnWidth', language) || 'Minimum column width (px)'}</label>
        <input
          type="number"
          value={blockViewSettings.minColumnWidth}
          onChange={(e) => handleSettingChange('minColumnWidth', parseInt(e.target.value))}
        />
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.blockView.enableResize', language) || 'Enable column resizing'}</label>
        <label className="ltt-switch">
          <input
            type="checkbox"
            checked={blockViewSettings.enableResize}
            onChange={(e) => handleSettingChange('enableResize', e.target.checked)}
          />
          <span className="ltt-switch-slider"></span>
        </label>
      </div>

      {blockViewSettings.defaultTableTheme === 'custom' && (
        <div className="ltt-setting-section">
          <p className="ltt-tab-section-title">{t('settings.blockView.customTheme', language) || 'Custom theme'}</p>
          
          <div className="ltt-setting-item">
            <label>Header background</label>
            <input
              type="color"
              value={blockViewSettings.customTheme.headerBg}
              onChange={(e) => handleCustomThemeChange('headerBg', e.target.value)}
            />
          </div>

          <div className="ltt-setting-item">
            <label>Header text</label>
            <input
              type="color"
              value={blockViewSettings.customTheme.headerText}
              onChange={(e) => handleCustomThemeChange('headerText', e.target.value)}
            />
          </div>

          <div className="ltt-setting-item">
            <label>Border color</label>
            <input
              type="color"
              value={blockViewSettings.customTheme.borderColor}
              onChange={(e) => handleCustomThemeChange('borderColor', e.target.value)}
            />
          </div>

          <div className="ltt-setting-item">
            <label>Border radius</label>
            <input
              type="text"
              value={blockViewSettings.customTheme.borderRadius}
              onChange={(e) => handleCustomThemeChange('borderRadius', e.target.value)}
            />
          </div>

          <div className="ltt-setting-item">
            <label>Stripe</label>
            <label className="ltt-switch">
              <input
                type="checkbox"
                checked={blockViewSettings.customTheme.stripe}
                onChange={(e) => handleCustomThemeChange('stripe', e.target.checked)}
              />
              <span className="ltt-switch-slider"></span>
            </label>
          </div>

          <div className="ltt-setting-item">
            <label>Glass effect</label>
            <label className="ltt-switch">
              <input
                type="checkbox"
                checked={blockViewSettings.customTheme.glass}
                onChange={(e) => handleCustomThemeChange('glass', e.target.checked)}
              />
              <span className="ltt-switch-slider"></span>
            </label>
          </div>

          <div className="ltt-setting-item">
            <label>Glow effect</label>
            <label className="ltt-switch">
              <input
                type="checkbox"
                checked={blockViewSettings.customTheme.glow}
                onChange={(e) => handleCustomThemeChange('glow', e.target.checked)}
              />
              <span className="ltt-switch-slider"></span>
            </label>
          </div>
        </div>
      )}

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

---

## 4. 列宽调整功能

### 4.1 列宽拖拽手柄

每个列的右侧都有 Resize Handle，悬停时显示：

```typescript
// src/lib/blockView/resizeHandler.ts

import { getDocument } from '../../logseq/utils';
import { createRendererArgUpdater } from '../render/rendererArgs';

const MIN_WIDTH = 180;
const { updateRendererArgs: updateBlockViewArgs } = createRendererArgUpdater([':blockview']);

export function initTableResizeHandlers(blockId: string) {
  const doc = getDocument();
  const tableRoot = doc.querySelector(`[data-block-id="${blockId}"]`);
  
  if (!tableRoot) return;

  ensureResizeHandles(tableRoot as HTMLElement);
  bindResizeEvents(tableRoot as HTMLElement, blockId);
}

function ensureResizeHandles(root: HTMLElement) {
  const rows = root.querySelectorAll('.ls-block[level="1"]');
  
  rows.forEach((row) => {
    const cells = Array.from(row.children);
    cells.forEach((cell, index) => {
      if (!cell.querySelector('.ltt-resize-handle')) {
        const handle = document.createElement('div');
        handle.className = 'ltt-resize-handle';
        handle.dataset.colIndex = String(index);
        cell.appendChild(handle);
      }
    });
  });
}

function bindResizeEvents(root: HTMLElement, blockId: string) {
  let isDragging = false;
  let currentColIndex = 0;
  let startX = 0;
  let startWidth = 0;
  let currentWidths: number[] = [];

  root.addEventListener('pointerdown', (e) => {
    const handle = e.target.closest('.ltt-resize-handle');
    if (!handle) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    isDragging = true;
    currentColIndex = parseInt(handle.dataset.colIndex || '0');
    
    const firstRow = root.querySelector('.ls-block[level="1"]');
    const cells = firstRow ? Array.from(firstRow.children) : [];
    currentWidths = cells.map(cell => cell.clientWidth);
    
    startX = e.clientX;
    startWidth = currentWidths[currentColIndex];
    
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  });
  
  function onPointerMove(e: PointerEvent) {
    if (!isDragging) return;
    
    const newWidth = Math.max(MIN_WIDTH, startWidth + (e.clientX - startX));
    currentWidths[currentColIndex] = newWidth;
    
    applyColumnWidths(root, currentWidths);
  }
  
  async function onPointerUp() {
    if (!isDragging) return;
    
    isDragging = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    
    await saveColumnWidths(blockId, currentWidths);
  }
}

function applyColumnWidths(root: HTMLElement, widths: number[]) {
  const rows = root.querySelectorAll('.ls-block[level="1"]');
  
  rows.forEach(row => {
    const cells = Array.from(row.children);
    cells.forEach((cell, index) => {
      if (widths[index]) {
        cell.style.width = `${widths[index]}px`;
        cell.style.minWidth = `${widths[index]}px`;
        cell.style.maxWidth = `${widths[index]}px`;
      }
    });
  });
  
  if (widths[0]) {
    root.style.setProperty('--ltt-col-1-width', `${widths[0]}px`);
  }
}

async function saveColumnWidths(blockId: string, widths: number[]) {
  const colWidthsStr = `[${widths.join(',')}]`;
  
  try {
    const currentBlock = await logseqAPI.Editor.getBlock(blockId);
    if (currentBlock?.content) {
      const updatedContent = updateBlockViewArgs(currentBlock.content, { colWidths: colWidthsStr });
      
      if (updatedContent !== currentBlock.content) {
        await logseqAPI.Editor.updateBlock(blockId, updatedContent);
      }
    }
  } catch (err) {
    console.error('[BlockView] Failed to save column widths', err);
  }
}

export function loadColumnWidths(root: HTMLElement, colWidthsStr: string | undefined) {
  if (!colWidthsStr) return;
  
  try {
    const widths = JSON.parse(colWidthsStr) as number[];
    if (Array.isArray(widths)) {
      applyColumnWidths(root, widths);
    }
  } catch (e) {
    console.warn('[BlockView] Failed to parse column widths', e);
  }
}
```

---

## 5. 主题系统

### 5.1 预设主题定义

```typescript
// src/lib/blockView/themes.ts

import { TableTheme } from '../../settings/types';

export const PRESET_THEMES: Record<string, TableTheme> = {
  default: {
    headerBg: '#f8fafc',
    headerText: 'inherit',
    borderColor: '#e2e8f0',
    borderRadius: '12px',
    cellBg: '#ffffff',
    cellAltBg: '#f8fafc',
    textColor: 'inherit',
    hoverBg: '#f1f5f9',
    shadow: '0 1px 3px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.05)',
    stripe: false,
    glass: false,
    glow: false,
  },
  
  notion: {
    headerBg: '#f7f6f3',
    headerText: '#37352f',
    borderColor: '#e9e9e7',
    borderRadius: '6px',
    cellBg: '#ffffff',
    cellAltBg: '#f8fafc',
    textColor: '#37352f',
    hoverBg: '#f7f6f3',
    shadow: '0 1px 2px rgba(0,0,0,0.06)',
    stripe: false,
    glass: false,
    glow: false,
  },
  
  linear: {
    headerBg: 'linear-gradient(135deg, #5e6ad2, #7c3aed)',
    headerText: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: '8px',
    cellBg: '#ffffff',
    cellAltBg: '#f8fafc',
    textColor: '#1a1a1a',
    hoverBg: '#f1f5f9',
    shadow: '0 4px 12px rgba(124,58,237,0.15)',
    stripe: false,
    glass: false,
    glow: true,
  },
  
  dark: {
    headerBg: '#1e293b',
    headerText: '#ffffff',
    borderColor: '#334155',
    borderRadius: '8px',
    cellBg: '#0f172a',
    cellAltBg: '#1e293b',
    textColor: '#e2e8f0',
    hoverBg: '#1e293b',
    shadow: '0 8px 32px rgba(0,0,0,0.3)',
    stripe: true,
    glass: false,
    glow: false,
  },
  
  gradient: {
    headerBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    headerText: '#ffffff',
    borderColor: '#667eea',
    borderRadius: '12px',
    cellBg: '#ffffff',
    cellAltBg: 'rgba(102,126,234,0.05)',
    textColor: '#2d3748',
    hoverBg: 'rgba(102,126,234,0.08)',
    shadow: '0 4px 20px rgba(102,126,234,0.25)',
    stripe: true,
    glass: false,
    glow: true,
  },
};

export function getTheme(themeName: string, customTheme: TableTheme): TableTheme {
  if (themeName === 'custom') {
    return { ...PRESET_THEMES.default, ...customTheme };
  }
  return PRESET_THEMES[themeName] || PRESET_THEMES.default;
}
```

### 5.2 主题应用

```typescript
// src/lib/blockView/themeApplier.ts

import { getTheme } from './themes';
import { getDocument } from '../../logseq/utils';
import { BlockViewSettings } from '../../settings/types';

export function applyTableTheme(
  root: HTMLElement, 
  themeName: string, 
  customTheme: BlockViewSettings['customTheme'],
  macroParams: Record<string, string>
) {
  const theme = getTheme(themeName, customTheme);
  
  // 应用宏命令参数覆盖
  const finalTheme = { ...theme };
  
  if (themeName === 'custom') {
    if (macroParams.headerBg) finalTheme.headerBg = macroParams.headerBg;
    if (macroParams.headerText) finalTheme.headerText = macroParams.headerText;
    if (macroParams.borderColor) finalTheme.borderColor = macroParams.borderColor;
    if (macroParams.borderRadius) finalTheme.borderRadius = macroParams.borderRadius;
    if (macroParams.cellBg) finalTheme.cellBg = macroParams.cellBg;
    if (macroParams.cellAltBg) finalTheme.cellAltBg = macroParams.cellAltBg;
    if (macroParams.textColor) finalTheme.textColor = macroParams.textColor;
    if (macroParams.hoverBg) finalTheme.hoverBg = macroParams.hoverBg;
    if (macroParams.shadow) finalTheme.shadow = macroParams.shadow;
    if (macroParams.stripe) finalTheme.stripe = macroParams.stripe === 'true';
    if (macroParams.glass) finalTheme.glass = macroParams.glass === 'true';
    if (macroParams.glow) finalTheme.glow = macroParams.glow === 'true';
  }
  
  // 应用 CSS 变量
  root.style.setProperty('--ltt-header-bg', finalTheme.headerBg);
  root.style.setProperty('--ltt-header-text', finalTheme.headerText);
  root.style.setProperty('--ltt-border', finalTheme.borderColor);
  root.style.setProperty('--ltt-cell-bg', finalTheme.cellBg);
  root.style.setProperty('--ltt-cell-alt-bg', finalTheme.cellAltBg);
  root.style.setProperty('--ltt-text', finalTheme.textColor);
  root.style.setProperty('--ltt-hover-bg', finalTheme.hoverBg);
  root.style.setProperty('--ltt-radius', finalTheme.borderRadius);
  root.style.setProperty('--ltt-shadow', finalTheme.shadow);
  
  // 应用 class
  root.classList.toggle('ltt-stripe', finalTheme.stripe);
  root.classList.toggle('ltt-glass', finalTheme.glass);
  root.classList.toggle('ltt-glow', finalTheme.glow);
}
```

---

## 6. 完整 Table 视图 CSS

```css
/* src/lib/blockView/css/tableView.css */

.ltt-table-root {
  --ltt-border: #e2e8f0;
  --ltt-border-strong: #cbd5e1;
  --ltt-hover: #f1f5f9;
  --ltt-header-bg: #f8fafc;
  --ltt-header-text: inherit;
  --ltt-cell-bg: #ffffff;
  --ltt-cell-alt-bg: #f8fafc;
  --ltt-text: inherit;
  --ltt-radius: 12px;
  --ltt-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.05);
  --ltt-col-1-width: 260px;
  --ltt-col-min-width: 180px;
  --ltt-transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin: 24px 32px !important;
  position: relative;
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
  grid-template-columns: var(--ltt-col-1-width) repeat(999, minmax(var(--ltt-col-min-width), 1fr));
  position: relative;
  align-items: stretch;
  min-width: 0;
  transition: background var(--ltt-transition);
}

.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-main-container {
  position: sticky;
  left: 0;
  z-index: 20;
  background: var(--ltt-header-bg);
  color: var(--ltt-header-text);
  font-weight: 600;
  border-right: 2px solid var(--ltt-border-strong);
  padding: 14px 18px !important;
}

.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-children-container > .block-children > .blocks-list-wrap > .ls-block {
  border-right: 1px solid var(--ltt-border);
  background: var(--ltt-cell-bg);
  padding: 14px 22px !important;
}

.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block:nth-child(odd) {
  background: var(--ltt-cell-alt-bg);
}

.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block:hover {
  background: var(--ltt-hover-bg);
}

/* 隐藏 header bullets */
.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-main-container .block-control-wrap {
  display: none !important;
}

/* 恢复 cell bullets */
.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-children-container > .block-children > .blocks-list-wrap > .ls-block .block-control-wrap {
  display: flex !important;
  opacity: 0.6;
}

/* Resize Handle */
.ltt-table-root .ltt-resize-handle {
  position: absolute;
  top: 0;
  right: -4px;
  width: 8px;
  height: 100%;
  cursor: col-resize;
  z-index: 50;
  opacity: 0;
  transition: opacity 0.15s ease;
  background: linear-gradient(180deg, rgba(59,130,246,0.3), rgba(59,130,246,0.1));
  border-radius: 0 4px 4px 0;
}

.ltt-table-root:hover .ltt-resize-handle {
  opacity: 1;
}

.ltt-table-root .ltt-resize-handle:hover,
.ltt-table-root .ltt-resize-handle:active {
  opacity: 1;
  background: linear-gradient(180deg, rgba(59,130,246,0.6), rgba(59,130,246,0.4));
}

/* 特殊效果 */
.ltt-table-root.ltt-glass {
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.5);
}

.ltt-table-root.ltt-glow {
  box-shadow: var(--ltt-shadow), 0 0 30px rgba(102,126,234,0.15);
}

.ltt-table-root.ltt-stripe > .block-children-container > .block-children > .blocks-list-wrap > .ls-block:nth-child(odd) {
  background: var(--ltt-cell-alt-bg);
}

/* 响应式 */
@media (max-width: 900px) {
  .ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block {
    grid-template-columns: 1fr !important;
  }
  
  .ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-main-container {
    position: relative !important;
    width: 100% !important;
    border-right: none !important;
    border-bottom: 2px solid var(--ltt-border-strong) !important;
  }
}
```

---

## 7. 参数优先级

1. **宏命令参数**（最高）
2. **Settings 配置**
3. **默认值**

---

## 8. 实现计划

### 阶段一：基础功能
- [ ] 宏命令参数解析与更新（使用 rendererArgs.ts）
- [ ] Table 视图基础布局

### 阶段二：列宽调整
- [ ] Resize Handler 实现
- [ ] 列宽保存到宏参数

### 阶段三：主题系统
- [ ] 预设主题实现
- [ ] 自定义主题支持
- [ ] Settings Modal 集成

### 阶段四：完整测试
- [ ] 功能测试
- [ ] 兼容性测试

---

**文档结束**