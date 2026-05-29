# 性能优化方案

## 1. 当前性能问题分析

### 1.1 主要性能瓶颈

#### 1.1.1 事件处理性能
- **频繁的事件触发**: 鼠标选择、移动和滚动事件频繁触发，导致大量计算
- **无防抖处理**: 事件处理函数直接执行，没有防抖机制
- **重复计算**: 多次调用相同的计算逻辑，没有缓存

#### 1.1.2 API调用性能
- **频繁的API调用**: 每次选择文本都会调用Logseq API获取块信息
- **同步API调用**: 部分API调用是同步的，可能阻塞主线程

#### 1.1.3 渲染性能
- **频繁的状态更新**: 每次选择文本都会更新多个状态
- **不必要的重渲染**: 部分组件可能在不必要时重渲染

#### 1.1.4 计算性能
- **复杂的位置计算**: 工具栏位置计算逻辑复杂，包含大量DOM操作
- **重复的DOM查询**: 多次查询相同的DOM元素

## 2. 优化目标

- **减少事件触发频率**: 使用防抖和节流减少事件处理次数
- **优化API调用**: 减少API调用次数，缓存API调用结果
- **提升渲染性能**: 减少不必要的重渲染，优化组件渲染
- **减少计算开销**: 优化计算逻辑，缓存计算结果
- **提升用户体验**: 使工具栏显示和隐藏更加流畅

## 3. 核心优化措施

### 3.1 防抖和节流

#### 3.1.1 防抖处理
- **文本选择事件**: 对 `handleSelection` 函数应用防抖，延迟执行，避免频繁触发
- **滚动事件**: 对 `handleScroll` 函数应用防抖，减少滚动时的计算
- **鼠标移动事件**: 对 `handleMouseMove` 函数应用防抖，减少鼠标移动时的计算

#### 3.1.2 节流处理
- **滚动事件**: 对 `handleScroll` 函数应用节流，限制执行频率
- **鼠标移动事件**: 对 `handleMouseMove` 函数应用节流，限制执行频率

### 3.2 延迟加载

#### 3.2.1 组件延迟加载
- **工具栏组件**: 只在需要时渲染工具栏组件
- **下拉菜单组件**: 只在需要时渲染下拉菜单组件

#### 3.2.2 数据延迟加载
- **块信息**: 只在需要时获取块信息，避免每次选择都获取
- **配置信息**: 缓存配置信息，避免每次渲染都重新获取

### 3.3 减少重复计算

#### 3.3.1 缓存计算结果
- **工具栏位置**: 缓存计算好的工具栏位置，避免重复计算
- **块内容**: 缓存块内容，避免重复获取
- **选择范围**: 缓存选择范围信息，避免重复计算

#### 3.3.2 优化计算逻辑
- **位置计算**: 简化工具栏位置计算逻辑
- **边界检查**: 优化边界检查逻辑，减少DOM操作
- **选择范围计算**: 优化选择范围计算逻辑，减少DOM操作

### 3.4 事件处理优化

#### 3.4.1 事件委托
- **使用事件委托**: 对大量子元素的事件使用事件委托
- **减少事件监听器**: 减少直接绑定的事件监听器数量

#### 3.4.2 事件监听器管理
- **及时移除监听器**: 确保在组件卸载时移除所有事件监听器
- **优化监听器范围**: 只在必要的元素上绑定事件监听器

### 3.5 API调用优化

#### 3.5.1 API调用缓存
- **缓存API结果**: 缓存API调用结果，避免重复调用
- **批量API调用**: 合并多个API调用为一个批量调用

#### 3.5.2 异步API调用
- **使用异步API**: 优先使用异步API，避免阻塞主线程
- **并行API调用**: 并行执行多个API调用，减少等待时间

### 3.6 渲染优化

#### 3.6.1 React优化
- **使用React.memo**: 对纯展示组件使用React.memo
- **使用useMemo和useCallback**: 缓存计算结果和回调函数
- **优化状态更新**: 减少不必要的状态更新

#### 3.6.2 DOM操作优化
- **减少DOM查询**: 缓存DOM查询结果，避免重复查询
- **批量DOM操作**: 批量执行DOM操作，减少重排和重绘
- **使用requestAnimationFrame**: 在适当的时机使用requestAnimationFrame执行DOM操作

## 4. 具体功能优化方案

### 4.1 工具栏显示/隐藏优化

#### 4.1.1 防抖处理
```typescript
// 创建防抖函数
const useDebounce = (func: Function, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback((...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      func(...args);
    }, delay);
  }, [func, delay]);
};

// 在组件中使用
const debouncedUpdateToolbarPosition = useDebounce(updateToolbarPosition, 100);

// 事件处理函数
const handleSelection = async (e: MouseEvent) => {
  // 点击toolbar内部时，不隐藏toolbar
  if (e.target && ((e.target as HTMLElement).closest('.ltt-floating-toolbar') || (e.target as HTMLElement).closest('.ltt-toolbar-container') || (e.target as HTMLElement).closest('.ltt-toolbar-group-dropdown'))) {
    return;
  }

  debouncedUpdateToolbarPosition();
};
```

#### 4.1.2 延迟显示
```typescript
// 延迟显示工具栏
const [showToolbar, setShowToolbar] = useState(false);
const [isSelectionComplete, setIsSelectionComplete] = useState(false);

// 处理选择开始
const handleSelectionStart = () => {
  setIsSelectionComplete(false);
  setShowToolbar(false);
};

// 处理选择结束
const handleSelectionEnd = async () => {
  setIsSelectionComplete(true);
  // 延迟显示工具栏，避免快速选择时的闪烁
  setTimeout(async () => {
    if (isSelectionComplete) {
      await updateToolbarPosition();
    }
  }, 200);
};
```

### 4.2 工具栏位置计算优化

#### 4.2.1 缓存计算结果
```typescript
// 缓存计算结果
const [cachedPosition, setCachedPosition] = useState<ToolbarPosition | null>(null);
const [cachedSelection, setCachedSelection] = useState<string>('');

const updateToolbarPosition = async () => {
  // 检查选择是否变化
  const selection = getSelection();
  const selectedText = selection?.toString() || '';
  
  if (selectedText === cachedSelection && cachedPosition) {
    // 选择没有变化，使用缓存的位置
    setToolbarPosition(cachedPosition);
    setShowToolbar(true);
    return;
  }
  
  // 计算新位置
  // ... 计算逻辑 ...
  
  // 缓存结果
  setCachedPosition(newPosition);
  setCachedSelection(selectedText);
  setToolbarPosition(newPosition);
  setShowToolbar(true);
};
```

#### 4.2.2 优化计算逻辑
```typescript
// 简化位置计算逻辑
const calculateToolbarPosition = (rect: DOMRect) => {
  const toolbarHeight = 32;
  const padding = 3;
  const viewportHeight = getWindow().innerHeight;
  const viewportWidth = getWindow().innerWidth;
  
  // 计算垂直位置
  let toolbarY: number;
  const spaceAbove = rect.top;
  const spaceBelow = viewportHeight - rect.bottom;
  
  if (spaceAbove > toolbarHeight + 10) {
    toolbarY = rect.top - toolbarHeight - padding;
  } else {
    toolbarY = rect.bottom + padding;
  }
  
  // 计算水平位置
  let toolbarX = rect.left;
  
  // 边界检查
  if (containerRef.current) {
    const w = containerRef.current.offsetWidth;
    if (toolbarX < 0) toolbarX = 0;
    if (toolbarX + w > viewportWidth) toolbarX = viewportWidth - w;
  }
  
  return { x: toolbarX, y: toolbarY };
};
```

### 4.3 API调用优化

#### 4.3.1 缓存API结果
```typescript
// 缓存块信息
const [cachedBlock, setCachedBlock] = useState<any>(null);
const [cachedBlockId, setCachedBlockId] = useState<string>('');

const getCurrentBlock = async () => {
  try {
    const block = await logseqAPI.Editor.getCurrentBlock();
    if (block) {
      setCachedBlock(block);
      setCachedBlockId(block.uuid);
    }
    return block;
  } catch (error) {
    logger.error('Error getting current block:', error);
    return null;
  }
};

// 使用缓存的块信息
const block = cachedBlock || await getCurrentBlock();
```

#### 4.3.2 批量API调用
```typescript
// 批量获取块信息和光标位置
const getEditorState = async () => {
  try {
    const [block, cursorPosition] = await Promise.all([
      logseqAPI.Editor.getCurrentBlock(),
      logseqAPI.Editor.getEditingCursorPosition()
    ]);
    return { block, cursorPosition };
  } catch (error) {
    logger.error('Error getting editor state:', error);
    return { block: null, cursorPosition: null };
  }
};

// 使用批量API调用
const { block, cursorPosition } = await getEditorState();
```

### 4.4 渲染优化

#### 4.4.1 使用React.memo
```typescript
// 工具栏组件使用React.memo
const Toolbar = React.memo(({ items, theme, showBorder, width, height, selectedData, hoverDelay, sponsorEnabled, onItemClick }) => {
  // 组件逻辑
});

// 工具栏项组件使用React.memo
const ToolbarItem = React.memo(({ item, theme, onItemClick, selectedData }) => {
  // 组件逻辑
});
```

#### 4.4.2 使用useMemo和useCallback
```typescript
// 使用useMemo缓存计算结果
const processedItems = useMemo(() => {
  return items.map(item => {
    // 处理工具栏项
    return item;
  });
}, [items]);

// 使用useCallback缓存回调函数
const handleItemClick = useCallback(async (item: any, selectedData: SelectedData) => {
  try {
    await toolbarManager.executeAction(item, selectedData);
  } catch (error) {
    logger.error('Error executing action:', error);
  }
}, []);
```

### 4.5 事件处理优化

#### 4.5.1 事件委托
```typescript
// 使用事件委托处理工具栏项点击
const handleToolbarClick = useCallback((e: React.MouseEvent) => {
  const target = e.target as HTMLElement;
  const toolbarItem = target.closest('.ltt-toolbar-item');
  if (toolbarItem) {
    const itemId = toolbarItem.dataset.itemId;
    if (itemId) {
      const item = items.find(i => i.id === itemId);
      if (item) {
        handleItemClick(item, selectedData);
      }
    }
  }
}, [items, selectedData, handleItemClick]);

// 在工具栏容器上绑定单个点击事件
<div className="ltt-toolbar-container" onClick={handleToolbarClick}>
  {/* 工具栏项 */}
</div>
```

#### 4.5.2 优化事件监听器
```typescript
// 优化事件监听器绑定
useEffect(() => {
  if (!targetElement) return;

  // 使用防抖处理
  const debouncedUpdate = useDebounce(updateToolbarPosition, 100);

  const handleSelection = (e: MouseEvent) => {
    if (e.target && ((e.target as HTMLElement).closest('.ltt-floating-toolbar') || (e.target as HTMLElement).closest('.ltt-toolbar-container') || (e.target as HTMLElement).closest('.ltt-toolbar-group-dropdown'))) {
      return;
    }
    debouncedUpdate();
  };

  // 只绑定必要的事件监听器
  targetElement.addEventListener('mouseup', handleSelection);
  
  // 滚动事件使用节流
  const throttledScroll = useThrottle(updateToolbarPosition, 100);
  window.addEventListener('scroll', throttledScroll, true);

  return () => {
    targetElement.removeEventListener('mouseup', handleSelection);
    window.removeEventListener('scroll', throttledScroll, true);
  };
}, [targetElement, updateToolbarPosition]);
```

## 5. 实施计划

### 5.1 阶段一：基础优化
1. 实现防抖和节流函数
2. 优化事件处理逻辑
3. 缓存API调用结果

### 5.2 阶段二：核心功能优化
1. 优化工具栏位置计算
2. 优化API调用方式
3. 优化渲染性能

### 5.3 阶段三：高级优化
1. 实现组件延迟加载
2. 优化DOM操作
3. 优化事件监听器管理

### 5.4 阶段四：测试与验证
1. 性能测试
2. 用户体验测试
3. 兼容性测试

## 6. 预期效果

- **响应速度提升**: 工具栏显示和隐藏更加流畅
- **CPU使用率降低**: 减少不必要的计算和API调用
- **内存使用优化**: 减少内存泄漏和不必要的内存占用
- **用户体验改善**: 工具栏操作更加流畅，无卡顿
- **电池寿命延长**: 减少不必要的计算，延长设备电池寿命

## 7. 风险评估

### 7.1 潜在风险
1. **防抖延迟**: 防抖可能导致工具栏显示延迟，影响用户体验
2. **缓存过期**: 缓存的数据可能过期，导致显示错误的信息
3. **兼容性问题**: 某些优化可能在不同浏览器中表现不同
4. **调试困难**: 防抖和缓存可能使调试变得更加困难

### 7.2 缓解措施
1. **合理的防抖延迟**: 设置适当的防抖延迟，平衡性能和用户体验
2. **缓存失效机制**: 实现缓存失效机制，确保数据及时更新
3. **跨浏览器测试**: 在不同浏览器中测试优化效果
4. **调试工具**: 使用调试工具监控性能和缓存状态

## 8. 结论

通过实施这个性能优化方案，可以显著提升应用的性能和用户体验。方案针对当前存在的性能瓶颈，采用了防抖、节流、缓存、延迟加载等多种优化技术，从事件处理、API调用、渲染性能和计算性能等多个方面进行了优化。虽然优化过程中可能会遇到一些挑战，但从长期来看，这些优化将大大提升应用的性能和用户体验，为用户提供更加流畅的使用体验。