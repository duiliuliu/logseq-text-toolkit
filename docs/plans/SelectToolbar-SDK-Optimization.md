# SelectToolbar 基于 onInputSelectionEnd 优化方案

## 1. 背景分析

### 1.1 Logseq SDK onInputSelectionEnd 函数分析

**SDK 接口定义**（来源：[LSPlugin.ts#L929](https://github.com/logseq/logseq/blob/19a929475cc5dfe291c3cf859e6bc9ebb3e4f3ee/libs/src/LSPlugin.ts#L929)）：

```typescript
logseq.Editor.onInputSelectionEnd(({ caret, point, start, end, text }) => {
  console.log('Text selected:', { 
    selectedText: text,      // 选中的文本内容
    startPos: start,         // 选区起始位置
    endPos: end,             // 选区结束位置
    caretInfo: caret,        // 光标位置信息
    mousePosition: point     // 鼠标位置
  })
  if (text.includes('TODO')) {
    showTodoActions(text)
  }
})
```

**接口参数详解**：

| 参数 | 类型 | 说明 |
|------|------|------|
| `text` | `string` | 选中的文本内容 |
| `start` | `number` | 选区起始位置（字符偏移） |
| `end` | `number` | 选区结束位置（字符偏移） |
| `caret` | `{left, top, height, pos, rect}` | 光标位置信息，包含 left/top 坐标、height 高度、pos 字符位置、rect DOMRect 对象 |
| `point` | `{x, y}` | 鼠标释放位置（屏幕坐标） |

**SDK 示例参考**：[logseq-plugin-sample-kit-typescript](https://github.com/YU000jp/logseq-plugin-sample-kit-typescript/blob/5be70f629beb5bed162199ddecd39e6bf3792e0f/logseq-libs-documentation-EN.md)

### 1.2 现有 SelectToolbar 实现问题

**现有实现方式**：
- 使用原生 `mouseup` 事件监听文本选择
- 手动计算选区位置和光标信息
- 需要处理复杂的边界情况

**存在的问题**：
1. **性能开销**：原生事件需要在整个文档层级添加监听器，频繁触发
2. **位置计算复杂**：需要手动解析 DOM 结构来获取准确位置
3. **跨编辑器兼容性差**：不同编辑器结构可能导致定位不准确
4. **API 不够语义化**：缺少 start/end 位置信息，需要手动计算

## 2. 优化方案设计

### 2.1 架构优化

**优化目标**：
- 利用 Logseq SDK 提供的 `onInputSelectionEnd` 事件获取更准确的选区信息
- 保留现有架构，确保平滑升级
- 提升性能和定位准确性

**优化架构图**：

```
┌────────────────────────────────────────────────────────────────┐
│                    SelectToolbar 组件优化架构                     │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                   输入层 (Input Layer)                      │ │
│  │  ┌─────────────────┐      ┌────────────────────────────┐  │ │
│  │  │  原生事件模式    │ ─── │  SDK 事件模式 (新引入)      │  │ │
│  │  │  (向后兼容)      │      │  onInputSelectionEnd       │  │ │
│  │  └─────────────────┘      └────────────────────────────┘  │ │
│  └──────────────────────────────────────────────────────────┘ │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              事件适配层 (Event Adapter Layer)             │ │
│  │  ┌────────────────────────────────────────────────────┐  │ │
│  │  │              SelectionEventAdapter                  │  │ │
│  │  │  - 统一事件格式转换                                   │  │ │
│  │  │  - 兼容旧版和新版事件数据                              │  │ │
│  │  │  - 提供统一的 SelectedData 接口                       │  │ │
│  │  └────────────────────────────────────────────────────┘  │ │
│  └──────────────────────────────────────────────────────────┘ │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                  业务逻辑层 (Business Layer)               │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │ │
│  │  │ToolbarManager│  │ActionExecutor│  │ EventBus     │   │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │ │
│  └──────────────────────────────────────────────────────────┘ │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                    UI 层 (UI Layer)                       │ │
│  │  ┌────────────────────────────────────────────────────┐  │ │
│  │  │                   Toolbar Component                 │  │ │
│  │  └────────────────────────────────────────────────────┘  │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 2.2 事件适配器设计

**文件位置**：`src/lib/toolbar/SelectionEventAdapter.ts`

```typescript
/**
 * 选区事件适配器
 * 统一处理 SDK 事件和原生事件，提供一致的 SelectedData 接口
 */

import type { BlockEntity } from '../../logseq/types';

export interface SelectionInfo {
  text: string;              // 选中文本
  start: number;            // 起始位置
  end: number;              // 结束位置
  caret?: {                 // 光标信息
    left: number;
    top: number;
    height: number;
    pos: number;
    rect: DOMRect;
  };
  point?: {                 // 鼠标位置
    x: number;
    y: number;
  };
}

export interface AdaptedSelection {
  text: string;
  start: number;
  end: number;
  rect: DOMRect;
  caret: {
    left: number;
    top: number;
    height: number;
  };
  point: { x: number; y: number };
  before: string;
  after: string;
  block?: BlockEntity;
  timestamp: string;
}

export class SelectionEventAdapter {
  /**
   * 从 SDK 事件适配选区数据
   */
  static fromSDKEvent(event: SelectionInfo): AdaptedSelection {
    const rect = event.caret?.rect || new DOMRect(
      event.caret?.left || 0,
      event.caret?.top || 0,
      0,
      event.caret?.height || 20
    );

    return {
      text: event.text,
      start: event.start,
      end: event.end,
      rect,
      caret: {
        left: event.caret?.left || 0,
        top: event.caret?.top || 0,
        height: event.caret?.height || 20,
      },
      point: {
        x: event.point?.x || 0,
        y: event.point?.y || 0,
      },
      before: '',
      after: '',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 从原生事件适配选区数据
   */
  static async fromNativeEvent(
    selection: Selection,
    block: BlockEntity | null
  ): Promise<AdaptedSelection | null> {
    if (!selection || selection.toString().length === 0) {
      return null;
    }

    const text = selection.toString();
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // 计算 start 和 end 位置
    let start = 0;
    let end = 0;

    if (block?.content) {
      const content = block.content;
      const selectedIndex = content.indexOf(text);
      
      if (selectedIndex !== -1) {
        start = selectedIndex;
        end = selectedIndex + text.length;
      }
    }

    return {
      text,
      start,
      end,
      rect,
      caret: {
        left: rect.left,
        top: rect.top,
        height: rect.height,
      },
      point: {
        x: rect.left,
        y: rect.top,
      },
      before: '',
      after: '',
      block: block || undefined,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 合并上下文信息（before/after）
   */
  static enrichWithContext(
    selection: AdaptedSelection,
    block: BlockEntity
  ): AdaptedSelection {
    if (!block?.content) {
      return selection;
    }

    const content = block.content;
    const start = content.indexOf(selection.text);
    
    if (start !== -1) {
      return {
        ...selection,
        start,
        end: start + selection.text.length,
        before: content.substring(0, start),
        after: content.substring(start + selection.text.length),
        block,
      };
    }

    return { ...selection, block };
  }
}
```

### 2.3 组件优化实现

**修改文件**：`src/components/SelectToolbar/index.tsx`

**核心优化点**：

```typescript
/**
 * SelectToolbar 组件优化版本
 * 支持 SDK 事件和原生事件两种模式
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import Toolbar from '../Toolbar';
import { SelectedData } from '../Toolbar/types.ts';
import { SelectionEventAdapter, type SelectionInfo } from '../../lib/toolbar/SelectionEventAdapter.ts';
import { toolbarManager, eventBus } from '../../lib/toolbar/index.ts';
import { logseqAPI } from '../../logseq/index.ts';
import logger from '../../lib/logger/index';

interface SelectToolbarProps {
  targetElement: HTMLElement | null;
  items: Array<any>;
  theme?: 'light' | 'dark';
  showBorder?: boolean;
  width?: string;
  height?: string;
  hoverDelay?: number;
  sponsorEnabled?: boolean;
  useSDKEvents?: boolean;  // 新增：是否优先使用 SDK 事件
}

function SelectToolbar({ 
  targetElement, 
  items: ToolbarItems,
  useSDKEvents = true  // 默认启用 SDK 事件
}: SelectToolbarProps) {
  const [selectedData, setSelectedData] = useState<SelectedData>({ text: '' });
  const [toolbarPosition, setToolbarPosition] = useState<ToolbarPosition>({ x: 0, y: 0 });
  const [showToolbar, setShowToolbar] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sdkEventHandlerRef = useRef<(() => void) | null>(null);

  // SDK 事件注册
  useEffect(() => {
    if (!useSDKEvents) return;

    const handleSDKSelection = async (event: SelectionInfo) => {
      try {
        // 适配 SDK 事件
        const adaptedSelection = SelectionEventAdapter.fromSDKEvent(event);
        
        // 获取当前块以补充上下文
        const block = await logseqAPI.Editor.getCurrentBlock();
        const enrichedSelection = block 
          ? SelectionEventAdapter.enrichWithContext(adaptedSelection, block)
          : adaptedSelection;

        // 更新状态
        setSelectedData(enrichedSelection);
        eventBus.emit('ltt-selectionChange', { selectedData: enrichedSelection });

        // 计算工具栏位置
        const position = calculateToolbarPosition(enrichedSelection);
        setToolbarPosition(position);
        setShowToolbar(true);

        // 触发配置的条件显示
        checkConditionalDisplay(enrichedSelection);
      } catch (error) {
        logger.error('[SelectToolbar] SDK event handle error:', error);
      }
    };

    // 注册 SDK 事件
    const handler = logseqAPI.Editor.onInputSelectionEnd(handleSDKSelection);
    sdkEventHandlerRef.current = handler;

    return () => {
      if (sdkEventHandlerRef.current) {
        sdkEventHandlerRef.current();
      }
    };
  }, [useSDKEvents]);

  // 条件显示检查
  const checkConditionalDisplay = (selection: SelectedData) => {
    const config = toolbarManager.getToolbarItems();
    
    config.forEach(item => {
      if (item.type === 'group' && 'subItems' in item) {
        item.subItems?.forEach(subItem => {
          if (subItem.conditions?.textMatch) {
            const { pattern, action } = subItem.conditions.textMatch;
            
            if (action === 'show' && !new RegExp(pattern).test(selection.text)) {
              subItem.hidden = true;
            } else if (action === 'hide' && new RegExp(pattern).test(selection.text)) {
              subItem.hidden = true;
            }
          }
        });
      }
    });
  };

  // 计算工具栏位置
  const calculateToolbarPosition = (selection: SelectedData): ToolbarPosition => {
    const toolbarHeight = 32;
    const padding = 3;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    let toolbarY: number;
    let toolbarX: number;

    const rect = selection.rect;
    const spaceAbove = rect.top;
    const spaceBelow = viewportHeight - rect.bottom;

    // 优先显示在选区上方
    if (spaceAbove > toolbarHeight + 10) {
      toolbarY = rect.top - toolbarHeight - padding;
    } else {
      toolbarY = rect.bottom + padding;
    }

    // 水平居中
    toolbarX = rect.left + rect.width / 2;

    // 边界检查
    if (containerRef.current) {
      const w = containerRef.current.offsetWidth;
      if (toolbarX - w / 2 < 0) toolbarX = w / 2;
      if (toolbarX + w / 2 > viewportWidth) toolbarX = viewportWidth - w / 2;
    }

    return { x: toolbarX, y: toolbarY };
  };

  // 原生事件降级处理
  useEffect(() => {
    if (useSDKEvents) return;  // SDK 事件已启用，跳过原生事件

    const handleNativeSelection = async (e: MouseEvent) => {
      // 现有逻辑...
    };

    // ... 原生事件监听逻辑
  }, [useSDKEvents, targetElement]);

  return (
    <div ref={containerRef}>
      {showToolbar && (
        <div 
          className="ltt-floating-toolbar"
          style={{
            position: 'fixed',
            left: toolbarPosition.x,
            top: toolbarPosition.y,
            transform: 'translateX(-50%)',
            zIndex: 10000
          }}
        >
          <Toolbar 
            items={ToolbarItems} 
            // ... 其他 props
          />
        </div>
      )}
    </div>
  );
}

export default SelectToolbar;
```

### 2.4 配置扩展

**支持的条件显示配置**：

```typescript
// src/components/Toolbar/types.ts

export interface ToolbarItem {
  // ... 现有字段
  conditions?: {
    textMatch?: {
      pattern: string;      // 正则表达式
      action: 'show' | 'hide';  // 显示或隐藏
    };
    context?: {
      blockProperty?: string;    // 块属性名
      value?: string;            // 期望值
    };
  };
}
```

**配置示例**：

```json
{
  "ToolbarItems": [
    {
      "id": "highlight-todo",
      "label": "高亮TODO",
      "conditions": {
        "textMatch": {
          "pattern": "TODO",
          "action": "show"
        }
      },
      "clickfunc": "=={selectedText}=="
    },
    {
      "id": "interview-stage",
      "label": "面试阶段",
      "conditions": {
        "context": {
          "blockProperty": "type",
          "value": "interview"
        }
      },
      "subItems": [...]
    }
  ]
}
```

## 3. 性能优化

### 3.1 事件防抖优化

```typescript
const debouncedSDKHandler = useMemo(
  () => debounce((event: SelectionInfo) => {
    handleSDKSelection(event);
  }, 50),
  []
);
```

### 3.2 条件缓存

```typescript
const conditionCache = new Map<string, boolean>();

const checkConditions = (selection: SelectedData, config: ToolbarItem): boolean => {
  if (!config.conditions) return true;

  const cacheKey = `${selection.text}:${JSON.stringify(config.conditions)}`;
  
  if (conditionCache.has(cacheKey)) {
    return conditionCache.get(cacheKey)!;
  }

  // 执行条件检查
  let result = true;
  if (config.conditions.textMatch) {
    const regex = new RegExp(config.conditions.textMatch.pattern);
    result = config.conditions.textMatch.action === 'show' 
      ? regex.test(selection.text)
      : !regex.test(selection.text);
  }

  conditionCache.set(cacheKey, result);
  return result;
};
```

## 4. 向后兼容性

### 4.1 配置迁移

```typescript
const migrateConfig = (oldConfig: any): any => {
  return {
    ...oldConfig,
    useSDKEvents: oldConfig.useSDKEvents ?? true,
  };
};
```

### 4.2 渐进式升级

1. **Phase 1**：添加 SDK 事件支持，保持原生事件作为降级方案
2. **Phase 2**：优化条件显示逻辑
3. **Phase 3**：移除原生事件依赖（可选）

## 5. 测试计划

### 5.1 单元测试

- SelectionEventAdapter 转换逻辑
- 条件匹配算法
- 位置计算算法

### 5.2 集成测试

- SDK 事件注册和注销
- 事件数据完整性
- UI 渲染正确性

### 5.3 兼容性测试

- 不同编辑器场景
- 边界情况处理
- 回退机制验证

## 6. 实施计划

| 阶段 | 任务 | 预估时间 | 依赖 |
|------|------|---------|------|
| 阶段一 | 创建 SelectionEventAdapter | 0.5 天 | - |
| 阶段二 | 修改 SelectToolbar 组件 | 1 天 | 阶段一 |
| 阶段三 | 添加条件显示配置支持 | 0.5 天 | - |
| 阶段四 | 性能优化 | 0.5 天 | 阶段二 |
| 阶段五 | 测试和文档 | 1 天 | 全部 |

---

## 附录：A. API 对比

| 特性 | 原生事件 | SDK 事件 |
|------|---------|---------|
| text | ✅ 手动获取 | ✅ 直接提供 |
| start/end | ❌ 需计算 | ✅ 直接提供 |
| caret/rect | ✅ 需解析 DOM | ✅ 直接提供 |
| point | ❌ 需从 MouseEvent 获取 | ✅ 直接提供 |
| 准确性 | 依赖 DOM 解析 | SDK 级别保证 |
| 性能 | 较差 | 较好 |
