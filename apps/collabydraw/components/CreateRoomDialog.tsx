'use client'

import { Button } from "./ui/button";
import { Play } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { useTransition } from "react";
import { createRoom } from "@/actions/room";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { generateAESKey } from "@/utils/crypto";

export default function CreateRoomDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleCreateRoom = async () => {
        startTransition(async () => {
            try {
                const result = await createRoom();
                if (result.success && result.room?.id) {
                    const encryptionKey = await generateAESKey();
                    const redirectURL = `/#room=${result.room?.id},${encryptionKey}`;
                    router.push(redirectURL);
                    onOpenChange(false);
                    toast.success("Room created successfully!");
                } else {
                    toast.error('Error: ' + result.error);
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to create room. Please try again.';
                toast.error(errorMessage);
            }
        });
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="glass-panel gap-6 max-w-lg bg-island-bg-color border border-dialog-border-color shadow-modal-shadow rounded-lg p-10" overlayClassName="bg-[#12121233]">
                    <DialogHeader className="gap-6">
                        <DialogTitle className="flex items-center justify-center w-full font-bold text-xl text-color-primary tracking-[0.75px]">Live collaboration</DialogTitle>
                        <div className="text-text-primary-color text-center text-[.875rem] leading-[150%] font-normal">
                            <div className="mb-4">Invite people to collaborate on your drawing in real-time.</div>
                            Do not worry, the session is end-to-end encrypted, and fully private. Not even our server can see what you draw.
                        </div>
                    </DialogHeader>
                    <DialogFooter className="flex items-center justify-center sm:justify-center">
                        <Button onClick={handleCreateRoom} type="button" size={"lg"} disabled={isPending} className="py-2 px-6 min-h-12 rounded-md text-[.875rem] font-semibold shadow-none bg-color-primary hover:bg-brand-hover active:bg-brand-active active:scale-[.98]">
                            <div className="flex items-center justify-center gap-3 shrink-0 flex-nowrap">
                                <Play className="w-5 h-5" />
                            </div>
                            {isPending ? 'Starting Session...' : 'Start Session'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        </>
    );
};