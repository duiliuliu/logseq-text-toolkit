## 2026年4月28日 更新日志

### 优化：SelectToolbar 防抖处理

**修改文件**：`/workspace/src/components/SelectToolbar/index.tsx`

**优化内容**：

1. **添加防抖函数**：在文件顶部添加了通用的 `debounce` 工具函数，支持泛型类型

2. **创建防抖版本的 updateToolbarPosition**：使用 `useMemo` 创建了防抖版本的 `updateToolbarPosition`，防抖延迟设置为 50ms

3. **修改事件处理函数**：
   - `handleSelection`：使用防抖版本，避免快速连续选择时频繁更新位置
   - `handleScroll`：使用防抖版本，避免滚动时频繁更新工具栏位置

**优化效果**：
- 减少了频繁的位置计算和状态更新，提升了性能
- 避免了快速选择文本或滚动时的抖动现象
- 保持原有交互逻辑不变，用户体验更流畅

---

### 优化：引入 framer-motion 动画效果

**修改文件**：
- `/workspace/src/components/Toolbar/index.tsx`
- `/workspace/src/components/Modal/index.tsx`
- `/workspace/src/components/Comment/CommentModal.tsx`

**优化内容**：

1. **Toolbar 组件**：
   - 添加 `motion.div` 包裹整体容器
   - 入场动画：淡入 + 向上移动 + 缩放恢复
   - 出场动画：淡出 + 向下移动 + 缩小
   - 使用 spring 动画效果，提升流畅感

2. **Modal 组件**：
   - 添加 `motion.div` 和 `AnimatePresence` 包裹 overlay 和 container
   - 遮罩层：淡入淡出效果
   - 弹窗容器：淡入 + 缩放 + 向上移动
   - 使用 spring 动画效果

3. **CommentModal 组件**：
   - 添加 `motion.div` 和 `AnimatePresence` 包裹
   - 遮罩层：淡入淡出效果
   - 弹窗容器：淡入 + 轻微缩放 + 向上移动

---

### 修改：GeneralSettings 开发者模式开关样式

**修改文件**：`/workspace/src/components/SettingsModal/tabs/GeneralSettings.tsx`

**修改内容**：
- 将开发者模式的 checkbox 改为使用 `ltt-switch` 样式，与 ToolbarSettings 中的开关保持一致

---

### 修改：添加移动端响应式样式

**修改文件**：`/workspace/src/components/SettingsModal/settingsModal.css`

**修改内容**：
```css
@media (max-width: 768px) {
  .ltt-setting-item > label {
    width: 36px !important;
    text-align: left !important;
  }
}
```

---

### 优化：CommentModal 组件样式调整

**修改文件**：
- `/workspace/src/components/Comment/CommentModal.tsx`
- `/workspace/src/components/Comment/inlineComment.css`

**修改内容**：

1. **弹窗宽度**：设置最大宽度为 `320px`

2. **Header 样式**：`padding: 10px 18px 2px 18px`

3. **选中文本区域**：
   - `.ltt-inline-comment-modal-selected`: `padding: 0 16px 4px`
   - `.ltt-inline-comment-modal-selected-text`: `padding: 6px 10px; font-size: 9px; line-height: 1`

4. **textarea 样式**：
   - 初始高度 `34px`，可在 `34px-150px` 范围内调整
   - 宽度 `90%`，居中对齐
   - 聚焦和激活时边框高亮色为黑色

5. **按钮**：仅保留注释按钮，注释掉评论按钮

---

### 修改：Comment 模块转义处理增强

**修改文件**：`/workspace/src/components/Comment/index.ts`

**修改内容**：
- 在 `wrapText` 函数中添加了对换行符 `\n`、回车符 `\r`、制表符 `\t` 和反斜杠 `\` 的转义处理

---

### 修改：textarea 组件样式优化

**修改文件**：`/workspace/src/components/ui/textarea.css`

**修改内容**：
- `min-height`: 从 `80px` 调整为 `30px`
- `ring-offset-width`: 从 `2px` 调整为 `0px`
- `ring-color`: 浅色模式下为亮黑色 `#333333`，深色模式下为亮浅色 `#cccccc`

---

### 删除：移除无用文件

**删除文件**：`/workspace/src/components/Toolbar/textProcessor.ts`

---

### 修改：正则表达式更新

**修改文件**：`/workspace/src/settings/defaultSettings.json`

**修改内容**：
- 更新了 `remove-formatting` 的正则表达式，支持清理 `[:span.inline-comment {:data-comment "评论"} "文字"]` 格式

---

**测试验证**：
- 测试服务启动正常：http://localhost:3007/
- 所有组件动画效果正常
- 设置模态框样式正常
- 响应式样式生效
- 注释功能测试通过