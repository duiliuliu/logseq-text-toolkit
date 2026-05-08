/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 烟花粒子效果组件 - 紧凑型，定位在父元素正上方
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
  decay: number
}

interface FireworksProps {
  trigger: boolean
  duration?: number
  size?: number
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

const Fireworks: React.FC<FireworksProps> = ({ 
  trigger, 
  duration = 10000,
  size = 40,
  onComplete 
}) => {
  const [particles, setParticles] = useState<Particle[]>([])
  const [show, setShow] = useState(false)
  const animationRef = useRef<number>()
  const particleIdRef = useRef(0)
  const startTimeRef = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const createFireworks = useCallback(() => {
    const newParticles: Particle[] = []
    const particleCount = 24
    const centerX = size / 2
    const centerY = size / 2

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.3
      const velocity = 1.5 + Math.random() * 2
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]

      newParticles.push({
        id: particleIdRef.current++,
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 0.5,
        color,
        size: 2 + Math.random() * 2,
        opacity: 1,
        life: 100,
        decay: 0.008 + Math.random() * 0.005,
      })
    }

    setParticles(newParticles)
    startTimeRef.current = Date.now()
    setShow(true)
  }, [size])

  useEffect(() => {
    if (trigger && !show) {
      createFireworks()
    }
  }, [trigger, show, createFireworks])

  useEffect(() => {
    if (!show) return

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current
      
      if (elapsed >= duration) {
        setShow(false)
        setParticles([])
        onComplete?.()
        return
      }

      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.03,
            opacity: Math.max(0, p.opacity - p.decay),
            size: p.size * 0.995,
          }))
          .filter(p => p.opacity > 0 && p.life > 0)
      )

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [show, duration, onComplete])

  if (!show) return null

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: size,
        height: size,
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'visible',
      }}
    >
      <svg
        width={size}
        height={size}
        style={{ position: 'absolute', top: 0, left: 0 }}
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
    </div>
  )
}

export default Fireworks
