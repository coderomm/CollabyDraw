import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
    MousePointer2,
    Square,
    Circle,
    Minus,
    Pencil,
    Eraser,
    Undo2,
    Redo2,
    Diamond,
} from "lucide-react"
import type { Tool, ToolType } from "@/types/canvas"

interface ToolbarProps {
    selectedTool: ToolType
    onToolSelect: (tool: ToolType) => void
    onUndo: () => void
    onRedo: () => void
    canUndo: boolean
    canRedo: boolean
}

const tools: Tool[] = [{
    type: "grab",
    icon: <MousePointer2 />,
    shortcut: 1,
    label: 'Grab'
},
{
    type: "rectangle",
    icon: <Square />,
    shortcut: 2,
    label: 'Rectangle'
},
{
    type: "ellipse",
    icon: <Circle />,
    shortcut: 3,
    label: 'Ellipse'
},
{
    type: "diamond",
    icon: <Diamond />,
    shortcut: 4,
    label: 'Diamond'
},
{
    type: "line",
    icon: <Minus />,
    shortcut: 5,
    label: 'Line'
},
{
    type: "pen",
    icon: <Pencil />,
    shortcut: 6,
    label: 'Arrow'
},
{
    type: "eraser",
    icon: <Eraser />,
    shortcut: 7,
    label: 'Eraser'
}
]

export function Toolbar2({ selectedTool, onToolSelect, onUndo, onRedo, canUndo, canRedo }: ToolbarProps) {
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