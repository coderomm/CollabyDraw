"use client"

import type React from "react"

import { useState } from "react"
import { Menu, Plus, Minus } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { MainMenuStack } from "./MainMenuStack"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Button } from "./ui/button"
import { PaletteFilled } from "./SvgIcons"
import { ToolMenuStack } from "./ToolMenuStack"
import { BgFill, StrokeFill, StrokeWidth, ToolType } from "@/types/canvas"

interface MobileNavbarProps {
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

    roomName?: string
}

export function MobileNavbar({ canvasColor,
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
    roomName }: MobileNavbarProps) {
    const [colorPickerOpen, setColorPickerOpen] = useState(false)
    const isMediumScreen = useMediaQuery('md');

    return (
        <>
            <footer className="fixed bottom-0 left-0 right-0 z-50 md:hidden w-full max-w-full min-w-full ">
                <div className="mx-auto max-w-md px-4 pb-4">
                    <div data-active-tool={activeTool} className="flex items-center justify-between rounded-[8px] border p-2 backdrop-blur-md Island">
                        <NavbarButton icon={Menu} label="Menu" onClick={() => setSidebarOpen(!sidebarOpen)} active={sidebarOpen} />
                        {activeTool !== 'grab' && activeTool !== 'eraser' && (
                            <NavbarButton icon={PaletteFilled} label="Colors" onClick={() => setColorPickerOpen(true)} active={colorPickerOpen} />
                        )}
                        <ScaleWidget scale={scale} setScale={setScale} />
                    </div>
                </div>
            </footer>

            {!isMediumScreen && (
                <>
                    {sidebarOpen && (
                        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                            <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-[20px] px-4 py-4 overflow-auto custom-scrollbar Island">
                                <SheetHeader className="mb-5">
                                    <SheetTitle>Settings</SheetTitle>
                                </SheetHeader>
                                <MainMenuStack
                                    isOpen={sidebarOpen}
                                    onClose={() => setSidebarOpen(false)}
                                    canvasColor={canvasColor}
                                    setCanvasColor={setCanvasColor}
                                    isMobile={true}

                                    roomName={roomName}
                                />
                            </SheetContent>
                        </Sheet>
                    )}
                    <Sheet open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
                        <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-[20px] px-4 py-4 overflow-auto custom-scrollbar Island">
                            <SheetHeader className="mb-5">
                                <SheetTitle>Canvas Background</SheetTitle>
                            </SheetHeader>
                            <ToolMenuStack
                                isMobile={true}
                                activeTool={activeTool}
                                strokeFill={strokeFill}
                                setStrokeFill={setStrokeFill}
                                strokeWidth={strokeWidth}
                                setStrokeWidth={setStrokeWidth}
                                bgFill={bgFill}
                                setBgFill={setBgFill}
                            />
                        </SheetContent>
                    </Sheet>
                </>
            )}

            {/* <Sheet open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
                <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-[20px] px-6 py-6 Island">
                    <SheetHeader className="mb-5">
                        <SheetTitle>Canvas Background</SheetTitle>
                    </SheetHeader>
                    <div className="mx-auto max-w-md">
                        <ColorPicker value={canvasColor} onChange={setCanvasColor} />
                    </div>
                </SheetContent>
            </Sheet> */}

            {/* <Sheet open={commandsOpen} onOpenChange={setCommandsOpen}>
                <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-[20px] px-6 py-6 Island">
                    <SheetHeader className="mb-5">
                        <SheetTitle>Commands</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-4">
                        <CommandItem icon={Zap} label="Quick Actions" description="Access frequently used tools" />
                        <CommandItem icon={Layers} label="Layers" description="Manage your canvas layers" />
                        <CommandItem icon={FileText} label="Templates" description="Start from pre-made designs" />
                        <CommandItem icon={Users} label="Collaboration" description="Invite others to your canvas" />
                    </div>
                </SheetContent>
            </Sheet>

            <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
                <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-[20px] px-6 py-6 Island">
                    <SheetHeader className="mb-5">
                        <SheetTitle>Settings</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-4">
                        <SettingsItem title="Canvas Size" description="Adjust the dimensions of your canvas" />
                        <SettingsItem title="Grid & Snapping" description="Configure alignment helpers" />
                        <SettingsItem title="Export Options" description="Set format and quality preferences" />
                        <SettingsItem title="Keyboard Shortcuts" description="Customize your workflow" />
                    </div>
                </SheetContent>
            </Sheet> */}
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
            {...(label === 'Menu' && { "data-sidebar-trigger": true })}
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

// interface CommandItemProps {
//     icon: React.ElementType
//     label: string
//     description: string
// }

// function CommandItem({ icon: Icon, label, description }: CommandItemProps) {
//     return (
//         <Button
//             variant="ghost"
//             className="flex w-full items-start justify-start gap-3 rounded-lg p-3 text-left hover:bg-accent"
//         >
//             <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
//                 <Icon className="h-5 w-5" />
//             </div>
//             <div>
//                 <h3 className="font-medium">{label}</h3>
//                 <p className="text-sm text-muted-foreground">{description}</p>
//             </div>
//         </Button>
//     )
// }

// interface SettingsItemProps {
//     title: string
//     description: string
// }

// function SettingsItem({ title, description }: SettingsItemProps) {
//     return (
//         <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors">
//             <div>
//                 <h3 className="font-medium">{title}</h3>
//                 <p className="text-sm text-muted-foreground">{description}</p>
//             </div>
//             <Button variant="ghost" size="icon" className="shrink-0 rounded-full">
//                 <Settings className="h-4 w-4" />
//                 <span className="sr-only">Adjust {title}</span>
//             </Button>
//         </div>
//     )
// }