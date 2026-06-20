/**
 * Milestone 参数 Schema 声明
 *
 * 使用统一的 MacroSchema 框架替代原先的 parseMacroArguments。
 * 设计遵循"三层覆盖"原则：宏参数 > 模板 > 默认设置
 *
 * 与原逻辑的等价对应：
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │ 原逻辑：                                                     │
 *   │  1) parsed.milestoneList = 宏参数                           │
 *   │  2) template.milestoneList = 模板                           │
 *   │  3) settings.* = 默认设置                                   │
 *   │                                                             │
 *   │ 新框架(MacroSchema)：                                       │
 *   │  resolveConfigFromTokens(schemas, macro, template, default) │
 *   └─────────────────────────────────────────────────────────────┘
 */

import {
  type MacroParamSchema,
  booleanSchema,
  enumSchema,
  stringListSchema,
  jsonSchema,
  stringSchema,
} from '../render'
import type {
  MilestoneDisplayStyle,
  MilestoneTooltipStyle,
  ColorScheme,
  MilestoneConfig,
  MilestoneTemplate,
} from './types'

/**
 * Milestone 支持的所有显示样式
 */
export const MILSTONE_STYLES: readonly MilestoneDisplayStyle[] = [
  'capsule',
  'badge',
  'track',
  'card',
  'compact',
  'arrow-capsule',
  'timeline-track',
] as const

/**
 * Milestone 支持的所有 tooltip 样式
 */
export const TOOLTIP_STYLES: readonly MilestoneTooltipStyle[] = [
  'minimal',
  'compact',
  'detailed',
  'elegant',
] as const

/**
 * Milestone 参数 Schema 声明
 *
 * 说明：
 * 1. 'template' 参数是模板引用，不在 Schema 里（特殊处理）
 * 2. 'milestoneList' 在宏中是 "需求;开发;测试" 字符串，
 *    在模板/设置中是 string[]
 * 3. 'colorScheme' 在宏中是 JSON 字符串，在模板/设置中是对象
 */
export const MILESTONE_SCHEMAS: readonly MacroParamSchema[] = [
  // ---------- 字符串类型 ----------
  stringSchema('filterTag'),
  stringSchema('filterPropKey'),
  stringSchema('filterPropValue'),
  stringSchema('milestonePropKey'),
  stringSchema('property'),
  stringSchema('dateField', 'scheduled'),

  // ---------- 枚举类型 ----------
  enumSchema<MilestoneDisplayStyle>(
    'displayStyle',
    MILSTONE_STYLES,
    'capsule',
  ),
  enumSchema<MilestoneTooltipStyle>(
    'tooltipStyle',
    TOOLTIP_STYLES,
    'compact',
  ),

  // ---------- 布尔类型 ----------
  booleanSchema('showProgress', true),
  booleanSchema('showLabel', true),
  booleanSchema('inline', false),

  // ---------- 列表类型 ----------
  stringListSchema('milestoneList'),

  // ---------- JSON 类型 ----------
  jsonSchema<ColorScheme>('colorScheme'),
  // 🔹 里程碑权重：{"设计": 0.2, "开发": 0.5, "测试": 0.3}
  //    未配置的里程碑默认权重 1，最终自动归一化
  {
    key: 'weights',
    type: 'json',
    validate: (val): boolean => {
      if (val == null || typeof val !== 'object') return false
      for (const k of Object.keys(val as Record<string, unknown>)) {
        const v = (val as Record<string, unknown>)[k]
        if (typeof v !== 'number' || v < 0) return false
      }
      return true
    },
  },
]

/**
 * 从 MilestoneTemplate 提取出可与 MacroSchema 配合使用的部分
 */
export function templateToPartialConfig(
  tpl: MilestoneTemplate | undefined,
): Partial<MilestoneConfig> {
  if (!tpl) return {}
  return {
    filterTag: tpl.filterTag,
    filterPropKey: tpl.filterPropKey,
    milestonePropKey: tpl.milestonePropKey,
    milestoneList: tpl.milestoneList,
    displayStyle: tpl.displayStyle,
    showProgress: tpl.showProgress,
    showLabel: tpl.showLabel,
    inline: tpl.inline,
    dateField: tpl.dateField,
    colorScheme: tpl.colorScheme,
    // 🔹 模板层面的权重配置
    weights: tpl.weights,
  }
}
