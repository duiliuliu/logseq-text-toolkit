import { describe, test, expect } from 'vitest';
import { 
  resolveConfigFromTokens, 
  validateConfigSchema, 
  registerConfigSchema,
  getRegisteredSchema,
  type ConfigSchema
} from './configResolver';

describe('configResolver', () => {
  const TEST_SCHEMAS: ConfigSchema[] = [
    { key: 'view', type: 'enum', enumValues: ['year', 'month', 'week'], defaultValue: 'year' },
    { key: 'displayMode', type: 'enum', enumValues: ['full', 'basic', 'minimal'], defaultValue: 'full', settingKey: 'defaultDisplayMode' },
    { key: 'width', type: 'number', defaultValue: 600 },
    { key: 'inline', type: 'boolean', defaultValue: false },
    { key: 'tags', type: 'stringList', defaultValue: [] },
    { key: 'custom', type: 'json', defaultValue: {} },
    { key: 'name', type: 'string', defaultValue: 'default' },
  ];

  describe('resolveConfigFromTokens', () => {
    test('should use default values when no args provided', () => {
      const result = resolveConfigFromTokens(TEST_SCHEMAS, {}, {});
      expect(result.view).toBe('year');
      expect(result.displayMode).toBe('full');
      expect(result.width).toBe(600);
      expect(result.inline).toBe(false);
      expect(result.tags).toEqual([]);
      expect(result.custom).toEqual({});
      expect(result.name).toBe('default');
    });

    test('should use macro args when provided', () => {
      const result = resolveConfigFromTokens(TEST_SCHEMAS, {
        view: 'month',
        width: '800',
        inline: 'true',
      }, {});
      expect(result.view).toBe('month');
      expect(result.width).toBe(800);
      expect(result.inline).toBe(true);
    });

    test('should apply three-layer override: macro > settings > default', () => {
      const result = resolveConfigFromTokens(TEST_SCHEMAS, 
        { view: 'week' },  // macro args
        { defaultView: 'month' }  // settings
      );
      expect(result.view).toBe('week');  // macro takes precedence
      expect(result.displayMode).toBe('full');  // uses default
    });

    test('should use settings when macro not provided', () => {
      const result = resolveConfigFromTokens(TEST_SCHEMAS, 
        {}, 
        { defaultDisplayMode: 'basic' }
      );
      expect(result.displayMode).toBe('basic');
    });

    test('should parse stringList correctly', () => {
      const result = resolveConfigFromTokens(TEST_SCHEMAS, { tags: 'a;b;c' }, {});
      expect(result.tags).toEqual(['a', 'b', 'c']);
    });

    test('should parse json correctly', () => {
      const result = resolveConfigFromTokens(TEST_SCHEMAS, { custom: '{"key": "value"}' }, {});
      expect(result.custom).toEqual({ key: 'value' });
    });

    test('should fallback to default for invalid enum value', () => {
      const result = resolveConfigFromTokens(TEST_SCHEMAS, { view: 'invalid' }, {});
      expect(result.view).toBe('year');  // falls back to default for invalid enum
    });
  });

  describe('validateConfigSchema', () => {
    test('should validate enum values', () => {
      const result = validateConfigSchema(TEST_SCHEMAS, { view: 'invalid' });
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid enum value "invalid" for view');
    });

    test('should validate boolean values', () => {
      const result = validateConfigSchema(TEST_SCHEMAS, { inline: 'maybe' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid boolean value "maybe" for inline');
    });

    test('should validate number values', () => {
      const result = validateConfigSchema(TEST_SCHEMAS, { width: 'abc' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid number value "abc" for width');
    });

    test('should validate json values', () => {
      const result = validateConfigSchema(TEST_SCHEMAS, { custom: 'invalid json' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid JSON value for custom');
    });

    test('should warn about unknown parameters', () => {
      const result = validateConfigSchema(TEST_SCHEMAS, { unknownParam: 'value' });
      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('Unknown parameter "unknownParam"');
    });

    test('should pass validation for valid args', () => {
      const result = validateConfigSchema(TEST_SCHEMAS, {
        view: 'year',
        displayMode: 'full',
        width: '600',
        inline: 'true',
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('registerConfigSchema', () => {
    test('should register and retrieve schemas', () => {
      registerConfigSchema(':test', TEST_SCHEMAS);
      const retrieved = getRegisteredSchema(':test');
      expect(retrieved).toEqual(TEST_SCHEMAS);
    });

    test('should return undefined for unregistered prefix', () => {
      const retrieved = getRegisteredSchema(':nonexistent');
      expect(retrieved).toBeUndefined();
    });
  });
});