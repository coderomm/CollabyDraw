"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { BgFill, StrokeFill } from "@/types/canvas"
import { Separator } from "./ui/separator"

interface ColorBoardProps {
    mode: "Shape" | "CanvasSheet"
    strokeFill: StrokeFill;
    setStrokeFill: React.Dispatch<React.SetStateAction<StrokeFill>>;
    bgFill: BgFill;
    setBgFill: React.Dispatch<React.SetStateAction<BgFill>>;
}

export function ColorBoard({
    mode,
    strokeFill,
    setStrokeFill,
    bgFill,
    setBgFill
}: ColorBoardProps) {
    const [isStrokeFillEditing, setIsStrokeFillEditing] = useState(false)
    const [isBgFillEditing, setIsBgFillEditing] = useState(false)
    const [strokeFillInputValue, setStrokeFillInputValue] = useState(strokeFill)
    const [bgFillInputValue, setBgFillInputValue] = useState(bgFill)

    const strokeFills: StrokeFill[] = ["#1971c2", "#1e1e1e", "#2f9e44", "#e03131", "#f08c00"];
    const bgFills: BgFill[] = ["#00000000", "#a5d8ff", "#b2f2bb", "#ffc9c9", "#ffec99"];

    useEffect(() => {
        setStrokeFillInputValue(strokeFill)
    }, [strokeFill])

    useEffect(() => {
        setBgFillInputValue(bgFill)
    }, [bgFill])

    const handleStrokeFillColorChange = (color: StrokeFill) => {
        setStrokeFill(color)
    }

    const handleBgFillColorChange = (color: BgFill) => {
        setBgFill(color)
    }

    const handleStrokeFillInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = e.target.value
        if (!newValue.startsWith("#")) {
            newValue = "#" + newValue
        }
        setStrokeFillInputValue(newValue as StrokeFill)
    }

    const handleBgFillInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = e.target.value
        if (!newValue.startsWith("#")) {
            newValue = "#" + newValue
        }
        setBgFillInputValue(newValue as BgFill)
    }

    const handleStrokeFillInputSubmit = () => {
        const isValidHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(strokeFillInputValue)

        if (isValidHex) {
            setStrokeFill(strokeFillInputValue as StrokeFill)
        } else {
            setStrokeFillInputValue(strokeFill)
        }

        setIsStrokeFillEditing(false)
    }

    const handleBgFillInputSubmit = () => {
        const isValidHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(bgFillInputValue)

        if (isValidHex) {
            setBgFill(bgFillInputValue as BgFill)
        } else {
            setBgFillInputValue(bgFill)
        }

        setIsBgFillEditing(false)
    }

    const handleStrokeFillKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleStrokeFillInputSubmit()
        } else if (e.key === "Escape") {
            setStrokeFillInputValue(strokeFill)
            setIsStrokeFillEditing(false)
        }
    }

    const handleBgFillKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleBgFillInputSubmit()
        } else if (e.key === "Escape") {
            setBgFillInputValue(bgFill)
            setIsBgFillEditing(false)
        }
    }

    return (
        <div className="space-y-3">
            {/* Color swatches for shape stroke & bg */}
            {mode === 'Shape' && (
                <>
                    {/* Stroke Fill Section */}
                    <div className="flex gap-2 h-7 items-center">
                        <div className="flex items-center justify-between">
                            {strokeFills.map((color) => (
                                <button
                                    key={color}
                                    className={cn(
                                        "h-8 w-8 rounded-md border transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring",
                                        color === strokeFill && "ring-2 ring-ring ring-offset-2 ring-offset-background",
                                    )}
                                    style={{ backgroundColor: color }}
                                    onClick={() => handleStrokeFillColorChange(color)}
                                    aria-label={`Select stroke color ${color}`}
                                >
                                    {color === strokeFill && (
                                        <Check className={cn("h-4 w-4 mx-auto")} />
                                    )}
                                </button>
                            ))}
                            <Separator orientation="vertical" className="bg-white/20 mx-2" />

                            <StrokeFillIndicator
                                color={strokeFill}
                                onClick={() => setIsStrokeFillEditing(true)}
                            />
                        </div>
                    </div>

                    {/* Background Fill Section */}
                    <div className="flex gap-2 h-7 items-center">
                        <div className="flex items-center justify-between">
                            {bgFills.map((color) => (
                                <button
                                    key={color}
                                    className={cn(
                                        "h-8 w-8 rounded-md border transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring",
                                        color === bgFill && "ring-2 ring-ring ring-offset-2 ring-offset-background",
                                    )}
                                    style={{ backgroundColor: color }}
                                    onClick={() => handleBgFillColorChange(color)}
                                    aria-label={`Select background color ${color}`}
                                >
                                    {color === bgFill && (
                                        <Check className={cn("h-4 w-4 mx-auto")} />
                                    )}
                                </button>
                            ))}
                            <Separator orientation="vertical" className="bg-white/20 mx-2" />

                            <BGFillIndicator
                                color={bgFill}
                                onClick={() => setIsBgFillEditing(true)}
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Hex input sections */}
            {mode === 'Shape' && (
                <>
                    {/* Stroke Fill Hex Input */}
                    <div className="rounded-lg border dark:bg-[#343a40] dark:hover:bg-[#495057] outline-none border-none p-2 mb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm dark:text-w-text">Stroke #</span>
                            {isStrokeFillEditing ? (
                                <div className="flex flex-1 items-center">
                                    <Input
                                        value={strokeFillInputValue.replace("#", "")}
                                        onChange={handleStrokeFillInputChange}
                                        onBlur={handleStrokeFillInputSubmit}
                                        onKeyDown={handleStrokeFillKeyDown}
                                        className="h-8 flex-1 bg-background"
                                        maxLength={7}
                                        autoFocus
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-1 items-center justify-between">
                                    <span className="text-sm font-mono dark:text-w-text">
                                        {strokeFill.replace("#", "")}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Background Fill Hex Input */}
                    <div className="rounded-lg border dark:bg-[#343a40] dark:hover:bg-[#495057] outline-none border-none p-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm dark:text-w-text">BG #</span>
                            {isBgFillEditing ? (
                                <div className="flex flex-1 items-center">
                                    <Input
                                        value={bgFillInputValue.replace("#", "")}
                                        onChange={handleBgFillInputChange}
                                        onBlur={handleBgFillInputSubmit}
                                        onKeyDown={handleBgFillKeyDown}
                                        className="h-8 flex-1 bg-background"
                                        maxLength={7}
                                        autoFocus
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-1 items-center justify-between">
                                    <span className="text-sm font-mono dark:text-w-text">
                                        {bgFill.replace("#", "")}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

const StrokeFillIndicator = ({ color, onClick }: { color: StrokeFill; onClick?: () => void; }) => {
    return (
        <button
            key={color}
            className={cn(
                "h-8 w-8 rounded-md border transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring",
                "ring-2 ring-ring ring-offset-2 ring-offset-background",
            )}
            style={{ backgroundColor: color }}
            onClick={onClick}
            aria-label={`Selected stroke color ${color}`}
        >
            <Check className={cn("h-4 w-4 mx-auto")} />
        </button>
    )
}

const BGFillIndicator = ({ color, onClick }: { color: BgFill; onClick?: () => void; }) => {
    return (
        <button
            key={color}
            className={cn(
                "h-8 w-8 rounded-md border transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring",
                "ring-2 ring-ring ring-offset-2 ring-offset-background",
            )}
            style={{ backgroundColor: color }}
            onClick={onClick}
            aria-label={`Selected background color ${color}`}
        >
            <Check className={cn("h-4 w-4 mx-auto")} />
        </button>
    )
}