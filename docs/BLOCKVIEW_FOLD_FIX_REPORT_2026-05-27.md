# BlockView 折叠/展开功能问题分析报告

## 🔍 问题识别

### 问题描述
BlockView 的多个视图（Table, Gallery, Mindmap）使用 `display: none !important;` 隐藏了 `.block-control` 和 `.block-control-wrap` 元素，这破坏了 Logseq 原生的折叠/展开功能。

### 问题位置

#### 1. **tableView.css**

```css
/* 第510-512行 */
.ltt-table-root .block-control-wrap {
  border-left: none !important;
}

/* 第514-516行 */
.ltt-table-root .block-control-wrap::before {
  display: none !important;
}

/* 第694-696行 */
.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-main-container .block-control-wrap {
  display: none !important;
}

/* 第704-706行 */
.ltt-table-root .block-control {
  display: none !important;
}
```

#### 2. **galleryView.css**

```css
/* 第396-398行 */
.ltt-gallery-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-main-container .block-control-wrap {
  display: none !important;
}

/* 第421-423行 */
.ltt-gallery-root .block-control {
  display: none !important;
}

/* 第461-467行 */
.ltt-gallery-root .block-control-wrap {
  border-left: none !important;
}

.ltt-gallery-root .block-control-wrap::before {
  display: none !important;
}
```

#### 3. **mindMapView.css**

```css
/* 第111-113行 */
.ltt-mindmap-root > .block-main-container .block-control-wrap {
  display: none !important;
}

/* 第249-253行 */
.ltt-mindmap-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-main-container .block-control-wrap {
  display: flex !important;
  opacity: 0.3;
  transition: opacity 0.15s ease;
}

/* 第259-261行 */
.ltt-mindmap-root .block-control {
  display: none !important;
}
```

#### 4. **boardView.css**

需要进一步检查...

---

## 🎯 影响分析

### 受影响的功能
1. ❌ **折叠按钮点击** - 用户无法点击折叠/展开按钮
2. ❌ **快捷键操作** - Logseq 的折叠快捷键可能失效
3. ❌ **视觉反馈** - 折叠状态的视觉指示消失

### 受影响的视图
- 🟡 **Table View** - 部分隐藏，但有子视图保留
- 🟡 **Gallery View** - 部分隐藏
- 🔴 **Mindmap View** - 完全隐藏
- 🟡 **Board View** - 需要检查

---

## 🔧 修复方案

### 方案一：保留控制元素但调整样式（推荐）

**原理：** 不隐藏元素，只是调整其样式使其不影响视图美观

```css
/* 修改前 */
.ltt-mindmap-root .block-control {
  display: none !important;
}

/* 修改后 */
.ltt-mindmap-root .block-control {
  position: absolute;  /* 绝对定位 */
  opacity: 0;          /* 完全透明但可点击 */
  pointer-events: auto; /* 保持可点击 */
  width: 16px;
  height: 16px;
  margin-right: 4px;
}

/* 悬停时显示 */
.ltt-mindmap-root .ls-block:hover .block-control {
  opacity: 0.5;
}

/* 保持折叠指示器可见 */
.ltt-mindmap-root .block-control-wrap {
  position: absolute;
  left: -20px;
  top: 2px;
  opacity: 0.3;
  pointer-events: auto;
  cursor: pointer;
}

.ltt-mindmap-root .block-control-wrap:hover {
  opacity: 0.7;
}
```

### 方案二：使用 CSS 变量控制

**原理：** 添加配置选项让用户决定是否显示控制元素

```css
/* 定义 CSS 变量 */
:root {
  --ltt-show-block-control: 0; /* 默认隐藏 */
}

.ltt-mindmap-root {
  /* 使用变量控制 */
  .block-control {
    opacity: var(--ltt-show-block-control);
    pointer-events: auto;
  }
  
  /* 用户可以覆盖 */
  &.show-controls {
    --ltt-show-block-control: 0.5;
  }
}
```

### 方案三：JavaScript 控制（不推荐）

**原理：** 在视图切换时动态添加/移除类

**缺点：**
- ❌ 增加 JavaScript 复杂度
- ❌ 可能导致 FOUC (Flash of Unstyled Content)
- ❌ 性能开销

---

## 📝 具体修复步骤

### 步骤 1：修复 mindMapView.css

```css
/* 文件: src/components/BlockView/mindmapView.css */

/* 替换第259-261行的规则 */
.ltt-mindmap-root .block-control {
  /* 隐藏内容但保持可点击 */
  position: absolute;
  opacity: 0;
  pointer-events: auto;
  width: 14px;
  height: 14px;
  margin: 0 2px;
}

/* 添加悬停效果 */
.ltt-mindmap-root .ls-block:hover > .block-main-container > .block-control-wrap {
  opacity: 0.5;
}

/* 替换第111-113行的规则 */
.ltt-mindmap-root > .block-main-container .block-control-wrap {
  position: absolute;
  left: -18px;
  top: 3px;
  opacity: 0.3;
  pointer-events: auto;
  z-index: 100;
  transition: opacity 0.15s ease;
}

.ltt-mindmap-root > .block-main-container:hover .block-control-wrap {
  opacity: 0.7;
}
```

### 步骤 2：修复 tableView.css

```css
/* 文件: src/components/BlockView/tableView.css */

/* 替换第704-706行的规则 */
.ltt-table-root .block-control {
  position: relative;
  opacity: 0;
  pointer-events: auto;
  width: 14px;
  height: 14px;
  margin: 0 2px;
}

/* 表格单元格中显示控制元素 */
.ltt-table-root .ls-block:hover .block-control {
  opacity: 0.5;
}

/* 保留表格列中的控制元素 */
.ltt-table-root .block-control-wrap {
  display: flex !important;
  align-items: center;
  opacity: 0.3;
  pointer-events: auto;
  transition: opacity 0.15s ease;
}

.ltt-table-root .ls-block:hover .block-control-wrap {
  opacity: 0.7;
}

.ltt-table-root .block-control-wrap::before {
  display: none; /* 移除装饰线 */
}
```

### 步骤 3：修复 galleryView.css

```css
/* 文件: src/components/BlockView/galleryView.css */

/* 替换相关规则 */
.ltt-gallery-root .block-control {
  position: relative;
  opacity: 0;
  pointer-events: auto;
  width: 14px;
  height: 14px;
  margin: 0 2px;
}

.ltt-gallery-root .ls-block:hover .block-control {
  opacity: 0.5;
}

.ltt-gallery-root .block-control-wrap {
  display: flex !important;
  align-items: center;
  opacity: 0.3;
  pointer-events: auto;
  transition: opacity 0.15s ease;
  border-left: none;
}

.ltt-gallery-root .ls-block:hover .block-control-wrap {
  opacity: 0.7;
}

.ltt-gallery-root .block-control-wrap::before {
  display: none;
}
```

---

## 🧪 测试计划

### 测试用例

1. **折叠功能测试**
   - ✅ 点击折叠按钮可以折叠块
   - ✅ 再次点击可以展开块
   - ✅ 折叠后子块应该隐藏
   - ✅ 展开后子块应该显示

2. **快捷键测试**
   - ✅ Tab 键可以折叠块
   - ✅ Shift+Tab 键可以展开块
   - ✅ 快捷键在各视图中都有效

3. **视觉反馈测试**
   - ✅ 悬停时应该显示控制元素
   - ✅ 折叠状态应该有视觉指示
   - ✅ 不影响视图的整体美观

4. **性能测试**
   - ✅ 视图切换流畅
   - ✅ 无 FOUC 问题
   - ✅ 动画平滑

---

## 📅 实施时间表

1. **Day 1**: 修复 mindmapView.css (最严重)
2. **Day 2**: 修复 tableView.css
3. **Day 3**: 修复 galleryView.css
4. **Day 4**: 测试和优化
5. **Day 5**: 验证所有视图

---

## ⚠️ 注意事项

1. **向后兼容** - 确保现有功能不受影响
2. **性能** - 避免不必要的重绘和重排
3. **可访问性** - 确保折叠状态有适当的 ARIA 属性
4. **移动端** - 考虑触摸设备的交互方式

---

## 🔄 回滚计划

如果修复导致问题：
1. 保留 CSS 备份
2. 使用 Git 分支管理更改
3. 分阶段部署
4. 监控系统错误

