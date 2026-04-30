/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 进度胶囊组件
 */

import React from 'react'
import { StatusStat } from '../../lib/taskProgress/types'
import Tooltip from './Tooltip'
import { SupportedLanguage } from '../../translations/translations'

interface ProgressCapsuleProps {
  stats: StatusStat[]
  progress: number
  completedTasks: number
  totalTasks: number
  lang?: SupportedLanguage
  animationClass?: string
  showLabel?: boolean
  labelFormat?: 'fraction' | 'percentage'
}

const ProgressCapsule: React.FC<ProgressCapsuleProps> = ({
  stats,
  progress,
  completedTasks,
  totalTasks,
  lang = 'zh-CN',
  animationClass = '',
  showLabel = true,
  labelFormat = 'fraction',
}) => {
  if (stats.length === 0 || totalTasks === 0) {
    return null
  }

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
    }
    
    return (
      <span className="task-progress-label">
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
        className="task-progress-capsule"
        style={{ cursor: 'pointer' }}
      >
        <div className="task-progress-capsule-bar" style={{ width: '60px' }}>
          {stats.map((stat) => {
            const width = (stat.count / totalTasks) * 100
            return (
              <div
                key={stat.status}
                className="task-progress-capsule-segment"
                style={{
                  width: `${width}%`,
                  backgroundColor: stat.color || '#6b7280',
                }}
              />
            )
          })}
        </div>
        {renderLabel()}
      </div>
    </Tooltip>
  )
}

export default ProgressCapsule