# 实验功能移除记录

## 日期：2026-04-27

### 移除的文件和功能

#### 1. `/workspace/src/components/Toolbar/textProcessor.ts`
- **功能描述**：处理文本选择和替换的核心逻辑
- **主要功能**：
  - `processSelectedData`：根据工具栏项目类型处理选中的数据
  - `replaceSelectedText`：处理文本替换的完整逻辑
  - `replaceText`：基本文本替换功能（已迁移到 `lib/textReplace/utils.ts`）
  - `regexReplaceText`：正则文本替换功能（已迁移到 `lib/textReplace/utils.ts`）
- **依赖关系**：
  - 被 `lib/toolbar/ActionExecutor.ts` 使用
  - 被 `components/Toolbar/ToolbarLogic.ts` 使用
- **替代方案**：
  - 核心替换逻辑已迁移到 `lib/textReplace/utils.ts`
  - 执行器模式已在 `lib/toolbar/executors/` 中实现

#### 2. `/workspace/src/components/Toolbar/index.tsx`（部分代码）
- **功能描述**：工具栏组件的主要实现
- **移除的代码**：第85-86行
- **替代方案**：使用新的执行器模式处理工具栏项目点击

#### 3. `/workspace/src/components/Toolbar/ToolbarLogic.ts`（部分代码）
- **功能描述**：工具栏逻辑处理
- **移除的代码**：第72-73行
- **替代方案**：使用新的执行器模式处理工具栏项目点击

### 移除原因
- 实现了新的执行器模式，更加模块化和可扩展
- 核心文本处理逻辑已迁移到更合适的位置
- 减少代码重复和依赖关系，提高代码可维护性

### 恢复方法
- 查看本次提交的代码历史
- 从版本控制系统中恢复相关文件
