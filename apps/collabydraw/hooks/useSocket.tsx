'use client'

import { useCallback, useEffect, useRef, useState } from 'react';
import { RoomParticipants, WS_DATA_TYPE, WebSocketMessage } from '@repo/common/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';

export function useSocket(roomId: string, roomName: string, userId: string, userName: string, token: string) {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<WebSocketMessage[]>([]);
    const [participants, setParticipants] = useState<RoomParticipants[]>([]);
    const socketRef = useRef<WebSocket | null>(null);
    const paramsRef = useRef({ roomId, roomName, userId, userName, token });

    useEffect(() => {
        paramsRef.current = { roomId, roomName, userId, userName, token };
    }, [roomId, roomName, userId, userName, token]);

    const connectWebSocket = useCallback(() => {
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

            const handleOpen = () => {
                console.log('WebSocket connected successfully');
                setIsConnected(true);
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

                }, 100);
            };

            const handleMessage = (event: MessageEvent) => {
                try {
                    const data: WebSocketMessage = JSON.parse(event.data);
                    console.log('Received WebSocket message:', data.type);

                    if (data.participants && Array.isArray(data.participants)) {
                        console.log('Updating participants list:', data.participants);
                        setParticipants(data.participants as RoomParticipants[]);
                    }

                    switch (data.type) {
                        case WS_DATA_TYPE.USER_JOINED:
                            if (data.participants && Array.isArray(data.participants)) {
                                setParticipants(data.participants as RoomParticipants[]);
                            }

                            else if (data.userId) {
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
                        case WS_DATA_TYPE.ERASER:
                        case WS_DATA_TYPE.UPDATE:
                            if (data.message) {
                                const timestamp = data.timestamp || new Date().toISOString();
                                setMessages(prev => [...prev, {
                                    type:data.type,
                                    roomId:data.roomId!,
                                    userId: data.userId!,
                                    userName: data.userName!,
                                    message: data.message!,
                                    timestamp
                                }]);
                            }
                            break;
                    }
                } catch (err) {
                    console.error('Error processing message:', err, event.data);
                }
            };

            const handleClose = (event: CloseEvent) => {
                setIsConnected(false);
                console.log(`WebSocket closed with code ${event.code}: ${event.reason}`);
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
            if (socketRef.current) {
                try {
                    if (socketRef.current.readyState === WebSocket.OPEN) {
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
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            const { roomId, roomName, userId, userName } = paramsRef.current;
            socketRef.current.send(JSON.stringify({
                type: WS_DATA_TYPE.DRAW,
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

    const sendEraserData = useCallback((eraserData: string) => {
        if (!eraserData) {
            console.warn('Cannot send empty eraser data');
            return;
        }
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            const { roomId, roomName, userId, userName } = paramsRef.current;
            socketRef.current.send(JSON.stringify({
                type: WS_DATA_TYPE.ERASER,
                message: eraserData,
                roomId,
                roomName,
                userId,
                userName
            }));
        } else {
            console.warn('Cannot send eraser data: WebSocket not connected');
        }
    }, []);

    return {
        isConnected,
        messages,
        participants,
        sendMessage,
        sendEraserData
    };
}