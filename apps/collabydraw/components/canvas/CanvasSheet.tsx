"use client"

import { Game } from "@/draw/Game";
import { BgFill, canvasBgLight, StrokeEdge, StrokeFill, StrokeStyle, StrokeWidth, ToolType } from "@/types/canvas";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Scale } from "../Scale";
import { MobileNavbar } from "../mobile-navbar";
import { useTheme } from "next-themes";
import { MainMenuStack } from "../MainMenuStack";
import { ToolMenuStack } from "../ToolMenuStack";
import SidebarTriggerButton from "../SidebarTriggerButton";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Toolbar from "../Toolbar";
import ScreenLoading from "../ScreenLoading";
import CollaborationStart from "../CollaborationStartBtn";
import { cn } from "@/lib/utils";
import { RoomParticipants, WebSocketMessage, WS_DATA_TYPE } from "@repo/common/types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';

export const CanvasSheet = React.memo(function CanvasSheet({ roomName, roomId, userId, userName, token }: { roomName: string; roomId: string; userId: string; userName: string; token: string }) {
    const { theme } = useTheme()
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<Game>();
    const [scale, setScale] = useState<number>(1);
    const [activeTool, setActiveTool] = useState<ToolType>("grab");
    const [strokeFill, setStrokeFill] = useState<StrokeFill>("#f08c00");
    const [strokeWidth, setStrokeWidth] = useState<StrokeWidth>(1);
    const [bgFill, setBgFill] = useState<BgFill>("#00000000");
    const [strokeEdge, setStrokeEdge] = useState<StrokeEdge>("round");
    const [strokeStyle, setStrokeStyle] = useState<StrokeStyle>("solid");
    const [grabbing, setGrabbing] = useState(false);
    const paramsRef = useRef({ roomId, roomName, userId, userName });
    const activeToolRef = useRef(activeTool);
    const strokeFillRef = useRef(strokeFill);
    const strokeWidthRef = useRef(strokeWidth);
    const strokeEdgeRef = useRef(strokeEdge);
    const strokeStyleRef = useRef(strokeStyle);
    const bgFillRef = useRef(bgFill);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [canvasColor, setCanvasColor] = useState<string>(canvasBgLight[0]);
    const canvasColorRef = useRef(canvasColor);
    const { matches, isLoading } = useMediaQuery('md');
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [participants, setParticipants] = useState<RoomParticipants[]>([]);
    const gameRef = useRef<Game | null>(null);
    const socketConnected = useRef(false);

    useEffect(() => {
        console.log('E1')
        if (!roomId || !roomName || !userId || !userName || !token) return;
        if (socket || socketConnected.current) return;
        const wsUrl = `${WS_URL}?token=${encodeURIComponent(token)}`;
        const ws = new WebSocket(wsUrl);
        socketConnected.current = true;

        ws.onopen = () => {
            ws.send(JSON.stringify({
                type: WS_DATA_TYPE.JOIN,
                roomId,
                roomName,
                userId,
                userName
            }));
            setSocket(ws);
        };

        ws.onmessage = (event) => {
            const data: WebSocketMessage = JSON.parse(event.data);

            if (data.participants) {
                setParticipants(data.participants);
            } else if (data.type === WS_DATA_TYPE.USER_JOINED) {
                setParticipants(prev => {
                    const exists = prev.some(p => p.userId === data.userId);
                    if (!exists) {
                        return [...prev, { userId: data.userId!, userName: data.userName! }];
                    }
                    return prev;
                });
            } else if (data.type === WS_DATA_TYPE.USER_LEFT) {
                setParticipants(prev => prev.filter(user => user.userId !== data.userId));
            }

            if ([WS_DATA_TYPE.DRAW, WS_DATA_TYPE.ERASER, WS_DATA_TYPE.UPDATE].includes(data.type)) {
                gameRef.current?.handleWebSocketMessage(data);
            }
        };

        ws.onerror = (error) => console.error('WebSocket error:', error);

        return () => {
            ws.close();
            socketConnected.current = false;
        };
    }, [roomId, roomName, userId, userName, token]);

    useEffect(() => {
        console.log('E2')
        paramsRef.current = { roomId, roomName, userId, userName };
    }, [roomId, roomName, userId, userName]);

    useEffect(() => {
        console.log('E3')
        setCanvasColor(canvasBgLight[0]);
    }, [theme])

    useEffect(() => {
        console.log('E4')
        const handleResize = () => {
            if (canvasRef.current && game) {
                const canvas = canvasRef.current;
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                game.handleResize(window.innerWidth, window.innerHeight);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [game]);

    // useEffect(() => {
    //     console.log('E5')
    //     game?.setTool(activeTool)
    //     game?.setStrokeWidth(strokeWidth)
    //     game?.setStrokeFill(strokeFill)
    //     game?.setBgFill(bgFill)
    //     game?.setCanvasBgColor(canvasColor)
    //     game?.setStrokeEdge(strokeEdge)
    // });

    useEffect(() => {
        console.log('E6')
        strokeEdgeRef.current = strokeEdge;
        game?.setStrokeEdge(strokeEdge);
    }, [strokeEdge, game]);

    useEffect(() => {
        console.log('E7')
        strokeStyleRef.current = strokeStyle;
        game?.setStrokeStyle(strokeStyle);
    }, [strokeStyle, game]);

    useEffect(() => {
        console.log('E8')
        activeToolRef.current = activeTool;
        game?.setTool(activeTool);
    }, [activeTool, game]);

    useEffect(() => {
        console.log('E9')
        strokeWidthRef.current = strokeWidth;
        game?.setStrokeWidth(strokeWidth);
    }, [strokeWidth, game]);

    useEffect(() => {
        console.log('E10')
        strokeFillRef.current = strokeFill;
        game?.setStrokeFill(strokeFill);
    }, [strokeFill, game]);

    useEffect(() => {
        console.log('E11')
        bgFillRef.current = bgFill;
        game?.setBgFill(bgFill);
    }, [bgFill, game]);

    useEffect(() => {
        console.log('E12')
        if (game && canvasColorRef.current !== canvasColor) {
            canvasColorRef.current = canvasColor;
            game.setCanvasBgColor(canvasColor);
        }
    }, [canvasColor, game]);

    useEffect(() => {
        console.log('E13')
        if (game) {
            game.setScale(scale);
        }
    }, [scale, game]);

    useEffect(() => {
        console.log('E14')
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
                    setActiveTool("diamond");
                    break;
                case "5":
                    setActiveTool("line");
                    break;
                case "6":
                    setActiveTool("pen");
                    break;
                case "7":
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
    }, []);

    // useEffect(() => {
    //     console.log('E15')
    //     try {
    //         console.log('participants = ', participants)
    //     } catch (e) {
    //         console.error("Error processing messages:", e);
    //     }
    // }, [participants]);

    useEffect(() => {
        console.log('E16')
        if (!canvasRef.current || !socket || gameRef.current) return;

        const game = new Game(
            canvasRef.current,
            paramsRef.current.roomId,
            canvasColorRef.current,
            paramsRef.current.roomName,
            (newScale) => setScale(newScale),
            [],
            false,
            socket
        );

        gameRef.current = game;
        setGame(game);

        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;

        return () => {
            gameRef.current?.destroy();
            gameRef.current = null;
        };
    }, [socket]);

    useEffect(() => {
        console.log('E17')
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
    }, [activeTool]);

    // useEffect(() => {
    //     console.log('E18')
    //     if (game?.outputScale) {
    //         setScale(game.outputScale);
    //     }
    // }, [game?.outputScale]);

    const toggleSidebar = useCallback(() => {
        console.log('E19')
        setSidebarOpen(prev => !prev);
    }, []);

    if (isLoading) {
        return <ScreenLoading />
    }

    if (!socket) {
        return <ScreenLoading content="Connecting ..." />
    }

    return (
        <div className={cn("collabydraw h-screen overflow-hidden",
            activeTool === "eraser"
                ? "cursor-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAOBJREFUOE9jZKAyYKSyeQzDwMD////7MDAw6EGD5hIjI+MWfMGE08sggz5+/Dj71q1bHPv27eMFGeLk5PRZTU3tBz8/fyoug7EaCDLs58+fa0NDQ9k2b96M4iBfX1+G1atX/2JnZw/GZihWAz98+PA8NjZWAt0wmMkgQxcvXvxCQEBAEt37GAaCXHf69OnFZmZmAvjC6tSpUx9MTU1j0V2JzcCqzs7OpoqKCmZ8BnZ0dPwtLy+vY2RkbENWRxcDqetlkPOpGikgA6mebGCGUi1hI8ca1bIeucXaMCi+SPU6AHRTjhWg+vuGAAAAAElFTkSuQmCC')_10_10,auto]"
                : activeTool === "grab" && !sidebarOpen
                    ? grabbing ? "cursor-grabbing" : "cursor-grab"
                    : "cursor-crosshair")}>
            <div className="App_Menu App_Menu_Top fixed z-[4] top-4 right-4 left-4 flex justify-center items-center md:grid md:grid-cols-[1fr_auto_1fr] md:gap-8 md:items-start">
                {matches && (
                    <div className="Main_Menu_Stack Sidebar_Trigger_Button md:grid md:gap-[calc(.25rem*6)] grid-cols-[auto] grid-flow-row grid-rows auto-rows-min justify-self-start">
                        <div className="relative">
                            <SidebarTriggerButton onClick={toggleSidebar} />

                            {sidebarOpen && (
                                <MainMenuStack
                                    isOpen={sidebarOpen}
                                    onClose={() => setSidebarOpen(false)}
                                    canvasColor={canvasColor}
                                    setCanvasColor={setCanvasColor}
                                    roomName={roomName}
                                />
                            )}
                        </div>

                        <ToolMenuStack activeTool={activeTool}
                            strokeFill={strokeFill}
                            setStrokeFill={setStrokeFill}
                            strokeWidth={strokeWidth}
                            setStrokeWidth={setStrokeWidth}
                            bgFill={bgFill}
                            setBgFill={setBgFill}
                            strokeEdge={strokeEdge}
                            setStrokeEdge={setStrokeEdge}
                            strokeStyle={strokeStyle}
                            setStrokeStyle={setStrokeStyle}
                        />
                    </div>
                )}
                <Toolbar
                    selectedTool={activeTool}
                    onToolSelect={setActiveTool}
                />
                {matches && (
                    <CollaborationStart participants={participants} slug={roomName} />
                )}
            </div>

            {matches && (
                <Scale scale={scale} setScale={setScale} />
            )}

            {!matches && (
                <MobileNavbar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    canvasColor={canvasColor}
                    setCanvasColor={setCanvasColor}
                    scale={scale}
                    setScale={setScale}

                    activeTool={activeTool}
                    strokeFill={strokeFill}
                    setStrokeFill={setStrokeFill}
                    strokeWidth={strokeWidth}
                    setStrokeWidth={setStrokeWidth}
                    bgFill={bgFill}
                    setBgFill={setBgFill}

                    strokeEdge={strokeEdge}
                    setStrokeEdge={setStrokeEdge}
                    strokeStyle={strokeStyle}
                    setStrokeStyle={setStrokeStyle}

                    roomName={roomName}
                />
            )}
            <canvas className={cn("collabydraw collabydraw-canvas", theme === 'dark' ? 'collabydraw-canvas-dark' : '')} ref={canvasRef} />
        </div >
    )
});