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

### 2.1 类名前缀规范（重要）

**所有 CSS 类名必须使用 `ltt-` 前缀，避免与其他插件样式冲突**

| 组件 | 当前类名 | 推荐类名 | 风险 |
|------|----------|----------|------|
| heatmap | `.heatmap-container` | `.ltt-heatmap-container` | 高 |
| heatmap | `.heatmap-header` | `.ltt-heatmap-header` | 高 |
| heatmap | `.heatmap-cell` | `.ltt-heatmap-cell` | 高 |
| heatmap | `.view-controls` | `.ltt-heatmap-view-controls` | 高 |
| heatmap | `.nav-btn` | `.ltt-heatmap-nav-btn` | 高 |
| summary | `.summary-modal-container` | `.ltt-summary-modal-container` | 中 |
| summary | `.summary-content` | `.ltt-summary-content` | 中 |
| summary | `.summary-section` | `.ltt-summary-section` | 中 |
| summary | `.summary-label` | `.ltt-summary-label` | 中 |
| summary | `.summary-btn` | `.ltt-summary-btn` | 中 |
| modal | `.modal-overlay` | `.ltt-modal-overlay` | 低 |
| modal | `.modal-container` | `.ltt-modal-container` | 低 |

**实施步骤**：
1. 先在 CSS 中定义新类名（带 `ltt-` 前缀），并添加旧类名别名指向新类名
2. 逐步在 React 组件中替换类名
3. 确认无使用旧类名后，移除旧类名定义

**示例**：
```css
/* 新旧类名共存阶段 */
.ltt-heatmap-container {
  background: var(--ltt-bg-primary);
  border-radius: var(--ltt-comp-radius-lg);
}

/* 向后兼容别名 - 使用同一个规则 */
.ltt-heatmap-container,
.heatmap-container {
  background: var(--ltt-bg-primary);
  border-radius: var(--ltt-comp-radius-lg);
}
```

### 2.2 变量命名规范

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

### 2.3 推荐的变量命名（对比表）

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

### 2.4 深色模式实现规范

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

## 四、详细落地设计

### 3.1 分批迁移清单

#### 第 1 批：基础设施（Phase 1）
**目标**：建立变量定义基础

| 文件 | 修改内容 | 风险 |
|------|----------|------|
| `src/main.css` | 新增 `--ltt-*` 变量定义 | 低 |
| `src/main.css` | 新增向后兼容别名 | 低 |
| `src/main.css` | 新增 `.ltt-theme-*` 主题定义 | 低 |

**测试用例**：
- [ ] 验证 `--ltt-*` 变量在控制台可访问
- [ ] 验证深色模式切换时变量值正确变化
- [ ] 验证向后兼容别名与原变量值一致

**回滚方式**：
```bash
git checkout src/main.css
```

---

#### 第 2 批：低风险组件迁移（Phase 2-1）
**目标**：迁移风险较低的组件

| 文件 | 当前类名数量 | 需修改类名数 | 风险 |
|------|-------------|-------------|------|
| `src/components/Modal/modal.css` | 8 | 8 | 低 |
| `src/components/Comment/inlineComment.css` | 15 | 15 | 低 |
| `src/components/CustomSelect/customSelect.css` | 12 | 12 | 低 |
| `src/components/ui/textarea.css` | ~5 | 5 | 低 |

**迁移步骤**：
1. 在 CSS 文件顶部添加注释：`/* TODO: 迁移到 ltt- 前缀 */`
2. 为每个类添加新类名（带 `ltt-` 前缀），保留旧类名
3. 更新对应 React 组件中的 className

**测试用例**：
- [ ] 验证 Modal 在浅色模式下显示正常
- [ ] 验证 Modal 在深色模式下显示正常
- [ ] 验证 inlineComment 弹窗显示正常
- [ ] 验证 CustomSelect 下拉菜单样式正常
- [ ] 验证 textarea 输入框样式正常

**回滚方式**：
```bash
git checkout src/components/Modal/modal.css
git checkout src/components/Comment/inlineComment.css
git checkout src/components/CustomSelect/customSelect.css
git checkout src/components/ui/textarea.css
# 同时回滚 React 组件
git checkout src/components/Modal/
git checkout src/components/Comment/
git checkout src/components/CustomSelect/
git checkout src/components/ui/
```

---

#### 第 3 批：中等风险组件（Phase 2-2）
**目标**：迁移中等复杂度的组件

| 文件 | 当前类名数量 | 需修改类名数 | 风险 |
|------|-------------|-------------|------|
| `src/components/Summary/summary.css` | 25 | 25 | 中 |
| `src/components/TaskProgress/taskProgress.css` | 20 | 20 | 中 |
| `src/components/SettingsModal/settingsModal.css` | 30 | 30 | 中 |

**迁移步骤**：
1. 先备份原文件
2. 逐个组件迁移，每个组件完成后运行测试
3. 验证深色模式兼容

**测试用例**：
- [ ] 验证 Summary 页面布局在浅色模式下正常
- [ ] 验证 Summary 页面布局在深色模式下正常
- [ ] 验证 TaskProgress 进度条样式正常
- [ ] 验证 Settings Modal 各 Tab 切换正常
- [ ] 验证开关、输入框等控件在深色模式下样式正常

**回滚方式**：
```bash
git checkout src/components/Summary/
git checkout src/components/TaskProgress/
git checkout src/components/SettingsModal/
```

---

#### 第 4 批：工具栏和块视图（Phase 2-3）
**目标**：迁移 Toolbar 和 BlockView 组件

| 文件 | 当前类名数量 | 需修改类名数 | 风险 |
|------|-------------|-------------|------|
| `src/components/Toolbar/toolbar.css` | 25 | 25 | 中 |
| `src/components/BlockView/blockView.css` | 15 | 15 | 中 |
| `src/components/BlockView/tableView.css` | ~20 | 20 | 中 |
| `src/components/BlockView/galleryView.css` | ~20 | 20 | 中 |
| `src/components/BlockView/boardView.css` | ~25 | 25 | 中 |
| `src/components/BlockView/mindMapView.css` | ~30 | 30 | 中 |

**迁移步骤**：
1. 先迁移 toolbar.css（相对独立）
2. 再迁移 blockView.css（基础样式）
3. 最后迁移各视图样式文件

**测试用例**：
- [ ] 验证 Toolbar 工具栏图标和下拉菜单正常
- [ ] 验证 Toolbar 深色主题样式正常
- [ ] 验证 BlockView 视图切换正常
- [ ] 验证 Table 视图行列样式正常
- [ ] 验证 Gallery 视图卡片布局正常
- [ ] 验证 Board 视图看板列样式正常
- [ ] 验证 MindMap 思维导图节点样式正常

**回滚方式**：
```bash
git checkout src/components/Toolbar/
git checkout src/components/BlockView/
```

---

#### 第 5 批：热力图组件（Phase 2-4）- 最高风险
**目标**：迁移最复杂的 heatmap 组件

| 文件 | 当前类名数量 | 需修改类名数 | 风险 |
|------|-------------|-------------|------|
| `src/components/Heatmap/heatmap.css` | 60+ | 60+ | 高 |
| `src/components/Heatmap/*.tsx` | - | - | 高 |

**迁移策略**：
1. **分文件迁移**：先将 heatmap.css 按功能拆分为多个文件
   - `heatmap-variables.css` - CSS 变量定义
   - `heatmap-layout.css` - 布局样式
   - `heatmap-cells.css` - 格子样式
   - `heatmap-themes.css` - 主题相关样式
   - `heatmap-dark.css` - 深色模式样式

2. **逐个功能验证**：每迁移一个文件后验证功能正常

**测试用例**：
- [ ] 验证 Year View 年视图格子显示正常
- [ ] 验证 Month View 月视图格子显示正常
- [ ] 验证 Week View 周视图格子显示正常
- [ ] 验证深色模式下格子颜色正常
- [ ] 验证点击事件正常（跳转到日期页面）
- [ ] 验证响应式布局（窄屏下正常）
- [ ] 验证热力图图例颜色正常
- [ ] 验证导航按钮样式正常

**回滚方式**：
```bash
git checkout src/components/Heatmap/
```

---

### 3.2 测试用例设计

#### 自动化测试（Vitest）

```typescript
// src/__tests__/css-tokens.test.ts

describe('CSS 变量系统', () => {
  describe('变量定义完整性', () => {
    const requiredVars = [
      '--ltt-bg-primary',
      '--ltt-bg-secondary',
      '--ltt-text-primary',
      '--ltt-text-secondary',
      '--ltt-border',
      '--ltt-accent',
      '--ltt-radius-sm',
      '--ltt-radius-md',
      '--ltt-radius-lg',
    ];

    requiredVars.forEach(varName => {
      it(`应该定义 ${varName}`, () => {
        const style = getComputedStyle(document.documentElement);
        expect(style.getPropertyValue(varName)).toBeTruthy();
      });
    });
  });

  describe('主题切换', () => {
    it('浅色模式下变量值正确', () => {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
      
      const style = getComputedStyle(document.documentElement);
      expect(style.getPropertyValue('--ltt-bg-primary').trim()).toBe('#ffffff');
    });

    it('深色模式下变量值正确', () => {
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
      
      const style = getComputedStyle(document.documentElement);
      expect(style.getPropertyValue('--ltt-bg-primary').trim()).toBe('#0f172a');
    });
  });
});
```

#### 手动测试清单

##### 通用测试
- [ ] 页面加载无控制台错误
- [ ] 所有按钮可点击
- [ ] 所有输入框可输入
- [ ] 下拉菜单可展开
- [ ] 模态框可打开和关闭
- [ ] 深色模式下所有元素可见
- [ ] 浅色模式下所有元素可见

##### 组件专项测试

| 组件 | 测试点 | 浅色 | 深色 |
|------|--------|------|------|
| Heatmap | 年视图格子数量和颜色 | [ ] | [ ] |
| Heatmap | 月视图导航和显示 | [ ] | [ ] |
| Heatmap | 点击跳转功能 | [ ] | [ ] |
| Heatmap | 响应式窄屏布局 | [ ] | [ ] |
| Toolbar | 工具栏图标显示 | [ ] | [ ] |
| Toolbar | 下拉菜单样式 | [ ] | [ ] |
| Modal | 模态框居中和遮罩 | [ ] | [ ] |
| Summary | 卡片布局和颜色 | [ ] | [ ] |
| Settings | Tab 切换和表单控件 | [ ] | [ ] |
| TaskProgress | 进度条动画和颜色 | [ ] | [ ] |

---

### 3.3 回滚策略

#### 回滚层级

| 层级 | 范围 | 回滚命令 | 影响 |
|------|------|----------|------|
| **L1-单文件** | 单个 CSS 文件 | `git checkout path/to/file.css` | 仅该文件回滚 |
| **L2-组件** | 单个组件目录 | `git checkout path/to/components/BlockView/` | 整个组件回滚 |
| **L3-批次** | 一批修改 | `git checkout HEAD~1 -- src/` | 所有未提交修改回滚 |
| **L4-全局** | 全部修改 | `git reset --hard HEAD~1` | 整个分支回滚 |

#### 回滚决策流程

```
发现问题
    │
    ▼
问题严重吗？
    │
    ├─ 否 → 继续开发，下个批次修复
    │
    └─ 是 → 需要回滚
              │
              ▼
          影响范围？
              │
              ├─ 单文件 → L1 回滚
              │
              ├─ 单组件 → L2 回滚
              │
              ├─ 多组件同批次 → L3 回滚
              │
              └─ 核心变量问题 → L4 回滚到 Phase 1 之前
```

#### 回滚后修复流程

1. **分析问题**：确定是变量定义问题还是组件使用问题
2. **制定修复方案**：针对问题类型制定修复步骤
3. **小步验证**：每修复一处就验证一次
4. **回归测试**：全部修复后运行完整测试

#### 紧急回滚脚本

```bash
#!/bin/bash
# 回滚到上一个稳定版本

echo "正在回滚 CSS 变量迁移..."

# 保存当前修改（以防需要恢复）
git stash

# 检查是否需要回滚到特定版本
if [ "$1" == "--full" ]; then
    echo "执行完整回滚..."
    git reset --hard HEAD~1
elif [ "$1" == "--batch" ]; then
    echo "回滚最近一批修改..."
    git reset --soft HEAD~1
else
    echo "默认回滚最近一次提交..."
    git checkout HEAD~1 -- src/
fi

echo "回滚完成。请运行测试验证。"
```

---

### 3.4 风险缓解措施

#### 预防措施

| 措施 | 说明 | 实施时机 |
|------|------|----------|
| **功能开关** | 添加 `ENABLE_LTT_CSS_REFACTOR` 环境变量 | Phase 1 |
| **灰度发布** | 新 CSS 使用独立 class，逐步启用 | Phase 2 |
| **对比快照** | 截图对比修改前后样式差异 | 每个批次 |
| **Code Review** | 每个修改必须经过 Review | 每个 PR |

#### 监控措施

| 监控项 | 监控方式 | 阈值 |
|--------|----------|------|
| 控制台错误 | console.error 捕获 | > 0 |
| 样式计算错误 | Chrome DevTools | 0 |
| 布局偏移 | Layout Shift API | CLS < 0.1 |
| 页面加载时间 | Performance API | < 2s |

#### 应急响应

1. **发现问题**：通过测试或用户反馈
2. **评估影响**：确定影响范围和严重程度
3. **决定策略**：热修复 / 回滚 / 继续观察
4. **执行修复**：按回滚策略执行
5. **验证确认**：确保问题已解决

---

### 3.5 迁移进度跟踪

#### 阶段状态

| 阶段 | 文件数 | 已完成 | 状态 |
|------|--------|--------|------|
| Phase 1 | 1 | [ ] | ⏳ 待开始 |
| Phase 2-1 | 4 | [ ] | ⏳ 待开始 |
| Phase 2-2 | 3 | [ ] | ⏳ 待开始 |
| Phase 2-3 | 6 | [ ] | ⏳ 待开始 |
| Phase 2-4 | 1 | [ ] | ⏳ 待开始 |
| Phase 3 | 全部 | [ ] | ⏳ 待开始 |
| Phase 4 | 全部 | [ ] | ⏳ 待开始 |

#### 每日检查点

- [ ] 确认昨日修改无回归
- [ ] 运行自动化测试套件
- [ ] 执行手动测试清单
- [ ] 更新迁移进度表格
- [ ] 记录遇到的问题和解决方案

---

## 五、变量定义参考

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

## 六、多套主题风格定义

### 6.1 设计原则

- **变量分层**：基础变量（`--ltt-*`）定义所有 token，主题通过覆盖变量值实现
- **自动响应**：通过 `.ltt-theme-*` 类名切换主题，无需 JavaScript
- **组合灵活**：主题可与深色模式叠加（`.ltt-theme-notion.dark-mode`）

### 6.2 主题预览

| 主题 | 类名 | 风格特征 |
|------|------|----------|
| **Logseq 原生** | `.ltt-theme-logseq` | 继承 Logseq 原生变量，最小干预 |
| **Notion 风格** | `.ltt-theme-notion` | 简洁白、灰度、柔和圆角 |
| **Tana 风格** | `.ltt-theme-tana` | 绿色强调、卡片式布局 |
| **Linear 风格** | `.ltt-theme-linear` | 深色优先、紫色强调、紧凑 |
| **Indigo 风格** | `.ltt-theme-indigo` | Indigo 渐变、科技感 |
| **Minimal 风格** | `.ltt-theme-minimal` | 极致简洁、无边框 |

### 6.3 主题变量定义

#### 6.3.1 Logseq 原生主题（默认）

```css
/* Logseq 原生主题 - 继承系统变量，最小干预 */
.ltt-theme-logseq,
:root {
  --ltt-bg-primary: var(--ls-primary-background-color, #ffffff);
  --ltt-bg-secondary: var(--ls-secondary-background-color, #f8fafc);
  --ltt-bg-tertiary: var(--ls-tertiary-background-color, #f1f5f9);
  --ltt-text-primary: var(--ls-primary-text-color, #1e293b);
  --ltt-text-secondary: var(--ls-secondary-text-color, #64748b);
  --ltt-border: var(--ls-border-color, #e2e8f0);
  --ltt-accent: var(--ls-active-primary-color, #3b82f6);
  --ltt-radius-sm: 4px;
  --ltt-radius-md: 6px;
  --ltt-radius-lg: 8px;
}
```

#### 6.3.2 Notion 风格主题

```css
/* Notion 风格 - 简洁白、灰度、柔和圆角 */
.ltt-theme-notion {
  /* 背景 */
  --ltt-bg-primary: #ffffff;
  --ltt-bg-secondary: #f7f6f3;
  --ltt-bg-tertiary: #efefef;
  --ltt-bg-hover: #e8e7e4;
  
  /* 文本 */
  --ltt-text-primary: #37352f;
  --ltt-text-secondary: #9b9a97;
  --ltt-text-muted: #787774;
  
  /* 边框 */
  --ltt-border: #e9e9e7;
  --ltt-border-strong: #d9d9d7;
  
  /* 强调色 */
  --ltt-accent: #2383e2;
  --ltt-accent-hover: #1b6fc4;
  --ltt-accent-muted: #e8f2fc;
  
  /* 状态色 */
  --ltt-success: #23894c;
  --ltt-warning: #d5a500;
  --ltt-error: #eb5757;
  
  /* 圆角 */
  --ltt-radius-sm: 3px;
  --ltt-radius-md: 4px;
  --ltt-radius-lg: 6px;
  --ltt-radius-xl: 8px;
  
  /* 阴影 - Notion 阴影较轻 */
  --ltt-shadow-sm: 0 1px 1px rgba(0, 0, 0, 0.05);
  --ltt-shadow-md: 0 1px 3px rgba(0, 0, 0, 0.08);
  --ltt-shadow-lg: none;
}
```

#### 6.3.3 Tana 风格主题

```css
/* Tana 风格 - 绿色强调、卡片式布局 */
.ltt-theme-tana {
  /* 背景 */
  --ltt-bg-primary: #ffffff;
  --ltt-bg-secondary: #f8faf9;
  --ltt-bg-tertiary: #f0f4f2;
  --ltt-bg-hover: #e8f0ec;
  
  /* 文本 */
  --ltt-text-primary: #1a2e22;
  --ltt-text-secondary: #5a7265;
  --ltt-text-muted: #8fa99a;
  
  /* 边框 */
  --ltt-border: #d4e0d9;
  --ltt-border-strong: #b8cec3;
  
  /* 强调色 - Tana 绿色 */
  --ltt-accent: #10b981;
  --ltt-accent-hover: #059669;
  --ltt-accent-muted: #d1fae5;
  
  /* 状态色 */
  --ltt-success: #10b981;
  --ltt-warning: #f59e0b;
  --ltt-error: #ef4444;
  
  /* 圆角 - Tana 圆角较大 */
  --ltt-radius-sm: 6px;
  --ltt-radius-md: 8px;
  --ltt-radius-lg: 12px;
  --ltt-radius-xl: 16px;
  
  /* 阴影 - Tana 卡片阴影 */
  --ltt-shadow-sm: 0 1px 2px rgba(16, 185, 129, 0.05);
  --ltt-shadow-md: 0 4px 12px rgba(16, 185, 129, 0.1);
  --ltt-shadow-lg: 0 8px 24px rgba(16, 185, 129, 0.15);
}
```

#### 6.3.4 Linear 风格主题

```css
/* Linear 风格 - 深色优先、紫色强调、紧凑 */
.ltt-theme-linear {
  /* 背景 - Linear 偏好深色背景 */
  --ltt-bg-primary: #13151a;
  --ltt-bg-secondary: #1c1f26;
  --ltt-bg-tertiary: #252830;
  --ltt-bg-hover: #2d323c;
  
  /* 文本 - 高对比度 */
  --ltt-text-primary: #e8eaed;
  --ltt-text-secondary: #9ca3af;
  --ltt-text-muted: #6b7280;
  
  /* 边框 - Linear 边框较细 */
  --ltt-border: #2d323c;
  --ltt-border-strong: #3d424c;
  
  /* 强调色 - Linear 紫色 */
  --ltt-accent: #5e6ad2;
  --ltt-accent-hover: #4f5abd;
  --ltt-accent-muted: #2a2d42;
  
  /* 状态色 */
  --ltt-success: #26c940;
  --ltt-warning: #f59e0b;
  --ltt-error: #eb5757;
  
  /* 圆角 - Linear 圆角较小 */
  --ltt-radius-sm: 3px;
  --ltt-radius-md: 4px;
  --ltt-radius-lg: 6px;
  --ltt-radius-xl: 8px;
  
  /* 阴影 - Linear 深色阴影 */
  --ltt-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --ltt-shadow-md: 0 4px 8px rgba(0, 0, 0, 0.4);
  --ltt-shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.5);
}
```

#### 6.3.5 Indigo 风格主题

```css
/* Indigo 风格 - Indigo 渐变、科技感 */
.ltt-theme-indigo {
  /* 背景 */
  --ltt-bg-primary: #ffffff;
  --ltt-bg-secondary: #eef2ff;
  --ltt-bg-tertiary: #e0e7ff;
  --ltt-bg-hover: #c7d2fe;
  
  /* 文本 */
  --ltt-text-primary: #1e1b4b;
  --ltt-text-secondary: #4338ca;
  --ltt-text-muted: #6366f1;
  
  /* 边框 */
  --ltt-border: #c7d2fe;
  --ltt-border-strong: #a5b4fc;
  
  /* 强调色 - Indigo 渐变 */
  --ltt-accent: #6366f1;
  --ltt-accent-hover: #4f46e5;
  --ltt-accent-muted: #e0e7ff;
  
  /* 状态色 */
  --ltt-success: #059669;
  --ltt-warning: #d97706;
  --ltt-error: #dc2626;
  
  /* 圆角 */
  --ltt-radius-sm: 4px;
  --ltt-radius-md: 6px;
  --ltt-radius-lg: 8px;
  --ltt-radius-xl: 12px;
  
  /* 阴影 - Indigo 阴影带色相 */
  --ltt-shadow-sm: 0 1px 2px rgba(99, 102, 241, 0.1);
  --ltt-shadow-md: 0 4px 6px rgba(99, 102, 241, 0.15);
  --ltt-shadow-lg: 0 10px 15px rgba(99, 102, 241, 0.2);
}
```

#### 6.3.6 Minimal 风格主题

```css
/* Minimal 风格 - 极致简洁、无边框 */
.ltt-theme-minimal {
  /* 背景 - 纯白 */
  --ltt-bg-primary: #ffffff;
  --ltt-bg-secondary: #fafafa;
  --ltt-bg-tertiary: #f5f5f5;
  --ltt-bg-hover: #f0f0f0;
  
  /* 文本 */
  --ltt-text-primary: #000000;
  --ltt-text-secondary: #666666;
  --ltt-text-muted: #999999;
  
  /* 边框 - Minimal 几乎无边框 */
  --ltt-border: #f0f0f0;
  --ltt-border-strong: #e0e0e0;
  
  /* 强调色 - Minimal 黑色强调 */
  --ltt-accent: #000000;
  --ltt-accent-hover: #333333;
  --ltt-accent-muted: #f5f5f5;
  
  /* 圆角 - Minimal 极小圆角 */
  --ltt-radius-sm: 0px;
  --ltt-radius-md: 0px;
  --ltt-radius-lg: 2px;
  --ltt-radius-xl: 4px;
  
  /* 阴影 - Minimal 无阴影 */
  --ltt-shadow-sm: none;
  --ltt-shadow-md: none;
  --ltt-shadow-lg: none;
}
```

### 6.4 深色模式与主题叠加

主题变量可与深色模式叠加：

```css
/* Notion 深色模式 */
.ltt-theme-notion.dark-mode,
.ltt-theme-notion[data-theme="dark"] {
  --ltt-bg-primary: #191919;
  --ltt-bg-secondary: #242424;
  --ltt-bg-tertiary: #2d2d2d;
  --ltt-text-primary: #ffffff;
  --ltt-text-secondary: #9b9b9b;
  --ltt-border: #373737;
  --ltt-accent: #2383e2;
}

/* Linear 已是深色主题 */
.ltt-theme-linear {
  /* 浅色模式下切换 */
  &.light-mode {
    --ltt-bg-primary: #ffffff;
    --ltt-bg-secondary: #f8f9fa;
    --ltt-text-primary: #1e293b;
    --ltt-accent: #5e6ad2;
  }
}
```

### 6.5 主题切换实现示例

```tsx
// React 组件中使用主题
function App() {
  const [theme, setTheme] = useState('logseq');
  const [darkMode, setDarkMode] = useState(false);
  
  const themeClass = `ltt-theme-${theme}`;
  const modeClass = darkMode ? 'dark-mode' : 'light-mode';
  
  return (
    <div className={`${themeClass} ${modeClass}`}>
      {/* 应用内容 */}
    </div>
  );
}
```

### 6.6 各主题配色预览

| 主题 | 背景色 | 文本色 | 强调色 |
|------|--------|--------|--------|
| **Logseq** | `#ffffff` | `#1e293b` | `#3b82f6` |
| **Notion** | `#ffffff` | `#37352f` | `#2383e2` |
| **Tana** | `#ffffff` | `#1a2e22` | `#10b981` |
| **Linear** | `#13151a` | `#e8eaed` | `#5e6ad2` |
| **Indigo** | `#ffffff` | `#1e1b4b` | `#6366f1` |
| **Minimal** | `#ffffff` | `#000000` | `#000000` |

---

## 七、迁移检查清单

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

## 八、替代方案对比

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **统一变量方案** | 统一管理、换肤方便 | 迁移工作量大 | ⭐⭐⭐ |
| **CSS-in-JS** | 组件化、动态主题 | 运行时开销、SSR复杂 | ⭐⭐ |
| **Tailwind 插件** | 已有工具链 | 学习成本、HTML冗余 | ⭐⭐ |
| **CSS Modules** | 作用域隔离 | 难以共享主题 | ⭐ |

---

## 九、总结

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
