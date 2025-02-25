"use client"

import { Game } from "@/draw/Game";
import { bgFill, ShapeType, strokeFill, strokeWidth } from "@/types/canvas"
import { useCallback, useEffect, useRef, useState } from "react"
import { Toolbar } from "../toolbar";
import { Sidebar } from "./Sidebar";
import { Scale } from "../Scale";
import { useWebSocket } from "@/hooks/useWebSocket";

type Shape =
    | {
        type: "rect";
        x: number;
        y: number;
        width: number;
        height: number;
        strokeWidth: number;
        strokeFill: string;
        bgFill: string;
    }
    | {
        type: "ellipse";
        centerX: number;
        centerY: number;
        radX: number;
        radY: number;
        strokeWidth: number;
        strokeFill: string;
        bgFill: string;
    }
    | {
        type: "line";
        fromX: number;
        fromY: number;
        toX: number;
        toY: number;
        strokeWidth: number;
        strokeFill: string;
    }
    | {
        type: "pen";
        points: { x: number; y: number }[];
        strokeWidth: number;
        strokeFill: string;
    };

export function Canvas({ roomName, roomId, userId, userName }: { roomName: string; roomId: string; userId: string; userName: string; }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [game, setGame] = useState<Game>()
    const [scale, setScale] = useState<number>(1)
    const [activeTool, setActiveTool] = useState<ShapeType>("grab")
    const [strokeFill, setStrokeFill] = useState<strokeFill>("rgba(211, 211, 211)")
    const [strokeWidth, setStrokeWidth] = useState<strokeWidth>(1)
    const [bgFill, setBgFill] = useState<bgFill>("rgba(0, 0, 0, 0)")
    const [grabbing, setGrabbing] = useState(false)
    const [existingShapes, setExistingShapes] = useState<Shape[]>([])

    const { isConnected, messages, sendMessage } = useWebSocket(
        roomId,
        roomName,
        userId,
        userName
    );

    useEffect(() => {
        if (messages.length > 0) {
            try {
                // Process all messages that contain drawing data
                messages.forEach((message) => {
                    try {
                        const data = JSON.parse(message.content);
                        if (data.type === "draw") {
                            const shape = JSON.parse(data.data).shape;
                            setExistingShapes((prevShapes) => [...prevShapes, shape]);
                        } else if (data.type === "eraser") {
                            const shape = JSON.parse(data.data).shape;
                            setExistingShapes((prevShapes) =>
                                prevShapes.filter((s) => JSON.stringify(s) !== JSON.stringify(shape))
                            );
                        }
                    } catch (e) {
                        console.error("Error processing message:", e);
                    }
                });
            } catch (e) {
                console.error("Error processing messages:", e);
            }
        }
    }, [messages]);

    useEffect(() => {
        game?.setTool(activeTool)
        game?.setStrokeWidth(strokeWidth)
        game?.setStrokeFill(strokeFill)
        game?.setBgFill(bgFill)
    })

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case "1":
                    setActiveTool("grab");
                    break;
                case "2":
                    setActiveTool("rectangle");
                    break;
                case "3":
                    setActiveTool("ellipse");
                    break;
                case "4":
                    setActiveTool("line");
                    break;
                case "5":
                    setActiveTool("pen");
                    break;
                case "6":
                    setActiveTool("eraser");
                    break;
                default:
                    break;
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [setActiveTool]);

    // Handle WebSocket messages for the Game class
    const handleSendDrawing = useCallback((msgData: string) => {
        if (isConnected) {
            sendMessage(msgData);
        }
    }, [isConnected, sendMessage]);


    useEffect(() => {
        if (canvasRef.current) {
            const g = new Game(
                canvasRef.current,
                roomId,
                handleSendDrawing,
                roomName,
                (newScale) => setScale(newScale),
                existingShapes
            )
            setGame(g)

            if (activeTool === "grab") {
                const handleGrab = () => {
                    setGrabbing((prev) => !prev)
                }

                document.addEventListener("mousedown", handleGrab)
                document.addEventListener("mouseup", handleGrab)

                return () => {
                    document.removeEventListener("mousedown", handleGrab)
                    document.removeEventListener("mouseup", handleGrab)
                }

            }
            return () => {
                g.destroy()

            }
        }

    }, [activeTool, canvasRef, existingShapes, handleSendDrawing, roomId, roomName])


    useEffect(() => {
        if (game?.outputScale) {
            setScale(game.outputScale);
        }
    }, [game?.outputScale]);

    return (
        <div className={`h-screen overflow-hidden 
            ${(activeTool === "grab") ?
                (grabbing ? "cursor-grabbing" : "cursor-grab") :
                "cursor-crosshair"} `}>

            <Toolbar activeTool={activeTool} setActiveTool={setActiveTool} />
            <Sidebar activeTool={activeTool}
                strokeFill={strokeFill}
                setStrokeFill={setStrokeFill}
                strokeWidth={strokeWidth}
                setStrokeWidth={setStrokeWidth}
                bgFill={bgFill}
                setBgFill={setBgFill} />
            <Scale scale={scale} />
            <canvas ref={canvasRef} />
        </div>
    )
}