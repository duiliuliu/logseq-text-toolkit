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

const STATUS_ICONS: Record<string, string> = {
  'todo': '●',
  'doing': '○',
  'in-review': '⊛',
  'done': '✓',
  'waiting': '◐',
  'canceled': '✗',
}

const STATUS_ORDER = ['done', 'doing', 'in-review', 'todo', 'waiting', 'canceled']

const StatusCursorProgress: React.FC<StatusCursorProgressProps> = ({
  stats,
  progress,
}) => {
  if (stats.length === 0) {
    return null
  }

  const tooltip = stats
    .map(s => `${s.status}: ${s.count}`)
    .join(' | ')

  const sortedStats = [...stats].sort((a, b) => {
    const indexA = STATUS_ORDER.indexOf(a.status)
    const indexB = STATUS_ORDER.indexOf(b.status)
    if (indexA === -1 && indexB === -1) return a.status.localeCompare(b.status)
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })

  return (
    <span 
      className="task-progress-cursor"
      title={tooltip}
      style={{ cursor: 'pointer' }}
    >
      {sortedStats.map(stat => {
        const icon = STATUS_ICONS[stat.status] || '●'
        return (
          <span 
            key={stat.status}
            style={{ color: stat.color || '#6b7280', marginRight: '2px' }}
          >
            {icon}{stat.count}
          </span>
        )
      })}
    </span>
  )
}

export default StatusCursorProgress