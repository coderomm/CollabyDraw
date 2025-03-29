'use client'

import { useCallback, useEffect, useRef, useState } from 'react';
import { RoomParticipants, WsDataType, WebSocketMessage } from '@repo/common/types';
import { ExistingWsMessages, Shape } from '@/types/canvas';
import { getShapes } from '@/actions/shape';
import { WS_URL } from '@/config/constants';
import { MessageQueue } from '@/draw/MessageQueue';

export function useWebSocket(roomId: string, roomName: string, userId: string, userName: string, token: string) {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<Shape[]>([]);
    const [existingMsgs, setExistingMsgs] = useState<ExistingWsMessages | null>(null);
    const [participants, setParticipants] = useState<RoomParticipants[]>([]);
    const socketRef = useRef<WebSocket | null>(null);

    const paramsRef = useRef({ roomId, roomName, userId, userName, token });

    useEffect(() => {
        paramsRef.current = { roomId, roomName, userId, userName, token };
    }, [roomId, roomName, userId, userName, token]);

    const connectWebSocket = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
            setExistingMsgs(null);
        }

        const { roomId, roomName, userId, userName, token } = paramsRef.current;
        const wsUrl = `${WS_URL}?token=${encodeURIComponent(token)}`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            setIsConnected(true);
            ws.send(JSON.stringify({
                type: WsDataType.JOIN,
                roomId,
                roomName,
                userId,
                userName
            }));
        };

        ws.onmessage = async (event: MessageEvent) => {
            try {
                const data: WebSocketMessage = JSON.parse(event.data);

                switch (data.type) {
                    case WsDataType.USER_JOINED:
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
                        if (data.userId === paramsRef.current.userId) {
                            try {
                                const getShapesResult = await getShapes({ roomName: paramsRef.current.roomName })

                                if (getShapesResult.success && getShapesResult.shapes?.length) {
                                    setExistingMsgs({
                                        type: data.type,
                                        userId: data.userId || userId,
                                        userName: data.userName || userName,
                                        message: getShapesResult.shapes,
                                        timestamp: data.timestamp || new Date().toISOString()
                                    });
                                }
                            } catch (error) {
                                console.error("Error fetching shapes:", error);
                            }
                        }
                        break;

                    case WsDataType.USER_LEFT:
                        if (data.userId) {
                            setParticipants(prev => prev.filter(user => user.userId !== data.userId));
                        }
                        break;

                    case WsDataType.DRAW: {
                        // const shape = JSON.parse(data.message!);
                        // setMessages(prev => [...prev, shape]);
                        if (data.userId !== userId) {
                            const shape = JSON.parse(data.message!);
                            setMessages(prev => [...prev, shape]);
                        }
                        break;
                    }

                    case WsDataType.UPDATE: {
                        if (data.userId !== userId) {
                            const updatedShape = JSON.parse(data.message!);
                            setMessages(prev =>
                                prev.map(shape =>
                                    shape.id === data.id ? updatedShape : shape
                                )
                            );
                        }
                        break;
                    }

                    case WsDataType.ERASER: {
                        if (data.userId !== userId) {
                            setMessages(prev => prev.filter(shape => shape.id !== data.id));
                        }
                        break;
                    }
                }
            } catch (err) {
                console.error('Error processing message:', err);
            }
        };

        ws.onclose = (event) => {
            if (event.code === 1001 || event.code === 1005) {
                console.log(`Reconnecting ${userId}...`);
                setTimeout(connectWebSocket, 1000);
            } else {
                setIsConnected(false);
            }
        };

        ws.onerror = (error) => {
            console.warn('WebSocket error:', error);
            setIsConnected(false);
        };

        socketRef.current = ws;
    }, []);

    useEffect(() => {
        connectWebSocket();

        return () => {
            if (socketRef.current) {
                if (socketRef.current.readyState === WebSocket.OPEN) {
                    socketRef.current.send(JSON.stringify({
                        type: WsDataType.LEAVE,
                        roomId: paramsRef.current.roomId
                    }));
                }
                socketRef.current.close();
                socketRef.current = null;
                setExistingMsgs(null);
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
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            const basePayload = {
                roomName,
                userId,
                userName,
                roomId: parsedContent.roomId
            };

            switch (parsedContent.type) {
                case WsDataType.DRAW:
                    socketRef.current.send(JSON.stringify({
                        ...basePayload,
                        type: WsDataType.DRAW,
                        id: parsedContent.id,
                        message: JSON.stringify(parsedContent.message)
                    }));
                    break;
                case WsDataType.UPDATE:
                    socketRef.current.send(JSON.stringify({
                        ...basePayload,
                        type: WsDataType.UPDATE,
                        id: parsedContent.id,
                        message: JSON.stringify(parsedContent.message)
                    }));
                    break;
                case WsDataType.ERASER:
                    socketRef.current.send(JSON.stringify({
                        ...basePayload,
                        type: WsDataType.ERASER,
                        id: parsedContent.id
                    }));
                    break;

                case WsDataType.CLOSE_ROOM:
                    socketRef.current.send(JSON.stringify({
                        ...basePayload,
                        type: WsDataType.CLOSE_ROOM,
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

    useEffect(() => {
        if (isConnected) {
            MessageQueue.flush((message) => {
                if (socketRef.current?.readyState === WebSocket.OPEN) {
                    socketRef.current.send(JSON.stringify(message));
                    return true;
                }
                return false;
            });
        }

        const interval = setInterval(() => {
            if (isConnected) {
                MessageQueue.flush((message) => {
                    if (socketRef.current?.readyState === WebSocket.OPEN) {
                        socketRef.current.send(JSON.stringify(message));
                        return true;
                    }
                    return false;
                });
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [isConnected]);

    return {
        isConnected,
        messages,
        existingMsgs,
        participants,
        sendMessage
    };
}