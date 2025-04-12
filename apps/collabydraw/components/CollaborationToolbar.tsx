'use client'

import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import CreateRoomDialog from "./CreateRoomDialog";
import { useSession } from "next-auth/react";
import { RoomSharingDialog } from "./RoomSharingDialog";
import { usePathname } from "next/navigation";
import { CollabAuthPrompt } from "./CollabAuthPrompt";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { RoomParticipants } from "@repo/common/types";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Share2 } from "lucide-react";
import { getRoomSharingUrl, isInRoom } from "@/utils/roomParams";
import { BASE_URL } from "@/config/constants";
import { getClientColor } from "@/utils/getClientColor";

export default function CollaborationToolbar({ participants, hash }: { participants?: RoomParticipants[], hash?: string }) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession();
    const [inRoom, setInRoom] = useState(false);
    const decodedPathname = decodeURIComponent(pathname);
    const displayParticipants = participants?.slice(0, 3);
    const remainingParticipants = participants?.slice(3);

    useEffect(() => {
        if (hash) {
            setInRoom(isInRoom(hash));
        }
    }, [hash]);

    const getSharingUrl = () => {
        if (!BASE_URL) {
            throw new Error("BASE_URL not found")
        } else {
            return getRoomSharingUrl(BASE_URL, decodedPathname, hash ?? '');
        }
    };

    return (
        <div className="Start_Room_Session transition-transform duration-500 ease-in-out flex items-center justify-end gap-1 md:gap-2">
            <div className="UserList__wrapper flex w-full justify-end items-center">
                <div className="UserList p-1 flex flex-wrap justify-end  items-center">
                    <TooltipProvider delayDuration={0}>
                        <div className="flex gap-1 md:gap-[.625rem]">
                            {displayParticipants?.map((participant) => (
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

                            {remainingParticipants && remainingParticipants.length > 0 && (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <div
                                            className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center 
                               cursor-pointer hover:bg-gray-400 transition-colors"
                                        >
                                            <span className="text-xs font-bold text-gray-900">
                                                +{remainingParticipants?.length}
                                            </span>
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full max-h-[200px] h-full overflow-auto p-4 mt-3 rounded-lg">
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium font-assistant">Additional Participants</h4>
                                            {remainingParticipants?.map((participant) => (
                                                <div
                                                    key={participant.userId}
                                                    className="cursor-pointer select-none flex items-center space-x-2 h-8 w-full justify-start gap-2 rounded-md px-3 text-sm font-medium transition-colors text-color-on-surface hover:text-color-on-surface bg-transparent hover:bg-button-hover-bg focus-visible:shadow-brand-color-shadow focus-visible:outline-none focus-visible:ring-0 active:bg-button-hover-bg active:border active:border-brand-active dark:hover:bg-w-button-hover-bg"
                                                >
                                                    <div style={{ backgroundColor: getClientColor(participant) }} className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer`}>
                                                        <span className="text-sm font-bold text-gray-900 dark:text-gray-900">
                                                            {participant.userName.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>

                                                    <span className="text-sm text-color-on-surface">{participant.userName}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            )}
                        </div>
                    </TooltipProvider>
                </div>
            </div>
            <Button type="button" onClick={() => setIsOpen(true)}
                className={cn("collabydraw-button collab-button relative w-auto py-2 px-3 md:py-3 md:px-4 rounded-md text-[.875rem] font-semibold shadow-none active:scale-[.98]", inRoom ? "bg-[#0fb884] dark:bg-[#0fb884] hover:bg-[#0fb884]" : "bg-color-primary hover:bg-brand-hover active:bg-brand-active")}
                title="Live collaboration..."><Share2 size={16} className="hidden xs670:inline md:hidden" />
                <span className="inline-block xs670:hidden md:inline-block">Share</span> {inRoom && participants && participants.length > 0 && (
                    <div className="CollabButton-collaborators text-[.6rem] text-[#2b8a3e] bg-[#b2f2bb] font-bold font-assistant rounded-[50%] p-1 min-w-4 min-h-4 w-4 h-4 flex items-center justify-center absolute bottom-[-5px] right-[-5px]">{participants.length}</div>
                )}</Button>

            {session?.user && session?.user.id ? (
                inRoom ? (
                    <RoomSharingDialog open={isOpen} onOpenChange={setIsOpen} link={getSharingUrl()} />
                ) : (
                    <CreateRoomDialog open={isOpen} onOpenChange={setIsOpen} />
                )
            ) : (
                <CollabAuthPrompt open={isOpen} onOpenChange={setIsOpen} />
            )}
        </div>
    )
}