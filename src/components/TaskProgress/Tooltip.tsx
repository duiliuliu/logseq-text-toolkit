/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 简约气泡提示组件
 */

import React, { useState, useRef, useEffect } from 'react'
import { getStatusName, t } from '../../translations/i18n'
import { StatusStat } from '../../lib/taskProgress/types'
import { SupportedLanguage } from '../../translations/translations'

interface TooltipContent {
  stats: StatusStat[]
  totalTasks: number
  progress: number
}

interface TooltipProps {
  children: React.ReactNode
  content: TooltipContent
  lang?: SupportedLanguage
  animationClass?: string
}

const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  lang = 'zh-CN',
  animationClass = '',
}) => {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState<'top' | 'bottom'>('bottom')
  const containerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (visible && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const spaceBelow = viewportHeight - rect.bottom
      setPosition(spaceBelow < 120 ? 'top' : 'bottom')
    }
  }, [visible])

  const handleMouseEnter = () => {
    setVisible(true)
  }

  const handleMouseLeave = () => {
    setVisible(false)
  }

  const renderContent = () => {
    const { stats, totalTasks, progress } = content

    return (
      <div className="task-progress-tooltip-content">
        <div className="tooltip-header">
          <span className="tooltip-progress-label">
            {t('settings.taskProgress.tooltip.progress', lang)}
          </span>
          <span className="tooltip-progress-value">{progress}%</span>
        </div>
        <div className="tooltip-stats">
          {stats.map(stat => (
            <div key={stat.status} className="tooltip-stat-row">
              <span 
                className="tooltip-stat-dot" 
                style={{ backgroundColor: stat.color || '#6b7280' }} 
              />
              <span className="tooltip-stat-name">
                {getStatusName(stat.status, lang)}
              </span>
              <span className="tooltip-stat-count">{stat.count}</span>
            </div>
          ))}
        </div>
        <div className="tooltip-footer">
          <span>{t('settings.taskProgress.tooltip.total', lang)}: {totalTasks}</span>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`task-progress-tooltip-wrapper ${animationClass}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {/* 移除 CSS hover 控制的 opacity，只使用 React state 控制显示 */}
      {visible && (
        <div 
          ref={tooltipRef}
          className={`task-progress-tooltip ${position}`}
          style={{
            opacity: 1,
            transform: 'translateX(-50%) translateY(0)'
          }}
        >
          {renderContent()}
        </div>
      )}
    </div>
  )
}

export default Tooltip
