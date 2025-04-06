"use client"

import type React from "react"

import { useState } from "react"
import { Menu, Plus, Minus } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Button } from "./ui/button"
import { PaletteFilled } from "./SvgIcons"
import { BgFill, FillStyle, FontFamily, FontSize, RoughStyle, StrokeEdge, StrokeFill, StrokeStyle, StrokeWidth, TextAlign, ToolType } from "@/types/canvas"
import { AppSidebar } from "./AppSidebar"
import { StyleConfigurator } from "./StyleConfigurator"

interface MobileCommandBarProps {
    canvasColor: string
    setCanvasColor: (color: string) => void
    sidebarOpen: boolean
    setSidebarOpen: (open: boolean) => void
    scale: number;
    setScale: React.Dispatch<React.SetStateAction<number>>

    activeTool: ToolType;
    strokeFill: StrokeFill;
    setStrokeFill: React.Dispatch<React.SetStateAction<StrokeFill>>;
    strokeWidth: StrokeWidth;
    setStrokeWidth: React.Dispatch<React.SetStateAction<StrokeWidth>>;
    bgFill: BgFill;
    setBgFill: React.Dispatch<React.SetStateAction<BgFill>>;
    strokeEdge: StrokeEdge;
    setStrokeEdge: React.Dispatch<React.SetStateAction<StrokeEdge>>;
    strokeStyle: StrokeStyle;
    setStrokeStyle: React.Dispatch<React.SetStateAction<StrokeStyle>>;
    roughStyle: RoughStyle;
    setRoughStyle: React.Dispatch<React.SetStateAction<RoughStyle>>;
    fillStyle: FillStyle;
    setFillStyle: React.Dispatch<React.SetStateAction<FillStyle>>;
    fontFamily: FontFamily;
    setFontFamily: React.Dispatch<React.SetStateAction<FontFamily>>;
    fontSize: FontSize;
    setFontSize: React.Dispatch<React.SetStateAction<FontSize>>;
    textAlign: TextAlign;
    setTextAlign: React.Dispatch<React.SetStateAction<TextAlign>>;
    roomName?: string
    isStandalone?: boolean;
    onClearCanvas?: () => void;
    onExportCanvas?: () => void;
    onImportCanvas?: () => void;
}

export function MobileCommandBar({ canvasColor,
    setCanvasColor,
    sidebarOpen,
    setSidebarOpen,
    scale,
    setScale,
    activeTool,
    strokeFill,
    setStrokeFill,
    strokeWidth,
    setStrokeWidth,
    bgFill,
    setBgFill,
    strokeEdge,
    setStrokeEdge,
    strokeStyle,
    setStrokeStyle,
    roughStyle,
    setRoughStyle,
    fillStyle,
    setFillStyle,
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
    textAlign,
    setTextAlign,
    roomName,
    isStandalone,
    onClearCanvas,
    onExportCanvas,
    onImportCanvas,
}: MobileCommandBarProps) {
    const [colorPickerOpen, setColorPickerOpen] = useState(false);

    const handleMenuButton = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <>
            <footer className="Appbar_Bottom Mobile_Appbar fixed bottom-0 left-0 right-0 z-50 md:hidden w-full max-w-full min-w-full ">
                <div className="mx-auto w-full max-w-full min-w-full px-4 pb-4">
                    <div data-active-tool={activeTool} className="flex items-center justify-between rounded-[8px] border p-2 backdrop-blur-md Island">
                        <NavbarButton icon={Menu} label="Menu" onClick={handleMenuButton} active={sidebarOpen} />
                        {activeTool !== 'grab' && activeTool !== 'eraser' && (
                            <NavbarButton icon={PaletteFilled} label="Colors" onClick={() => setColorPickerOpen(true)} active={colorPickerOpen} />
                        )}
                        <ScaleWidget scale={scale} setScale={setScale} />
                    </div>
                </div>
            </footer>

            {sidebarOpen && (
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetContent side="bottom" className="h-auto max-h-[80vh] w-full rounded-t-[20px] px-4 py-4 overflow-auto overflow-x-hiddenustom-scrollbar Island">
                        <SheetHeader className="mb-5">
                            <SheetTitle>App Menu</SheetTitle>
                        </SheetHeader>
                        <AppSidebar
                            isOpen={sidebarOpen}
                            onClose={() => setSidebarOpen(false)}
                            canvasColor={canvasColor}
                            setCanvasColor={setCanvasColor}
                            isMobile={true}
                            roomName={roomName}
                            isStandalone={isStandalone}
                            onClearCanvas={onClearCanvas}
                            onExportCanvas={onExportCanvas}
                            onImportCanvas={onImportCanvas}
                        />
                    </SheetContent>
                </Sheet>
            )}
            <Sheet open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
                <SheetContent side="bottom" className="h-auto max-h-[80vh] w-full rounded-t-[20px] px-4 py-4 overflow-auto overflow-x-hidden custom-scrollbar Island">
                    <SheetHeader className="mb-5">
                        <SheetTitle>Canvas Styles</SheetTitle>
                    </SheetHeader>
                    <StyleConfigurator
                        isMobile={true}
                        activeTool={activeTool}
                        strokeFill={strokeFill}
                        setStrokeFill={setStrokeFill}
                        strokeWidth={strokeWidth}
                        setStrokeWidth={setStrokeWidth}
                        bgFill={bgFill}
                        setBgFill={setBgFill}
                        strokeEdge={strokeEdge}
                        setStrokeEdge={setStrokeEdge}
                        strokeStyle={strokeStyle}
                        setStrokeStyle={setStrokeStyle}

                        roughStyle={roughStyle}
                        setRoughStyle={setRoughStyle}

                        fillStyle={fillStyle}
                        setFillStyle={setFillStyle}

                        fontFamily={fontFamily}
                        setFontFamily={setFontFamily}

                        fontSize={fontSize}
                        setFontSize={setFontSize}

                        textAlign={textAlign}
                        setTextAlign={setTextAlign}
                    />
                </SheetContent>
            </Sheet>
        </>
    )
}

interface NavbarButtonProps {
    icon: React.ElementType
    label: string
    onClick: () => void
    active?: boolean
}

function NavbarButton({ icon: Icon, label, onClick, active = false }: NavbarButtonProps) {
    return (
        <button
            className={cn(
                "flex flex-col items-center justify-center w-8 h-8 rounded-lg transition-all hover:bg-light-btn-hover-bg text-icon-fill-color dark:bg-transparent dark:hover:bg-d-btn-hover-bg dark:text-white",
                label === 'Menu' ? 'menu-btn-box-shadow bg-light-btn-bg' : '',
                active
                    ? "bg-light-btn-hover-bg dark:bg-d-btn-hover-bg"
                    : '',
            )}
            onClick={onClick}
        >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium hidden">{label}</span>
        </button>
    )
}

function ScaleWidget({ scale, setScale }: {
    scale: number;
    setScale: React.Dispatch<React.SetStateAction<number>>
}) {
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
        <>
            <div className="rounded-lg flex items-center bg-white dark:bg-w-bg surface-box-shadow">
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
        </>
    )
}