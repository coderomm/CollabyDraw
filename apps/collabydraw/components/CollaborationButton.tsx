'use client';

import { useState } from "react";
import { CollabAuthPrompt } from "./CollabAuthPrompt";
import CreateRoomDialog from "./CreateRoomDialog";
import { useSession } from "next-auth/react";

export function CollaborationButton() {
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession();

    const handleCollaborationClick = () => {
        setIsOpen(true);
    };

    return (
        <>
            <button onClick={handleCollaborationClick} type="button" className="welcome-screen-menu-item ">
                <div className="welcome-screen-menu-item__icon">
                    <svg aria-hidden="true" focusable="false" role="img" viewBox="0 0 24 24" className="" fill="none" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                        <g strokeWidth="1.5">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            <path d="M21 21v-2a4 4 0 0 0 -3 -3.85"></path>
                        </g>
                    </svg>
                </div>
                <div className="welcome-screen-menu-item__text">Live collaboration...</div>
            </button>

            {session?.user && session?.user.id ? (
                <CreateRoomDialog open={isOpen} onOpenChange={setIsOpen} />
            ) : (
                <CollabAuthPrompt open={isOpen} onOpenChange={setIsOpen} />
            )}
        </>
    );
}