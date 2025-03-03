import { Minus, Plus } from "lucide-react"
import { Button } from "./ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

export const Scale = ({ scale }: { scale: number }) => {
    return (
        <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant={selectedTool === tool.type ? "secondary" : "ghost"}
                        size="icon"
                        onClick={() => onToolSelect(tool.type)}
                        className={`xl:relative text-icon-fill-color-d hover:bg-light-btn-hover-bg ${selectedTool === tool.type ? 'bg-[var(--color-surface-primary-container)] text-[var(--color-on-primary-container)]' : ''}`}
                    >
                    </Button>
                </TooltipTrigger>
                <TooltipContent></TooltipContent>
            </Tooltip>
            <div className="w-fit py-2 px-4 fixed bottom-10 left-10">
                <div className="flex bg-[#232329] px-4 py-2 rounded-md gap-3">
                    <p className="text-white">{Math.round(scale * 100)}%</p>
                </div>
            </div>
            <div className="flex items-center border rounded-md overflow-hidden">
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={zoomOut} className="h-8 w-8 rounded-none">
                                <Minus className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent></TooltipContent>
                    </Tooltip>
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="px-3 py-1 border-l border-r min-w-[70px] text-center">{Math.round(scale * 100)}%</div>
                            </TooltipTrigger>
                            <TooltipContent></TooltipContent>
                        </Tooltip>
                        <TooltipProvider delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={zoomIn} className="h-8 w-8 rounded-none">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent></TooltipContent>
                            </Tooltip>
                        </div>
                    </TooltipProvider>
                    )
}