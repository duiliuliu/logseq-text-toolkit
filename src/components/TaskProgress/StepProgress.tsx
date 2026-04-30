/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 阶梯进度组件
 */

import React from 'react'
import { StatusStat } from '../../lib/taskProgress/types'
import Tooltip from './Tooltip'
import { SupportedLanguage } from '../../translations/translations'

interface StepProgressProps {
  stats: StatusStat[]
  progress: number
  lang?: SupportedLanguage
  animationClass?: string
}

const StepProgress: React.FC<StepProgressProps> = ({
  stats,
  progress,
  lang = 'zh-CN',
  animationClass = '',
}) => {
  if (stats.length === 0) {
    return null
  }

  const totalTasks = stats.reduce((sum, s) => sum + s.count, 0)
  const maxHeight = 16
  const segmentWidth = 8

  const maxCount = Math.max(...stats.map(s => s.count))

  return (
    <Tooltip 
      content={{ stats, totalTasks, progress }}
      lang={lang}
      animationClass={animationClass}
    >
      <div 
        className="task-progress-step"
        style={{ cursor: 'pointer' }}
      >
        {stats.map((stat) => {
          const height = maxCount > 0 ? Math.max(4, (stat.count / maxCount) * maxHeight) : 4
          
          return (
            <div
              key={stat.status}
              className="task-progress-step-segment"
              style={{
                width: `${segmentWidth}px`,
                height: `${height}px`,
                backgroundColor: stat.color || '#6b7280',
              }}
            />
          )
        })}
      </div>
    </Tooltip>
  )
}

export default StepProgress