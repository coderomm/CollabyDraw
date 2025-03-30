'use client'

import { Button } from "./ui/button";
import { Play } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { useTransition } from "react";
import { Input } from "./ui/input";
import { createRoom } from "@/actions/room";
import { toast } from "sonner";
import { CreateRoomSchema } from "@repo/common/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

export default function CreateRoomDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const createForm = useForm({
        resolver: zodResolver(CreateRoomSchema),
        defaultValues: {
            roomName: '',
        },
    });

    const handleCreateRoom = createForm.handleSubmit((data) => {
        startTransition(async () => {
            try {
                const result = await createRoom(data);
                if (result.success) {
                    toast.success(`Created room: ${data.roomName} with code: ${result.room?.slug}`);
                    onOpenChange(false);
                    router.push(`/room/${result.room?.slug}`);
                } else {
                    toast.error('Error: ' + result.error);
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to create room. Please try again.';
                toast.error(errorMessage);
            }
        });
    });

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
                    <Form {...createForm}>
                        <form onSubmit={handleCreateRoom} className="grid gap-4 py-4">
                            <FormField
                                control={createForm.control}
                                name="roomName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-assistant font-semibold text-[0.875rem] indent-[150%] text-collaby-textfield-label mb-1 select-none">Room Name</FormLabel>
                                        <FormControl>
                                            <div className="flex items-center h-12 bg-collaby-textfield border border-collaby-textfield hover:border-collaby-textfield-hover active:border-collaby-textfield-active focus-within:border-collaby-textfield-hover rounded-md px-3 transition-shadow duration-500 ease-in-out">
                                                <Input
                                                    placeholder="Enter room name"
                                                    className="flex items-center h-6 mt-0 w-full font-assistant font-normal text-base text-ellipsis text-text-primary-color bg-transparent border-none p-0 !ring-0 !outline-0 shadow-none"
                                                    {...field}
                                                    disabled={isPending}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter className="flex items-center justify-center sm:justify-center">
                                <Button type="submit" size={"lg"} disabled={isPending} className="py-2 px-6 min-h-12 rounded-md text-[.875rem] font-semibold shadow-none bg-color-primary hover:bg-brand-hover active:bg-brand-active active:scale-[.98]">
                                    <div className="flex items-center justify-center gap-3 shrink-0 flex-nowrap">
                                        <Play className="w-5 h-5" />
                                    </div>
                                    {isPending ? 'Starting Session...' : 'Start Session'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog >
        </>
    );
};