/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 庆祝烟花粒子效果组件
 * 进度达到 100% 时触发的视觉反馈
 */

import React, { useEffect, useState, useCallback } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  angle: number
  velocity: number
  size: number
  color: string
  opacity: number
  life: number
}

interface CelebrationEffectProps {
  trigger: boolean
  duration?: number
  particleCount?: number
  size?: 'small' | 'medium' | 'large'
  position?: 'center' | 'top' | 'bottom'
}

const CELEBRATION_COLORS = [
  '#10b981', // 绿色
  '#3b82f6', // 蓝色
  '#f59e0b', // 黄色
  '#ef4444', // 红色
  '#8b5cf6', // 紫色
  '#ec4899', // 粉色
  '#06b6d4', // 青色
]

const SIZE_CONFIG = {
  small: { container: 40, particle: 4, spread: 20 },
  medium: { container: 60, particle: 6, spread: 30 },
  large: { container: 80, particle: 8, spread: 40 },
}

const CelebrationEffect: React.FC<CelebrationEffectProps> = ({
  trigger,
  duration = 1500,
  particleCount = 20,
  size = 'medium',
  position = 'center',
}) => {
  const [particles, setParticles] = useState<Particle[]>([])
  const [isAnimating, setIsAnimating] = useState(false)

  const config = SIZE_CONFIG[size]

  const createParticles = useCallback(() => {
    const newParticles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5
      const velocity = config.spread + Math.random() * config.spread * 0.5
      newParticles.push({
        id: i,
        x: config.container / 2,
        y: config.container / 2,
        angle,
        velocity,
        size: config.particle + Math.random() * 2,
        color: CELEBRATION_COLORS[Math.floor(Math.random() * CELEBRATION_COLORS.length)],
        opacity: 1,
        life: 1,
      })
    }
    setParticles(newParticles)
    setIsAnimating(true)
  }, [particleCount, config])

  useEffect(() => {
    if (trigger && !isAnimating) {
      createParticles()
    }
  }, [trigger, isAnimating, createParticles])

  useEffect(() => {
    if (!isAnimating) return

    const animationDuration = 60
    let frameCount = 0
    const maxFrames = Math.floor(duration / animationDuration)

    const animate = () => {
      frameCount++

      setParticles(prev => {
        return prev.map(particle => {
          const progress = frameCount / maxFrames
          const distance = particle.velocity * progress
          const x = config.container / 2 + Math.cos(particle.angle) * distance
          const y = config.container / 2 + Math.sin(particle.angle) * distance
          const opacity = Math.max(0, 1 - progress * 1.2)
          const scale = Math.max(0.2, 1 - progress * 0.8)
          const gravity = progress * progress * 10

          return {
            ...particle,
            x,
            y: y + gravity,
            opacity,
            size: particle.size * scale,
          }
        })
      })

      if (frameCount < maxFrames) {
        requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
        setParticles([])
      }
    }

    const animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [isAnimating, duration, config])

  const positionStyle: React.CSSProperties = {
    position: 'absolute',
    width: config.container,
    height: config.container,
    pointerEvents: 'none',
    zIndex: 1000,
  }

  switch (position) {
    case 'top':
      positionStyle.top = 0
      positionStyle.left = '50%'
      positionStyle.transform = 'translateX(-50%)'
      break
    case 'bottom':
      positionStyle.bottom = 0
      positionStyle.left = '50%'
      positionStyle.transform = 'translateX(-50%)'
      break
    case 'center':
    default:
      positionStyle.top = '50%'
      positionStyle.left = '50%'
      positionStyle.transform = 'translate(-50%, -50%)'
      break
  }

  if (!isAnimating || particles.length === 0) {
    return null
  }

  return (
    <div style={positionStyle}>
      <svg width={config.container} height={config.container} style={{ overflow: 'visible' }}>
        {particles.map(particle => (
          <circle
            key={particle.id}
            cx={particle.x}
            cy={particle.y}
            r={particle.size}
            fill={particle.color}
            opacity={particle.opacity}
          />
        ))}
      </svg>
    </div>
  )
}

export default CelebrationEffect
