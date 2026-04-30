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

  if (stats.length === 0 || totalTasks === 0) {
    return null
  }

  let currentOffset = 0
  const segments = stats.map((stat, index) => {
    const percentage = stat.count / totalTasks
    const segmentLength = circumference * percentage
    const offset = circumference - currentOffset
    
    currentOffset += segmentLength
    
    return (
      <circle
        key={stat.status}
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={stat.color || '#6b7280'}
        strokeWidth={strokeWidth}
        strokeDasharray={`${segmentLength} ${circumference}`}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.3s ease' }}
      />
    )
  })

  return (
    <div className="task-progress-mini-circle">
      <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
        {segments}
      </svg>
      {renderLabel()}
    </div>
  )
}

export default MiniCircleProgress
