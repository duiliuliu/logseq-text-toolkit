/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 *
 * 烟花粒子效果组件 - 使用 Portal 渲染到 document.body，突破 Shadow DOM 限制
 */

import React, { useEffect, useState, useRef, useCallback } from 'react'
import ReactDOM from 'react-dom'

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

let portalRoot: HTMLDivElement | null = null

function getPortalRoot(): HTMLDivElement {
  if (!portalRoot) {
    portalRoot = document.createElement('div')
    portalRoot.id = 'fireworks-portal-root'
    portalRoot.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2147483647;'
    document.body.appendChild(portalRoot)
  }
  return portalRoot
}

function cleanup(): void {
  if (portalRoot) {
    portalRoot.innerHTML = ''
  }
}

const Fireworks: React.FC<FireworksProps> = ({ targetRect, onComplete }) => {
  const [fireworks, setFireworks] = useState<Firework[]>([])
  const [particles, setParticles] = useState<Particle[]>([])
  const [isLaunched, setIsLaunched] = useState(false)
  const animationRef = useRef<number>(0)
  const fireworkIdRef = useRef(0)
  const particleIdRef = useRef(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const COLORS = [
    { h: 0 }, { h: 30 }, { h: 60 },
    { h: 120 }, { h: 180 }, { h: 200 },
    { h: 260 }, { h: 300 }, { h: 330 },
  ]

  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [])

  const createExplosion = useCallback((x: number, y: number, hue: number) => {
    const count = 60
    const newParticles: Particle[] = []

    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: particleIdRef.current++,
        x,
        y,
        angle: (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.2,
        speed: Math.random() * 6 + 2,
        friction: 0.96,
        gravity: 0.05,
        hue: hue + (Math.random() - 0.5) * 30,
        brightness: Math.random() * 40 + 50,
        alpha: 1,
        decay: Math.random() * 0.02 + 0.015,
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

  useEffect(() => {
    if (!targetRect || isLaunched) return

    const centerX = targetRect.left + targetRect.width / 2
    const topY = targetRect.top
    setIsLaunched(true)

    const count = 4
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const offsetX = (Math.random() - 0.5) * targetRect.width * 2
        const offsetY = (Math.random() - 0.5) * targetRect.height
        launchFirework(centerX + offsetX, topY + offsetY)
      }, i * 200)
    }

    setTimeout(() => {
      onComplete?.()
    }, 3500)
  }, [targetRect, isLaunched, launchFirework, onComplete])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return

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
        ctx.arc(fw.x, fw.y, 2, 0, Math.PI * 2)
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
  }, [fireworks, particles, createExplosion])

  if (!targetRect) return null

  return ReactDOM.createPortal(
    <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />,
    getPortalRoot()
  )
}

export default Fireworks
