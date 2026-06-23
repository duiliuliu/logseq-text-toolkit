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