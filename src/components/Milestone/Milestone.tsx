/**
 * Milestone 主组件
 */

import React from 'react';
import type { MilestoneData, MilestoneConfig, ColorScheme } from '../../lib/milestone/types';
import CapsuleMilestone from './styles/CapsuleMilestone';
import BadgeMilestone from './styles/BadgeMilestone';
import TrackMilestone from './styles/TrackMilestone';
import CardMilestone from './styles/CardMilestone';
import CompactMilestone from './styles/CompactMilestone';
import ArrowCapsuleMilestone from './styles/ArrowCapsuleMilestone';
import TimelineTrackMilestone from './styles/TimelineTrackMilestone';
import { DEFAULT_COLOR_SCHEME } from '../../lib/milestone/types';
import { TooltipProvider } from '../ui/Tooltip';
import './milestone.css';

interface MilestoneProps {
  data: MilestoneData | null;
  config: MilestoneConfig;
}

const Milestone: React.FC<MilestoneProps> = ({ data, config }) => {
  const colorScheme: ColorScheme = config.colorScheme || DEFAULT_COLOR_SCHEME;

  const defaultData: MilestoneData = data || {
    items: [],
    totalCount: 0,
    completedCount: 0,
    overallProgress: 0,
  };

  const commonProps = {
    items: defaultData.items,
    colorScheme,
    showLabels: config.showLabel,
    showProgress: config.showProgress,
    tooltipStyle: config.tooltipStyle,
  };

  const renderStyle = () => {
    switch (config.displayStyle) {
      case 'capsule':
        return <CapsuleMilestone {...commonProps} />;
      case 'badge':
        return (
          <BadgeMilestone 
            {...commonProps} 
            overallProgress={defaultData.overallProgress}
          />
        );
      case 'track':
        return <TrackMilestone {...commonProps} />;
      case 'card':
        return <CardMilestone {...commonProps} />;
      case 'compact':
        return <CompactMilestone {...commonProps} />;
      case 'arrow-capsule':
        return <ArrowCapsuleMilestone {...commonProps} />;
      case 'timeline-track':
        return <TimelineTrackMilestone {...commonProps} />;
      default:
        return <CapsuleMilestone {...commonProps} />;
    }
  };

  const isInline = config.inline;

  return (
    <TooltipProvider>
      <div 
        className={`ltt-milestone-container ${isInline ? 'ltt-milestone-container-inline' : ''}`} 
        data-style={config.displayStyle}
        style={{ 
          backgroundColor: isInline ? 'transparent' : colorScheme.background,
          color: colorScheme.text,
        }}
      >
        {renderStyle()}
      </div>
    </TooltipProvider>
  );
};

export default Milestone;
