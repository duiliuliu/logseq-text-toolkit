# Text Toolkit 更新日志

## 2026-04-21

### 修复与优化

1. **修复工具栏配置取值逻辑**
   - 修正了 `main.tsx` 中提取工具栏配置的逻辑，从错误的对象遍历改为直接使用 `currentSettings.ToolbarItems`
   - 更新了 `SelectToolbar` 组件的类型定义，使其能够正确接受数组类型的 `items` 参数

2. **优化配置结构**
   - 将默认设置从 TypeScript 文件迁移到 JSON 文件 (`defaultSettings.json`)
   - 保持了 `defaultSettings.ts` 作为导出接口，确保向后兼容

3. **SVG 图标优化**
   - 优化了文本颜色组的 SVG 图标，使用更符合场景的文本图标
   - 优化了下划线组的 SVG 图标，使用更符合场景的下划线图标
   - 确保所有图标在工具栏和下拉菜单中都能正确显示

4. **类型定义调整**
   - 确保所有相关文件使用 `ToolbarItems` 替代了 `items`
   - 保持了类型定义的一致性

### 技术改进

- 构建系统支持 JSON 导入，通过 `tsconfig.json` 中的 `resolveJsonModule` 配置
- 代码结构更加清晰，配置与逻辑分离
- 提升了代码的可维护性和可读性