## 2026年4月30日 更新日志

### 新增：任务进度组件悬停动画效果

**修改文件**：
- `/workspace/src/components/TaskProgress/taskProgress.css`

**新增内容**：
1. **微型圆环**：悬停时圆环变大，各状态圆弧保持不变但有间隔
2. **点阵进度**：点依次变大，形成水波效果，同一时间只有一个点放大
3. **状态光标**：闪烁和呼吸动画
4. **阶梯进度**：变长和摇晃动画
5. **进度胶囊**：呼吸动画效果

---

### 修改：设置界面优化

**修改文件**：
- `/workspace/src/components/SettingsModal/settingsModal.css`
- `/workspace/src/components/SettingsModal/tabs/TaskProgressSettings.tsx`

**修改内容**：
1. **Input 样式**：去掉边框，圆角设计
2. **颜色选择器**：颜色和状态描述之间有间距
3. **状态颜色行**：去掉背景色，保持简洁风格

---

### 优化：标签显示支持扩展到所有进度组件

**修改文件**：
- `/workspace/src/components/TaskProgress/ProgressCapsule.tsx`
- `/workspace/src/components/TaskProgress/DotMatrixProgress.tsx`
- `/workspace/src/components/TaskProgress/StepProgress.tsx`
- `/workspace/src/components/TaskProgress/MiniCircleProgress.tsx`
- `/workspace/src/components/TaskProgress/TaskProgress.tsx`
- `/workspace/src/test/components/TaskProgressDemo/index.tsx`
- `/workspace/src/lib/taskProgress/register.ts`
- `/workspace/src/settings/types.ts`
- `/workspace/src/settings/defaultSettings.json`

**优化内容**：
1. **所有进度组件**：支持显示/隐藏标签的全局设置
2. **标签格式**：支持 "fraction"（进度）和 "percentage"（百分比）两种格式
3. **设置配置**：将 showLabel 和 labelFormat 提升为全局设置，适用于所有组件类型

---

### 修改：标签格式去掉「两者」选项

**修改文件**：
- `/workspace/src/components/SettingsModal/tabs/TaskProgressSettings.tsx`
- `/workspace/src/lib/taskProgress/types.ts`
- `/workspace/src/settings/types.ts`
- `/workspace/src/components/TaskProgress/MiniCircleProgress.tsx`
- `/workspace/src/components/TaskProgress/ProgressCapsule.tsx`
- `/workspace/src/components/TaskProgress/DotMatrixProgress.tsx`
- `/workspace/src/components/TaskProgress/StepProgress.tsx`

**修改内容**：
1. 移除 labelFormat 的 "both" 选项
2. 更新所有组件的类型定义和逻辑
3. 简化标签格式选项，只保留分数和百分比两种

---

### 修改：默认设置更新

**修改文件**：`/workspace/src/settings/defaultSettings.json`

**修改内容**：
1. 将所有 `${selectedText}` 更新为 `"${selectedText}"`，确保在各种格式操作中都正确使用引号包裹
2. 将 `showLabel` 和 `labelFormat` 提升为全局设置
