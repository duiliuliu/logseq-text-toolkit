/**
 * ConfigResolver - 统一宏参数解析框架
 * 
 * =============================================================================
 * 功能概述
 * =============================================================================
 * 
 * 本模块提供类型安全的参数定义和三层覆盖解析功能：
 * - 宏参数 > Settings配置 > 默认设置
 * 
 * 支持的参数类型：string / boolean / number / stringList / enum / json
 * 
 * =============================================================================
 * 使用示例
 * =============================================================================
 * 
 * // 1. 定义 Schema
 * const SCHEMAS: ConfigSchema[] = [
 *   { key: 'view', type: 'enum', enumValues: ['year', 'month'], defaultValue: 'year' },
 *   { key: 'width', type: 'number', defaultValue: 600 },
 *   { key: 'inline', type: 'boolean', defaultValue: false },
 * ];
 * 
 * // 2. 解析参数（应用三层覆盖原则）
 * const config = resolveConfigFromTokens(SCHEMAS, macroArgs, settings);
 * 
 * =============================================================================
 * 三层覆盖原则
 * =============================================================================
 * 
 * 1. 宏参数（最高优先级）- 直接在宏命令中指定
 * 2. Settings配置 - 用户在设置页面配置的值
 * 3. 默认值（最低优先级）- Schema中定义的defaultValue
 */

import { registerRendererArgModel } from './rendererArgs';

export type ConfigSchemaType = 'string' | 'boolean' | 'number' | 'stringList' | 'enum' | 'json';

export interface ConfigSchema<T = any> {
  key: string;
  type: ConfigSchemaType;
  enumValues?: string[];
  defaultValue?: T;
  settingKey?: string;
  positionalIndex?: number;
  parse?: (raw: string) => T;
}

const registeredSchemas = new Map<string, ConfigSchema[]>();

export function registerConfigSchema(prefix: string, schemas: ConfigSchema[]): void {
  registeredSchemas.set(prefix, schemas);
}

export function getRegisteredSchema(prefix: string): ConfigSchema[] | undefined {
  return registeredSchemas.get(prefix);
}

/**
 * 获取所有已注册的宏命令前缀
 */
export function getAllRegisteredPrefixes(): string[] {
  return Array.from(registeredSchemas.keys());
}

/**
 * 检查前缀是否已注册
 */
export function isPrefixRegistered(prefix: string): boolean {
  return registeredSchemas.has(prefix);
}

type ParseResult =
  | { ok: true; value: any }
  | { ok: false; reason: string };

function parseValue(raw: unknown, schema: ConfigSchema): ParseResult {
  if (typeof raw === 'string' && schema.parse) {
    try {
      return { ok: true, value: schema.parse(raw) };
    } catch (e) {
      return { ok: false, reason: e instanceof Error ? e.message : 'custom parse failed' };
    }
  }

  switch (schema.type) {
    case 'boolean':
      if (typeof raw === 'boolean') return { ok: true, value: raw };
      if (typeof raw === 'string') {
        const lower = raw.toLowerCase().trim();
        if (['true', '1', 'yes'].includes(lower)) return { ok: true, value: true };
        if (['false', '0', 'no'].includes(lower)) return { ok: true, value: false };
      }
      return { ok: false, reason: `invalid boolean value "${String(raw)}"` };
    
    case 'number': {
      if (typeof raw === 'number' && Number.isFinite(raw)) return { ok: true, value: raw };
      if (typeof raw === 'string') {
        const num = parseFloat(raw);
        if (Number.isFinite(num)) return { ok: true, value: num };
      }
      return { ok: false, reason: `invalid number value "${String(raw)}"` };
    }
    
    case 'stringList':
      if (Array.isArray(raw)) {
        return { ok: true, value: raw.map(String).map(s => s.trim()).filter(Boolean) };
      }
      if (typeof raw === 'string') {
        return { ok: true, value: raw.split(';').map(s => s.trim()).filter(Boolean) };
      }
      return { ok: false, reason: `invalid stringList value "${String(raw)}"` };
    
    case 'enum':
      if (typeof raw === 'string') {
        const value = raw.trim();
        if (schema.enumValues?.includes(value)) {
          return { ok: true, value };
        }
      }
      return { ok: false, reason: `invalid enum value "${String(raw)}"` };
    
    case 'json':
      if (typeof raw === 'string') {
        try {
          return { ok: true, value: JSON.parse(raw) };
        } catch {
          return { ok: false, reason: `invalid JSON value for ${schema.key}` };
        }
      }
      if (raw !== null && typeof raw === 'object') return { ok: true, value: raw };
      return { ok: false, reason: `invalid JSON value for ${schema.key}` };
    
    case 'string':
    default:
      if (raw === undefined || raw === null) {
        return { ok: false, reason: `missing string value for ${schema.key}` };
      }
      return { ok: true, value: String(raw).trim() };
  }
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

export interface ResolveOptions {
  enableWarnings?: boolean;
}

/**
 * 从 tokens 数组解析参数
 * 
 * 支持位置参数和命名参数的混合解析
 * 位置参数会根据 schemas 中的 positionalIndex 映射
 * 
 * @param schemas - 参数 Schema 数组
 * @param tokens - tokens 数组，如 ['year', 'dark', 'custom=value']
 * @param settings - Settings 配置对象
 * @param options - 解析选项
 * @returns 解析后的配置对象
 * 
 * @example
 * const schemas = [
 *   { key: 'view', type: 'enum', enumValues: ['year', 'month'], positionalIndex: 0 },
 *   { key: 'theme', type: 'string', positionalIndex: 1 },
 *   { key: 'width', type: 'number' },
 * ];
 * const result = resolveConfigFromTokensArray(schemas, ['year', 'dark', 'width=600'], {});
 * // result = { view: 'year', theme: 'dark', width: 600 }
 */
export function resolveConfigFromTokensArray<T extends Record<string, any>>(
  schemas: ConfigSchema[],
  tokens: string[],
  settings: Record<string, any>,
  options: ResolveOptions = {}
): T {
  // 先将 tokens 分为位置参数和命名参数
  const positional: string[] = [];
  const namedArgs: Record<string, string> = {};

  for (const token of tokens) {
    const idx = token.indexOf('=');
    if (idx > 0) {
      const k = token.slice(0, idx).trim();
      const v = token.slice(idx + 1).trim();
      if (k) namedArgs[k] = v;
    } else {
      positional.push(token);
    }
  }

  // 根据 schemas 中的 positionalIndex 映射位置参数
  const positionalArgs: Record<string, string> = {};
  for (const schema of schemas) {
    if (schema.positionalIndex !== undefined) {
      const posIdx = schema.positionalIndex;
      if (positional[posIdx] !== undefined) {
        positionalArgs[schema.key] = positional[posIdx];
      }
    }
  }

  // 合并参数（命名参数优先）
  const mergedArgs = { ...positionalArgs, ...namedArgs };

  // 使用 resolveConfigFromTokens 进行类型转换和默认值处理
  return resolveConfigFromTokens(schemas, mergedArgs, settings, options);
}

/**
 * 扩展的 ConfigSchema，支持位置参数索引
 */
export interface ConfigSchemaWithPositional<T = any> extends ConfigSchema<T> {
  positionalIndex?: number;
}

/**
 * 注册渲染器并配置 ConfigSchema
 * 
 * 这个函数统一注册到 rendererArgs 和 configResolver，支持：
 * - 位置参数映射（通过 positionalIndex）
 * - 类型安全的参数定义
 * - 三层覆盖原则（宏参数 > Settings > 默认值）
 * 
 * @param prefix - 宏命令前缀，如 ':blockview'
 * @param schemas - 参数 Schema 数组
 * 
 * @example
 * registerRendererWithConfigSchema(':blockview', [
 *   { key: 'view', type: 'enum', enumValues: ['year', 'month'], positionalIndex: 0 },
 *   { key: 'theme', type: 'string', positionalIndex: 1 },
 *   { key: 'custom', type: 'string' },
 * ]);
 * 
 * // 解析混合参数
 * const config = resolveConfigFromTokensArray(schemas, ['year', 'dark', 'custom=value'], settings);
 * // → { view: 'year', theme: 'dark', custom: 'value' }
 */
export function registerRendererWithConfigSchema(prefix: string, schemas: ConfigSchema[]): void {
  // 注册到 configResolver
  registerConfigSchema(prefix, schemas);
  
  // 提取位置参数映射（用于 rendererArgs 的兼容）
  const positional = schemas
    .filter(s => s.positionalIndex !== undefined)
    .sort((a, b) => (a.positionalIndex ?? 0) - (b.positionalIndex ?? 0))
    .map(s => s.key);
  
  // 如果有位置参数，注册到 rendererArgs
  if (positional.length > 0) {
    registerRendererArgModel(prefix, { positional });
  }
}

export function resolveConfigFromTokens<T extends Record<string, any>>(
  schemas: ConfigSchema[],
  macroArgs: Record<string, string>,
  settings: Record<string, any>,
  options: ResolveOptions = {}
): T {
  const result: Record<string, any> = {};
  const { enableWarnings = false } = options;

  for (const schema of schemas) {
    let resolved: { value: any; source: string } | undefined;

    if (macroArgs[schema.key] !== undefined) {
      const parsed = parseValue(macroArgs[schema.key], schema);
      if (parsed.ok) {
        resolved = { value: parsed.value, source: 'macro' };
      } else if (enableWarnings) {
        console.warn(`[ConfigResolver] Ignoring macro value for ${schema.key}: ${parsed.reason}`);
      }
    }

    if (!resolved && schema.settingKey) {
      const settingValue = getNestedValue(settings, schema.settingKey);
      if (settingValue !== undefined) {
        const parsed = parseValue(settingValue, schema);
        if (parsed.ok) {
          resolved = { value: parsed.value, source: 'settings' };
        } else if (enableWarnings) {
          console.warn(`[ConfigResolver] Ignoring setting value for ${schema.key}: ${parsed.reason}`);
        }
      }
    }

    if (!resolved && schema.defaultValue !== undefined) {
      resolved = { value: schema.defaultValue, source: 'default' };
    }

    result[schema.key] = resolved?.value;

    if (enableWarnings) {
      if (resolved) {
        console.debug(`[ConfigResolver] ${schema.key} = ${JSON.stringify(resolved.value)} (source: ${resolved.source})`);
      } else {
        console.debug(`[ConfigResolver] ${schema.key} is unresolved`);
      }
    }
  }

  return result as T;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateConfigSchema(schemas: ConfigSchema[], args: Record<string, string>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const schema of schemas) {
    const argValue = args[schema.key];
    if (argValue === undefined) continue;

    const parsed = parseValue(argValue, schema);
    if (!parsed.ok) {
      switch (schema.type) {
        case 'boolean':
          errors.push(`Invalid boolean value "${argValue}" for ${schema.key}`);
          break;

        case 'number':
          errors.push(`Invalid number value "${argValue}" for ${schema.key}`);
          break;

        case 'enum':
          errors.push(`Invalid enum value "${argValue}" for ${schema.key}. Valid values: ${schema.enumValues?.join(', ')}`);
          break;

        case 'json':
          errors.push(`Invalid JSON value for ${schema.key}`);
          break;

        default:
          errors.push(`Invalid value "${argValue}" for ${schema.key}`);
      }
    }
  }

  const knownKeys = schemas.map(s => s.key);
  for (const key of Object.keys(args)) {
    if (!knownKeys.includes(key)) {
      warnings.push(`Unknown parameter "${key}"`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export function inferSchemaFromArgs(args: Record<string, string>): ConfigSchema[] {
  const schemas: ConfigSchema[] = [];

  for (const [key, value] of Object.entries(args)) {
    let type: ConfigSchemaType = 'string';

    if (/^(true|false|1|0|yes|no)$/i.test(value)) {
      type = 'boolean';
    } else if (!isNaN(parseFloat(value)) && isFinite(value as any)) {
      type = 'number';
    } else if (value.includes(';')) {
      type = 'stringList';
    } else if (value.startsWith('{') && value.endsWith('}')) {
      try {
        JSON.parse(value);
        type = 'json';
      } catch {
        type = 'string';
      }
    }

    schemas.push({ key, type });
  }

  return schemas;
}
