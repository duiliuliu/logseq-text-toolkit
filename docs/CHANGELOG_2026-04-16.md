# 更新日志 - 2026-04-16

## 类型定义优化
- 在 `types/index.ts` 中添加了 `FuncMode` 类型，使 `ToolbarItem.funcmode` 类型更精确
- 在 `types/logseq.ts` 中优化了 `LogseqApp` 和 `LogseqAPI` 类型，使用更精确的类型替代 `any` 类型

## 功能改进
- 修改了 `textProcessor.ts` 中的 `processSelectedData` 函数，使其成为异步函数
- 在 `processSelectedData` 函数中添加了对 `replaceSelectedText` 的调用，支持在 `replace` 模式下自动执行文本替换
- 优化了 `replaceSelectedText` 函数，使用 `SelectedData.range` 进行精确定位，并添加了适当的回退机制

## 构建和部署
- 修复了构建过程中的导入路径问题
- 确保了项目能够正常编译和部署
- 验证了测试模式下应用的正常运行

## 其他
- 确保了所有类型定义的正确使用
- 提高了代码的类型安全性和可维护性

## 组件接口定义优化
- 修复了标签页组件的导入问题，将 `TabComponentProps` 类型定义移到了各自的文件中
- 优化了 Toolbar 组件的接口定义，删除了重复的 `ToolbarItem` 和 `ToolbarGroup` 接口定义
- 修复了 Toolbar 组件中 `parseItems` 和 `renderItem` 函数，使其正确处理类型

## 赞赏栏优化
- 修改了赞赏栏样式，使其不跟随 more 按钮点击后一起调整尺寸

## 文件清理
- 删除了无用的 js、jsx 文件，保留了对应的 ts、tsx 文件

## 重复接口定义优化
- 全面扫描了项目中的 interface 定义，去除了重复的定义
- 将 SelectedData 接口统一从 utils/textProcessor.ts 导出并引用
- 将 ToolbarPosition 接口统一从 utils/state.ts 导出并引用