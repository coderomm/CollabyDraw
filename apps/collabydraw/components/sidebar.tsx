"use client"

import type React from "react"

import { useEffect, useState } from "react"
import {
    Command,
    Search,
    HelpCircle,
    RefreshCw,
    Github,
    Twitter,
    MessageSquare,
    UserPlus,
    Sun,
    Moon,
    Monitor,
    X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ColorPicker } from "@/components/color-picker"
import { ConfirmDialog } from "./confirm-dialog"
import { clearCanvas } from "@/actions/canvas"
import { cn } from "@/lib/utils"

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
    canvasColor: string
    setCanvasColor: (color: string) => void
}

export function Sidebar({ isOpen, onClose, canvasColor, setCanvasColor }: SidebarProps) {
    const [clearDialogOpen, setClearDialogOpen] = useState(false)

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            if (isOpen && !target.closest("[data-sidebar]") && !target.closest("[data-sidebar-trigger]")) {
                onClose()
            }
        }

        document.addEventListener("mousedown", handleOutsideClick)
        return () => document.removeEventListener("mousedown", handleOutsideClick)
    }, [isOpen, onClose])

    // Prevent scrolling when sidebar is open on mobile
    useEffect(() => {
        if (isOpen && window.innerWidth < 768) {
            document.body.classList.add("overflow-hidden")
        } else {
            document.body.classList.remove("overflow-hidden")
        }
        return () => document.body.classList.remove("overflow-hidden")
    }, [isOpen])

    return (
        <>
            {/* Backdrop for mobile */}
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity md:hidden",
                    isOpen ? "opacity-100" : "pointer-events-none opacity-0",
                )}
                aria-hidden="true"
            />

            {/* Clear Canvas Confirmation Dialog */}
            <ConfirmDialog
                open={clearDialogOpen}
                onOpenChange={setClearDialogOpen}
                title="Clear canvas"
                description="This will clear the whole canvas. Are you sure?"
                onConfirm={clearCanvas}
                variant="destructive"
            />

            {/* Sidebar */}
            <aside
                data-sidebar
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-72 border-r bg-w-bg transition-transform duration-300 ease-in-out md:z-30",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Close button - mobile only */}
                    <Button variant="ghost" size="icon" className="absolute right-4 top-4 md:hidden" onClick={onClose}>
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close sidebar</span>
                    </Button>

                    {/* Menu items */}
                    <div className="flex-1 overflow-auto py-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#343a40] hover:scrollbar-thumb-[#495057] dark:scrollbar-thumb-muted-foreground/20 dark:hover:scrollbar-thumb-muted-foreground/30">
                        <nav className="grid gap-1 px-2">
                            <SidebarItem icon={Command} label="Command palette" shortcut="Ctrl+/" />
                            <SidebarItem icon={Search} label="Find on canvas" shortcut="Ctrl+F" />
                            <SidebarItem icon={HelpCircle} label="Help" shortcut="?" />
                            <SidebarItem icon={RefreshCw} label="Clear canvas" onClick={() => setClearDialogOpen(true)} />

                            <Separator className="my-4" />

                            <SidebarItem icon={Command} label="Excalidraw+" />
                            <SidebarItem icon={Github} label="GitHub" />
                            <SidebarItem icon={Twitter} label="Follow us" />
                            <SidebarItem icon={MessageSquare} label="Discord chat" />
                            <SidebarItem icon={UserPlus} label="Sign up" className="text-color-promo hover:text-color-promo font-bold" />
                        </nav>
                    </div>

                    {/* Theme and color picker */}
                    <div className="border-t p-4">
                        <div className="mb-4 w-full flex items-center justify-between gap-x-2">
                            <h3 className="mb-2 text-sm font-medium text-w-text flex items-center w-full text-ellipsis overflow-hidden whitespace-nowrap">Theme</h3>
                            <div className="flex gap-1 box-border flex-row items-start p-[3px] rounded-[10px] bg-[var(--RadioGroup-background)] border border-[var(--RadioGroup-border)]">
                                <Button variant="outline" size="icon" className="text-[var(--RadioGroup-choice-color-off)] bg-[var(--RadioGroup-choice-background-off)] hover:text-[var(--RadioGroup-choice-color-off-hover)] hover:bg-transparent border-none rounded-lg flex items-center justify-center w-8 h-6 select-none tracking-wide transition-all duration-75 ease-out">
                                    <Sun className="h-4 w-4" />
                                    <span className="sr-only">Light mode</span>
                                </Button>
                                <Button variant="outline" size="icon" className="text-[var(--RadioGroup-choice-color-on)] bg-[var(--RadioGroup-choice-background-on)] hover:bg-[var(--RadioGroup-choice-background-on-hover)] border-none rounded-lg flex items-center justify-center w-8 h-6 select-none tracking-wide transition-all duration-75 ease-out">
                                    <Moon className="h-4 w-4" />
                                    <span className="sr-only">Dark mode</span>
                                </Button>
                                <Button variant="outline" size="icon" className="text-[var(--RadioGroup-choice-color-off)] bg-[var(--RadioGroup-choice-background-off)] hover:text-[var(--RadioGroup-choice-color-off-hover)] hover:bg-transparent border-none rounded-lg flex items-center justify-center w-8 h-6 select-none tracking-wide transition-all duration-75 ease-out">
                                    <Monitor className="h-4 w-4" />
                                    <span className="sr-only">System mode</span>
                                </Button>
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-2 text-sm font-medium text-w-text">Canvas background</h3>
                            <ColorPicker value={canvasColor} onChange={setCanvasColor} />
                        </div>
                    </div>
                </div>
            </aside>
        </>
    )
}

interface SidebarItemProps {
    icon: React.ElementType
    label: string
    shortcut?: string
    className?: string
    onClick?: () => void
}

function SidebarItem({ icon: Icon, label, shortcut, className, onClick }: SidebarItemProps) {
    return (
        <Button
            variant="ghost"
            className={cn(
                "flex h-10 w-full justify-start gap-2 rounded-md px-3 text-sm font-medium transition-colors text-w-text hover:text-w-text hover:bg-w-button-hover-bg",
                className,
            )}
            onClick={onClick}
        >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
            {shortcut && (
                <kbd className="ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    {shortcut}
                </kbd>
            )}
        </Button>
    )
}