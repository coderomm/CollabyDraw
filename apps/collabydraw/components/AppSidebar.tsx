"use client"

import type React from "react"

import { useEffect, useState } from "react"
import {
    Command,
    Github,
    Twitter,
    UserPlus,
    Sun,
    Moon,
    Monitor,
    Trash,
    LogOut,
    CopyIcon,
    TrashIcon,
    DownloadIcon,
    Upload,
    Linkedin,
    Share2,
    Star,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ColorPicker } from "@/components/color-picker"
import { ClearCanvasDialog } from "./clear-canvas-dialog"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { signOut, useSession } from "next-auth/react"
import { redirect, usePathname } from "next/navigation"
import Link from "next/link"
import { CollabAuthPrompt } from "./CollabAuthPrompt"
import { RoomSharingDialog } from "./RoomSharingDialog"
import { BASE_URL } from "@/config/constants"
import CreateRoomDialog from "./CreateRoomDialog"

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

export function AppSidebar({ isOpen, onClose, canvasColor, setCanvasColor, isMobile, roomName, isStandalone, onClearCanvas, onExportCanvas, onImportCanvas }: SidebarProps) {
    const [stars, setStars] = useState<number | null>(null);
    const [clearDialogOpen, setClearDialogOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const { data: session } = useSession();

    const pathname = usePathname();
    const [isShareOpen, setIsShareOpen] = useState(false);
    const decodedPathname = decodeURIComponent(pathname);

    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            if (isOpen &&
                !clearDialogOpen &&
                !isShareOpen &&
                !target.closest("[data-sidebar]") &&
                !target.closest("[data-sidebar-trigger]")
            ) {
                onClose();
            }
        }

        document.addEventListener("mouseup", handleOutsideClick)
        return () => document.removeEventListener("mouseup", handleOutsideClick)
    }, [clearDialogOpen, isOpen, isShareOpen, onClose])

    useEffect(() => {
        if (isOpen && window.innerWidth < 768) {
            document.body.classList.add("overflow-hidden")
        } else {
            document.body.classList.remove("overflow-hidden")
        }
        return () => document.body.classList.remove("overflow-hidden")
    }, [isOpen])

    useEffect(() => {
        const fetchRepoMetaData = async () => {
            try {
                const res = await fetch('https://api.github.com/repos/coderomm/CollabyDraw');
                const data = await res.json();
                setStars(data.stargazers_count);
            } catch (error) {
                console.error('Error fetching GitHub repo data:', error);
            }
        }
        fetchRepoMetaData();
    }, [])

    return (
        <>
            <ClearCanvasDialog
                open={clearDialogOpen}
                onOpenChange={setClearDialogOpen}
                title="Clear canvas"
                description="This will clear the whole canvas. Are you sure?"
                onClearCanvas={onClearCanvas ? onClearCanvas : () => { }}
                variant="destructive"
            />
            <section data-sidebar className={cn("transition-transform duration-300 ease-in-out z-20", isMobile ? "" : "absolute top-full mt-2")}>
                <div className={cn("flex flex-col", isMobile ? "" : "h-[calc(100vh-135px)] Island rounded-lg")}>
                    <div className={cn("py-1", isMobile ? "" : "flex-1 overflow-auto py-1 custom-scrollbar")}>
                        <nav className={cn("grid gap-1", isMobile ? "px-0" : "px-2")}>
                            <SidebarItem icon={Command} label="Command palette" shortcut="Ctrl+/" />

                            {isStandalone ? (
                                <>
                                    <SidebarItem icon={TrashIcon} label="Clear canvas" onClick={() => setClearDialogOpen(true)} />
                                    <SidebarItem icon={DownloadIcon} label="Export Drawing" onClick={onExportCanvas} />
                                    <SidebarItem icon={Upload} label="Import Drawing" onClick={onImportCanvas} />
                                    <SidebarItem icon={Share2} label="Live collaboration" onClick={() => setIsShareOpen(true)} />
                                    {session?.user && session?.user.id ? (
                                        <CreateRoomDialog open={isShareOpen} onOpenChange={setIsShareOpen} />
                                    ) : (
                                        <CollabAuthPrompt open={isShareOpen} onOpenChange={setIsShareOpen} />
                                    )}
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="ghost"
                                        className={cn("flex h-10 w-full justify-start gap-2 rounded-md px-3 text-sm transition-colors font-bold text-color-promo hover:text-color-promo bg-transparent hover:bg-button-hover-bg focus-visible:shadow-brand-color-shadow focus-visible:outline-none focus-visible:ring-0 active:bg-button-hover-bg active:border active:border-brand-active dark:hover:bg-w-button-hover-bg")}
                                        onClick={() => navigator.clipboard.writeText(window.location.href)}
                                    >
                                        <CopyIcon className="h-4 w-4" />
                                        Room Name: <span>{roomName}</span>
                                    </Button>
                                    <RoomSharingDialog open={isShareOpen} onOpenChange={setIsShareOpen} link={`${BASE_URL}/${decodedPathname}`} />
                                    <SidebarItem icon={Share2} label="Share collaboration" onClick={() => setIsShareOpen(true)} />
                                    <SidebarItem icon={Trash} label="Reset the canvas" onClick={() => setClearDialogOpen(true)} />
                                </>
                            )}
                            {session?.user && session?.user.id ? (
                                <SidebarItem icon={LogOut} label="Log Out" onClick={() => signOut({ callbackUrl: '/' })} />
                            ) : (
                                <SidebarItem icon={UserPlus} onClick={() => redirect('/auth/signup')} label="Sign up" className="text-color-promo hover:text-color-promo font-bold" />
                            )}

                            <Separator className="my-4 dark:bg-default-border-color-dark" />
                            <Link
                                className={cn(
                                    buttonVariants({ variant: "ghost" }),
                                    "flex flex-row items-center justify-start gap-2 h-10 w-auto rounded-md px-3 text-sm font-medium transition-colors text-white dark:text-black hover:text-color-on-surface bg-transparent hover:bg-button-hover-bg focus-visible:shadow-brand-color-shadow focus-visible:outline-none focus-visible:ring-0 active:bg-button-hover-bg active:border active:border-brand-active dark:hover:bg-w-button-hover-bg border border-[#705400] bg-[#FFE599]"
                                )}
                                href="https://github.com/coderomm/CollabyDraw"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="GitHub"
                            >
                                <Github className="h-4 w-4" />GitHub - <span className="flex items-center justify-start gap-1">{stars}<Star className="h-4 w-4" /></span>
                            </Link>
                            <SidebarLinkItem icon={Twitter} label="Twitter / X" url="https://x.com/1omsharma" />
                            <SidebarLinkItem icon={Linkedin} label="Linkedin" url="https://www.linkedin.com/in/1omsharma" />
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
            </section>
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
                "flex h-10 w-full justify-start gap-2 rounded-md px-3 text-sm font-medium transition-colors text-color-on-surface hover:text-color-on-surface bg-transparent hover:bg-button-hover-bg focus-visible:shadow-brand-color-shadow focus-visible:outline-none focus-visible:ring-0 active:bg-button-hover-bg active:border active:border-brand-active dark:hover:bg-w-button-hover-bg",
                className,
            )}
            onClick={onClick}
            title={label}
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

interface SidebarLinkItemProps {
    icon: React.ElementType
    label: string
    shortcut?: string
    className?: string
    url: string
}

function SidebarLinkItem({ icon: Icon, label, shortcut, className, url }: SidebarLinkItemProps) {
    return (
        <Link
            className={cn(
                buttonVariants({ variant: "ghost" }),
                "flex h-10 w-full justify-start gap-2 rounded-md px-3 text-sm font-medium transition-colors text-color-on-surface hover:text-color-on-surface bg-transparent hover:bg-button-hover-bg focus-visible:shadow-brand-color-shadow focus-visible:outline-none focus-visible:ring-0 active:bg-button-hover-bg active:border active:border-brand-active dark:hover:bg-w-button-hover-bg",
                className,
            )}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title={label}
        >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
            {shortcut && (
                <kbd className="ml-auto inline-flex h-5 select-none items-center gap-1 rounded px-1.5 font-mono text-[10px] font-medium opacity-100 bg-muted text-muted-foreground dark:text-[var(--RadioGroup-choice-color-on)] dark:bg-[var(--RadioGroup-choice-background-on)] dark:hover:bg-[var(--RadioGroup-choice-background-on-hover)]">
                    {shortcut}
                </kbd>
            )}
        </Link>
    )
}