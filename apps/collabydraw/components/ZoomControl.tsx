import { Minus, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

export default function ZoomControl({
    scale,
    setScale
}: { scale: number; setScale: React.Dispatch<React.SetStateAction<number>> }) {

    const zoomIn = () => {
        setScale((prevScale: number) => Math.min(prevScale * 1.1, 5));
    };

    const zoomOut = () => {
        setScale(prevScale => Math.max(prevScale * 0.9, 0.2));
    };

    const resetScale = () => {
        setScale(1);
    };

    return (
        <div className="ScaleBar ZoomINZoomOut_Bar Mobile_View fixed z-[4] bottom-4 left-4 rounded-lg hidden md:flex items-center bg-white dark:bg-w-bg surface-box-shadow">
            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={zoomOut} className="w-9 h-9 rounded-l-lg rounded-r-none bg-light-btn-bg text-text-primary-color dark:bg-w-bg dark:hover:bg-d-btn-hover-bg dark:text-w-text select-none">
                            <Minus className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="dark:bg-w-bg dark:text-white">Zoom Out</TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={resetScale} className="w-14 px-3 h-9 rounded-none bg-light-btn-bg text-text-primary-color dark:bg-w-bg dark:hover:bg-d-btn-hover-bg dark:text-w-text select-none">
                            {Math.round(scale * 100)}%
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="dark:bg-w-bg dark:text-white">Reset Scale</TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={zoomIn} className="w-9 h-9 rounded-r-lg rounded-l-none bg-light-btn-bg text-text-primary-color dark:bg-w-bg dark:hover:bg-d-btn-hover-bg dark:text-w-text select-none">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="dark:bg-w-bg dark:text-white">Zoom In</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
};
