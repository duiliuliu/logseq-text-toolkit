/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * Block 渲染器组件 - 支持 {{renderer ...}} 宏渲染
 */

import React, { useEffect, useRef, useState } from 'react'

interface BlockRendererProps {
  content: string
  properties?: Record<string, unknown>
  blockId?: string
  className?: string
}

const BlockRenderer: React.FC<BlockRendererProps> = ({
  content,
  properties = {},
  blockId,
  className = 'block-renderer'
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    if (containerRef.current && !rendered) {
      const hasMacroRenderer = content.includes('{{renderer')
      
      if (hasMacroRenderer && globalThis.logseqMacroRendererCallback) {
        const macroRegex = /\{\{renderer\s+([^}]+)\}\}/g
        const matches = [...content.matchAll(macroRegex)]
        
        matches.forEach(match => {
          const slotId = `logseq-macro-slot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          const macroArgs = match[1].split(' ')
          
          const payload = {
            uuid: blockId || `block-${Date.now()}`,
            arguments: macroArgs
          }
          
          const slotElement = document.createElement('div')
          slotElement.id = slotId
          slotElement.className = 'logseq-macro-slot'
          containerRef.current?.appendChild(slotElement)
          
          globalThis.logseqMacroRendererCallback({ payload, slot: slotId })
        })
      }
      
      setRendered(true)
    }
  }, [content, blockId, rendered])

  const displayContent = content.replace(/\{\{renderer\s+[^}]+\}\}/g, '')

  return (
    <div 
      ref={containerRef}
      className={`block-renderer ${className}`}
      data-block-id={blockId}
      data-properties={JSON.stringify(properties)}
    >
      <div className="block-content">{displayContent}</div>
    </div>
  )
}

export default BlockRenderer
