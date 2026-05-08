/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 烟花粒子效果组件 - 真实烟花发射效果
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
  distanceToTarget: number
  distanceTraveled: number
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
  onComplete?: () => void
}

const Fireworks: React.FC<FireworksProps> = ({ trigger, onComplete }) => {
  const [fireworks, setFireworks] = useState<Firework[]>([])
  const [particles, setParticles] = useState<Particle[]>([])
  const [show, setShow] = useState(false)
  const animationRef = useRef<number>()
  const fireworkIdRef = useRef(0)
  const particleIdRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const targetRef = useRef<{ x: number; y: number } | null>(null)

  const COLORS = [
    { h: 0 }, { h: 30 }, { h: 60 },   // 红、橙、黄
    { h: 120 }, { h: 180 }, { h: 200 }, // 绿、青、蓝
    { h: 260 }, { h: 300 }, { h: 330 }, // 紫、粉红
  ]

  const createExplosion = useCallback((x: number, y: number, hue: number) => {
    const count = 80
    const newParticles: Particle[] = []

    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: particleIdRef.current++,
        x,
        y,
        angle: (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.2,
        speed: Math.random() * 8 + 2,
        friction: 0.96,
        gravity: 0.08,
        hue: hue + (Math.random() - 0.5) * 30,
        brightness: Math.random() * 40 + 50,
        alpha: 1,
        decay: Math.random() * 0.015 + 0.01,
      })
    }

    setParticles(prev => [...prev, ...newParticles])
  }, [])

  const launchFirework = useCallback((targetX: number, targetY: number) => {
    const startX = targetX
    const startY = window.innerHeight

    const hue = COLORS[Math.floor(Math.random() * COLORS.length)].h

    const newFirework: Firework = {
      id: fireworkIdRef.current++,
      x: startX,
      y: startY,
      targetX,
      targetY,
      angle: Math.atan2(targetY - startY, targetX - startX),
      speed: 8,
      acceleration: 1.03,
      distanceToTarget: Math.hypot(targetX - startX, targetY - startY),
      distanceTraveled: 0,
      brightness: Math.random() * 50 + 50,
      hue,
    }

    setFireworks(prev => [...prev, newFirework])
  }, [])

  const triggerMultipleFireworks = useCallback((baseX: number, baseY: number) => {
    setShow(true)
    
    // 发射多个烟花，分布在目标位置附近
    const count = 5
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect()
          const offsetX = (Math.random() - 0.5) * rect.width * 2
          const offsetY = (Math.random() - 0.5) * rect.height
          const targetX = rect.left + rect.width / 2 + offsetX
          const targetY = rect.top + offsetY
          targetRef.current = { x: targetX, y: targetY }
          launchFirework(targetX, targetY)
        }
      }, i * 150)
    }

    // 10秒后完成
    setTimeout(() => {
      setShow(false)
      setFireworks([])
      setParticles([])
      onComplete?.()
    }, 10000)
  }, [launchFirework, onComplete])

  useEffect(() => {
    if (trigger && !show) {
      triggerMultipleFireworks(0, 0)
    }
  }, [trigger, show, triggerMultipleFireworks])

  useEffect(() => {
    if (!show) return

    const animate = () => {
      // 更新烟花
      setFireworks(prev => {
        const updated: Firework[] = []
        
        for (let i = 0; i < prev.length; i++) {
          const fw = prev[i]
          fw.speed *= fw.acceleration

          const vx = Math.cos(fw.angle) * fw.speed
          const vy = Math.sin(fw.angle) * fw.speed

          fw.distanceTraveled = Math.hypot(fw.x + vx - fw.x, fw.y + vy - fw.y)

          const distToTarget = Math.hypot(fw.targetX - fw.x, fw.targetY - fw.y)
          
          if (distToTarget < 10) {
            createExplosion(fw.targetX, fw.targetY, fw.hue)
          } else {
            fw.x += vx
            fw.y += vy
            updated.push(fw)
          }
        }
        
        return updated
      })

      // 更新粒子
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

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [show, createExplosion])

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
        overflow: 'hidden',
      }}
    >
      <canvas
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
        ref={(canvas) => {
          if (!canvas) return
          const ctx = canvas.getContext('2d')
          if (!ctx) return

          canvas.width = window.innerWidth
          canvas.height = window.innerHeight

          // 绘制烟花轨迹
          fireworks.forEach(fw => {
            ctx.beginPath()
            ctx.arc(fw.x, fw.y, 2, 0, Math.PI * 2)
            ctx.fillStyle = `hsl(${fw.hue}, 100%, ${fw.brightness}%)`
            ctx.fill()
          })

          // 绘制爆炸粒子
          particles.forEach(p => {
            ctx.beginPath()
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
            ctx.fillStyle = `hsla(${p.hue}, 100%, ${p.brightness}%, ${p.alpha})`
            ctx.fill()
          })
        }}
      />
    </div>
  )
}

export default Fireworks
