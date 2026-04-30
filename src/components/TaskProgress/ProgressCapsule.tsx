/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 进度胶囊组件
 */

import React from 'react'
import { StatusStat } from '../../lib/taskProgress/types'

interface ProgressCapsuleProps {
  stats: StatusStat[]
  progress: number
  completedTasks: number
  totalTasks: number
}

const ProgressCapsule: React.FC<ProgressCapsuleProps> = ({
  stats,
  progress,
  completedTasks,
  totalTasks,
}) => {
  if (stats.length === 0 || totalTasks === 0) {
    return null
  }

  return (
    <div className="task-progress-capsule">
      <div className="task-progress-capsule-bar" style={{ width: '60px' }}>
        {stats.map((stat, index) => {
          const width = (stat.count / totalTasks) * 100
          return (
            <div
              key={stat.status}
              className="task-progress-capsule-segment"
              style={{
                width: `${width}%`,
                backgroundColor: stat.color || '#6b7280',
              }}
              title={`${stat.status}: ${stat.count}`}
            />
          )
        })}
      </div>
      <span className="task-progress-label">
        {completedTasks}/{totalTasks}
      </span>
    </div>
  )
}

export default ProgressCapsule
