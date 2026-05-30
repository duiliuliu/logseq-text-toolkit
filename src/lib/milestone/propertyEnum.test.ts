/**
 * PropertyEnumService 单元测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PropertyEnumService } from './propertyEnum';
import type { PropertyEnumValue } from './types';

// Mock logseq API
vi.mock('../../logseq', () => ({
  logseqAPI: {
    DB: {
      datascriptQuery: vi.fn(),
    },
  },
}));

// Mock logger
vi.mock('../../lib/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

import { logseqAPI } from '../../logseq';

describe('PropertyEnumService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('formatPropertyKey', () => {
    it('should format property key with correct prefix through getPropertyEnums', async () => {
      (logseqAPI.DB.datascriptQuery as any).mockResolvedValue([]);
      
      await PropertyEnumService.getPropertyEnums('test');
      
      // Verify the query was built with formatted key
      expect(logseqAPI.DB.datascriptQuery).toHaveBeenCalled();
    });

    it('should keep existing :user.property/ prefix', async () => {
      (logseqAPI.DB.datascriptQuery as any).mockResolvedValue([]);
      
      await PropertyEnumService.getPropertyEnums(':user.property/test');
      
      expect(logseqAPI.DB.datascriptQuery).toHaveBeenCalled();
    });

    it('should keep existing :logseq.property/ prefix', async () => {
      (logseqAPI.DB.datascriptQuery as any).mockResolvedValue([]);
      
      await PropertyEnumService.getPropertyEnums(':logseq.property/test');
      
      expect(logseqAPI.DB.datascriptQuery).toHaveBeenCalled();
    });

    it('should handle keys with leading colon', async () => {
      (logseqAPI.DB.datascriptQuery as any).mockResolvedValue([]);
      
      await PropertyEnumService.getPropertyEnums(':test');
      
      expect(logseqAPI.DB.datascriptQuery).toHaveBeenCalled();
    });
  });

  describe('getPropertyEnums', () => {
    it('should return empty array when logseqAPI is not initialized', async () => {
      // Temporarily set logseqAPI to undefined
      const originalLogseqAPI = (global as any).logseqAPI;
      (global as any).logseqAPI = undefined;
      
      const result = await PropertyEnumService.getPropertyEnums('test');
      
      expect(result).toEqual([]);
      
      // Restore
      (global as any).logseqAPI = originalLogseqAPI;
    });

    it('should return empty array when query returns null', async () => {
      (logseqAPI.DB.datascriptQuery as any).mockResolvedValue(null);
      
      const result = await PropertyEnumService.getPropertyEnums('test');
      
      expect(result).toEqual([]);
    });

    it('should return empty array when query returns non-array', async () => {
      (logseqAPI.DB.datascriptQuery as any).mockResolvedValue('not an array');
      
      const result = await PropertyEnumService.getPropertyEnums('test');
      
      expect(result).toEqual([]);
    });

    it('should parse valid query results correctly', async () => {
      const mockQueryResult = [
        [{
          'block/title': '需求',
          'block/refs': [
            { id: '1', uuid: 'uuid-1', 'block/title': 'Block 1' },
            { id: '2', uuid: 'uuid-2', 'block/title': 'Block 2' },
          ],
        }],
        [{
          'block/title': '设计',
          'block/refs': [
            { id: '3', uuid: 'uuid-3', 'block/title': 'Block 3' },
          ],
        }],
        [{
          'block/title': '需求',
          'block/refs': [
            { id: '4', uuid: 'uuid-4', 'block/title': 'Block 4' },
          ],
        }],
      ];

      (logseqAPI.DB.datascriptQuery as any).mockResolvedValue(mockQueryResult);
      
      const result = await PropertyEnumService.getPropertyEnums(':user.property/phase');
      
      expect(result.length).toBe(2);
      
      // Check that results are sorted by count descending
      expect(result[0].value).toBe('需求');
      expect(result[0].count).toBe(2);
      expect(result[1].value).toBe('设计');
      expect(result[1].count).toBe(1);
      
      // Check block data
      expect(result[0].blocks.length).toBeGreaterThan(0);
      expect(result[0].blocks[0].uuid).toBe('uuid-1');
    });

    it('should skip invalid items in query results', async () => {
      const mockQueryResult = [
        [null],
        ['not an object'],
        [{ noTitle: 'missing title' }],
        [{
          'block/title': '有效',
          'block/refs': [
            { id: '1', uuid: 'uuid-1', 'block/title': 'Block 1' },
          ],
        }],
      ];

      (logseqAPI.DB.datascriptQuery as any).mockResolvedValue(mockQueryResult);
      
      const result = await PropertyEnumService.getPropertyEnums('test');
      
      expect(result.length).toBe(1);
      expect(result[0].value).toBe('有效');
    });

    it('should handle refs without title property', async () => {
      const mockQueryResult = [
        [{
          'block/title': '测试',
          'block/refs': [
            { id: '1', uuid: 'uuid-1' }, // Missing 'block/title'
            { id: '2', uuid: 'uuid-2', 'block/title': 'Valid Block' },
          ],
        }],
      ];

      (logseqAPI.DB.datascriptQuery as any).mockResolvedValue(mockQueryResult);
      
      const result = await PropertyEnumService.getPropertyEnums('test');
      
      expect(result.length).toBe(1);
      expect(result[0].blocks.length).toBe(1); // Only the valid ref should be parsed
      expect(result[0].blocks[0].content).toBe('Valid Block');
    });

    it('should handle query errors gracefully', async () => {
      (logseqAPI.DB.datascriptQuery as any).mockRejectedValue(new Error('Query failed'));
      
      const result = await PropertyEnumService.getPropertyEnums('test');
      
      expect(result).toEqual([]);
    });
  });

  describe('getPropertyEnumsWithTag', () => {
    it('should return empty array when logseqAPI is not initialized', async () => {
      const originalLogseqAPI = (global as any).logseqAPI;
      (global as any).logseqAPI = undefined;
      
      const result = await PropertyEnumService.getPropertyEnumsWithTag('test', 'tag');
      
      expect(result).toEqual([]);
      
      (global as any).logseqAPI = originalLogseqAPI;
    });

    it('should execute filtered query with tag parameter', async () => {
      (logseqAPI.DB.datascriptQuery as any).mockResolvedValue([]);
      
      await PropertyEnumService.getPropertyEnumsWithTag('phase', 'project1');
      
      expect(logseqAPI.DB.datascriptQuery).toHaveBeenCalled();
    });

    it('should parse filtered query results correctly', async () => {
      const mockQueryResult = [
        [{
          'block/title': '需求',
          'block/refs': [
            { id: '1', uuid: 'uuid-1', 'block/title': 'Block 1' },
          ],
        }],
      ];

      (logseqAPI.DB.datascriptQuery as any).mockResolvedValue(mockQueryResult);
      
      const result = await PropertyEnumService.getPropertyEnumsWithTag('phase', 'project1');
      
      expect(result.length).toBe(1);
      expect(result[0].value).toBe('需求');
    });

    it('should handle null results in filtered query', async () => {
      (logseqAPI.DB.datascriptQuery as any).mockResolvedValue(null);
      
      const result = await PropertyEnumService.getPropertyEnumsWithTag('phase', 'tag');
      
      expect(result).toEqual([]);
    });

    it('should handle errors in filtered query', async () => {
      (logseqAPI.DB.datascriptQuery as any).mockRejectedValue(new Error('Filtered query failed'));
      
      const result = await PropertyEnumService.getPropertyEnumsWithTag('phase', 'tag');
      
      expect(result).toEqual([]);
    });
  });

  describe('PropertyEnumValue structure', () => {
    it('should return valid PropertyEnumValue objects', async () => {
      const mockQueryResult = [
        [{
          'block/title': '测试枚举',
          'block/refs': [
            { id: '123', uuid: 'test-uuid', 'block/title': 'Test Content' },
          ],
        }],
      ];

      (logseqAPI.DB.datascriptQuery as any).mockResolvedValue(mockQueryResult);
      
      const result = await PropertyEnumService.getPropertyEnums('test');
      
      const enumValue: PropertyEnumValue = result[0];
      
      expect(enumValue).toHaveProperty('value');
      expect(enumValue).toHaveProperty('count');
      expect(enumValue).toHaveProperty('blocks');
      expect(typeof enumValue.value).toBe('string');
      expect(typeof enumValue.count).toBe('number');
      expect(Array.isArray(enumValue.blocks)).toBe(true);
      
      // Check block structure
      const block = enumValue.blocks[0];
      expect(block).toHaveProperty('id');
      expect(block).toHaveProperty('uuid');
      expect(block).toHaveProperty('content');
      expect(block).toHaveProperty('properties');
      expect(block).toHaveProperty('createdAt');
      expect(block).toHaveProperty('updatedAt');
    });
  });
});
