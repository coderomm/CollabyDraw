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
import { toast } from "sonner"

interface ConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    // onConfirm: () => Promise<void> | void
    onConfirm?: () => Promise<{
        success: boolean;
        error: string;
        count?: undefined;
    } | {
        success: boolean;
        count: number;
        error?: undefined;
    }> | Promise<void> | void
    onClearCanvas?: () => void
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
    onClearCanvas,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default",
}: ConfirmDialogProps) {
    const [isPending, startTransition] = React.useTransition()

    const handleConfirm = () => {
        startTransition(async () => {
            try {
                if (onClearCanvas) {
                    onClearCanvas();
                    onOpenChange(false);
                    toast.success("Canvas cleared.");
                    return;
                }
                if (onConfirm) {
                    const result = await onConfirm();
                    if (result?.success) {
                        onOpenChange(false)
                        toast.success(`Canvas cleared.`);
                    } else {
                        toast.error('Error: ' + result!.error);
                    }
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to clear canvas. Please try again.';
                toast.error(errorMessage);
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="text-left">
                    <DialogTitle className="text-xl pb-3 mb-6 border-b border-default-border-color dark:border-default-border-color-dark">{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-row gap-3">
                    <Button size={"lg"} variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                        {cancelText}
                    </Button>
                    <Button
                        size={"lg"}
                        variant={variant}
                        onClick={handleConfirm}
                        disabled={isPending}
                    >
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}