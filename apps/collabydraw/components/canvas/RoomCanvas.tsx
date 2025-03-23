"use client"
import { WS_DATA_TYPE } from "@repo/common/types";
import { useEffect, useRef, useState } from "react";
import CanvasSheet from "./CanvasSheet";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';

export default function RoomCanvas({ roomName, roomId, userId, userName, token }: { roomName: string; roomId: string; userId: string; userName: string; token: string }) {
    // const [socket, setSocket] = useState<WebSocket | null>(null);
    const socketRef = useRef<WebSocket | null>(null);
    // const socketConnected = useRef(false);
    const [isConnected, setIsConnected] = useState(false);
    const connectionAttempt = useRef(0);

    useEffect(() => {
        const currentAttempt = ++connectionAttempt.current;
        console.log('Connection attempt:', currentAttempt);

        const ws = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}`);
        socketRef.current = ws;

        const handleOpen = () => {
            if (currentAttempt !== connectionAttempt.current) return;
            console.log('WebSocket connected');
            ws.send(JSON.stringify({
                type: WS_DATA_TYPE.JOIN,
                roomId,
                roomName,
                userId,
                userName
            }));
            setIsConnected(true);
        };

        const handleClose = () => {
            if (currentAttempt !== connectionAttempt.current) return;
            setIsConnected(false);
            socketRef.current = null;
        };

        ws.addEventListener('open', handleOpen);
        ws.addEventListener('close', handleClose);
        ws.addEventListener('error', handleClose);

        return () => {
            console.log('Cleanup connection attempt:', currentAttempt);
            ws.removeEventListener('open', handleOpen);
            ws.removeEventListener('close', handleClose);
            ws.removeEventListener('error', handleClose);

            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [roomId, roomName, token, userId, userName]);

    return (
        <CanvasSheet
            roomId={roomId}
            roomName={roomName}
            userId={userId}
            userName={userName}
            token={token}
            socket={socketRef.current!}
            isConnected={isConnected}
        />
    );
}