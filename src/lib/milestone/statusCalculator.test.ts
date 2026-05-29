/**
 * Milestone StatusCalculator 单元测试
 */

import { describe, it, expect } from 'vitest';
import { StatusCalculator } from './statusCalculator';
import type { BlockWithProperty } from './types';

describe('StatusCalculator', () => {
  describe('calculateFromBlocks', () => {
    it('should return pending for empty blocks', () => {
      const result = StatusCalculator.calculateFromBlocks([]);
      expect(result).toBe('pending');
    });

    it('should return completed when all blocks have past scheduled dates', () => {
      const now = new Date();
      const pastDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 10).getTime();
      
      const blocks: BlockWithProperty[] = [
        {
          id: '1',
          uuid: 'uuid-1',
          content: 'Test block',
          properties: {},
          createdAt: pastDate.toString(),
          updatedAt: pastDate.toString(),
        } as any,
      ];
      blocks[0]['scheduled'] = pastDate;
      
      const result = StatusCalculator.calculateFromBlocks(blocks);
      expect(result).toBe('completed');
    });

    it('should return in_progress when blocks have future scheduled dates', () => {
      const now = new Date();
      const futureDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10).getTime();
      
      const blocks: BlockWithProperty[] = [
        {
          id: '1',
          uuid: 'uuid-1',
          content: 'Test block',
          properties: {},
          createdAt: now.getTime().toString(),
          updatedAt: now.getTime().toString(),
        } as any,
      ];
      blocks[0]['scheduled'] = futureDate;
      
      const result = StatusCalculator.calculateFromBlocks(blocks);
      expect(result).toBe('in_progress');
    });

    it('should check status property when no scheduled date', () => {
      const blocks: BlockWithProperty[] = [
        {
          id: '1',
          uuid: 'uuid-1',
          content: 'Test block',
          properties: { ':logseq.property/status': 'done' },
          createdAt: '',
          updatedAt: '',
        },
      ];
      
      const result = StatusCalculator.calculateFromBlocks(blocks);
      expect(result).toBe('completed');
    });

    it('should return in_progress for doing status', () => {
      const blocks: BlockWithProperty[] = [
        {
          id: '1',
          uuid: 'uuid-1',
          content: 'Test block',
          properties: { status: 'doing' },
          createdAt: '',
          updatedAt: '',
        },
      ];
      
      const result = StatusCalculator.calculateFromBlocks(blocks);
      expect(result).toBe('in_progress');
    });
  });

  describe('calculateProgress', () => {
    it('should return 0 for empty blocks', () => {
      const result = StatusCalculator.calculateProgress([]);
      expect(result).toBe(0);
    });

    it('should return 100 for completed blocks (no scheduled)', () => {
      const blocks: BlockWithProperty[] = [
        {
          id: '1',
          uuid: 'uuid-1',
          content: 'Test block',
          properties: { ':logseq.property/status': 'done' },
          createdAt: '',
          updatedAt: '',
        },
      ];
      
      const result = StatusCalculator.calculateProgress(blocks);
      expect(result).toBe(100);
    });

    it('should calculate progress based on scheduled and created dates', () => {
      const now = new Date();
      const created = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5).getTime();
      const scheduled = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5).getTime();
      
      const blocks: BlockWithProperty[] = [
        {
          id: '1',
          uuid: 'uuid-1',
          content: 'Test block',
          properties: {},
          createdAt: created.toString(),
          updatedAt: created.toString(),
        } as any,
      ];
      blocks[0]['scheduled'] = scheduled;
      
      const result = StatusCalculator.calculateProgress(blocks);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(100);
    });
  });

  describe('getScheduledDate', () => {
    it('should return null for empty blocks', () => {
      const result = StatusCalculator.getScheduledDate([]);
      expect(result).toBeNull();
    });

    it('should return formatted date string', () => {
      const timestamp = new Date(2026, 4, 15).getTime();
      
      const blocks: BlockWithProperty[] = [
        {
          id: '1',
          uuid: 'uuid-1',
          content: 'Test block',
          properties: {},
          createdAt: timestamp.toString(),
          updatedAt: timestamp.toString(),
        } as any,
      ];
      blocks[0]['scheduled'] = timestamp;
      
      const result = StatusCalculator.getScheduledDate(blocks);
      expect(result).toBe('2026-05-15');
    });
  });

  describe('getCreatedDate', () => {
    it('should return null for empty blocks', () => {
      const result = StatusCalculator.getCreatedDate([]);
      expect(result).toBeNull();
    });

    it('should return formatted date string', () => {
      const timestamp = new Date(2026, 3, 10).getTime();
      
      const blocks: BlockWithProperty[] = [
        {
          id: '1',
          uuid: 'uuid-1',
          content: 'Test block',
          properties: {},
          createdAt: timestamp.toString(),
          updatedAt: timestamp.toString(),
        },
      ];
      
      const result = StatusCalculator.getCreatedDate(blocks);
      expect(result).toBe('2026-04-10');
    });
  });
});
