"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Check, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { canvasBgLight } from "@/types/canvas"
import { useTheme } from "next-themes"

interface ColorPickerProps {
    value: string
    onChange: (color: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [inputValue, setInputValue] = useState(value)
    const { theme } = useTheme()
    const [canvasBg, setCanvasBg] = useState(canvasBgLight);

    useEffect(() => {
        setCanvasBg(canvasBgLight);
    }, [theme])

    useEffect(() => {
        setInputValue(value)
    }, [value])

    const handleColorChange = (color: string) => {
        onChange(color)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = e.target.value
        if (!newValue.startsWith("#")) {
            newValue = "#" + newValue
        }
        setInputValue(newValue)
    }

    const handleInputSubmit = () => {
        const isValidHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(inputValue)

        if (isValidHex) {
            onChange(inputValue)
        } else {
            setInputValue(value)
        }

        setIsEditing(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleInputSubmit()
        } else if (e.key === "Escape") {
            setInputValue(value)
            setIsEditing(false)
        }
    }

    return (
        <div className="space-y-3">
            {/* Color swatches ` */}
            <div className="flex items-center justify-between">
                {canvasBg.map((color) => (
                    <button
                        key={color}
                        className={cn(
                            "canvas-bg-color-item h-8 w-8 rounded-md border transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring",
                            color === value && "ring-2 ring-ring ring-offset-2 ring-offset-background",
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorChange(color)}
                        aria-label={`Select color ${color}`}
                    >
                        {color === value && (
                            <Check
                                className={cn(
                                    "h-4 w-4 mx-auto",
                                    color === "#ffffff" ? "text-black" : "text-white",
                                )}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Hex input */}
            <div className="rounded-lg border dark:bg-[#343a40] dark:hover:bg-[#495057] outline-none border-none p-2">
                <div className="flex items-center gap-2">
                    <span className="text-sm dark:text-w-text">#</span>
                    {isEditing ? (
                        <div className="flex flex-1 items-center">
                            <Input
                                value={inputValue.replace("#", "")}
                                onChange={handleInputChange}
                                onBlur={handleInputSubmit}
                                onKeyDown={handleKeyDown}
                                className="h-8 flex-1 bg-background"
                                maxLength={7}
                                autoFocus
                            />
                        </div>
                    ) : (
                        <div className="flex flex-1 items-center justify-between">
                            <span className="text-sm font-mono dark:text-w-text">{value.replace("#", "")}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="dark:text-[var(--RadioGroup-choice-color-on)] dark:bg-[var(--RadioGroup-choice-background-on)] dark:hover:bg-[var(--RadioGroup-choice-background-on-hover)] border-none rounded-lg flex items-center justify-center w-8 h-6 select-none tracking-wide transition-all duration-75 ease-out"
                                onClick={() => setIsEditing(true)}
                            >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit color</span>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}