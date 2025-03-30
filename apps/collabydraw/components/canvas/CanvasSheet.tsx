"use client"

import { CanvasEngine } from "@/canvas-engine/CanvasEngine";
import { BgFill, canvasBgLight, StrokeEdge, StrokeFill, StrokeStyle, StrokeWidth, ToolType } from "@/types/canvas";
import React, { SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { Scale } from "../Scale";
import { MobileNavbar } from "../mobile-navbar";
import { useTheme } from "next-themes";
import { MainMenuStack } from "../MainMenuStack";
import { ToolMenuStack } from "../ToolMenuStack";
import SidebarTriggerButton from "../SidebarTriggerButton";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import ScreenLoading from "../ScreenLoading";
import CollaborationStart from "../CollaborationStartBtn";
import { RoomParticipants } from "@repo/common/types";
import { cn } from "@/lib/utils";
import Toolsbar from "../Toolsbar";

export default function CanvasSheet({ roomName, roomId, userId, userName, token }: {
    roomName: string; roomId: string; userId: string; userName: string; token: string;
}) {
    const { theme } = useTheme()
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const paramsRef = useRef({ roomId, roomName, userId, userName, token });
    const [participants, setParticipants] = useState<RoomParticipants[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isCanvasReady, setIsCanvasReady] = useState(false);
    const initialized = useRef(false);

    const [canvasEngineState, setCanvasEngineState] = useState({
        engine: null as CanvasEngine | null,
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

    const { matches, isLoading } = useMediaQuery(670);

    useEffect(() => {
        paramsRef.current = { roomId, roomName, userId, userName, token };
    }, [roomId, roomName, userId, userName, token]);

    useEffect(() => {
        setCanvasEngineState(prev => ({ ...prev, canvasColor: canvasBgLight[0] }));
    }, [theme])

    useEffect(() => {
        const { engine, scale } = canvasEngineState;
        if (engine) {
            engine.setScale(scale);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canvasEngineState.engine, canvasEngineState.scale]);

    useEffect(() => {
        const { engine, activeTool, strokeWidth, strokeFill, bgFill, canvasColor, strokeEdge, strokeStyle } = canvasEngineState;

        if (engine) {
            engine.setTool(activeTool);
            engine.setStrokeWidth(strokeWidth);
            engine.setStrokeFill(strokeFill);
            engine.setBgFill(bgFill);
            engine.setCanvasBgColor(canvasColor);
            engine.setStrokeEdge(strokeEdge);
            engine.setStrokeStyle(strokeStyle);
        }
    }, [canvasEngineState]);

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
            setCanvasEngineState(prev => ({ ...prev, activeTool: newTool }));
        }
    }, []);

    // Use an effect with a check interval to detect when canvas is available
    useEffect(() => {
        // Create an interval that checks if canvas is ready
        const checkCanvasInterval = setInterval(() => {
            if (canvasRef.current) {
                setIsCanvasReady(true);
                clearInterval(checkCanvasInterval);
            }
        }, 100); // Check every 100ms

        // Cleanup
        return () => clearInterval(checkCanvasInterval);
    }, []); // Empty dependency array so it only runs once

    const initializeCanvasEngine = useCallback(() => {
        if (!canvasRef.current) return null;

        const engine = new CanvasEngine(
            canvasRef.current,
            paramsRef.current.roomId,
            paramsRef.current.roomName,
            paramsRef.current.userId,
            paramsRef.current.userName,
            paramsRef.current.token,
            canvasEngineState.canvasColor,
            (newScale) => setCanvasEngineState(prev => ({ ...prev, scale: newScale })),
            false,
            (updatedParticipants) => {
                setParticipants(updatedParticipants);
            },
            (connectionStatus) => setIsConnected(connectionStatus)
        );
        return engine;
    }, [canvasEngineState.canvasColor]);

    useEffect(() => {
        if (!isCanvasReady || initialized.current) return;
        console.log('isCanvasReady = ', isCanvasReady)
        console.log('canvasRef.current = ', canvasRef.current)
        console.log('isConnected = ', isConnected)
        const waitReaddy = setTimeout(() => {
            if (!canvasRef.current) return;
            initialized.current = true;
            const engine = initializeCanvasEngine();

            if (engine) {
                setCanvasEngineState(prev => ({ ...prev, engine }));

                const handleResize = () => {
                    if (canvasRef.current) {
                        const canvas = canvasRef.current;
                        canvas.width = window.innerWidth;
                        canvas.height = window.innerHeight;
                        engine.handleResize(window.innerWidth, window.innerHeight);
                    }
                };

                handleResize();
                window.addEventListener('resize', handleResize);

                document.addEventListener("keydown", handleKeyDown);

                return () => {
                    window.removeEventListener('resize', handleResize);
                    document.removeEventListener("keydown", handleKeyDown);
                    engine.destroy();
                };
            }
        }, 1000)
        return () => clearTimeout(waitReaddy);
    }, [handleKeyDown, initializeCanvasEngine, isCanvasReady, isConnected]);

    const toggleSidebar = useCallback(() => {
        setCanvasEngineState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
    }, []);

    if (isLoading) {
        return <ScreenLoading />
    }

    return (
        <div className={cn("collabydraw h-screen overflow-hidden",
            canvasEngineState.activeTool === "eraser"
                ? "cursor-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAOBJREFUOE9jZKAyYKSyeQzDwMD////7MDAw6EGD5hIjI+MWfMGE08sggz5+/Dj71q1bHPv27eMFGeLk5PRZTU3tBz8/fyoug7EaCDLs58+fa0NDQ9k2b96M4iBfX1+G1atX/2JnZw/GZihWAz98+PA8NjZWAt0wmMkgQxcvXvxCQEBAEt37GAaCXHf69OnFZmZmAvjC6tSpUx9MTU1j0V2JzcCqzs7OpoqKCmZ8BnZ0dPwtLy+vY2RkbENWRxcDqetlkPOpGikgA6mebGCGUi1hI8ca1bIeucXaMCi+SPU6AHRTjhWg+vuGAAAAAElFTkSuQmCC')_10_10,auto]"
                : canvasEngineState.activeTool === "grab" && !canvasEngineState.sidebarOpen
                    ? canvasEngineState.grabbing ? "cursor-grabbing" : "cursor-grab"
                    : "cursor-crosshair")}>
            <div className="App_Menu App_Menu_Top fixed z-[4] top-4 right-4 left-4 flex justify-center items-center xs670:grid xs670:grid-cols-[1fr_auto_1fr] xs670:gap-4 md:gap-8 xs670:items-start">
                {matches && (
                    <div className="Main_Menu_Stack Sidebar_Trigger_Button xs670:grid xs670:gap-[calc(.25rem*6)] grid-cols-[auto] grid-flow-row grid-rows auto-rows-min justify-self-start">
                        <div className="relative">
                            <SidebarTriggerButton onClick={toggleSidebar} />

                            {canvasEngineState.sidebarOpen && (
                                <MainMenuStack
                                    isOpen={canvasEngineState.sidebarOpen}
                                    onClose={() => setCanvasEngineState(prev => ({ ...prev, sidebarOpen: false }))}
                                    canvasColor={canvasEngineState.canvasColor}
                                    setCanvasColor={(newCanvasColor: SetStateAction<string>) =>
                                        setCanvasEngineState(prev => ({ ...prev, canvasColor: typeof newCanvasColor === 'function' ? newCanvasColor(prev.canvasColor) : newCanvasColor }))
                                    }
                                    roomName={roomName}
                                />
                            )}
                        </div>

                        <ToolMenuStack
                            activeTool={canvasEngineState.activeTool}
                            strokeFill={canvasEngineState.strokeFill}
                            setStrokeFill={(newStrokeFill: SetStateAction<StrokeFill>) =>
                                setCanvasEngineState(prev => ({ ...prev, strokeFill: typeof newStrokeFill === 'function' ? newStrokeFill(prev.strokeFill) : newStrokeFill }))
                            }
                            strokeWidth={canvasEngineState.strokeWidth}
                            setStrokeWidth={(newStrokeWidth: SetStateAction<StrokeWidth>) =>
                                setCanvasEngineState(prev => ({ ...prev, strokeWidth: typeof newStrokeWidth === 'function' ? newStrokeWidth(prev.strokeWidth) : newStrokeWidth }))
                            }
                            bgFill={canvasEngineState.bgFill}
                            setBgFill={(newBgFill: SetStateAction<BgFill>) =>
                                setCanvasEngineState(prev => ({ ...prev, bgFill: typeof newBgFill === 'function' ? newBgFill(prev.bgFill) : newBgFill }))
                            }
                            strokeEdge={canvasEngineState.strokeEdge}
                            setStrokeEdge={(newStrokeEdge: SetStateAction<StrokeEdge>) =>
                                setCanvasEngineState(prev => ({ ...prev, strokeEdge: typeof newStrokeEdge === 'function' ? newStrokeEdge(prev.strokeEdge) : newStrokeEdge }))
                            }
                            strokeStyle={canvasEngineState.strokeStyle}
                            setStrokeStyle={(newStrokeStyle: SetStateAction<StrokeStyle>) =>
                                setCanvasEngineState(prev => ({ ...prev, strokeStyle: typeof newStrokeStyle === 'function' ? newStrokeStyle(prev.strokeStyle) : newStrokeStyle }))
                            }
                        />

                    </div>
                )}
                <Toolsbar
                    selectedTool={canvasEngineState.activeTool}
                    onToolSelect={(newTool: SetStateAction<ToolType>) =>
                        setCanvasEngineState(prev => ({ ...prev, activeTool: typeof newTool === 'function' ? newTool(prev.activeTool) : newTool }))
                    }
                />

                {matches && (
                    <CollaborationStart participants={participants} slug={roomName} />
                )}
            </div>

            {matches && (
                <Scale
                    scale={canvasEngineState.scale}
                    setScale={(newScale: SetStateAction<number>) =>
                        setCanvasEngineState(prev => ({
                            ...prev,
                            scale: typeof newScale === 'function' ? newScale(prev.scale) : newScale
                        }))
                    }
                />

            )}

            {!matches && (
                <MobileNavbar
                    sidebarOpen={canvasEngineState.sidebarOpen}
                    setSidebarOpen={() => setCanvasEngineState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }))}
                    canvasColor={canvasEngineState.canvasColor}
                    setCanvasColor={(newCanvasColor: SetStateAction<string>) =>
                        setCanvasEngineState(prev => ({ ...prev, canvasColor: typeof newCanvasColor === 'function' ? newCanvasColor(prev.canvasColor) : newCanvasColor }))
                    }
                    scale={canvasEngineState.scale}
                    setScale={(newScale: SetStateAction<number>) =>
                        setCanvasEngineState(prev => ({ ...prev, scale: typeof newScale === 'function' ? newScale(prev.scale) : newScale }))
                    }
                    activeTool={canvasEngineState.activeTool}
                    setStrokeFill={(newStrokeFill: SetStateAction<StrokeFill>) =>
                        setCanvasEngineState(prev => ({ ...prev, strokeFill: typeof newStrokeFill === 'function' ? newStrokeFill(prev.strokeFill) : newStrokeFill }))
                    }
                    strokeFill={canvasEngineState.strokeFill}
                    strokeWidth={canvasEngineState.strokeWidth}
                    setStrokeWidth={(newStrokeWidth: SetStateAction<StrokeWidth>) =>
                        setCanvasEngineState(prev => ({ ...prev, strokeWidth: typeof newStrokeWidth === 'function' ? newStrokeWidth(prev.strokeWidth) : newStrokeWidth }))
                    }
                    bgFill={canvasEngineState.bgFill}
                    setBgFill={(newBgFill: SetStateAction<BgFill>) =>
                        setCanvasEngineState(prev => ({ ...prev, bgFill: typeof newBgFill === 'function' ? newBgFill(prev.bgFill) : newBgFill }))
                    }
                    strokeEdge={canvasEngineState.strokeEdge}
                    setStrokeEdge={(newStrokeEdge: SetStateAction<StrokeEdge>) =>
                        setCanvasEngineState(prev => ({ ...prev, strokeEdge: typeof newStrokeEdge === 'function' ? newStrokeEdge(prev.strokeEdge) : newStrokeEdge }))
                    }
                    strokeStyle={canvasEngineState.strokeStyle}
                    setStrokeStyle={(newStrokeStyle: SetStateAction<StrokeStyle>) =>
                        setCanvasEngineState(prev => ({ ...prev, strokeStyle: typeof newStrokeStyle === 'function' ? newStrokeStyle(prev.strokeStyle) : newStrokeStyle }))
                    }
                    roomName={roomName}
                />

            )}
            <canvas className={cn("collabydraw collabydraw-canvas", theme === 'dark' ? 'collabydraw-canvas-dark' : '')} ref={canvasRef} />
        </div >
    )
};