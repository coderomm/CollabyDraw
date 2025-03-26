'use client'

import { useCallback, useEffect, useRef, useState } from 'react';
import { RoomParticipants, WS_DATA_TYPE, WebSocketMessage } from '@repo/common/types';
import { WsMessage } from '@/types/canvas';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';

export function useWebSocket(roomId: string, roomName: string, userId: string, userName: string, token: string) {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<WsMessage[]>([]);
    const [participants, setParticipants] = useState<RoomParticipants[]>([]);
    const socketRef = useRef<WebSocket | null>(null);

    // Stable references to prevent unnecessary re-renders
    const paramsRef = useRef({ roomId, roomName, userId, userName, token });

    // Update ref when parameters change
    useEffect(() => {
        paramsRef.current = { roomId, roomName, userId, userName, token };
        console.log('Inside useWebSocket hook')
    }, [roomId, roomName, userId, userName, token]);

    const connectWebSocket = useCallback(() => {
        // Prevent multiple connections
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
            console.log('socketRef.current = null;')
        }

        const { roomId, roomName, userId, userName, token } = paramsRef.current;
        const wsUrl = `${WS_URL}?token=${encodeURIComponent(token)}`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            setIsConnected(true);
            // Send join room message
            ws.send(JSON.stringify({
                type: WS_DATA_TYPE.JOIN,
                roomId,
                roomName,
                userId,
                userName
            }));
            console.log("'JOIN' req sent")
        };

        ws.onmessage = (event: MessageEvent) => {
            try {
                const data: WebSocketMessage = JSON.parse(event.data);
                console.log('Received ws msg = ', data)

                switch (data.type) {
                    case WS_DATA_TYPE.USER_JOINED:
                        setParticipants(prev => {
                            if (data.participants && Array.isArray(data.participants)) {
                                return data.participants;
                            }
                            if (data.userId && data.userName) {
                                const exists = prev.some(p => p.userId === data.userId);
                                if (!exists) {
                                    return [...prev, {
                                        userId: data.userId,
                                        userName: data.userName
                                    }];
                                }
                            }
                            return prev;
                        });
                        break;

                    case WS_DATA_TYPE.USER_LEFT:
                        if (data.userId) {
                            setParticipants(prev => prev.filter(user => user.userId !== data.userId));
                        }
                        break;

                    case WS_DATA_TYPE.DRAW:
                    case WS_DATA_TYPE.UPDATE:
                    case WS_DATA_TYPE.ERASER:
                        if (data.message || data.id) {
                            setMessages(prev => [...prev, {
                                type: data.type,
                                id: data.id,
                                userId: data.userId || userId,
                                userName: data.userName || userName,
                                message: data.message ? JSON.parse(data.message) : undefined,
                                timestamp: data.timestamp || new Date().toISOString()
                            }]);
                        }
                        break;
                }
            } catch (err) {
                console.error('Error processing message:', err);
            }
        };

        ws.onclose = () => {
            setIsConnected(false);
            console.log('Called ws.onclose()')
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setIsConnected(false);
        };

        socketRef.current = ws;
    }, []); // Empty dependency array

    // Connect only once when component mounts
    useEffect(() => {
        console.log('Calling connectWebSocket();')
        connectWebSocket();

        return () => {
            if (socketRef.current) {
                if (socketRef.current.readyState === WebSocket.OPEN) {
                    socketRef.current.send(JSON.stringify({
                        type: WS_DATA_TYPE.LEAVE,
                        roomId: paramsRef.current.roomId
                    }));
                    console.log('LEAVE req sent')
                }
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, [connectWebSocket]);

    const sendMessage = useCallback((content: string) => {
        const { roomName, userId, userName } = paramsRef.current;

        if (!content?.trim()) {
            console.warn('Cannot send empty message');
            return;
        }

        const parsedContent = JSON.parse(content);
        console.log('parsedContent = ', parsedContent)
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            const basePayload = {
                roomName,
                userId,
                userName,
                roomId: parsedContent.roomId
            };

            switch (parsedContent.type) {
                case WS_DATA_TYPE.DRAW:
                    socketRef.current.send(JSON.stringify({
                        ...basePayload,
                        type: WS_DATA_TYPE.DRAW,
                        id: parsedContent.id,
                        message: JSON.stringify(parsedContent.message)
                    }));
                    break;
                case WS_DATA_TYPE.UPDATE:
                    socketRef.current.send(JSON.stringify({
                        ...basePayload,
                        type: WS_DATA_TYPE.UPDATE,
                        id: parsedContent.id,
                        message: JSON.stringify(parsedContent.message)
                    }));
                    break;
                case WS_DATA_TYPE.ERASER:
                    socketRef.current.send(JSON.stringify({
                        ...basePayload,
                        type: WS_DATA_TYPE.ERASER,
                        id: parsedContent.id
                    }));
                    break;

                case WS_DATA_TYPE.CLOSE_ROOM:
                    socketRef.current.send(JSON.stringify({
                        ...basePayload,
                        type: WS_DATA_TYPE.CLOSE_ROOM,
                        roomId: paramsRef.current.roomId,
                        userId: paramsRef.current.userId,
                        userName: paramsRef.current.userName,
                    }));
                    break;
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