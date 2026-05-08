/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 烟花粒子效果组件
 */

import React, { useEffect, useState, useRef } from 'react'

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
  trigger: boolean
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
  '#ff9a9e',
  '#fecfef',
]

const Fireworks: React.FC<FireworksProps> = ({ trigger, onComplete }) => {
  const [particles, setParticles] = useState<Particle[]>([])
  const [show, setShow] = useState(false)
  const animationRef = useRef<number>()
  const particleIdRef = useRef(0)

  useEffect(() => {
    if (trigger) {
      setShow(true)
      createFireworks()
    }
  }, [trigger])

  const createFireworks = () => {
    const newParticles: Particle[] = []
    const centerX = 50
    const centerY = 50

    for (let i = 0; i < 60; i++) {
      const angle = (Math.PI * 2 * i) / 60 + Math.random() * 0.5
      const velocity = 2 + Math.random() * 3
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]

      newParticles.push({
        id: particleIdRef.current++,
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        color,
        size: 3 + Math.random() * 3,
        opacity: 1,
        life: 100,
      })
    }

    setParticles(prev => [...prev, ...newParticles])
    animate()
  }

  const animate = () => {
    setParticles(prev => {
      const updated = prev
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.05,
          opacity: p.opacity - 0.015,
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
  }

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  if (!show) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      <svg
        width="100%"
        height="100%"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {particles.map(p => (
          <circle
            key={p.id}
            cx={`${p.x}%`}
            cy={`${p.y}%`}
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
