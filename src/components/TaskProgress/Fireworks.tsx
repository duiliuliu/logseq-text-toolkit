/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 烟花粒子效果组件
 */

import React, { useEffect, useState, useRef, useCallback } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  opacity: number
  life: number
}

interface FireworksProps {
  containerRef?: React.RefObject<HTMLElement>
  trigger?: boolean
  onComplete?: () => void
}

const COLORS = [
  '#ff6b6b',
  '#4ecdc4',
  '#ffe66d',
  '#95e1d3',
  '#f38181',
  '#aa96da',
  '#fcbad3',
  '#a8d8ea',
]

const Fireworks: React.FC<FireworksProps> = ({ containerRef, trigger, onComplete }) => {
  const [particles, setParticles] = useState<Particle[]>([])
  const [show, setShow] = useState(false)
  const [containerSize, setContainerSize] = useState({ width: 60, height: 60 })
  const animationRef = useRef<number>()
  const particleIdRef = useRef(0)
  const lastTriggerRef = useRef(false)

  useEffect(() => {
    if (containerRef?.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setContainerSize({ width: rect.width, height: rect.height })
    }
  }, [containerRef])

  const createFireworks = useCallback(() => {
    const newParticles: Particle[] = []
    const centerX = containerSize.width / 2
    const centerY = containerSize.height / 2
    const particleCount = 12 + Math.floor(Math.random() * 8)

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.3
      const velocity = 1 + Math.random() * 1.5
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]

      newParticles.push({
        id: particleIdRef.current++,
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        color,
        size: 2 + Math.random() * 2,
        opacity: 1,
        life: 60 + Math.floor(Math.random() * 40),
      })
    }

    setParticles(prev => [...prev, ...newParticles])
    animate()
  }, [containerSize])

  const animate = useCallback(() => {
    setParticles(prev => {
      const updated = prev
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.03,
          opacity: p.opacity - 0.02,
          life: p.life - 1,
          size: p.size * 0.98,
        }))
        .filter(p => p.life > 0 && p.opacity > 0)

      if (updated.length === 0) {
        setShow(false)
        onComplete?.()
      }

      return updated
    })

    animationRef.current = requestAnimationFrame(animate)
  }, [onComplete])

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (trigger && !lastTriggerRef.current) {
      setShow(true)
      createFireworks()
    }
    lastTriggerRef.current = trigger
  }, [trigger, createFireworks])

  useEffect(() => {
    if (containerRef?.current) {
      const el = containerRef.current
      const handleClick = (e: MouseEvent) => {
        e.stopPropagation()
        setShow(true)
        createFireworks()
      }
      el.addEventListener('click', handleClick)
      return () => el.removeEventListener('click', handleClick)
    }
  }, [containerRef, createFireworks])

  if (!show) return null

  return (
    <svg
      width={containerSize.width}
      height={containerSize.height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      {particles.map(p => (
        <circle
          key={p.id}
          cx={p.x}
          cy={p.y}
          r={p.size}
          fill={p.color}
          opacity={p.opacity}
        />
      ))}
    </svg>
  )
}

export default Fireworks
