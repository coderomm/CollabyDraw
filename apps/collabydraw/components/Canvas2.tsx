"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import type { Point, Shape, ShapeType } from "@/types/canvas"

interface CanvasProps {
    selectedTool: ShapeType
    shapes: Shape[]
    onShapeAdd: (shape: Shape) => void
    onShapeUpdate: (shape: Shape) => void
    onShapeDelete: (shapeId: string) => void
}

export function Canvas({ selectedTool, shapes, onShapeAdd, onShapeUpdate, onShapeDelete }: CanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [currentPoints, setCurrentPoints] = useState<Point[]>([])
    const [pan, setPan] = useState<Point>({ x: 0, y: 0 })
    const [scale, setScale] = useState(1)

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

        // Draw all shapes
        const drawShapes = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            ctx.save()
            ctx.translate(pan.x, pan.y)
            ctx.scale(scale, scale)

            shapes.forEach((shape) => {
                drawShape(ctx, shape)
            })

            if (isDrawing && currentPoints.length > 0) {
                drawCurrentShape(ctx)
            }

            ctx.restore()
        }

        drawShapes()

        return () => {
            window.removeEventListener("resize", resizeCanvas)
        }
    }, [shapes, isDrawing, currentPoints, pan, scale])

    const drawShape = (ctx: CanvasRenderingContext2D, shape: Shape) => {
        ctx.beginPath()
        ctx.strokeStyle = shape.strokeColor
        ctx.fillStyle = shape.fillColor
        ctx.lineWidth = shape.strokeWidth

        switch (shape.type) {
            case "rectangle":
                const [start, end] = shape.points
                ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y)
                break
            // Add other shape types here
        }

        if (shape.fillColor) {
            ctx.fill()
        }
        ctx.stroke()
    }

    const drawCurrentShape = (ctx: CanvasRenderingContext2D) => {
        // Similar to drawShape but for the current shape being drawn
    }

    const handlePointerDown = (e: React.PointerEvent) => {
        const point = getCanvasPoint(e)
        setIsDrawing(true)
        setCurrentPoints([point])
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDrawing) return
        const point = getCanvasPoint(e)
        setCurrentPoints((prev) => [...prev, point])
    }

    const handlePointerUp = () => {
        if (!isDrawing) return
        setIsDrawing(false)

        if (currentPoints.length < 2) return

        const newShape: Shape = {
            id: Math.random().toString(),
            type: selectedTool,
            points: currentPoints,
            strokeColor: "#000000",
            fillColor: "",
            strokeWidth: 2,
            strokeStyle: "solid",
            opacity: 1,
            sloppiness: 0,
            roughness: 0,
            zIndex: shapes.length,
        }

        onShapeAdd(newShape)
        setCurrentPoints([])
    }

    const getCanvasPoint = (e: React.PointerEvent): Point => {
        const canvas = canvasRef.current
        if (!canvas) return { x: 0, y: 0 }

        const rect = canvas.getBoundingClientRect()
        return {
            x: (e.clientX - rect.left - pan.x) / scale,
            y: (e.clientY - rect.top - pan.y) / scale,
        }
    }

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        />
    )
}