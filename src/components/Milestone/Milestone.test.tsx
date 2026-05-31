/**
 * Milestone UI 组件单元测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import CapsuleMilestone from './styles/CapsuleMilestone';
import BadgeMilestone from './styles/BadgeMilestone';
import TrackMilestone from './styles/TrackMilestone';
import CardMilestone from './styles/CardMilestone';
import CompactMilestone from './styles/CompactMilestone';
import type { MilestoneItem, ColorScheme } from '../../lib/milestone/types';

// Mock logseq API
vi.mock('../../logseq', () => ({
  logseqAPI: {
    Editor: {
      openInRightSidebar: vi.fn(),
    },
  },
}));

// Import mocked logseqAPI for testing
import { logseqAPI } from '../../logseq';

const defaultColorScheme: ColorScheme = {
  completed: '#10b981',
  inProgress: '#f59e0b',
  pending: '#d1d5db',
  failed: '#ef4444',
  skipped: '#9ca3af',
  background: '#ffffff',
  text: '#374151',
};

const mockItems: MilestoneItem[] = [
  { 
    id: '1', 
    label: '需求', 
    status: 'completed', 
    progress: 100, 
    date: '2026-05-01',
    blockId: 'block-1',
    blockUuid: 'uuid-1'
  },
  { 
    id: '2', 
    label: '设计', 
    status: 'in_progress', 
    progress: 60, 
    date: '2026-05-15',
    blockId: 'block-2',
    blockUuid: 'uuid-2'
  },
  { 
    id: '3', 
    label: '开发', 
    status: 'pending', 
    progress: 0, 
    date: '2026-05-20',
    blockId: 'block-3',
    blockUuid: 'uuid-3'
  },
];

const mockItemsWithoutBlockUuid: MilestoneItem[] = [
  { id: '1', label: '需求', status: 'completed', progress: 100, date: '2026-05-01' },
  { id: '2', label: '设计', status: 'in_progress', progress: 60, date: '2026-05-15' },
];

describe('Milestone UI Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

    it('should show tooltip content', () => {
      const { container } = render(
        <CapsuleMilestone items={mockItems} colorScheme={defaultColorScheme} />
      );
      
      // Tooltip should always be present in DOM (CSS controls visibility)
      expect(container.querySelector('.ltt-tooltip')).toBeTruthy();
      expect(container.textContent).toContain('需求');
    });

    it('should call openInRightSidebar on node click when blockUuid exists', () => {
      const { container } = render(
        <CapsuleMilestone items={mockItems} colorScheme={defaultColorScheme} />
      );
      
      const nodes = container.querySelectorAll('.ltt-milestone-node');
      fireEvent.click(nodes[0]);
      
      expect(logseqAPI.Editor.openInRightSidebar).toHaveBeenCalledWith('uuid-1');
    });

    it('should call custom onNodeClick callback when provided', () => {
      const onNodeClick = vi.fn();
      const { container } = render(
        <CapsuleMilestone 
          items={mockItems} 
          colorScheme={defaultColorScheme} 
          onNodeClick={onNodeClick} 
        />
      );
      
      const nodes = container.querySelectorAll('.ltt-milestone-node');
      fireEvent.click(nodes[1]);
      
      expect(onNodeClick).toHaveBeenCalledWith(mockItems[1]);
    });

    it('should not call openInRightSidebar when blockUuid does not exist', () => {
      const { container } = render(
        <CapsuleMilestone items={mockItemsWithoutBlockUuid} colorScheme={defaultColorScheme} />
      );
      
      const nodes = container.querySelectorAll('.ltt-milestone-node');
      fireEvent.click(nodes[0]);
      
      expect(logseqAPI.Editor.openInRightSidebar).not.toHaveBeenCalled();
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

    it('should show tooltip on hover', () => {
      const { container } = render(
        <BadgeMilestone items={mockItems} colorScheme={defaultColorScheme} />
      );
      
      const items = container.querySelectorAll('.ltt-milestone-badge-item');
      fireEvent.mouseEnter(items[1]);
      
      expect(container.querySelector('.ltt-milestone-tooltip-badge')).toBeTruthy();
      expect(container.textContent).toContain('设计');
    });

    it('should call openInRightSidebar on item click', () => {
      const { container } = render(
        <BadgeMilestone items={mockItems} colorScheme={defaultColorScheme} />
      );
      
      const items = container.querySelectorAll('.ltt-milestone-badge-item');
      fireEvent.click(items[0]);
      
      expect(logseqAPI.Editor.openInRightSidebar).toHaveBeenCalledWith('uuid-1');
    });

    it('should call custom onNodeClick callback', () => {
      const onNodeClick = vi.fn();
      const { container } = render(
        <BadgeMilestone 
          items={mockItems} 
          colorScheme={defaultColorScheme} 
          onNodeClick={onNodeClick} 
        />
      );
      
      const items = container.querySelectorAll('.ltt-milestone-badge-item');
      fireEvent.click(items[2]);
      
      expect(onNodeClick).toHaveBeenCalledWith(mockItems[2]);
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

    it('should show tooltip on dot hover', () => {
      const { container } = render(
        <TrackMilestone items={mockItems} colorScheme={defaultColorScheme} />
      );
      
      const dots = container.querySelectorAll('.ltt-milestone-dot');
      fireEvent.mouseEnter(dots[0]);
      
      expect(container.querySelector('.ltt-milestone-tooltip-track')).toBeTruthy();
      expect(container.textContent).toContain('需求');
    });

    it('should show tooltip on label item hover', () => {
      const { container } = render(
        <TrackMilestone items={mockItems} colorScheme={defaultColorScheme} showLabels={true} />
      );
      
      const labels = container.querySelectorAll('.ltt-milestone-label-item');
      fireEvent.mouseEnter(labels[1]);
      
      expect(container.querySelector('.ltt-milestone-tooltip-track')).toBeTruthy();
      expect(container.textContent).toContain('设计');
    });

    it('should call openInRightSidebar on dot click', () => {
      const { container } = render(
        <TrackMilestone items={mockItems} colorScheme={defaultColorScheme} />
      );
      
      const dots = container.querySelectorAll('.ltt-milestone-dot');
      fireEvent.click(dots[1]);
      
      expect(logseqAPI.Editor.openInRightSidebar).toHaveBeenCalledWith('uuid-2');
    });

    it('should call openInRightSidebar on label item click', () => {
      const { container } = render(
        <TrackMilestone items={mockItems} colorScheme={defaultColorScheme} showLabels={true} />
      );
      
      const labels = container.querySelectorAll('.ltt-milestone-label-item');
      fireEvent.click(labels[2]);
      
      expect(logseqAPI.Editor.openInRightSidebar).toHaveBeenCalledWith('uuid-3');
    });

    it('should call custom onNodeClick callback for both dot and label', () => {
      const onNodeClick = vi.fn();
      const { container } = render(
        <TrackMilestone 
          items={mockItems} 
          colorScheme={defaultColorScheme} 
          showLabels={true}
          onNodeClick={onNodeClick} 
        />
      );
      
      const dots = container.querySelectorAll('.ltt-milestone-dot');
      fireEvent.click(dots[0]);
      expect(onNodeClick).toHaveBeenCalledWith(mockItems[0]);
      
      onNodeClick.mockClear();
      
      const labels = container.querySelectorAll('.ltt-milestone-label-item');
      fireEvent.click(labels[1]);
      expect(onNodeClick).toHaveBeenCalledWith(mockItems[1]);
    });
  });

  describe('CardMilestone', () => {
    it('should render empty state', () => {
      const { container } = render(
        <CardMilestone items={[]} colorScheme={defaultColorScheme} />
      );
      expect(container.querySelector('.ltt-milestone-empty')).toBeTruthy();
    });

    it('should render items with horizontal layout', () => {
      const { container } = render(
        <CardMilestone items={mockItems} colorScheme={defaultColorScheme} />
      );
      expect(container.querySelector('.ltt-milestone-card-horizontal')).toBeTruthy();
      expect(container.querySelectorAll('.ltt-milestone-card-item-horizontal')).toHaveLength(3);
    });

    it('should show tooltip on hover', () => {
      const { container } = render(
        <CardMilestone items={mockItems} colorScheme={defaultColorScheme} />
      );
      
      const cards = container.querySelectorAll('.ltt-milestone-card-item-horizontal');
      fireEvent.mouseEnter(cards[0]);
      
      expect(container.querySelector('.ltt-milestone-tooltip-horizontal')).toBeTruthy();
      expect(container.textContent).toContain('需求');
    });

    it('should call openInRightSidebar on card click', () => {
      const { container } = render(
        <CardMilestone items={mockItems} colorScheme={defaultColorScheme} />
      );
      
      const cards = container.querySelectorAll('.ltt-milestone-card-item-horizontal');
      fireEvent.click(cards[2]);
      
      expect(logseqAPI.Editor.openInRightSidebar).toHaveBeenCalledWith('uuid-3');
    });

    it('should call custom onNodeClick callback', () => {
      const onNodeClick = vi.fn();
      const { container } = render(
        <CardMilestone 
          items={mockItems} 
          colorScheme={defaultColorScheme} 
          onNodeClick={onNodeClick} 
        />
      );
      
      const cards = container.querySelectorAll('.ltt-milestone-card-item-horizontal');
      fireEvent.click(cards[1]);
      
      expect(onNodeClick).toHaveBeenCalledWith(mockItems[1]);
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
      expect(container.querySelectorAll('.ltt-milestone-compact-item')).toHaveLength(3);
    });

    it('should render connectors between items', () => {
      const { container } = render(
        <CompactMilestone items={mockItems} colorScheme={defaultColorScheme} />
      );
      expect(container.querySelectorAll('.ltt-milestone-compact-connector')).toHaveLength(2);
    });

    it('should show tooltip content', () => {
      const { container } = render(
        <CompactMilestone items={mockItems} colorScheme={defaultColorScheme} />
      );
      
      // Tooltip should always be present in DOM (CSS controls visibility)
      expect(container.querySelector('.ltt-tooltip')).toBeTruthy();
      expect(container.textContent).toContain('需求');
    });

    it('should call openInRightSidebar on badge click', () => {
      const { container } = render(
        <CompactMilestone items={mockItems} colorScheme={defaultColorScheme} />
      );
      
      const badges = container.querySelectorAll('.ltt-milestone-compact-item');
      fireEvent.click(badges[1]);
      
      expect(logseqAPI.Editor.openInRightSidebar).toHaveBeenCalledWith('uuid-2');
    });

    it('should call custom onNodeClick callback', () => {
      const onNodeClick = vi.fn();
      const { container } = render(
        <CompactMilestone 
          items={mockItems} 
          colorScheme={defaultColorScheme} 
          onNodeClick={onNodeClick} 
        />
      );
      
      const badges = container.querySelectorAll('.ltt-milestone-compact-item');
      fireEvent.click(badges[2]);
      
      expect(onNodeClick).toHaveBeenCalledWith(mockItems[2]);
    });
  });

  describe('Status rendering tests', () => {
    const allStatusItems: MilestoneItem[] = [
      { id: '1', label: '已完成', status: 'completed', blockUuid: 'uuid-1' },
      { id: '2', label: '进行中', status: 'in_progress', blockUuid: 'uuid-2' },
      { id: '3', label: '待开始', status: 'pending', blockUuid: 'uuid-3' },
      { id: '4', label: '失败', status: 'failed', blockUuid: 'uuid-4' },
      { id: '5', label: '已跳过', status: 'skipped', blockUuid: 'uuid-5' },
    ];

    it('should render all status types in CapsuleMilestone', () => {
      const { container } = render(
        <CapsuleMilestone items={allStatusItems} colorScheme={defaultColorScheme} />
      );
      expect(container.querySelectorAll('.ltt-milestone-node')).toHaveLength(5);
    });

    it('should render all status types in BadgeMilestone', () => {
      const { container } = render(
        <BadgeMilestone items={allStatusItems} colorScheme={defaultColorScheme} />
      );
      expect(container.querySelectorAll('.ltt-milestone-badge-item')).toHaveLength(5);
    });

    it('should render all status types in TrackMilestone', () => {
      const { container } = render(
        <TrackMilestone items={allStatusItems} colorScheme={defaultColorScheme} />
      );
      expect(container.querySelectorAll('.ltt-milestone-dot')).toHaveLength(5);
    });

    it('should render all status types in CardMilestone', () => {
      const { container } = render(
        <CardMilestone items={allStatusItems} colorScheme={defaultColorScheme} />
      );
      expect(container.querySelectorAll('.ltt-milestone-card-item-horizontal')).toHaveLength(5);
    });

    it('should render all status types in CompactMilestone', () => {
      const { container } = render(
        <CompactMilestone items={allStatusItems} colorScheme={defaultColorScheme} />
      );
      expect(container.querySelectorAll('.ltt-milestone-compact-item')).toHaveLength(5);
    });
  });
});
