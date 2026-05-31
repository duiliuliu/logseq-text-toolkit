/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 通用气泡提示组件 - 参考 TaskProgress 的纯 CSS hover 实现
 * 注意：在 Logseq 中使用静态 HTML 渲染，所以必须使用纯 CSS 实现 hover 效果
 */

import React from 'react'

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  theme?: 'light' | 'dark'
  small?: boolean  // 更小、更扁平的样式
  animationClass?: string
}

const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'bottom',
  theme = 'light',
  small = true,
  animationClass = '',
}) => {
  const positionClasses = {
    top: 'ltt-tooltip-top',
    bottom: 'ltt-tooltip-bottom',
    left: 'ltt-tooltip-left',
    right: 'ltt-tooltip-right',
  }

  const sizeClass = small ? 'ltt-tooltip-small' : ''
  const themeClass = `ltt-tooltip-${theme}`

  return (
    <div className={`ltt-tooltip-wrapper ${animationClass}`}>
      {children}
      {/* 始终渲染 tooltip，使用 CSS :hover 控制显示 */}
      <div className={`ltt-tooltip ${positionClasses[position]} ${themeClass} ${sizeClass}`}>
        <div className="ltt-tooltip-content">
          {content}
        </div>
      </div>
    </div>
  )
}

export default Tooltip
