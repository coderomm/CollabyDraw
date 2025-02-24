import { useCallback, useEffect, useRef, useState } from 'react';
import { RoomParticipants, WS_DATA_TYPE, WebSocketChatMessage, WebSocketMessage } from '@repo/common/types';

export function useWebSocket(roomId: string, roomName: string, userId: string, userName: string) {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<WebSocketChatMessage[]>([]);
    const [participants, setParticipants] = useState<RoomParticipants[]>([]);
    const socketRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
    const reconnectAttemptsRef = useRef(0);
    const MAX_RECONNECT_ATTEMPTS = 5;
    const paramsRef = useRef({ roomId, roomName, userId, userName });

    useEffect(() => {
        paramsRef.current = { roomId, roomName, userId, userName };
    }, [roomId, roomName, userId, userName]);

    const connectWebSocket = useCallback(() => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            return;
        }
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.close();
        }

        try {
            const ws = new WebSocket(`${process.env.WS_URL}`);

            const handleOpen = () => {
                setIsConnected(true);
                reconnectAttemptsRef.current = 0;
                const { roomId, roomName, userId, userName } = paramsRef.current;

                ws.send(JSON.stringify({
                    type: WS_DATA_TYPE.JOIN,
                    roomId,
                    roomName,
                    userId,
                    userName
                }));
            };

            const handleMessage = (event: MessageEvent) => {
                try {
                    const data: WebSocketMessage = JSON.parse(event.data);
                    switch (data.type) {
                        case WS_DATA_TYPE.CHAT:
                            if (data.message && data.timestamp) {
                                setMessages(prev => [...prev, {
                                    userId: data.userId!,
                                    userName: data.userName!,
                                    content: data.message!,
                                    timestamp: data.timestamp!,
                                }]);
                            }
                            break;

                        case WS_DATA_TYPE.USER_JOINED:
                            setParticipants(prev => {
                                const exists = prev.some(p => p.userId === data.userId);
                                if (!exists && data.userId && data.userName) {
                                    return [...prev, {
                                        userId: data.userId,
                                        userName: data.userName
                                    }];
                                }
                                return prev;
                            });
                            break;

                        case WS_DATA_TYPE.USER_LEFT:
                            setParticipants(prev => prev.filter(user => user.userId !== data.userId));
                            break;
                    }
                } catch (err) {
                    console.error('Error processing message:', err);
                }
            };

            const handleClose = (event: CloseEvent) => {
                setIsConnected(false);
                if (event.code !== 1000 && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
                    const delay = Math.min(1000 * 2 ** reconnectAttemptsRef.current, 30000);
                    console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1})`);

                    reconnectTimeoutRef.current = setTimeout(() => {
                        reconnectAttemptsRef.current += 1;
                        connectWebSocket();
                    }, delay);
                }
            };

            ws.addEventListener('open', handleOpen);
            ws.addEventListener('message', handleMessage);
            ws.addEventListener('close', handleClose);
            ws.addEventListener('error', (error) => {
                console.error('WebSocket error:', error);
            });

            socketRef.current = ws;

            return () => {
                ws.removeEventListener('open', handleOpen);
                ws.removeEventListener('message', handleMessage);
                ws.removeEventListener('close', handleClose);
            };
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
        }
    }, []);

    useEffect(() => {
        connectWebSocket();

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }

            if (socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({
                    type: WS_DATA_TYPE.LEAVE,
                    roomId: paramsRef.current.roomId
                }));
                socketRef.current.close(1000, 'Component unmounted');
            }
        };
    }, [connectWebSocket]);

    const sendMessage = useCallback((content: string) => {
        if (!content?.trim()) {
            console.warn('Cannot send empty message');
            return;
        }
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            const { roomId, roomName, userId, userName } = paramsRef.current;
            socketRef.current.send(JSON.stringify({
                type: WS_DATA_TYPE.CHAT,
                message: content,
                roomId,
                roomName,
                userId,
                userName
            }));
        } else {
            console.warn('Cannot send message: WebSocket not connected');
        }
    }, []);

    return {
        isConnected,
        messages,
        participants,
        sendMessage
    };
}