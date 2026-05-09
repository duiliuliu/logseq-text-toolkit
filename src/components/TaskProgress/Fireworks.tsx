/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 烟花粒子效果组件 - 定位在目标元素正上方，不影响其他区域
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
  targetRect: DOMRect | null
  onComplete?: () => void
}

const Fireworks: React.FC<FireworksProps> = ({ targetRect, onComplete }) => {
  const [fireworks, setFireworks] = useState<Firework[]>([])
  const [particles, setParticles] = useState<Particle[]>([])
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
    const count = 80
    const newParticles: Particle[] = []

    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: particleIdRef.current++,
        x,
        y,
        angle: (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3,
        speed: Math.random() * 8 + 4,
        friction: 0.97,
        gravity: 0.08,
        hue: hue + (Math.random() - 0.5) * 40,
        brightness: Math.random() * 50 + 60,
        alpha: 1,
        decay: Math.random() * 0.015 + 0.01,
      })
    }

    setParticles(prev => [...prev, ...newParticles])
  }, [])

  const launchFirework = useCallback((targetX: number, targetY: number) => {
    const hue = COLORS[Math.floor(Math.random() * COLORS.length)].h

    const newFirework: Firework = {
      id: fireworkIdRef.current++,
      x: targetX,
      y: targetY + 200,
      targetX,
      targetY,
      angle: Math.atan2(targetY - (targetY + 200), targetX - targetX),
      speed: 6,
      acceleration: 1.05,
      brightness: Math.random() * 50 + 50,
      hue,
    }

    setFireworks(prev => [...prev, newFirework])
  }, [])

  const launchMultiple = useCallback(() => {
    if (!targetRect) return

    const centerX = targetRect.left + targetRect.width / 2
    const topY = targetRect.top

    const count = 8
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const offsetX = (Math.random() - 0.5) * targetRect.width * 2
        const offsetY = (Math.random() - 0.5) * targetRect.height * 2
        launchFirework(centerX + offsetX, topY + offsetY)
      }, i * 150)
    }

    setTimeout(() => {
      onComplete?.()
    }, 4000)
  }, [targetRect, launchFirework, onComplete])

  useEffect(() => {
    launchMultiple()
  }, [launchMultiple])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      setFireworks(prev => {
        const updated: Firework[] = []
        
        for (let i = 0; i < prev.length; i++) {
          const fw = prev[i]
          fw.speed *= fw.acceleration

          const vx = Math.cos(fw.angle) * fw.speed
          const vy = Math.sin(fw.angle) * fw.speed

          const distToTarget = Math.hypot(fw.targetX - fw.x, fw.targetY - fw.y)
          
          if (distToTarget < 8) {
            createExplosion(fw.targetX, fw.targetY, fw.hue)
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
        ctx.arc(fw.x, fw.y, 3, 0, Math.PI * 2)
        ctx.fillStyle = `hsl(${fw.hue}, 100%, ${fw.brightness}%)`
        ctx.fill()
      })

      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 100%, ${p.brightness}%, ${p.alpha})`
        ctx.fill()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    const handleResize = () => resizeCanvas()
    window.addEventListener('resize', handleResize)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [fireworks, particles, createExplosion])

  if (!targetRect) return null

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none !important',
        zIndex: 2147483647,
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  )
}

export default Fireworks
