// Core interfaces and types
import { getRoom } from "@/actions/room";
import {
  LOCALSTORAGE_CANVAS_KEY,
  Shape,
  StrokeEdge,
  ToolType,
  Point,
} from "@/types/canvas";
import { RoughGenerator } from "roughjs/bin/generator";

// Constants
const DEFAULT_STROKE_WIDTH = 1;
const DEFAULT_STROKE_FILL = "rgba(255, 255, 255)";
const DEFAULT_BG_FILL = "rgba(18, 18, 18)";
const ERASER_TOLERANCE = 5;
const SHAPE_MIN_SIZE = 3; // Minimum size for a shape to be considered valid
const DIAMOND_CORNER_RADIUS_PERCENTAGE = 15;
const WHEEL_SCALE_FACTOR = 200;
const RECT_CORNER_RADIUS_FACTOR = 20;

// Logger utility with toggle
const Logger = {
  enabled: process.env.NODE_ENV === "development",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log: (message: string, ...args: any[]) => {
    if (Logger.enabled) console.log(`[Game] ${message}`, ...args);
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: (message: string, ...args: any[]) => {
    if (Logger.enabled) console.error(`[Game] ${message}`, ...args);
  },
};

// Event throttling utility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let inThrottle = false;
  let lastResult: ReturnType<T> | undefined;

  return function (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this: any,
    ...args: Parameters<T>
  ): ReturnType<T> | undefined {
    if (!inThrottle) {
      lastResult = func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
    return lastResult;
  };
}

// Shape manager class - Handles shape operations
class ShapeManager {
  private shapes: Shape[] = [];
  private persistenceKey: string;
  private sendMessageCallback: ((data: string) => void) | null = null;
  private roomId: string | null = null;
  private isStandalone: boolean = false;

  constructor(
    initialShapes: Shape[] = [],
    persistenceKey: string = LOCALSTORAGE_CANVAS_KEY,
    sendMessageCallback: ((data: string) => void) | null = null,
    roomId: string | null = null,
    isStandalone: boolean = false
  ) {
    this.shapes = [...initialShapes];
    this.persistenceKey = persistenceKey;
    this.sendMessageCallback = sendMessageCallback;
    this.roomId = roomId;
    this.isStandalone = isStandalone;
  }

  public getShapes(): readonly Shape[] {
    return [...this.shapes];
  }

  public addShape(shape: Shape): void {
    if (!this.isValidShape(shape)) return;

    this.shapes.push(shape);
    this.persistShapes();
  }

  public removeShape(index: number): Shape | null {
    if (index < 0 || index >= this.shapes.length) return null;

    const removedShape = this.shapes.splice(index, 1)[0];
    this.persistShapes();

    return removedShape;
  }

  public updateShapes(shapes: Shape[]): void {
    this.shapes = shapes.filter((shape) => this.isValidShape(shape));
    this.persistShapes();
  }

  public clearShapes(): void {
    this.shapes = [];
    if (this.isStandalone) {
      try {
        localStorage.removeItem(this.persistenceKey);
      } catch (e) {
        Logger.error("Error removing shapes from localStorage:", e);
      }
    }
  }

  public isPointInShape(x: number, y: number, shape: Shape): boolean {
    const tolerance = ERASER_TOLERANCE;

    switch (shape.type) {
      case "rectangle": {
        const startX = Math.min(shape.x, shape.x + shape.width);
        const endX = Math.max(shape.x, shape.x + shape.width);
        const startY = Math.min(shape.y, shape.y + shape.height);
        const endY = Math.max(shape.y, shape.y + shape.height);

        return (
          x >= startX - tolerance &&
          x <= endX + tolerance &&
          y >= startY - tolerance &&
          y <= endY + tolerance
        );
      }
      case "ellipse": {
        const dx = x - shape.centerX;
        const dy = y - shape.centerY;
        const normalized =
          (dx * dx) / ((shape.radX + tolerance) * (shape.radX + tolerance)) +
          (dy * dy) / ((shape.radY + tolerance) * (shape.radY + tolerance));
        return normalized <= 1;
      }
      case "diamond": {
        const dx = Math.abs(x - shape.centerX);
        const dy = Math.abs(y - shape.centerY);

        return (
          dx / (shape.width / 2 + tolerance) +
            dy / (shape.height / 2 + tolerance) <=
          1
        );
      }
      case "line": {
        const lineLength = Math.hypot(
          shape.toX - shape.fromX,
          shape.toY - shape.fromY
        );
        if (lineLength < SHAPE_MIN_SIZE) return false;

        const distance =
          Math.abs(
            (shape.toY - shape.fromY) * x -
              (shape.toX - shape.fromX) * y +
              shape.toX * shape.fromY -
              shape.toY * shape.fromX
          ) / lineLength;

        const withinLineBounds =
          x >= Math.min(shape.fromX, shape.toX) - tolerance &&
          x <= Math.max(shape.fromX, shape.toX) + tolerance &&
          y >= Math.min(shape.fromY, shape.toY) - tolerance &&
          y <= Math.max(shape.fromY, shape.toY) + tolerance;

        return distance <= tolerance && withinLineBounds;
      }
      case "pen": {
        if (!shape.points || shape.points.length === 0) return false;
        return shape.points.some(
          (point) => Math.hypot(point.x - x, point.y - y) <= tolerance
        );
      }
      default:
        return false;
    }
  }

  private isValidShape(shape: Shape): boolean {
    if (!shape || !shape.type) return false;

    switch (shape.type) {
      case "rectangle":
        return (
          typeof shape.x === "number" &&
          typeof shape.y === "number" &&
          typeof shape.width === "number" &&
          typeof shape.height === "number"
        );
      case "ellipse":
        return (
          typeof shape.centerX === "number" &&
          typeof shape.centerY === "number" &&
          typeof shape.radX === "number" &&
          typeof shape.radY === "number" &&
          shape.radX > 0 &&
          shape.radY > 0
        );
      case "diamond":
        return (
          typeof shape.centerX === "number" &&
          typeof shape.centerY === "number" &&
          typeof shape.width === "number" &&
          typeof shape.height === "number"
        );
      case "line":
        return (
          typeof shape.fromX === "number" &&
          typeof shape.fromY === "number" &&
          typeof shape.toX === "number" &&
          typeof shape.toY === "number"
        );
      case "pen":
        return (
          Array.isArray(shape.points) &&
          shape.points.length >= 2 &&
          shape.points.every(
            (point) =>
              typeof point.x === "number" && typeof point.y === "number"
          )
        );
      default:
        return false;
    }
  }

  private persistShapes(): void {
    if (this.isStandalone) {
      try {
        localStorage.setItem(this.persistenceKey, JSON.stringify(this.shapes));
      } catch (e) {
        Logger.error("Error saving shapes to localStorage:", e);
      }
    } else if (this.sendMessageCallback && this.roomId) {
      const lastShape = this.shapes[this.shapes.length - 1];
      this.sendMessageCallback(
        JSON.stringify({
          type: "draw",
          data: JSON.stringify({
            shape: lastShape,
          }),
          roomId: this.roomId,
        })
      );
    }
  }

  public broadcastErasedShape(shape: Shape): void {
    if (!this.isStandalone && this.sendMessageCallback && this.roomId) {
      this.sendMessageCallback(
        JSON.stringify({
          type: "eraser",
          data: JSON.stringify({
            shape,
          }),
          roomId: this.roomId,
        })
      );
    }
  }

  public findShapeAtPoint(x: number, y: number): number {
    return this.shapes.findIndex((shape) => this.isPointInShape(x, y, shape));
  }
}

// Viewport manager for pan and zoom operations
class ViewportManager {
  private panX: number = 0;
  private panY: number = 0;
  private scale: number = 1;
  private onScaleChangeCallback: (scale: number) => void;

  constructor(onScaleChangeCallback: (scale: number) => void) {
    this.onScaleChangeCallback = onScaleChangeCallback;
  }

  public getPanX(): number {
    return this.panX;
  }

  public getPanY(): number {
    return this.panY;
  }

  public getScale(): number {
    return this.scale;
  }

  public setPan(x: number, y: number): void {
    this.panX = x;
    this.panY = y;
  }

  public adjustPan(deltaX: number, deltaY: number): void {
    this.panX += deltaX;
    this.panY += deltaY;
  }

  public setScale(newScale: number, centerX: number, centerY: number): void {
    const canvasMouseX = (centerX - this.panX) / this.scale;
    const canvasMouseY = (centerY - this.panY) / this.scale;

    this.panX -= canvasMouseX * (newScale - this.scale);
    this.panY -= canvasMouseY * (newScale - this.scale);

    this.scale = newScale;
    this.notifyScaleChange();
  }

  public zoomTo(
    newScale: number,
    canvasWidth: number,
    canvasHeight: number
  ): void {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    this.setScale(newScale, centerX, centerY);
  }

  public transformPanScale(clientX: number, clientY: number): Point {
    return {
      x: (clientX - this.panX) / this.scale,
      y: (clientY - this.panY) / this.scale,
    };
  }

  private notifyScaleChange(): void {
    if (this.onScaleChangeCallback) {
      this.onScaleChangeCallback(this.scale);
    }
  }
}

// Renderer class - Handles all rendering operations
class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private bgColor: string;
  private static rg = new RoughGenerator();
  private lastRenderTime: number = 0;
  private isDirty: boolean = true;
  private offscreenCanvas: HTMLCanvasElement | null = null;
  private offscreenCtx: CanvasRenderingContext2D | null = null;

  constructor(canvas: HTMLCanvasElement, bgColor: string) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    this.ctx = ctx;
    this.bgColor = bgColor;

    // Initialize offscreen canvas for better performance
    this.initOffscreenCanvas(canvas.width, canvas.height);
  }

  private initOffscreenCanvas(width: number, height: number): void {
    try {
      this.offscreenCanvas = document.createElement("canvas");
      this.offscreenCanvas.width = width;
      this.offscreenCanvas.height = height;

      const ctx = this.offscreenCanvas.getContext("2d");
      if (!ctx) throw new Error("Could not get offscreen canvas context");

      this.offscreenCtx = ctx;
    } catch (e) {
      Logger.error("Failed to initialize offscreen canvas:", e);
      this.offscreenCanvas = null;
      this.offscreenCtx = null;
    }
  }

  public updateCanvasSize(width: number, height: number): void {
    if (this.offscreenCanvas) {
      this.offscreenCanvas.width = width;
      this.offscreenCanvas.height = height;
    }
    this.markDirty();
  }

  public setBackgroundColor(color: string): void {
    if (this.bgColor !== color) {
      this.bgColor = color;
      this.markDirty();
    }
  }

  public markDirty(): void {
    this.isDirty = true;
  }

  public render(
    shapes: readonly Shape[],
    viewportManager: ViewportManager,
    forceRender: boolean = false
  ): void {
    const now = performance.now();
    // Only render if dirty or forced, and limit to 60fps
    if ((!this.isDirty && !forceRender) || now - this.lastRenderTime < 16) {
      return;
    }

    this.lastRenderTime = now;
    this.isDirty = false;

    const scale = viewportManager.getScale();
    const panX = viewportManager.getPanX();
    const panY = viewportManager.getPanY();

    // Use offscreen canvas if available
    const targetCtx = this.offscreenCtx || this.ctx;
    const canvas = this.offscreenCanvas || this.ctx.canvas;

    // Clear and set transform
    targetCtx.setTransform(scale, 0, 0, scale, panX, panY);
    targetCtx.clearRect(
      -panX / scale,
      -panY / scale,
      canvas.width / scale,
      canvas.height / scale
    );

    // Draw background
    targetCtx.fillStyle = this.bgColor;
    targetCtx.fillRect(
      -panX / scale,
      -panY / scale,
      canvas.width / scale,
      canvas.height / scale
    );

    // Draw all shapes
    shapes.forEach((shape) => this.drawShape(targetCtx, shape));

    // Copy from offscreen to main canvas if using offscreen
    if (this.offscreenCanvas && this.offscreenCtx) {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      this.ctx.drawImage(this.offscreenCanvas, 0, 0);
    }
  }

  private drawShape(ctx: CanvasRenderingContext2D, shape: Shape): void {
    switch (shape.type) {
      case "rectangle":
        this.drawRect(
          ctx,
          shape.x,
          shape.y,
          shape.width,
          shape.height,
          shape.strokeWidth || DEFAULT_STROKE_WIDTH,
          shape.strokeFill || DEFAULT_STROKE_FILL,
          shape.bgFill || DEFAULT_BG_FILL
        );
        break;
      case "ellipse":
        this.drawEllipse(
          ctx,
          shape.centerX,
          shape.centerY,
          shape.radX,
          shape.radY,
          shape.strokeWidth || DEFAULT_STROKE_WIDTH,
          shape.strokeFill || DEFAULT_STROKE_FILL,
          shape.bgFill || DEFAULT_BG_FILL
        );
        break;
      case "diamond":
        this.drawDiamond(
          ctx,
          shape.centerX,
          shape.centerY,
          shape.width,
          shape.height,
          shape.strokeWidth || DEFAULT_STROKE_WIDTH,
          shape.strokeFill || DEFAULT_STROKE_FILL,
          shape.bgFill || DEFAULT_BG_FILL
        );
        break;
      case "line":
        this.drawLine(
          ctx,
          shape.fromX,
          shape.fromY,
          shape.toX,
          shape.toY,
          shape.strokeWidth || DEFAULT_STROKE_WIDTH,
          shape.strokeFill || DEFAULT_STROKE_FILL
        );
        break;
      case "pen":
        this.drawPencil(
          ctx,
          shape.points,
          shape.strokeWidth || DEFAULT_STROKE_WIDTH,
          shape.strokeFill || DEFAULT_STROKE_FILL
        );
        break;
    }
  }

  private drawRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    strokeWidth: number,
    strokeFill: string,
    bgFill: string
  ): void {
    // Calculate position for negative width/height
    const posX = width < 0 ? x + width : x;
    const posY = height < 0 ? y + height : y;
    const normalizedWidth = Math.abs(width);
    const normalizedHeight = Math.abs(height);

    // Skip drawing shapes that are too small
    if (normalizedWidth < SHAPE_MIN_SIZE || normalizedHeight < SHAPE_MIN_SIZE) {
      return;
    }

    // Calculate appropriate corner radius
    const radius = Math.min(
      Math.abs(
        Math.max(normalizedWidth, normalizedHeight) / RECT_CORNER_RADIUS_FACTOR
      ),
      normalizedWidth / 2,
      normalizedHeight / 2
    );

    ctx.beginPath();
    ctx.moveTo(posX + radius, posY);
    ctx.strokeStyle = strokeFill;
    ctx.lineWidth = strokeWidth;
    ctx.fillStyle = bgFill;

    // Draw rounded rectangle
    ctx.lineTo(posX + normalizedWidth - radius, posY);
    ctx.quadraticCurveTo(
      posX + normalizedWidth,
      posY,
      posX + normalizedWidth,
      posY + radius
    );
    ctx.lineTo(posX + normalizedWidth, posY + normalizedHeight - radius);
    ctx.quadraticCurveTo(
      posX + normalizedWidth,
      posY + normalizedHeight,
      posX + normalizedWidth - radius,
      posY + normalizedHeight
    );
    ctx.lineTo(posX + radius, posY + normalizedHeight);
    ctx.quadraticCurveTo(
      posX,
      posY + normalizedHeight,
      posX,
      posY + normalizedHeight - radius
    );
    ctx.lineTo(posX, posY + radius);
    ctx.quadraticCurveTo(posX, posY, posX + radius, posY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  private drawEllipse(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    strokeWidth: number,
    strokeFill: string,
    bgFill: string
  ): void {
    // Skip drawing shapes that are too small
    if (width < SHAPE_MIN_SIZE || height < SHAPE_MIN_SIZE) {
      return;
    }

    ctx.beginPath();
    ctx.strokeStyle = strokeFill;
    ctx.lineWidth = strokeWidth;
    ctx.fillStyle = bgFill;
    ctx.ellipse(x, y, width, height, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  }

  private drawDiamond(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    strokeWidth: number,
    strokeFill: string,
    bgFill: string
  ): void {
    // Skip drawing shapes that are too small
    if (width < SHAPE_MIN_SIZE || height < SHAPE_MIN_SIZE) {
      return;
    }

    const halfWidth = width / 2;
    const halfHeight = height / 2;

    const normalizedWidth = Math.abs(halfWidth);
    const normalizedHeight = Math.abs(halfHeight);

    const sideLength = Math.min(
      Math.sqrt(Math.pow(normalizedWidth, 2) + Math.pow(normalizedHeight, 2)),
      2 * normalizedWidth,
      2 * normalizedHeight
    );

    let radius = (sideLength * DIAMOND_CORNER_RADIUS_PERCENTAGE) / 100;

    const maxRadius = Math.min(normalizedWidth, normalizedHeight) * 0.4;
    radius = Math.min(radius, maxRadius);

    const topPoint = { x: centerX, y: centerY - halfHeight };
    const rightPoint = { x: centerX + halfWidth, y: centerY };
    const bottomPoint = { x: centerX, y: centerY + halfHeight };
    const leftPoint = { x: centerX - halfWidth, y: centerY };

    ctx.save();
    ctx.beginPath();

    // Calculate distance between points for the offset calculation
    const distTopLeft = Math.sqrt(
      Math.pow(topPoint.x - leftPoint.x, 2) +
        Math.pow(topPoint.y - leftPoint.y, 2)
    );

    const startX =
      leftPoint.x + ((topPoint.x - leftPoint.x) * radius) / distTopLeft;
    const startY =
      leftPoint.y + ((topPoint.y - leftPoint.y) * radius) / distTopLeft;

    ctx.moveTo(startX, startY);

    ctx.arcTo(topPoint.x, topPoint.y, rightPoint.x, rightPoint.y, radius);

    ctx.arcTo(rightPoint.x, rightPoint.y, bottomPoint.x, bottomPoint.y, radius);

    ctx.arcTo(bottomPoint.x, bottomPoint.y, leftPoint.x, leftPoint.y, radius);

    ctx.arcTo(leftPoint.x, leftPoint.y, topPoint.x, topPoint.y, radius);

    ctx.lineTo(startX, startY);
    ctx.closePath();

    ctx.fillStyle = bgFill;
    ctx.strokeStyle = strokeFill;
    ctx.lineWidth = strokeWidth;

    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawLine(
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    strokeWidth: number,
    strokeFill: string
  ): void {
    // Skip drawing lines that are too short
    const length = Math.hypot(toX - fromX, toY - fromY);
    if (length < SHAPE_MIN_SIZE) {
      return;
    }

    ctx.beginPath();
    ctx.strokeStyle = strokeFill;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
  }

  private drawPencil(
    ctx: CanvasRenderingContext2D,
    points: Point[],
    strokeWidth: number,
    strokeFill: string
  ): void {
    if (!points || points.length < 2) {
      return;
    }

    ctx.beginPath();
    ctx.strokeStyle = strokeFill;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.moveTo(points[0].x, points[0].y);

    // Use quadratic curves for smoother lines with 2+ points
    if (points.length >= 3) {
      for (let i = 1; i < points.length - 2; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }

      // For the last two points
      const lastIndex = points.length - 1;
      ctx.quadraticCurveTo(
        points[lastIndex - 1].x,
        points[lastIndex - 1].y,
        points[lastIndex].x,
        points[lastIndex].y
      );
    } else {
      // Simple line for just 2 points
      ctx.lineTo(points[1].x, points[1].y);
    }

    ctx.stroke();
  }
}

// The main Game class that coordinates everything
export class Game {
  private canvas: HTMLCanvasElement;
  private renderer: CanvasRenderer;
  private shapeManager: ShapeManager;
  private viewportManager: ViewportManager;

  private roomId: string | null;
  private roomName: string | null;
  private sendMessage: ((data: string) => void) | null;
  private isStandalone: boolean;

  // Tool state
  private activeTool: ToolType = "grab";
  private strokeWidth: number = DEFAULT_STROKE_WIDTH;
  private strokeFill: string = DEFAULT_STROKE_FILL;
  private bgFill: string = DEFAULT_BG_FILL;
  private strokeEdge: StrokeEdge = "round";

  // Interaction state
  private isMouseDown: boolean = false;
  private startX: number = 0;
  private startY: number = 0;
  private outputScale: number = 1;

  // Animation frame ID for cleanup
  private animationFrameId: number | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    roomId: string | null,
    canvasBgColor: string,
    sendMessage: ((data: string) => void) | null,
    roomName: string | null,
    onScaleChangeCallback: (scale: number) => void,
    initialShapes: Shape[] = [],
    isStandalone: boolean = false
  ) {
    this.canvas = canvas;
    this.roomId = roomId;
    this.roomName = roomName;
    this.sendMessage = sendMessage;
    this.isStandalone = isStandalone;

    // Initialize viewport manager
    this.viewportManager = new ViewportManager((scale: number) => {
      this.outputScale = scale;
      onScaleChangeCallback(scale);
    });

    // Initialize renderer
    this.renderer = new CanvasRenderer(canvas, canvasBgColor);

    // Initialize shape manager
    this.shapeManager = new ShapeManager(
      initialShapes,
      LOCALSTORAGE_CANVAS_KEY,
      sendMessage,
      roomId,
      isStandalone
    );

    // Set up canvas size
    this.handleResize(document.body.clientWidth, document.body.clientHeight);

    // Initialize
    this.init();
    this.initEventHandlers();

    // Start render loop
    this.startRenderLoop();
  }

  /**
   * Initialize the canvas with data from localStorage or server
   */
  async init(): Promise<void> {
    try {
      if (this.isStandalone) {
        await this.loadFromLocalStorage();
      } else if (this.roomName) {
        await this.loadFromServer();
      }
      this.renderer.markDirty();
    } catch (error) {
      Logger.error("Initialization error:", error);
    }
  }

  /**
   * Load shapes from localStorage for standalone mode
   */
  private async loadFromLocalStorage(): Promise<void> {
    try {
      const storedShapes = localStorage.getItem(LOCALSTORAGE_CANVAS_KEY);
      if (storedShapes) {
        const parsedShapes = JSON.parse(storedShapes);
        if (Array.isArray(parsedShapes)) {
          this.shapeManager.updateShapes(parsedShapes);
        }
      }
    } catch (e) {
      Logger.error("Error loading shapes from localStorage:", e);
    }
  }

  /**
   * Load shapes from server for collaborative mode
   */
  private async loadFromServer(): Promise<void> {
    if (!this.roomName) return;

    try {
      const getRoomResult = await getRoom({ roomName: this.roomName });

      if (getRoomResult?.success && getRoomResult.room?.Chat) {
        const loadedShapes: Shape[] = [];

        // Parse shapes from chat messages
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getRoomResult.room.Chat.forEach((shape: any) => {
          try {
            const parsedShapes = JSON.parse(shape.message);
            const parsedShapeData = JSON.parse(parsedShapes.data);
            loadedShapes.push(parsedShapeData.shape);
          } catch (e) {
            Logger.error("Error parsing shape data:", e);
          }
        });

        this.shapeManager.updateShapes(loadedShapes);
      } else if (!getRoomResult?.success) {
        Logger.error("Error fetching room:", getRoomResult?.error);
      }
    } catch (error) {
      Logger.error("Error loading from server:", error);
    }
  }

  /**
   * Initialize all event handlers
   */
  private initEventHandlers(): void {
    // Use passive: false for wheel to allow preventDefault
    this.canvas.addEventListener("mousedown", this.handleMouseDown);
    this.canvas.addEventListener("mousemove", this.handleMouseMove);
    this.canvas.addEventListener("mouseup", this.handleMouseUp);
    this.canvas.addEventListener("mouseleave", this.handleMouseUp);
    this.canvas.addEventListener("wheel", this.handleMouseWheel, {
      passive: false,
    });

    // Handle window resize
    window.addEventListener("resize", this.handleWindowResize);
  }
  /**
   * Start the animation loop for continuous rendering
   */
  private startRenderLoop(): void {
    const renderFrame = () => {
      this.renderer.render(this.shapeManager.getShapes(), this.viewportManager);
      this.animationFrameId = requestAnimationFrame(renderFrame);
    };

    this.animationFrameId = requestAnimationFrame(renderFrame);
  }

  /**
   * Handle mouse down events
   */
  private handleMouseDown = (e: MouseEvent): void => {
    this.isMouseDown = true;

    const { x, y } = this.viewportManager.transformPanScale(
      e.clientX,
      e.clientY
    );
    this.startX = x;
    this.startY = y;

    switch (this.activeTool) {
      case "pen":
        this.shapeManager.addShape({
          type: "pen",
          points: [{ x, y }],
          strokeWidth: this.strokeWidth,
          strokeFill: this.strokeFill,
        });
        break;

      case "eraser":
        this.handleEraser(x, y);
        break;

      case "grab":
        this.startX = e.clientX;
        this.startY = e.clientY;
        break;
    }

    this.renderer.markDirty();
  };

  /**
   * Handle mouse move events
   */
  private handleMouseMove = throttle((e: MouseEvent): void => {
    if (!this.isMouseDown) return;

    const { x, y } = this.viewportManager.transformPanScale(
      e.clientX,
      e.clientY
    );
    const width = x - this.startX;
    const height = y - this.startY;

    switch (this.activeTool) {
      case "rectangle":
        this.drawTemporaryShape({
          type: "rectangle",
          x: this.startX,
          y: this.startY,
          width,
          height,
          strokeWidth: this.strokeWidth,
          strokeFill: this.strokeFill,
          bgFill: this.bgFill,
          rounded:this.strokeEdge
        });
        break;

      case "ellipse":
        this.drawTemporaryShape({
          type: "ellipse",
          centerX: this.startX + width / 2,
          centerY: this.startY + height / 2,
          radX: Math.abs(width / 2),
          radY: Math.abs(height / 2),
          strokeWidth: this.strokeWidth,
          strokeFill: this.strokeFill,
          bgFill: this.bgFill,
        });
        break;

      case "diamond":
        this.drawTemporaryShape({
          type: "diamond",
          centerX: this.startX,
          centerY: this.startY,
          width: Math.abs(x - this.startX) * 2,
          height: Math.abs(y - this.startY) * 2,
          strokeWidth: this.strokeWidth,
          strokeFill: this.strokeFill,
          bgFill: this.bgFill,
          rounded:this.strokeEdge
        });
        break;

      case "line":
        this.drawTemporaryShape({
          type: "line",
          fromX: this.startX,
          fromY: this.startY,
          toX: x,
          toY: y,
          strokeWidth: this.strokeWidth,
          strokeFill: this.strokeFill,
        });
        break;

      case "pen":
        const shapes = this.shapeManager.getShapes();
        const currentShape = shapes[shapes.length - 1];
        if (currentShape?.type === "pen") {
          // Update the points array with the new point
          const updatedPoints = [...currentShape.points, { x, y }];
          this.shapeManager.updateShapes([
            ...shapes.slice(0, -1),
            {
              ...currentShape,
              points: updatedPoints,
            },
          ]);
        }
        break;

      case "eraser":
        this.handleEraser(x, y);
        break;

      case "grab":
        // Calculate how much the mouse has moved
        const deltaX = e.clientX - this.startX;
        const deltaY = e.clientY - this.startY;

        // Update the pan position
        this.viewportManager.adjustPan(deltaX, deltaY);

        // Update start position for next move
        this.startX = e.clientX;
        this.startY = e.clientY;
        break;
    }

    this.renderer.markDirty();
  }, 16); // Throttle to ~60fps

  /**
   * Handle mouse up events
   */
  private handleMouseUp = (e: MouseEvent): void => {
    if (!this.isMouseDown) return;
    this.isMouseDown = false;

    const { x, y } = this.viewportManager.transformPanScale(
      e.clientX,
      e.clientY
    );
    const width = x - this.startX;
    const height = y - this.startY;

    let shape: Shape | null = null;

    switch (this.activeTool) {
      case "rectangle":
        shape = {
          type: "rectangle",
          x: this.startX,
          y: this.startY,
          width,
          height,
          strokeWidth: this.strokeWidth,
          strokeFill: this.strokeFill,
          bgFill: this.bgFill,
          rounded:this.strokeEdge
        };
        break;

      case "ellipse":
        shape = {
          type: "ellipse",
          centerX: this.startX + width / 2,
          centerY: this.startY + height / 2,
          radX: Math.abs(width / 2),
          radY: Math.abs(height / 2),
          strokeWidth: this.strokeWidth,
          strokeFill: this.strokeFill,
          bgFill: this.bgFill,
        };
        break;

      case "diamond":
        shape = {
          type: "diamond",
          centerX: this.startX,
          centerY: this.startY,
          width: Math.abs(x - this.startX) * 2,
          height: Math.abs(y - this.startY) * 2,
          strokeWidth: this.strokeWidth,
          strokeFill: this.strokeFill,
          bgFill: this.bgFill,
          rounded:this.strokeEdge
        };
        break;

      case "line":
        shape = {
          type: "line",
          fromX: this.startX,
          fromY: this.startY,
          toX: x,
          toY: y,
          strokeWidth: this.strokeWidth,
          strokeFill: this.strokeFill,
        };
        break;

      case "pen":
        // For pen, the shape has already been added incrementally
        // Just ensure we have at least two points
        const shapes = this.shapeManager.getShapes();
        const currentShape = shapes[shapes.length - 1];
        if (currentShape?.type === "pen" && currentShape.points.length < 2) {
          // If a pen shape has only one point, add another point
          this.shapeManager.updateShapes([
            ...shapes.slice(0, -1),
            {
              ...currentShape,
              points: [...currentShape.points, { x: x + 0.1, y: y + 0.1 }], // Add a tiny offset to create a dot
            },
          ]);
        }
        break;
    }

    if (
      shape &&
      this.activeTool !== "pen" &&
      this.activeTool !== "grab" &&
      this.activeTool !== "eraser"
    ) {
      this.shapeManager.addShape(shape);
    }

    this.renderer.markDirty();
  };

  /**
   * Handle mouse wheel events
   */
  private handleMouseWheel = (e: WheelEvent): void => {
    e.preventDefault();

    if (e.ctrlKey || e.metaKey) {
      // Zoom
      const scaleAmount = -e.deltaY / WHEEL_SCALE_FACTOR;
      const newScale = this.viewportManager.getScale() * (1 + scaleAmount);

      // Apply zoom centered on mouse position
      this.viewportManager.setScale(newScale, e.clientX, e.clientY);
    } else {
      // Pan
      this.viewportManager.adjustPan(-e.deltaX, -e.deltaY);
    }

    this.renderer.markDirty();
  };

  /**
   * Handle window resize events
   */
  private handleWindowResize = (): void => {
    this.handleResize(document.body.clientWidth, document.body.clientHeight);
  };

  /**
   * Handle canvas resize
   */
  public handleResize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.renderer.updateCanvasSize(width, height);
    this.renderer.markDirty();
  }

  /**
   * Handle eraser tool
   */
  private handleEraser(x: number, y: number): void {
    const shapeIndex = this.shapeManager.findShapeAtPoint(x, y);

    if (shapeIndex !== -1) {
      const shapes = this.shapeManager.getShapes();
      const erasedShape = shapes[shapeIndex];

      // Remove the shape
      this.shapeManager.removeShape(shapeIndex);

      // Broadcast to other clients if in collaborative mode
      if (!this.isStandalone) {
        this.shapeManager.broadcastErasedShape(erasedShape);
      }
    }
  }

  /**
   * Draw a temporary shape during mouse movement
   */
  private drawTemporaryShape(shape: Shape): void {
    // Get all existing shapes
    const shapes = this.shapeManager.getShapes();

    // Create a copy with the temporary shape
    const shapesWithTemp = [...shapes, shape];

    // Render the shapes
    this.renderer.render(shapesWithTemp, this.viewportManager, true);
  }

  /**
   * Set the active drawing tool
   */
  public setTool(tool: ToolType): void {
    this.activeTool = tool;
  }

  /**
   * Set the stroke width for drawing
   */
  public setStrokeWidth(width: number): void {
    this.strokeWidth = width;
    this.renderer.markDirty();
  }

  /**
   * Set the stroke fill color
   */
  public setStrokeFill(fill: string): void {
    this.strokeFill = fill;
    this.renderer.markDirty();
  }

  /**
   * Set the background fill color
   */
  public setBgFill(fill: string): void {
    this.bgFill = fill;
    this.renderer.markDirty();
  }

  /**
   * Set the canvas background color
   */
  public setCanvasBgColor(color: string): void {
    this.renderer.setBackgroundColor(color);
    this.renderer.markDirty();
  }

  /**
   * Set the stroke edge style
   */
  public setStrokeEdge(edge: StrokeEdge): void {
    this.strokeEdge = edge;
    this.renderer.markDirty();
  }

  /**
   * Zoom to a specific scale factor
   */
  public setScale(newScale: number): void {
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;

    this.viewportManager.zoomTo(newScale, canvasWidth, canvasHeight);
    this.renderer.markDirty();
  }

  /**
   * Clear all shapes from the canvas
   */
  public clearAllShapes(): void {
    this.shapeManager.clearShapes();
    this.renderer.markDirty();
  }

  /**
   * Update shapes with a new array of shapes
   */
  public updateShapes(shapes: Shape[]): void {
    this.shapeManager.updateShapes(shapes);
    this.renderer.markDirty();
  }

  /**
   * Clean up resources and event listeners
   */
  public destroy(): void {
    // Remove event listeners
    this.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    this.canvas.removeEventListener("mouseup", this.handleMouseUp);
    this.canvas.removeEventListener("mouseleave", this.handleMouseUp);
    this.canvas.removeEventListener("wheel", this.handleMouseWheel);
    window.removeEventListener("resize", this.handleWindowResize);

    // Cancel animation frame if active
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}
