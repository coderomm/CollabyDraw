"use client"

import { useTheme } from "next-themes"
import { useEffect, useRef } from "react"

interface EraserCursorProps {
  size: number
  isActive: boolean
}

export function EraserCursor({ size, isActive }: EraserCursorProps) {
  const { theme } = useTheme()
  const cursorRef = useRef<HTMLDivElement>(null)
  const trailRef = useRef<HTMLCanvasElement>(null)
  const positionRef = useRef({ x: 0, y: 0 })
  const prevPositionRef = useRef({ x: 0, y: 0 })
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isActive) return

    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        const x = e.clientX
        const y = e.clientY
        cursorRef.current.style.transform = `translate(${x}px, ${y}px)`

        prevPositionRef.current = { ...positionRef.current }
        positionRef.current = { x, y }
      }
    }

    const drawTrail = () => {
      if (!trailRef.current || !isActive) return
      const canvas = trailRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      // Fade out previous trails for smoother effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)" // Adjust opacity for smooth fading
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add blur for softer trail effect
      ctx.filter = "blur(1px)"

      const positions = calculateTrailPositions(
        prevPositionRef.current,
        positionRef.current,
        8, // Increased segments for smoother trail
      )

      positions.forEach((pos, index) => {
        const decayFactor = easeOut(1 - index / positions.length)
        const trailSize = Math.max(size * decayFactor, 1) // Ensures it doesn't go to 0

        ctx.beginPath()
        ctx.arc(pos.x, pos.y, trailSize / 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${decayFactor * 0.8})`
        ctx.fill()

        ctx.strokeStyle = theme === "dark" ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)"
        ctx.lineWidth = 1.5
        ctx.stroke()
      })

      // Reset filter after drawing
      ctx.filter = "none"

      animationFrameRef.current = requestAnimationFrame(drawTrail)
    }

    const calculateTrailPositions = (
      prev: { x: number; y: number },
      current: { x: number; y: number },
      segments: number,
    ) => {
      const positions = []
      for (let i = 0; i < segments; i++) {
        const ratio = i / segments
        positions.push({
          x: current.x * (1 - ratio) + prev.x * ratio,
          y: current.y * (1 - ratio) + prev.y * ratio,
        })
      }
      return positions
    }

    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3) // Smooth fade-out effect

    document.addEventListener("mousemove", handleMouseMove)
    animationFrameRef.current = requestAnimationFrame(drawTrail)

    const handleResize = () => {
      if (trailRef.current) {
        trailRef.current.width = window.innerWidth
        trailRef.current.height = window.innerHeight
      }
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", handleResize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isActive, size, theme])

  if (!isActive) return null

  return (
    <>
      <canvas ref={trailRef} className="fixed inset-0 pointer-events-none z-50" />
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-50"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          backgroundColor: "white",
          border: `1.5px solid ${theme === "dark" ? "white" : "black"}`,
          transform: "translate(-50%, -50%)",
          boxShadow: "0 0 5px rgba(0, 0, 0, 0.2)",
        }}
      />
    </>
  )
}

