"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import rough from "roughjs"
import { getStroke } from "perfect-freehand"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MousePointer2, Square, Circle, Diamond, ArrowRight, Minus, Pencil } from "lucide-react"

type Point = { x: number; y: number }
type Element = {
  id: string
  type: string
  points: Point[]
  roughElement?: any
  path?: string
}

const tools = [
  { type: "selection", icon: <MousePointer2 className="h-4 w-4" />, label: "Select" },
  { type: "rectangle", icon: <Square className="h-4 w-4" />, label: "Rectangle" },
  { type: "diamond", icon: <Diamond className="h-4 w-4" />, label: "Diamond" },
  { type: "ellipse", icon: <Circle className="h-4 w-4" />, label: "Ellipse" },
  { type: "arrow", icon: <ArrowRight className="h-4 w-4" />, label: "Arrow" },
  { type: "line", icon: <Minus className="h-4 w-4" />, label: "Line" },
  { type: "pencil", icon: <Pencil className="h-4 w-4" />, label: "Pencil" },
] as const

export default function DrawingApp() {
  const [elements, setElements] = useState<Element[]>([])
  const [action, setAction] = useState<string>("none")
  const [tool, setTool] = useState<string>("pencil")
  const [selectedElement, setSelectedElement] = useState<Element | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 })
  const [startPanPoint, setStartPanPoint] = useState<Point>({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)

  // Track drawing state
  const [isDrawing, setIsDrawing] = useState(false)
  const [points, setPoints] = useState<Point[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Clear and draw all elements
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Apply pan and zoom transformations
    ctx.save()
    ctx.translate(panOffset.x, panOffset.y)
    ctx.scale(scale, scale)

    const roughCanvas = rough.canvas(canvas)

    // Draw all elements
    elements.forEach((element) => {
      if (element.type === "pencil") {
        const stroke = getSvgPathFromStroke(getStroke(element.points))
        ctx.fill(new Path2D(stroke))
      } else if (element.type === "rectangle") {
        const [start, end] = element.points
        roughCanvas.draw(rough.generator().rectangle(start.x, start.y, end.x - start.x, end.y - start.y))
      }
      // Add other shape types here
    })

    ctx.restore()

    return () => window.removeEventListener("resize", resizeCanvas)
  }, [elements, panOffset, scale])

  const handlePointerDown = (e: React.PointerEvent) => {
    const point = getPoint(e)

    if (e.button === 1 || e.altKey) {
      // Middle mouse button or Alt key
      setAction("panning")
      setStartPanPoint({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
      return
    }

    setIsDrawing(true)
    setPoints([point])

    if (tool === "pencil") {
      const id = Date.now().toString()
      setElements((prev) => [...prev, { id, type: tool, points: [point] }])
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (action === "panning") {
      const newPanOffset = {
        x: e.clientX - startPanPoint.x,
        y: e.clientY - startPanPoint.y,
      }
      setPanOffset(newPanOffset)
      return
    }

    if (!isDrawing) return

    const point = getPoint(e)

    if (tool === "pencil") {
      setPoints((prev) => [...prev, point])
      setElements((prevElements) => {
        const lastElement = prevElements[prevElements.length - 1]
        const updatedElement = {
          ...lastElement,
          points: [...lastElement.points, point],
        }
        return [...prevElements.slice(0, -1), updatedElement]
      })
    } else {
      // Handle other shape types
      const index = elements.length - 1
      const updatedElement = createElement(tool, points[0], point)

      setElements((prevElements) => [...prevElements.slice(0, index), updatedElement, ...prevElements.slice(index + 1)])
    }
  }

  const handlePointerUp = () => {
    if (action === "panning") {
      setAction("none")
      return
    }

    setIsDrawing(false)
    setPoints([])
  }

  const getPoint = (e: React.PointerEvent): Point => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left - panOffset.x) / scale,
      y: (e.clientY - rect.top - panOffset.y) / scale,
    }
  }

  const createElement = (type: string, start: Point, end: Point): Element => {
    const id = Date.now().toString()
    return { id, type, points: [start, end] }
  }

  // Convert perfect-freehand points to SVG path
  const getSvgPathFromStroke = (stroke: number[][]) => {
    if (!stroke.length) return ""

    const d = stroke.reduce(
      (acc, [x0, y0], i, arr) => {
        const [x1, y1] = arr[(i + 1) % arr.length]
        acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
        return acc
      },
      ["M", ...stroke[0], "Q"],
    )

    d.push("Z")
    return d.join(" ")
  }

  // Handle wheel event for zooming
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault()
      const delta = e.deltaY
      setScale((prevScale) => Math.min(Math.max(0.1, prevScale - delta / 500), 5))
    }
  }

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-zinc-50">
      {/* Toolbar */}
      <TooltipProvider delayDuration={0}>
        <div className="fixed top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1.5 bg-white rounded-lg border shadow-lg">
          {tools.map((t) => (
            <Tooltip key={t.type}>
              <TooltipTrigger asChild>
                <Button variant={tool === t.type ? "secondary" : "ghost"} size="icon" onClick={() => setTool(t.type)}>
                  {t.icon}
                  <span className="sr-only">{t.label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
      />
    </main>
  )
}