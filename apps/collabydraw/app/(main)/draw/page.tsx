"use client"

import { useEffect, useRef, useState } from "react"
import { Square, Circle, Minus, Type, Hand, Undo2, Redo2 } from "lucide-react"
import { DrawingSidebar } from "@/components/drawing-sidebar"
import { DrawingToolbar } from "@/components/drawing-toolbar"
import { Button } from "@/components/ui/button"

const tools = [
    { icon: Square, name: "Rectangle" },
    { icon: Circle, name: "Circle" },
    { icon: Minus, name: "Line" },
    { icon: Type, name: "Text" },
    { icon: Hand, name: "Move" },
]

export default function DrawPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [selectedTool, setSelectedTool] = useState("Rectangle")
    const [isDrawing, setIsDrawing] = useState(false)
    const [startPos, setStartPos] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        canvas.width = window.innerWidth - 300 // Account for sidebar
        canvas.height = window.innerHeight - 64 // Account for toolbar

        ctx.strokeStyle = "#fff"
        ctx.lineWidth = 2
    }, [])

    const startDrawing = (e: React.MouseEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        setStartPos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        })
        setIsDrawing(true)
    }

    const draw = (e: React.MouseEvent) => {
        if (!isDrawing) return

        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const rect = canvas.getBoundingClientRect()
        const currentX = e.clientX - rect.left
        const currentY = e.clientY - rect.top

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.beginPath()

        switch (selectedTool) {
            case "Rectangle":
                ctx.rect(startPos.x, startPos.y, currentX - startPos.x, currentY - startPos.y)
                break
            case "Circle":
                const radius = Math.sqrt(Math.pow(currentX - startPos.x, 2) + Math.pow(currentY - startPos.y, 2))
                ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI)
                break
            case "Line":
                ctx.moveTo(startPos.x, startPos.y)
                ctx.lineTo(currentX, currentY)
                break
        }

        ctx.stroke()
    }

    const stopDrawing = () => {
        setIsDrawing(false)
    }

    return (
        <div className="flex h-screen bg-background">
            <DrawingSidebar />
            <div className="flex-1">
                <DrawingToolbar>
                    <div className="flex items-center space-x-2">
                        {tools.map((tool) => (
                            <Button
                                key={tool.name}
                                variant={selectedTool === tool.name ? "secondary" : "ghost"}
                                size="icon"
                                onClick={() => setSelectedTool(tool.name)}
                                className="text-primary hover:text-primary/90"
                            >
                                <tool.icon className="h-4 w-4" />
                                <span className="sr-only">{tool.name}</span>
                            </Button>
                        ))}
                        <div className="h-6 w-px bg-border" />
                        <Button variant="ghost" size="icon" className="text-primary hover:text-primary/90">
                            <Undo2 className="h-4 w-4" />
                            <span className="sr-only">Undo</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-primary hover:text-primary/90">
                            <Redo2 className="h-4 w-4" />
                            <span className="sr-only">Redo</span>
                        </Button>
                    </div>
                </DrawingToolbar>
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="touch-none"
                />
            </div>
        </div>
    )
}

