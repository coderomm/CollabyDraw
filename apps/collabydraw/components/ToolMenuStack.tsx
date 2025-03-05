"use client"

import type React from "react"
import { Command } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { BgFill, StrokeFill, StrokeWidth, ToolType } from "@/types/canvas"
import { ColorBoard } from "./color-board"

interface SidebarProps {
    activeTool: ToolType;
    strokeFill: StrokeFill;
    setStrokeFill: React.Dispatch<React.SetStateAction<StrokeFill>>;
    strokeWidth: StrokeWidth;
    setStrokeWidth: React.Dispatch<React.SetStateAction<StrokeWidth>>;
    bgFill: BgFill;
    setBgFill: React.Dispatch<React.SetStateAction<BgFill>>;
}

// interface SidebarProps {
//     isOpen: boolean
//     onClose: () => void
//     canvasColor: string
//     setCanvasColor: (color: string) => void
// }

export function ToolMenuStack({
    activeTool,
    strokeFill,
    setStrokeFill,
    setStrokeWidth,
    bgFill,
    setBgFill,
}: SidebarProps) {

    const strokeWidths: StrokeWidth[] = [1, 2, 4]

    if (activeTool === "eraser" || activeTool === "grab") {
        return;
    }

    return (
        <>
            <aside className="absolute top-full bg-background dark:bg-w-bg rounded-lg transition-transform duration-300 ease-in-out md:z-30 mt-2">
                <div className="flex h-[calc(100vh-150px)] flex-col Island rounded-lg tool-menu-stack">

                    {/* Menu items */}
                    <div className="flex-1 overflow-auto py-1 custom-scrollbar">
                        <nav className="grid gap-1 px-2">
                            <SidebarItem icon={Command} label="Command palette" shortcut="Ctrl+/" />
                            <Separator className="my-4 dark:bg-w-border-color" />
                            <SidebarItem icon={Command} label="Excalidraw+" />
                        </nav>
                    </div>

                    {/* Theme and color picker */}
                    <div className="border-t p-4">
                        <h3 className="mb-2 text-sm font-medium dark:text-w-text">Background Color</h3>
                        <ColorBoard
                            mode="Shape"
                            bgFill={bgFill}
                            setBgFill={setBgFill}
                            strokeFill={strokeFill}
                            setStrokeFill={setStrokeFill}
                        />
                    </div>

                    {/* Stroke picker */}
                    <div className="border-t p-4">
                        <h3 className="mb-2 text-sm font-medium dark:text-w-text">Stroke width</h3>
                        <div className="flex gap-2 h-7 items-center">
                            {strokeWidths.map((sw, index) => (
                                <StrokeWidthIndicator
                                    key={index}
                                    strokeWidth={sw}
                                    onClick={() => setStrokeWidth(sw)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </aside>
        </>
    )
}

interface SidebarItemProps {
    icon: React.ElementType
    label: string
    shortcut?: string
    className?: string
    onClick?: () => void
}

function SidebarItem({ icon: Icon, label, shortcut, className, onClick }: SidebarItemProps) {
    return (
        <Button
            variant="ghost"
            className={cn(
                "flex h-10 w-full justify-start gap-2 rounded-md px-3 text-sm font-medium transition-colors dark:text-w-text dark:hover:text-w-text dark:hover:bg-w-button-hover-bg",
                className,
            )}
            onClick={onClick}
        >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
            {shortcut && (
                <kbd className="ml-auto inline-flex h-5 select-none items-center gap-1 rounded px-1.5 font-mono text-[10px] font-medium opacity-100 bg-muted text-muted-foreground dark:text-[var(--RadioGroup-choice-color-on)] dark:bg-[var(--RadioGroup-choice-background-on)] dark:hover:bg-[var(--RadioGroup-choice-background-on-hover)]">
                    {shortcut}
                </kbd>
            )}
        </Button>
    )
}

const StrokeWidthIndicator = ({ strokeWidth, onClick }: { strokeWidth: StrokeWidth, onClick?: () => void }) => {
    return <div
        className={"w-[1.4rem] h-[1.4rem] rounded-sm cursor-pointer hover:border-white-70 border-white/10 border transition-all flex items-center"}
        onClick={onClick}
    >
        <div
            style={{ height: `${strokeWidth}px` }}
            className="w-full bg-white/80"
        />
    </div>
}