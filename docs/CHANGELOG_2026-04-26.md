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
