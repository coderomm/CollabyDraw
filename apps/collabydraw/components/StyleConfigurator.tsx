"use client"

import type React from "react"
import { BgFill, StrokeEdge, StrokeFill, StrokeStyle, StrokeWidth, ToolType } from "@/types/canvas"
import { ColorBoard } from "./color-board"
import ItemLabel from "./ItemLabel";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

interface StyleConfiguratorProps {
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
    isMobile?: boolean
}

export function StyleConfigurator({
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
    isMobile
}: StyleConfiguratorProps) {

    const lineThicknessOptions: StrokeWidth[] = [1, 2, 4]
    const edgeRoundnessOptions: StrokeEdge[] = ["sharp", "round"]
    const edgeStyleOptions: StrokeStyle[] = ["solid", "dashed", "dotted"]

    if (activeTool === "eraser" || activeTool === "grab" || activeTool === "selection") {
        return;
    }
    return (
        <>
            <section className={cn("StyleConfigurator p-3 overflow-auto custom-scrollbar transition-transform duration-300 ease-in-out z-10 mt-2",
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
                        activeTool={activeTool}
                    />

                    <div className="">
                        <ItemLabel label="Stroke width" />
                        <div className="flex flex-wrap gap-x-2 gap-y-2 items-center py-1">
                            {lineThicknessOptions.map((sw, index) => (
                                <StrokeWidthSelector
                                    key={index}
                                    strokeWidth={strokeWidth}
                                    strokeWidthProp={sw}
                                    onClick={() => setStrokeWidth(sw)}
                                />
                            ))}
                        </div>
                    </div>
                    {(activeTool === "rectangle" || activeTool === "diamond") && (
                        <div className="">
                            <ItemLabel label="Edges" />
                            <div className="flex flex-wrap gap-x-2 gap-y-2 items-center py-1">
                                {edgeRoundnessOptions.map((sw, index) => (
                                    <EdgeStyleSelector
                                        key={index}
                                        strokeEdge={strokeEdge}
                                        strokeEdgeProp={sw}
                                        onClick={() => setStrokeEdge(sw)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="">
                        <ItemLabel label="Stroke Style" />
                        <div className="flex flex-wrap gap-x-2 gap-y-2 items-center py-1">
                            {edgeStyleOptions.map((sw, index) => (
                                <StrokeStyleSelector
                                    key={index}
                                    strokeStyle={strokeStyle}
                                    strokeStyleProp={sw}
                                    onClick={() => setStrokeStyle(sw)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

const StrokeWidthSelector = ({ strokeWidth, strokeWidthProp, onClick }: { strokeWidth: StrokeWidth, strokeWidthProp: StrokeWidth, onClick?: () => void }) => {
    return (
        <label className={cn("active flex justify-center items-center w-8 h-8 p-0 box-border border border-default-border-color rounded-lg cursor-pointer bg-light-btn-bg2 text-text-primary-color dark:bg-w-button-hover-bg dark:hover:bg-tool-btn-bg-hover-dark dark:text-text-primary-color dark:border-w-button-hover-bg focus-within:shadow-shadow-tool-focus",
            strokeWidth === strokeWidthProp ? 'bg-selected-tool-bg-light dark:bg-selected-tool-bg-dark dark:border-selected-tool-bg-dark' : ''
        )}
            title={strokeWidthProp === 1 ? 'Thin' : strokeWidthProp === 2 ? 'Bold' : 'Extra bold'}
            onClick={onClick}
        >
            <Input type="radio" checked={strokeWidth === strokeWidthProp} onChange={() => onClick?.()} name="strokeWidth" className="opacity-0 absolute pointer-events-none" />
            <div
                style={{ height: `${strokeWidthProp * 2}px` }}
                className="w-4 rounded-[10px] bg-color-on-primary-container dark:bg-icon-fill-color-d"
            />
        </label>
    )
}

const EdgeStyleSelector = ({ strokeEdge, strokeEdgeProp, onClick }: { strokeEdge: StrokeEdge, strokeEdgeProp: StrokeEdge, onClick?: () => void }) => {
    return (
        <label className={cn("active flex justify-center items-center w-8 h-8 p-0 box-border border border-default-border-color rounded-lg cursor-pointer bg-light-btn-bg2 text-text-primary-color dark:bg-w-button-hover-bg dark:hover:bg-tool-btn-bg-hover-dark dark:text-text-primary-color dark:border-w-button-hover-bg focus-within:shadow-shadow-tool-focus",
            strokeEdge === strokeEdgeProp ? 'bg-selected-tool-bg-light dark:bg-selected-tool-bg-dark dark:border-selected-tool-bg-dark' : ''
        )}
            title={strokeEdgeProp === 'round' ? 'Round' : 'Sharp'}
            onClick={onClick}
        >
            <Input type="radio" checked={strokeEdge === strokeEdgeProp} onChange={() => onClick?.()} name="strokeWidth" className="opacity-0 absolute pointer-events-none" />
            {strokeEdgeProp === 'round' ? <RoundEdgeSvg /> : <SharpEdgeSvg />}
        </label>
    )
}

const StrokeStyleSelector = ({ strokeStyle, strokeStyleProp, onClick }: { strokeStyle: StrokeStyle, strokeStyleProp: StrokeStyle, onClick?: () => void }) => {
    return (
        <label className={cn("active flex justify-center items-center w-8 h-8 p-0 box-border border border-default-border-color rounded-lg cursor-pointer bg-light-btn-bg2 text-text-primary-color dark:bg-w-button-hover-bg dark:hover:bg-tool-btn-bg-hover-dark dark:text-text-primary-color dark:border-w-button-hover-bg focus-within:shadow-shadow-tool-focus",
            strokeStyle === strokeStyleProp ? 'bg-selected-tool-bg-light dark:bg-selected-tool-bg-dark dark:border-selected-tool-bg-dark' : ''
        )}
            title={strokeStyleProp === 'solid' ? 'Solid' : strokeStyle === 'dashed' ? 'Dashed' : 'Dotted'}
            onClick={onClick}
        >
            <Input type="radio" checked={strokeStyle === strokeStyleProp} onChange={() => onClick?.()} name="strokeWidth" className="opacity-0 absolute pointer-events-none" />
            {strokeStyleProp === 'solid' ? <SolidStrokeStyleIcon /> : strokeStyleProp === 'dashed' ? <DashedStrokeStyleIcon /> : <DottedStrokeStyleIcon />}
        </label>
    )
}

function SharpEdgeSvg() {
    return (
        <svg aria-hidden="true" focusable="false" role="img" viewBox="0 0 20 20" className="w-4 h-4 text-color-on-primary-container dark:text-icon-fill-color-d" fill="none" stroke="currentColor" strokeLinecap="round"
            strokeLinejoin="round">
            <svg strokeWidth="1.5">
                <path d="M3.33334 9.99998V6.66665C3.33334 6.04326 3.33403 4.9332 3.33539 3.33646C4.95233 3.33436 6.06276 3.33331 6.66668 3.33331H10"></path>
                <path d="M13.3333 3.33331V3.34331"></path>
                <path d="M16.6667 3.33331V3.34331"></path>
                <path d="M16.6667 6.66669V6.67669"></path>
                <path d="M16.6667 10V10.01"></path>
                <path d="M3.33334 13.3333V13.3433"></path>
                <path d="M16.6667 13.3333V13.3433"></path>
                <path d="M3.33334 16.6667V16.6767"></path>
                <path d="M6.66666 16.6667V16.6767"></path>
                <path d="M10 16.6667V16.6767"></path>
                <path d="M13.3333 16.6667V16.6767"></path>
                <path d="M16.6667 16.6667V16.6767"></path>
            </svg>
        </svg>
    )
}

function RoundEdgeSvg() {
    return (
        <svg aria-hidden="true" focusable="false" role="img" viewBox="0 0 24 24" className="w-4 h-4 text-color-on-primary-container dark:text-icon-fill-color-d" fill="none" strokeWidth="2"
            stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <g strokeWidth="1.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M4 12v-4a4 4 0 0 1 4 -4h4"></path>
                <line x1="16" y1="4" x2="16" y2="4.01"></line>
                <line x1="20" y1="4" x2="20" y2="4.01"></line>
                <line x1="20" y1="8" x2="20" y2="8.01"></line>
                <line x1="20" y1="12" x2="20" y2="12.01"></line>
                <line x1="4" y1="16" x2="4" y2="16.01"></line>
                <line x1="20" y1="16" x2="20" y2="16.01"></line>
                <line x1="4" y1="20" x2="4" y2="20.01"></line>
                <line x1="8" y1="20" x2="8" y2="20.01"></line>
                <line x1="12" y1="20" x2="12" y2="20.01"></line>
                <line x1="16" y1="20" x2="16" y2="20.01"></line>
                <line x1="20" y1="20" x2="20" y2="20.01"></line>
            </g>
        </svg>
    )
}

function SolidStrokeStyleIcon() {
    return (
        <svg aria-hidden="true" focusable="false" role="img" viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.167 10h11.666" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
    )
}

function DashedStrokeStyleIcon() {
    return (
        <svg aria-hidden="true" focusable="false" role="img" viewBox="0 0 24 24" className="w-4 h-4" fill="none" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <g strokeWidth="2">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M5 12h2"></path>
                <path d="M17 12h2"></path>
                <path d="M11 12h2"></path>
            </g>
        </svg>
    )
}

function DottedStrokeStyleIcon() {
    return (
        <svg aria-hidden="true" focusable="false" role="img" viewBox="0 0 24 24" className="w-4 h-4" fill="none" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <g strokeWidth="2">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M4 12v.01"></path>
                <path d="M8 12v.01"></path>
                <path d="M12 12v.01"></path>
                <path d="M16 12v.01"></path>
                <path d="M20 12v.01"></path>
            </g>
        </svg>
    )
}