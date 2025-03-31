'use client'

import { Button } from "./ui/button";
import { LogIn, Trash } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { toast } from "sonner";
import { getUserRooms, joinRoom, deleteRoom } from "@/actions/room";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Skeleton } from "./ui/skeleton";
import CreateRoomDialog from "./CreateRoomDialog";

type RoomType = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

interface UserRoomsListDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isMobile?: boolean;
}

export function UserRoomsListDialog({
    open,
    onOpenChange,
    isMobile = false
}: UserRoomsListDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [rooms, setRooms] = useState<RoomType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (open || isMobile) {
            fetchRooms();
        }
    }, [isMobile, open]);

    const fetchRooms = () => {
        setIsLoading(true);
        startTransition(async () => {
            try {
                const response = await getUserRooms();
                if (response.success) {
                    setRooms(response.rooms ?? []);
                } else {
                    toast.error(response.error || "Failed to fetch rooms.");
                }
            } catch (error) {
                toast.error("Failed to fetch rooms");
                console.error("Failed to fetch rooms:", error);
            } finally {
                setIsLoading(false);
            }
        });
    };

    const handleJoinRoom = (id: string) => {
        startTransition(async () => {
            try {
                const response = await joinRoom({ id });
                if (response && response.success) {
                    toast.success(`Joining room: ${id}`);
                    onOpenChange(false);
                    router.push(`/room/${id}`);
                } else {
                    toast.error(response?.error || "Failed to join room.");
                }
            } catch (error) {
                toast.error("Failed to join room");
                console.error("Failed to join room:", error);
            }
        });
    };

    const handleDeleteRoom = (id: string) => {
        if (!confirm(`Are you sure you want to delete room: ${id}?`)) {
            return;
        }

        startTransition(async () => {
            try {
                const response = await deleteRoom({ id });
                if (response.success) {
                    toast.success("Room deleted successfully!");
                    fetchRooms();
                } else {
                    toast.error(response.error || "Failed to delete room.");
                }
            } catch (error) {
                toast.error("Failed to delete room");
                console.error("Failed to delete room:", error);
            }
        });
    };

    if (isMobile) {
        return (
            <div className="space-y-4 max-h-60 overflow-y-auto">
                {isLoading ? (
                    Array(3).fill(0).map((_, index) => (
                        <div key={index} className="border border-gray-700 p-3 rounded-md">
                            <Skeleton className="h-6 w-full bg-gray-700/50" />
                        </div>
                    ))
                ) : rooms.length > 0 ? (
                    rooms.map((room) => (
                        <div key={room.id} className="flex justify-between items-center transition-colors">
                            <span className="flex-1 bg-collaby-textfield border border-collaby-textfield rounded-md px-3 py-2 text-text-primary-color overflow-hidden text-ellipsis mr-3 select-none">{room.id}</span>
                            <div className="flex gap-2 shrink-0">
                                <Button
                                    onClick={() => handleJoinRoom(room.id)}
                                    disabled={isPending}
                                    className="py-2 px-3 rounded-md text-[.875rem] font-semibold shadow-none bg-color-primary hover:bg-brand-hover active:bg-brand-active active:scale-[.98]"
                                    title="Join Room"
                                >
                                    <LogIn className="w-4 h-4" />
                                </Button>
                                <Button
                                    onClick={() => handleDeleteRoom(room.id)}
                                    disabled={isPending}
                                    className="py-2 px-3 rounded-md text-[.875rem] font-semibold shadow-none bg-red-500 hover:bg-red-600 active:bg-red-700 active:scale-[.98] text-white"
                                    title="Delete Room"
                                >
                                    <Trash className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        <p>No rooms found.</p>
                        <Button
                            onClick={() => router.push('/create-room')}
                            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
                            size="sm"
                        >
                            Create a Room
                        </Button>
                    </div>
                )}
            </div>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="glass-panel gap-6 max-w-lg bg-island-bg-color border border-dialog-border-color shadow-modal-shadow rounded-lg p-10" overlayClassName="bg-[#12121233]">
                <DialogHeader className="gap-6">
                    <DialogTitle className="flex items-center justify-center w-full font-bold text-xl text-color-primary tracking-[0.75px]">{isLoading ? 'Loading' : rooms.length > 0 ? ('All Your Rooms') : ('No room found')}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 max-h-60">
                    {isLoading ? (
                        Array(3).fill(0).map((_, index) => (
                            <div key={index} className="border border-gray-700 p-3 rounded-md">
                                <Skeleton className="h-6 w-full bg-gray-700/50" />
                            </div>
                        ))
                    ) : rooms.length > 0 ? (
                        rooms.map((room) => (
                            <div key={room.id} className="flex justify-between items-center transition-colors">
                                <span className="flex-1 bg-collaby-textfield border border-collaby-textfield rounded-md px-3 py-2 text-text-primary-color overflow-hidden text-ellipsis mr-3 select-none">{room.id}</span>
                                <div className="flex gap-2 shrink-0">
                                    <Button
                                        onClick={() => handleJoinRoom(room.id)}
                                        disabled={isPending}
                                        className="py-2 px-3 rounded-md text-[.875rem] font-semibold shadow-none bg-color-primary hover:bg-brand-hover active:bg-brand-active active:scale-[.98]"
                                        title="Join Room"
                                    >
                                        <LogIn className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        onClick={() => handleDeleteRoom(room.id)}
                                        disabled={isPending}
                                        className="py-2 px-3 rounded-md text-[.875rem] font-semibold shadow-none bg-red-500 hover:bg-red-600 active:bg-red-700 active:scale-[.98] text-white"
                                        title="Delete Room"
                                    >
                                        <Trash className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <Button
                                type="button"
                                size={"lg"}
                                onClick={() => { setIsOpen(true); }}
                                disabled={isPending}
                                className="py-2 px-6 min-h-12 rounded-md text-[.875rem] font-semibold shadow-none bg-color-primary hover:bg-brand-hover active:bg-brand-active active:scale-[.98]"
                                title="Create a Room">Create a Room</Button>
                            <CreateRoomDialog open={isOpen} onOpenChange={setIsOpen} />
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}