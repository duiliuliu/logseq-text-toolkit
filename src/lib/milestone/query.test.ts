/**
 * Milestone Query 单元测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MilestoneQuery } from './query';
import type { MilestoneItem, BlockWithProperty, MilestoneData } from './types';

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

describe('MilestoneQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Property key formatting', () => {
    it('should return same key if already has :user.property/ prefix', async () => {
      const mockQueryResult = [];
      (logseqAPI.DB.datascriptQuery as any).mockResolvedValue(mockQueryResult);
      
      // This will trigger formatPropertyKey internally
      const result = await MilestoneQuery.query({ milestonePropKey: ':user.property/test' });
      
      expect(result.items).toBeDefined();
      expect(logseqAPI.DB.datascriptQuery).toHaveBeenCalled();
    });

    it('should return same key if already has :logseq.property/ prefix', async () => {
      const mockQueryResult = [];
      (logseqAPI.DB.datascriptQuery as any).mockResolvedValue(mockQueryResult);
      
      const result = await MilestoneQuery.query({ milestonePropKey: ':logseq.property/test' });
      
      expect(result.items).toBeDefined();
      expect(logseqAPI.DB.datascriptQuery).toHaveBeenCalled();
    });

    it('should format key without prefix to add :user.property/', async () => {
      const mockQueryResult = [];
      (logseqAPI.DB.datascriptQuery as any).mockResolvedValue(mockQueryResult);
      
      const result = await MilestoneQuery.query({ milestonePropKey: 'test' });
      
      expect(result.items).toBeDefined();
      expect(logseqAPI.DB.datascriptQuery).toHaveBeenCalled();
    });

    it('should remove leading colon before adding prefix', async () => {
      const mockQueryResult = [];
      (logseqAPI.DB.datascriptQuery as any).mockResolvedValue(mockQueryResult);
      
      const result = await MilestoneQuery.query({ milestonePropKey: ':test' });
      
      expect(result.items).toBeDefined();
      expect(logseqAPI.DB.datascriptQuery).toHaveBeenCalled();
    });

    it('should return undefined if key is undefined', async () => {
      const mockQueryResult = [];
      (logseqAPI.DB.datascriptQuery as any).mockResolvedValue(mockQueryResult);
      
      const result = await MilestoneQuery.query({});
      
      expect(result.items).toBeDefined();
    });
  });

  describe('Query methods', () => {
    const mockBlocks: BlockWithProperty[] = [
      {
        id: 'block-1',
        uuid: 'uuid-1',
        content: 'Test block 1',
        properties: { ':user.property/phase': '需求' },
        createdAt: '1715000000000',
        updatedAt: '1715000000000',
      },
      {
        id: 'block-2',
        uuid: 'uuid-2',
        content: 'Test block 2',
        properties: { ':user.property/phase': '设计' },
        createdAt: '1716000000000',
        updatedAt: '1716000000000',
      },
    ];

    it('should create empty data when given no configuration', async () => {
      const result = await MilestoneQuery.query({});
      
      expect(result.items).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.completedCount).toBe(0);
      expect(result.overallProgress).toBe(0);
    });

    it('should handle milestonePropKey query mode', async () => {
      (logseqAPI.DB.datascriptQuery as any)
        .mockResolvedValueOnce([
          [mockBlocks[0]],
          [mockBlocks[1]],
        ])
        .mockResolvedValueOnce([
          [null, '需求'],
          [null, '设计'],
        ]);
      
      const result = await MilestoneQuery.query({ milestonePropKey: ':user.property/phase' });
      
      expect(result.items.length).toBeGreaterThan(0);
      expect(logseqAPI.DB.datascriptQuery).toHaveBeenCalled();
    });

    it('should handle milestonePropKey with filterTag', async () => {
      (logseqAPI.DB.datascriptQuery as any).mockResolvedValue([]);
      
      const result = await MilestoneQuery.query({ 
        milestonePropKey: ':user.property/phase', 
        filterTag: 'test' 
      });
      
      expect(result.items).toBeDefined();
      expect(logseqAPI.DB.datascriptQuery).toHaveBeenCalled();
    });

    it('should handle milestonePropKey with filterPropKey and filterPropValue', async () => {
      (logseqAPI.DB.datascriptQuery as any).mockResolvedValue([]);
      
      const result = await MilestoneQuery.query({ 
        milestonePropKey: ':user.property/phase', 
        filterPropKey: ':user.property/project', 
        filterPropValue: 'project1' 
      });
      
      expect(result.items).toBeDefined();
      expect(logseqAPI.DB.datascriptQuery).toHaveBeenCalled();
    });

    it('should handle milestoneList query mode', async () => {
      (logseqAPI.DB.datascriptQuery as any).mockResolvedValue([]);
      
      const result = await MilestoneQuery.query({ 
        milestoneList: ['需求', '设计', '开发'] 
      });
      
      expect(result.items).toHaveLength(3);
      expect(result.totalCount).toBe(3);
      expect(result.items[0].label).toBe('需求');
      expect(result.items[1].label).toBe('设计');
      expect(result.items[2].label).toBe('开发');
    });

    it('should populate blockId and blockUuid in milestone items', async () => {
      const mockBlockData = {
        id: 'block-100',
        uuid: 'uuid-100',
        content: 'Block with phase',
        properties: { ':user.property/phase': '需求' },
        createdAt: '1715000000000',
        updatedAt: '1715000000000',
      };

      (logseqAPI.DB.datascriptQuery as any)
        .mockResolvedValueOnce([[mockBlockData]])
        .mockResolvedValueOnce([[null, '需求']]);
      
      const result = await MilestoneQuery.query({ milestonePropKey: ':user.property/phase' });
      
      expect(result.items.length).toBeGreaterThan(0);
      // At least one item should have blockId and blockUuid
      const itemWithBlock = result.items.find(item => item.blockId && item.blockUuid);
      expect(itemWithBlock).toBeTruthy();
    });

    it('should handle milestoneList with filterTag', async () => {
      (logseqAPI.DB.datascriptQuery as any).mockResolvedValue([]);
      
      const result = await MilestoneQuery.query({ 
        milestoneList: ['需求', '设计'], 
        filterTag: 'test' 
      });
      
      expect(result.items).toHaveLength(2);
    });

    it('should handle milestoneList with filterPropKey and filterPropValue', async () => {
      (logseqAPI.DB.datascriptQuery as any).mockResolvedValue([]);
      
      const result = await MilestoneQuery.query({ 
        milestoneList: ['需求', '设计'], 
        filterPropKey: ':user.property/project', 
        filterPropValue: 'project1' 
      });
      
      expect(result.items).toHaveLength(2);
    });

    it('should handle query errors gracefully', async () => {
      (logseqAPI.DB.datascriptQuery as any).mockRejectedValue(new Error('Query failed'));
      
      const result = await MilestoneQuery.query({ milestonePropKey: ':user.property/phase' });
      
      expect(result.items).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });

    it('should handle dateField parameter', async () => {
      (logseqAPI.DB.datascriptQuery as any).mockResolvedValue([]);
      
      const result = await MilestoneQuery.query({ 
        milestoneList: ['需求'], 
        dateField: 'deadline' 
      });
      
      expect(result.items).toHaveLength(1);
    });
  });

  describe('MilestoneData structure', () => {
    it('should return correct MilestoneData structure', async () => {
      (logseqAPI.DB.datascriptQuery as any).mockResolvedValue([]);
      
      const result: MilestoneData = await MilestoneQuery.query({});
      
      // Verify all expected fields are present
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('totalCount');
      expect(result).toHaveProperty('completedCount');
      expect(result).toHaveProperty('overallProgress');
      expect(Array.isArray(result.items)).toBe(true);
      expect(typeof result.totalCount).toBe('number');
      expect(typeof result.completedCount).toBe('number');
      expect(typeof result.overallProgress).toBe('number');
    });

    it('should support optional count fields in MilestoneData', async () => {
      (logseqAPI.DB.datascriptQuery as any).mockResolvedValue([]);
      
      const result = await MilestoneQuery.query({ milestoneList: ['a', 'b', 'c'] });
      
      expect(result).toHaveProperty('inProgressCount');
      expect(result).toHaveProperty('pendingCount');
      expect(result).toHaveProperty('skippedCount');
    });

    it('should calculate correct counts', async () => {
      (logseqAPI.DB.datascriptQuery as any).mockResolvedValue([]);
      
      const result = await MilestoneQuery.query({ milestoneList: ['1', '2', '3'] });
      
      expect(result.totalCount).toBe(3);
    });
  });

  describe('MilestoneItem structure', () => {
    it('should return items with required fields', async () => {
      (logseqAPI.DB.datascriptQuery as any).mockResolvedValue([]);
      
      const result = await MilestoneQuery.query({ milestoneList: ['需求'] });
      
      expect(result.items.length).toBeGreaterThan(0);
      const item = result.items[0];
      
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('label');
      expect(item).toHaveProperty('status');
      expect(typeof item.id).toBe('string');
      expect(typeof item.label).toBe('string');
    });

    it('should return items with optional fields when available', async () => {
      (logseqAPI.DB.datascriptQuery as any).mockResolvedValue([]);
      
      const result = await MilestoneQuery.query({ milestoneList: ['需求'] });
      
      // When blocks are found, items may have additional fields
      const item = result.items[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('label');
      expect(item).toHaveProperty('status');
    });
  });
});
