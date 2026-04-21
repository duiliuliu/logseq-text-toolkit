# Changelog - 2026-04-21

## 主要更新

### 1. 工具栏按钮样式优化
- 更新了工具栏设置按钮的样式，使用标准的 Logseq 按钮样式
- 添加了 `ti ti-settings` 图标，替换了原来的 ⚙️ 表情符号
- 为按钮添加了 `ltt-settings-button` ID 前缀，避免与其他插件冲突

### 2. 样式加载优化
- 在 `showSettingUI` 函数中添加了 `logseqAPI.provideStyle` 来加载 `settingsModal.css`
- 在 `showSelectToolbar` 函数中添加了 `logseqAPI.provideStyle` 来加载 `toolbar.css`
- 确保样式在组件渲染前加载，避免样式闪烁

### 3. CSS 命名空间优化
- 为 `SettingsModal` 组件的所有 CSS 类和 ID 添加了 `ltt-` 前缀
- 为 `Toolbar` 组件的所有 CSS 类和 ID 保持了 `ltt-` 前缀
- 为 `SelectToolbar` 组件的 CSS 类和 ID 保持了 `ltt-` 前缀
- 避免了与其他插件的样式冲突

### 4. 组件代码优化
- 更新了 `GeneralSettings.tsx`，将所有 class 替换为带 `ltt-` 前缀的版本
- 更新了 `ToolbarSettings.tsx`，将所有 class 替换为带 `ltt-` 前缀的版本
- 更新了 `AdvancedSettings.tsx`，将所有 class 替换为带 `ltt-` 前缀的版本
- 更新了 `SettingsModal/index.tsx`，将所有 class 和 ID 替换为带 `ltt-` 前缀的版本
- 更新了 `settingsModal.css`，将所有选择器替换为带 `ltt-` 前缀的版本

### 5. 性能和稳定性
- 确保样式加载的一致性
- 减少了样式冲突的可能性
- 提高了插件的整体稳定性

## 技术细节

### 样式加载
```typescript
// 在 showSettingUI 中
logseqAPI.provideStyle(`
  @import url('/src/components/SettingsModal/settingsModal.css');
`)

// 在 showSelectToolbar 中
logseqAPI.provideStyle(`
  @import url('/src/components/Toolbar/toolbar.css');
`)
```

### 工具栏按钮
```html
<a class="button" id="ltt-settings-button"
   data-on-click="settingToggle"
   data-rect>
  <i class="ti ti-settings"></i> 
</a>
```

### CSS 命名空间
所有 CSS 类现在都使用 `ltt-` 前缀，例如：
- `ltt-settings-container` 代替 `settings-container`
- `ltt-toolbar-main` 代替 `toolbar-main`
- `ltt-setting-item` 代替 `setting-item`

## 影响范围

此更新影响以下文件：
- `/src/main.tsx` - 添加样式加载和更新工具栏按钮
- `/src/components/SettingsModal/index.tsx` - 添加 ltt 前缀
- `/src/components/SettingsModal/settingsModal.css` - 添加 ltt 前缀
- `/src/components/SettingsModal/tabs/GeneralSettings.tsx` - 添加 ltt 前缀
- `/src/components/SettingsModal/tabs/ToolbarSettings.tsx` - 添加 ltt 前缀
- `/src/components/SettingsModal/tabs/AdvancedSettings.tsx` - 添加 ltt 前缀

此更新不会影响插件的功能，只是优化了样式加载和命名空间，提高了与其他插件的兼容性。