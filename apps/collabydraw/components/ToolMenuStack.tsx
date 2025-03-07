"use client"

import type React from "react"
import { BgFill, StrokeFill, StrokeWidth, ToolType } from "@/types/canvas"
import { ColorBoard } from "./color-board"
import ItemLabel from "./ItemLabel";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

interface SidebarProps {
    activeTool: ToolType;
    strokeFill: StrokeFill;
    setStrokeFill: React.Dispatch<React.SetStateAction<StrokeFill>>;
    strokeWidth: StrokeWidth;
    setStrokeWidth: React.Dispatch<React.SetStateAction<StrokeWidth>>;
    bgFill: BgFill;
    setBgFill: React.Dispatch<React.SetStateAction<BgFill>>;
}

export function ToolMenuStack({
    activeTool,
    strokeFill,
    setStrokeFill,
    strokeWidth,
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
            <aside className="ToolMenuStack absolute top-full w-56 p-3 h-[calc(100vh-150px)] overflow-auto custom-scrollbar bg-background dark:bg-w-bg rounded-lg transition-transform duration-300 ease-in-out z-10 mt-2 Island">
                <div className="flex flex-col gap-y-3">
                    <ColorBoard
                        mode="Shape"
                        bgFill={bgFill}
                        setBgFill={setBgFill}
                        strokeFill={strokeFill}
                        setStrokeFill={setStrokeFill}
                    />

                    <div className="">
                        <ItemLabel label="Stroke width" />
                        <div className="flex flex-wrap gap-x-2 gap-y-2 items-center py-1">
                            {strokeWidths.map((sw, index) => (
                                <StrokeWidthIndicator
                                    key={index}
                                    strokeWidth={strokeWidth}
                                    strokeWidthProp={sw}
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

const StrokeWidthIndicator = ({ strokeWidth, strokeWidthProp, onClick }: { strokeWidth: StrokeWidth, strokeWidthProp: StrokeWidth, onClick?: () => void }) => {
    return (
            <label className={cn("active flex justify-center items-center w-8 h-8 p-0 box-border border border-default-border-color rounded-lg cursor-pointer bg-light-btn-bg2 text-text-primary-color dark:bg-w-button-hover-bg dark:hover:bg-tool-btn-bg-hover-dark dark:text-text-primary-color dark:border-w-button-hover-bg focus-within:shadow-shadow-tool-focus",
            strokeWidth === strokeWidthProp ? 'bg-selected-tool-bg-light dark:bg-selected-tool-bg-dark dark:border-selected-tool-bg-dark' : ''
        )}
            title={strokeWidthProp === 1 ? 'Thin' : strokeWidthProp === 2 ? 'Bold' : 'Extra bold'}
            onClick={onClick}
        >
            <Input type="radio" checked={strokeWidth === strokeWidthProp} name="stroke-width" className="opacity-0 absolute pointer-events-none" />
            <div
                style={{ height: `${strokeWidthProp*2}px` }}
                className="w-4 rounded-[10px] bg-color-on-primary-container dark:bg-icon-fill-color-d"
            />
        </label>
    )
}