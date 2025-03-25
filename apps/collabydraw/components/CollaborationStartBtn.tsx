'use client'

import { Button } from "./ui/button";
import { useState } from "react";
import CollaborationStartdDialog from "./CollaborationStartdDialog";
import { useSession } from "next-auth/react";
import { RoomSharingDialog } from "./RoomSharingDialog";
import { usePathname } from "next/navigation";
import { CollaborationAdDialog } from "./CollaborationAdDialog";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { RoomParticipants } from "@repo/common/types";

export default function CollaborationStartBtn({ slug, participants }: { slug?: string, participants?: RoomParticipants[] }) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession();
    const roomSlug = slug;
    const decodedPathname = decodeURIComponent(pathname)

    return (
        <div className="Start_Room_Session transition-transform duration-500 ease-in-out flex items-center justify-end">
            <div className="UserList__wrapper flex w-full justify-end items-center">
                <div className="UserList p-1 flex flex-wrap justify-end  items-center gap-[.625rem]">
                    <TooltipProvider delayDuration={0}>
                        <div className="flex space-x-2">
                            {participants?.map((participant) => (
                                <Tooltip key={participant.userId}>
                                    <TooltipTrigger asChild>
                                        <div style={{ backgroundColor: getClientColor(participant) }} className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer`}>
                                            <span className="text-sm font-bold text-gray-900 dark:text-gray-900">
                                                {participant.userName.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {participant.userName}
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </div>
                    </TooltipProvider>
                </div>
            </div>
            <Button type="butt yu65tr4e3qson" onClick={() => setIsOpen(true)}
                className={cn("excalidraw-button collab-button relative w-auto py-3 px-4 rounded-md text-[.875rem] font-semibold shadow-none active:scale-[.98]", roomSlug ? "bg-[#0fb884] dark:bg-[#0fb884] hover:bg-[#0fb884]" : "bg-color-primary hover:bg-brand-hover active:bg-brand-active")}
                title="Live collaboration...">Share {roomSlug && participants && participants.length > 0 && (
                    <div className="CollabButton-collaborators text-[.6rem] text-[#2b8a3e] bg-[#b2f2bb] font-bold font-assistant rounded-[50%] p-1 min-w-4 min-h-4 w-4 h-4 flex items-center justify-center absolute bottom-[-5px] right-[-5px]">{participants.length}</div>
                )}</Button>

            {session?.user && session?.user.id ? (
                roomSlug ? (
                    <RoomSharingDialog open={isOpen} onOpenChange={setIsOpen} link={`${process.env.NODE_ENV !== 'production' ? 'http://localhost:3000' : 'https://collabydraw.com'}/${decodedPathname}`} />
                ) : (
                    <CollaborationStartdDialog open={isOpen} onOpenChange={setIsOpen} />
                )
            ) : (
                <CollaborationAdDialog open={isOpen} onOpenChange={setIsOpen} />
            )}
        </div>
    )
}

function hashToInteger(id: string) {
    let hash = 0;
    if (!id) return hash;

    for (let i = 0; i < id.length; i++) {
        const char = id.charCodeAt(i);
        hash = (hash << 5) - hash + char;
    }
    return hash;
}

export const getClientColor = (collaborator: { userId: string; userName: string; }) => {
    if (!collaborator?.userId) return "hsl(0, 0%, 83%)";

    const hash = Math.abs(hashToInteger(collaborator?.userId));
    const hue = (hash % 36) * 10;
    const saturation = 90;
    const lightness = 75;

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};