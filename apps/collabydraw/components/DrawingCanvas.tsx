import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { WS_DATA_TYPE } from '@repo/common/types';

type DrawingElement = {
  id: string;
  type: 'line' | 'rectangle' | 'ellipse' | 'text';
  points: number[][];
  color: string;
  width: number;
  userId: string;
};

export function DrawingCanvas() {
  const { roomId } = useParams();
  const { data: session } = useSession();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [currentElement, setCurrentElement] = useState<DrawingElement | null>(null);
  const [tool, setTool] = useState<'line' | 'rectangle' | 'ellipse' | 'text'>('line');
  const [color, setColor] = useState('#000000');
  const [width, setWidth] = useState(2);

  // WebSocket setup
  useEffect(() => {
    if (!roomId || !session?.user?.id) return;

    const token = localStorage.getItem('ws_token') || '';
    const ws = new WebSocket(`ws://localhost:8080?token=${token}`);

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
      ws.send(JSON.stringify({
        type: WS_DATA_TYPE.JOIN,
        roomId,
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === WS_DATA_TYPE.DRAW) {
          setElements((prevElements) => [...prevElements, data.element]);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    wsRef.current = ws;

    return () => {
      if (wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: WS_DATA_TYPE.LEAVE,
          roomId,
        }));
        wsRef.current.close();
      }
    };
  }, [roomId, session]);

  // Canvas rendering
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all elements
    elements.forEach((element) => {
      drawElement(ctx, element);
    });

    // Draw current element
    if (currentElement) {
      drawElement(ctx, currentElement);
    }
  }, [elements, currentElement]);

  const drawElement = (ctx: CanvasRenderingContext2D, element: DrawingElement) => {
    ctx.strokeStyle = element.color;
    ctx.lineWidth = element.width;
    ctx.beginPath();

    switch (element.type) {
      case 'line':
        for (let i = 0; i < element.points.length - 1; i++) {
          ctx.moveTo(element.points[i][0], element.points[i][1]);
          ctx.lineTo(element.points[i + 1][0], element.points[i + 1][1]);
        }
        break;
      case 'rectangle':
        const [startX, startY] = element.points[0];
        const [endX, endY] = element.points[element.points.length - 1];
        ctx.rect(startX, startY, endX - startX, endY - startY);
        break;
      case 'ellipse':
        const [centerX, centerY] = element.points[0];
        const [radiusX, radiusY] = [
          Math.abs(element.points[element.points.length - 1][0] - centerX),
          Math.abs(element.points[element.points.length - 1][1] - centerY),
        ];
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        break;
      case 'text':
        // Implement text rendering if needed
        break;
    }

    ctx.stroke();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !session?.user?.id) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setCurrentElement({
      id: Date.now().toString(),
      type: tool,
      points: [[x, y]],
      color,
      width,
      userId: session.user.id,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentElement || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentElement({
      ...currentElement,
      points: [...currentElement.points, [x, y]],
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentElement || !wsRef.current) return;

    setIsDrawing(false);
    setElements((prevElements) => [...prevElements, currentElement]);

    // Send the drawing to WebSocket server
    wsRef.current.send(JSON.stringify({
      type: WS_DATA_TYPE.DRAW,
      roomId,
      element: currentElement,
    }));

    setCurrentElement(null);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex justify-between p-2 bg-gray-200">
        <div className="flex space-x-2">
          <button
            className={`px-2 py-1 rounded ${tool === 'line' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
            onClick={() => setTool('line')}
          >
            Line
          </button>
          <button
            className={`px-2 py-1 rounded ${tool === 'rectangle' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
            onClick={() => setTool('rectangle')}
          >
            Rectangle
          </button>
          <button
            className={`px-2 py-1 rounded ${tool === 'ellipse' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
            onClick={() => setTool('ellipse')}
          >
            Ellipse
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-8 w-8"
          />
          <select
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            className="px-2 py-1 rounded bg-white"
          >
            <option value="2">Thin</option>
            <option value="4">Medium</option>
            <option value="6">Thick</option>
          </select>
        </div>
      </div>
      <div className="flex-1 overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={window.innerWidth}
          height={window.innerHeight - 50}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};