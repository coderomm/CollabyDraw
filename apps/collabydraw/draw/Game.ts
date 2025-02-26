import { getRoom } from "@/actions/room";
import { ShapeType } from "@/types/canvas";

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

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private roomId: string;
  private sendMessage: (data: string) => void;
  private existingShape: Shape[];
  private clicked: boolean;
  private roomName: string;
  private activeTool: ShapeType = "grab";
  private startX: number = 0;
  private startY: number = 0;
  private panX: number = 0;
  private panY: number = 0;
  private scale: number = 1;
  private onScaleChangeCallback: (scale: number) => void;
  public outputScale: number = 1;
  private strokeWidth: number = 1;
  private strokeFill: string = "rgba(255, 255, 255)";
  private bgFill: string = "rgba(18, 18, 18)";

  constructor(
    canvas: HTMLCanvasElement,
    roomId: string,
    sendMessage: (data: string) => void,
    roomName: string,
    onScaleChangeCallback: (scale: number) => void,
    initialShapes: Shape[] = []
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.roomId = roomId;
    this.sendMessage = sendMessage;
    this.clicked = false;
    this.existingShape = [...initialShapes];
    this.canvas.width = document.body.clientWidth;
    this.canvas.height = document.body.clientHeight;
    this.onScaleChangeCallback = onScaleChangeCallback;
    this.roomName = roomName;
    this.init();
    // this.initHandler();
    this.initMouseHandler();
  }

  async init() {
    try {
      const getRoomResult = await getRoom({ roomName: this.roomName });
      if (getRoomResult?.success && getRoomResult.room?.Chat) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getRoomResult.room.Chat.forEach((shape: any) => {
          try {
            const parsedShapes = JSON.parse(shape.message);
            const parsedShapeData = JSON.parse(parsedShapes.data);
            this.existingShape.push(parsedShapeData.shape);
          } catch (e) {
            console.error("Error parsing shape data:", e);
          }
        });
      } else if (!getRoomResult?.success) {
        console.error("Error fetching room: " + getRoomResult?.error);
      }
    } catch (error) {
      console.error("Error in init:", error);
    }
    console.log(this.existingShape);
    this.clearCanvas();
  }

  // initHandler() {
  //   this.socket.onmessage = (event) => {
  //     const data = JSON.parse(event.data);

  //     if (data.type === "draw") {
  //       const parsedShape = JSON.parse(data.data);
  //       this.existingShape.push(parsedShape.shape);
  //       this.clearCanvas();
  //     } else if (data.type === "eraser") {
  //       const parsedShape = JSON.parse(data.data);
  //       this.existingShape = this.existingShape.filter(
  //         (shape) => JSON.stringify(shape) !== JSON.stringify(parsedShape.shape)
  //       );
  //       this.clearCanvas();
  //     }
  //   };
  // }

  initMouseHandler() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("wheel", this.mouseWheelHandler);
  }

  setTool(tool: ShapeType) {
    this.activeTool = tool;
  }

  setStrokeWidth(width: number) {
    this.strokeWidth = width;
    this.clearCanvas();
  }

  setStrokeFill(fill: string) {
    this.strokeFill = fill;
    this.clearCanvas();
  }

  setBgFill(fill: string) {
    this.bgFill = fill;
    this.clearCanvas();
  }

  updateShapes(shapes: Shape[]) {
    this.existingShape = shapes;
    this.clearCanvas();
  }

  clearCanvas() {
    this.ctx.setTransform(this.scale, 0, 0, this.scale, this.panX, this.panY);
    this.ctx.clearRect(
      -this.panX / this.scale,
      -this.panY / this.scale,
      this.canvas.width / this.scale,
      this.canvas.height / this.scale
    );
    this.ctx.fillStyle = "rgba(18, 18, 18)";
    this.ctx.fillRect(
      // Adjusts the offset of the canvas
      -this.panX / this.scale,
      -this.panY / this.scale,
      // Adjusts the scale of the canvas
      this.canvas.width / this.scale,
      this.canvas.height / this.scale
    );

    this.existingShape.map((shape: Shape) => {
      if (shape.type === "rect") {
        this.drawRect(
          shape.x,
          shape.y,
          shape.width,
          shape.height,
          shape.strokeWidth,
          shape.strokeFill,
          shape.bgFill
        );
      } else if (shape.type === "ellipse") {
        this.drawEllipse(
          shape.centerX,
          shape.centerY,
          shape.radX,
          shape.radY,
          shape.strokeWidth,
          shape.strokeFill,
          shape.bgFill
        );
      } else if (shape.type === "line") {
        this.drawLine(
          shape.fromX,
          shape.fromY,
          shape.toX,
          shape.toY,
          shape.strokeWidth,
          shape.strokeFill
        );
      } else if (shape.type === "pen") {
        this.drawPencil(shape.points, shape.strokeWidth, shape.strokeFill);
      }
    });
  }

  mouseDownHandler = (e: MouseEvent) => {
    this.clicked = true;

    const { x, y } = this.transformPanScale(e.clientX, e.clientY);

    this.startX = x;
    this.startY = y;

    if (this.activeTool === "pen") {
      this.existingShape.push({
        type: "pen",
        points: [{ x, y }],
        strokeWidth: this.strokeWidth,
        strokeFill: this.strokeFill,
      });
    } else if (this.activeTool === "eraser") {
      this.eraser(x, y);
    } else if (this.activeTool === "grab") {
      this.startX = e.clientX;
      this.startY = e.clientY;
    }
  };

  mouseMoveHandler = (e: MouseEvent) => {
    if (this.clicked) {
      const { x, y } = this.transformPanScale(e.clientX, e.clientY);

      const width = x - this.startX;
      const height = y - this.startY;

      this.clearCanvas();

      const activeTool = this.activeTool;

      if (activeTool === "rectangle") {
        this.drawRect(
          this.startX,
          this.startY,
          width,
          height,
          this.strokeWidth,
          this.strokeFill,
          this.bgFill
        );
      } else if (activeTool === "ellipse") {
        const centerX = this.startX + width / 2;
        const centerY = this.startY + height / 2;
        const radX = Math.abs(width / 2);
        const radY = Math.abs(height / 2);
        this.drawEllipse(
          centerX,
          centerY,
          radX,
          radY,
          this.strokeWidth,
          this.strokeFill,
          this.bgFill
        );
      } else if (activeTool === "line") {
        this.drawLine(
          this.startX,
          this.startY,
          x,
          y,
          this.strokeWidth,
          this.strokeFill
        );
      } else if (activeTool === "pen") {
        const currentShape = this.existingShape[this.existingShape.length - 1];
        if (currentShape?.type === "pen") {
          currentShape.points.push({ x, y });
          this.drawPencil(
            currentShape.points,
            this.strokeWidth,
            this.strokeFill
          );
        }
      } else if (activeTool === "eraser") {
        this.eraser(x, y);
      } else if (activeTool === "grab") {
        const { x: transformedX, y: transformedY } = this.transformPanScale(
          e.clientX,
          e.clientY
        );
        const { x: startTransformedX, y: startTransformedY } =
          this.transformPanScale(this.startX, this.startY);

        const deltaX = transformedX - startTransformedX;
        const deltaY = transformedY - startTransformedY;

        this.panX += deltaX * this.scale;
        this.panY += deltaY * this.scale;
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.clearCanvas();
      }
    }
  };

  // Collision Detection => Chat GPT
  isPointInShape(x: number, y: number, shape: Shape): boolean {
    const tolerance = 5;

    if (shape.type === "rect") {
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
    } else if (shape.type === "ellipse") {
      const dx = x - shape.centerX;
      const dy = y - shape.centerY;
      const normalized =
        (dx * dx) / ((shape.radX + tolerance) * (shape.radX + tolerance)) +
        (dy * dy) / ((shape.radY + tolerance) * (shape.radY + tolerance));
      return normalized <= 1;
    } else if (shape.type === "line") {
      const lineLength = Math.hypot(
        shape.toX - shape.fromX,
        shape.toY - shape.fromY
      );
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
    } else if (shape.type === "pen") {
      return shape.points.some(
        (point) => Math.hypot(point.x - x, point.y - y) <= tolerance
      );
    }

    return false;
  }

  transformPanScale(
    clientX: number,
    clientY: number
  ): { x: number; y: number } {
    const x = (clientX - this.panX) / this.scale;
    const y = (clientY - this.panY) / this.scale;
    return { x, y };
  }

  drawRect(
    x: number,
    y: number,
    width: number,
    height: number,
    strokeWidth: number,
    strokeFill: string,
    bgFill: string
  ) {
    // If we draw right to left, width is -ve and so postion of mouse + (-ve width) gives top left corner
    const posX = width < 0 ? x + width : x;
    const posY = height < 0 ? y + height : y;
    const normalizedWidth = Math.abs(width);
    const normalizedHeight = Math.abs(height);

    strokeWidth = strokeWidth || 1;
    strokeFill = strokeFill || "rgba(255, 255, 255)";
    bgFill = bgFill || "rgba(18, 18, 18)";

    const radius = Math.min(
      Math.abs(Math.max(normalizedWidth, normalizedHeight) / 20),
      normalizedWidth / 2,
      normalizedHeight / 2
    );

    // RoundRect : https://stackoverflow.com/a/3368118
    this.ctx.beginPath();
    this.ctx.moveTo(posX + radius, posY);
    this.ctx.strokeStyle = strokeFill;
    this.ctx.lineWidth = strokeWidth;
    this.ctx.fillStyle = bgFill;
    this.ctx.lineTo(posX + normalizedWidth - radius, posY);
    this.ctx.quadraticCurveTo(
      posX + normalizedWidth,
      posY,
      posX + normalizedWidth,
      posY + radius
    );
    this.ctx.lineTo(posX + normalizedWidth, posY + normalizedHeight - radius);
    this.ctx.quadraticCurveTo(
      posX + normalizedWidth,
      posY + normalizedHeight,
      posX + normalizedWidth - radius,
      posY + normalizedHeight
    );
    this.ctx.lineTo(posX + radius, posY + normalizedHeight);
    this.ctx.quadraticCurveTo(
      posX,
      posY + normalizedHeight,
      posX,
      posY + normalizedHeight - radius
    );
    this.ctx.lineTo(posX, posY + radius);
    this.ctx.quadraticCurveTo(posX, posY, posX + radius, posY);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
    // this.ctx.strokeRect(x , y, width, height)
  }

  drawEllipse(
    x: number,
    y: number,
    width: number,
    height: number,
    strokeWidth: number,
    strokeFill: string,
    bgFill: string
  ) {
    strokeWidth = strokeWidth || 1;
    strokeFill = strokeFill || "rgba(255, 255, 255)";
    bgFill = bgFill || "rgba(18, 18, 18)";

    this.ctx.beginPath();
    this.ctx.strokeStyle = strokeFill;
    this.ctx.lineWidth = strokeWidth;
    this.ctx.fillStyle = bgFill;
    this.ctx.ellipse(x, y, width, height, 0, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();
  }

  drawLine(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    strokeWidth: number,
    strokeFill: string
  ) {
    strokeWidth = strokeWidth || 1;
    strokeFill = strokeFill || "rgba(255, 255, 255)";

    this.ctx.beginPath();
    this.ctx.strokeStyle = strokeFill;
    this.ctx.lineWidth = strokeWidth;

    this.ctx.moveTo(fromX, fromY);
    this.ctx.lineTo(toX, toY);
    this.ctx.stroke();
  }

  drawPencil(
    points: { x: number; y: number }[],
    strokeWidth: number,
    strokeFill: string
  ) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = strokeFill;
    this.ctx.lineWidth = strokeWidth;
    if (points[0] === undefined) return null;
    this.ctx.moveTo(points[0].x, points[0].y);
    points.forEach((point) => this.ctx.lineTo(point.x, point.y));
    this.ctx.stroke();
  }

  eraser(x: number, y: number) {
    const transformedPoint = this.transformPanScale(x, y);

    const shapeIndex = this.existingShape.findIndex((shape) =>
      this.isPointInShape(transformedPoint.x, transformedPoint.y, shape)
    );

    if (shapeIndex !== -1) {
      const erasedShape = this.existingShape[shapeIndex];
      this.existingShape.splice(shapeIndex, 1);
      this.clearCanvas();

      this.sendMessage(
        JSON.stringify({
          type: "eraser",
          data: JSON.stringify({
            shape: erasedShape,
          }),
          roomId: this.roomId,
        })
      );
    }
  }

  mouseUpHandler = (e: MouseEvent) => {
    this.clicked = false;

    const { x, y } = this.transformPanScale(e.clientX, e.clientY);
    const width = x - this.startX;
    const height = y - this.startY;

    let shape: Shape | null = null;
    if (this.activeTool === "rectangle") {
      shape = {
        type: "rect",
        x: this.startX,
        y: this.startY,
        width,
        height,
        strokeWidth: this.strokeWidth,
        strokeFill: this.strokeFill,
        bgFill: this.bgFill,
      };
    } else if (this.activeTool === "ellipse") {
      const centerX = this.startX + width / 2;
      const centerY = this.startY + height / 2;
      const radX = Math.abs(width / 2);
      const radY = Math.abs(height / 2);

      shape = {
        type: "ellipse",
        centerX,
        centerY,
        radX,
        radY,
        strokeWidth: this.strokeWidth,
        strokeFill: this.strokeFill,
        bgFill: this.bgFill,
      };
    } else if (this.activeTool === "line") {
      shape = {
        type: "line",
        fromX: this.startX,
        fromY: this.startY,
        toX: x,
        toY: y,
        strokeWidth: this.strokeWidth,
        strokeFill: this.strokeFill,
      };
    } else if (this.activeTool === "pen") {
      const currentShape = this.existingShape[this.existingShape.length - 1];
      if (currentShape?.type === "pen") {
        shape = {
          type: "pen",
          points: currentShape.points,
          strokeWidth: this.strokeWidth,
          strokeFill: this.strokeFill,
        };
      }
    } else if (this.activeTool === "grab") {
      this.startX = e.clientX;
      this.startY = e.clientY;
    }

    if (!shape) {
      return;
    }

    this.existingShape.push(shape);

    this.sendMessage(
      JSON.stringify({
        type: "draw",
        data: JSON.stringify({
          shape,
        }),
        roomId: this.roomId,
      })
    );
  };

  mouseWheelHandler = (e: WheelEvent) => {
    e.preventDefault();

    const scaleAmount = -e.deltaY / 200;
    const newScale = this.scale * (1 + scaleAmount);

    const mouseX = e.clientX - this.canvas.offsetLeft;
    const mouseY = e.clientY - this.canvas.offsetTop;
    // Position of cursor on canvas
    const canvasMouseX = (mouseX - this.panX) / this.scale;
    const canvasMouseY = (mouseY - this.panY) / this.scale;

    this.panX -= canvasMouseX * (newScale - this.scale);
    this.panY -= canvasMouseY * (newScale - this.scale);

    this.scale = newScale;

    this.onScaleChange(this.scale);
    this.clearCanvas();
  };

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("wheel", this.mouseWheelHandler);
  }

  onScaleChange(scale: number) {
    this.outputScale = scale;
    if (this.onScaleChangeCallback) {
      this.onScaleChangeCallback(scale);
    }
  }
}
