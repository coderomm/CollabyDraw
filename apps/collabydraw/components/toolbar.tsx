import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
    MousePointer2,
    Square,
    Circle,
    Diamond,
    ArrowRight,
    Minus,
    Pencil,
    Type,
    Eraser,
    Undo2,
    Redo2,
} from "lucide-react"
import type { ShapeType } from "@/types/canvas"

interface ToolbarProps {
    selectedTool: ShapeType
    onToolSelect: (tool: ShapeType) => void
    onUndo: () => void
    onRedo: () => void
    canUndo: boolean
    canRedo: boolean
}

const tools = [
    { type: "selection", icon: <MousePointer2 className="h-4 w-4" />, label: "Select" },
    { type: "rectangle", icon: <Square className="h-4 w-4" />, label: "Rectangle" },
    { type: "diamond", icon: <Diamond className="h-4 w-4" />, label: "Diamond" },
    { type: "ellipse", icon: <Circle className="h-4 w-4" />, label: "Ellipse" },
    { type: "arrow", icon: <ArrowRight className="h-4 w-4" />, label: "Arrow" },
    { type: "line", icon: <Minus className="h-4 w-4" />, label: "Line" },
    { type: "pen", icon: <Pencil className="h-4 w-4" />, label: "Pen" },
    { type: "text", icon: <Type className="h-4 w-4" />, label: "Text" },
    { type: "eraser", icon: <Eraser className="h-4 w-4" />, label: "Eraser" },
] as const

export function Toolbar({ selectedTool, onToolSelect, onUndo, onRedo, canUndo, canRedo }: ToolbarProps) {
    return (
        <TooltipProvider delayDuration={0}>
            <div className="fixed top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1.5 bg-white rounded-lg border shadow-lg">
                <div className="flex items-center gap-1">
                    {tools.map((tool) => (
                        <Tooltip key={tool.type}>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={selectedTool === tool.type ? "secondary" : "ghost"}
                                    size="icon"
                                    onClick={() => onToolSelect(tool.type)}
                                >
                                    {tool.icon}
                                    <span className="sr-only">{tool.label}</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{tool.label}</TooltipContent>
                        </Tooltip>
                    ))}
                </div>

                <div className="w-px h-6 bg-border mx-1" />

                <div className="flex items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo}>
                                <Undo2 className="h-4 w-4" />
                                <span className="sr-only">Undo</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Undo</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={onRedo} disabled={!canRedo}>
                                <Redo2 className="h-4 w-4" />
                                <span className="sr-only">Redo</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Redo</TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </TooltipProvider>
    )
}