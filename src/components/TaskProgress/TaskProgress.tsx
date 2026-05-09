/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 *
 * 任务进度主组件
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { TaskProgress as TaskProgressType, ProgressDisplayType, StatusStat } from './types'
import MiniCircleProgress from './MiniCircleProgress'
import DotMatrixProgress from './DotMatrixProgress'
import StatusCursorProgress from './StatusCursorProgress'
import ProgressCapsule from './ProgressCapsule'
import StepProgress from './StepProgress'
import Tooltip from './Tooltip'
import Fireworks from './Fireworks'
import { t } from '../../translations/i18n'
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
  forceShowFireworks?: boolean
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
  forceShowFireworks = false,
}) => {
  const [showFireworks, setShowFireworks] = useState(false)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const componentRef = useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout>()

  const isCompleted = progressData?.progress === 100
  const fireworksEnabled = config?.fireworksOnComplete ?? true
  const shouldShowFireworks = isCompleted || forceShowFireworks

  useEffect(() => {
    if (shouldShowFireworks && componentRef.current && fireworksEnabled) {
      setShowFireworks(true)
    }
  }, [shouldShowFireworks, fireworksEnabled])

  const handleMouseEnter = useCallback(() => {
    if (shouldShowFireworks && componentRef.current && fireworksEnabled) {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
      hoverTimeoutRef.current = setTimeout(() => {
        setTargetRect(componentRef.current?.getBoundingClientRect() || null)
        setShowFireworks(true)
      }, 300)
    }
  }, [shouldShowFireworks, fireworksEnabled])

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

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
        title={`${t('taskProgress.nestingLevel', lang)}: ${levelText}${leafText}`}
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
    <div 
      ref={componentRef}
      className="task-progress"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}
    >
      {renderNestingIndicator()}
      {renderComponent()}
      {showFireworks && fireworksEnabled && <Fireworks targetRect={targetRect} onComplete={() => setShowFireworks(false)} />}
    </div>
  )
}

export default TaskProgress
