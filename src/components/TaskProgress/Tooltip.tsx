/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 简约气泡提示组件
 * 注意：在 Logseq 中使用静态 HTML 渲染，所以必须使用纯 CSS 实现 hover 效果
 */

import React from 'react'
import { getStatusName, t } from '../../translations/i18n'
import { StatusStat } from '../../lib/taskProgress/types'
import { SupportedLanguage } from '../../translations/translations'

interface TooltipContent {
  stats: StatusStat[]
  totalTasks: number
  progress: number
  nestingLevel?: number | 'all'
  leafTasksOnly?: boolean
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
  const { stats, totalTasks, progress, nestingLevel, leafTasksOnly } = content

  return (
    <div className={`task-progress-tooltip-wrapper ${animationClass}`}>
      {children}
      {/* 始终渲染 tooltip，使用 CSS :hover 控制显示 */}
      <div className="task-progress-tooltip">
        <div className="task-progress-tooltip-content">
          <div className="tooltip-header">
            <span className="tooltip-progress-label">
              {t('settings.taskProgress.tooltip.progress', lang)}
            </span>
            <span className="tooltip-progress-value">{progress}%</span>
          </div>
          {nestingLevel !== undefined && nestingLevel !== 1 && (
            <div className="tooltip-nesting-info">
              <span className="tooltip-nesting-label">🔍</span>
              <span className="tooltip-nesting-text">
                {nestingLevel === 'all' ? '全部层级' : `${nestingLevel} 层`}
                {leafTasksOnly && '（仅叶子节点）'}
              </span>
            </div>
          )}
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
      </div>
    </div>
  )
}

export default Tooltip
