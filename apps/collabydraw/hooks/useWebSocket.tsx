'use client'

import { useCallback, useEffect, useRef, useState } from 'react';
import { RoomParticipants, WS_DATA_TYPE, WebSocketChatMessage, WebSocketMessage } from '@repo/common/types';
import { useSession } from 'next-auth/react';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
const MAX_RECONNECT_ATTEMPTS = 5;

export function useWebSocket(roomId: string, roomName: string, userId: string, userName: string) {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<WebSocketChatMessage[]>([]);
    const [participants, setParticipants] = useState<RoomParticipants[]>([]);
    const socketRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
    const reconnectAttemptsRef = useRef(0);
    const paramsRef = useRef({ roomId, roomName, userId, userName });
    const { data: session, status } = useSession();

    useEffect(() => {
        paramsRef.current = { roomId, roomName, userId, userName };
    }, [roomId, roomName, userId, userName]);

    const connectWebSocket = useCallback(() => {
        if (status === "loading") {
            return;
        }
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            return;
        }
        if (socketRef.current?.readyState === WebSocket.CONNECTING) {
            socketRef.current.close();
        }

        try {
            let wsUrl = WS_URL;
            if (status === "authenticated" && session?.accessToken) {
                wsUrl = `${WS_URL}?token=${encodeURIComponent(session.accessToken)}`;
            }

            const ws = new WebSocket(wsUrl);

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
                    if (data.participants) {
                        setParticipants(data.participants);
                    }
                    switch (data.type) {
                        case WS_DATA_TYPE.USER_JOINED:
                            if (!data.participants && data.userId && data.userName) {
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
                            }
                            break;

                        case WS_DATA_TYPE.USER_LEFT:
                            // if (!data.participants) {
                            //     setParticipants(prev => prev.filter(user => user.userId !== data.userId));
                            // }
                            setParticipants(prev => prev.filter(user => user.userId !== data.userId));
                            break;

                        case WS_DATA_TYPE.CHAT:
                        case WS_DATA_TYPE.DRAW:
                        case WS_DATA_TYPE.ERASER:
                        case WS_DATA_TYPE.UPDATE:
                            if (data.message && data.timestamp) {
                                setMessages(prev => [...prev, {
                                    userId: data.userId!,
                                    userName: data.userName!,
                                    content: data.message!,
                                    timestamp: data.timestamp || new Date().toISOString(),
                                }]);
                            }
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
    }, [session, status]);

    useEffect(() => {
        if (status !== "loading") {
            connectWebSocket();
        }
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
    }, [connectWebSocket, status]);

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