"use client"

import type React from "react"
import { BgFill, Edge, StrokeEdge, StrokeFill, StrokeWidth, ToolType } from "@/types/canvas"
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
    isMobile?: boolean
}

export function ToolMenuStack({
    activeTool,
    strokeFill,
    setStrokeFill,
    strokeWidth,
    setStrokeWidth,
    bgFill,
    setBgFill,
    isMobile
}: SidebarProps) {

    const strokeWidths: StrokeWidth[] = [1, 2, 4]
    const strokeEdge: Edge = ["sharp", "round"]

    if (activeTool === "eraser" || activeTool === "grab") {
        return;
    }

    return (
        <>
            <section className={cn("ToolMenuStack p-3 overflow-auto custom-scrollbar transition-transform duration-300 ease-in-out z-10 mt-2",
                isMobile ? "" : "absolute top-full w-56 h-[calc(100vh-150px)] bg-background dark:bg-w-bg rounded-lg Island"
            )}>
                <h2 className="sr-only">Selected shape actions</h2>
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

                    <div className="">
                        <ItemLabel label="Edges" />
                        <div className="flex flex-wrap gap-x-2 gap-y-2 items-center py-1">
                            {Edge.map((sw, index) => (
                                <StrokeRoundIndicator
                                    key={index}
                                    strokeWidth={strokeWidth}
                                    strokeWidthProp={sw}
                                    onClick={() => setStrokeWidth(sw)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
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
            <Input type="radio" checked={strokeWidth === strokeWidthProp} onChange={() => onClick?.()} name="stroke-width" className="opacity-0 absolute pointer-events-none" />
            <div
                style={{ height: `${strokeWidthProp * 2}px` }}
                className="w-4 rounded-[10px] bg-color-on-primary-container dark:bg-icon-fill-color-d"
            />
        </label>
    )
}

const StrokeRoundIndicator = ({ strokeEdge, strokeEdgeProp, onClick }: { strokeEdge: StrokeEdge, strokeEdgeProp: StrokeEdge, onClick?: () => void }) => {
    return (
        <label className={cn("active flex justify-center items-center w-8 h-8 p-0 box-border border border-default-border-color rounded-lg cursor-pointer bg-light-btn-bg2 text-text-primary-color dark:bg-w-button-hover-bg dark:hover:bg-tool-btn-bg-hover-dark dark:text-text-primary-color dark:border-w-button-hover-bg focus-within:shadow-shadow-tool-focus",
            strokeEdge === strokeEdgeProp ? 'bg-selected-tool-bg-light dark:bg-selected-tool-bg-dark dark:border-selected-tool-bg-dark' : ''
        )}
            title={strokeEdgeProp === 'round' ? 'Round' : 'Sharp'}
            onClick={onClick}
        >
            <Input type="radio" checked={strokeEdge === strokeEdgeProp} onChange={() => onClick?.()} name="stroke-width" className="opacity-0 absolute pointer-events-none" />
            <div
                style={{ height: `${strokeEdgeProp * 2}px` }}
                className="w-4 rounded-[10px] bg-color-on-primary-container dark:bg-icon-fill-color-d"
            />
        </label>
    )
}

function SharpEdgeSvg() {
    return (
        <svg aria-hidden="true" focusable="false" role="img" viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" 
        strokeLinejoin="round">
            <svg strokeWidth="1.5">
                <path d="M3.33334 9.99998V6.66665C3.33334 6.04326 3.33403 4.9332 3.33539 3.33646C4.95233 3.33436 6.06276 3.33331 6.66668 3.33331H10"></path>
                <path d="M13.3333 3.33331V3.34331"></path>
                <path d="M16.6667 3.33331V3.34331"></path>
                <path d="M16.6667 6.66669V6.67669"></path>
                <path d="M16.6667 10V10.01"></path><path d="M3.33334 13.3333V13.3433"></path><path d="M16.6667 13.3333V13.3433"></path><path d="M3.33334 16.6667V16.6767"></path><path d="M6.66666 16.6667V16.6767"></path><path d="M10 16.6667V16.6767"></path><path d="M13.3333 16.6667V16.6767"></path><path d="M16.6667 16.6667V16.6767"></path></svg></svg>
    )
}