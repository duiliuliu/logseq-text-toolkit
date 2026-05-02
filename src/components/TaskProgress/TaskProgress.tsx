/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 任务进度主组件
 */

import React from 'react'
import { TaskProgress as TaskProgressType, ProgressDisplayType, StatusStat } from '../../lib/taskProgress/types'
import MiniCircleProgress from './MiniCircleProgress'
import DotMatrixProgress from './DotMatrixProgress'
import StatusCursorProgress from './StatusCursorProgress'
import ProgressCapsule from './ProgressCapsule'
import StepProgress from './StepProgress'
import { SupportedLanguage } from '../../translations/translations'

interface TaskProgressProps {
  progressData: TaskProgressType | null
  displayType: ProgressDisplayType
  config?: Record<string, any>
  lang?: SupportedLanguage
  animationClass?: string
  nestingLevel?: number | 'all'
  onlyLeaves?: boolean
  showNestingIndicator?: boolean
}

const TaskProgress: React.FC<TaskProgressProps> = ({ 
  progressData, 
  displayType,
  config,
  lang = 'zh-CN',
  animationClass = '',
  nestingLevel,
  onlyLeaves,
  showNestingIndicator,
}) => {
  if (!progressData) {
    return null
  }

  const renderNestingIndicator = () => {
    if (!showNestingIndicator) return null
    
    const levelMap: Record<number | string, string> = {
      1: '1',
      2: '1-2',
      3: '1-3',
      'all': '1-N'
    }
    
    const levelText = levelMap[nestingLevel as number | string] || '1'
    const leafText = onlyLeaves ? ' ◈' : ''
    
    return (
      <span 
        className="nesting-indicator"
        title={`${lang === 'zh-CN' ? '嵌套层级' : lang === 'ja' ? 'ネストレベル' : 'Nesting Level'}: ${levelText}${leafText}`}
      >
        {levelText}{leafText}
      </span>
    )
  }

  const renderComponent = () => {
    const commonProps = {
      stats: progressData.statusStats,
      progress: progressData.progress,
      lang,
      animationClass,
      showLabel: config?.showLabel ?? true,
    }
    
    switch (displayType) {
      case 'mini-circle':
        return (
          <MiniCircleProgress
            {...commonProps}
            completedTasks={progressData.completedTasks}
            totalTasks={progressData.totalTasks}
            {...config}
          />
        )
      case 'dot-matrix':
        return (
          <DotMatrixProgress
            {...commonProps}
            totalTasks={progressData.totalTasks}
            completedTasks={progressData.completedTasks}
            {...config}
          />
        )
      case 'status-cursor':
        return <StatusCursorProgress {...commonProps} {...config} />
      case 'progress-capsule':
        return (
          <ProgressCapsule
            {...commonProps}
            completedTasks={progressData.completedTasks}
            totalTasks={progressData.totalTasks}
            {...config}
          />
        )
      case 'step-progress':
        return (
          <StepProgress
            {...commonProps}
            totalTasks={progressData.totalTasks}
            completedTasks={progressData.completedTasks}
            {...config}
          />
        )
      default:
        return null
    }
  }
  
  return (
    <div className="task-progress">
      {renderNestingIndicator()}
      {renderComponent()}
    </div>
  )
}

export default TaskProgress
