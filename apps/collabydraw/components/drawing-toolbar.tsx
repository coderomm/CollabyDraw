import type React from "react"
import { cn } from "@/lib/utils"

export function DrawingToolbar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "flex h-16 items-center border-b border-border/40 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60",
                className,
            )}
            {...props}
        />
    )
}

