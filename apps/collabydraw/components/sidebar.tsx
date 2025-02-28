"use client"

import type React from "react"

import { useEffect } from "react"
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
import { cn } from "@/lib/utils"

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
    canvasColor: string
    setCanvasColor: (color: string) => void
}

export function Sidebar({ isOpen, onClose, canvasColor, setCanvasColor }: SidebarProps) {
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

            {/* Sidebar */}
            <aside
                data-sidebar
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-72 border-r bg-background transition-transform duration-300 ease-in-out md:z-30",
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
                    <div className="flex-1 overflow-auto py-4">
                        <nav className="grid gap-1 px-2">
                            <SidebarItem icon={Command} label="Command palette" shortcut="Ctrl+/" />
                            <SidebarItem icon={Search} label="Find on canvas" shortcut="Ctrl+F" />
                            <SidebarItem icon={HelpCircle} label="Help" shortcut="?" />
                            <SidebarItem icon={RefreshCw} label="Reset the canvas" />

                            <Separator className="my-4" />

                            <SidebarItem icon={Command} label="Excalidraw+" />
                            <SidebarItem icon={Github} label="GitHub" />
                            <SidebarItem icon={Twitter} label="Follow us" />
                            <SidebarItem icon={MessageSquare} label="Discord chat" />
                            <SidebarItem icon={UserPlus} label="Sign up" className="text-primary" />
                        </nav>
                    </div>

                    {/* Theme and color picker */}
                    <div className="border-t p-4">
                        <div className="mb-4">
                            <h3 className="mb-2 text-sm font-medium">Theme</h3>
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                                    <Sun className="h-4 w-4" />
                                    <span className="sr-only">Light mode</span>
                                </Button>
                                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                                    <Moon className="h-4 w-4" />
                                    <span className="sr-only">Dark mode</span>
                                </Button>
                                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                                    <Monitor className="h-4 w-4" />
                                    <span className="sr-only">System mode</span>
                                </Button>
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-2 text-sm font-medium">Canvas background</h3>
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
                "flex h-10 w-full justify-start gap-2 rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
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