"use client";

import { useEffect, useState } from "react";
import { Canvas } from "./Canvas";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useSession } from "next-auth/react";

export function RoomCanvas({ roomId }: { roomId: string }) {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const { data: Session, status: string } = useSession();
    alert(string);
    const user = Session?.user;
    if (!user?.id) {
        alert('user not found');
        return;
    }

    const {
        isConnected,
        messages,
        participants,
        sendMessage
    } = useWebSocket(roomId, 'test room', user.id, user!.name!);

    useEffect(() => {
        const ws = new WebSocket(`${process.env.WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3Njg0NDMwYy04YzNiLTRlZmQtOGFmNS00YzQwMzdmNjJkYzMiLCJpYXQiOjE3MzcyOTg2NjV9.xacFop0s231DoUVeLZormeIbBmIRaXftTVVI6weIqFo`)

        ws.onopen = () => {
            setSocket(ws);
            const data = JSON.stringify({
                type: "join_room",
                roomId
            });
            console.log(data);
            ws.send(data)
        }

    }, [])

    if (!socket) {
        return <div>
            Connecting to server....
        </div>
    }

    return <div>
        <Canvas roomId={roomId} socket={socket} />
    </div>
}