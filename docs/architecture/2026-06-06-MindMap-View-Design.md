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
- 通过 BlockView 工具栏按钮切换
- 自动更新 block 的 `view` 属性值

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
│  │              │  Root Node (拷贝)   │──────┬──────▶      │  │
│  │              └─────────────────────┘      │            │  │
│  │                                           │            │  │
│  │                                           ├──────▶     │  │
│  │                                           │            │  │
│  │                                           └──────▶     │  │
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
 * MindMap 配置
 */
export interface MindMapConfig {
  debounceDelay: number; // 默认 500ms
  nodeSpacing: number;
  lineWidth: number;
  lineColor: string;
}
```

### 4.2 状态管理

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
          before: false, // 追加到子节点末尾
          sibling: false, // 作为子节点，而非同级
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
      // 使用 upsertBlockProperty 或其他方式设置折叠状态
      // 注意：Logseq 可能需要特殊的方式来设置折叠状态
      // 如果 API 不支持，可以仅在本地状态管理
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
import React, { useEffect, useRef, useState } from 'react';
import { MindMapStateManager } from '../../../../lib/blockView/mindMap/state';
import { MindMapCanvas } from './MindMapCanvas';
import './mindMapView.css';

interface MindMapViewProps {
  rootUuid: string;
}

export function MindMapView({ rootUuid }: MindMapViewProps) {
  const [stateManager] = useState(() => new MindMapStateManager(rootUuid));
  const [state, setState] = useState(stateManager.getState());

  useEffect(() => {
    // 订阅状态变化
    return stateManager.subscribe(newState => {
      setState(newState);
    });
  }, [stateManager]);

  useEffect(() => {
    // 初始加载
    stateManager.loadTree();
  }, [stateManager]);

  return (
    <div className="ltt-mindmap-view">
      {/* 原生 Root 节点保持原样 - 通过 onBlockRendererSlotted 保留 */}
      
      {/* 分隔线 */}
      <hr className="ltt-mindmap-divider" />
      
      {/* MindMap 画布 */}
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
      {/* 连接线层 */}
      <ConnectionLines nodes={nodes} rootUuid={rootBlockUuid} />
      
      {/* 节点层 */}
      <div className="ltt-mindmap-nodes">
        {/* Root 节点 - 垂直居中 */}
        <div className="ltt-mindmap-root-wrapper">
          <MindMapNode
            node={rootNode}
            state={state}
            stateManager={stateManager}
            isRoot={true}
          />
          
          {/* 子节点 */}
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
import React, { useCallback, useState, useRef, useEffect } from 'react';
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
  const inputRef = useRef<HTMLDivElement>(null);

  // 防抖更新
  const debouncedUpdate = useCallback(
    createDebounceFn(
      (uuid: string, content: string) => {
        MindMapBlockAPI.updateBlock(uuid, content);
      },
      500
    ),
    []
  );

  // 清理防抖
  useEffect(() => {
    return () => debouncedUpdate.cancel();
  }, [debouncedUpdate]);

  const handleContentChange = useCallback(
    (content: string) => {
      // 更新本地状态
      stateManager.setState(prev => ({
        nodes: new Map(prev.nodes).set(node.uuid, {
          ...prev.nodes.get(node.uuid)!,
          content,
        }),
      }));

      // 防抖更新到 Logseq
      debouncedUpdate(node.uuid, content);
    },
    [node.uuid, stateManager, debouncedUpdate]
  );

  const handleAddChild = useCallback(async () => {
    try {
      const newUuid = await MindMapBlockAPI.addChild(node.uuid, '');
      if (newUuid) {
        // 重新加载树
        await stateManager.loadTree();
        
        // 聚焦到新节点
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
  const isEditing = state.editingNode === node.uuid;

  return (
    <div
      className={`ltt-mindmap-node ${isRoot ? 'ltt-mindmap-node-root' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="ltt-mindmap-node-content">
        {/* 左侧：折叠按钮 */}
        {hasChildren && (
          <CollapseButton
            collapsed={isCollapsed}
            onClick={handleToggleCollapse}
            visible={isHovered || isCollapsed}
          />
        )}

        {/* 内容编辑区 */}
        <InlineEditor
          ref={inputRef}
          content={node.content}
          onChange={handleContentChange}
          onFocus={() => stateManager.setState({ editingNode: node.uuid })}
          onBlur={() => stateManager.setState({ editingNode: null })}
          placeholder="请输入文字"
        />

        {/* 右侧：添加子节点按钮 */}
        <AddChildButton
          onClick={handleAddChild}
          visible={isHovered}
        />
      </div>

      {/* 子节点 */}
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
import React, { forwardRef, useCallback, useEffect, useRef } from 'react';

interface InlineEditorProps {
  content: string;
  onChange: (content: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
}

export const InlineEditor = forwardRef<HTMLDivElement, InlineEditorProps>(
  ({ content, onChange, onFocus, onBlur, placeholder }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      // 同步 ref
      if (ref) {
        if (typeof ref === 'function') {
          ref(editorRef.current);
        } else {
          ref.current = editorRef.current;
        }
      }
    }, [ref]);

    const handleInput = useCallback(() => {
      if (editorRef.current) {
        onChange(editorRef.current.textContent || '');
      }
    }, [onChange]);

    return (
      <div
        ref={editorRef}
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

## 7. 样式设计

**文件位置**：`src/components/BlockView/views/MindMapView/mindMapView.css`

```css
/**
 * MindMap 视图样式 - 幕布风格
 */

.ltt-mindmap-view {
  width: 100%;
}

.ltt-mindmap-divider {
  border: none;
  border-top: 1px solid var(--ls-secondary-border-color);
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
  font-size: 1.1em;
  font-weight: 600;
}

.ltt-mindmap-node-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  background: var(--ls-primary-background-color);
  border: 1px solid transparent;
  transition: all 0.15s ease;
}

.ltt-mindmap-node:hover .ltt-mindmap-node-content {
  border-color: var(--ls-secondary-border-color);
  background: var(--ls-tertiary-background-color);
}

.ltt-mindmap-inline-editor {
  flex: 1;
  min-width: 100px;
  outline: none;
  word-break: break-word;
}

.ltt-mindmap-inline-editor:empty::before {
  content: attr(data-placeholder);
  color: var(--ls-quaternary-text-color);
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
}

.ltt-mindmap-connection-line {
  stroke: var(--ls-secondary-border-color);
  stroke-width: 2;
  fill: none;
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
  color: var(--ls-quaternary-text-color);
}

.ltt-mindmap-node:hover .ltt-mindmap-btn {
  opacity: 1;
}

.ltt-mindmap-btn:hover {
  background: var(--ls-secondary-background-color);
  color: var(--ls-primary-text-color);
}
```

## 8. 注册逻辑更新

### 8.1 类型定义更新

**文件位置**：`src/lib/blockView/types.ts`

```typescript
// 在现有类型中添加 mindmap 支持
export type ViewType = 'list' | 'table' | 'gallery' | 'board' | 'mindmap';

// 更新 VIEW_REGISTRY
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
  },
};
```

### 8.2 注册逻辑更新

**文件位置**：`src/lib/blockView/register.ts`

```typescript
import { MindMapView } from '../../components/BlockView/views/MindMapView';

// ... 现有代码 ...

/**
 * 注册 BlockView 渲染器 - 包括 MindMap 支持
 */
export function registerBlockView(): void {
  // 1. 宏渲染器（保持现有功能）
  logseqAPI.App.onMacroRendererSlotted(async ({ payload, slot }) => {
    // ... 现有代码 ...
  });

  // 2. Block 渲染器 - 用于 MindMap 模式
  logseqAPI.App.onBlockRendererSlotted(async (condition, { slot, uuid }) => {
    // 检查是否启用 MindMap 模式
    const block = await logseqAPI.Editor.getBlock(uuid);
    const viewProp = block?.properties?.view || block?.properties?.['view'];
    
    if (viewProp === 'ltt-mindmap') {
      // 渲染 MindMap 视图
      renderMindMap(slot, uuid);
    }
  });

  // ... 现有代码 ...
}

/**
 * 渲染 MindMap 视图
 */
async function renderMindMap(slot: string, blockUuid: string): Promise<void> {
  const containerId = `${PLUGIN_ID}__mindmap__${slot}`;
  
  logseqAPI.provideUI({
    key: containerId,
    slot,
    reset: true,
    template: `<div id="${containerId}"></div>`,
  });

  setTimeout(() => {
    const container = getDocument().getElementById(containerId);
    if (container) {
      renderComponent(container, MindMapView, {
        rootUuid: blockUuid,
      });
    }
  }, 1);
}
```

## 9. 设置面板更新

**文件位置**：`src/settings/tabs/BlockViewSettings.tsx`

```typescript
// 在现有设置中添加 MindMap 相关配置
const settingsSchema = {
  // ... 现有设置 ...
  
  // MindMap 配置
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
        "debounceDelayDesc": "自动保存编辑内容前的延迟时间"
      }
    }
  },
  "mindMap": {
    "loading": "加载中...",
    "placeholder": "请输入文字",
    "addChild": "添加子节点",
    "collapse": "折叠",
    "expand": "展开"
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
        "debounceDelayDesc": "Delay before auto-saving edits"
      }
    }
  },
  "mindMap": {
    "loading": "Loading...",
    "placeholder": "Type something...",
    "addChild": "Add child",
    "collapse": "Collapse",
    "expand": "Expand"
  }
}
```

## 11. 交互流程设计

### 11.1 初始化流程

```
1. Block 属性检测
   ↓
2. 检查 view 属性是否为 'ltt-mindmap'
   ↓
3. 如果是，加载 MindMap 组件
   ↓
4. 获取 Root 块及其子节点树
   ↓
5. 构建节点数据结构
   ↓
6. 渲染界面
```

### 11.2 编辑流程

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

### 11.3 添加子节点流程

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

### 11.4 折叠/展开流程

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

### 12.2 注意事项

1. **原生 Root 节点保持原样**：不要试图修改或重新渲染顶部的原生节点
2. **API 调用频率**：避免频繁调用 Logseq API，使用防抖
3. **错误处理**：所有 API 调用都需要错误处理，避免崩溃
4. **状态同步**：确保本地状态与 Logseq 数据保持一致
5. **内存管理**：及时清理事件监听器和定时器

## 13. 测试计划

### 13.1 单元测试

- [ ] 状态管理测试
- [ ] API 封装测试
- [ ] 防抖函数测试

### 13.2 集成测试

- [ ] 节点树加载测试
- [ ] 内容编辑测试
- [ ] 添加子节点测试
- [ ] 折叠/展开测试
- [ ] 视图切换测试

### 13.3 用户场景测试

- [ ] 基本编辑流程
- [ ] 深层级嵌套测试
- [ ] 大节点树性能测试
- [ ] 中英文输入测试

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

### 阶段 3：样式和交互 (1-2 天)
- [ ] 实现 CSS 样式
- [ ] 实现连接线渲染
- [ ] 实现折叠/展开逻辑
- [ ] 实现添加子节点功能

### 阶段 4：集成和测试 (1-2 天)
- [ ] 集成到 BlockView 系统
- [ ] 更新设置面板
- [ ] 添加国际化
- [ ] 测试和调试

### 总计：5-9 天
