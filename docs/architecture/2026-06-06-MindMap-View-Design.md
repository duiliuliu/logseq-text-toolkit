# MindMap 视图设计方案

## 1. 概述

### 1.1 模块定位

MindMap 是 BlockView 系统新增的一个视图模式，用于以幕布风格的思维导图方式展示和编辑块层级结构。主要特点：

- 保持顶部原生 Root 节点与其他视图模式一致
- 下方思维导图区域展示层级关系，支持内联编辑
- 使用 Logseq Editor API 进行数据操作，保持数据一致性
- 与现有的 list/table/gallery/board 视图无缝切换

### 1.2 核心特性

1. **渐进式增强**：不破坏现有架构，仅新增 mindmap 视图模式
2. **幕布风格编辑**：点击节点聚焦编辑，支持快捷键
3. **交互友好**：Hover 显示折叠/展开和添加子节点按钮
4. **数据一致性**：通过 Logseq Editor API 进行所有数据操作
5. **防抖更新**：编辑内容 500ms 后自动保存，减少 API 调用
6. **丰富配色**：支持边框、圆角、字体、背景、连接线等配色调整

### 1.3 与现有 BlockView 的关系

```
BlockView 系统
├── list 视图 (现有)
├── table 视图 (现有)
├── gallery 视图 (现有)
├── board 视图 (现有)
└── mindmap 视图 (新增) ← 本方案
```

### 1.4 视图切换机制

**属性检测**：
- 当 block 的 `view` 属性值为 `ltt-mindmap` 时，启用 mindmap 渲染
- 属性名可在设置中自定义（默认为 `view`）

**切换方式**：
- 通过 BlockView 工具栏（lttviewbar）按钮切换
- 点击按钮时自动更新 block 的 `view` 属性值

## 2. 整体布局设计

### 2.1 总体结构

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Root Node (原生渲染，保持原样)                          │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  分隔线                                                         │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                    MindMap 区域                          │  │
│  │                                                         │  │
│  │              ┌─────────────────────┐                    │  │
│  │              │  Root Node (拷贝)   │──────┬──────▶     │  │
│  │              └─────────────────────┘      │            │  │
│  │                                           │            │  │
│  │                                           ├──────▶    │  │
│  │                                           │            │  │
│  │                                           └──────▶    │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 MindMap 区域详细布局

```
MindMap 区域
├── Root Node (拷贝) ──垂直居中───
│                          │
│                          ├─▶ Child Node 1
│                          │     └─▶ Grand Child 1-1
│                          │
│                          └─▶ Child Node 2
│
└── 连接线
```

### 2.3 交互元素

**节点 Hover 效果**：

```
┌─────────────────────────────────┐
│                                 │
│  [◀]  节点内容  [+]             │
│   │                    │        │
│   │                    └─ 右侧：添加子节点按钮 (Hover 显示)
│   │
│   └─ 左侧：折叠/展开按钮 (Hover 显示)
│
└─────────────────────────────────┘
```

**按钮说明**：
- **[◀]**：折叠/展开子节点（仅在有子节点时显示）
- **[+]**：添加子节点按钮（始终显示在 Hover 状态）

## 3. 组件架构设计

### 3.1 组件层次结构

```
MindMapView (主容器)
├── NativeRootNode (原生 Root 节点 - 保持原样)
├── Divider (分隔线)
└── MindMapCanvas (思维导图画布)
    ├── MindMapRoot (拷贝的 Root 节点 - 垂直居中)
    │   └── [折叠按钮]
    └── ChildNodesContainer (子节点容器)
        ├── ChildNode 1
        │   ├── [展开/折叠按钮]
        │   ├── InlineEditor (内联编辑器)
        │   ├── [添加子节点按钮]
        │   └── GrandChildNodesContainer (孙节点容器)
        │       └── ...
        ├── ChildNode 2
        │   └── ...
        └── ...
```

### 3.2 文件结构

```
src/
├── components/
│   └── BlockView/
│       ├── views/
│       │   ├── MindMapView/
│       │   │   ├── index.tsx                    # 主入口
│       │   │   ├── MindMapView.tsx              # 主容器组件
│       │   │   ├── MindMapCanvas.tsx            # 思维导图画布
│       │   │   ├── MindMapNode.tsx              # 单个节点组件
│       │   │   ├── InlineEditor.tsx             # 内联编辑器
│       │   │   ├── ConnectionLines.tsx          # 连接线渲染
│       │   │   ├── CollapseButton.tsx           # 折叠按钮
│       │   │   ├── AddChildButton.tsx           # 添加子节点按钮
│       │   │   └── mindMapView.css              # 样式文件
│       │   └── ... (其他视图)
│       └── ...
│
├── lib/
│   ├── blockView/
│   │   ├── types.ts                              # 类型定义扩展
│   │   ├── register.ts                           # 注册逻辑更新
│   │   └── mindMap/
│   │       ├── index.ts
│   │       ├── types.ts                          # MindMap 特有类型
│   │       ├── state.ts                          # 状态管理
│   │       ├── blockAPI.ts                       # Logseq Editor API 封装
│   │       └── debounce.ts                       # 防抖工具
│   └── ...
│
├── settings/
│   └── tabs/
│       └── BlockViewSettings.tsx                 # 设置面板更新
│
└── translations/
    ├── zh-CN.json
    ├── en.json
    └── ja.json
```

## 4. 数据模型设计

### 4.1 类型定义扩展

**文件位置**：`src/lib/blockView/mindMap/types.ts`

```typescript
/**
 * MindMap 节点数据结构
 */
export interface MindMapNode {
  uuid: string;
  content: string;
  children: string[]; // 子节点 UUID 列表
  collapsed: boolean;
  level: number;
  parentUuid: string | null;
}

/**
 * MindMap 视图状态
 */
export interface MindMapState {
  rootBlockUuid: string;
  nodes: Map<string, MindMapNode>;
  collapsedNodes: Set<string>;
  editingNode: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * MindMap 配色方案
 */
export interface MindMapColorScheme {
  // 节点样式
  nodeBorderColor: string;
  nodeBorderWidth: string;
  nodeBorderRadius: string;
  nodeBackgroundColor: string;
  nodeHoverBackgroundColor: string;
  
  // 文字样式
  textColor: string;
  textHoverColor: string;
  fontSize: string;
  fontWeight: string;
  
  // 连接线样式
  lineColor: string;
  lineWidth: string;
  lineStyle: 'solid' | 'dashed' | 'dotted';
  
  // 整体背景
  backgroundColor: string;
  
  // 按钮样式
  buttonColor: string;
  buttonHoverColor: string;
}

/**
 * MindMap 预设主题
 */
export type MindMapThemeName = 'pure' | 'outline' | 'plain' | 'ink' | 'parchment' | 'mist' | 'focus' | 'deep' | 'night';

/**
 * MindMap 预设主题配置
 */
export interface MindMapTheme {
  name: MindMapThemeName;
  label: string;
  scheme: MindMapColorScheme;
}

/**
 * MindMap 配置
 */
export interface MindMapConfig {
  debounceDelay: number; // 默认 500ms
  nodeSpacing: number;
  theme: MindMapThemeName;
  customColors: Partial<MindMapColorScheme>;
}
```

### 4.2 预设主题配置

**文件位置**：`src/lib/blockView/mindMap/themes.ts`

```typescript
import type { MindMapTheme, MindMapColorScheme } from './types';

/**
 * 默认配色方案
 */
const defaultScheme: MindMapColorScheme = {
  nodeBorderColor: '#e2e8f0',
  nodeBorderWidth: '1px',
  nodeBorderRadius: '6px',
  nodeBackgroundColor: '#ffffff',
  nodeHoverBackgroundColor: '#f8fafc',
  textColor: '#374151',
  textHoverColor: '#1f2937',
  fontSize: '14px',
  fontWeight: '400',
  lineColor: '#cbd5e1',
  lineWidth: '2px',
  lineStyle: 'solid',
  backgroundColor: 'transparent',
  buttonColor: '#9ca3af',
  buttonHoverColor: '#374151',
};

/**
 * 预设主题列表
 */
export const MIND_MAP_THEMES: Record<string, MindMapTheme> = {
  pure: {
    name: 'pure',
    label: '纯境',
    scheme: {
      ...defaultScheme,
      nodeBorderColor: 'transparent',
      lineColor: '#e5e7eb',
    },
  },
  outline: {
    name: 'outline',
    label: '明线',
    scheme: {
      ...defaultScheme,
      nodeBorderRadius: '0px',
      lineColor: '#d1d5db',
    },
  },
  plain: {
    name: 'plain',
    label: '素页',
    scheme: {
      ...defaultScheme,
      nodeBackgroundColor: '#1f2937',
      nodeHoverBackgroundColor: '#374151',
      textColor: '#f9fafb',
      textHoverColor: '#ffffff',
      lineColor: '#4b5563',
    },
  },
  ink: {
    name: 'ink',
    label: '墨稿',
    scheme: {
      ...defaultScheme,
      nodeBorderColor: '#d1d5db',
      nodeBorderRadius: '4px',
      lineColor: '#e5e7eb',
    },
  },
  parchment: {
    name: 'parchment',
    label: '雁皮',
    scheme: {
      ...defaultScheme,
      nodeBorderColor: '#d6d3d1',
      nodeBackgroundColor: '#fafaf9',
      nodeHoverBackgroundColor: '#f5f5f4',
      textColor: '#44403c',
      lineColor: '#d6d3d1',
    },
  },
  mist: {
    name: 'mist',
    label: '薄雾',
    scheme: {
      ...defaultScheme,
      nodeBorderColor: '#94a3b8',
      nodeBackgroundColor: '#f8fafc',
      nodeHoverBackgroundColor: '#f1f5f9',
      textColor: '#1e293b',
      lineColor: '#cbd5e1',
    },
  },
  focus: {
    name: 'focus',
    label: '焦点',
    scheme: {
      ...defaultScheme,
      nodeBackgroundColor: '#111827',
      nodeHoverBackgroundColor: '#1f2937',
      textColor: '#d1d5db',
      textHoverColor: '#ffffff',
      lineColor: '#374151',
    },
  },
  deep: {
    name: 'deep',
    label: '深潜',
    scheme: {
      ...defaultScheme,
      nodeBorderColor: '#6366f1',
      nodeBackgroundColor: '#0f172a',
      nodeHoverBackgroundColor: '#1e293b',
      textColor: '#c7d2fe',
      lineColor: '#4f46e5',
    },
  },
  night: {
    name: 'night',
    label: '夜图',
    scheme: {
      ...defaultScheme,
      nodeBorderColor: '#a855f7',
      nodeBackgroundColor: '#18181b',
      nodeHoverBackgroundColor: '#27272a',
      textColor: '#ddd6fe',
      lineColor: '#7c3aed',
    },
  },
};
```

### 4.3 状态管理

**文件位置**：`src/lib/blockView/mindMap/state.ts`

```typescript
import { logseqAPI } from '../../../logseq';
import type { MindMapNode, MindMapState } from './types';
import logger from '../../logger';

export class MindMapStateManager {
  private state: MindMapState;
  private listeners: Set<(state: MindMapState) => void>;

  constructor(rootUuid: string) {
    this.state = {
      rootBlockUuid: rootUuid,
      nodes: new Map(),
      collapsedNodes: new Set(),
      editingNode: null,
      isLoading: false,
      error: null,
    };
    this.listeners = new Set();
  }

  subscribe(listener: (state: MindMapState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  setState(updater: Partial<MindMapState> | ((state: MindMapState) => Partial<MindMapState>)): void {
    const updates = typeof updater === 'function' ? updater(this.state) : updater;
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  getState(): MindMapState {
    return this.state;
  }

  /**
   * 从 Logseq 加载节点树
   */
  async loadTree(): Promise<void> {
    this.setState({ isLoading: true, error: null });

    try {
      const nodes = new Map<string, MindMapNode>();
      await this.loadNodeRecursive(this.state.rootBlockUuid, nodes, 0);
      
      this.setState({
        nodes,
        isLoading: false,
      });
    } catch (error) {
      logger.error('[MindMap] Failed to load tree:', error);
      this.setState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private async loadNodeRecursive(
    uuid: string,
    nodes: Map<string, MindMapNode>,
    level: number
  ): Promise<void> {
    const block = await logseqAPI.Editor.getBlock(uuid, {
      includeChildren: true,
    });

    if (!block) {
      logger.warn('[MindMap] Block not found:', uuid);
      return;
    }

    const node: MindMapNode = {
      uuid: block.uuid,
      content: block.content || block.title || '',
      children: [],
      collapsed: block['collapsed?'] || false,
      level,
      parentUuid: level === 0 ? null : block.parent?.uuid || null,
    };

    // 递归加载子节点
    if (block.children && Array.isArray(block.children)) {
      for (const child of block.children) {
        const childUuid = typeof child === 'string' ? child : child.uuid;
        if (childUuid) {
          node.children.push(childUuid);
          await this.loadNodeRecursive(childUuid, nodes, level + 1);
        }
      }
    }

    nodes.set(uuid, node);
  }
}
```

## 5. Logseq Editor API 封装

### 5.1 API 封装层

**文件位置**：`src/lib/blockView/mindMap/blockAPI.ts`

```typescript
import { logseqAPI } from '../../../logseq';
import logger from '../../logger';

/**
 * Logseq Editor API 封装
 */
export class MindMapBlockAPI {
  /**
   * 获取块及其子节点
   */
  static async getBlock(uuid: string, includeChildren: boolean = true) {
    return await logseqAPI.Editor.getBlock(uuid, { includeChildren });
  }

  /**
   * 更新块内容
   */
  static async updateBlock(uuid: string, content: string): Promise<void> {
    try {
      await logseqAPI.Editor.updateBlock(uuid, content);
      logger.debug('[MindMap] Block updated:', uuid);
    } catch (error) {
      logger.error('[MindMap] Failed to update block:', error);
      throw error;
    }
  }

  /**
   * 添加子节点
   */
  static async addChild(parentUuid: string, content: string = ''): Promise<string | null> {
    try {
      const newBlock = await logseqAPI.Editor.insertBlock(
        parentUuid,
        content,
        {
          before: false,
          sibling: false,
        }
      );

      if (newBlock && newBlock.uuid) {
        logger.debug('[MindMap] Child block added:', newBlock.uuid);
        return newBlock.uuid;
      }

      return null;
    } catch (error) {
      logger.error('[MindMap] Failed to add child:', error);
      throw error;
    }
  }

  /**
   * 删除块及其子节点
   */
  static async removeBlock(uuid: string): Promise<void> {
    try {
      await logseqAPI.Editor.removeBlock(uuid);
      logger.debug('[MindMap] Block removed:', uuid);
    } catch (error) {
      logger.error('[MindMap] Failed to remove block:', error);
      throw error;
    }
  }

  /**
   * 设置块折叠状态
   */
  static async setCollapsed(uuid: string, collapsed: boolean): Promise<void> {
    try {
      logger.debug('[MindMap] Set collapsed:', uuid, collapsed);
    } catch (error) {
      logger.error('[MindMap] Failed to set collapsed:', error);
    }
  }
}
```

### 5.2 防抖更新工具

**文件位置**：`src/lib/blockView/mindMap/debounce.ts`

```typescript
/**
 * 防抖函数工厂
 */
export function createDebounceFn<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debouncedFn = (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };

  debouncedFn.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debouncedFn;
}
```

## 6. 核心组件实现设计

### 6.1 MindMapView 主容器

**文件位置**：`src/components/BlockView/views/MindMapView/MindMapView.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { MindMapStateManager } from '../../../../lib/blockView/mindMap/state';
import { MindMapCanvas } from './MindMapCanvas';
import { getSettingsWithSystem } from '../../../../settings';
import type { MindMapColorScheme, MindMapThemeName } from '../../../../lib/blockView/mindMap/types';
import { MIND_MAP_THEMES } from '../../../../lib/blockView/mindMap/themes';
import './mindMapView.css';

interface MindMapViewProps {
  rootUuid: string;
}

export function MindMapView({ rootUuid }: MindMapViewProps) {
  const [stateManager] = useState(() => new MindMapStateManager(rootUuid));
  const [state, setState] = useState(stateManager.getState());
  const [colorScheme, setColorScheme] = useState<MindMapColorScheme>(MIND_MAP_THEMES.pure.scheme);

  useEffect(() => {
    return stateManager.subscribe(newState => {
      setState(newState);
    });
  }, [stateManager]);

  useEffect(() => {
    stateManager.loadTree();
  }, [stateManager]);

  useEffect(() => {
    async function loadSettings() {
      const settings = await getSettingsWithSystem();
      const themeName = settings?.blockView?.mindMap?.theme as MindMapThemeName || 'pure';
      const customColors = settings?.blockView?.mindMap?.customColors as Partial<MindMapColorScheme> || {};
      
      const themeScheme = MIND_MAP_THEMES[themeName]?.scheme || MIND_MAP_THEMES.pure.scheme;
      setColorScheme({ ...themeScheme, ...customColors });
    }
    loadSettings();
  }, []);

  return (
    <div className="ltt-mindmap-view" style={{
      '--mindmap-bg-color': colorScheme.backgroundColor,
      '--mindmap-node-border-color': colorScheme.nodeBorderColor,
      '--mindmap-node-border-width': colorScheme.nodeBorderWidth,
      '--mindmap-node-border-radius': colorScheme.nodeBorderRadius,
      '--mindmap-node-bg-color': colorScheme.nodeBackgroundColor,
      '--mindmap-node-hover-bg-color': colorScheme.nodeHoverBackgroundColor,
      '--mindmap-text-color': colorScheme.textColor,
      '--mindmap-text-hover-color': colorScheme.textHoverColor,
      '--mindmap-font-size': colorScheme.fontSize,
      '--mindmap-font-weight': colorScheme.fontWeight,
      '--mindmap-line-color': colorScheme.lineColor,
      '--mindmap-line-width': colorScheme.lineWidth,
      '--mindmap-line-style': colorScheme.lineStyle,
      '--mindmap-button-color': colorScheme.buttonColor,
      '--mindmap-button-hover-color': colorScheme.buttonHoverColor,
    } as React.CSSProperties}>
      <hr className="ltt-mindmap-divider" />
      <MindMapCanvas state={state} stateManager={stateManager} />
    </div>
  );
}
```

### 6.2 MindMapCanvas 画布组件

**文件位置**：`src/components/BlockView/views/MindMapView/MindMapCanvas.tsx`

```typescript
import React from 'react';
import type { MindMapState, MindMapStateManager } from '../../../../lib/blockView/mindMap/types';
import { MindMapNode } from './MindMapNode';
import { ConnectionLines } from './ConnectionLines';

interface MindMapCanvasProps {
  state: MindMapState;
  stateManager: MindMapStateManager;
}

export function MindMapCanvas({ state, stateManager }: MindMapCanvasProps) {
  const { nodes, rootBlockUuid } = state;
  const rootNode = nodes.get(rootBlockUuid);

  if (!rootNode) {
    return <div className="ltt-mindmap-loading">Loading...</div>;
  }

  return (
    <div className="ltt-mindmap-canvas">
      <ConnectionLines nodes={nodes} rootUuid={rootBlockUuid} />
      
      <div className="ltt-mindmap-nodes">
        <div className="ltt-mindmap-root-wrapper">
          <MindMapNode
            node={rootNode}
            state={state}
            stateManager={stateManager}
            isRoot={true}
          />
          
          <div className="ltt-mindmap-children">
            {rootNode.children.map(childUuid => {
              const childNode = nodes.get(childUuid);
              return childNode ? (
                <MindMapNode
                  key={childUuid}
                  node={childNode}
                  state={state}
                  stateManager={stateManager}
                  isRoot={false}
                />
              ) : null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 6.3 MindMapNode 节点组件

**文件位置**：`src/components/BlockView/views/MindMapView/MindMapNode.tsx`

```typescript
import React, { useCallback, useState, useEffect } from 'react';
import type { MindMapNode as MindMapNodeType, MindMapState, MindMapStateManager } from '../../../../lib/blockView/mindMap/types';
import { MindMapBlockAPI } from '../../../../lib/blockView/mindMap/blockAPI';
import { createDebounceFn } from '../../../../lib/blockView/mindMap/debounce';
import { CollapseButton } from './CollapseButton';
import { AddChildButton } from './AddChildButton';
import { InlineEditor } from './InlineEditor';

interface MindMapNodeProps {
  node: MindMapNodeType;
  state: MindMapState;
  stateManager: MindMapStateManager;
  isRoot: boolean;
}

export function MindMapNode({ node, state, stateManager, isRoot }: MindMapNodeProps) {
  const [isHovered, setIsHovered] = useState(false);

  const debouncedUpdate = useCallback(
    createDebounceFn(
      (uuid: string, content: string) => {
        MindMapBlockAPI.updateBlock(uuid, content);
      },
      500
    ),
    []
  );

  useEffect(() => {
    return () => debouncedUpdate.cancel();
  }, [debouncedUpdate]);

  const handleContentChange = useCallback(
    (content: string) => {
      stateManager.setState(prev => ({
        nodes: new Map(prev.nodes).set(node.uuid, {
          ...prev.nodes.get(node.uuid)!,
          content,
        }),
      }));
      debouncedUpdate(node.uuid, content);
    },
    [node.uuid, stateManager, debouncedUpdate]
  );

  const handleAddChild = useCallback(async () => {
    try {
      const newUuid = await MindMapBlockAPI.addChild(node.uuid, '');
      if (newUuid) {
        await stateManager.loadTree();
        setTimeout(() => {
          stateManager.setState({ editingNode: newUuid });
        }, 100);
      }
    } catch (error) {
      console.error('Failed to add child:', error);
    }
  }, [node.uuid, stateManager]);

  const handleToggleCollapse = useCallback(() => {
    const newCollapsed = !node.collapsed;
    stateManager.setState(prev => ({
      nodes: new Map(prev.nodes).set(node.uuid, {
        ...prev.nodes.get(node.uuid)!,
        collapsed: newCollapsed,
      }),
    }));
    MindMapBlockAPI.setCollapsed(node.uuid, newCollapsed);
  }, [node.uuid, node.collapsed, stateManager]);

  const hasChildren = node.children.length > 0;
  const isCollapsed = node.collapsed;

  return (
    <div
      className={`ltt-mindmap-node ${isRoot ? 'ltt-mindmap-node-root' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="ltt-mindmap-node-content">
        {hasChildren && (
          <CollapseButton
            collapsed={isCollapsed}
            onClick={handleToggleCollapse}
            visible={isHovered || isCollapsed}
          />
        )}

        <InlineEditor
          content={node.content}
          onChange={handleContentChange}
          onFocus={() => stateManager.setState({ editingNode: node.uuid })}
          onBlur={() => stateManager.setState({ editingNode: null })}
          placeholder="请输入文字"
        />

        <AddChildButton
          onClick={handleAddChild}
          visible={isHovered}
        />
      </div>

      {hasChildren && !isCollapsed && (
        <div className="ltt-mindmap-node-children">
          {node.children.map(childUuid => {
            const childNode = state.nodes.get(childUuid);
            return childNode ? (
              <MindMapNode
                key={childUuid}
                node={childNode}
                state={state}
                stateManager={stateManager}
                isRoot={false}
              />
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}
```

### 6.4 InlineEditor 内联编辑器

**文件位置**：`src/components/BlockView/views/MindMapView/InlineEditor.tsx`

```typescript
import React, { forwardRef, useCallback } from 'react';

interface InlineEditorProps {
  content: string;
  onChange: (content: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
}

export const InlineEditor = forwardRef<HTMLDivElement, InlineEditorProps>(
  ({ content, onChange, onFocus, onBlur, placeholder }, ref) => {
    const handleInput = useCallback(() => {
      if (ref && typeof ref !== 'function' && ref.current) {
        onChange(ref.current.textContent || '');
      }
    }, [onChange, ref]);

    return (
      <div
        ref={ref}
        className="ltt-mindmap-inline-editor"
        contentEditable={true}
        suppressContentEditableWarning={true}
        onInput={handleInput}
        onFocus={onFocus}
        onBlur={onBlur}
        data-placeholder={placeholder}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
);
```

### 6.5 ConnectionLines 连接线组件

**文件位置**：`src/components/BlockView/views/MindMapView/ConnectionLines.tsx`

```typescript
import React from 'react';
import type { MindMapNode } from '../../../../lib/blockView/mindMap/types';

interface ConnectionLinesProps {
  nodes: Map<string, MindMapNode>;
  rootUuid: string;
}

export function ConnectionLines({ nodes, rootUuid }: ConnectionLinesProps) {
  const lines: React.ReactNode[] = [];
  
  const rootNode = nodes.get(rootUuid);
  if (!rootNode) return null;

  const renderLines = (parentUuid: string, parentLevel: number) => {
    const parentNode = nodes.get(parentUuid);
    if (!parentNode) return;

    parentNode.children.forEach((childUuid, index) => {
      const childNode = nodes.get(childUuid);
      if (!childNode) return;

      const lineKey = `${parentUuid}-${childUuid}`;
      lines.push(
        <svg key={lineKey} className="ltt-mindmap-connection-line">
          <path
            d={`M 0 0 L 20 0 L 20 ${index * 80 + 40} L 40 ${index * 80 + 40}`}
            className="ltt-mindmap-path"
          />
        </svg>
      );

      if (childNode.children.length > 0 && !childNode.collapsed) {
        renderLines(childUuid, parentLevel + 1);
      }
    });
  };

  renderLines(rootUuid, 0);

  return (
    <div className="ltt-mindmap-connections">
      {lines}
    </div>
  );
}
```

## 7. 样式设计

**文件位置**：`src/components/BlockView/views/MindMapView/mindMapView.css`

```css
/**
 * MindMap 视图样式 - 幕布风格
 */

.ltt-mindmap-view {
  width: 100%;
  background-color: var(--mindmap-bg-color, transparent);
}

.ltt-mindmap-divider {
  border: none;
  border-top: 1px solid var(--mindmap-node-border-color, #e2e8f0);
  margin: 16px 0;
}

.ltt-mindmap-canvas {
  position: relative;
  width: 100%;
  min-height: 300px;
}

.ltt-mindmap-root-wrapper {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 24px;
  min-height: 300px;
}

.ltt-mindmap-node {
  position: relative;
}

.ltt-mindmap-node-root {
  font-size: calc(var(--mindmap-font-size, 14px) * 1.1);
  font-weight: 600;
}

.ltt-mindmap-node-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: var(--mindmap-node-border-radius, 6px);
  background: var(--mindmap-node-bg-color, #ffffff);
  border: var(--mindmap-node-border-width, 1px) solid var(--mindmap-node-border-color, #e2e8f0);
  transition: all 0.15s ease;
}

.ltt-mindmap-node:hover .ltt-mindmap-node-content {
  background: var(--mindmap-node-hover-bg-color, #f8fafc);
}

.ltt-mindmap-inline-editor {
  flex: 1;
  min-width: 100px;
  outline: none;
  word-break: break-word;
  color: var(--mindmap-text-color, #374151);
  font-size: var(--mindmap-font-size, 14px);
  font-weight: var(--mindmap-font-weight, 400);
}

.ltt-mindmap-inline-editor:hover {
  color: var(--mindmap-text-hover-color, #1f2937);
}

.ltt-mindmap-inline-editor:empty::before {
  content: attr(data-placeholder);
  color: var(--mindmap-button-color, #9ca3af);
}

.ltt-mindmap-node-children {
  margin-left: 32px;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 连接线样式 */
.ltt-mindmap-connections {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
}

.ltt-mindmap-connection-line {
  position: absolute;
  width: 100%;
  height: 100%;
}

.ltt-mindmap-path {
  stroke: var(--mindmap-line-color, #cbd5e1);
  stroke-width: var(--mindmap-line-width, 2px);
  stroke-dasharray: var(--mindmap-line-style, solid) === 'dashed' ? '4 4' : 
                    var(--mindmap-line-style, solid) === 'dotted' ? '2 2' : 'none';
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* 按钮样式 */
.ltt-mindmap-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s ease;
  color: var(--mindmap-button-color, #9ca3af);
  background: transparent;
  border: none;
  padding: 0;
}

.ltt-mindmap-node:hover .ltt-mindmap-btn {
  opacity: 1;
}

.ltt-mindmap-btn:hover {
  background: var(--mindmap-node-hover-bg-color, #f8fafc);
  color: var(--mindmap-button-hover-color, #374151);
}

.ltt-mindmap-btn svg {
  width: 14px;
  height: 14px;
}
```

## 8. 注册逻辑更新

### 8.1 类型定义更新

**文件位置**：`src/lib/blockView/types.ts`

```typescript
export type ViewType = 'list' | 'table' | 'gallery' | 'board' | 'mindmap';

export const VIEW_REGISTRY: Record<ViewType, ViewConfig> = {
  'list': { /* ... */ },
  'table': { /* ... */ },
  'gallery': { /* ... */ },
  'board': { /* ... */ },
  'mindmap': {
    id: 'mindmap',
    name: 'MindMap',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="7" r="2"/><circle cx="3" cy="3" r="1.5"/><circle cx="11" cy="3" r="1.5"/><circle cx="3" cy="11" r="1.5"/><circle cx="11" cy="11" r="1.5"/><path d="M5.5 5.5L4 4M8.5 5.5L10 4M5.5 8.5L4 10M8.5 8.5L10 10"/></svg>`,
    cssClass: 'ltt-mindmap-root',
    viewPropertyValue: 'ltt-mindmap', // 视图属性值
  },
};
```

### 8.2 注册逻辑更新

**文件位置**：`src/lib/blockView/register.ts`

使用标准的 Logseq `registerBlockRenderer` API。

```typescript
import { MindMapView } from '../../components/BlockView/views/MindMapView';
import { renderComponent } from '../render';
import logger from '../logger';

/**
 * 注册 BlockView 渲染器 - 包括 MindMap 支持
 */
export function registerBlockView(): void {
  // 1. 宏渲染器（保持现有功能）
  logseqAPI.App.onMacroRendererSlotted(async ({ payload, slot }) => {
    // ... 现有代码 ...
  });

  // 2. MindMap 块渲染器 - 使用 Experiments.registerBlockRenderer
  registerMindMapRenderer();

  // ... 现有代码 ...
}

/**
 * 注册 MindMap 块渲染器
 * 使用 logseq.Experiments.registerBlockRenderer
 */
function registerMindMapRenderer(): void {
  try {
    const { React, registerBlockRenderer } = logseq.Experiments || {};
    
    if (!registerBlockRenderer) {
      logger.warn('[MindMap] registerBlockRenderer not available, falling back to macro renderer');
      return;
    }

    registerBlockRenderer('ltt-mindmap', {
      when: ({ properties }) => properties.view === 'ltt-mindmap',
      includeChildren: true,
      priority: 20,
      render: ({ content, children = [], uuid }) => {
        // 创建容器元素
        const container = document.createElement('div');
        container.className = 'ltt-mindmap-container';
        container.dataset.blockUuid = uuid;

        // 渲染 React 组件
        const reactContainer = document.createElement('div');
        container.appendChild(reactContainer);
        
        renderComponent(reactContainer, MindMapView, {
          rootUuid: uuid,
          content,
          children,
        });

        return container;
      },
    });

    logger.info('[MindMap] Block renderer registered successfully');
  } catch (error) {
    logger.error('[MindMap] Failed to register block renderer:', error);
  }
}
```

### 8.3 视图切换时更新 Block 属性

**文件位置**：`src/lib/blockView/register.ts`

当用户点击 lttviewbar 上的按钮时，需要更新 block 的 `view` 属性。

```typescript
/**
 * 视图切换时更新 block 属性
 */
async function updateBlockViewProperty(blockId: string, viewType: ViewType): Promise<void> {
  try {
    const viewPropertyValue = VIEW_REGISTRY[viewType]?.viewPropertyValue || viewType;
    
    // 更新 block 属性
    await logseqAPI.Editor.upsertBlockProperty(blockId, 'view', viewPropertyValue);
    
    logger.debug('[BlockView] Block view property updated', { blockId, viewPropertyValue });
  } catch (error) {
    logger.error('[BlockView] Failed to update block view property', error);
  }
}

/**
 * 绑定视图切换事件
 */
function bindViewEvents(container: HTMLElement, blockId: string, themeType: ThemeType): void {
  const buttons = container.querySelectorAll('.ltt-view-btn');

  buttons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const viewType = btn.getAttribute('data-view') as ViewType;
      if (!viewType) return;

      // 更新按钮样式
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // 更新视图样式
      await applyViewStyle(blockId, viewType, themeType);

      // 更新 block 的 view 属性
      await updateBlockViewProperty(blockId, viewType);

      // 更新宏参数
      await updateMacroParameters(blockId, viewType);
    });
  });
}

/**
 * 更新宏参数
 */
async function updateMacroParameters(blockId: string, viewType: ViewType): Promise<void> {
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

### 8.4 视图切换流程

```
用户点击 lttviewbar 按钮
    ↓
更新按钮样式（添加 active 类）
    ↓
应用视图样式到 block 元素
    ↓
更新 block 的 view 属性为视图对应的值
    ↓
  ├─ list      → view: "ltt-list"
  ├─ table     → view: "ltt-table"
  ├─ gallery   → view: "ltt-gallery"
  ├─ board     → view: "ltt-board"
  └─ mindmap   → view: "ltt-mindmap"
    ↓
更新宏参数内容
    ↓
重新渲染视图
```

### 8.5 注册逻辑说明

**API 参数说明**：

```typescript
registerBlockRenderer('ltt-mindmap', {
  when: ({ properties }) => properties.view === 'ltt-mindmap',
  // when: 条件函数，返回 true 时触发渲染
  // 检查 block 的 view 属性是否为 'ltt-mindmap'
  
  includeChildren: true,
  // includeChildren: 是否包含子节点
  // 设置为 true 可以自动获取 children 数组
  
  priority: 20,
  // priority: 渲染优先级
  // 数字越大优先级越高
  
  render: ({ content, children = [], uuid }) => {
    // render: 渲染函数
    // content: 当前块的内容
    // children: 子节点数组（当 includeChildren: true 时可用）
    // uuid: 当前块的 UUID
    
    const container = document.createElement('div');
    // 创建容器并渲染 React 组件
    
    return container;
  },
});
```

## 9. 设置面板更新

**文件位置**：`src/settings/tabs/BlockViewSettings.tsx`

```typescript
// 在现有设置中添加 MindMap 相关配置
const settingsSchema = {
  // ... 现有设置 ...
  
  mindMap: {
    type: 'group',
    title: 'MindMap View',
    properties: {
      viewPropertyName: {
        type: 'string',
        default: 'view',
        title: 'View Property Name',
        description: 'Property name used to detect mindmap view mode',
      },
      debounceDelay: {
        type: 'number',
        default: 500,
        title: 'Debounce Delay (ms)',
        description: 'Delay before auto-saving edits',
      },
      theme: {
        type: 'enum',
        default: 'pure',
        title: 'Theme',
        description: 'Select a preset color theme',
        enumChoices: ['pure', 'outline', 'plain', 'ink', 'parchment', 'mist', 'focus', 'deep', 'night'],
        enumPicker: 'select',
      },
      customNodeBorderColor: {
        type: 'string',
        default: '',
        title: 'Node Border Color',
        description: 'Custom border color for nodes',
        inputAs: 'color',
      },
      customNodeBorderRadius: {
        type: 'string',
        default: '',
        title: 'Node Border Radius',
        description: 'Custom border radius (e.g., 6px, 50%)',
      },
      customNodeBackgroundColor: {
        type: 'string',
        default: '',
        title: 'Node Background Color',
        description: 'Custom background color for nodes',
        inputAs: 'color',
      },
      customTextColor: {
        type: 'string',
        default: '',
        title: 'Text Color',
        description: 'Custom text color',
        inputAs: 'color',
      },
      customLineColor: {
        type: 'string',
        default: '',
        title: 'Connection Line Color',
        description: 'Custom color for connection lines',
        inputAs: 'color',
      },
      customLineWidth: {
        type: 'string',
        default: '',
        title: 'Line Width',
        description: 'Custom line width (e.g., 2px)',
      },
      customLineStyle: {
        type: 'enum',
        default: '',
        title: 'Line Style',
        description: 'Style for connection lines',
        enumChoices: ['', 'solid', 'dashed', 'dotted'],
        enumPicker: 'select',
      },
      customBackgroundColor: {
        type: 'string',
        default: '',
        title: 'Background Color',
        description: 'Custom background color for the mindmap area',
        inputAs: 'color',
      },
    },
  },
};
```

## 10. 国际化配置

### 10.1 中文翻译

**文件位置**：`src/translations/zh-CN.json`

```json
{
  "settings": {
    "blockView": {
      "mindMap": {
        "title": "MindMap 视图",
        "viewPropertyName": "视图属性名",
        "viewPropertyNameDesc": "用于检测 mindmap 视图模式的属性名",
        "debounceDelay": "防抖延迟(ms)",
        "debounceDelayDesc": "自动保存编辑内容前的延迟时间",
        "theme": "主题",
        "themeDesc": "选择预设配色主题",
        "customNodeBorderColor": "节点边框颜色",
        "customNodeBorderColorDesc": "自定义节点边框颜色",
        "customNodeBorderRadius": "节点圆角",
        "customNodeBorderRadiusDesc": "自定义节点圆角（如 6px, 50%）",
        "customNodeBackgroundColor": "节点背景色",
        "customNodeBackgroundColorDesc": "自定义节点背景颜色",
        "customTextColor": "文字颜色",
        "customTextColorDesc": "自定义文字颜色",
        "customLineColor": "连接线颜色",
        "customLineColorDesc": "自定义连接线颜色",
        "customLineWidth": "线条宽度",
        "customLineWidthDesc": "自定义线条宽度（如 2px）",
        "customLineStyle": "线条样式",
        "customLineStyleDesc": "连接线样式",
        "customBackgroundColor": "背景色",
        "customBackgroundColorDesc": "思维导图区域的自定义背景颜色"
      }
    }
  },
  "mindMap": {
    "loading": "加载中...",
    "placeholder": "请输入文字",
    "addChild": "添加子节点",
    "collapse": "折叠",
    "expand": "展开",
    "themes": {
      "pure": "纯境",
      "outline": "明线",
      "plain": "素页",
      "ink": "墨稿",
      "parchment": "雁皮",
      "mist": "薄雾",
      "focus": "焦点",
      "deep": "深潜",
      "night": "夜图"
    }
  }
}
```

### 10.2 英文翻译

**文件位置**：`src/translations/en.json`

```json
{
  "settings": {
    "blockView": {
      "mindMap": {
        "title": "MindMap View",
        "viewPropertyName": "View Property Name",
        "viewPropertyNameDesc": "Property name used to detect mindmap view mode",
        "debounceDelay": "Debounce Delay (ms)",
        "debounceDelayDesc": "Delay before auto-saving edits",
        "theme": "Theme",
        "themeDesc": "Select a preset color theme",
        "customNodeBorderColor": "Node Border Color",
        "customNodeBorderColorDesc": "Custom border color for nodes",
        "customNodeBorderRadius": "Node Border Radius",
        "customNodeBorderRadiusDesc": "Custom border radius (e.g., 6px, 50%)",
        "customNodeBackgroundColor": "Node Background Color",
        "customNodeBackgroundColorDesc": "Custom background color for nodes",
        "customTextColor": "Text Color",
        "customTextColorDesc": "Custom text color",
        "customLineColor": "Connection Line Color",
        "customLineColorDesc": "Custom color for connection lines",
        "customLineWidth": "Line Width",
        "customLineWidthDesc": "Custom line width (e.g., 2px)",
        "customLineStyle": "Line Style",
        "customLineStyleDesc": "Style for connection lines",
        "customBackgroundColor": "Background Color",
        "customBackgroundColorDesc": "Custom background color for the mindmap area"
      }
    }
  },
  "mindMap": {
    "loading": "Loading...",
    "placeholder": "Type something...",
    "addChild": "Add child",
    "collapse": "Collapse",
    "expand": "Expand",
    "themes": {
      "pure": "Pure",
      "outline": "Outline",
      "plain": "Plain",
      "ink": "Ink",
      "parchment": "Parchment",
      "mist": "Mist",
      "focus": "Focus",
      "deep": "Deep",
      "night": "Night"
    }
  }
}
```

## 11. 交互流程设计

### 11.1 视图切换流程（lttviewbar 点击）

```
1. 用户点击 lttviewbar 上的视图按钮
   ↓
2. 更新按钮样式（添加 active 类）
   ↓
3. 应用视图样式到 block 元素
   ↓
4. 更新 block 的 view 属性
   ├─ list      → view: "ltt-list"
   ├─ table     → view: "ltt-table"
   ├─ gallery   → view: "ltt-gallery"
   ├─ board     → view: "ltt-board"
   └─ mindmap   → view: "ltt-mindmap"
   ↓
5. 更新宏参数内容
   ↓
6. 触发 registerBlockRenderer 重新渲染
```

### 11.2 MindMap 初始化流程

```
1. Block 属性检测 (通过 registerBlockRenderer 的 when 条件)
   ↓
2. 检查 view 属性是否为 'ltt-mindmap'
   ↓
3. 如果是，触发 render 函数
   ↓
4. 获取 content 和 children 参数
   ↓
5. 加载配色主题设置
   ↓
6. 渲染 MindMap React 组件
```

### 11.3 编辑流程

```
1. 用户点击节点
   ↓
2. 节点聚焦，contentEditable 启用
   ↓
3. 用户输入内容
   ↓
4. 更新本地状态（即时反馈）
   ↓
5. 启动防抖计时器 (500ms)
   ↓
6. 计时器结束后调用 logseq.Editor.updateBlock()
```

### 11.4 添加子节点流程

```
1. 用户 Hover 节点显示 [+] 按钮
   ↓
2. 点击 [+] 按钮
   ↓
3. 调用 logseq.Editor.insertBlock()
   ↓
4. 创建空内容的子节点
   ↓
5. 重新加载节点树
   ↓
6. 自动聚焦到新节点进行编辑
```

### 11.5 折叠/展开流程

```
1. 用户 Hover 节点显示 [◀] 按钮（仅在有子节点时）
   ↓
2. 点击按钮
   ↓
3. 切换本地 collapsed 状态
   ↓
4. 更新 UI 显示/隐藏子节点
   ↓
5. 可选：同步到 Logseq 块属性
```

## 12. 风险和注意事项

### 12.1 潜在风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Logseq API 变更 | 高 | 使用稳定 API，保持封装层隔离 |
| 性能问题（大量节点） | 中 | 虚拟滚动、懒加载子节点 |
| 数据同步冲突 | 中 | 使用防抖、乐观更新 |
| 跨平台兼容性 | 低 | 遵循 Logseq 样式变量 |
| 配色方案兼容性 | 低 | 提供预设主题，支持自定义 |
| 属性名冲突 | 低 | 使用 `ltt-` 前缀避免冲突 |

### 12.2 注意事项

1. **原生 Root 节点保持原样**：不要试图修改或重新渲染顶部的原生节点
2. **API 调用频率**：避免频繁调用 Logseq API，使用防抖
3. **错误处理**：所有 API 调用都需要错误处理，避免崩溃
4. **状态同步**：确保本地状态与 Logseq 数据保持一致
5. **内存管理**：及时清理事件监听器和定时器
6. **配色继承**：自定义颜色应覆盖预设主题，未设置的使用默认值
7. **视图属性命名**：使用 `ltt-` 前缀区分不同视图（ltt-list, ltt-table, ltt-mindmap 等）

## 13. 测试计划

### 13.1 单元测试

- [ ] 状态管理测试
- [ ] API 封装测试
- [ ] 防抖函数测试
- [ ] 主题配置测试
- [ ] 视图属性更新测试

### 13.2 集成测试

- [ ] 节点树加载测试
- [ ] 内容编辑测试
- [ ] 添加子节点测试
- [ ] 折叠/展开测试
- [ ] 视图切换测试（lttviewbar 点击）
- [ ] 配色方案测试

### 13.3 用户场景测试

- [ ] 基本编辑流程
- [ ] 深层级嵌套测试
- [ ] 大节点树性能测试
- [ ] 中英文输入测试
- [ ] 主题切换测试
- [ ] 视图切换后数据持久化测试

## 14. 实施计划

### 阶段 1：基础框架 (1-2 天)
- [ ] 创建文件结构
- [ ] 实现类型定义
- [ ] 实现状态管理
- [ ] 实现 API 封装

### 阶段 2：核心组件 (2-3 天)
- [ ] 实现 MindMapView 容器
- [ ] 实现 MindMapNode 组件
- [ ] 实现 InlineEditor 组件
- [ ] 实现按钮组件
- [ ] 实现连接线组件

### 阶段 3：样式和配色 (1-2 天)
- [ ] 实现 CSS 样式
- [ ] 实现连接线渲染
- [ ] 实现配色主题系统
- [ ] 实现折叠/展开逻辑
- [ ] 实现添加子节点功能

### 阶段 4：集成和测试 (1-2 天)
- [ ] 更新注册逻辑（使用 registerBlockRenderer）
- [ ] 更新视图切换逻辑（lttviewbar 点击时更新 view 属性）
- [ ] 更新设置面板
- [ ] 添加国际化
- [ ] 测试和调试

### 总计：5-9 天
