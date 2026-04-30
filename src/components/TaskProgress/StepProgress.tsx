/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 阶梯进度组件
 */

import React from 'react'
import { StatusStat } from '../../lib/taskProgress/types'

interface StepProgressProps {
  stats: StatusStat[]
  progress: number
}

const StepProgress: React.FC<StepProgressProps> = ({
  stats,
  progress,
}) => {
  if (stats.length === 0) {
    return null
  }

  const totalTasks = stats.reduce((sum, s) => sum + s.count, 0)
  const maxHeight = 16

  return (
    <div className="task-progress-step">
      {stats.map((stat, index) => {
        const height = Math.max(4, (stat.count / totalTasks) * maxHeight)
        const width = 8 + (index * 2)
        
        return (
          <div
            key={stat.status}
            className="task-progress-step-segment"
            style={{
              width: `${width}px`,
              height: `${height}px`,
              backgroundColor: stat.color || '#6b7280',
            }}
            title={`${stat.status}: ${stat.count}`}
          />
        )
      })}
    </div>
  )
}

export default StepProgress
