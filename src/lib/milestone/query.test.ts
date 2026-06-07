/**
 * Milestone Query 单元测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MilestoneQuery } from './query';
import type { MilestoneItem, BlockWithProperty, MilestoneData, MilestoneStatus } from './types';

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

// Helper to create mock blocks with scheduled dates
const createMockBlock = (id: string, phase: string, daysAgo: number): BlockWithProperty => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const timestamp = date.getTime();
  
  return {
    id,
    uuid: `uuid-${id}`,
    content: `Block ${id} - ${phase}`,
    properties: { ':user.property/phase': phase },
    createdAt: timestamp.toString(),
    updatedAt: timestamp.toString(),
    scheduled: timestamp,
  } as any;
};

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

  describe('Skipped status logic', () => {
    it('should mark previous stages as skipped when later stage is completed', async () => {
      const completedBlock = createMockBlock('1', '二面', 2);
      const inProgressBlock = createMockBlock('2', '笔试', 0);
      
      (logseqAPI.DB.datascriptQuery as any)
        .mockResolvedValueOnce([[completedBlock], [inProgressBlock]])
        .mockResolvedValueOnce([[null, '笔试'], [null, '一面'], [null, '二面']]);
      
      const result = await MilestoneQuery.query({ 
        milestonePropKey: ':user.property/phase',
        milestoneList: ['笔试', '一面', '二面']
      });
      
      expect(result.items.length).toBe(3);
      
      const skippedItem = result.items.find(item => item.label === '一面');
      expect(skippedItem).toBeDefined();
      expect(skippedItem!.status).toBe('skipped');
    });

    it('should mark previous stages as skipped when later stage is in_progress', async () => {
      const inProgressBlock = createMockBlock('1', '笔试', 0);
      
      (logseqAPI.DB.datascriptQuery as any)
        .mockResolvedValueOnce([[inProgressBlock]])
        .mockResolvedValueOnce([[null, '笔试'], [null, '一面'], [null, '二面']]);
      
      const result = await MilestoneQuery.query({ 
        milestonePropKey: ':user.property/phase',
        milestoneList: ['一面', '二面', '笔试']
      });
      
      expect(result.items.length).toBe(3);
      
      const skippedItem1 = result.items.find(item => item.label === '一面');
      expect(skippedItem1).toBeDefined();
      expect(skippedItem1!.status).toBe('skipped');
      
      const skippedItem2 = result.items.find(item => item.label === '二面');
      expect(skippedItem2).toBeDefined();
      expect(skippedItem2!.status).toBe('skipped');
    });
  });

  describe('Milestone sorting', () => {
    it('should sort items with same status by date ascending', async () => {
      const olderBlock = createMockBlock('1', '笔试', 5);
      const newerBlock = createMockBlock('2', '二面', 2);
      
      (logseqAPI.DB.datascriptQuery as any)
        .mockResolvedValueOnce([[olderBlock], [newerBlock]])
        .mockResolvedValueOnce([[null, '笔试'], [null, '一面'], [null, '二面']]);
      
      const result = await MilestoneQuery.query({ 
        milestonePropKey: ':user.property/phase',
        milestoneList: ['笔试', '一面', '二面']
      });
      
      const completedItems = result.items.filter(item => item.status === 'completed');
      const dates = completedItems.map(item => item.date).filter((d): d is string => d !== null);
      
      expect(dates.length).toBeGreaterThan(0);
    });
  });

  describe('Milestone sortMilestoneItems (直接测试排序逻辑', () => {
    const createTestItem = (label: string, status: MilestoneStatus, date: string | null = null): MilestoneItem => ({
      id: `milestone-${label}`,
      label,
      status,
      date,
      progress: 0,
    });

    it('用户原始例子 - 两个完成状态，中间夹着其他', () => {
      const items: MilestoneItem[] = [
        createTestItem('简历投递', 'pending'),
        createTestItem('测评环节', 'pending'),
        createTestItem('笔试环节', 'completed', '2026-06-07'),
        createTestItem('第一轮技术面试', 'pending'),
        createTestItem('第二轮技术面试', 'completed', '2026-06-06'),
        createTestItem('第三轮技术面试', 'pending'),
        createTestItem('HR面试', 'pending'),
        createTestItem('OFFER发放', 'pending'),
      ];

      const result = MilestoneQuery.sortMilestoneItemsPublic(items);
      
      const labels = result.map(item => item.label);
      // 期望结果：其他状态保持原始位置范围，完成状态按日期排序后放在范围末尾
      expect(labels).toEqual([
        '简历投递',
        '测评环节',
        '第一轮技术面试',
        '第二轮技术面试',
        '笔试环节',
        '第三轮技术面试',
        'HR面试',
        'OFFER发放',
      ]);
    });

    it('只有一个完成状态 - 保持原样', () => {
      const items: MilestoneItem[] = [
        createTestItem('简历投递', 'pending'),
        createTestItem('测评环节', 'pending'),
        createTestItem('笔试环节', 'completed', '2026-06-07'),
        createTestItem('第一轮技术面试', 'pending'),
        createTestItem('第二轮技术面试', 'pending'),
      ];

      const result = MilestoneQuery.sortMilestoneItemsPublic(items);
      
      const labels = result.map(item => item.label);
      expect(labels).toEqual(['简历投递', '测评环节', '笔试环节', '第一轮技术面试', '第二轮技术面试']);
    });

    it('用户第二个例子 - 日期已经是正确顺序 - 保持原样', () => {
      const items: MilestoneItem[] = [
        createTestItem('简历投递', 'pending'),
        createTestItem('测评环节', 'pending'),
        createTestItem('笔试环节', 'completed', '2026-06-05'),
        createTestItem('第一轮技术面试', 'pending'),
        createTestItem('第二轮技术面试', 'completed', '2026-06-07'),
      ];

      const result = MilestoneQuery.sortMilestoneItemsPublic(items);
      
      const labels = result.map(item => item.label);
      expect(labels).toEqual(['简历投递', '测评环节', '笔试环节', '第一轮技术面试', '第二轮技术面试']);
    });

    it('三个完成状态连续在一起 - 按日期排序', () => {
      const items: MilestoneItem[] = [
        createTestItem('简历投递', 'pending'),
        createTestItem('测评环节', 'completed', '2026-06-05'),
        createTestItem('笔试环节', 'completed', '2026-06-07'),
        createTestItem('第一轮技术面试', 'completed', '2026-06-06'),
        createTestItem('HR面试', 'pending'),
      ];

      const result = MilestoneQuery.sortMilestoneItemsPublic(items);
      
      const labels = result.map(item => item.label);
      // 三个完成状态在原范围（索引1-3）内按日期排序
      expect(labels).toEqual(['简历投递', '测评环节', '第一轮技术面试', '笔试环节', 'HR面试']);
    });

    it('空数组 - 返回空', () => {
      const result = MilestoneQuery.sortMilestoneItemsPublic([]);
      expect(result).toEqual([]);
    });

    it('单个元素 - 保持原样', () => {
      const items: MilestoneItem[] = [createTestItem('简历投递', 'pending')];
      const result = MilestoneQuery.sortMilestoneItemsPublic(items);
      expect(result.length).toBe(1);
      expect(result[0].label).toEqual('简历投递');
    });

    it('多个混合状态 - 正确处理', () => {
      const items: MilestoneItem[] = [
        createTestItem('1', 'skipped'),
        createTestItem('2', 'completed', '2026-06-08'),
        createTestItem('3', 'in_progress'),
        createTestItem('4', 'completed', '2026-06-06'),
        createTestItem('5', 'pending'),
        createTestItem('6', 'completed', '2026-06-07'),
        createTestItem('7', 'failed'),
      ];

      const result = MilestoneQuery.sortMilestoneItemsPublic(items);
      
      const labels = result.map(item => item.label);
      expect(labels).toEqual(['1', '3', '5', '4', '6', '2', '7']);
    });
  });
});
