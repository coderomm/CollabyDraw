"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    onConfirm: () => Promise<void> | void
    confirmText?: string
    cancelText?: string
    variant?: "default" | "destructive"
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default",
}: ConfirmDialogProps) {
    const [isPending, startTransition] = React.useTransition()

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant}
                        onClick={() => {
                            startTransition(async () => {
                                await onConfirm()
                                onOpenChange(false)
                            })
                        }}
                        disabled={isPending}
                    >
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}