"use client"

import type React from "react"
import { BgFill, FillStyle, RoughStyle, StrokeEdge, StrokeFill, StrokeStyle, StrokeWidth, ToolType } from "@/types/canvas"
import { ColorBoard } from "./color-board"
import ItemLabel from "./ItemLabel";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { fillStyleIcons, fillStyleLabels, roughStyleIcons, roughStyleLabels, strokeEdgeIcons, strokeEdgeLabels, strokeStyleIcons, strokeStyleLabels } from "@/config/canvasTypeMappings";

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
    roughStyle: RoughStyle;
    setRoughStyle: React.Dispatch<React.SetStateAction<RoughStyle>>;
    fillStyle: FillStyle;
    setFillStyle: React.Dispatch<React.SetStateAction<FillStyle>>;
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
    roughStyle,
    setRoughStyle,
    fillStyle,
    setFillStyle,
    isMobile
}: StyleConfiguratorProps) {

    const lineThicknessOptions: StrokeWidth[] = [1, 2, 4]
    const edgeRoundnessOptions: StrokeEdge[] = ["sharp", "round"]
    const edgeStyleOptions: StrokeStyle[] = ["solid", "dashed", "dotted"]
    const roughStyleOptions: RoughStyle[] = [0, 1, 2]
    const fillStyleOptions: FillStyle[] = ['hachure', 'cross-hatch', 'dashed', 'dots', 'zigzag', 'zigzag-line', 'solid']

    if (activeTool === "eraser" || activeTool === "grab" || activeTool === "selection") {
        return;
    }
    return (
        <>
            <section className={cn("StyleConfigurator p-3 overflow-y-auto overflow-x-hidden custom-scrollbar transition-transform duration-300 ease-in-out z-10 mt-2",
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

                    {(activeTool === "rectangle" || activeTool === "diamond" || activeTool === 'ellipse') && (
                        <div className="">
                            <ItemLabel label="Fill" />
                            <div className="flex flex-wrap gap-x-2 gap-y-2 items-center py-1">
                                {fillStyleOptions.map((fs, index) => (
                                    <FillStyleSelector
                                        key={index}
                                        fillStyle={fillStyle}
                                        fillStyleProp={fs}
                                        onClick={() => setFillStyle(fs)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

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
                        <ItemLabel label="Sloppiness" />
                        <div className="flex flex-wrap gap-x-2 gap-y-2 items-center py-1">
                            {roughStyleOptions.map((rs, index) => (
                                <RoughStyleSelector
                                    key={index}
                                    roughStyle={roughStyle}
                                    roughStyleProp={rs}
                                    onClick={() => setRoughStyle(rs)}
                                />
                            ))}
                        </div>
                    </div>

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

const FillStyleSelector = ({ fillStyle, fillStyleProp, onClick }: { fillStyle: FillStyle, fillStyleProp: FillStyle, onClick?: () => void }) => {
    return (
        <label className={cn("active flex justify-center items-center w-8 h-8 p-0 box-border border border-default-border-color rounded-lg cursor-pointer bg-light-btn-bg2 text-text-primary-color dark:bg-w-button-hover-bg dark:hover:bg-tool-btn-bg-hover-dark dark:text-text-primary-color dark:border-w-button-hover-bg focus-within:shadow-shadow-tool-focus",
            fillStyle === fillStyleProp ? 'bg-selected-tool-bg-light dark:bg-selected-tool-bg-dark dark:border-selected-tool-bg-dark' : ''
        )}
            title={fillStyleLabels[fillStyleProp] || "Unknown"}
            onClick={onClick}
        >
            <Input type="radio" checked={fillStyle === fillStyleProp} onChange={() => onClick?.()} name="strokeWidth" className="opacity-0 absolute pointer-events-none" />
            {fillStyleIcons[fillStyleProp]}
        </label>
    )
}

const EdgeStyleSelector = ({ strokeEdge, strokeEdgeProp, onClick }: { strokeEdge: StrokeEdge, strokeEdgeProp: StrokeEdge, onClick?: () => void }) => {
    return (
        <label className={cn("active flex justify-center items-center w-8 h-8 p-0 box-border border border-default-border-color rounded-lg cursor-pointer bg-light-btn-bg2 text-text-primary-color dark:bg-w-button-hover-bg dark:hover:bg-tool-btn-bg-hover-dark dark:text-text-primary-color dark:border-w-button-hover-bg focus-within:shadow-shadow-tool-focus",
            strokeEdge === strokeEdgeProp ? 'bg-selected-tool-bg-light dark:bg-selected-tool-bg-dark dark:border-selected-tool-bg-dark' : ''
        )}
            title={strokeEdgeLabels[strokeEdgeProp]}
            onClick={onClick}
        >
            <Input type="radio" checked={strokeEdge === strokeEdgeProp} onChange={() => onClick?.()} name="strokeWidth" className="opacity-0 absolute pointer-events-none" />
            {strokeEdgeIcons[strokeEdgeProp]}
        </label>
    )
}

const RoughStyleSelector = ({ roughStyle, roughStyleProp, onClick }: { roughStyle: RoughStyle, roughStyleProp: RoughStyle, onClick?: () => void }) => {
    return (
        <label className={cn("active flex justify-center items-center w-8 h-8 p-0 box-border border border-default-border-color rounded-lg cursor-pointer bg-light-btn-bg2 text-text-primary-color dark:bg-w-button-hover-bg dark:hover:bg-tool-btn-bg-hover-dark dark:text-text-primary-color dark:border-w-button-hover-bg focus-within:shadow-shadow-tool-focus",
            roughStyle === roughStyleProp ? 'bg-selected-tool-bg-light dark:bg-selected-tool-bg-dark dark:border-selected-tool-bg-dark' : ''
        )}
            title={roughStyleLabels[roughStyleProp]}
            onClick={onClick}
        >
            <Input type="radio" checked={roughStyle === roughStyleProp} onChange={() => onClick?.()} name="roughStyle" className="opacity-0 absolute pointer-events-none" />
            {roughStyleIcons[roughStyleProp]}
        </label>
    )
}

const StrokeStyleSelector = ({ strokeStyle, strokeStyleProp, onClick }: { strokeStyle: StrokeStyle, strokeStyleProp: StrokeStyle, onClick?: () => void }) => {
    return (
        <label className={cn("active flex justify-center items-center w-8 h-8 p-0 box-border border border-default-border-color rounded-lg cursor-pointer bg-light-btn-bg2 text-text-primary-color dark:bg-w-button-hover-bg dark:hover:bg-tool-btn-bg-hover-dark dark:text-text-primary-color dark:border-w-button-hover-bg focus-within:shadow-shadow-tool-focus",
            strokeStyle === strokeStyleProp ? 'bg-selected-tool-bg-light dark:bg-selected-tool-bg-dark dark:border-selected-tool-bg-dark' : ''
        )}
            title={strokeStyleLabels[strokeStyleProp]}
            onClick={onClick}
        >
            <Input type="radio" checked={strokeStyle === strokeStyleProp} onChange={() => onClick?.()} name="strokeWidth" className="opacity-0 absolute pointer-events-none" />
            {strokeStyleIcons[strokeStyleProp]}
        </label>
    )
}