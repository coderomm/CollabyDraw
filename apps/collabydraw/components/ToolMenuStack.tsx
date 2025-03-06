"use client"

import type React from "react"
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
            <div className="ToolMenuStack absolute top-full w-52 p-3 h-[calc(100vh-150px)] overflow-auto custom-scrollbar bg-background dark:bg-w-bg rounded-lg transition-transform duration-300 ease-in-out md:z-30 mt-2 Island">
                <div className="flex flex-col gap-y-3">
                    {/* Theme and color picker */}
                    <ColorBoard
                        mode="Shape"
                        bgFill={bgFill}
                        setBgFill={setBgFill}
                        strokeFill={strokeFill}
                        setStrokeFill={setStrokeFill}
                    />

                    {/* Stroke picker */}
                    <div className="border-t p-4">
                        <ItemLabel label="Stroke width" />
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
            </div>
        </>
    )
}

const StrokeWidthIndicator = ({ strokeWidth, onClick }: { strokeWidth: StrokeWidth, onClick?: () => void }) => {
    return <div
        className={"w-[1.35rem] h-[1.35rem] rounded-sm cursor-pointer hover:border-white-70 border-white/10 border transition-all flex items-center"}
        onClick={onClick}
    >
        <div
            style={{ height: `${strokeWidth}px` }}
            className="w-full bg-white/80"
        />
    </div>
}

const ItemLabel = ({ label }: { label: string }) => {
    return (
        <h3 className="m-0 mb-1 text-sm font-normal text-text-primary-color dark:text-w-text">
            {label}
        </h3>
    );
};