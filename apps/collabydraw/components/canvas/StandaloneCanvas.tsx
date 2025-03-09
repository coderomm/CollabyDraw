"use client"

import { Game } from "@/draw/Game";
import { BgFill, canvasBgDark, canvasBgLight, Shape, StrokeFill, StrokeWidth, ToolType } from "@/types/canvas";
import { useCallback, useEffect, useRef, useState } from "react";
import { Scale } from "../Scale";
import { Toolbar2 } from "../Toolbar2";
import { MobileNavbar } from "../mobile-navbar";
import { useTheme } from "next-themes";
import { MainMenuStack } from "../MainMenuStack";
import { ToolMenuStack } from "../ToolMenuStack";
import SidebarTriggerButton from "../SidebarTriggerButton";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export function StandaloneCanvas() {
    const { theme } = useTheme()
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<Game>();
    const [scale, setScale] = useState<number>(1);
    const [activeTool, setActiveTool] = useState<ToolType>("grab");
    const [strokeFill, setStrokeFill] = useState<StrokeFill>("#f08c00");
    const [strokeWidth, setStrokeWidth] = useState<StrokeWidth>(1);
    const [bgFill, setBgFill] = useState<BgFill>("#00000000");
    const [grabbing, setGrabbing] = useState(false);
    const [existingShapes, setExistingShapes] = useState<Shape[]>([]);
    const activeToolRef = useRef(activeTool);
    const strokeFillRef = useRef(strokeFill);
    const strokeWidthRef = useRef(strokeWidth);
    const bgFillRef = useRef(bgFill);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [canvasColor, setCanvasColor] = useState<string>(theme === 'light' ? canvasBgLight[0] : canvasBgDark[0]);
    const canvasColorRef = useRef(canvasColor);

    const isMediumScreen = useMediaQuery('md');

    const clearCanvas = useCallback(() => {
        game?.clearAllShapes();
        setExistingShapes([]);
    }, [game]);

    useEffect(() => {
        setCanvasColor(theme === 'light' ? canvasBgLight[0] : canvasBgDark[0]);
    }, [theme])

    useEffect(() => {
        game?.setTool(activeTool)
        game?.setStrokeWidth(strokeWidth)
        game?.setStrokeFill(strokeFill)
        game?.setBgFill(bgFill)
        game?.setCanvasBgColor(canvasColor)
    });

    useEffect(() => {
        activeToolRef.current = activeTool;
        game?.setTool(activeTool);
    }, [activeTool, game]);

    useEffect(() => {
        strokeWidthRef.current = strokeWidth;
        game?.setStrokeWidth(strokeWidth);
    }, [strokeWidth, game]);

    useEffect(() => {
        strokeFillRef.current = strokeFill;
        game?.setStrokeFill(strokeFill);
    }, [strokeFill, game]);

    useEffect(() => {
        bgFillRef.current = bgFill;
        game?.setBgFill(bgFill);
    }, [bgFill, game]);

    useEffect(() => {
        if (game && existingShapes.length >= 0) {
            game.updateShapes(existingShapes);
        }
    }, [game, existingShapes]);

    useEffect(() => {
        if (game && canvasColorRef.current !== canvasColor) {
            canvasColorRef.current = canvasColor;
            game.setCanvasBgColor(canvasColor);
        }
    }, [canvasColor, game]);

    useEffect(() => {
        if (game) {
            game.setScale(scale);
        }
    }, [scale, game]);

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
    }, [setActiveTool]);

    useEffect(() => {
        if (canvasRef.current) {
            const game = new Game(
                canvasRef.current,
                null,
                canvasColorRef.current,
                null,
                null,
                (newScale) => setScale(newScale),
                [],
                true
            )
            setGame(game);

            game.setTool(activeToolRef.current);
            game.setStrokeWidth(strokeWidthRef.current);
            game.setStrokeFill(strokeFillRef.current);
            game.setBgFill(bgFillRef.current);

            return () => {
                game.destroy();
            }
        }
    }, [canvasRef]);

    useEffect(() => {
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

    useEffect(() => {
        if (game?.outputScale) {
            setScale(game.outputScale);
        }
    }, [game?.outputScale]);

    const toggleSidebar = useCallback(() => {
        setSidebarOpen(prev => !prev);
    }, []);

    const exportCanvas = useCallback(() => {
        const dataStr = JSON.stringify(existingShapes);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = 'canvas-drawing.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }, [existingShapes]);

    const importCanvas = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';

        input.onchange = (e: Event) => {
            const target = e.target as HTMLInputElement;
            const file = target.files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const shapes = JSON.parse(event.target?.result as string);
                        setExistingShapes(shapes);

                        localStorage.setItem('standalone_canvas_shapes', JSON.stringify(shapes));

                        if (game) {
                            game.updateShapes(shapes);
                        }
                    } catch (err) {
                        console.error('Failed to parse JSON file', err);
                        alert('Failed to load the drawing. The file might be corrupted.');
                    }
                };
                reader.readAsText(file);
            }
        };

        input.click();
    }, [game]);

    return (
        <div className={`h-screen overflow-hidden ${(activeTool === "grab") ? (grabbing ? "cursor-grabbing" : "cursor-grab") : "cursor-crosshair"} `}>
            <div className="fixed top-4 left-4 flex items-center justify-center">
                <div className="relative">
                    {isMediumScreen && (
                        <>
                            <SidebarTriggerButton onClick={toggleSidebar} />
                            {sidebarOpen && (
                                <MainMenuStack
                                    isOpen={sidebarOpen}
                                    onClose={() => setSidebarOpen(false)}
                                    canvasColor={canvasColor}
                                    setCanvasColor={setCanvasColor}
                                    isStandalone={true}
                                    onClearCanvas={clearCanvas}
                                    onExportCanvas={exportCanvas}
                                    onImportCanvas={importCanvas}
                                />
                            )}

                            <ToolMenuStack activeTool={activeTool}
                                strokeFill={strokeFill}
                                setStrokeFill={setStrokeFill}
                                strokeWidth={strokeWidth}
                                setStrokeWidth={setStrokeWidth}
                                bgFill={bgFill}
                                setBgFill={setBgFill}
                            />
                        </>
                    )}
                </div>
            </div>

            <Toolbar2
                selectedTool={activeTool}
                onToolSelect={setActiveTool}
                canRedo={false}
                canUndo={false}
                onRedo={() => { }}
                onUndo={() => { }}
            />

            <Scale scale={scale} setScale={setScale} />
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

                isStandalone={true}
                onClearCanvas={clearCanvas}
                onExportCanvas={exportCanvas}
                onImportCanvas={importCanvas}
            />
            <canvas ref={canvasRef} />
        </div>
    )
}