'use client'

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateRoomSchema, JoinRoomSchema } from "@repo/common/types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { toast } from "sonner";
import { createRoom, joinRoom } from "@/actions/room";

export function JoinRoom() {
    const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const joinForm = useForm({
        resolver: zodResolver(JoinRoomSchema),
        defaultValues: {
            roomName: '',
        },
    });

    const createForm = useForm({
        resolver: zodResolver(CreateRoomSchema),
        defaultValues: {
            roomName: '',
        },
    });

    const handleJoinRoom = joinForm.handleSubmit((data) => {
        startTransition(async () => {
            try {
                const result = await joinRoom(data.roomName);
                if (result.success) {
                    toast.success(`Joined room: ${result.roomName}`);
                    router.push(`/room/${data.roomName}`);
                } else {
                    toast.error('Error: ' + result.error);
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to join room. Please try again.';
                toast.error(errorMessage);
            }
        });
    });

    const handleCreateRoom = createForm.handleSubmit((data) => {
        startTransition(async () => {
            try {
                const result = await createRoom(data.roomName);
                if (result.success) {
                    toast.success(`Created room: ${data.roomName} with code: ${result.room?.slug}`);
                    setIsCreateRoomOpen(false);
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
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="glow-effect">
                    Join Room
                </Button>
            </DialogTrigger>
            <DialogContent className="glass-panel">
                <DialogHeader>
                    <DialogTitle>Join Collaboration Room</DialogTitle>
                </DialogHeader>
                <Form {...joinForm}>
                    <form onSubmit={handleJoinRoom} className="grid gap-4 py-4">
                        <FormField
                            control={joinForm.control}
                            name="roomName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Room Code</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter room code"
                                            className="glass-panel"
                                            {...field}
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button className="glow-effect" type="submit" disabled={isPending}>
                            {isPending ? 'Joining...' : 'Join Room'}
                        </Button>
                        <Button
                            variant="outline"
                            className="glow-effect"
                            onClick={() => setIsCreateRoomOpen(true)}
                            type="button"
                            disabled={isPending}
                        >
                            Create Room
                        </Button>
                    </form>
                </Form>
            </DialogContent>

            {/* Create Room Dialog */}
            <Dialog open={isCreateRoomOpen} onOpenChange={setIsCreateRoomOpen}>
                <DialogContent className="glass-panel">
                    <DialogHeader>
                        <DialogTitle>Create Collaboration Room</DialogTitle>
                    </DialogHeader>
                    <Form {...createForm}>
                        <form onSubmit={handleCreateRoom} className="grid gap-4 py-4">
                            <FormField
                                control={createForm.control}
                                name="roomName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Room Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter room name"
                                                className="glass-panel"
                                                {...field}
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button className="glow-effect" type="submit" disabled={isPending}>
                                    {isPending ? 'Creating...' : 'Create Room'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </Dialog>
    );
}