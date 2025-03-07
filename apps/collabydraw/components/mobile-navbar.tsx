"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Palette, Command, Settings, Zap, Layers, FileText, Users, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ColorPicker } from "@/components/color-picker"
import { cn } from "@/lib/utils"

interface MobileNavbarProps {
    canvasColor: string
    setCanvasColor: (color: string) => void
    sidebarOpen: boolean
    setSidebarOpen: (open: boolean) => void
}

export function MobileNavbar({ canvasColor, setCanvasColor, sidebarOpen, setSidebarOpen }: MobileNavbarProps) {
    const [colorPickerOpen, setColorPickerOpen] = useState(false)
    const [commandsOpen, setCommandsOpen] = useState(false)
    const [settingsOpen, setSettingsOpen] = useState(false)

    useEffect(() => {
        console.log("sidebarOpen = ", sidebarOpen)
    }, [sidebarOpen])

    return (
        <>
            <footer className="fixed bottom-0 left-0 right-0 z-50 md:hidden w-full max-w-full min-w-full ">
                <div className="mx-auto max-w-md px-4 pb-4">
                    <div className="flex items-center justify-between rounded-[8px] border p-2 backdrop-blur-md Island">
                        {/* <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="mr-2"
                            data-sidebar-trigger
                        >
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle sidebar</span>
                        </Button> */}
                        <NavbarButton icon={Menu} label="Menu" onClick={() => setSidebarOpen(!sidebarOpen)} active={sidebarOpen} />
                        <NavbarButton
                            icon={Palette}
                            label="Colors"
                            onClick={() => setColorPickerOpen(true)}
                            active={colorPickerOpen}
                        />
                        <NavbarButton icon={Command} label="Commands" onClick={() => setCommandsOpen(true)} active={commandsOpen} />
                        <NavbarButton
                            icon={Settings}
                            label="Settings"
                            onClick={() => setSettingsOpen(true)}
                            active={settingsOpen}
                        />
                    </div>
                </div>
            </footer>

            <Sheet open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
                <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-[20px] px-6 py-6">
                    <SheetHeader className="mb-5">
                        <SheetTitle>Canvas Background</SheetTitle>
                    </SheetHeader>
                    <div className="mx-auto max-w-md">
                        <ColorPicker value={canvasColor} onChange={setCanvasColor} />
                    </div>
                </SheetContent>
            </Sheet>

            <Sheet open={commandsOpen} onOpenChange={setCommandsOpen}>
                <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-[20px] px-6 py-6">
                    <SheetHeader className="mb-5">
                        <SheetTitle>Commands</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-4">
                        <CommandItem icon={Zap} label="Quick Actions" description="Access frequently used tools" />
                        <CommandItem icon={Layers} label="Layers" description="Manage your canvas layers" />
                        <CommandItem icon={FileText} label="Templates" description="Start from pre-made designs" />
                        <CommandItem icon={Users} label="Collaboration" description="Invite others to your canvas" />
                    </div>
                </SheetContent>
            </Sheet>

            <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
                <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-[20px] px-6 py-6">
                    <SheetHeader className="mb-5">
                        <SheetTitle>Settings</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-4">
                        <SettingsItem title="Canvas Size" description="Adjust the dimensions of your canvas" />
                        <SettingsItem title="Grid & Snapping" description="Configure alignment helpers" />
                        <SettingsItem title="Export Options" description="Set format and quality preferences" />
                        <SettingsItem title="Keyboard Shortcuts" description="Customize your workflow" />
                    </div>
                </SheetContent>
            </Sheet>
        </>
    )
}

interface NavbarButtonProps {
    icon: React.ElementType
    label: string
    onClick: () => void
    active?: boolean
}

function NavbarButton({ icon: Icon, label, onClick, active = false }: NavbarButtonProps) {
    return (
        <button
            className={cn(
                "flex flex-col items-center justify-center w-8 h-8 rounded-lg transition-all hover:bg-light-btn-hover-bg text-icon-fill-color dark:bg-transparent dark:hover:bg-d-btn-hover-bg dark:text-white",
                label === 'Menu' ? 'menu-btn-box-shadow bg-light-btn-bg' : '',
                active
                    ? "bg-light-btn-hover-bg dark:bg-d-btn-hover-bg"
                    : '',
            )}
            onClick={onClick}
            {...(label === 'Menu' && { "data-sidebar-trigger": true })}
        >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium hidden">{label}</span>
        </button>
    )
}

interface CommandItemProps {
    icon: React.ElementType
    label: string
    description: string
}

function CommandItem({ icon: Icon, label, description }: CommandItemProps) {
    return (
        <Button
            variant="ghost"
            className="flex w-full items-start justify-start gap-3 rounded-lg p-3 text-left hover:bg-accent"
        >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <h3 className="font-medium">{label}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </Button>
    )
}

interface SettingsItemProps {
    title: string
    description: string
}

function SettingsItem({ title, description }: SettingsItemProps) {
    return (
        <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors">
            <div>
                <h3 className="font-medium">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <Button variant="ghost" size="icon" className="shrink-0 rounded-full">
                <Settings className="h-4 w-4" />
                <span className="sr-only">Adjust {title}</span>
            </Button>
        </div>
    )
}