# CSS 变量统一化设计方案

## 一、现状分析

### 1.1 CSS 文件结构

```
src/
├── main.css                          # 全局变量定义
├── App.css                           # 应用级样式
├── components/
│   ├── Heatmap/heatmap.css           # 热力图组件
│   ├── BlockView/
│   │   ├── blockView.css             # 块视图基础样式
│   │   ├── tableView.css
│   │   ├── galleryView.css
│   │   ├── boardView.css
│   │   ├── mindMapView.css
│   │   └── listView.css
│   ├── Toolbar/toolbar.css           # 工具栏组件
│   ├── Summary/summary.css           # 摘要组件
│   ├── Modal/modal.css               # 模态框组件
│   ├── SettingsModal/settingsModal.css
│   ├── TaskProgress/taskProgress.css # 任务进度组件
│   ├── Comment/inlineComment.css     # 行内评论组件
│   ├── CustomSelect/customSelect.css
│   ├── SelectToolbar/customsToolbarItems.css
│   └── ui/textarea.css
```

### 1.2 现有变量命名问题

| 问题类型 | 现状 | 影响 |
|---------|------|------|
| **命名不统一** | `main.css` 用 `--ls-xxx-plugin`，组件用 `--ls-xxx` 或直接用颜色值 | 维护困难 |
| **深色模式不一致** | `.dark`、`.ltt-toolbar-dark`、`[data-theme="dark"]` 混用 | 主题切换可能失效 |
| **缺少层级前缀** | heatmap 定义 `--heatmap-*`，summary 定义 `--card-*` | 变量可能冲突 |
| **硬编码颜色** | 各组件大量使用 `#ffffff`、`#000000`、`#3b82f6` | 无法统一换肤 |

### 1.3 现有变量使用情况

#### main.css 中的变量定义
```css
/* Light/Dark 基础变量 */
--background-color-light
--text-color-light
--primary-text-color-light
...
--ls-primary-background-color-plugin
--ls-secondary-background-color-plugin
...
```

#### 各组件变量使用差异
- `toolbar.css` → `--ls-primary-background-color-plugin`
- `blockView.css` → `--ls-secondary-background-color`
- `summary.css` → `--ls-secondary-background-color`
- `modal.css` → `--ls-primary-background-color-plugin`
- `heatmap.css` → 硬编码 `#ffffff`, `#171f33` 等

---

## 二、设计方案

### 2.1 变量命名规范

#### 前缀策略
| 前缀 | 用途 | 示例 |
|------|------|------|
| `--ltt-*` | 全局主题变量（Plugin） | `--ltt-bg-primary` |
| `--ltt-comp-*` | 组件公共变量 | `--ltt-comp-border-radius` |
| `--ltt-comp-[name]-*` | 组件私有变量 | `--ltt-comp-heatmap-cell-size` |

#### 变量分类
```
--ltt
├── 颜色 (color)
│   ├── bg
│   │   ├── primary
│   │   ├── secondary
│   │   └── tertiary
│   ├── text
│   │   ├── primary
│   │   ├── secondary
│   │   └── muted
│   ├── border
│   ├── accent
│   └── status
│       ├── success
│       ├── warning
│       └── error
├── 间距 (spacing)
│   ├── xs, sm, md, lg, xl
├── 圆角 (radius)
│   ├── sm, md, lg, full
├── 阴影 (shadow)
│   ├── sm, md, lg
├── 过渡 (transition)
│   ├── fast, normal, slow
└── 字体 (font)
    ├── size-xs, sm, md, lg, xl
    └── weight-normal, medium, bold
```

### 2.2 推荐的变量命名（对比表）

| 用途 | 当前命名 | 推荐命名 | 文件 |
|------|----------|----------|------|
| 主背景 | `--ls-primary-background-color-plugin` | `--ltt-bg-primary` | main.css |
| 次背景 | `--ls-secondary-background-color-plugin` | `--ltt-bg-secondary` | main.css |
| 主文本 | `--ls-primary-text-color-plugin` | `--ltt-text-primary` | main.css |
| 次文本 | `--ls-secondary-text-color-plugin` | `--ltt-text-secondary` | main.css |
| 边框 | `--ls-border-color-plugin` | `--ltt-border` | main.css |
| 强调色 | `--ls-accent-color-plugin` | `--ltt-accent` | main.css |
| 悬停色 | `--ls-hover-color-plugin` | `--ltt-hover-bg` | main.css |
| 圆角 | `--card-radius` | `--ltt-comp-radius-md` | summary.css |
| 间距 | `--card-gap` | `--ltt-comp-spacing-md` | summary.css |

### 2.3 深色模式实现规范

**推荐方案：CSS 变量自动响应**

```css
/* 浅色主题变量 */
:root,
.light-mode {
  --ltt-bg-primary: #ffffff;
  --ltt-bg-secondary: #f8fafc;
  --ltt-text-primary: #1e293b;
  --ltt-text-secondary: #64748b;
  --ltt-border: #e2e8f0;
  --ltt-accent: #3b82f6;
}

/* 深色主题变量 */
.dark-mode,
[data-theme="dark"] {
  --ltt-bg-primary: #0f172a;
  --ltt-bg-secondary: #1e293b;
  --ltt-text-primary: #f1f5f9;
  --ltt-text-secondary: #94a3b8;
  --ltt-border: #334155;
  --ltt-accent: #60a5fa;
}
```

**关键点**：
1. 所有组件统一使用 `--ltt-*` 变量
2. 深色模式通过覆盖 `:root` 的变量值实现
3. 不再需要在每个组件中写 `.dark` 或 `[data-theme="dark"]`

---

## 三、实施计划

### 3.1 风险控制原则

1. **渐进式迁移**：不一次性修改所有文件
2. **向后兼容**：保持旧变量名可用，逐步废弃
3. **测试覆盖**：每次修改后验证各组件主题切换正常
4. **分区验证**：按组件分组修改，每组完成后验证

### 3.2 分阶段实施

#### Phase 1: 变量定义标准化（低风险）
**目标**：在 `main.css` 中建立统一的变量系统

**步骤**：
1. 定义 `--ltt-*` 全局变量
2. 保留旧的 `--ls-*-plugin` 作为别名（向后兼容）
3. 添加注释说明映射关系

**验证**：构建成功，无控制台错误

#### Phase 2: 组件样式迁移（中等风险）
**目标**：将各组件中的硬编码颜色迁移到变量

**组件分组**：
| 组 | 组件 | 风险 |
|----|------|------|
| A | heatmap.css | 高（样式复杂） |
| B | toolbar.css, blockView.css | 中 |
| C | modal.css, summary.css | 低 |
| D | settingsModal.css, taskProgress.css | 低 |
| E | inlineComment.css, customSelect.css | 低 |

**步骤**：
1. 先修改组 C、D、E（风险低）
2. 再修改组 B
3. 最后修改组 A

**验证**：各组件在浅色/深色模式下显示正常

#### Phase 3: 深色模式统一（中风险）
**目标**：统一使用 CSS 变量响应式方案

**步骤**：
1. 将所有 `.dark`、`.ltt-toolbar-dark`、`[data-theme="dark"]` 改为统一方案
2. 删除冗余的深色样式定义

**验证**：主题切换功能正常

#### Phase 4: 变量清理（收尾）
**目标**：移除未使用的旧变量

**步骤**：
1. 统计 `--ls-*-plugin` 的使用情况
2. 移除无使用的变量
3. 添加废弃警告注释

---

## 四、变量定义参考

### 4.1 完整变量列表（推荐）

```css
/* ============================================
   LTT (Logseq Text Toolkit) Design Tokens
   ============================================ */

:root {
  /* ---- 颜色 - 背景 ---- */
  --ltt-bg-primary: #ffffff;
  --ltt-bg-secondary: #f8fafc;
  --ltt-bg-tertiary: #f1f5f9;
  --ltt-bg-hover: #e2e8f0;
  --ltt-bg-inverse: #0f172a;

  /* ---- 颜色 - 文本 ---- */
  --ltt-text-primary: #1e293b;
  --ltt-text-secondary: #64748b;
  --ltt-text-muted: #94a3b8;
  --ltt-text-inverse: #f8fafc;

  /* ---- 颜色 - 边框 ---- */
  --ltt-border: #e2e8f0;
  --ltt-border-strong: #cbd5e1;

  /* ---- 颜色 - 强调 ---- */
  --ltt-accent: #3b82f6;
  --ltt-accent-hover: #2563eb;
  --ltt-accent-muted: #dbeafe;

  /* ---- 颜色 - 状态 ---- */
  --ltt-success: #10b981;
  --ltt-warning: #f59e0b;
  --ltt-error: #ef4444;
  --ltt-info: #3b82f6;

  /* ---- 间距 ---- */
  --ltt-spacing-xs: 4px;
  --ltt-spacing-sm: 8px;
  --ltt-spacing-md: 12px;
  --ltt-spacing-lg: 16px;
  --ltt-spacing-xl: 24px;

  /* ---- 圆角 ---- */
  --ltt-radius-sm: 4px;
  --ltt-radius-md: 6px;
  --ltt-radius-lg: 8px;
  --ltt-radius-xl: 12px;
  --ltt-radius-full: 9999px;

  /* ---- 阴影 ---- */
  --ltt-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --ltt-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --ltt-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

  /* ---- 过渡 ---- */
  --ltt-transition-fast: 150ms ease;
  --ltt-transition-normal: 200ms ease;
  --ltt-transition-slow: 300ms ease;

  /* ---- 字体 ---- */
  --ltt-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --ltt-font-size-xs: 10px;
  --ltt-font-size-sm: 12px;
  --ltt-font-size-md: 14px;
  --ltt-font-size-lg: 16px;
  --ltt-font-size-xl: 18px;

  /* ---- 向后兼容别名 ---- */
  --ls-primary-background-color-plugin: var(--ltt-bg-primary);
  --ls-secondary-background-color-plugin: var(--ltt-bg-secondary);
  --ls-primary-text-color-plugin: var(--ltt-text-primary);
  --ls-secondary-text-color-plugin: var(--ltt-text-secondary);
  --ls-border-color-plugin: var(--ltt-border);
  --ls-accent-color-plugin: var(--ltt-accent);
  --ls-hover-color-plugin: var(--ltt-bg-hover);
  --ls-focus-color-plugin: var(--ltt-accent-muted);
}

/* ---- 深色主题 ---- */
.dark-mode,
[data-theme="dark"] {
  --ltt-bg-primary: #0f172a;
  --ltt-bg-secondary: #1e293b;
  --ltt-bg-tertiary: #334155;
  --ltt-bg-hover: #475569;
  --ltt-text-primary: #f1f5f9;
  --ltt-text-secondary: #94a3b8;
  --ltt-text-muted: #64748b;
  --ltt-border: #334155;
  --ltt-border-strong: #475569;
  --ltt-accent: #60a5fa;
  --ltt-accent-hover: #3b82f6;
  --ltt-accent-muted: #1e3a8a;
}
```

---

## 五、迁移检查清单

### 5.1 迁移前检查
- [ ] 确认所有 CSS 文件备份
- [ ] 确认自动化测试通过
- [ ] 记录各组件使用的变量

### 5.2 迁移后验证
- [ ] 浅色模式下所有组件显示正常
- [ ] 深色模式下所有组件显示正常
- [ ] 主题切换功能正常
- [ ] 无控制台错误
- [ ] 响应式布局正常

### 5.3 性能检查
- [ ] 无样式闪烁（FOWC）
- [ ] CSS 文件大小未显著增加

---

## 六、替代方案对比

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **统一变量方案** | 统一管理、换肤方便 | 迁移工作量大 | ⭐⭐⭐ |
| **CSS-in-JS** | 组件化、动态主题 | 运行时开销、SSR复杂 | ⭐⭐ |
| **Tailwind 插件** | 已有工具链 | 学习成本、HTML冗余 | ⭐⭐ |
| **CSS Modules** | 作用域隔离 | 难以共享主题 | ⭐ |

---

## 七、总结

**推荐采用方案：统一 CSS 变量 + 渐进式迁移**

1. **低风险**：通过向后兼容别名保证现有功能不受影响
2. **可测试**：每个阶段完成后都可验证
3. **可回滚**：任何阶段出问题可单独回滚
4. **长期价值**：建立统一的设计系统，为未来换肤功能打基础

**预计工作量**：
- Phase 1: 1-2 天
- Phase 2: 3-5 天（按组分批）
- Phase 3: 1-2 天
- Phase 4: 0.5 天

**总工期：约 1-2 周**
