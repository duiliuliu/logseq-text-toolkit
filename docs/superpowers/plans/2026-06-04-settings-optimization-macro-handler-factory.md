# Settings Optimization & Macro Handler Factory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Optimize Settings Tabs by removing AdvancedSettings, adding feature toggles in GeneralSettings, and creating a unified createMacroHandler factory to prevent missing prefix checks like the milestone bug.

**Architecture:**
- Settings Tab 动态过滤：基于 settings 中的 enabled 状态动态渲染 tab 列表
- createMacroHandler 工厂：统一处理前缀检查、settings 读取、配置合并、渲染调用
- 斜杠命令模板可配置：每个功能的默认模板从 settings 读取

**Tech Stack:** TypeScript, React, Logseq Plugin API

---

## File Structure

```
src/
├── components/SettingsModal/
│   ├── index.tsx                          # 动态过滤 tabs
│   └── tabs/
│       ├── GeneralSettings.tsx            # 新增功能开关
│       └── AdvancedSettings.tsx           # [删除]
├── lib/render/
│   ├── macroHandler.ts                    # [新建] 工厂函数
│   └── index.tsx                          # 导出新工厂
├── settings/
│   ├── types.ts                           # 新增 defaultSlashCommandTemplate
│   └── defaultSettings.json               # 添加默认模板
├── lib/taskProgress/register.ts           # 重构使用工厂
├── lib/heatmap/register.ts                # 重构使用工厂
├── lib/milestone/register.ts              # 重构使用工厂
├── lib/blockView/register.ts              # 重构使用工厂
└── lib/summary/register.ts                # 重构使用工厂
```

---

## Task 1: 删除 AdvancedSettings Tab

**Files:**
- Delete: `src/components/SettingsModal/tabs/AdvancedSettings.tsx`

- [ ] **Step 1: 删除 AdvancedSettings.tsx 文件**

```bash
rm /workspace/src/components/SettingsModal/tabs/AdvancedSettings.tsx
```

- [ ] **Step 2: 从 SettingsModal/index.tsx 中移除 AdvancedSettings 导入和引用**

修改 `/workspace/src/components/SettingsModal/index.tsx`:
- 第 7 行：删除 `import AdvancedSettings from './tabs/AdvancedSettings'`
- 第 107 行：删除 `{ id: 'advanced', component: AdvancedSettings, label: t('settings.tabs.advanced', language), icon: '' }`

---

## Task 2: 新增功能开关到 GeneralSettings

**Files:**
- Modify: `src/components/SettingsModal/tabs/GeneralSettings.tsx`

- [ ] **Step 1: 在 GeneralSettings 中新增功能开关区域**

在 `settings.language` 之后、`developerMode` 之前添加：

```tsx
<div className="ltt-setting-item">
  <label>{t('settings.features', language)}</label>
</div>

<div className="ltt-setting-item">
  <label>{t('settings.toolbar', language)}</label>
  <label className="ltt-switch">
    <input
      type="checkbox"
      checked={settings.toolbar ?? true}
      onChange={(e) => handleSettingChange('toolbar', e.target.checked)}
    />
    <span className="ltt-switch-slider"></span>
  </label>
</div>

<div className="ltt-setting-item">
  <label>{t('settings.taskProgress', language)}</label>
  <label className="ltt-switch">
    <input
      type="checkbox"
      checked={settings.taskProgress?.enabled ?? true}
      onChange={(e) => handleSettingChange('taskProgress.enabled', e.target.checked)}
    />
    <span className="ltt-switch-slider"></span>
  </label>
</div>

<div className="ltt-setting-item">
  <label>{t('settings.heatmap', language)}</label>
  <label className="ltt-switch">
    <input
      type="checkbox"
      checked={settings.heatmap?.enabled ?? true}
      onChange={(e) => handleSettingChange('heatmap.enabled', e.target.checked)}
    />
    <span className="ltt-switch-slider"></span>
  </label>
</div>

<div className="ltt-setting-item">
  <label>{t('settings.blockView', language)}</label>
  <label className="ltt-switch">
    <input
      type="checkbox"
      checked={settings.blockView?.enabled ?? true}
      onChange={(e) => handleSettingChange('blockView.enabled', e.target.checked)}
    />
    <span className="ltt-switch-slider"></span>
  </label>
</div>

<div className="ltt-setting-item">
  <label>{t('settings.summary', language)}</label>
  <label className="ltt-switch">
    <input
      type="checkbox"
      checked={settings.summary?.enabled ?? true}
      onChange={(e) => handleSettingChange('summary.enabled', e.target.checked)}
    />
    <span className="ltt-switch-slider"></span>
  </label>
</div>

<div className="ltt-setting-item">
  <label>{t('settings.milestone', language)}</label>
  <label className="ltt-switch">
    <input
      type="checkbox"
      checked={settings.milestone?.enabled ?? true}
      onChange={(e) => handleSettingChange('milestone.enabled', e.target.checked)}
    />
    <span className="ltt-switch-slider"></span>
  </label>
</div>
```

- [ ] **Step 2: 翻译文件中添加新 key**

在翻译文件（zh-CN.json, en.json, ja.json）添加：
```json
"settings.features": "功能管理",
"settings.toolbar": "工具栏",
"settings.taskProgress": "任务进度",
"settings.heatmap": "热力图",
"settings.blockView": "块视图",
"settings.summary": "总结",
"settings.milestone": "里程碑"
```

---

## Task 3: SettingsModal 动态过滤 Tab

**Files:**
- Modify: `src/components/SettingsModal/index.tsx`

- [ ] **Step 1: 修改 tabs 数组定义，添加 enabled 条件过滤**

将第 99-108 行的静态 tabs 数组改为动态计算：

```tsx
// 计算动态 tabs 列表
const featureTabs: Tab[] = [
  settings.toolbar !== false && { id: 'toolbar', component: ToolbarSettings, label: t('settings.tabs.toolbar', language), icon: '' },
  settings.taskProgress?.enabled !== false && { id: 'task-progress', component: TaskProgressSettings, label: t('settings.tabs.taskProgress', language), icon: '' },
  settings.heatmap?.enabled !== false && { id: 'heatmap', component: HeatmapSettings, label: t('settings.tabs.heatmap', language), icon: '' },
  settings.blockView?.enabled !== false && { id: 'block-view', component: BlockViewSettings, label: t('settings.tabs.blockView', language), icon: '' },
  settings.summary?.enabled !== false && { id: 'summary', component: SummarySettings, label: t('settings.tabs.summary', language), icon: '' },
  settings.milestone?.enabled !== false && { id: 'milestone', component: MilestoneSettings, label: t('settings.tabs.milestone', language), icon: '' },
].filter(Boolean) as Tab[];

const tabs: Tab[] = [
  { id: 'general', component: GeneralSettings, label: t('settings.tabs.general', language), icon: '' },
  ...featureTabs,
];
```

- [ ] **Step 2: 确保 activeTab 有效**

在 tabs 变更后检查 activeTab 是否仍然有效，如果当前 tab 被隐藏则切换到 general：

```tsx
useEffect(() => {
  const tabIds = tabs.map(t => t.id);
  if (!tabIds.includes(activeTab)) {
    setActiveTab('general');
  }
}, [tabs, activeTab]);
```

---

## Task 4: 创建 createMacroHandler 工厂函数

**Files:**
- Create: `src/lib/render/macroHandler.ts`

- [ ] **Step 1: 创建 macroHandler.ts**

```typescript
import { splitRendererArgs, parseRendererArgs, registerRendererArgModel } from './rendererArgs';
import { getSettingsWithSystem } from '../../settings';

export interface MacroHandlerOptions<ConfigType> {
  /** 宏命令前缀，如 ':heatmap' */
  macroPrefix: string;
  /** 可选的中文前缀 */
  macroPrefixCn?: string;
  /** 参数模型定义 */
  argModel: { positional?: string[]; named?: string[] };
  /** 从 settings 读取配置（返回 Partial<ConfigType>） */
  getConfigFromSettings: () => Partial<ConfigType>;
  /** 从解析后的参数生成完整配置 */
  mergeConfig: (macroArgs: Record<string, string>, settingsConfig: Partial<ConfigType>) => ConfigType;
  /** 执行渲染，返回 boolean */
  render: (slot: string, config: ConfigType, blockUuid?: string) => Promise<boolean>;
}

/**
 * 创建统一的宏渲染处理器
 *
 * 功能：
 * 1. 前缀检查 - 只处理以指定前缀开头的宏
 * 2. 参数解析 - 使用 splitRendererArgs + parseRendererArgs
 * 3. 配置合并 - 宏命令参数 > settings > 系统默认值
 * 4. 渲染调用 - 调用实际的渲染函数
 */
export function createMacroHandler<ConfigType>(options: MacroHandlerOptions<ConfigType>) {
  const { macroPrefix, macroPrefixCn, argModel, render, getConfigFromSettings, mergeConfig } = options;

  // 注册参数模型
  registerRendererArgModel(macroPrefix, argModel);
  if (macroPrefixCn) {
    registerRendererArgModel(macroPrefixCn, argModel);
  }

  return async ({ payload, slot }: any) => {
    try {
      const split = splitRendererArgs(payload.arguments);
      if (!split) return;

      const { type, tokens } = split;

      // 前缀检查
      if (!type || (!type.startsWith(macroPrefix) && (!macroPrefixCn || !type.startsWith(macroPrefixCn)))) {
        return;
      }

      // 解析宏参数
      const macroArgs = parseRendererArgs(type, tokens);

      // 读取 settings 配置
      const settingsConfig = getConfigFromSettings();

      // 合并配置：宏命令参数 > settings > 默认值
      const finalConfig = mergeConfig(macroArgs, settingsConfig);

      // 调用渲染
      await render(slot, finalConfig, payload.uuid);
    } catch (err) {
      console.error(`[MacroHandler] ${macroPrefix} render error:`, err);
    }
  };
}
```

- [ ] **Step 2: 更新 lib/render/index.tsx 导出**

在 `/workspace/src/lib/render/index.tsx` 中添加：

```tsx
export {
  // ... existing exports
  createMacroHandler,
  type MacroHandlerOptions,
} from './macroHandler';
```

---

## Task 5: 重构 milestone/register.ts 使用工厂函数

**Files:**
- Modify: `src/lib/milestone/register.ts`

- [ ] **Step 1: 导入 createMacroHandler**

在 `/workspace/src/lib/milestone/register.ts` 第 7 行后添加：

```typescript
import { createMacroHandler } from '../render';
```

- [ ] **Step 2: 重构 registerMilestone 函数**

将 `onMacroRendererSlotted` 回调替换为使用工厂函数：

```typescript
export function registerMilestone(): void {
  const macroHandler = createMacroHandler({
    macroPrefix: MACRO_PREFIX,
    argModel: { positional: ['displayStyle'], named: ['inline'] },
    getConfigFromSettings: () => {
      const settings = getSettings();
      return settings?.milestone || {};
    },
    mergeConfig: (macroArgs, settingsConfig) => {
      return parseMacroArguments('', macroArgs, settingsConfig);
    },
    render: renderMilestone,
  });

  logseqAPI.App.onMacroRendererSlotted(macroHandler);

  // 斜杠命令 - 根据 enabled 状态决定是否注册
  const settings = getSettings();
  if (settings?.milestone?.enabled !== false) {
    logseqAPI.Editor.registerSlashCommand(
      '[Text Toolkit] Insert Milestone',
      async () => {
        const milestoneSettings = getSettings()?.milestone;
        const defaultTemplate = milestoneSettings?.defaultSlashCommandTemplate
          || `${MACRO_PREFIX}, displayStyle=compact, inline=true, milestoneList=Initiation;Planning;Execution;Monitoring;Closure`;
        await logseqAPI.Editor.insertAtEditingCursor(
          `{{renderer ${defaultTemplate}}}`
        );
      }
    );
  }

  logger.info('✅ Milestone: Registered successfully');
}
```

- [ ] **Step 3: 重构 parseMacroArguments 函数签名**

更新 `parseMacroArguments` 以支持 `macroArgs` 和 `settingsConfig` 分离传入：

```typescript
function parseMacroArguments(
  type: string,
  macroArgs: Record<string, string>,
  settingsConfig?: Partial<MilestoneConfig>
): MilestoneConfig {
  const parsed = macroArgs;
  const settings = settingsConfig || getSettings();

  // ... 后续逻辑保持不变，只需调整 settings 读取来源
}
```

---

## Task 6: 重构 taskProgress/register.ts 使用工厂函数

**Files:**
- Modify: `src/lib/taskProgress/register.ts`

- [ ] **Step 1: 导入 createMacroHandler，移除独立的参数解析逻辑**

- [ ] **Step 2: 重构 registerTaskProgress 函数，使用工厂函数**

参考 Task 5 的模式，将 `onMacroRendererSlotted` 替换为工厂函数包装

---

## Task 7: 重构 heatmap/register.ts 使用工厂函数

**Files:**
- Modify: `src/lib/heatmap/register.ts`

- [ ] **Step 1: 导入 createMacroHandler**

- [ ] **Step 2: 重构 registerHeatmap 函数，使用工厂函数**

---

## Task 8: 重构 blockView/register.ts 使用工厂函数

**Files:**
- Modify: `src/lib/blockView/register.ts`

- [ ] **Step 1: 导入 createMacroHandler**

- [ ] **Step 2: 重构 registerBlockView 函数，使用工厂函数**

---

## Task 9: 重构 summary/register.ts 使用工厂函数

**Files:**
- Modify: `src/lib/summary/register.ts`

- [ ] **Step 1: 导入 createMacroHandler**

- [ ] **Step 2: 重构 registerSummaryCommands 函数，使用工厂函数**

---

## Task 10: 添加 defaultSlashCommandTemplate 到 Settings Types

**Files:**
- Modify: `src/settings/types.ts`

- [ ] **Step 1: 在各功能 Settings 接口中添加 defaultSlashCommandTemplate**

```typescript
export interface TaskProgressSettings {
  enabled: boolean;
  defaultDisplayType: ViewType;
  // ... existing fields
  defaultSlashCommandTemplate?: string;  // 新增
}

export interface HeatmapSettings {
  enabled: boolean;
  // ... existing fields
  defaultSlashCommandTemplate?: string;  // 新增
}

export interface BlockViewSettings {
  enabled: boolean;
  // ... existing fields
  defaultSlashCommandTemplate?: string;  // 新增
}

export interface SummarySettings {
  enabled: boolean;
  // ... existing fields
  defaultSlashCommandTemplate?: string;  // 新增
}

export interface MilestoneSettings {
  enabled: boolean;
  // ... existing fields
  defaultSlashCommandTemplate?: string;  // 新增
}
```

---

## Task 11: 更新 defaultSettings.json 添加默认模板

**Files:**
- Modify: `src/settings/defaultSettings.json`

- [ ] **Step 1: 为各功能添加默认斜杠命令模板**

在 `taskProgress` 中添加：
```json
"defaultSlashCommandTemplate": ":taskprogress mini-circle"
```

在 `heatmap` 中添加：
```json
"defaultSlashCommandTemplate": ":heatmap, view=year, tag=Task"
```

在 `blockView` 中添加：
```json
"defaultSlashCommandTemplate": ":blockview, view=list"
```

在 `summary` 中添加：
```json
"defaultSlashCommandTemplate": ":summary, type=weekly"
```

在 `milestone` 中添加：
```json
"defaultSlashCommandTemplate": ":milestone, displayStyle=compact, inline=true, milestoneList=Initiation;Planning;Execution;Monitoring;Closure"
```

---

## Task 12: 更新翻译文件

**Files:**
- Modify: `src/translations/zh-CN.json`, `src/translations/en.json`, `src/translations/ja.json`

- [ ] **Step 1: 添加功能开关相关翻译**

在三个翻译文件中添加：
```json
"settings.features": "Features",
"settings.taskProgress": "Task Progress",
"settings.heatmap": "Heatmap",
"settings.blockView": "Block View",
"settings.summary": "Summary",
"settings.milestone": "Milestone"
```

---

## Task 13: 验证与测试

**Files:**
- Test: 所有修改的文件

- [ ] **Step 1: 构建验证**

```bash
npm run build 2>&1 | head -50
```

- [ ] **Step 2: 类型检查**

```bash
npx tsc --noEmit 2>&1 | head -50
```

- [ ] **Step 3: 手动验证场景**

1. 打开设置，确认 Advanced tab 消失
2. 在 General Settings 中关闭 Toolbar，确认 Toolbar tab 消失
3. 在 General Settings 中关闭 Task Progress，确认 Task Progress tab 消失
4. 重新开启功能，确认 tab 恢复显示
5. 插入宏命令 `{{renderer :milestone}}`，确认能正常渲染
6. 插入 `{{renderer :heatmap}}` 确认不受影响
7. 确认斜杠命令在功能关闭时不再出现

---

## Self-Review Checklist

- [ ] 所有 5 个功能模块都已使用 createMacroHandler
- [ ] AdvancedSettings tab 已删除
- [ ] Toolbar tab 已加入条件过滤
- [ ] 所有功能开关（包括 Toolbar）能正确控制 tab 显示/隐藏
- [ ] 斜杠命令在功能关闭时不注册
- [ ] 默认模板从 settings 读取
- [ ] 翻译文件已更新
- [ ] 构建和类型检查通过

