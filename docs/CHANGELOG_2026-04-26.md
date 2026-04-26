# 更新记录

## 2026-04-26 15:30:00

### 版本
- 系统代码版本号：logseq-text-toolkit@0.11.7
- Commit: 3f7d92a

### 用户描述
- 优化 InlineCommentModal 组件样式
  - 选中文本字体调小
  - textarea hover 时和填写内容时边框为浅灰色
- 重新记录更新日志

### 更新内容

#### 更新
- 修改 `/workspace/src/components/InlineComment/inlineComment.css`，调整 `.inline-comment-modal-title-selected` 样式，设置 font-weight: 300 和 font-size: 12px
- 修改 `/workspace/src/components/InlineComment/inlineComment.css`，调整 textarea hover 和 focus 时的边框颜色为浅灰色
- 修改 `/workspace/src/components/InlineComment/inlineComment.css`，调整深色主题下 textarea hover 和 focus 时的边框颜色为浅灰色
- 修改 `/workspace/src/components/InlineComment/inlineComment.css`，去掉 textarea:focus 下的 box-shadow
- 修改 `/workspace/src/components/InlineComment/InlineCommentModal.tsx`，修复保存按钮不工作的问题，添加 onSave 回调调用
- 修改 `/workspace/src/lib/textReplace/utils.ts`，更新 updateBlockContent 函数，使其使用 logseqAPI.Editor.updateBlock 来更新块内容
- 修改 `/workspace/src/components/InlineComment/InlineCommentModal.tsx`，使用公共的 updateBlockContent 函数替代直接实现的逻辑
- 将 `/workspace/docs/output/更新记录.md` 移动到 `/workspace/docs/CHANGELOG_2026-04-26.md`
- 修改 `/workspace/src/lib/textReplace/utils.ts`，添加 updateBlockContentWithLanguage 函数，支持语言参数
- 修改 `/workspace/src/components/Toolbar/textProcessor.ts`，使用公共的 updateBlockContentWithLanguage 函数替代直接实现的逻辑
- 删除 `/workspace/src/components/Toolbar/textProcessor.ts` 中不再需要的 updateBlockContent 函数
- 修改 `/workspace/src/lib/textReplace/utils.ts`，将 updateBlockContentWithLanguage 函数改名为 updateBlockContent，删除原来的 updateBlockContent 函数
- 修改 `/workspace/src/components/Toolbar/textProcessor.ts`，更新导入和函数调用，使用新的 updateBlockContent 函数
- 修改 `/workspace/src/components/InlineComment/InlineCommentModal.tsx`，更新函数调用，使用新的 updateBlockContent 函数并传递语言参数
- 修改 `/workspace/src/components/InlineComment/InlineCommentModal.tsx`，添加国际化支持，从设置中获取语言信息
- 修改 `/workspace/src/components/InlineComment/InlineCommentModal.tsx`，更新文本标签和占位符，使用国际化

## 2026-04-26 16:30:00

### 版本
- 系统代码版本号：logseq-text-toolkit@0.11.7
- Commit: d8e958e

### 用户描述
- 恢复 editor.ts 文件到之前的版本
- 添加 Hiccup 实时渲染功能
- 移动 logger 目录到 lib 下面
- 修复主题设置未生效的问题

### 更新内容

#### 更新
- 恢复 `/workspace/src/logseq/mock/editor.ts` 文件到之前的版本，简化 getCurrentBlock 方法实现
- 创建 `/workspace/src/test/components/HiccupRenderer/index.tsx` 组件，支持 Hiccup 内容的实时渲染
- 创建 `/workspace/src/test/components/HiccupRenderer/styles.css` 文件，为 HiccupRenderer 组件添加样式
- 修改 `/workspace/src/test/testAPP.tsx` 文件，添加 HiccupRenderer 组件，支持 Hiccup 内容的实时渲染
- 修改 `/workspace/src/test/testAPP.tsx` 文件，修复主题设置未生效的问题，正确处理 'system' 主题
- 将 `/workspace/src/utils/logger.ts` 文件移动到 `/workspace/src/lib/logger/logger.ts`
- 修改 `/workspace/src/lib/textReplace/utils.ts` 文件，更新 logger 导入路径
- 修改 `/workspace/src/components/SelectToolbar/index.tsx` 文件，更新 logger 导入路径
