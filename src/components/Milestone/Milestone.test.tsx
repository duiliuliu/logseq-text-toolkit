/**
 * Milestone UI 组件单元测试
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import CapsuleMilestone from './styles/CapsuleMilestone';
import BadgeMilestone from './styles/BadgeMilestone';
import TrackMilestone from './styles/TrackMilestone';
import CardMilestone from './styles/CardMilestone';
import CompactMilestone from './styles/CompactMilestone';
import type { MilestoneItem, ColorScheme } from '../../lib/milestone/types';

const defaultColorScheme: ColorScheme = {
  completed: '#10b981',
  inProgress: '#f59e0b',
  pending: '#d1d5db',
  failed: '#ef4444',
  background: '#ffffff',
  text: '#374151',
};

const mockItems: MilestoneItem[] = [
  { id: '1', label: '需求', status: 'completed', progress: 100, date: '2026-05-01' },
  { id: '2', label: '设计', status: 'in_progress', progress: 60, date: '2026-05-15' },
  { id: '3', label: '开发', status: 'pending', progress: 0, date: '2026-05-20' },
];

describe('Milestone UI Components', () => {
  describe('CapsuleMilestone', () => {
    it('should render empty state', () => {
      const { container } = render(
        <CapsuleMilestone items={[]} colorScheme={defaultColorScheme} />
      );
      expect(container.querySelector('.ltt-milestone-empty')).toBeTruthy();
    });

    it('should render items', () => {
      const { container } = render(
        <CapsuleMilestone items={mockItems} colorScheme={defaultColorScheme} />
      );
      expect(container.querySelector('.ltt-milestone-capsule')).toBeTruthy();
      expect(container.querySelectorAll('.ltt-milestone-node')).toHaveLength(3);
    });

    it('should render labels when showLabels is true', () => {
      const { container } = render(
        <CapsuleMilestone 
          items={mockItems} 
          colorScheme={defaultColorScheme}
          showLabels={true}
        />
      );
      expect(container.querySelectorAll('.ltt-milestone-label')).toHaveLength(3);
    });

    it('should hide labels when showLabels is false', () => {
      const { container } = render(
        <CapsuleMilestone 
          items={mockItems} 
          colorScheme={defaultColorScheme}
          showLabels={false}
        />
      );
      expect(container.querySelectorAll('.ltt-milestone-label')).toHaveLength(0);
    });
  });

  describe('BadgeMilestone', () => {
    it('should render empty state', () => {
      const { container } = render(
        <BadgeMilestone items={[]} colorScheme={defaultColorScheme} />
      );
      expect(container.querySelector('.ltt-milestone-empty')).toBeTruthy();
    });

    it('should render items with numbers', () => {
      const { container } = render(
        <BadgeMilestone items={mockItems} colorScheme={defaultColorScheme} />
      );
      expect(container.querySelector('.ltt-milestone-badge')).toBeTruthy();
      expect(container.querySelectorAll('.ltt-milestone-badge-item')).toHaveLength(3);
    });

    it('should render overall progress bar', () => {
      const { container } = render(
        <BadgeMilestone 
          items={mockItems} 
          colorScheme={defaultColorScheme}
          showProgress={true}
          overallProgress={60}
        />
      );
      expect(container.querySelector('.ltt-milestone-overall-progress')).toBeTruthy();
    });
  });

  describe('TrackMilestone', () => {
    it('should render empty state', () => {
      const { container } = render(
        <TrackMilestone items={[]} colorScheme={defaultColorScheme} />
      );
      expect(container.querySelector('.ltt-milestone-empty')).toBeTruthy();
    });

    it('should render items', () => {
      const { container } = render(
        <TrackMilestone items={mockItems} colorScheme={defaultColorScheme} />
      );
      expect(container.querySelector('.ltt-milestone-track-minimal')).toBeTruthy();
      expect(container.querySelectorAll('.ltt-milestone-dot')).toHaveLength(3);
    });

    it('should render labels', () => {
      const { container } = render(
        <TrackMilestone items={mockItems} colorScheme={defaultColorScheme} showLabels={true} />
      );
      expect(container.querySelectorAll('.ltt-milestone-label-item')).toHaveLength(3);
    });
  });

  describe('CardMilestone', () => {
    it('should render empty state', () => {
      const { container } = render(
        <CardMilestone items={[]} colorScheme={defaultColorScheme} />
      );
      expect(container.querySelector('.ltt-milestone-empty')).toBeTruthy();
    });

    it('should render items with alternating positions', () => {
      const { container } = render(
        <CardMilestone items={mockItems} colorScheme={defaultColorScheme} />
      );
      expect(container.querySelector('.ltt-milestone-card')).toBeTruthy();
      expect(container.querySelectorAll('.ltt-milestone-card-item')).toHaveLength(3);
      expect(container.querySelector('.ltt-milestone-card-item.top')).toBeTruthy();
      expect(container.querySelector('.ltt-milestone-card-item.bottom')).toBeTruthy();
    });
  });

  describe('CompactMilestone', () => {
    it('should render empty state', () => {
      const { container } = render(
        <CompactMilestone items={[]} colorScheme={defaultColorScheme} />
      );
      expect(container.querySelector('.ltt-milestone-empty')).toBeTruthy();
    });

    it('should render items', () => {
      const { container } = render(
        <CompactMilestone items={mockItems} colorScheme={defaultColorScheme} />
      );
      expect(container.querySelector('.ltt-milestone-compact')).toBeTruthy();
      expect(container.querySelectorAll('.ltt-milestone-badge')).toHaveLength(3);
    });

    it('should render connectors between items', () => {
      const { container } = render(
        <CompactMilestone items={mockItems} colorScheme={defaultColorScheme} />
      );
      expect(container.querySelectorAll('.ltt-milestone-connector')).toHaveLength(2);
    });
  });
});
