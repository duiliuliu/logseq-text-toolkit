/**
 * rendererArgs 模块单元测试
 * 直接测试 src/lib/render/rendererArgs.ts 中的导出函数
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerRendererArgModel,
  splitRendererArgs,
  parseRendererArgs,
  createRendererArgUpdater,
} from './rendererArgs';

describe('render/rendererArgs.ts', () => {
  beforeEach(() => {
    // 每个测试前重置注册模型
    // 注意：这里无法重置模块状态，因为 models 是模块级变量
    // 在实际测试中，可能需要重构代码以支持测试
  });

  describe('registerRendererArgModel', () => {
    it('应该能注册基本模型', () => {
      registerRendererArgModel(':test', { positional: ['view'] });
      // 注册后，后续的 parseRendererArgs 应该能找到这个模型
      const parsed = parseRendererArgs(':test', ['year']);
      expect(parsed.view).toBe('year');
    });

    it('应该支持注册多个位置参数', () => {
      registerRendererArgModel(':multi', { positional: ['view', 'mode', 'theme'] });
      const parsed = parseRendererArgs(':multi', ['year', 'full', 'dark']);
      expect(parsed.view).toBe('year');
      expect(parsed.mode).toBe('full');
      expect(parsed.theme).toBe('dark');
    });
  });

  describe('splitRendererArgs', () => {
    it('应该正确分割基础参数', () => {
      const result = splitRendererArgs([':heatmap', 'year']);
      expect(result).toEqual({
        type: ':heatmap',
        tokens: ['year'],
      });
    });

    it('应该处理带逗号的参数', () => {
      const result = splitRendererArgs([':heatmap', 'year', ',', 'displayMode=full']);
      expect(result).toEqual({
        type: ':heatmap',
        tokens: ['year', 'displayMode=full'],
      });
    });

    it('应该处理空参数', () => {
      expect(splitRendererArgs(undefined)).toBeNull();
      expect(splitRendererArgs([])).toBeNull();
    });

    it('应该处理带空格的类型', () => {
      const result = splitRendererArgs([':heatmap ', 'year']);
      expect(result?.type).toBe(':heatmap');
    });

    it('应该处理多逗号分隔', () => {
      const result = splitRendererArgs([':heatmap', 'year', ',', 'displayMode=full', ',', 'theme=dark']);
      expect(result?.tokens).toEqual(['year', 'displayMode=full', 'theme=dark']);
    });

    it('应该过滤空token', () => {
      const result = splitRendererArgs([':heatmap', '', 'year', '']);
      expect(result?.tokens).toEqual(['year']);
    });
  });

  describe('parseRendererArgs', () => {
    beforeEach(() => {
      registerRendererArgModel(':heatmap', { positional: ['view'] });
      registerRendererArgModel(':blockview', { positional: ['view', 'theme'] });
    });

    it('应该解析位置参数', () => {
      const parsed = parseRendererArgs(':heatmap', ['year']);
      expect(parsed.view).toBe('year');
    });

    it('应该解析命名参数', () => {
      const parsed = parseRendererArgs(':heatmap', ['displayMode=full']);
      expect(parsed.displayMode).toBe('full');
    });

    it('命名参数应该覆盖位置参数', () => {
      const parsed = parseRendererArgs(':heatmap', ['year', 'view=month']);
      expect(parsed.view).toBe('month');
    });

    it('应该处理混合参数', () => {
      const parsed = parseRendererArgs(':blockview', ['year', 'dark', 'custom=value']);
      expect(parsed.view).toBe('year');
      expect(parsed.theme).toBe('dark');
      expect(parsed.custom).toBe('value');
    });

    it('应该处理空tokens', () => {
      const parsed = parseRendererArgs(':heatmap', []);
      expect(parsed).toEqual({});
    });

    it('应该处理带空格的参数', () => {
      const parsed = parseRendererArgs(':heatmap', [' view = year ']);
      expect(parsed.view).toBe('year');
    });
  });

  describe('createRendererArgUpdater', () => {
    const { updateRendererArgs } = createRendererArgUpdater([':heatmap', ':热力图']);

    it('应该能添加新参数', () => {
      const result = updateRendererArgs('{{renderer :heatmap}}', { view: 'year' });
      expect(result).toContain('year');
    });

    it('应该能更新现有参数', () => {
      const result = updateRendererArgs('{{renderer :heatmap, view=month}}', { view: 'year' });
      expect(result).toContain('year');
      expect(result).not.toContain('month');
    });

    it('应该能删除参数', () => {
      const result = updateRendererArgs('{{renderer :heatmap, view=year}}', { view: null });
      expect(result).toBe('{{renderer :heatmap}}');
    });

    it('应该能批量更新', () => {
      const result = updateRendererArgs(
        '{{renderer :heatmap, view=year}}',
        { view: 'month', containerWidth: '600px' }
      );
      expect(result).toContain('month');
      expect(result).toContain('containerWidth=600px');
    });

    it('应该处理多语言前缀', () => {
      const result = updateRendererArgs('{{renderer :热力图}}', { view: 'year' });
      expect(result).toContain('year');
      expect(result).toContain(':热力图');
    });

    it('应该处理带逗号的参数', () => {
      const result = updateRendererArgs('{{renderer :heatmap, view=year, displayMode=full}}', {
        view: 'month',
      });
      expect(result).toContain('month');
      expect(result).toContain('displayMode=full');
    });

    it('应该处理没有参数的情况', () => {
      const result = updateRendererArgs('{{renderer :heatmap}}', {});
      expect(result).toBe('{{renderer :heatmap}}');
    });

    it('应该处理多个更新的参数都删除', () => {
      const result = updateRendererArgs(
        '{{renderer :heatmap, view=year, displayMode=full}}',
        { view: null, displayMode: null }
      );
      expect(result).toBe('{{renderer :heatmap}}');
    });

    it('应该正确处理复杂格式', () => {
      const result = updateRendererArgs(
        '{{renderer :heatmap, year, displayMode=full}}',
        { displayMode: 'minimal' }
      );
      expect(result).toContain('minimal');
      expect(result).toContain('year');
    });

    it('应该处理中文参数值', () => {
      const result = updateRendererArgs('{{renderer :heatmap}}', { view: '年' });
      expect(result).toContain('年');
    });

    it('应该保留参数顺序', () => {
      const result = updateRendererArgs(
        '{{renderer :heatmap, view=year, displayMode=full}}',
        { view: 'month', containerWidth: '600px' }
      );
      // 位置参数应该在命名参数前面
      const monthIndex = result.indexOf('month');
      const containerWidthIndex = result.indexOf('containerWidth');
      expect(monthIndex).toBeLessThan(containerWidthIndex);
    });
  });

  describe('集成测试', () => {
    it('完整工作流：注册模型 -> 分割 -> 解析 -> 更新', () => {
      // 注册模型
      registerRendererArgModel(':fulltest', { positional: ['view', 'mode'] });

      // 分割参数
      const split = splitRendererArgs([':fulltest', 'year', ',', 'mode=full', ',', 'theme=dark']);
      expect(split).toBeTruthy();
      expect(split?.type).toBe(':fulltest');
      expect(split?.tokens).toHaveLength(3);

      // 解析参数
      const parsed = parseRendererArgs(':fulltest', split!.tokens);
      expect(parsed.view).toBe('year');
      expect(parsed.mode).toBe('full');
      expect(parsed.theme).toBe('dark');

      // 创建更新器并更新
      const { updateRendererArgs } = createRendererArgUpdater([':fulltest']);
      const original = '{{renderer :fulltest, year, mode=full}}';
      const updated = updateRendererArgs(original, { view: 'month', theme: 'dark' });

      expect(updated).toContain('month');
      expect(updated).toContain('mode=full');
      expect(updated).toContain('theme=dark');
    });
  });
});
