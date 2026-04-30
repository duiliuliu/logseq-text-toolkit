/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 微型三色圆环进度组件
 */

import React from 'react'
import { StatusStat } from '../../lib/taskProgress/types'

interface MiniCircleProgressProps {
  stats: StatusStat[]
  progress: number
  completedTasks: number
  totalTasks: number
  size?: 'small' | 'medium' | 'large'
  showLabel?: boolean
  labelFormat?: 'fraction' | 'percentage' | 'both'
}

const SIZE_MAP = {
  small: 16,
  medium: 24,
  large: 32,
}

const STROKE_WIDTH_MAP = {
  small: 2,
  medium: 3,
  large: 4,
}

const MiniCircleProgress: React.FC<MiniCircleProgressProps> = ({
  stats,
  progress,
  completedTasks,
  totalTasks,
  size = 'small',
  showLabel = true,
  labelFormat = 'fraction',
}) => {
  const svgSize = SIZE_MAP[size]
  const strokeWidth = STROKE_WIDTH_MAP[size]
  const radius = (svgSize - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = svgSize / 2

  const renderLabel = () => {
    if (!showLabel) return null
    
    let label = ''
    switch (labelFormat) {
      case 'fraction':
        label = `${completedTasks}/${totalTasks}`
        break
      case 'percentage':
        label = `${progress}%`
        break
      case 'both':
        label = `${completedTasks}/${totalTasks}`
        break
    }
    
    return (
      <span className="center-text" style={{ fontSize: size === 'small' ? '8px' : '10px' }}>
        {label}
      </span>
    )
  }

  const getTooltipContent = () => {
    return stats.map(stat => `${stat.status}: ${stat.count}`).join(' | ')
  }

  if (stats.length === 0 || totalTasks === 0) {
    return null
  }

  let currentAngle = -90

  const segments = stats.map((stat) => {
    const percentage = stat.count / totalTasks
    const angle = percentage * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    
    currentAngle = endAngle

    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180

    const x1 = center + radius * Math.cos(startRad)
    const y1 = center + radius * Math.sin(startRad)
    const x2 = center + radius * Math.cos(endRad)
    const y2 = center + radius * Math.sin(endRad)

    const largeArcFlag = angle > 180 ? 1 : 0

    return (
      <path
        key={stat.status}
        d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`}
        fill="none"
        stroke={stat.color || '#6b7280'}
        strokeWidth={strokeWidth}
        strokeLinecap="butt"
      />
    )
  })

  return (
    <div 
      className="task-progress-mini-circle" 
      title={getTooltipContent()}
      style={{ cursor: 'pointer' }}
    >
      <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
        {segments}
      </svg>
      {renderLabel()}
    </div>
  )
}

export default MiniCircleProgress