/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 烟花粒子效果组件 - 定位在父元素正上方
 */

import React, { useEffect, useState, useRef, useCallback } from 'react'

interface Firework {
  id: number
  x: number
  y: number
  targetX: number
  targetY: number
  angle: number
  speed: number
  acceleration: number
  brightness: number
  hue: number
}

interface Particle {
  id: number
  x: number
  y: number
  angle: number
  speed: number
  friction: number
  gravity: number
  hue: number
  brightness: number
  alpha: number
  decay: number
}

interface FireworksProps {
  trigger: boolean
  size?: number
  onComplete?: () => void
}

const Fireworks: React.FC<FireworksProps> = ({ trigger, size = 60, onComplete }) => {
  const [fireworks, setFireworks] = useState<Firework[]>([])
  const [particles, setParticles] = useState<Particle[]>([])
  const [show, setShow] = useState(false)
  const animationRef = useRef<number>()
  const fireworkIdRef = useRef(0)
  const particleIdRef = useRef(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const COLORS = [
    { h: 0 }, { h: 30 }, { h: 60 },
    { h: 120 }, { h: 180 }, { h: 200 },
    { h: 260 }, { h: 300 }, { h: 330 },
  ]

  const createExplosion = useCallback((x: number, y: number, hue: number) => {
    const count = 60
    const newParticles: Particle[] = []

    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: particleIdRef.current++,
        x,
        y,
        angle: (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3,
        speed: Math.random() * 4 + 2,
        friction: 0.95,
        gravity: 0.05,
        hue: hue + (Math.random() - 0.5) * 40,
        brightness: Math.random() * 40 + 50,
        alpha: 1,
        decay: Math.random() * 0.02 + 0.015,
      })
    }

    setParticles(prev => [...prev, ...newParticles])
  }, [])

  const launchFirework = useCallback((targetX: number, targetY: number) => {
    const startY = targetY + size * 3

    const hue = COLORS[Math.floor(Math.random() * COLORS.length)].h

    const newFirework: Firework = {
      id: fireworkIdRef.current++,
      x: targetX,
      y: startY,
      targetX,
      targetY,
      angle: Math.atan2(targetY - startY, targetX - targetX),
      speed: 6,
      acceleration: 1.05,
      brightness: Math.random() * 50 + 50,
      hue,
    }

    setFireworks(prev => [...prev, newFirework])
  }, [size])

  const triggerFireworks = useCallback(() => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    setShow(true)

    const count = 3
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        if (!containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        
        const offsetX = (Math.random() - 0.5) * size * 1.5
        const offsetY = (Math.random() - 0.5) * size * 1.5
        launchFirework(centerX + offsetX, centerY + offsetY)
      }, i * 200)
    }

    setTimeout(() => {
      setShow(false)
      setFireworks([])
      setParticles([])
      onComplete?.()
    }, 3000)
  }, [launchFirework, size, onComplete])

  useEffect(() => {
    if (trigger) {
      triggerFireworks()
    }
  }, [trigger, triggerFireworks])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !show) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = size * 4
    canvas.height = size * 4

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const offsetX = (canvas.width - (containerRef.current?.offsetWidth || size)) / 2
      const offsetY = (canvas.height - (containerRef.current?.offsetHeight || size)) / 2

      setFireworks(prev => {
        const updated: Firework[] = []
        
        for (let i = 0; i < prev.length; i++) {
          const fw = prev[i]
          fw.speed *= fw.acceleration

          const vx = Math.cos(fw.angle) * fw.speed
          const vy = Math.sin(fw.angle) * fw.speed

          const distToTarget = Math.hypot(fw.targetX - fw.x, fw.targetY - fw.y)
          
          if (distToTarget < 8) {
            createExplosion(fw.targetX + offsetX, fw.targetY + offsetY, fw.hue)
          } else {
            fw.x += vx
            fw.y += vy
            updated.push(fw)
          }
        }
        
        return updated
      })

      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            speed: p.speed * p.friction,
            x: p.x + Math.cos(p.angle) * p.speed,
            y: p.y + Math.sin(p.angle) * p.speed + p.gravity,
            alpha: p.alpha - p.decay,
          }))
          .filter(p => p.alpha > 0)
      )

      fireworks.forEach(fw => {
        ctx.beginPath()
        ctx.arc(fw.x + offsetX, fw.y + offsetY, 2, 0, Math.PI * 2)
        ctx.fillStyle = `hsl(${fw.hue}, 100%, ${fw.brightness}%)`
        ctx.fill()
      })

      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 100%, ${p.brightness}%, ${p.alpha})`
        ctx.fill()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [show, fireworks, particles, size, createExplosion])

  if (!show) return null

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: size * 4,
        height: size * 4,
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'visible',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
        }}
      />
    </div>
  )
}

export default Fireworks
