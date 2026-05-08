/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 状态光标进度组件
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { StatusStat } from '../../lib/taskProgress/types'
import Tooltip from './Tooltip'
import CelebrationEffect from './CelebrationEffect'
import { SupportedLanguage } from '../../translations/translations'

interface StatusCursorProgressProps {
  stats: StatusStat[]
  progress: number
  lang?: SupportedLanguage
  animationClass?: string
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
  lang = 'zh-CN',
  animationClass = '',
}) => {
  const [showCelebration, setShowCelebration] = useState(false)
  const hasCelebratedRef = useRef(false)
  const prevProgressRef = useRef(progress)

  const triggerCelebration = useCallback(() => {
    if (!hasCelebratedRef.current) {
      hasCelebratedRef.current = true
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 1500)
    }
  }, [])

  useEffect(() => {
    if (progress === 100 && prevProgressRef.current < 100 && !hasCelebratedRef.current) {
      triggerCelebration()
    }
    prevProgressRef.current = progress
  }, [progress, triggerCelebration])

  if (stats.length === 0) {
    return null
  }

  const sortedStats = [...stats].sort((a, b) => {
    const indexA = STATUS_ORDER.indexOf(a.status)
    const indexB = STATUS_ORDER.indexOf(b.status)
    if (indexA === -1 && indexB === -1) return a.status.localeCompare(b.status)
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })

  const totalTasks = stats.reduce((sum, s) => sum + s.count, 0)

  return (
    <Tooltip 
      content={{ stats, totalTasks, progress }}
      lang={lang}
      animationClass={animationClass}
    >
      <span 
        className="task-progress-cursor"
        style={{ cursor: 'pointer', position: 'relative', display: 'inline-block' }}
      >
        <CelebrationEffect
          trigger={showCelebration}
          size="small"
          duration={1500}
          particleCount={15}
        />
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
    </Tooltip>
  )
}

export default StatusCursorProgress
