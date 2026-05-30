/**
 * Milestone 类型定义单元测试
 */

import { describe, it, expect } from 'vitest';
import {
  MilestoneStatus,
  MilestoneDisplayStyle,
  DEFAULT_COLOR_SCHEME,
  STYLE_LABELS,
  type MilestoneItem,
  type MilestoneData,
  type MilestoneConfig,
} from './types';

describe('Milestone Types', () => {
  describe('MilestoneStatus', () => {
    it('should support all status values', () => {
      const statuses: MilestoneStatus[] = ['completed', 'in_progress', 'pending', 'failed'];
      expect(statuses).toHaveLength(4);
      expect(statuses).toContain('completed');
      expect(statuses).toContain('in_progress');
      expect(statuses).toContain('pending');
      expect(statuses).toContain('failed');
    });
  });

  describe('MilestoneDisplayStyle', () => {
    it('should support all style values', () => {
      const styles: MilestoneDisplayStyle[] = ['capsule', 'badge', 'track', 'card', 'compact'];
      expect(styles).toHaveLength(5);
      expect(styles).toContain('capsule');
      expect(styles).toContain('badge');
      expect(styles).toContain('track');
      expect(styles).toContain('card');
      expect(styles).toContain('compact');
    });
  });

  describe('MilestoneItem', () => {
    it('should create valid milestone item', () => {
      const item: MilestoneItem = {
        id: 'test-id',
        label: 'Test Label',
        status: 'completed',
        progress: 100,
        date: '2026-05-15',
      };
      
      expect(item.id).toBe('test-id');
      expect(item.label).toBe('Test Label');
      expect(item.status).toBe('completed');
      expect(item.progress).toBe(100);
      expect(item.date).toBe('2026-05-15');
    });

    it('should allow optional fields to be undefined', () => {
      const item: MilestoneItem = {
        id: 'test-id',
        label: 'Test Label',
        status: 'pending',
      };
      
      expect(item.progress).toBeUndefined();
      expect(item.date).toBeUndefined();
      expect(item.color).toBeUndefined();
    });
  });

  describe('MilestoneData', () => {
    it('should create valid milestone data', () => {
      const data: MilestoneData = {
        items: [],
        totalCount: 0,
        completedCount: 0,
        overallProgress: 0,
      };
      
      expect(data.items).toHaveLength(0);
      expect(data.totalCount).toBe(0);
      expect(data.completedCount).toBe(0);
      expect(data.inProgressCount).toBeUndefined();
      expect(data.pendingCount).toBeUndefined();
    });

    it('should support optional count fields', () => {
      const data: MilestoneData = {
        items: [],
        totalCount: 5,
        completedCount: 2,
        inProgressCount: 1,
        pendingCount: 2,
        overallProgress: 60,
      };
      
      expect(data.inProgressCount).toBe(1);
      expect(data.pendingCount).toBe(2);
      expect(data.overallProgress).toBe(60);
    });
  });

  describe('MilestoneConfig', () => {
    it('should create valid config with required fields', () => {
      const config: MilestoneConfig = {
        style: 'capsule',
      };
      
      expect(config.style).toBe('capsule');
      expect(config.tag).toBeUndefined();
      expect(config.property).toBeUndefined();
      expect(config.list).toBeUndefined();
    });

    it('should support all config options', () => {
      const config: MilestoneConfig = {
        tag: 'interview',
        property: 'company',
        propertyK: ':user.property/ae_Y5gsx',
        propertyV: '安克',
        list: ['需求', '设计', '开发'],
        style: 'badge',
        showProgress: true,
        showLabels: true,
        dateField: 'scheduled',
      };
      
      expect(config.tag).toBe('interview');
      expect(config.property).toBe('company');
      expect(config.propertyK).toBe(':user.property/ae_Y5gsx');
      expect(config.propertyV).toBe('安克');
      expect(config.list).toHaveLength(3);
      expect(config.style).toBe('badge');
      expect(config.showProgress).toBe(true);
      expect(config.dateField).toBe('scheduled');
    });
  });

  describe('DEFAULT_COLOR_SCHEME', () => {
    it('should have valid color values', () => {
      expect(DEFAULT_COLOR_SCHEME.completed).toBe('#10b981');
      expect(DEFAULT_COLOR_SCHEME.inProgress).toBe('#f59e0b');
      expect(DEFAULT_COLOR_SCHEME.pending).toBe('#d1d5db');
      expect(DEFAULT_COLOR_SCHEME.failed).toBe('#ef4444');
      expect(DEFAULT_COLOR_SCHEME.background).toBe('#ffffff');
      expect(DEFAULT_COLOR_SCHEME.text).toBe('#374151');
    });
  });

  describe('STYLE_LABELS', () => {
    it('should have labels for all styles', () => {
      expect(STYLE_LABELS.capsule).toEqual({ zh: '胶囊进度条', en: 'Capsule Progress' });
      expect(STYLE_LABELS.badge).toEqual({ zh: '数字徽标', en: 'Number Badge' });
      expect(STYLE_LABELS.track).toEqual({ zh: '极简轨道', en: 'Minimal Track' });
      expect(STYLE_LABELS.card).toEqual({ zh: '卡片浮层', en: 'Card Overlay' });
      expect(STYLE_LABELS.compact).toEqual({ zh: '状态徽章', en: 'Compact Badge' });
    });
  });
});
