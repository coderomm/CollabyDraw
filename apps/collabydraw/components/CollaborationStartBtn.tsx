'use client'

import { Button } from "./ui/button";
import { useState } from "react";
import CollaborationStartdDialog from "./CollaborationStartdDialog";
import { useSession } from "next-auth/react";
import { RoomSharingDialog } from "./RoomSharingDialog";
import { usePathname } from "next/navigation";
import { CollaborationAdDialog } from "./CollaborationAdDialog";

export default function CollaborationStartBtn({ slug }: { slug?: string }) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession();
    const roomSlug = slug;
    const decodedPathname = decodeURIComponent(pathname)

    return (
        <div className="Start_Room_Session transition-transform duration-500 ease-in-out flex items-center justify-end">
            <Button type="button" onClick={() => setIsOpen(true)}
                className="excalidraw-button collab-button relative w-auto py-3 px-4 rounded-md text-[.875rem] font-semibold shadow-none bg-color-primary hover:bg-brand-hover active:bg-brand-active active:scale-[.98]"
                title="Live collaboration...">Share</Button>

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