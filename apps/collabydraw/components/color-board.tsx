"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Check, Edit, Paintbrush } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { BgFill, StrokeFill } from "@/types/canvas"
import { Separator } from "./ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

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
    }

    const handleBgFillInputSubmit = () => {
        const isValidHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(bgFillInputValue)

        if (isValidHex) {
            setBgFill(bgFillInputValue as BgFill)
        } else {
            setBgFillInputValue(bgFill)
        }
    }

    const handleStrokeFillKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleStrokeFillInputSubmit()
        } else if (e.key === "Escape") {
            setStrokeFillInputValue(strokeFill)
        }
    }

    const handleBgFillKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleBgFillInputSubmit()
        } else if (e.key === "Escape") {
            setBgFillInputValue(bgFill)
        }
    }

    return (
        <div className="">
            {/* Color swatches for shape stroke & bg */}
            {mode === 'Shape' && (
                <>
                    {/* Stroke Fill Section */}
                    <div className="">
                        <ItemLabel label="Stroke" />
                        <div className="">
                            <div className="color-picker-container grid grid-cols-[1fr_20px_1.625rem] py-1 px-0 items-center">
                                <div className="flex items-center justify-between">
                                    {strokeFills.map((color) => (
                                        <button
                                            key={color}
                                            className={cn(
                                                "w-[1.35rem] h-[1.35rem] rounded-md border transition-all hover:scale-110 focus:outline-none color-picker__button",
                                                color === strokeFill && "active",
                                            )}
                                            style={{ backgroundColor: color }}
                                            onClick={() => handleStrokeFillColorChange(color)}
                                            aria-label={`Select stroke color ${color}`}
                                        >
                                            {color === strokeFill && (
                                                <Check className={cn("h-4 w-4 mx-auto")} />
                                            )}
                                            <div className="color-picker__button-outline"></div>
                                        </button>
                                    ))}
                                </div>
                                <Separator orientation="vertical" className="bg-default-border-color mx-auto" />
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button
                                            className={cn(
                                                "w-[1.625rem] h-[1.625rem] rounded-md border transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring left-5 -top-5",
                                                "ring-2 ring-ring ring-offset-2 ring-offset-background",
                                            )}
                                            style={{ backgroundColor: strokeFill }}
                                            aria-label={`Selected background color ${strokeFill}`}
                                        >
                                            <Check className={cn("h-4 w-4 mx-auto")} />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        side="right"
                                        align="start"
                                        className="left-5 -top-5 bg-background dark:bg-w-bg rounded-lg transition-transform duration-300 ease-in-out md:z-30 Island"
                                    >
                                        <PopoverArrow />
                                        <div className="w-[200px]">
                                            <ItemLabel label="Hex code" />
                                            <div className="grid grid-cols-[auto_1fr_auto_auto] gap-2 items-center border border-[var(--color-primary-darkest)] dark:border-default-border-color rounded-lg px-3 py-0 m-2">
                                                <div className="py-0 px-1">#</div>
                                                <Input
                                                    type="text"
                                                    className="w-full m-0 text-[0.875rem] bg-transparent text-text-primary-color border-0 outline-none !ring-0 shadow-none h-8 tracking-[0.4px] p-0 appearance-none"
                                                    value={strokeFillInputValue.replace("#", "")}
                                                    onChange={handleStrokeFillInputChange}
                                                    onBlur={handleStrokeFillInputSubmit}
                                                    onKeyDown={handleStrokeFillKeyDown}
                                                    maxLength={7}
                                                    autoFocus
                                                />
                                                <Separator orientation="vertical" className="bg-default-border-color mx-auto" />
                                                <button className="w-5 h-5 cursor-pointer p-1 -mr-1 -ml-0.5 rounded-md text-icon-fill-color flex items-center justify-center">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>

                    {/* Background Fill Section */}
                    <div className="">
                        <ItemLabel label="Background" />
                        <div className="relative">
                            <div className="color-picker-container grid grid-cols-[1fr_20px_1.625rem] py-1 px-0 items-center">
                                <div className="flex items-center justify-between">
                                    {bgFills.map((color) => (
                                        <button
                                            key={color}
                                            className={cn(
                                                "w-[1.35rem] h-[1.35rem] rounded-md border transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring color-picker__button",
                                                color === bgFill && "ring-2 ring-ring ring-offset-2 ring-offset-background active",
                                            )}
                                            style={{ backgroundColor: color }}
                                            onClick={() => handleBgFillColorChange(color)}
                                            aria-label={`Select background color ${color}`}
                                        >
                                            {color === bgFill && (
                                                <Check className={cn("h-4 w-4 mx-auto")} />
                                            )}
                                            <div className="color-picker__button-outline"></div>
                                        </button>
                                    ))}
                                </div>
                                <Separator orientation="vertical" className="bg-default-border-color mx-auto" />
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button
                                            className={cn(
                                                "w-[1.625rem] h-[1.625rem] rounded-md border transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring",
                                                "ring-2 ring-ring ring-offset-2 ring-offset-background",
                                            )}
                                            style={{ backgroundColor: bgFill }}
                                            aria-label={`Selected background color ${bgFill}`}
                                        >
                                            <Check className={cn("h-4 w-4 mx-auto")} />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        side="right"
                                        align="start"
                                        className="w-auto p-4 bg-background dark:bg-w-bg rounded-lg shadow-md border border-default-border-color"
                                    >
                                        <div className="w-[200px]">
                                            <ItemLabel label="Hex code" />
                                            <div className="grid grid-cols-[auto_1fr_auto_auto] gap-2 items-center border border-default-border-color rounded-lg px-3 py-0 mt-1">
                                                <div className="py-0 px-1">#</div>
                                                <Input
                                                    type="text"
                                                    className="w-full m-0 text-[0.875rem] bg-transparent text-text-primary-color border-0 outline-none h-8 tracking-[0.4px] p-0 appearance-none"
                                                    value={bgFillInputValue.replace("#", "")}
                                                    onChange={handleBgFillInputChange}
                                                    onBlur={handleBgFillInputSubmit}
                                                    onKeyDown={handleBgFillKeyDown}
                                                    maxLength={7}
                                                    autoFocus
                                                />
                                                <Separator orientation="vertical" className="bg-default-border-color mx-auto" />
                                                <button className="w-5 h-5 cursor-pointer p-1 -mr-1 -ml-0.5 rounded-md text-icon-fill-color">
                                                    <Paintbrush className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

// const StrokeFillIndicator = ({ color, onClick }: { color: StrokeFill; onClick?: () => void; }) => {
//     return (
//         <button
//             key={color}
//             className={cn(
//                 "w-[1.625rem] h-[1.625rem] rounded-md border transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring",
//                 "ring-2 ring-ring ring-offset-2 ring-offset-background",
//             )}
//             style={{ backgroundColor: color }}
//             onClick={onClick}
//             aria-label={`Selected stroke color ${color}`}
//         >
//             <Check className={cn("h-4 w-4 mx-auto")} />
//         </button>
//     )
// }

// const BGFillIndicator = ({ color, onClick }: { color: BgFill; onClick?: () => void; }) => {
//     return (
//         <button
//             key={color}
//             className={cn(
//                 "w-[1.625rem] h-[1.625rem] rounded-md border transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring",
//                 "ring-2 ring-ring ring-offset-2 ring-offset-background",
//             )}
//             style={{ backgroundColor: color }}
//             onClick={onClick}
//             aria-label={`Selected background color ${color}`}
//         >
//             <Check className={cn("h-4 w-4 mx-auto")} />
//         </button>
//     )
// }

const ItemLabel = ({ label }: { label: string }) => {
    return (
        <h3 className="m-0 mb-1 text-sm font-normal text-text-primary-color dark:text-w-text">
            {label}
        </h3>
    );
};

const PopoverArrow = () => {
    return (
        <span className="absolute left-0 origin-[0px 0px] -transform translate-y-1/2 rotate-90 -translate-x-1/2 top-6">
            <svg className="fill-white drop-shadow-md" width="20" height="10" viewBox="0 0 30 10" preserveAspectRatio="none">
                <polygon points="0,0 30,0 15,10"></polygon>
            </svg>
        </span>
    )
}