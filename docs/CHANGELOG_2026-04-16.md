# 更新日志 - 2026-04-16

## 主要更新

1. **文件结构优化**
   - 将 `/src/hooks/useSettings.tsx` 移动到 `/src/config/` 目录
   - 将 `/src/utils/settings.ts` 移动到 `/src/config/` 目录并优化名称为 `settingsStorage.ts`
   - 删除了多个无用文件：
     - `/src/utils/state.ts`
     - `/workspace/src/types` 目录
     - `/workspace/src/utils/commands.ts`
     - `/workspace/src/utils/annotations.ts`

2. **Logseq API 优化**
   - 清理了 `/workspace/src/logseq/` 目录，移除了重复定义的内容和没用的逻辑
   - 直接从 `@logseq/libs` 导入类型定义，替换了本地定义
   - 删除了 `editor.ts` 中 logseq 没有提供的 `replaceSelectedText` 函数
   - 优化了 `index.ts` 中获取 logseq 实例的方式

3. **修复和改进**
   - 修复了 `SelectToolbar` 和 `Modal` 中对已删除 `state.ts` 的引用问题
   - 确保所有导入路径正确更新
   - 验证了构建和测试服务的正常运行

## 技术细节

- 使用 `@logseq/libs/dist/LSPlugin` 作为 API 类型定义的来源
- 保持了本地 mock 实现作为测试用
- 确保了所有组件在测试模式下正常工作

## 验证结果

- 构建命令 `npm run build` 成功通过，无编译错误
- 测试服务 `npm run test` 成功启动，页面正常加载
- 所有功能模块运行正常