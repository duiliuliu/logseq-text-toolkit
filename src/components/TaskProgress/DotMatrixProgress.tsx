/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 点阵进度组件
 */

import React from 'react'
import { StatusStat } from '../../lib/taskProgress/types'
import Tooltip from './Tooltip'
import { SupportedLanguage } from '../../translations/translations'

interface DotMatrixProgressProps {
  stats: StatusStat[]
  progress: number
  totalTasks: number
  completedTasks: number
  maxDots?: number
  size?: 'small' | 'medium' | 'large'
  lang?: SupportedLanguage
  animationClass?: string
  showLabel?: boolean
  labelFormat?: 'fraction' | 'percentage'
}

const DOT_SIZE_MAP = {
  small: 6,
  medium: 8,
  large: 10,
}

const DotMatrixProgress: React.FC<DotMatrixProgressProps> = ({
  stats,
  progress,
  totalTasks,
  completedTasks,
  maxDots = 10,
  size = 'small',
  lang = 'zh-CN',
  animationClass = '',
  showLabel = true,
  labelFormat = 'fraction',
}) => {
  const dotSize = DOT_SIZE_MAP[size]

  if (stats.length === 0 || totalTasks === 0) {
    return null
  }

  const dots: { color: string; status: string }[] = []
  
  stats.forEach(stat => {
    const count = Math.min(stat.count, maxDots - dots.length)
    for (let i = 0; i < count && dots.length < maxDots; i++) {
      dots.push({ color: stat.color || '#6b7280', status: stat.status })
    }
  })

  const hasMore = totalTasks > maxDots

  const renderLabel = () => {
    if (!showLabel) return null
    
    let label = ''
    switch (labelFormat) {
      case 'fraction':
        label = hasMore ? `+${totalTasks - maxDots}` : `${completedTasks}/${totalTasks}`
        break
      case 'percentage':
        label = `${progress}%`
        break
    }
    
    return (
      <span className="task-progress-label" style={{ fontSize: '10px' }}>
        {label}
      </span>
    )
  }

  return (
    <Tooltip 
      content={{ stats, totalTasks, progress }}
      lang={lang}
      animationClass={animationClass}
    >
      <div 
        className="task-progress-dot-matrix"
        style={{ cursor: 'pointer' }}
      >
        {dots.map((dot, index) => (
          <div
            key={index}
            className="task-progress-dot"
            style={{
              width: dotSize,
              height: dotSize,
              backgroundColor: dot.color,
            }}
          />
        ))}
        {renderLabel()}
      </div>
    </Tooltip>
  )
}

export default DotMatrixProgress