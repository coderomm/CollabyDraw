"use client"

import { Game } from "@/draw/Game";
import { BgFill, canvasBgDark, canvasBgLight, LOCALSTORAGE_CANVAS_KEY, Shape, StrokeEdge, StrokeFill, StrokeStyle, StrokeWidth, ToolType } from "@/types/canvas";
import { useCallback, useEffect, useRef, useState } from "react";
import { Scale } from "../Scale";
import Toolbar from "../Toolbar";
import { MobileNavbar } from "../mobile-navbar";
import { useTheme } from "next-themes";
import { MainMenuStack } from "../MainMenuStack";
import { ToolMenuStack } from "../ToolMenuStack";
import SidebarTriggerButton from "../SidebarTriggerButton";
import { HomeWelcome, MainMenuWelcome, ToolMenuWelcome } from "../welcome-screen";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import ScreenLoading from "../ScreenLoading";
import CollaborationStart from "../CollaborationStartBtn";

export function StandaloneCanvas() {
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
    const [existingShapes, setExistingShapes] = useState<Shape[]>([]);
    const activeToolRef = useRef(activeTool);
    const strokeFillRef = useRef(strokeFill);
    const strokeWidthRef = useRef(strokeWidth);
    const strokeEdgeRef = useRef(strokeEdge);
    const strokeStyleRef = useRef(strokeStyle);
    const bgFillRef = useRef(bgFill);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [canvasColor, setCanvasColor] = useState<string>(theme === 'light' ? canvasBgLight[0] : canvasBgDark[0]);
    const canvasColorRef = useRef(canvasColor);
    const [isCanvasEmpty, setIsCanvasEmpty] = useState(true);

    const { matches, isLoading } = useMediaQuery("md");

    useEffect(() => {
        const storedShapes = localStorage.getItem(LOCALSTORAGE_CANVAS_KEY);
        if (storedShapes) {
            const parsedShapes = JSON.parse(storedShapes);
            setIsCanvasEmpty(parsedShapes.length === 0);
            setExistingShapes(parsedShapes);
        } else {
            setIsCanvasEmpty(true);
        }
    }, []);

    useEffect(() => {
        setIsCanvasEmpty(existingShapes.length === 0);
    }, [existingShapes, activeTool]);

    useEffect(() => {
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

    useEffect(() => {
        if (existingShapes.length > 0) {
            localStorage.setItem(LOCALSTORAGE_CANVAS_KEY, JSON.stringify(existingShapes));
        }
    }, [existingShapes]);

    const clearCanvas = useCallback(() => {
        game?.clearAllShapes();
        setExistingShapes([]);
        localStorage.removeItem(LOCALSTORAGE_CANVAS_KEY);
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
        game?.setStrokeEdge(strokeEdge)
        game?.setStrokeStyle(strokeStyle)
    });

    useEffect(() => {
        strokeEdgeRef.current = strokeEdge;
        game?.setStrokeEdge(strokeEdge);
    }, [strokeEdge, game]);

    useEffect(() => {
        strokeStyleRef.current = strokeStyle;
        game?.setStrokeStyle(strokeStyle);
    }, [strokeStyle, game]);

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
                case "0":
                    setActiveTool("selection");
                    break;
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
            game.setStrokeEdge(strokeEdgeRef.current);
            game.setStrokeStyle(strokeStyleRef.current);

            canvasRef.current.width = window.innerWidth;
            canvasRef.current.height = window.innerHeight;

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

                        localStorage.setItem(LOCALSTORAGE_CANVAS_KEY, JSON.stringify(shapes));

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

    const handleToolSelect = (tool: ToolType) => {
        setActiveTool(tool);
        game?.setTool(tool);
        if (tool !== "selection") {
            game?.updateShapes(existingShapes);
        }
    };

    return (
        <div data-isloading={isLoading} data-matches={matches} className={`collabydraw h-screen overflow-hidden ${(activeTool === "grab" && !sidebarOpen) ? (grabbing ? "cursor-grabbing" : "cursor-grab") : "cursor-crosshair"} `}>
            {!isLoading && (
                <div className="App_Menu App_Menu_Top fixed top-4 right-4 left-4 flex justify-center items-center md:grid md:grid-cols-[1fr_auto_1fr] md:gap-8 md:items-start">
                    {matches && !isLoading && (
                        <div className="Main_Menu_Stack Sidebar_Trigger_Button md:grid md:gap-[calc(.25rem*6)] grid-cols-[auto] grid-flow-row grid-rows auto-rows-min justify-self-start">
                            <div className="relative">
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

                                {activeTool === "grab" && isCanvasEmpty && (
                                    <MainMenuWelcome />
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
                        onToolSelect={handleToolSelect}
                    />

                    <CollaborationStart />
                </div>
            )}
            {activeTool === "grab" && isCanvasEmpty && !isLoading && (
                <div className="relative">
                    <ToolMenuWelcome />
                </div>
            )}

            {!isLoading && matches && (
                <Scale scale={scale} setScale={setScale} />
            )}

            {!isLoading && !matches && (
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
            )}

            {!isLoading && activeTool === "grab" && isCanvasEmpty && (
                <HomeWelcome />
            )}

            {isLoading && (
                <ScreenLoading />
            )}

            <canvas ref={canvasRef} />

        </div >
    )
}