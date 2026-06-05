## 2026年6月5日 更新日志

### 优化：通用设置功能管理UI调整

**修改文件**：
- `/workspace/src/components/SettingsModal/tabs/GeneralSettings.tsx`

**优化内容**：
1. 将功能管理折叠箭头从左侧移到右侧，保持文字与其他设置文字对齐
2. 优化了功能管理的布局结构，使其更符合Apple设置页风格
3. 视觉上更加简洁高级

---

### 优化：默认斜杠命令模板输入验证

**修改文件**：
- `/workspace/src/components/SettingsModal/components/MacroTemplateInput.tsx`
- `/workspace/src/components/SettingsModal/tabs/TaskProgressSettings.tsx`
- `/workspace/src/components/SettingsModal/tabs/HeatmapSettings.tsx`
- `/workspace/src/components/SettingsModal/tabs/BlockViewSettings.tsx`
- `/workspace/src/components/SettingsModal/tabs/MilestoneSettings.tsx`
- `/workspace/src/components/SettingsModal/settingsModal.css`

**优化内容**：
1. 为MacroTemplateInput组件添加`align`参数，支持左/右对齐（默认右对齐）
2. 所有设置页面使用右对齐的默认斜杠命令模板输入
3. 统一输入框宽度为40%，与其他设置项保持一致
4. 错误提示、警告提示和帮助提示也支持对齐参数
5. 添加了完整的输入框样式（边框、focus状态、错误状态等）

---

### 优化：设置页面样式统一

**修改文件**：
- `/workspace/src/components/SettingsModal/settingsModal.css`

**优化内容**：
1. 为MacroTemplateInput添加专门的样式类
2. 统一输入框高度为30px，padding、border-radius等样式
3. 添加对齐控制类：`ltt-macro-template-alert-left`和`ltt-macro-template-alert-right`
4. 优化了错误和警告提示的显示样式

---

### 修复：i18n翻译文件重复键问题

**修改文件**：
- `/workspace/src/translations/zh-CN.json`
- `/workspace/src/translations/en.json`
- `/workspace/src/translations/ja.json`
- `/workspace/src/translations/translations.ts`

**修复内容**：
1. 修复了翻译文件中`features`键重复的问题
2. 将字符串键改名为`featuresTitle`，对象键保持`features`
3. 更新了类型定义文件，添加`featuresTitle`字段
4. 更新了GeneralSettings.tsx中的引用