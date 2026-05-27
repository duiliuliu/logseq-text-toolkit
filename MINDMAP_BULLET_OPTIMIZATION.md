# BlockView MindMap 和 Bullet 优化方案

## 📋 问题概述

当前 BlockView 的 MindMap 和 Bullet 样式存在以下问题：
1. ❌ **视觉割裂** - MindMap节点之间缺乏连贯性
2. ❌ **Bullet样式不一致** - 不同层级的bullet样式差异大
3. ❌ **连接线不自然** - 当前的连接线设计过于生硬
4. ❌ **层次感不清晰** - 多级嵌套时视觉层次不明确

---

## 🔍 参考项目分析

### 项目: `logseq-plugin-bullet-threading`

**核心特性:**
1. **自动注入 bullet_threading.css** - 从 dev theme 引入
2. **活跃块高亮** - 当前编辑的块会有明显的视觉反馈
3. **线程化连接线** - 父子块之间使用垂直连接线
4. **圆点Bullet** - 使用圆点样式表示层级关系

**实现原理:**
```typescript
// 自动注入 CSS
const injectCSS = () => {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://cdn.jsdelivr.net/gh/pengx17/logseq-dev-theme@master/bullet_threading.css'
  document.head.appendChild(link)
}
```

---

## 🎯 优化方案

### 方案 1: 统一的 Bullet 样式

#### 当前问题
```css
/* 一级节点 */
.ltt-mindmap-root .block-main-container::after {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* 二级节点 */
.ltt-mindmap-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-main-container::before {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
```

#### 优化方案
```css
/* 统一所有层级的 bullet 样式 */
.ltt-mindmap-root .ls-block > .block-main-container::before {
  /* 使用 CSS 变量控制 */
  width: var(--ltt-bullet-size, 8px);
  height: var(--ltt-bullet-size, 8px);
  border-radius: 50%;
  background: var(--ltt-bullet-color);
  box-shadow: 0 0 0 2px var(--ltt-node-bg);
}

/* 根据层级调整大小 */
.ltt-mindmap-root .ls-block[data-level="1"] > .block-main-container::before {
  width: 10px;
  height: 10px;
}

.ltt-mindmap-root .ls-block[data-level="2"] > .block-main-container::before {
  width: 8px;
  height: 8px;
}

.ltt-mindmap-root .ls-block[data-level="3"] > .block-main-container::before {
  width: 6px;
  height: 6px;
}

/* 使用渐变表示层级 */
.ltt-mindmap-root .ls-block[data-level="1"] > .block-main-container::before {
  background: linear-gradient(135deg, var(--ltt-primary-color), var(--ltt-bullet-color));
}

.ltt-mindmap-root .ls-block[data-level="2"] > .block-main-container::before {
  background: var(--ltt-bullet-color);
}

.ltt-mindmap-root .ls-block[data-level="3"] > .block-main-container::before {
  background: linear-gradient(135deg, var(--ltt-bullet-color) 50%, transparent 50%);
}
```

---

### 方案 2: 平滑的连接线

#### 当前问题
```css
/* 生硬的连接线 */
.ltt-mindmap-root > .block-children-container::before {
  width: 32px;
  height: var(--ltt-connector-width); /* 2px */
  background: var(--ltt-connector-color);
}

/* 直角连接 */
.ltt-mindmap-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-main-container::before {
  width: 28px;
  /* ... */
}
```

#### 优化方案
```css
/* 使用 SVG 或 Canvas 绘制平滑曲线 */

/* 方案 A: CSS 渐变模拟曲线 */
.ltt-mindmap-root .ls-block > .block-main-container {
  position: relative;
}

.ltt-mindmap-root .ls-block > .block-main-container::before {
  content: '';
  position: absolute;
  left: -20px;
  top: 50%;
  transform: translateY(-50%);
  
  /* 使用渐变创建曲线效果 */
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--ltt-connector-color) 30%,
    var(--ltt-connector-color) 70%,
    transparent 100%
  );
  
  width: 20px;
  height: 2px;
  
  /* 添加箭头指示 */
  &::after {
    content: '';
    position: absolute;
    right: -4px;
    top: 50%;
    transform: translateY(-50%);
    border: 4px solid transparent;
    border-left-color: var(--ltt-connector-color);
  }
}

/* 方案 B: 使用 SVG 路径 */
.ltt-mindmap-root .ltt-connector {
  position: absolute;
  pointer-events: none;
  z-index: -1;
}

.ltt-mindmap-root .ltt-connector path {
  fill: none;
  stroke: var(--ltt-connector-color);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* 方案 C: 弹性动画连接线 */
@keyframes ltt-connector-pulse {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}

.ltt-mindmap-root .ls-block:hover > .block-main-container::before {
  animation: ltt-connector-pulse 2s ease-in-out infinite;
  background: var(--ltt-primary-color);
}
```

---

### 方案 3: 层次颜色编码

#### 当前问题
- 所有层级使用相同的颜色
- 无法快速区分父子关系

#### 优化方案
```css
/* 根据层级使用不同颜色 */

/* 一级: 主要颜色 */
.ltt-mindmap-root .ls-block[data-level="1"] > .block-main-container {
  border-left: 3px solid var(--ltt-primary-color);
  border-left-color: var(--ltt-primary-color);
}

/* 二级: 次要颜色 */
.ltt-mindmap-root .ls-block[data-level="2"] > .block-main-container {
  border-left: 3px solid var(--ltt-secondary-color, #6b7280);
}

/* 三级: 柔和颜色 */
.ltt-mindmap-root .ls-block[data-level="3"] > .block-main-container {
  border-left: 3px solid var(--ltt-muted-color, #9ca3af);
}

/* 四级及以下: 最柔和 */
.ltt-mindmap-root .ls-block[data-level="4"],
.ltt-mindmap-root .ls-block[data-level="5"] {
  > .block-main-container {
    border-left: 3px solid var(--ltt-faded-color, #d1d5db);
  }
}

/* 激活状态的层次反馈 */
.ltt-mindmap-root .ls-block:hover > .block-main-container {
  border-left-color: var(--ltt-primary-color);
  border-left-width: 4px;
}
```

---

### 方案 4: Bullet 线程化连接

#### 参考项目实现
```css
/* bullet_threading.css 核心样式 */
.blocks-container {
  position: relative;
  padding-left: 20px;
}

.ls-block {
  position: relative;
}

/* 垂直连接线 */
.ls-block::before {
  content: '';
  position: absolute;
  left: -10px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--ls-border-color);
}

/* 最后一个块不显示延伸线 */
.ls-block:last-child::before {
  bottom: 50%;
}

/* 圆点连接点 */
.ls-block::after {
  content: '';
  position: absolute;
  left: -13px;
  top: 12px;
  width: 8px;
  height: 8px;
  background: var(--ls-primary-color);
  border-radius: 50%;
  border: 2px solid var(--ls-primary-background-color);
}
```

#### 应用于 MindMap
```css
/* MindMap 的线程化 Bullet */
.ltt-mindmap-root {
  /* 垂直连接线 */
  .ls-block > .block-main-container::before {
    content: '';
    position: absolute;
    left: -15px;
    top: -50%;
    bottom: 50%;
    width: 2px;
    background: linear-gradient(
      to bottom,
      transparent,
      var(--ltt-connector-color)
    );
  }
  
  /* 最后一个块不延伸 */
  .ls-block:last-child > .block-main-container::before {
    bottom: 50%;
    top: -8px;
  }
  
  /* 第一个块不向上延伸 */
  .ls-block:first-child > .block-main-container::before {
    top: 50%;
    bottom: -8px;
  }
  
  /* 单独一个块不显示连接线 */
  .ls-block:only-child > .block-main-container::before {
    display: none;
  }
  
  /* 圆点 Bullet */
  .ls-block > .block-main-container::after {
    content: '';
    position: absolute;
    left: -18px;
    top: 50%;
    transform: translateY(-50%);
    width: var(--ltt-bullet-size);
    height: var(--ltt-bullet-size);
    background: var(--ltt-bullet-color);
    border-radius: 50%;
    border: 2px solid var(--ltt-node-bg);
    box-shadow: 0 0 0 1px var(--ltt-bullet-color);
    transition: all 0.2s ease;
  }
  
  /* Hover 状态 */
  .ls-block:hover > .block-main-container::after {
    background: var(--ltt-primary-color);
    box-shadow: 0 0 0 2px var(--ltt-node-bg), 0 0 0 4px var(--ltt-primary-color);
    transform: translateY(-50%) scale(1.2);
  }
  
  /* 激活状态 */
  .ls-block.active > .block-main-container::after {
    background: var(--ltt-primary-color);
    box-shadow: 0 0 0 3px var(--ltt-node-bg), 0 0 8px var(--ltt-primary-color);
  }
}
```

---

### 方案 5: 活跃块高亮

```css
/* 当前编辑的块 */
.ltt-mindmap-root .ls-block:focus-within > .block-main-container {
  border-color: var(--ltt-primary-color);
  border-width: 2px;
  box-shadow: 0 0 0 4px rgba(var(--ltt-primary-rgb), 0.1);
}

/* 活跃路径高亮 */
.ltt-mindmap-root .ls-block:focus-within {
  /* 祖先节点 */
  .ls-block {
    opacity: 1;
  }
  
  /* 非祖先节点变淡 */
  ~ .ls-block {
    opacity: 0.6;
  }
}

/* 脉冲动画 */
@keyframes ltt-active-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(var(--ltt-primary-rgb), 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(var(--ltt-primary-rgb), 0);
  }
}

.ltt-mindmap-root .ls-block:focus-within > .block-main-container {
  animation: ltt-active-pulse 2s ease-in-out infinite;
}
```

---

## 🎨 具体实现步骤

### 步骤 1: 统一变量定义

在 `mindMapView.css` 的 `:root` 部分添加：

```css
:root {
  /* 层级颜色编码 */
  --ltt-level-1-color: var(--ltt-primary-color, #3b82f6);
  --ltt-level-2-color: #6b7280;
  --ltt-level-3-color: #9ca3af;
  --ltt-level-4-color: #d1d5db;
  
  /* 活跃块颜色 */
  --ltt-active-bg: rgba(59, 130, 246, 0.1);
  --ltt-active-border: var(--ltt-primary-color);
  
  /* 动画 */
  --ltt-transition-fast: 0.15s ease;
  --ltt-transition-normal: 0.2s ease;
  --ltt-transition-slow: 0.3s ease;
}
```

### 步骤 2: 修改 Bullet 样式

替换第 207-229 行的样式：

```css
/* 一级节点 Bullet - 替换第 207-229 行 */
.ltt-mindmap-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-main-container::before {
  content: '';
  position: absolute;
  left: -18px;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  background: linear-gradient(135deg, var(--ltt-level-1-color), var(--ltt-level-2-color));
  border-radius: 50%;
  border: 2px solid var(--ltt-node-bg);
  box-shadow: 0 0 0 1px var(--ltt-level-1-color);
  transition: all var(--ltt-transition-normal);
}

/* Hover 效果 */
.ltt-mindmap-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block:hover > .block-main-container::before {
  transform: translateY(-50%) scale(1.3);
  box-shadow: 0 0 0 3px var(--ltt-node-bg), 0 0 0 5px var(--ltt-level-1-color);
}
```

### 步骤 3: 添加连接线优化

在第 132-152 行之间添加平滑连接线：

```css
/* 替换第 132-152 行 - 平滑连接线 */
.ltt-mindmap-root > .block-children-container::before {
  content: '';
  position: absolute;
  left: 100px;
  top: 24px;
  width: 48px;
  height: 2px;
  background: linear-gradient(
    90deg,
    var(--ltt-connector-color),
    var(--ltt-level-1-color)
  );
  border-radius: 1px;
}

/* 箭头指示器 */
.ltt-mindmap-root > .block-children-container::after {
  content: '';
  position: absolute;
  left: 148px;
  top: 20px;
  border: 6px solid transparent;
  border-left-color: var(--ltt-level-1-color);
  opacity: 0.8;
}
```

### 步骤 4: 添加层次颜色

在第 258 行之后添加：

```css
/* 添加层次边界线 - 新增 */
.ltt-mindmap-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-main-container {
  border-left: 3px solid var(--ltt-level-1-color);
}

.ltt-mindmap-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-main-container {
  border-left: 3px solid var(--ltt-level-2-color);
}

.ltt-mindmap-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-main-container {
  border-left: 3px solid var(--ltt-level-3-color);
}
```

---

## 🧪 测试计划

### 测试用例

1. **Bullet 样式测试**
   - ✅ 一级节点: 10px 渐变圆点
   - ✅ 二级节点: 8px 纯色圆点
   - ✅ 三级节点: 6px 半圆点
   - ✅ Hover 效果: 放大 + 阴影

2. **连接线测试**
   - ✅ 平滑渐变效果
   - ✅ 箭头指向正确
   - ✅ 动画流畅

3. **层次编码测试**
   - ✅ 左侧边界线颜色正确
   - ✅ 层级关系清晰

4. **活跃块测试**
   - ✅ 编辑时高亮
   - ✅ 祖先节点保持可见
   - ✅ 脉冲动画正常

---

## 📊 预期效果

### 优化前
- ❌ 单调的 8px 圆点
- ❌ 生硬的 2px 连接线
- ❌ 无层次区分
- ❌ 静态无交互

### 优化后
- ✅ 多尺寸渐变圆点 (6-10px)
- ✅ 平滑渐变连接线
- ✅ 颜色编码层次
- ✅ 悬停和激活交互
- ✅ 平滑动画效果

---

---

## 🎯 场景 3 优化：包含引号的文本处理

### 问题分析
在 MindMap 视图中，当节点内容包含引号（双引号 `"` 或单引号 `'`）时，可能会导致以下问题：
1. **hiccup 解析错误** - 未正确转义的引号会破坏 hiccup 语法
2. **显示异常** - 文本被截断或格式错乱
3. **交互问题** - 包含引号的文本可能影响折叠/展开功能

### 优化方案

#### 方案 1: 文本转义处理
```typescript
// 在 utils.ts 中添加文本转义函数
export const escapeHiccupText = (text: string): string => {
  // 转义双引号
  return text.replace(/"/g, '\\"');
};

// 在需要包裹引号时使用
export const wrapTextForHiccup = (text: string): string => {
  if (needsQuotes(text)) {
    return `"${escapeHiccupText(text)}"`;
  }
  return text;
};
```

#### 方案 2: CSS 文本处理优化
```css
/* 在 mindMapView.css 中添加文本溢出处理 */
.ltt-mindmap-root .block-title-wrap {
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

/* 特殊字符显示优化 */
.ltt-mindmap-root .block-title-wrap {
  font-variant-ligatures: none;
  text-rendering: optimizeLegibility;
}

/* 确保引号正确显示 */
.ltt-mindmap-root .block-title-wrap {
  quotes: '"' '"' "'" "'";
}
```

#### 方案 3: 渲染时的防护处理
```typescript
// 在 BlockView 组件中添加内容防护
const safeRenderContent = (content: string) => {
  // 1. 移除或转义可能破坏布局的字符
  let safeContent = content
    .replace(/\u2028/g, '') // 移除行分隔符
    .replace(/\u2029/g, '') // 移除段分隔符
    .replace(/\u0000/g, ''); // 移除空字符
  
  return safeContent;
};
```

### 实现步骤
1. **添加转义函数** - 在 `utils.ts` 中添加 `escapeHiccupText` 和 `wrapTextForHiccup` 函数
2. **更新 CSS** - 在 `mindMapView.css` 中添加文本处理样式
3. **集成到渲染流程** - 在 BlockView 组件渲染前对内容进行安全处理
4. **测试验证** - 测试包含各种引号的文本场景

### 测试用例
- ✅ 包含双引号的文本: `He said "Hello"`
- ✅ 包含单引号的文本: `It's a test`
- ✅ 混合引号的文本: `She said "It's mine"`
- ✅ 嵌套引号的文本: `The "key" is 'value'`

---

## 🔄 回滚计划

如果优化导致问题：
1. 保留原始 CSS 备份
2. 使用 Git 分支管理
3. 分阶段部署
4. 监控系统性能

