"use client"

import type React from "react"

import { useState, useEffect, SetStateAction, Dispatch } from "react"
import { Check, Edit } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { BgFill, StrokeFill, ToolType } from "@/types/canvas"
import { Separator } from "./ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import ItemLabel from "./ItemLabel"

interface ColorBoardProps {
    mode: "Shape" | "CanvasSheet"
    strokeFill: StrokeFill;
    setStrokeFill: (React.Dispatch<React.SetStateAction<StrokeFill>>);
    bgFill: BgFill;
    setBgFill: React.Dispatch<React.SetStateAction<BgFill>>;
    activeTool?: ToolType;
}

export function ColorBoard({
    mode,
    strokeFill,
    setStrokeFill,
    bgFill,
    setBgFill,
    activeTool
}: ColorBoardProps) {
    const strokeFills: StrokeFill[] = ["#1971c2", "#1e1e1e", "#2f9e44", "#e03131", "#f08c00"];
    const bgFills: BgFill[] = ["#00000000", "#a5d8ff", "#b2f2bb", "#ffc9c9", "#ffec99"];

    return (
        <div className="flex flex-col gap-y-3">
            {mode === 'Shape' && (
                <>
                    <div className="Stroke-Color-Picker">
                        <ItemLabel label="Stroke" />
                        <div className="">
                            <div className="color-picker-container grid grid-cols-[1fr_1.5rem_2.5rem] md:grid-cols-[1fr_20px_1.625rem] max-w-[17rem] md:max-w-80 py-1 px-0 items-center">
                                <div className="flex items-center justify-between">
                                    {strokeFills.map((color) => (
                                        <ColorPickerButton
                                            key={color}
                                            color={color}
                                            isSelected={color === strokeFill}
                                            onClick={() => setStrokeFill(color)}
                                        />
                                    ))}
                                </div>
                                <Separator orientation="vertical" className="bg-default-border-color dark:bg-w-button-hover-bg h-4 mx-auto" />
                                <ColorPopover selectedColor={strokeFill} setColor={setStrokeFill} />
                            </div>
                        </div>
                    </div>
                    {!(activeTool === 'arrow' || activeTool === 'line' || activeTool === 'text') && (
                        <div className="Background-Color-Picker">
                            <ItemLabel label="Background" />
                            <div className="relative">
                                <div className="color-picker-container grid grid-cols-[1fr_1.5rem_2.5rem] md:grid-cols-[1fr_20px_1.625rem] max-w-[17rem] md:max-w-80 py-1 px-0 items-center">
                                    <div className="flex items-center justify-between">
                                        {bgFills.map((color) => (
                                            <ColorPickerButton
                                                key={color}
                                                color={color}
                                                isSelected={color === bgFill}
                                                onClick={() => setBgFill(color)}
                                            />
                                        ))}
                                    </div>
                                    <Separator orientation="vertical" className="bg-default-border-color dark:bg-w-button-hover-bg h-4 mx-auto" />
                                    <ColorPopover selectedColor={bgFill} setColor={setBgFill} />
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

function ColorPickerButton({ color, isSelected, onClick }: { color: string; isSelected: boolean; onClick: () => void; }) {
    return (
        <button
            className={cn(
                "color-picker__button w-[1.35rem] h-[1.35rem] rounded-md border ring-0 transition-all hover:scale-110 focus:outline-none",
                isSelected && "active",
                color === "#00000000" ? "is-transparent" : ""
            )}
            style={color !== "#00000000" ? { backgroundColor: color } : {}}
            onClick={onClick}
            aria-label={`Select color ${color}`}
            title={`Select color ${color}`}
        >
            {isSelected && <Check className="h-4 w-4 mx-auto" />}
            < div className="color-picker__button-outline" ></div >
        </button >
    );
};

interface ColorPopoverProps<T extends string> {
    selectedColor: T;
    setColor: Dispatch<SetStateAction<T>>;
}

function ColorPopover<T extends string>({
    selectedColor,
    setColor,
}: ColorPopoverProps<T>) {
    const [inputValue, setInputValue] = useState(selectedColor);

    useEffect(() => {
        setInputValue(selectedColor);
    }, [selectedColor]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`;
        setInputValue(newValue as T);
    };

    const handleInputSubmit = () => {
        const isValidHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(inputValue);
        if (isValidHex) {
            setColor(inputValue);
        } else {
            setInputValue(selectedColor);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleInputSubmit();
        else if (e.key === "Escape") setInputValue(selectedColor);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    className={cn("color-picker__button active-color w-[1.625rem] h-[1.625rem] rounded-md border transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring ring-2 ring-ring ring-offset-2 ring-offset-background",
                        selectedColor === "#00000000" ? "is-transparent" : ""
                    )}
                    style={{ backgroundColor: selectedColor }}
                    aria-label={`Selected color ${selectedColor}`}
                >
                    <Check className="h-4 w-4 mx-auto" />
                </button>
            </PopoverTrigger>
            <PopoverContent side="right" align="start" className="!left-5 absolute w-auto bg-background dark:bg-w-bg rounded-lg transition-transform duration-300 ease-in-out md:z-30 Island">
                <PopoverArrow />
                <div className="w-[200px]">
                    <ItemLabel label="Hex code" />
                    <div className="group grid grid-cols-[auto_1fr_auto_auto] gap-2 items-center border border-default-border-color focus-within:shadow-outline-primary-darkest dark:border-default-border-color-dark dark:focus-within:shadow-outline-primary-light-darker rounded-lg px-3 py-0 m-2">
                        <span>#</span>
                        <Input
                            type="text"
                            className="w-full m-0 text-[0.875rem] bg-transparent text-text-primary-color dark:text-w-text border-0 outline-none !ring-0 shadow-none h-8 tracking-[0.4px] p-0 appearance-none"
                            value={inputValue.replace("#", "")}
                            onChange={handleInputChange}
                            onBlur={handleInputSubmit}
                            onKeyDown={handleKeyDown}
                            maxLength={7}
                        />
                        <Separator orientation="vertical" className="bg-default-border-color mx-auto py-1" />
                        <button className="w-5 h-5 cursor-pointer p-1 flex items-center justify-center rounded-md text-icon-fill-color dark:text-[var(--RadioGroup-choice-color-on)] dark:bg-[var(--RadioGroup-choice-background-on)] dark:hover:bg-[var(--RadioGroup-choice-background-on-hover)] transition-all duration-75 ease-out">
                            <Edit className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

function PopoverArrow() {
    return (
        <span className="popover-tooltip-arrow-pointer" >
            <svg className="fill-white dark:fill-w-bg drop-shadow-md" width="20" height="10" viewBox="0 0 30 10" preserveAspectRatio="none">
                <polygon points="0,0 30,0 15,10"></polygon>
            </svg>
        </span>
    )
}