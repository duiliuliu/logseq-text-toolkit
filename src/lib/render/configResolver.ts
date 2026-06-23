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

export type ConfigSchemaType = 'string' | 'boolean' | 'number' | 'stringList' | 'enum' | 'json';

export interface ConfigSchema<T = any> {
  key: string;
  type: ConfigSchemaType;
  enumValues?: string[];
  defaultValue?: T;
  settingKey?: string;
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

function parseValue(raw: string, type: ConfigSchemaType, enumValues?: string[]): any {
  switch (type) {
    case 'boolean':
      const lower = raw.toLowerCase().trim();
      return lower === 'true' || lower === '1' || lower === 'yes';
    
    case 'number': {
      const num = parseFloat(raw);
      return Number.isFinite(num) ? num : undefined;
    }
    
    case 'stringList':
      return raw.split(';').map(s => s.trim()).filter(Boolean);
    
    case 'enum':
      if (enumValues && enumValues.includes(raw.trim())) {
        return raw.trim();
      }
      return undefined;
    
    case 'json':
      try {
        return JSON.parse(raw);
      } catch {
        return undefined;
      }
    
    case 'string':
    default:
      return raw.trim();
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
    if ((schema as any).positionalIndex !== undefined) {
      const posIdx = (schema as any).positionalIndex as number;
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
    .filter(s => (s as any).positionalIndex !== undefined)
    .sort((a, b) => ((a as any).positionalIndex || 0) - ((b as any).positionalIndex || 0))
    .map(s => s.key);
  
  // 如果有位置参数，注册到 rendererArgs
  if (positional.length > 0) {
    // 检查全局是否存在 registerRendererArgModel
    // 避免循环依赖的问题
    if (typeof (globalThis as any).__rendererArgModelRegistry === 'function') {
      (globalThis as any).__rendererArgModelRegistry(prefix, { positional });
    } else {
      // 在测试环境或特定场景下，尝试直接注册
      try {
        // @ts-ignore
        const { registerRendererArgModel } = require('./rendererArgs');
        registerRendererArgModel(prefix, { positional });
      } catch {
        // 忽略导入失败，不会影响核心功能
      }
    }
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
    let value: any;
    let source: string;

    if (macroArgs[schema.key] !== undefined) {
      value = parseValue(macroArgs[schema.key], schema.type, schema.enumValues);
      source = 'macro';
    } else if (schema.settingKey && getNestedValue(settings, schema.settingKey) !== undefined) {
      value = getNestedValue(settings, schema.settingKey);
      source = 'settings';
    } else if (schema.defaultValue !== undefined) {
      value = schema.defaultValue;
      source = 'default';
    }

    if (schema.parse && value !== undefined) {
      try {
        value = schema.parse(String(value));
      } catch (e) {
        if (enableWarnings) {
          console.warn(`[ConfigResolver] Custom parse failed for ${schema.key}:`, e);
        }
      }
    }

    if (schema.type === 'enum' && schema.enumValues && !schema.enumValues.includes(value as string)) {
      if (enableWarnings) {
        console.warn(`[ConfigResolver] Invalid enum value "${value}" for ${schema.key}`);
      }
      value = schema.defaultValue;
    }

    result[schema.key] = value;

    if (enableWarnings) {
      console.debug(`[ConfigResolver] ${schema.key} = ${JSON.stringify(value)} (source: ${source})`);
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

    switch (schema.type) {
      case 'boolean': {
        const validValues = ['true', 'false', '1', '0', 'yes', 'no'];
        if (!validValues.includes(argValue.toLowerCase().trim())) {
          errors.push(`Invalid boolean value "${argValue}" for ${schema.key}`);
        }
        break;
      }

      case 'number': {
        const num = parseFloat(argValue);
        if (!Number.isFinite(num)) {
          errors.push(`Invalid number value "${argValue}" for ${schema.key}`);
        }
        break;
      }

      case 'enum': {
        if (!schema.enumValues || !schema.enumValues.includes(argValue.trim())) {
          errors.push(`Invalid enum value "${argValue}" for ${schema.key}. Valid values: ${schema.enumValues?.join(', ')}`);
        }
        break;
      }

      case 'json': {
        try {
          JSON.parse(argValue);
        } catch {
          errors.push(`Invalid JSON value for ${schema.key}`);
        }
        break;
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