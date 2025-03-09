"use client"

import type React from "react"

import { useEffect, useState } from "react"
import {
    Command,
    Github,
    Twitter,
    MessageSquare,
    UserPlus,
    Sun,
    Moon,
    Monitor,
    X,
    Trash,
    LogOut,
    CopyIcon,
    TrashIcon,
    DownloadIcon,
    Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ColorPicker } from "@/components/color-picker"
import { ConfirmDialog } from "./confirm-dialog"
// import { clearCanvas } from "@/actions/canvas"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { clearAllChats } from "@/actions/chat"
import { signOut } from "next-auth/react"

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
    canvasColor: string
    setCanvasColor: (color: string) => void
    isMobile?: boolean
    roomName?: string
    isStandalone?: boolean;
    onClearCanvas?: () => void;
    onExportCanvas?: () => void;
    onImportCanvas?: () => void;
}

export function MainMenuStack({ isOpen, onClose, canvasColor, setCanvasColor, isMobile, roomName, isStandalone = false, onClearCanvas, onExportCanvas, onImportCanvas }: SidebarProps) {
    const [clearDialogOpen, setClearDialogOpen] = useState(false)
    const { theme, setTheme } = useTheme()

    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            if (isOpen && !target.closest("[data-sidebar]") && !target.closest("[data-sidebar-trigger]")) {
                onClose()
            }
        }

        document.addEventListener("mouseup", handleOutsideClick)
        return () => document.removeEventListener("mouseup", handleOutsideClick)
    }, [isOpen, onClose])

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
            <ConfirmDialog
                open={clearDialogOpen}
                onOpenChange={setClearDialogOpen}
                title="Clear canvas"
                description="This will clear the whole canvas. Are you sure?"
                onClearCanvas={isStandalone ? onClearCanvas : undefined}
                onConfirm={!isStandalone ? () => clearAllChats({ roomName: roomName! }) : undefined}
                variant="destructive"
            />

            <aside data-sidebar className={cn("transition-transform duration-300 ease-in-out z-20", isMobile ? "" : "absolute top-full mt-2")}>
                <div className={cn("flex flex-col", isMobile ? "" : "h-[calc(100vh-150px)] Island rounded-lg")}>
                    <Button variant="ghost" size="icon" className="absolute right-4 top-4 hidden" onClick={onClose}>
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close sidebar</span>
                    </Button>

                    <div className={cn("py-1", isMobile ? "" : "flex-1 overflow-auto py-1 custom-scrollbar")}>
                        <nav className={cn("grid gap-1", isMobile ? "px-0" : "px-2")}>
                            <SidebarItem icon={Command} label="Command palette" shortcut="Ctrl+/" />

                            {isStandalone ? (
                                <>
                                    <SidebarItem icon={TrashIcon} label="Clear canvas" onClick={() => setClearDialogOpen(true)} />
                                    <SidebarItem icon={DownloadIcon} label="Export Drawing" onClick={onExportCanvas} />
                                    <SidebarItem icon={Upload} label="Import Drawing" onClick={onImportCanvas} />
                                    <SidebarItem icon={UserPlus} label="Sign up" className="text-color-promo hover:text-color-promo font-bold" />
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="ghost"
                                        className={cn("flex h-10 w-full justify-start gap-2 rounded-md px-3 text-sm font-medium transition-colors dark:text-w-text dark:hover:text-w-text dark:hover:bg-w-button-hover-bg")}
                                        onClick={() => navigator.clipboard.writeText(window.location.href)}
                                    >
                                        <CopyIcon className="h-4 w-4" />
                                        <span>{roomName}</span>
                                    </Button>
                                    <SidebarItem icon={Trash} label="Reset the canvas" onClick={() => setClearDialogOpen(true)} />
                                    <SidebarItem icon={LogOut} label="Log Out" onClick={() => signOut({ callbackUrl: '/' })} />
                                </>
                            )}

                            <Separator className="my-4 dark:bg-default-border-color-dark" />

                            <SidebarItem icon={Command} label="CollabyDraw+" />
                            <SidebarItem icon={Github} label="GitHub" />
                            <SidebarItem icon={Twitter} label="Follow us" />
                            <SidebarItem icon={MessageSquare} label="Discord chat" />
                        </nav>
                    </div>

                    <div className="border-t p-4">
                        <div className="mb-4 w-full flex items-center justify-between gap-x-2">
                            <h3 className="mb-2 text-sm font-medium dark:text-w-text flex items-center w-full text-ellipsis overflow-hidden whitespace-nowrap">Theme</h3>
                            <div className="flex gap-1 cu box-border flex-row items-start p-[3px] rounded-[10px] dark:bg-w-bg border border-[var(--RadioGroup-border)]">
                                <Button onClick={() => setTheme("light")} variant="outline" size="icon" className={`${theme === 'light' ? 'text-[var(--RadioGroup-choice-color-on)] bg-[var(--RadioGroup-choice-background-on)] hover:bg-[var(--RadioGroup-choice-background-on-hover)]' : 'dark:text-[var(--RadioGroup-choice-color-off)] dark:bg-[var(--RadioGroup-choice-background-off)] hover:text-[var(--RadioGroup-choice-color-off-hover)] dark:hover:bg-transparent'} border-none rounded-lg flex items-center justify-center w-8 h-6 select-none tracking-wide transition-all duration-75 ease-out`}>
                                    <Sun className="h-4 w-4" />
                                    <span className="sr-only">Light mode</span>
                                </Button>
                                <Button onClick={() => setTheme("dark")} variant="outline" size="icon" className={`${theme === 'dark' ? 'dark:text-[var(--RadioGroup-choice-color-on)] dark:bg-[var(--RadioGroup-choice-background-on)] dark:hover:bg-[var(--RadioGroup-choice-background-on-hover)]' : 'dark:text-[var(--RadioGroup-choice-color-off)] dark:bg-[var(--RadioGroup-choice-background-off)] hover:text-[var(--RadioGroup-choice-color-off-hover)] dark:hover:bg-transparent'} border-none rounded-lg flex items-center justify-center w-8 h-6 select-none tracking-wide transition-all duration-75 ease-out`}>
                                    <Moon className="h-4 w-4" />
                                    <span className="sr-only">Dark mode</span>
                                </Button>
                                <Button onClick={() => setTheme("system")} variant="outline" size="icon" className={`${theme === 'system' ? 'dark:text-[var(--RadioGroup-choice-color-on)] dark:bg-[var(--RadioGroup-choice-background-on)] dark:hover:bg-[var(--RadioGroup-choice-background-on-hover)]' : 'dark:text-[var(--RadioGroup-choice-color-off)] dark:bg-[var(--RadioGroup-choice-background-off)] hover:text-[var(--RadioGroup-choice-color-off-hover)] dark:hover:bg-transparent'} border-none rounded-lg flex items-center justify-center w-8 h-6 select-none tracking-wide transition-all duration-75 ease-out`}>
                                    <Monitor className="h-4 w-4" />
                                    <span className="sr-only">System mode</span>
                                </Button>
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-2 text-sm font-medium dark:text-w-text">Canvas background</h3>
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
                "flex h-10 w-full justify-start gap-2 rounded-md px-3 text-sm font-medium transition-colors dark:text-w-text dark:hover:text-w-text dark:hover:bg-w-button-hover-bg",
                className,
            )}
            onClick={onClick}
        >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
            {shortcut && (
                <kbd className="ml-auto inline-flex h-5 select-none items-center gap-1 rounded px-1.5 font-mono text-[10px] font-medium opacity-100 bg-muted text-muted-foreground dark:text-[var(--RadioGroup-choice-color-on)] dark:bg-[var(--RadioGroup-choice-background-on)] dark:hover:bg-[var(--RadioGroup-choice-background-on-hover)]">
                    {shortcut}
                </kbd>
            )}
        </Button>
    )
}