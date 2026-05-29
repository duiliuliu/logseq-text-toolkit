# SelectToolbar SDK 集成说明

## 概述

本模块提供了一套完整的文本选择检测解决方案，支持 Logseq SDK 事件和原生事件两种模式。设计目标是提供一个可复用、可测试、易于集成的选区管理接口。

## 核心组件

### 1. SelectionEventAdapter

**位置**: `src/lib/toolbar/SelectionManager.ts`

负责将不同来源的选区事件转换为统一的 `AdaptedSelection` 格式。

#### 主要方法

```typescript
// 从 SDK 事件转换
static fromSDKEvent(event: SelectionInfo): AdaptedSelection

// 从原生事件转换（需要配合 getBlock 函数）
static async fromNativeEvent(getBlock: () => Promise<BlockEntity | null>): Promise<AdaptedSelection | null>

// 补充块上下文信息
static enrichWithContext(selection: AdaptedSelection, block: BlockEntity): AdaptedSelection
```

### 2. calculateToolbarPosition

**位置**: `src/lib/toolbar/SelectionManager.ts`

计算工具栏的最佳显示位置。

```typescript
function calculateToolbarPosition(
  selection: AdaptedSelection,
  containerWidth?: number,  // 默认 200
  toolbarHeight?: number,   // 默认 32
  padding?: number          // 默认 3
): { x: number; y: number }
```

### 3. onInputSelectionEnd (Mock 实现)

**位置**: `src/logseq/mock/editor.ts`

在测试环境中模拟 Logseq SDK 的 `onInputSelectionEnd` 事件。

#### 使用方式

```typescript
import { logseqAPI } from '../../logseq/index.ts';

// 注册事件监听
const unregister = logseqAPI.Editor.onInputSelectionEnd((event) => {
  console.log('Text selected:', event.text);
  console.log('Position:', event.caret);
});

// 取消注册
unregister();
```

## 集成示例

### 基本用法

```typescript
import React, { useState, useEffect } from 'react';
import { logseqAPI } from '../../logseq/index.ts';
import { SelectionEventAdapter, calculateToolbarPosition } from '../../lib/toolbar/SelectionManager';

function SelectToolbar() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');

  useEffect(() => {
    const handleSelection = async (event: any) => {
      const selection = SelectionEventAdapter.fromSDKEvent(event);
      const block = await logseqAPI.Editor.getCurrentBlock();
      const enriched = block 
        ? SelectionEventAdapter.enrichWithContext(selection, block)
        : selection;

      setSelectedText(enriched.text);
      setPosition(calculateToolbarPosition(enriched));
    };

    const unregister = logseqAPI.Editor.onInputSelectionEnd(handleSelection);
    return () => unregister();
  }, []);

  if (!selectedText) return null;

  return (
    <div style={{ position: 'fixed', left: position.x, top: position.y }}>
      {selectedText}
    </div>
  );
}
```

### 高级用法：使用 SelectionManager 类

```typescript
import React, { useState, useEffect } from 'react';
import { logseqAPI } from '../../logseq/index.ts';
import { SelectionManager, calculateToolbarPosition } from '../../lib/toolbar/SelectionManager';

function AdvancedSelectToolbar() {
  const [selection, setSelection] = useState<any>(null);
  const selectionManagerRef = useRef<SelectionManager | null>(null);

  useEffect(() => {
    selectionManagerRef.current = new SelectionManager(
      () => logseqAPI.Editor.getCurrentBlock(),
      (handler) => logseqAPI.Editor.onInputSelectionEnd(handler)
    );

    const unsubscribe = selectionManagerRef.current.onSelection((sel) => {
      setSelection(sel);
    });

    const unregisterSDKEvents = selectionManagerRef.current.registerSDKEvents();

    return () => {
      unsubscribe();
      unregisterSDKEvents();
      selectionManagerRef.current?.destroy();
    };
  }, []);

  if (!selection) return null;

  const position = calculateToolbarPosition(selection);

  return (
    <div style={{ position: 'fixed', left: position.x, top: position.y }}>
      Selected: {selection.text}
    </div>
  );
}
```

## 测试

### 运行单元测试

```bash
npm test -- src/lib/toolbar/SelectionManager.test.ts
```

### Mock 环境

在测试环境中，`logseqAPI.Editor.onInputSelectionEnd` 会自动使用 Mock 实现：

```typescript
import { logseqAPI } from '../../logseq/index';
import { render } from '@testing-library/react';

test('should handle selection', async () => {
  const handleSelection = vi.fn();
  
  const unregister = logseqAPI.Editor.onInputSelectionEnd(handleSelection);
  
  // 模拟文本选择...
  const event = new MouseEvent('mouseup', {
    clientX: 100,
    clientY: 200
  });
  document.dispatchEvent(event);
  
  expect(handleSelection).toHaveBeenCalled();
  
  unregister();
});
```

## 架构优势

1. **统一接口**: 无论是 SDK 事件还是原生事件，都转换为统一的 `AdaptedSelection` 格式
2. **可测试性**: 核心逻辑完全独立于 Logseq SDK，便于单元测试
3. **可复用性**: 可以轻松迁移到 `lib` 目录下，供其他项目使用
4. **向后兼容**: 支持 SDK 事件和原生事件两种模式，可以渐进式迁移

## 迁移指南

### 从原生事件迁移到 SDK 事件

1. **替换事件监听**:
   ```typescript
   // 旧代码
   targetElement.addEventListener('mouseup', handleSelection);
   
   // 新代码
   logseqAPI.Editor.onInputSelectionEnd(handleSelection);
   ```

2. **使用 SelectionEventAdapter**:
   ```typescript
   // 旧代码
   const selection = getSelection();
   const text = selection.toString();
   
   // 新代码
   const adapted = SelectionEventAdapter.fromSDKEvent(event);
   const text = adapted.text;
   ```

3. **补充块上下文**:
   ```typescript
   const block = await logseqAPI.Editor.getCurrentBlock();
   const enriched = block 
     ? SelectionEventAdapter.enrichWithContext(adapted, block)
     : adapted;
   ```

## 注意事项

1. **事件注册清理**: 组件卸载时务必调用 `unregister()` 清理事件监听
2. **性能考虑**: SelectionManager 内部使用防抖处理，避免频繁触发
3. **错误处理**: 所有异步操作都有错误处理机制，不会导致应用崩溃
4. **类型安全**: 完整的 TypeScript 类型定义，提供良好的开发体验

## 未来优化方向

1. 支持更多选区相关 SDK 事件
2. 优化位置计算算法，支持更多边界情况
3. 添加性能监控和优化
4. 支持自定义选区处理管道
