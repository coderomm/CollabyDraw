"use client"

import { Game } from "@/draw/Game";
import { BgFill, canvasBgLight, Shape, StrokeEdge, StrokeFill, StrokeStyle, StrokeWidth, ToolType } from "@/types/canvas";
import React, { SetStateAction, useCallback, useEffect, useRef, useState } from "react";
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
import { useWebSocket } from "@/hooks/useWebSocket";
import { WS_DATA_TYPE } from "@repo/common/types";

export default function CanvasSheet({ roomName, roomId, userId, userName, token }: {
    roomName: string; roomId: string; userId: string; userName: string; token: string;
}) {
    const { theme } = useTheme()
    const [canvasColor, setCanvasColor] = useState<string>(canvasBgLight[0]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const paramsRef = useRef({ roomId, roomName, userId, userName, token });

    const [canvasState, setCanvasState] = useState({
        game: null as Game | null,
        scale: 1,
        activeTool: "grab" as ToolType,
        strokeFill: "#f08c00" as StrokeFill,
        strokeWidth: 1 as StrokeWidth,
        bgFill: "#00000000" as BgFill,
        strokeEdge: "round" as StrokeEdge,
        strokeStyle: "solid" as StrokeStyle,
        grabbing: false,
        sidebarOpen: false,
        canvasColor: canvasBgLight[0]
    });

    const { matches, isLoading } = useMediaQuery('md');

    useEffect(() => {
        paramsRef.current = { roomId, roomName, userId, userName, token };
        console.log('E1: ', paramsRef.current)
    }, [roomId, roomName, userId, userName, token]);

    const {
        isConnected,
        messages,
        sendMessage,
        participants
    } = useWebSocket(paramsRef.current.roomId, paramsRef.current.roomName, paramsRef.current.userId, paramsRef.current.userName, paramsRef.current.token);

    useEffect(() => {
        setCanvasColor(canvasBgLight[0]);
        console.log('E2')
    }, [theme])

    useEffect(() => {
        const { game, scale } = canvasState;
        if (game) {
            game.setScale(scale);
        }

        console.log("scale sync useEffect run with scale =", scale);
    }, [canvasState.game, canvasState.scale]);

    useEffect(() => {
        const { game, activeTool, strokeWidth, strokeFill, bgFill, canvasColor, strokeEdge, strokeStyle } = canvasState;

        if (game) {
            game.setTool(activeTool);
            game.setStrokeWidth(strokeWidth);
            game.setStrokeFill(strokeFill);
            game.setBgFill(bgFill);
            game.setCanvasBgColor(canvasColor);
            game.setStrokeEdge(strokeEdge);
            game.setStrokeStyle(strokeStyle);
        }
        console.log('E3 = ', canvasState)
    }, [canvasState]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        const toolKeyMap: Record<string, ToolType> = {
            "1": "grab",
            "2": "rectangle",
            "3": "ellipse",
            "4": "diamond",
            "5": "line",
            "6": "pen",
            "7": "eraser"
        };

        const newTool = toolKeyMap[e.key];
        if (newTool) {
            setCanvasState(prev => ({ ...prev, activeTool: newTool }));
        }
        console.log('E4')
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processMessages = useCallback((messages: any[]) => {
        const newExistingShapes: Shape[] = [];

        messages.forEach(message => {
            switch (message.type) {
                case WS_DATA_TYPE.DRAW:
                    if (!newExistingShapes.some(s => s.id === message.id)) {
                        newExistingShapes.push(message.message);
                    }
                    break;
                case WS_DATA_TYPE.UPDATE:
                    const index = newExistingShapes.findIndex(s => s.id === message.id);
                    if (index !== -1) {
                        newExistingShapes[index] = {
                            ...newExistingShapes[index],
                            ...message.message
                        };
                    }
                    break;
                case WS_DATA_TYPE.ERASER:
                    const filteredShapes = newExistingShapes.filter(s => s.id !== message.id);
                    newExistingShapes.length = 0;
                    newExistingShapes.push(...filteredShapes);
                    break;
            }
        });

        console.log('E5')
        return newExistingShapes;
    }, []);

    const initializeGame = useCallback(() => {
        console.log('canvasRef.current = ', canvasRef.current)
        console.log('isConnected = ', isConnected)
        if (!canvasRef.current || !isConnected) return null;

        const handleSendDrawing = (msgData: string) => {
            if (isConnected) {
                sendMessage(msgData);
            }
        };

        const game = new Game(
            canvasRef.current,
            paramsRef.current.roomId,
            canvasState.canvasColor,
            handleSendDrawing,
            paramsRef.current.roomName,
            (newScale) => setCanvasState(prev => ({ ...prev, scale: newScale })),
            false
        );
        console.log('E6')
        return game;
    }, [isConnected, canvasState.canvasColor, sendMessage]);

    useEffect(() => {
        const game = initializeGame();

        if (game) {
            console.log('Called initializeGame() = ', game)
            setCanvasState(prev => ({ ...prev, game }));

            const handleResize = () => {
                if (canvasRef.current) {
                    const canvas = canvasRef.current;
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                    game.handleResize(window.innerWidth, window.innerHeight);
                }
            };

            handleResize();
            window.addEventListener('resize', handleResize);

            document.addEventListener("keydown", handleKeyDown);

            return () => {
                window.removeEventListener('resize', handleResize);
                document.removeEventListener("keydown", handleKeyDown);
                game.destroy();
            };
        }
        console.log('E7')
    }, [initializeGame, handleKeyDown]);

    useEffect(() => {
        if (messages.length > 0 && canvasState.game) {
            const processedShapes = processMessages(messages);
            console.log('processedShapes = ', processedShapes)
            canvasState.game.updateShapes(processedShapes);
        }
        console.log('E8')
    }, [messages, canvasState.game, processMessages]);

    const toggleSidebar = useCallback(() => {
        setCanvasState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
        console.log('E9')
    }, []);

    if (isLoading) {
        return <ScreenLoading />
    }

    return (
        <div className={cn("collabydraw h-screen overflow-hidden",
            canvasState.activeTool === "eraser"
                ? "cursor-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAOBJREFUOE9jZKAyYKSyeQzDwMD////7MDAw6EGD5hIjI+MWfMGE08sggz5+/Dj71q1bHPv27eMFGeLk5PRZTU3tBz8/fyoug7EaCDLs58+fa0NDQ9k2b96M4iBfX1+G1atX/2JnZw/GZihWAz98+PA8NjZWAt0wmMkgQxcvXvxCQEBAEt37GAaCXHf69OnFZmZmAvjC6tSpUx9MTU1j0V2JzcCqzs7OpoqKCmZ8BnZ0dPwtLy+vY2RkbENWRxcDqetlkPOpGikgA6mebGCGUi1hI8ca1bIeucXaMCi+SPU6AHRTjhWg+vuGAAAAAElFTkSuQmCC')_10_10,auto]"
                : canvasState.activeTool === "grab" && !canvasState.sidebarOpen
                    ? canvasState.grabbing ? "cursor-grabbing" : "cursor-grab"
                    : "cursor-crosshair")}>
            <div className="App_Menu App_Menu_Top fixed z-[4] top-4 right-4 left-4 flex justify-center items-center md:grid md:grid-cols-[1fr_auto_1fr] md:gap-8 md:items-start">
                {matches && (
                    <div className="Main_Menu_Stack Sidebar_Trigger_Button md:grid md:gap-[calc(.25rem*6)] grid-cols-[auto] grid-flow-row grid-rows auto-rows-min justify-self-start">
                        <div className="relative">
                            <SidebarTriggerButton onClick={toggleSidebar} />

                            {canvasState.sidebarOpen && (
                                <MainMenuStack
                                    isOpen={canvasState.sidebarOpen}
                                    onClose={() => setCanvasState(prev => ({ ...prev, sidebarOpen: false }))}
                                    canvasColor={canvasColor}
                                    setCanvasColor={setCanvasColor}
                                    roomName={roomName}
                                />
                            )}
                        </div>

                        <ToolMenuStack
                            activeTool={canvasState.activeTool}
                            strokeFill={canvasState.strokeFill}
                            setStrokeFill={(newStrokeFill: SetStateAction<StrokeFill>) =>
                                setCanvasState(prev => ({ ...prev, strokeFill: typeof newStrokeFill === 'function' ? newStrokeFill(prev.strokeFill) : newStrokeFill }))
                            }
                            strokeWidth={canvasState.strokeWidth}
                            setStrokeWidth={(newStrokeWidth: SetStateAction<StrokeWidth>) =>
                                setCanvasState(prev => ({ ...prev, strokeWidth: typeof newStrokeWidth === 'function' ? newStrokeWidth(prev.strokeWidth) : newStrokeWidth }))
                            }
                            bgFill={canvasState.bgFill}
                            setBgFill={(newBgFill: SetStateAction<BgFill>) =>
                                setCanvasState(prev => ({ ...prev, bgFill: typeof newBgFill === 'function' ? newBgFill(prev.bgFill) : newBgFill }))
                            }
                            strokeEdge={canvasState.strokeEdge}
                            setStrokeEdge={(newStrokeEdge: SetStateAction<StrokeEdge>) =>
                                setCanvasState(prev => ({ ...prev, strokeEdge: typeof newStrokeEdge === 'function' ? newStrokeEdge(prev.strokeEdge) : newStrokeEdge }))
                            }
                            strokeStyle={canvasState.strokeStyle}
                            setStrokeStyle={(newStrokeStyle: SetStateAction<StrokeStyle>) =>
                                setCanvasState(prev => ({ ...prev, strokeStyle: typeof newStrokeStyle === 'function' ? newStrokeStyle(prev.strokeStyle) : newStrokeStyle }))
                            }
                        />

                    </div>
                )}
                <Toolbar
                    selectedTool={canvasState.activeTool}
                    onToolSelect={(newTool: SetStateAction<ToolType>) =>
                        setCanvasState(prev => ({ ...prev, activeTool: typeof newTool === 'function' ? newTool(prev.activeTool) : newTool }))
                    }
                />

                {matches && (
                    <CollaborationStart participants={participants} slug={roomName} />
                )}
            </div>

            {matches && (
                <Scale
                    scale={canvasState.scale}
                    setScale={(newScale: SetStateAction<number>) =>
                        setCanvasState(prev => ({
                            ...prev,
                            scale: typeof newScale === 'function' ? newScale(prev.scale) : newScale
                        }))
                    }
                />

            )}

            {!matches && (
                <MobileNavbar
                    sidebarOpen={canvasState.sidebarOpen}
                    setSidebarOpen={() => setCanvasState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }))}
                    canvasColor={canvasColor}
                    setCanvasColor={setCanvasColor}
                    scale={canvasState.scale}
                    setScale={(newScale: SetStateAction<number>) =>
                        setCanvasState(prev => ({ ...prev, scale: typeof newScale === 'function' ? newScale(prev.scale) : newScale }))
                    }
                    activeTool={canvasState.activeTool}
                    setStrokeFill={(newStrokeFill: SetStateAction<StrokeFill>) =>
                        setCanvasState(prev => ({ ...prev, strokeFill: typeof newStrokeFill === 'function' ? newStrokeFill(prev.strokeFill) : newStrokeFill }))
                    }
                    strokeFill={canvasState.strokeFill}
                    strokeWidth={canvasState.strokeWidth}
                    setStrokeWidth={(newStrokeWidth: SetStateAction<StrokeWidth>) =>
                        setCanvasState(prev => ({ ...prev, strokeWidth: typeof newStrokeWidth === 'function' ? newStrokeWidth(prev.strokeWidth) : newStrokeWidth }))
                    }
                    bgFill={canvasState.bgFill}
                    setBgFill={(newBgFill: SetStateAction<BgFill>) =>
                        setCanvasState(prev => ({ ...prev, bgFill: typeof newBgFill === 'function' ? newBgFill(prev.bgFill) : newBgFill }))
                    }
                    strokeEdge={canvasState.strokeEdge}
                    setStrokeEdge={(newStrokeEdge: SetStateAction<StrokeEdge>) =>
                        setCanvasState(prev => ({ ...prev, strokeEdge: typeof newStrokeEdge === 'function' ? newStrokeEdge(prev.strokeEdge) : newStrokeEdge }))
                    }
                    strokeStyle={canvasState.strokeStyle}
                    setStrokeStyle={(newStrokeStyle: SetStateAction<StrokeStyle>) =>
                        setCanvasState(prev => ({ ...prev, strokeStyle: typeof newStrokeStyle === 'function' ? newStrokeStyle(prev.strokeStyle) : newStrokeStyle }))
                    }
                    roomName={roomName}
                />

            )}
            <canvas className={cn("collabydraw collabydraw-canvas", theme === 'dark' ? 'collabydraw-canvas-dark' : '')} ref={canvasRef} />
        </div >
    )
};