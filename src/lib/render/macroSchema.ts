/**
 * =============================================================================
 * MacroSchema - 统一宏参数解析框架 (P1.1)
 * =============================================================================
 *
 * 问题背景
 * --------
 * 现有各模块（Milestone、TaskProgress、BlockView、Heatmap 等）的宏参数
 * 解析逻辑分散且重复，每个都有自己的"宏参数 > 模板 > 默认设置"覆盖逻辑，
 * 导致：
 *   1. 代码重复：每个模块都实现类似的覆盖逻辑
 *   2. 错误风险高：颜色方案 JSON 解析、布尔值解析等容易出错
 *   3. 难以维护：新增参数需要多处修改
 *   4. 缺少统一错误提示：参数解析失败没有反馈给用户
 *
 * 设计目标
 * --------
 * 1. 声明式：用 Schema 描述参数，解析逻辑统一处理
 * 2. 三层覆盖：宏参数 > 模板配置 > 默认设置
 * 3. 类型安全：内置类型转换器（string、boolean、number、JSON、string[]）
 * 4. 可扩展：自定义验证器、默认值、枚举限制
 *
 * 使用流程
 * --------
 * 1. 定义 Schema（一次声明，永久使用）
 * 2. 从宏 tokens 解析 rawValues
 * 3. 从模板配置读取 templateValues
 * 4. 从 settings 读取 defaultValues
 * 5. 调用 resolveConfig(schema, rawValues, templateValues, defaultValues)
 *    → 得到类型安全的最终配置
 *
 * =============================================================================
 */

import logger from '../logger'
import {
  splitRendererArgs,
  parseRendererArgs,
  findModel,
  registerRendererArgModel,
  createRendererArgUpdater,
  type RendererArgModel,
} from './rendererArgs'

export {
  splitRendererArgs,
  parseRendererArgs,
  findModel,
  registerRendererArgModel,
  createRendererArgUpdater,
}

// ============================================================================
// 1. 类型系统
// ============================================================================

export type MacroParamType =
  | 'string'       // 普通字符串
  | 'boolean'      // true/false
  | 'number'       // 数字
  | 'stringList'   // 分号分隔的字符串数组，如 "需求;开发;测试"
  | 'json'         // JSON 对象
  | 'enum'         // 枚举值（需指定 allowedValues）

export interface MacroParamSchema<T = unknown> {
  /** 参数键名（对应命名参数 key） */
  key: string
  /** 类型，用于值转换 */
  type: MacroParamType
  /** 可选：枚举限制（type 为 'enum' 时必填） */
  allowedValues?: readonly T[]
  /** 可选：自定义值转换函数（优先级最高） */
  transform?: (rawValue: string, context: MacroParseContext) => T
  /** 可选：值验证器 */
  validate?: (value: T, context: MacroParseContext) => boolean | string
  /** 可选：默认值（当宏参数、模板、设置都没有时使用） */
  fallback?: T
  /** 可选：当值为空字符串时是否视为未提供 */
  treatEmptyAsUndefined?: boolean
}

export interface MacroParseContext {
  macroType: string        // 宏命令类型，如 ':milestone'
  macroName?: string       // 可读的宏名称，用于日志
  currentBlockUuid?: string
}

// ============================================================================
// 2. 核心解析器
// ============================================================================

/**
 * 单个参数值的转换与验证
 */
function convertParam<T>(
  rawValue: string | undefined,
  schema: MacroParamSchema<T>,
  context: MacroParseContext,
): T | undefined {
  if (rawValue === undefined) return undefined
  if (schema.treatEmptyAsUndefined && rawValue.trim() === '') return undefined

  // 1) 自定义转换
  if (schema.transform) {
    try {
      return schema.transform(rawValue, context)
    } catch (err) {
      logger.warn(
        `[MacroSchema] transform failed for key="${schema.key}" raw="${rawValue}"`,
        err
      )
      return undefined
    }
  }

  // 2) 按类型转换
  try {
    switch (schema.type) {
      case 'string':
        return rawValue as unknown as T

      case 'boolean': {
        const v = rawValue.toLowerCase().trim()
        if (['true', '1', 'yes', 'y', 'on'].includes(v)) return true as unknown as T
        if (['false', '0', 'no', 'n', 'off'].includes(v)) return false as unknown as T
        // 无效值返回 undefined（由上层使用默认值）
        logger.warn(
          `[MacroSchema] invalid boolean for key="${schema.key}" raw="${rawValue}"`
        )
        return undefined
      }

      case 'number': {
        const n = Number(rawValue)
        if (Number.isNaN(n)) {
          logger.warn(`[MacroSchema] invalid number for key="${schema.key}" raw="${rawValue}"`)
          return undefined
        }
        return n as unknown as T
      }

      case 'stringList': {
        const items = rawValue
          .split(/[;；]/)
          .map(s => s.trim())
          .filter(Boolean)
        return items as unknown as T
      }

      case 'json': {
        return JSON.parse(rawValue) as T
      }

      case 'enum': {
        if (schema.allowedValues && !schema.allowedValues.includes(rawValue as unknown as T)) {
          logger.warn(
            `[MacroSchema] invalid enum for key="${schema.key}" raw="${rawValue}"`,
            `allowed: ${JSON.stringify(schema.allowedValues)}`
          )
          return undefined
        }
        return rawValue as unknown as T
      }
    }
  } catch (err) {
    logger.warn(`[MacroSchema] parse error for key="${schema.key}" raw="${rawValue}"`, err)
    return undefined
  }

  return undefined
}

/**
 * 三层配置合并：宏参数 > 模板 > 默认设置
 *
 * 优先级说明：
 *   1. rawValues（从宏 tokens 解析得到的参数）
 *   2. templateValues（通过 template 参数引用的预定义模板）
 *   3. defaultValues（从 settings 读取的全局默认值）
 *   4. schema.fallback（Schema 声明的兜底默认值）
 */
export function resolveConfig<T extends Record<string, unknown>>(
  schemas: readonly MacroParamSchema[],
  rawValues: Record<string, string>,
  templateValues: Partial<T>,
  defaultValues: Partial<T>,
  context: MacroParseContext,
): T {
  const result: Record<string, unknown> = {}

  for (const schema of schemas) {
    let finalValue: unknown

    // 1) 宏参数（最高优先级）
    const raw = rawValues[schema.key]
    if (raw !== undefined) {
      const converted = convertParam(raw, schema, context)
      if (converted !== undefined) finalValue = converted
    }

    // 2) 模板配置
    if (finalValue === undefined) {
      const tplVal = templateValues[schema.key]
      if (tplVal !== undefined) finalValue = tplVal
    }

    // 3) 默认设置
    if (finalValue === undefined) {
      const defVal = defaultValues[schema.key]
      if (defVal !== undefined) finalValue = defVal
    }

    // 4) Schema 兜底
    if (finalValue === undefined && schema.fallback !== undefined) {
      finalValue = schema.fallback
    }

    // 验证
    if (finalValue !== undefined && schema.validate) {
      const validation = schema.validate(finalValue as never, context)
      if (validation === false || typeof validation === 'string') {
        logger.warn(
          `[MacroSchema] validation failed for key="${schema.key}"`,
          typeof validation === 'string' ? validation : ''
        )
      }
    }

    if (finalValue !== undefined) {
      result[schema.key] = finalValue
    }
  }

  return result as T
}

// ============================================================================
// 3. 便捷工具：从 MacroArguments 一次性解析配置
// ============================================================================

export interface MacroArguments {
  type: string
  tokens: string[]
}

/**
 * 从 Logseq 回调的 arguments 解析为 MacroArguments
 * （各模块的 register.ts 内可直接使用）
 */
export function parseMacroArgumentsFromLogseq(
  args: any[] | undefined,
): MacroArguments | null {
  const result = splitRendererArgs(args)
  if (!result) return null
  return { type: result.type, tokens: result.tokens }
}

/**
 * 完整解析流程：Macro tokens → RawValues → 合并模板和默认值
 *
 * @example
 *   const schemas = [
 *     { key: 'displayStyle', type: 'enum', allowedValues: ['capsule', 'badge'] },
 *     { key: 'showProgress', type: 'boolean', fallback: true },
 *   ] as const
 *
 *   const config = resolveConfigFromTokens(
 *     schemas,
 *     { type: ':milestone', tokens },
 *     template,          // from settings templates
 *     settings,          // from settings.milestone
 *     { milestonePropKey: 'xxxxx' } // 额外的默认值
 *   )
 */
export function resolveConfigFromTokens<T extends Record<string, unknown>>(
  schemas: readonly MacroParamSchema[],
  macroArgs: MacroArguments,
  templateValues: Partial<T> = {},
  defaultValues: Partial<T> = {},
  contextOverrides: Partial<MacroParseContext> = {},
): T {
  const rawValues = parseRendererArgs(macroArgs.type, macroArgs.tokens) as Record<
    string,
    string
  >

  const context: MacroParseContext = {
    macroType: macroArgs.type,
    ...contextOverrides,
  }

  return resolveConfig(schemas, rawValues, templateValues, defaultValues, context)
}

// ============================================================================
// 4. 错误与警告：收集解析过程中的问题，便于向用户反馈
// ============================================================================

export interface ParseWarning {
  severity: 'warn' | 'error'
  message: string
  key?: string
}

/**
 * 批量验证 Schema 值（带警告收集）
 * 用于 SettingsModal 等 UI 中对模板配置做校验
 */
export function validateConfig(
  schemas: readonly MacroParamSchema[],
  config: Record<string, unknown>,
  context: MacroParseContext,
): ParseWarning[] {
  const warnings: ParseWarning[] = []

  for (const schema of schemas) {
    const value = config[schema.key]
    if (value === undefined) continue

    if (schema.validate) {
      const result = schema.validate(value as never, context)
      if (result === false) {
        warnings.push({
          severity: 'error',
          key: schema.key,
          message: `Invalid value for "${schema.key}"`,
        })
      } else if (typeof result === 'string') {
        warnings.push({
          severity: 'warn',
          key: schema.key,
          message: result,
        })
      }
    }
  }

  return warnings
}

// ============================================================================
// 5. 预置 Schema（各模块复用的常用参数声明）
// ============================================================================

/**
 * 常用布尔值参数 Schema 构造器
 *
 * @example
 *   const showProgressSchema = booleanSchema('showProgress', true)
 */
export function booleanSchema(
  key: string,
  fallback?: boolean,
): MacroParamSchema<boolean> {
  return { key, type: 'boolean', fallback }
}

/**
 * 常用字符串枚举参数 Schema 构造器
 *
 * @example
 *   const displayStyleSchema = enumSchema(
 *     'displayStyle',
 *     ['capsule', 'badge', 'track'] as const,
 *     'capsule'
 *   )
 */
export function enumSchema<T extends string>(
  key: string,
  allowedValues: readonly T[],
  fallback?: T,
): MacroParamSchema<T> {
  return { key, type: 'enum', allowedValues, fallback }
}

/**
 * 常用字符串列表参数 Schema 构造器
 * 支持以分号、中文分号分隔的字符串数组
 */
export function stringListSchema(
  key: string,
  fallback?: string[],
): MacroParamSchema<string[]> {
  return { key, type: 'stringList', fallback }
}

/**
 * 常用 JSON 对象参数 Schema 构造器
 * 典型用例：colorScheme 等复杂配置参数
 */
export function jsonSchema<T>(
  key: string,
  fallback?: T,
): MacroParamSchema<T> {
  return { key, type: 'json', fallback }
}

/**
 * 普通字符串参数 Schema 构造器
 */
export function stringSchema(
  key: string,
  fallback?: string,
): MacroParamSchema<string> {
  return { key, type: 'string', fallback }
}

// ============================================================================
// 6. 类型安全的宏注册与参数更新辅助
// ============================================================================

export interface MacroRegistrationOptions {
  prefix: string            // 宏命令前缀，如 ':milestone'
  positionalKeys?: string[] // 位置参数（对应 RendererArgModel 的 positional）
  macroName?: string        // 可读名称，用于日志
}

/**
 * 注册宏参数模型（与 registerRendererArgModel 一致的功能）
 * 主要用于统一日志和提示
 */
export function registerMacroSchema(opts: MacroRegistrationOptions): void {
  const model: RendererArgModel = {
    positional: opts.positionalKeys || [],
  }
  registerRendererArgModel(opts.prefix, model)
  logger.info(`[MacroSchema] Registered "${opts.macroName || opts.prefix}"`)
}
