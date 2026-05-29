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
import { DEFAULT_COLOR_SCHEME } from '../../lib/milestone/types';
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
    showLabels: config.showLabels,
    showProgress: config.showProgress,
  };

  const renderStyle = () => {
    switch (config.style) {
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
      default:
        return <CapsuleMilestone {...commonProps} />;
    }
  };

  return (
    <div 
      className="ltt-milestone-container" 
      data-style={config.style}
      style={{ 
        backgroundColor: colorScheme.background,
        color: colorScheme.text,
      }}
    >
      {renderStyle()}
    </div>
  );
};

export default Milestone;
