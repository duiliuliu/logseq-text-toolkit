/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 点阵进度组件
 */

import React from 'react'
import { StatusStat } from '../../lib/taskProgress/types'

interface DotMatrixProgressProps {
  stats: StatusStat[]
  progress: number
  totalTasks: number
  maxDots?: number
  size?: 'small' | 'medium' | 'large'
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
  maxDots = 10,
  size = 'small',
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

  const remaining = maxDots - dots.length
  const hasMore = totalTasks > maxDots

  return (
    <div className="task-progress-dot-matrix">
      {dots.map((dot, index) => (
        <div
          key={index}
          className="task-progress-dot"
          style={{
            width: dotSize,
            height: dotSize,
            backgroundColor: dot.color,
          }}
          title={`${dot.status}: ${stats.find(s => s.status === dot.status)?.count || 0}`}
        />
      ))}
      {hasMore && (
        <span className="task-progress-label" style={{ fontSize: '10px' }}>
          +{totalTasks - maxDots}
        </span>
      )}
    </div>
  )
}

export default DotMatrixProgress
