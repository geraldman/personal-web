"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

export interface TopographyBackgroundProps {
  className?: string
  children?: React.ReactNode
  /** Number of contour lines */
  lineCount?: number
  /** Line color */
  lineColor?: string
  /** Background color */
  backgroundColor?: string
  /** Animation speed */
  speed?: number
  /** Line thickness */
  strokeWidth?: number
  /** Horizontal sampling distance in pixels. Higher = less draw work. */
  sampleStep?: number
  /** Max device pixel ratio used by canvas. Lower = less fill cost on HiDPI screens. */
  maxDpr?: number
  /** Pause frame loop while keeping a static background frame rendered. */
  paused?: boolean
}

export function TopographyBackground({
  className,
  children,
  lineCount = 20,
  lineColor = "rgba(120, 120, 120, 0.3)",
  backgroundColor = "#0a0a0f",
  speed = 1,
  strokeWidth = 1,
  sampleStep = 4,
  maxDpr = 1.5,
  paused = false,
}: TopographyBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = container.getBoundingClientRect()
    let width = rect.width
    let height = rect.height

    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
    const setupCanvas = () => {
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    setupCanvas()

    let animationId: number
    let tick = 0

    // Resize handler
    const handleResize = () => {
      const rect = container.getBoundingClientRect()
      width = rect.width
      height = rect.height
      setupCanvas()
    }

    const ro = new ResizeObserver(handleResize)
    ro.observe(container)

    // Generate terrain height at a point
    const getHeight = (x: number, t: number) => {
      const scale = 0.003
      return (
        Math.sin(x * scale * 2 + t) * 30 +
        Math.sin(x * scale * 3.7 + t * 0.7) * 20 +
        Math.sin(x * scale * 1.3 - t * 0.5) * 40 +
        Math.sin(x * scale * 5.1 + t * 1.2) * 10 +
        Math.sin(x * scale * 0.7 + t * 0.3) * 50
      )
    }

    const drawFrame = () => {
      if (!paused) {
        tick += 0.008 * speed
      }

      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, width, height)

      ctx.strokeStyle = lineColor
      ctx.lineWidth = strokeWidth
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      const spacing = height / Math.max(lineCount - 1, 1)
      const padding = 50

      for (let i = 0; i < lineCount; i++) {
        const baseY = spacing * i

        ctx.beginPath()

        let started = false
        for (let x = -padding; x <= width + padding; x += sampleStep) {
          const terrainHeight = getHeight(x + i * 100, tick)
          const y = baseY + terrainHeight

          if (!started) {
            ctx.moveTo(x, y)
            started = true
          } else {
            ctx.lineTo(x, y)
          }
        }

        ctx.stroke()
      }
    }

    // Animation
    const animate = () => {
      drawFrame()

      animationId = requestAnimationFrame(animate)
    }

    if (paused) {
      drawFrame()
    } else {
      animationId = requestAnimationFrame(animate)
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      ro.disconnect()
    }
  }, [lineCount, lineColor, backgroundColor, speed, strokeWidth, sampleStep, maxDpr, paused])

  return (
    <div
      ref={containerRef}
      className={cn("fixed inset-0 overflow-hidden", className)}
      style={{ backgroundColor }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Subtle gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, transparent 0%, ${backgroundColor} 100%)`,
        }}
      />

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent 0%, transparent 40%, ${backgroundColor} 100%)`,
        }}
      />

      {/* Content layer */}
      {children && <div className="relative z-10 h-full w-full">{children}</div>}
    </div>
  )
}

export default function TopographyBackgroundDemo() {
  return <TopographyBackground />
}
