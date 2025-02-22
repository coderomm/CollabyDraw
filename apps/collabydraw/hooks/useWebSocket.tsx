import { useEffect, useState } from 'react';
import { RoomParticipants, WS_DATA_TYPE, WebSocketChatMessage, WebSocketMessage } from '@repo/common/types';

export function useWebSocket(roomName: string, roomId: string, userId: string, token: string) {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<WebSocketChatMessage[]>([]);
    const [participants, setParticipants] = useState<RoomParticipants[]>([]);

    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:8080`);

        ws.addEventListener('open', () => {
            setIsConnected(true);
            ws.send(JSON.stringify({
                type: WS_DATA_TYPE.JOIN,
                roomId
            }));
        });

        ws.addEventListener('message', (event) => {
            const data: WebSocketMessage = JSON.parse(event.data);
            console.log('data in useWebsocket = ', data)
            switch (data.type) {
                case WS_DATA_TYPE.CHAT:
                    if (data.message && data.timestamp) {
                        setMessages(prev => [...prev, {
                            userId: data.userId!,
                            content: data.message!,
                            timestamp: data.timestamp!,
                            userName: data.userId
                        }]);
                    }
                    break;

                case WS_DATA_TYPE.USER_JOINED:
                    setParticipants(prev => [...prev, { userId: data.userId }]);
                    break;

                case WS_DATA_TYPE.USER_LEFT:
                    setParticipants(prev => prev.filter(user => user.userId !== data.userId!));
                    break;
            }
        });

        ws.addEventListener('close', () => {
            setIsConnected(false);
        });

        setSocket(ws);

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: WS_DATA_TYPE.LEAVE,
                    roomId
                }));
                ws.close();
            }
        };
    }, [roomId, roomName, token, userId]);

    const sendMessage = (content: string) => {
        if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: WS_DATA_TYPE.CHAT,
                message: content,
                roomId
            }));
        }
    };

    return {
        isConnected,
        messages,
        participants,
        sendMessage
    };
}