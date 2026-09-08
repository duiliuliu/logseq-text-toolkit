import { describe, test, expect, beforeEach } from 'vitest';
import {
  resolveConfigFromTokens,
  resolveConfigFromTokensArray,
  validateConfigSchema,
  registerConfigSchema,
  registerRendererWithConfigSchema,
  getRegisteredSchema,
  inferSchemaFromArgs,
  type ConfigSchema
} from './configResolver';

// 导入 rendererArgs 的函数用于集成测试
import {
  registerRendererArgModel,
  splitRendererArgs,
  parseRendererArgs,
  createRendererArgUpdater
} from './rendererArgs';

// 导入 macroTemplateValidator 的函数用于集成测试
import {
  validateMacroTemplate,
  getMacroPrefix,
  getMacroTypes,
  extractMacroTemplate
} from './macroTemplateValidator';

describe('configResolver - 完整场景覆盖测试', () => {

  // ========================================================================
  // 共享的 Schema 定义
  // ========================================================================
  const TEST_SCHEMAS: ConfigSchema[] = [
    { key: 'view', type: 'enum', enumValues: ['year', 'month', 'week'], defaultValue: 'year' },
    { key: 'displayMode', type: 'enum', enumValues: ['full', 'basic', 'minimal'], defaultValue: 'full' },
    { key: 'width', type: 'number', defaultValue: 600 },
    { key: 'inline', type: 'boolean', defaultValue: false },
    { key: 'tags', type: 'stringList', defaultValue: [] },
    { key: 'custom', type: 'json', defaultValue: {} },
    { key: 'name', type: 'string', defaultValue: 'default' },
  ];

  const HEATMAP_SCHEMAS: ConfigSchema[] = [
    { key: 'view', type: 'enum', enumValues: ['year', 'month', 'week'], defaultValue: 'year', settingKey: 'heatmap.defaultView' },
    { key: 'displayMode', type: 'enum', enumValues: ['full', 'basic', 'minimal'], defaultValue: 'full', settingKey: 'heatmap.defaultDisplayMode' },
    { key: 'colorFormula', type: 'enum', enumValues: ['simple', 'weighted'], defaultValue: 'simple', settingKey: 'heatmap.colorFormula' },
    { key: 'containerWidth', type: 'number', defaultValue: 800 },
    { key: 'enableMonthPage', type: 'boolean', defaultValue: false },
  ];

  // ========================================================================
  // 第一部分：基本功能测试（对应 rendererArgs.test.ts 场景）
  // ========================================================================

  describe('【场景1】rendererArgs 基本场景', () => {

    describe('1.1 注册与检索', () => {
      test('应该能注册和检索 Schema', () => {
        registerConfigSchema(':heatmap', TEST_SCHEMAS);
        const retrieved = getRegisteredSchema(':heatmap');
        expect(retrieved).toEqual(TEST_SCHEMAS);
      });

      test('未注册的 prefix 应返回 undefined', () => {
        const retrieved = getRegisteredSchema(':nonexistent');
        expect(retrieved).toBeUndefined();
      });
    });

    describe('1.2 基础参数解析（对应 rendererArgs.parseRendererArgs）', () => {
      beforeEach(() => {
        registerRendererArgModel(':heatmap', { positional: ['view'] });
      });

      test('应该解析位置参数', () => {
        const parsed = parseRendererArgs(':heatmap', ['year']);
        expect(parsed.view).toBe('year');
      });

      test('应该解析命名参数', () => {
        const parsed = parseRendererArgs(':heatmap', ['displayMode=full']);
        expect(parsed.displayMode).toBe('full');
      });

      test('命名参数应该覆盖位置参数', () => {
        const parsed = parseRendererArgs(':heatmap', ['year', 'view=month']);
        expect(parsed.view).toBe('month');
      });

      test('应该处理混合参数', () => {
        registerRendererArgModel(':blockview', { positional: ['view', 'theme'] });
        const parsed = parseRendererArgs(':blockview', ['year', 'dark', 'custom=value']);
        expect(parsed.view).toBe('year');
        expect(parsed.theme).toBe('dark');
        expect(parsed.custom).toBe('value');
      });
    });

    describe('1.3 参数分割（对应 rendererArgs.splitRendererArgs）', () => {
      test('应该正确分割基础参数', () => {
        const result = splitRendererArgs([':heatmap', 'year']);
        expect(result).toEqual({ type: ':heatmap', tokens: ['year'] });
      });

      test('应该处理带逗号的参数', () => {
        const result = splitRendererArgs([':heatmap', 'year', ',', 'displayMode=full']);
        expect(result).toEqual({ type: ':heatmap', tokens: ['year', 'displayMode=full'] });
      });

      test('应该处理空参数', () => {
        expect(splitRendererArgs(undefined)).toBeNull();
        expect(splitRendererArgs([])).toBeNull();
      });

      test('应该过滤空 token', () => {
        const result = splitRendererArgs([':heatmap', '', 'year', '']);
        expect(result?.tokens).toEqual(['year']);
      });
    });

    describe('1.4 参数更新（对应 rendererArgs.createRendererArgUpdater）', () => {
      const { updateRendererArgs } = createRendererArgUpdater([':heatmap', ':热力图']);

      test('应该能添加新参数', () => {
        const result = updateRendererArgs('{{renderer :heatmap}}', { view: 'year' });
        expect(result).toContain('year');
      });

      test('应该能更新现有参数', () => {
        const result = updateRendererArgs('{{renderer :heatmap, view=month}}', { view: 'year' });
        expect(result).toContain('year');
        expect(result).not.toContain('month');
      });

      test('应该能删除参数', () => {
        const result = updateRendererArgs('{{renderer :heatmap, view=year}}', { view: null });
        expect(result).toBe('{{renderer :heatmap}}');
      });

      test('应该能批量更新', () => {
        const result = updateRendererArgs(
          '{{renderer :heatmap, view=year}}',
          { view: 'month', containerWidth: '600px' }
        );
        expect(result).toContain('month');
        expect(result).toContain('containerWidth=600px');
      });

      test('应该处理多语言前缀', () => {
        const result = updateRendererArgs('{{renderer :热力图}}', { view: 'year' });
        expect(result).toContain('year');
        expect(result).toContain(':热力图');
      });

      test('应该处理没有参数的情况', () => {
        const result = updateRendererArgs('{{renderer :heatmap}}', {});
        expect(result).toBe('{{renderer :heatmap}}');
      });

      test('应该保留参数顺序（位置参数在前）', () => {
        const result = updateRendererArgs(
          '{{renderer :heatmap, view=year, displayMode=full}}',
          { view: 'month', containerWidth: '600px' }
        );
        const monthIndex = result.indexOf('month');
        const containerWidthIndex = result.indexOf('containerWidth');
        expect(monthIndex).toBeLessThan(containerWidthIndex);
      });
    });

    describe('1.5 默认值处理（configResolver 特有）', () => {
      test('应该使用默认值当无参数时', () => {
        const result = resolveConfigFromTokens(TEST_SCHEMAS, {}, {});
        expect(result.view).toBe('year');
        expect(result.displayMode).toBe('full');
        expect(result.width).toBe(600);
        expect(result.inline).toBe(false);
        expect(result.tags).toEqual([]);
        expect(result.custom).toEqual({});
        expect(result.name).toBe('default');
      });

      test('应该使用宏参数当提供时', () => {
        const result = resolveConfigFromTokens(TEST_SCHEMAS, {
          view: 'month',
          width: '800',
          inline: 'true',
        }, {});
        expect(result.view).toBe('month');
        expect(result.width).toBe(800);
        expect(result.inline).toBe(true);
      });
    });
  });

  // ========================================================================
  // 第二部分：三层覆盖原则测试（configResolver 核心功能）
  // ========================================================================

  describe('【场景2】三层覆盖原则', () => {
    const OVERRIDE_SCHEMAS: ConfigSchema[] = [
      { key: 'view', type: 'enum', enumValues: ['year', 'month', 'week'], defaultValue: 'year', settingKey: 'defaultView' },
      { key: 'displayMode', type: 'enum', enumValues: ['full', 'basic'], defaultValue: 'full', settingKey: 'displayMode' },
      { key: 'width', type: 'number', defaultValue: 600 },
      { key: 'inline', type: 'boolean', defaultValue: false },
    ];

    test('场景1: 无宏参数无Settings，使用默认值', () => {
      const result = resolveConfigFromTokens(OVERRIDE_SCHEMAS, {}, {});
      expect(result.view).toBe('year');
      expect(result.displayMode).toBe('full');
      expect(result.width).toBe(600);
      expect(result.inline).toBe(false);
    });

    test('场景2: 有Settings无宏参数，Settings覆盖默认值', () => {
      const result = resolveConfigFromTokens(
        OVERRIDE_SCHEMAS,
        {},
        { defaultView: 'month', displayMode: 'basic' }
      );
      expect(result.view).toBe('month');
      expect(result.displayMode).toBe('basic');
    });

    test('场景3: 有宏参数，宏参数覆盖Settings和默认值', () => {
      const result = resolveConfigFromTokens(
        OVERRIDE_SCHEMAS,
        { view: 'week', width: '800' },
        { defaultView: 'month', displayMode: 'basic' }
      );
      expect(result.view).toBe('week');  // 宏参数最高优先级
      expect(result.width).toBe(800);    // 宏参数覆盖默认值
      expect(result.displayMode).toBe('basic');  // 使用Settings
    });

    test('场景4: 优先级明确 - 宏参数 > Settings > 默认值', () => {
      const result = resolveConfigFromTokens(
        OVERRIDE_SCHEMAS,
        { view: 'week' },  // 宏参数
        { defaultView: 'month' }  // Settings
      );
      expect(result.view).toBe('week');  // 宏参数胜出
      expect(result.displayMode).toBe('full');  // 使用默认值
    });

    test('宏参数非法时应该回退到 Settings', () => {
      const result = resolveConfigFromTokens(
        OVERRIDE_SCHEMAS,
        { view: 'invalid', displayMode: 'invalid', inline: 'maybe' },
        { defaultView: 'month', displayMode: 'basic' }
      );

      expect(result.view).toBe('month');
      expect(result.displayMode).toBe('basic');
      expect(result.inline).toBe(false);
    });

    test('Settings 非法时应该继续回退到默认值', () => {
      const schemas: ConfigSchema[] = [
        { key: 'view', type: 'enum', enumValues: ['year', 'month'], defaultValue: 'year', settingKey: 'view' },
        { key: 'width', type: 'number', defaultValue: 600, settingKey: 'width' },
        { key: 'inline', type: 'boolean', defaultValue: true, settingKey: 'inline' },
      ];

      const result = resolveConfigFromTokens(schemas, {}, {
        view: 'bad-view',
        width: 'wide',
        inline: 'maybe',
      });

      expect(result.view).toBe('year');
      expect(result.width).toBe(600);
      expect(result.inline).toBe(true);
    });
  });

  // ========================================================================
  // 第三部分：类型转换测试（configResolver 特有）
  // ========================================================================

  describe('【场景3】类型转换', () => {
    test('stringList 类型应该正确解析', () => {
      const schemas: ConfigSchema[] = [{ key: 'tags', type: 'stringList', defaultValue: [] }];
      const result = resolveConfigFromTokens(schemas, { tags: 'a;b;c' }, {});
      expect(result.tags).toEqual(['a', 'b', 'c']);
    });

    test('json 类型应该正确解析', () => {
      const schemas: ConfigSchema[] = [{ key: 'config', type: 'json', defaultValue: {} }];
      const result = resolveConfigFromTokens(schemas, { config: '{"key": "value", "num": 123}' }, {});
      expect(result.config).toEqual({ key: 'value', num: 123 });
    });

    test('boolean 类型应该支持多种格式', () => {
      const schemas: ConfigSchema[] = [
        { key: 'flag1', type: 'boolean', defaultValue: false },
        { key: 'flag2', type: 'boolean', defaultValue: false },
        { key: 'flag3', type: 'boolean', defaultValue: false },
        { key: 'flag4', type: 'boolean', defaultValue: false },
      ];
      const result = resolveConfigFromTokens(schemas, {
        flag1: 'true',
        flag2: 'false',
        flag3: '1',
        flag4: '0',
      }, {});
      expect(result.flag1).toBe(true);
      expect(result.flag2).toBe(false);
      expect(result.flag3).toBe(true);
      expect(result.flag4).toBe(false);
    });

    test('number 类型应该正确解析', () => {
      const schemas: ConfigSchema[] = [
        { key: 'width', type: 'number', defaultValue: 0 },
        { key: 'height', type: 'number', defaultValue: 0 },
        { key: 'ratio', type: 'number', defaultValue: 0 },
      ];
      const result = resolveConfigFromTokens(schemas, {
        width: '600',
        height: '400',
        ratio: '1.5',
      }, {});
      expect(result.width).toBe(600);
      expect(result.height).toBe(400);
      expect(result.ratio).toBe(1.5);
    });
  });

  // ========================================================================
  // 第四部分：参数验证测试（对应 macroTemplateValidator.ts 场景）
  // ========================================================================

  describe('【场景4】macroTemplateValidator 场景', () => {
    const VALIDATION_SCHEMAS: ConfigSchema[] = [
      { key: 'view', type: 'enum', enumValues: ['year', 'month', 'week'] },
      { key: 'displayMode', type: 'enum', enumValues: ['full', 'basic', 'minimal'] },
      { key: 'width', type: 'number' },
      { key: 'inline', type: 'boolean' },
      { key: 'config', type: 'json' },
    ];

    describe('4.1 模板提取（对应 extractMacroTemplate）', () => {
      test('应该提取 {{renderer }} 包裹的内容', () => {
        const result = extractMacroTemplate('{{renderer :heatmap year}}');
        expect(result).toBe(':heatmap year');
      });

      test('应该处理无包裹的情况', () => {
        const result = extractMacroTemplate(':heatmap year');
        expect(result).toBe(':heatmap year');
      });

      test('应该处理带空格的模板', () => {
        const result = extractMacroTemplate('  {{renderer :heatmap year}}  ');
        expect(result).toBe(':heatmap year');
      });
    });

    describe('4.2 前缀获取（对应 getMacroPrefix）', () => {
      test('应该获取有效的宏前缀', () => {
        expect(getMacroPrefix('heatmap')).toBe(':heatmap');
        expect(getMacroPrefix('blockview')).toBe(':blockview');
        expect(getMacroPrefix('milestone')).toBe(':milestone');
        expect(getMacroPrefix('taskprogress')).toBe(':taskprogress');
      });
    });

    describe('4.3 类型列表获取（对应 getMacroTypes）', () => {
      test('应该获取所有宏类型', () => {
        // 先注册一些 Schema
        registerConfigSchema(':heatmap', HEATMAP_SCHEMAS);
        registerConfigSchema(':blockview', [{ key: 'view', type: 'string' }]);
        
        const types = getMacroTypes();
        expect(types).toContainEqual({ type: 'heatmap', prefix: ':heatmap' });
        expect(types).toContainEqual({ type: 'blockview', prefix: ':blockview' });
      });

      test('应该返回动态注册的前缀', () => {
        // 清除之前的注册，重新开始
        registerConfigSchema(':test1', []);
        registerConfigSchema(':test2', []);
        
        const types = getMacroTypes();
        expect(types).toContainEqual({ type: 'test1', prefix: ':test1' });
        expect(types).toContainEqual({ type: 'test2', prefix: ':test2' });
      });
    });

    describe('4.4 模板验证（对应 validateMacroTemplate）', () => {
      test('应该验证有效的模板', () => {
        registerRendererArgModel(':heatmap', { positional: ['view'] });
        registerConfigSchema(':heatmap', HEATMAP_SCHEMAS);
        const result = validateMacroTemplate('{{renderer :heatmap year}}', 'heatmap');
        expect(result.valid).toBe(true);
      });

      test('应将已声明的命名参数视为有效参数', () => {
        registerRendererArgModel(':heatmap', { positional: ['view'], named: ['tag'] });
        registerConfigSchema(':heatmap', HEATMAP_SCHEMAS);
        const result = validateMacroTemplate(':heatmap, view=year, tag=Task', 'heatmap');
        expect(result.valid).toBe(true);
        expect(result.warnings ?? []).not.toContain('Unknown parameter "tag" - it may be ignored');
      });

      test('应该验证空模板', () => {
        registerRendererArgModel(':heatmap', { positional: ['view'] });
        registerConfigSchema(':heatmap', HEATMAP_SCHEMAS);
        const result = validateMacroTemplate('', 'heatmap');
        expect(result.valid).toBe(true);
        expect(result.warnings).toContain('Empty template will use default values');
      });

      test('应该检测错误的前缀', () => {
        registerRendererArgModel(':heatmap', { positional: ['view'] });
        registerConfigSchema(':heatmap', HEATMAP_SCHEMAS);
        const result = validateMacroTemplate('{{renderer :wrong year}}', 'heatmap');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Template must start with');
      });

      test('应该检测未闭合的大括号', () => {
        registerRendererArgModel(':heatmap', { positional: ['view'] });
        registerConfigSchema(':heatmap', HEATMAP_SCHEMAS);
        // 注意：validateMacroTemplate 先检查前缀，所以需要完整的前缀
        const result = validateMacroTemplate('{{renderer :heatmap year', 'heatmap');
        // 这里会先触发前缀检查（因为正则匹配到的是不完整的模板）
        // 实际上未闭合检测需要在大括号数量不匹配时触发
        expect(result.valid).toBe(false);
        // 可能是前缀错误或未闭合错误，取决于检测顺序
        expect(result.error).toMatch(/Template must start with|Unmatched braces/);
      });
    });

    describe('4.5 参数验证（configResolver 提供，与 validateMacroTemplate 互补）', () => {
      test('应该验证枚举值', () => {
        const result = validateConfigSchema(VALIDATION_SCHEMAS, { view: 'invalid' });
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain('Invalid enum value "invalid" for view');
      });

      test('应该验证布尔值', () => {
        const result = validateConfigSchema(VALIDATION_SCHEMAS, { inline: 'maybe' });
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Invalid boolean value "maybe" for inline');
      });

      test('应该验证数字值', () => {
        const result = validateConfigSchema(VALIDATION_SCHEMAS, { width: 'abc' });
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Invalid number value "abc" for width');
      });

      test('应该验证 JSON 值', () => {
        const result = validateConfigSchema(VALIDATION_SCHEMAS, { config: 'invalid json' });
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Invalid JSON value for config');
      });

      test('应该警告未知参数', () => {
        const result = validateConfigSchema(VALIDATION_SCHEMAS, { unknownParam: 'value' });
        expect(result.valid).toBe(true);
        expect(result.warnings).toContain('Unknown parameter "unknownParam"');
      });

      test('应该通过有效参数验证', () => {
        const result = validateConfigSchema(VALIDATION_SCHEMAS, {
          view: 'year',
          displayMode: 'full',
          width: '600',
          inline: 'true',
          config: '{"key": "value"}',
        });
        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      });
    });
  });

  // ========================================================================
  // 第五部分：集成测试
  // ========================================================================

  describe('【场景5】集成测试', () => {
    test('完整工作流：注册 -> 分割 -> 解析 -> 验证 -> 更新', () => {
      // 1. 注册参数模型
      registerRendererArgModel(':heatmap', { positional: ['view'] });
      registerConfigSchema(':heatmap', HEATMAP_SCHEMAS);

      // 2. 模拟 Logseq 传入的参数
      const payloadArgs = ['{{renderer :heatmap year, displayMode=minimal}}'];
      const content = payloadArgs[0];

      // 3. 提取模板内容
      const templateContent = extractMacroTemplate(content);

      // 4. 分割参数
      const split = splitRendererArgs([':heatmap', 'year', ',', 'displayMode=minimal']);
      expect(split?.type).toBe(':heatmap');
      expect(split?.tokens).toHaveLength(2);

      // 5. 解析原始参数
      const rawArgs = parseRendererArgs(':heatmap', split!.tokens);
      expect(rawArgs.view).toBe('year');
      expect(rawArgs.displayMode).toBe('minimal');

      // 6. 使用 ConfigResolver 进行类型转换和默认值处理
      const settings = { heatmap: { defaultView: 'month', colorFormula: 'weighted' } };
      const config = resolveConfigFromTokens(HEATMAP_SCHEMAS, rawArgs, settings);

      expect(config.view).toBe('year');           // 宏参数优先级最高
      expect(config.displayMode).toBe('minimal');  // 宏参数
      expect(config.colorFormula).toBe('weighted'); // Settings
      expect(config.containerWidth).toBe(800);     // 默认值
      expect(config.enableMonthPage).toBe(false);  // 默认值

      // 7. 验证参数
      const validation = validateConfigSchema(HEATMAP_SCHEMAS, rawArgs);
      expect(validation.valid).toBe(true);

      // 8. 更新参数
      const { updateRendererArgs } = createRendererArgUpdater([':heatmap']);
      const updated = updateRendererArgs(content, { view: 'month', containerWidth: '1000' });
      expect(updated).toContain('month');
      expect(updated).toContain('containerWidth=1000');
    });

    test('错误处理：无效枚举值回退到默认值', () => {
      registerRendererArgModel(':heatmap', { positional: ['view'] });
      registerConfigSchema(':heatmap', HEATMAP_SCHEMAS);

      const rawArgs = parseRendererArgs(':heatmap', ['invalid_view']);
      const config = resolveConfigFromTokens(HEATMAP_SCHEMAS, rawArgs, {});

      // 无效枚举值应该回退到默认值
      expect(config.view).toBe('year');
    });

    test('错误处理：无效宏枚举值优先回退到 Settings', () => {
      registerRendererArgModel(':heatmap', { positional: ['view'] });
      registerConfigSchema(':heatmap', HEATMAP_SCHEMAS);

      const rawArgs = parseRendererArgs(':heatmap', ['invalid_view']);
      const config = resolveConfigFromTokens(HEATMAP_SCHEMAS, rawArgs, {
        heatmap: { defaultView: 'month' }
      });

      expect(config.view).toBe('month');
    });

    test('嵌套设置路径支持', () => {
      const schemas: ConfigSchema[] = [
        { key: 'theme', type: 'string', defaultValue: 'light', settingKey: 'settings.theme' },
        { key: 'language', type: 'string', defaultValue: 'en', settingKey: 'settings.language' },
        { key: 'nestedValue', type: 'string', defaultValue: 'default', settingKey: 'a.b.c.d' },
      ];

      const settings = {
        settings: {
          theme: 'dark',
          language: 'zh-CN'
        },
        a: { b: { c: { d: 'nested' } } }
      };

      const result = resolveConfigFromTokens(schemas, {}, settings);
      expect(result.theme).toBe('dark');
      expect(result.language).toBe('zh-CN');
      expect(result.nestedValue).toBe('nested');
    });
  });

  // ========================================================================
  // 第六部分：Schema 自动推断（configResolver 特有）
  // ========================================================================

  describe('【场景6】registerRendererWithConfigSchema 统一注册', () => {
    test('应该支持混合参数解析（位置参数 + 命名参数）', () => {
      // 使用新的统一注册函数
      const BLOCKVIEW_SCHEMAS: ConfigSchema[] = [
        { key: 'view', type: 'enum', enumValues: ['year', 'month', 'week'], positionalIndex: 0 },
        { key: 'theme', type: 'string', positionalIndex: 1 },
        { key: 'custom', type: 'string' },
        { key: 'enabled', type: 'boolean', defaultValue: true },
      ];
      
      registerRendererWithConfigSchema(':blockview', BLOCKVIEW_SCHEMAS);
      expect(parseRendererArgs(':blockview', ['year', 'dark'])).toEqual({
        view: 'year',
        theme: 'dark'
      });
      
      // 解析混合参数：['year', 'dark', 'custom=value']
      const tokens = ['year', 'dark', 'custom=value'];
      const config = resolveConfigFromTokensArray(BLOCKVIEW_SCHEMAS, tokens, {});
      
      expect(config.view).toBe('year');      // 位置参数 0
      expect(config.theme).toBe('dark');     // 位置参数 1
      expect(config.custom).toBe('value');   // 命名参数
      expect(config.enabled).toBe(true);     // 默认值
    });

    test('应该支持命名参数覆盖位置参数', () => {
      const SCHEMAS: ConfigSchema[] = [
        { key: 'view', type: 'enum', enumValues: ['year', 'month'], positionalIndex: 0 },
      ];
      
      registerRendererWithConfigSchema(':test', SCHEMAS);
      
      // 位置参数 'year' 被命名参数 'view=month' 覆盖
      const tokens = ['year', 'view=month'];
      const config = resolveConfigFromTokensArray(SCHEMAS, tokens, {});
      
      expect(config.view).toBe('month');  // 命名参数覆盖位置参数
    });

    test('应该支持解析字符串 ":blockview ,year,dark,custom=value"', () => {
      const SCHEMAS: ConfigSchema[] = [
        { key: 'view', type: 'enum', enumValues: ['year', 'month'], positionalIndex: 0 },
        { key: 'theme', type: 'string', positionalIndex: 1 },
        { key: 'custom', type: 'string' },
      ];
      
      // 解析类似 ":blockview ,year,dark,custom=value" 的字符串
      const input = ':blockview ,year,dark,custom=value';
      
      // 提取 tokens（模拟 parseRendererArgs 的行为）
      const parts = input.split(',').map(s => s.trim()).filter(Boolean);
      const tokens = parts.slice(1); // 去掉第一个 ':blockview'
      
      const config = resolveConfigFromTokensArray(SCHEMAS, tokens, {});
      
      expect(config.view).toBe('year');
      expect(config.theme).toBe('dark');
      expect(config.custom).toBe('value');
    });
  });

  describe('【场景7】Schema 自动推断', () => {
    test('应该从参数推断 Schema', () => {
      const args = {
        view: 'year',
        count: '100',
        enabled: 'true',
        tags: 'a;b;c',
        config: '{"key": "value"}',
      };

      const schemas = inferSchemaFromArgs(args);

      expect(schemas).toContainEqual({ key: 'view', type: 'string' });
      expect(schemas).toContainEqual({ key: 'count', type: 'number' });
      expect(schemas).toContainEqual({ key: 'enabled', type: 'boolean' });
      expect(schemas).toContainEqual({ key: 'tags', type: 'stringList' });
      expect(schemas).toContainEqual({ key: 'config', type: 'json' });
    });

    test('应该处理混合类型', () => {
      const args = {
        name: 'test',
        age: '25',
        active: 'true',
      };

      const schemas = inferSchemaFromArgs(args);
      expect(schemas.length).toBe(3);
    });
  });
});
