// import { Tool } from "./draw";

import { Shape } from "@/types/canvas";

type Tool = Shape;

export interface ResizeHandle {
  x: number;
  y: number;
  cursor: string;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export class SelectionManager {
  private canvas: HTMLCanvasElement;
  private selectedShape: Tool | null = null;
  private isDragging: boolean = false;
  private isResizing: boolean = false;
  private dragOffset: { x: number; y: number } = { x: 0, y: 0 };
  private dragEndOffset: { x: number; y: number } = { x: 0, y: 0 };
  private activeResizeHandle: ResizeHandle | null = null;
  private originalShapeBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null = null;
  private ctx: CanvasRenderingContext2D;
  private setCursor(cursor: string) {
    this.canvas.style.cursor = cursor;
  }

  private resetCursor() {
    this.canvas.style.cursor = "auto";
  }
  constructor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    this.ctx = ctx;
    this.canvas = canvas;
  }

  getSelectedShape(): Tool | null {
    return this.selectedShape;
  }

  setSelectedShape(shape: Tool | null) {
    this.selectedShape = shape;
  }

  isShapeSelected(): boolean {
    return this.selectedShape !== null;
  }

  isDraggingShape(): boolean {
    return this.isDragging;
  }

  isResizingShape(): boolean {
    return this.isResizing;
  }

  getShapeBounds(shape: Tool) {
    const bounds = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };

    switch (shape.type) {
      case "rectangle":
        bounds.width = shape.width || 0;
        bounds.height = shape.height || 0;
        if (bounds.width < 0) {
          bounds.x += bounds.width;
          bounds.width = Math.abs(bounds.width);
        }
        if (bounds.height < 0) {
          bounds.y += bounds.height;
          bounds.height = Math.abs(bounds.height);
        }
        bounds.x -= 10;
        bounds.y -= 10;
        bounds.width += 20;
        bounds.height += 20;
        break;
      case "ellipse":
        bounds.width = (shape.radX || 0) * 2;
        bounds.height = (shape.radY || 0) * 2;
        break;
      case "diamond":
        bounds.width = shape.width * 2;
        bounds.height = shape.height * 2;
        // bounds.x -= shape.centerX;
        // bounds.y -= shape.centerY;
        bounds.x = shape.centerX - shape.width / 2;
        bounds.y = shape.centerY - shape.height / 2;
        break;
      case "line":
        // case "arrow":
        bounds.width = Math.abs(shape.fromX - shape.fromX) + 20;
        bounds.height = Math.abs(shape.fromY - shape.fromY) + 20;
        bounds.x = Math.min(shape.fromX, shape.toX) - 10;
        bounds.y = Math.min(shape.fromY, shape.toY) - 10;
        break;
      // case "text":
      //     this.ctx.font = '24px Comic Sans MS, cursive';
      //     const metrics = this.ctx.measureText(shape.text || "");
      //     bounds.x = shape.x-10
      //     bounds.y = shape.y-10
      //     bounds.width = metrics.width+20;
      //     bounds.height = 48;
      //     break;
    }

    return bounds;
  }

  private getResizeHandles(bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): ResizeHandle[] {
    return [
      { x: bounds.x, y: bounds.y, cursor: "nw-resize", position: "top-left" },
      {
        x: bounds.x + bounds.width,
        y: bounds.y,
        cursor: "ne-resize",
        position: "top-right",
      },
      {
        x: bounds.x,
        y: bounds.y + bounds.height,
        cursor: "sw-resize",
        position: "bottom-left",
      },
      {
        x: bounds.x + bounds.width,
        y: bounds.y + bounds.height,
        cursor: "se-resize",
        position: "bottom-right",
      },
    ];
  }

  drawSelectionBox(bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) {
    this.ctx.save();
    this.ctx.strokeStyle = "#6082B6";
    // this.ctx.setLineDash([5, 5]);
    this.ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);

    // Draw resize handles
    this.ctx.fillStyle = "#6082B6";
    const handles = this.getResizeHandles(bounds);
    handles.forEach((handle) => {
      this.ctx.beginPath();
      this.ctx.arc(handle.x, handle.y, 7, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.ctx.restore();
  }

  isPointInShape(x: number, y: number, shape: Tool): boolean {
    const bounds = this.getShapeBounds(shape);
    return (
      x >= bounds.x &&
      x <= bounds.x + bounds.width &&
      y >= bounds.y &&
      y <= bounds.y + bounds.height
    );
  }

  getResizeHandleAtPoint(
    x: number,
    y: number,
    bounds: { x: number; y: number; width: number; height: number }
  ): ResizeHandle | null {
    const handles = this.getResizeHandles(bounds);
    const handleRadius = 5;

    return (
      handles.find((handle) => {
        const dx = x - handle.x;
        const dy = y - handle.y;
        return dx * dx + dy * dy <= handleRadius * handleRadius;
      }) || null
    );
  }

  startDragging(x: number, y: number) {
    if (this.selectedShape) {
      this.isDragging = true;

      // if (this.selectedShape.type === "line" || this.selectedShape.type === "arrow") {
      if (this.selectedShape.type === "line") {
        this.dragEndOffset = {
          x: x - this.selectedShape.toX,
          y: y - this.selectedShape.toY,
        };
      } else if (this.selectedShape.type === "ellipse") {
        this.selectedShape.centerX = x - this.dragOffset.x;
        this.selectedShape.centerY = y - this.dragOffset.y;
      } else if (this.selectedShape.type === "diamond") {
        this.selectedShape.centerX = x - this.dragOffset.x;
        this.selectedShape.centerY = y - this.dragOffset.y;
      } else if (this.selectedShape.type === "rectangle") {
        this.selectedShape.x = x - this.dragOffset.x;
        this.selectedShape.y = y - this.dragOffset.y;
      }
      this.setCursor("move");
    }
  }

  startResizing(x: number, y: number) {
    if (this.selectedShape) {
      const bounds = this.getShapeBounds(this.selectedShape);
      const handle = this.getResizeHandleAtPoint(x, y, bounds);

      if (handle) {
        this.isResizing = true;
        this.activeResizeHandle = handle;
        this.originalShapeBounds = { ...bounds };
        this.setCursor(handle.cursor);
      }
    }
  }

  updateDragging(x: number, y: number) {
    if (this.isDragging && this.selectedShape) {
      if (this.selectedShape.type === "line") {
        // || this.selectedShape.type === "arrow") {
        // Calculate the movement delta
        const dx = x - this.dragOffset.x;
        const dy = y - this.dragOffset.y;

        // Move both start and end points by the same amount
        const moveX = dx - this.selectedShape.fromX;
        const moveY = dy - this.selectedShape.fromY;

        this.selectedShape.fromX = dx;
        this.selectedShape.fromY = dy;
        this.selectedShape.toX += moveX;
        this.selectedShape.toY += moveY;
      } else if (this.selectedShape.type === "ellipse") {
        // Calculate the movement delta
        const dx = x - this.dragOffset.x;
        const dy = y - this.dragOffset.y;

        if (!this.selectedShape.radX || !this.selectedShape.radY) return;
        // Move the circle's start and end points by the same amount
        this.selectedShape.centerX = dx;
        this.selectedShape.centerY = dy;
        this.selectedShape.radX = dx + this.selectedShape.centerX * 2; // Diameter = radius * 2
        this.selectedShape.radY = dy + this.selectedShape.centerY * 2; // Diameter = radius * 2
      } 
    //   else {
    //     // For other shapes, just update the position
    //     this.selectedShape.x = x - this.dragOffset.x;
    //     this.selectedShape.y = y - this.dragOffset.y;
    //   }
    }
  }

  updateResizing(x: number, y: number) {
    if (
      this.isResizing &&
      this.selectedShape &&
      this.activeResizeHandle &&
      this.originalShapeBounds
    ) {
      const newBounds = { ...this.originalShapeBounds };
      this.setCursor(this.activeResizeHandle.cursor);
      switch (this.activeResizeHandle.position) {
        case "top-left":
          newBounds.width += newBounds.x - x;
          newBounds.height += newBounds.y - y;
          newBounds.x = x;
          newBounds.y = y;
          break;
        case "top-right":
          newBounds.width = x - newBounds.x;
          newBounds.height += newBounds.y - y;
          newBounds.y = y;
          break;
        case "bottom-left":
          newBounds.width += newBounds.x - x;
          newBounds.height = y - newBounds.y;
          newBounds.x = x;
          break;
        case "bottom-right":
          newBounds.width = x - newBounds.x;
          newBounds.height = y - newBounds.y;
          break;
      }

      if (this.selectedShape.type === "rectangle") {
        this.selectedShape.x = newBounds.x;
        this.selectedShape.y = newBounds.y;
        this.selectedShape.width = newBounds.width;
        this.selectedShape.height = newBounds.height;
      } else if (this.selectedShape.type === "ellipse") {
        // // Update the circle's start/end points and radii
        // this.selectedShape.x = newBounds.x; // Left edge of bounding box
        // this.selectedShape.endX = newBounds.x + newBounds.width; // Right edge of bounding box
        // this.selectedShape.y = newBounds.y; // Top edge of bounding box
        // this.selectedShape.endY = newBounds.y + newBounds.height; // Bottom edge of bounding box

        // // Update the radii (width/height are radiusX and radiusY)
        // this.selectedShape.width = Math.max(newBounds.width / 2, 0); // radiusX = diameter / 2
        // this.selectedShape.height = Math.max(newBounds.height / 2, 0); // radiusY = diameter / 2
      } else if (this.selectedShape.type === "diamond") {
        this.selectedShape.width =
          Math.max(Math.abs(newBounds.width), Math.abs(newBounds.height)) / 2;
      } else if (this.selectedShape.type === "line") {
        // || this.selectedShape.type === "arrow") {
        // Update line/arrow endpoints based on the resize handle
        switch (this.activeResizeHandle.position) {
          case "top-left":
            this.selectedShape.fromX = x;
            this.selectedShape.fromY = y;
            break;
          case "top-right":
            this.selectedShape.toX = x;
            this.selectedShape.fromY = y;
            break;
          case "bottom-left":
            this.selectedShape.fromX = x;
            this.selectedShape.toY = y;
            break;
          case "bottom-right":
            this.selectedShape.toX = x;
            this.selectedShape.toY = y;
            break;
        }
      }
    }
  }

  stopDragging() {
    this.isDragging = false;
    this.resetCursor();
  }

  stopResizing() {
    this.isResizing = false;
    this.activeResizeHandle = null;
    this.originalShapeBounds = null;
    this.resetCursor();
  }
}
