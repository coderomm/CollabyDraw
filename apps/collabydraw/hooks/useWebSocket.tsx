'use client'

import { useCallback, useEffect, useRef, useState } from 'react';
import { RoomParticipants, WS_DATA_TYPE, WebSocketMessage } from '@repo/common/types';
import { WsMessage } from '@/types/canvas';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
const MAX_RECONNECT_ATTEMPTS = 5;

export function useWebSocket(roomId: string, roomName: string, userId: string, userName: string, token: string) {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<WsMessage[]>([]);
    const [participants, setParticipants] = useState<RoomParticipants[]>([]);
    const socketRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
    const reconnectAttemptsRef = useRef(0);
    const paramsRef = useRef({ roomId, roomName, userId, userName, token });
    const hasJoinedRoomRef = useRef(false);

    useEffect(() => {
        paramsRef.current = { roomId, roomName, userId, userName, token };
        if (roomId !== paramsRef.current.roomId) {
            hasJoinedRoomRef.current = false;
        }
    }, [roomId, roomName, userId, userName, token]);

    const connectWebSocket = useCallback(() => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            return;
        }
        if (socketRef.current) {
            try {
                socketRef.current.close();
            } catch (err) {
                console.error('Error closing existing socket:', err);
            }
        }

        try {
            const wsUrl = `${WS_URL}?token=${encodeURIComponent(paramsRef.current.token)}`;
            console.log('Connecting to WebSocket...');

            const ws = new WebSocket(wsUrl);

            const connectionTimeout = setTimeout(() => {
                if (ws.readyState !== WebSocket.OPEN) {
                    console.log('WebSocket connection timeout, closing...');
                    ws.close();
                }
            }, 5000);

            const handleOpen = () => {
                clearTimeout(connectionTimeout);
                console.log('WebSocket connected successfully');
                setIsConnected(true);
                reconnectAttemptsRef.current = 0;
                hasJoinedRoomRef.current = false;
                setTimeout(() => {
                    const { roomId, roomName, userId, userName } = paramsRef.current;
                    console.log(`Joining room ${roomId} as ${userName}`);

                    ws.send(JSON.stringify({
                        type: WS_DATA_TYPE.JOIN,
                        roomId,
                        roomName,
                        userId,
                        userName
                    }));

                    hasJoinedRoomRef.current = true;
                }, 100);
            };

            const handleMessage = (event: MessageEvent) => {
                try {
                    const data: WebSocketMessage = JSON.parse(event.data);
                    console.log('Received WebSocket message:', data);

                    switch (data.type) {
                        case WS_DATA_TYPE.USER_JOINED:
                            if (data.participants && Array.isArray(data.participants)) {
                                setParticipants(data.participants);
                            }

                            else if (data.userId && data.userName) {
                                setParticipants(prev => {
                                    const exists = prev.some(p => p.userId === data.userId);
                                    if (!exists) {
                                        return [...prev, {
                                            userId: data.userId!,
                                            userName: data.userName!
                                        }];
                                    }
                                    return prev;
                                });
                            }
                            break;

                        case WS_DATA_TYPE.USER_LEFT:
                            if (data.userId) {
                                console.log(`User left: ${data.userId}`);
                                setParticipants(prev => prev.filter(user => user.userId !== data.userId));
                            }
                            break;

                        case WS_DATA_TYPE.DRAW:
                        case WS_DATA_TYPE.UPDATE:
                            if (data.message) {
                                const parsedMessage = JSON.parse(data.message);
                                const timestamp = data.timestamp || new Date().toISOString();
                                setMessages(prev => [...prev, {
                                    type: data.type,
                                    userId: data.userId! || paramsRef.current.userId,
                                    userName: data.userName! || paramsRef.current.userName,
                                    message: parsedMessage,
                                    timestamp
                                }]);
                            }
                            break;

                        case WS_DATA_TYPE.ERASER:
                            if (data.id) {
                                setMessages(prev => [...prev, {
                                    type: data.type,
                                    id: data.id,
                                    userId: data.userId || paramsRef.current.userId,
                                    userName: data.userName || paramsRef.current.userName,
                                    timestamp: data.timestamp!
                                }]);
                            }
                            break;
                    }
                } catch (err) {
                    console.error('Error processing message:', err, event.data);
                }
            };

            const handleClose = (event: CloseEvent) => {
                clearTimeout(connectionTimeout);
                setIsConnected(false);
                console.log(`WebSocket closed with code ${event.code}: ${event.reason}`);
                if (event.code !== 1000 && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
                    const delay = Math.min(1000 * 2 ** reconnectAttemptsRef.current, 30000);
                    console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1})`);

                    reconnectTimeoutRef.current = setTimeout(() => {
                        reconnectAttemptsRef.current += 1;
                        connectWebSocket();
                    }, delay);
                }
            };

            const handleError = (error: Event) => {
                console.error('WebSocket error:', error);
            };

            ws.addEventListener('open', handleOpen);
            ws.addEventListener('message', handleMessage);
            ws.addEventListener('close', handleClose);
            ws.addEventListener('error', handleError);

            socketRef.current = ws;

            return () => {
                ws.removeEventListener('open', handleOpen);
                ws.removeEventListener('message', handleMessage);
                ws.removeEventListener('close', handleClose);
                ws.removeEventListener('error', handleError);
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

            if (socketRef.current) {
                try {
                    if (socketRef.current.readyState === WebSocket.OPEN && hasJoinedRoomRef.current) {
                        console.log(`Leaving room ${paramsRef.current.roomId}`);
                        socketRef.current.send(JSON.stringify({
                            type: WS_DATA_TYPE.LEAVE,
                            roomId: paramsRef.current.roomId
                        }));
                    }
                    socketRef.current.close(1000, 'Component unmounted');
                } catch (err) {
                    console.error('Error during cleanup:', err);
                }
            }
        };
    }, [connectWebSocket]);

    const sendMessage = useCallback((content: string) => {
        if (!content?.trim()) {
            console.warn('Cannot send empty message');
            return;
        }
        console.log("sendMessage content = ", JSON.parse(content))
        const parsedContent = JSON.parse(content);
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            const { roomName, userId, userName } = paramsRef.current;
            if (parsedContent.type === WS_DATA_TYPE.DRAW) {
                socketRef.current.send(JSON.stringify({
                    type: WS_DATA_TYPE.DRAW,
                    id: parsedContent.id,
                    message: JSON.stringify(parsedContent.message),
                    roomId: parsedContent.roomId,
                    roomName,
                    userId,
                    userName
                }));
            } else if (parsedContent.type === WS_DATA_TYPE.UPDATE) {
                socketRef.current.send(JSON.stringify({
                    type: WS_DATA_TYPE.UPDATE,
                    message: JSON.stringify(parsedContent.message),
                    id: parsedContent.id,
                    roomId: parsedContent.roomId,
                    roomName,
                    userId,
                    userName
                }));
            } else if (parsedContent.type === WS_DATA_TYPE.ERASER) {
                socketRef.current.send(JSON.stringify({
                    type: WS_DATA_TYPE.ERASER,
                    id: parsedContent.id,
                    roomId: parsedContent.roomId,
                    roomName,
                    userId,
                    userName
                }));
            }
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