## 2026年6月4日 更新日志

### 修复：Milestone 宏渲染器缺少前缀检查

**修改文件**：
- `/workspace/src/lib/milestone/register.ts`

**修复内容**：
1. 新增 `MACRO_PREFIX = ':milestone'` 常量
2. 在 `onMacroRendererSlotted` 回调中添加类型前缀检查逻辑
3. 将所有硬编码的 `:milestone` 替换为 `MACRO_PREFIX` 变量
4. 修复前：`milestone` 渲染器可能处理不属于自己的宏类型，导致潜在错误
5. 修复后：与 `taskProgress`、`heatmap` 保持一致，只处理以 `:milestone` 开头的宏

---

### 优化：统一宏类型管理

**修改文件**：
- `/workspace/src/lib/milestone/register.ts`

**优化内容**：
1. `registerRendererArgModel` 调用使用 `MACRO_PREFIX` 替代硬编码
2. 斜杠命令生成的模板字符串也使用 `MACRO_PREFIX`
3. 确保所有宏前缀统一管理，便于后续维护和修改

