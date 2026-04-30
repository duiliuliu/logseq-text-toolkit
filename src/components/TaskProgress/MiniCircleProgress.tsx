/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 微型三色圆环进度组件
 */

import React from 'react'
import { StatusStat } from '../../lib/taskProgress/types'
import Tooltip from './Tooltip'
import { SupportedLanguage } from '../../translations/translations'

interface MiniCircleProgressProps {
  stats: StatusStat[]
  progress: number
  completedTasks: number
  totalTasks: number
  size?: 'small' | 'medium' | 'large'
  showLabel?: boolean
  labelFormat?: 'fraction' | 'percentage' | 'both'
  lang?: SupportedLanguage
  animationClass?: string
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
  lang = 'zh-CN',
  animationClass = '',
}) => {
  const svgSize = SIZE_MAP[size]
  const strokeWidth = STROKE_WIDTH_MAP[size]
  const radius = (svgSize - strokeWidth) / 2
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
    <Tooltip 
      content={{ stats, totalTasks, progress }}
      lang={lang}
      animationClass={animationClass}
    >
      <div 
        className="task-progress-mini-circle" 
        style={{ cursor: 'pointer' }}
      >
        <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
          {segments}
        </svg>
        {renderLabel()}
      </div>
    </Tooltip>
  )
}

export default MiniCircleProgress