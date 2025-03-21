// hooks/useRoomWebSocket.ts
'use client'

import { useEffect, useState, useCallback, useRef } from 'react';
import { WS_DATA_TYPE, WebSocketMessage, RoomParticipants } from '@repo/common/types';

const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY = 3000;

export function useRoomWebSocket(
  roomId: string,
  roomName: string,
  userId: string,
  userName: string,
  token: string
) {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [participants, setParticipants] = useState<RoomParticipants[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCount = useRef(0);
  const paramsRef = useRef({ roomId, roomName, userId, userName, token });

  const connect = useCallback(() => {
    if (wsRef.current) return;

    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}?token=${encodeURIComponent(token)}`
    );

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      reconnectCount.current = 0;
      ws.send(JSON.stringify({
        type: WS_DATA_TYPE.JOIN,
        ...paramsRef.current
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        setMessages(prev => [...prev, data]);

        // Update participants list
        if (data.type === WS_DATA_TYPE.USER_JOINED && data.participants) {
          setParticipants(data.participants);
        } else if (data.type === WS_DATA_TYPE.USER_LEFT) {
          setParticipants(prev =>
            prev.filter(p => p.userId !== data.userId)
          );
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      if (reconnectCount.current < MAX_RECONNECT_ATTEMPTS) {
        setTimeout(connect, RECONNECT_DELAY);
        reconnectCount.current++;
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      ws.close();
    };

    wsRef.current = ws;
  }, [token]);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
  }, []);

  useEffect(() => {
    paramsRef.current = { roomId, roomName, userId, userName, token };
  }, [roomId, roomName, userId, userName, token]);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
      setMessages([]);
      setParticipants([]);
    };
  }, [connect, disconnect]);

  const sendMessage = useCallback((type: WS_DATA_TYPE, payload: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type,
        ...paramsRef.current,
        ...payload,
        timestamp: new Date().toISOString()
      }));
    }
  }, []);

  return {
    isConnected,
    messages,
    participants,
    sendMessage
  };
}