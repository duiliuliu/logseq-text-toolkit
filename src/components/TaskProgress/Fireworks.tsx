/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 烟花粒子效果组件 - 在目标位置正上方绽放
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
  alpha: number
  decay: number
}

interface FireworksProps {
  trigger: boolean
  targetRef?: React.RefObject<HTMLElement | null>
  scale?: number
  onComplete?: () => void
}

const COLORS = [
  '#ff6b6b',
  '#ff9f43',
  '#feca57',
  '#48dbfb',
  '#1dd1a1',
  '#ff9ff3',
  '#f368e0',
  '#ff6b6b',
]

const Fireworks: React.FC<FireworksProps> = ({ 
  trigger, 
  targetRef,
  scale = 2,
  onComplete 
}) => {
  const [particles, setParticles] = useState<Particle[]>([])
  const [show, setShow] = useState(false)
  const animationRef = useRef<number>()
  const particleIdRef = useRef(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const targetBoundsRef = useRef<DOMRect | null>(null)
  const startTimeRef = useRef<number>(0)
  const lastTriggerRef = useRef<boolean>(false)

  const createExplosion = useCallback((centerX: number, centerY: number) => {
    const count = Math.floor(30 * scale)
    const newParticles: Particle[] = []

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3
      const velocity = (1.5 + Math.random() * 2) * scale

      newParticles.push({
        id: particleIdRef.current++,
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 0.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: (2 + Math.random() * 2) * scale,
        alpha: 1,
        decay: 0.012 + Math.random() * 0.008,
      })
    }

    setParticles(prev => [...prev, ...newParticles])
  }, [scale])

  const triggerFireworks = useCallback(() => {
    let centerX = window.innerWidth / 2
    let centerY = window.innerHeight / 2

    if (targetRef?.current) {
      const rect = targetRef.current.getBoundingClientRect()
      targetBoundsRef.current = rect
      centerX = rect.left + rect.width / 2
      centerY = rect.top - 10
    }

    startTimeRef.current = Date.now()
    setShow(true)
    createExplosion(centerX, centerY)
  }, [targetRef, createExplosion])

  useEffect(() => {
    if (trigger && !lastTriggerRef.current) {
      lastTriggerRef.current = true
      triggerFireworks()
    } else if (!trigger) {
      lastTriggerRef.current = false
    }
  }, [trigger, triggerFireworks])

  useEffect(() => {
    if (!show) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      setParticles(prev => {
        const updated = prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.05,
            alpha: p.alpha - p.decay,
            size: p.size * 0.99,
          }))
          .filter(p => p.alpha > 0.02)

        if (updated.length === 0) {
          setShow(false)
          onComplete?.()
          return updated
        }

        updated.forEach(p => {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.globalAlpha = p.alpha
          ctx.fill()
          ctx.globalAlpha = 1
        })

        return updated
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [show, onComplete])

  if (!show) return null

  return (
    <div
      ref={containerRef}
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
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
    </div>
  )
}

export default Fireworks
