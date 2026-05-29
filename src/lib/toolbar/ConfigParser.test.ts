/**
 * ConfigParser 模块单元测试
 * 测试 src/lib/toolbar/ConfigParser.ts 中的配置解析功能
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ConfigParser } from './ConfigParser';

describe('toolbar/ConfigParser', () => {
  let parser: ConfigParser;

  beforeEach(() => {
    parser = new ConfigParser();
  });

  describe('parse 方法', () => {
    it('应该能够解析数组格式的配置', () => {
      const config = [
        { id: 'item1', label: 'Item 1', invoke: 'action1' },
        { id: 'item2', label: 'Item 2', invoke: 'action2' },
      ];

      const result = parser.parse(config);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('item1');
      expect(result[1].id).toBe('item2');
    });

    it('应该能够解析对象格式的配置', () => {
      const config = {
        ToolbarItems: [
          { id: 'item1', label: 'Item 1', invoke: 'action1' },
        ],
      };

      const result = parser.parse(config);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('item1');
    });

    it('应该处理空配置', () => {
      const result = parser.parse([]);
      expect(result).toHaveLength(0);
    });

    it('应该处理 undefined 配置', () => {
      const result = parser.parse(undefined);
      expect(result).toHaveLength(0);
    });
  });

  describe('validate 方法', () => {
    it('应该验证有效的数组配置', () => {
      const config = [
        { id: 'valid-item', label: 'Valid Item', invoke: 'action' },
      ];

      expect(parser.validate(config)).toBe(true);
    });

    it('应该验证有效的对象配置', () => {
      const config = {
        ToolbarItems: [
          { id: 'valid-item', label: 'Valid Item', invoke: 'action' },
        ],
      };

      expect(parser.validate(config)).toBe(true);
    });

    it('应该拒绝空配置', () => {
      expect(parser.validate({})).toBe(false);
      expect(parser.validate(null)).toBe(false);
    });

    it('应该拒绝缺少必填字段的配置', () => {
      const invalidConfig = [
        { id: 'item-without-label' }, // 缺少 label
      ];

      expect(parser.validate(invalidConfig)).toBe(false);
    });

    it('应该拒绝无效类型的配置项', () => {
      const invalidConfig = [
        'not-an-object',
        null,
      ];

      expect(parser.validate(invalidConfig)).toBe(false);
    });
  });

  describe('getItem 方法', () => {
    it('应该能够获取指定 ID 的项目', () => {
      const config = [
        { id: 'target-item', label: 'Target', invoke: 'action' },
        { id: 'other-item', label: 'Other', invoke: 'action' },
      ];

      parser.parse(config);
      const item = parser.getItem('target-item');

      expect(item).toBeDefined();
      expect((item as any).id).toBe('target-item');
    });

    it('应该返回 undefined 当项目不存在时', () => {
      parser.parse([{ id: 'existing', label: 'Existing', invoke: 'action' }]);
      const item = parser.getItem('non-existent');

      expect(item).toBeUndefined();
    });

    it('应该能够获取分组中的子项目', () => {
      const config = [
        {
          id: 'group',
          label: 'Group',
          subItems: [
            { id: 'sub-item', label: 'Sub Item', invoke: 'action' },
          ],
        },
      ];

      parser.parse(config);
      const item = parser.getItem('sub-item');

      expect(item).toBeDefined();
      expect((item as any).id).toBe('sub-item');
    });
  });

  describe('getItems 方法', () => {
    it('应该返回所有项目', () => {
      const config = [
        { id: 'item1', label: 'Item 1', invoke: 'action' },
        { id: 'item2', label: 'Item 2', invoke: 'action' },
      ];

      parser.parse(config);
      const items = parser.getItems();

      expect(items).toHaveLength(2);
    });

    it('应该返回数组的副本而不是原始数组', () => {
      const config = [
        { id: 'item1', label: 'Item 1', invoke: 'action' },
      ];

      parser.parse(config);
      const items = parser.getItems();
      
      // 修改返回的数组不应该影响原始数据
      items.push({ id: 'added', label: 'Added', invoke: 'action' } as any);
      
      const itemsAgain = parser.getItems();
      expect(itemsAgain).toHaveLength(1);
    });
  });

  describe('解析后操作', () => {
    it('多次解析应该覆盖之前的结果', () => {
      const config1 = [
        { id: 'item1', label: 'First', invoke: 'action' },
      ];
      const config2 = [
        { id: 'item2', label: 'Second', invoke: 'action' },
      ];

      parser.parse(config1);
      parser.parse(config2);

      expect(parser.getItems()).toHaveLength(1);
      expect(parser.getItem('item1')).toBeUndefined();
      expect(parser.getItem('item2')).toBeDefined();
    });
  });
});
