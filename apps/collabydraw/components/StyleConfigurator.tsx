"use client"

import type React from "react"
import { cn } from "@/lib/utils";
import { BgFill, FillStyle, FontFamily, FontSize, RoughStyle, StrokeEdge, StrokeFill, StrokeStyle, StrokeWidth, TextAlign, ToolType } from "@/types/canvas"
import { fillStyleIcons, fillStyleLabels, fontFamilyIcons, fontFamilyLabels, fontSizeIcons, fontSizeLabels, roughStyleIcons, roughStyleLabels, strokeEdgeIcons, strokeEdgeLabels, strokeStyleIcons, strokeStyleLabels, textAlignIcons, textAlignLabels } from "@/config/canvasTypeMappings";
import { Input } from "./ui/input";
import { ColorBoard } from "./color-board"
import ItemLabel from "./ItemLabel";

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
    fontFamily: FontFamily;
    setFontFamily: React.Dispatch<React.SetStateAction<FontFamily>>;
    fontSize: FontSize;
    setFontSize: React.Dispatch<React.SetStateAction<FontSize>>;
    textAlign: TextAlign;
    setTextAlign: React.Dispatch<React.SetStateAction<TextAlign>>;
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
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
    textAlign,
    setTextAlign,
    isMobile
}: StyleConfiguratorProps) {

    const lineThicknessOptions: StrokeWidth[] = [1, 2, 4]
    const edgeRoundnessOptions: StrokeEdge[] = ["sharp", "round"]
    const edgeStyleOptions: StrokeStyle[] = ["solid", "dashed", "dotted"]
    const roughStyleOptions: RoughStyle[] = [0, 1, 2]
    const fillStyleOptions: FillStyle[] = ['hachure', 'cross-hatch', 'dashed', 'dots', 'zigzag', 'zigzag-line', 'solid']
    const fontFamilyOptions: FontFamily[] = ['hand-drawn', 'normal', 'code']
    const fontSizeOptions: FontSize[] = ['Small', 'Medium', 'Large']
    const textAlignOptions: TextAlign[] = ['left', 'center', 'right']

    if (activeTool === "eraser" || activeTool === "grab" || activeTool === "selection") {
        return;
    }
    return (
        <>
            <section className={cn("StyleConfigurator p-3 overflow-y-auto overflow-x-hidden custom-scrollbar transition-transform duration-300 ease-in-out z-10 mt-2",
                isMobile ? "" : "absolute top-full w-56 h-[calc(100vh-150px)] bg-background dark:bg-w-bg rounded-lg Island"
            )}>
                <h2 className="sr-only">Selected shape actions</h2>
                <div className="ColorBoard flex flex-col gap-y-3">
                    <ColorBoard
                        mode="Shape"
                        bgFill={bgFill}
                        setBgFill={setBgFill}
                        strokeFill={strokeFill}
                        setStrokeFill={setStrokeFill}
                        activeTool={activeTool}
                    />

                    {(activeTool === "rectangle" || activeTool === 'ellipse' || activeTool === "diamond" || activeTool === 'line' || activeTool === 'free-draw') && (
                        <div className="Fill-Style-Selector">
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

                    {(activeTool !== "text") && (
                        <div className="Stroke-Width-Selector">
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
                    )}

                    {(activeTool === "rectangle" || activeTool === "diamond") && (
                        <div className="Edge-Style-Selector">
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

                    {(activeTool !== "free-draw" && activeTool !== 'text') && (
                        <>
                            <div className="Rough-Style-Selector">
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
                        </>
                    )}
                    {(activeTool !== 'text') && (
                        <>
                            <div className="Stroke-Style-Selector">
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
                        </>
                    )}

                    {(activeTool === "text") && (
                        <>
                            <div className="Font-Family-Selector">
                                <ItemLabel label="Font family" />
                                <div className="flex flex-wrap gap-x-2 gap-y-2 items-center py-1">
                                    {fontFamilyOptions.map((ff, index) => (
                                        <FontFamilySelector
                                            key={index}
                                            fontFamily={fontFamily}
                                            fontFamilyProp={ff}
                                            onClick={() => setFontFamily(ff)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="Font-Size-Selector">
                                <ItemLabel label="Font size" />
                                <div className="flex flex-wrap gap-x-2 gap-y-2 items-center py-1">
                                    {fontSizeOptions.map((fs, index) => (
                                        <FontSizeSelector
                                            key={index}
                                            fontSize={fontSize}
                                            fontSizeProp={fs}
                                            onClick={() => setFontSize(fs)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="Text-Align-Selector">
                                <ItemLabel label="Text align" />
                                <div className="flex flex-wrap gap-x-2 gap-y-2 items-center py-1">
                                    {textAlignOptions.map((a, index) => (
                                        <TextAlignSelector
                                            key={index}
                                            textAlign={textAlign}
                                            textAlignProp={a}
                                            onClick={() => setTextAlign(a)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </section >
        </>
    )
}

const TextAlignSelector = ({ textAlign, textAlignProp, onClick }: { textAlign: TextAlign, textAlignProp: TextAlign, onClick?: () => void }) => {
    return (
        <label className={cn("active flex justify-center items-center w-8 h-8 p-0 box-border border border-default-border-color rounded-lg cursor-pointer bg-light-btn-bg2 text-text-primary-color dark:bg-w-button-hover-bg dark:hover:bg-tool-btn-bg-hover-dark dark:text-text-primary-color dark:border-w-button-hover-bg focus-within:shadow-shadow-tool-focus",
            textAlign === textAlignProp ? 'bg-selected-tool-bg-light dark:bg-selected-tool-bg-dark dark:border-selected-tool-bg-dark' : ''
        )}
            title={textAlignLabels[textAlignProp]}
            onClick={onClick}
        >
            <Input type="radio" checked={textAlign === textAlignProp} onChange={() => onClick?.()} name="textAlign" className="opacity-0 absolute pointer-events-none" />
            {textAlignIcons[textAlignProp]}
        </label>
    )
}

const FontSizeSelector = ({ fontSize, fontSizeProp, onClick }: { fontSize: FontSize, fontSizeProp: FontSize, onClick?: () => void }) => {
    return (
        <label className={cn("active flex justify-center items-center w-8 h-8 p-0 box-border border border-default-border-color rounded-lg cursor-pointer bg-light-btn-bg2 text-text-primary-color dark:bg-w-button-hover-bg dark:hover:bg-tool-btn-bg-hover-dark dark:text-text-primary-color dark:border-w-button-hover-bg focus-within:shadow-shadow-tool-focus",
            fontSize === fontSizeProp ? 'bg-selected-tool-bg-light dark:bg-selected-tool-bg-dark dark:border-selected-tool-bg-dark' : ''
        )}
            title={fontSizeLabels[fontSizeProp]}
            onClick={onClick}
        >
            <Input type="radio" checked={fontSize === fontSizeProp} onChange={() => onClick?.()} name="fontSize" className="opacity-0 absolute pointer-events-none" />
            {fontSizeIcons[fontSizeProp]}
        </label>
    )
}

const FontFamilySelector = ({ fontFamily, fontFamilyProp, onClick }: { fontFamily: FontFamily, fontFamilyProp: FontFamily, onClick?: () => void }) => {
    return (
        <label className={cn("active flex justify-center items-center w-8 h-8 p-0 box-border border border-default-border-color rounded-lg cursor-pointer bg-light-btn-bg2 text-text-primary-color dark:bg-w-button-hover-bg dark:hover:bg-tool-btn-bg-hover-dark dark:text-text-primary-color dark:border-w-button-hover-bg focus-within:shadow-shadow-tool-focus",
            fontFamily === fontFamilyProp ? 'bg-selected-tool-bg-light dark:bg-selected-tool-bg-dark dark:border-selected-tool-bg-dark' : ''
        )}
            title={fontFamilyLabels[fontFamilyProp]}
            onClick={onClick}
        >
            <Input type="radio" checked={fontFamily === fontFamilyProp} onChange={() => onClick?.()} name="fontFamily" className="opacity-0 absolute pointer-events-none" />
            {fontFamilyIcons[fontFamilyProp]}
        </label>
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