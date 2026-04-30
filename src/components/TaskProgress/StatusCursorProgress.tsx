/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 状态光标进度组件
 */

import React from 'react'
import { StatusStat } from '../../lib/taskProgress/types'

interface StatusCursorProgressProps {
  stats: StatusStat[]
  progress: number
}

const StatusCursorProgress: React.FC<StatusCursorProgressProps> = ({
  stats,
  progress,
}) => {
  if (stats.length === 0) {
    return null
  }

  const todoStat = stats.find(s => s.status === 'todo')
  const doingStat = stats.find(s => s.status === 'doing')
  const doneStat = stats.find(s => s.status === 'done')

  const tooltip = stats
    .map(s => `${s.status}: ${s.count}`)
    .join(' | ')

  let mainColor = '#6b7280'
  if (progress === 100) {
    mainColor = doneStat?.color || '#10b981'
  } else if (doingStat && doingStat.count > 0) {
    mainColor = doingStat.color || '#3b82f6'
  } else if (todoStat && todoStat.count > 0) {
    mainColor = todoStat.color || '#f59e0b'
  }

  return (
    <span 
      className="task-progress-cursor"
      style={{ color: mainColor }}
      title={tooltip}
    >
      ✓{doneStat?.count || 0} ○{doingStat?.count || 0} ●{todoStat?.count || 0}
    </span>
  )
}

export default StatusCursorProgress
