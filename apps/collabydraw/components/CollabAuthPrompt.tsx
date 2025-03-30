'use client'

import { Play } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { redirect } from "next/navigation";

export function CollabAuthPrompt({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {

    const handleSubmit = () => {
        redirect('/auth/signin');
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="glass-panel gap-6 max-w-lg bg-island-bg-color border border-dialog-border-color shadow-modal-shadow rounded-lg p-10" overlayClassName="bg-[#12121233]">
                    <DialogHeader className="gap-6">
                        <DialogTitle className="flex items-center justify-center w-full font-bold text-xl text-color-primary tracking-[0.75px]">Live collaboration</DialogTitle>
                        <div className="text-text-primary-color text-center text-[.875rem] leading-[150%] font-normal">
                            <div className="mb-4">Invite people to collaborate on your drawing in real-time.</div>
                            Your work is securely stored, ensuring a seamless experience across devices. Sign up to create and join live sessions effortlessly.
                        </div>
                    </DialogHeader>
                    <DialogFooter className="flex items-center justify-center sm:justify-center">
                        <Button onClick={handleSubmit} type="button" size={"lg"} className="py-2 px-6 min-h-12 rounded-md text-[.875rem] font-semibold shadow-none bg-color-primary hover:bg-brand-hover active:bg-brand-active active:scale-[.98]">
                            <div className="flex items-center justify-center gap-3 shrink-0 flex-nowrap">
                                <Play className="w-5 h-5" />
                            </div>
                            Start Session</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}