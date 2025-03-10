import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { ToolType } from "@/types/canvas"
import { tools } from "@/types/Tools"
import { Redo2, Undo2 } from "lucide-react"

interface ToolbarProps {
    selectedTool: ToolType
    onToolSelect: (tool: ToolType) => void
    onUndo: () => void
    onRedo: () => void
    canUndo: boolean
    canRedo: boolean
}

export function Toolbar2({ selectedTool, onToolSelect, onUndo, onRedo, canUndo, canRedo }: ToolbarProps) {
    return (
        <TooltipProvider delayDuration={0}>
            <header className="fixed top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1.5 rounded-lg Island">
                <div className="flex items-center gap-1 lg:gap-3">
                    {tools.map((tool) => (
                        <Tooltip key={tool.type}>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={selectedTool === tool.type ? "secondary" : "ghost"}
                                    size="icon"
                                    onClick={() => onToolSelect(tool.type)}
                                    className={`xl:relative ${selectedTool === tool.type ? 'bg-selected-tool-bg-light text-[var(--color-on-primary-container)] dark:bg-selected-tool-bg-dark dark:text-white' : 'text-icon-fill-color hover:text-icon-fill-color dark:text-icon-fill-color-d dark:hover:text-icon-fill-color-d hover:bg-light-btn-hover-bg dark:hover:bg-d-btn-hover-bg'}`}
                                >
                                    {tool.icon}
                                    <span className="sr-only">{tool.label}</span>
                                    <span className="hidden xl:block absolute -bottom-1 right-1 text-[11px] text-black/60 dark:text-icon-fill-color-d">{tool.shortcut}</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{tool.label}</TooltipContent>
                        </Tooltip>
                    ))}
                </div>
                <div className="HintViewer sr-only text-[.75rem] text-gray-400 text-center mt-2 w-full max-w-full pointer-events-none absolute flex flex-col justify-center left-0 top-full"><span>To move canvas, hold mouse wheel or spacebar while dragging, or use the hand tool</span></div>
                <div className="items-center gap-1 hidden">
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
            </header>
        </TooltipProvider>
    )
}