import type React from "react";

export type Point = {
  x: number;
  y: number;
};

export type ToolType =
  | "grab"
  | "selection"
  | "rectangle"
  | "diamond"
  | "ellipse"
  | "arrow"
  | "line"
  | "pen"
  | "text"
  | "eraser";

export type Tool = {
  type: ToolType;
  icon: React.ReactNode;
  label: string;
  shortcut: number;
};

export type StrokeEdge = "sharp" | "round";

export type StrokeWidth = 1 | 2 | 4;

export type StrokeStyle = "solid" | "dashed" | "dotted";

export type StrokeFill =
  | "#1e1e1e"
  | "#e03131"
  | "#2f9e44"
  | "#1971c2"
  | "#f08c00";

export type StrokeFillDark =
  | "#d3d3d3"
  | "#ff8383"
  | "#3a994c"
  | "#55a1e6"
  | "#b76100";

export type BgFill =
  | "#00000000"
  | "#ffc9c9"
  | "#b2f2bb"
  | "#a5d8ff"
  | "#ffec99";

export type BgFillDark =
  | "#00000000"
  | "#5b2c2c"
  | "#043b0c"
  | "#154163"
  | "#362500";

export const canvasBgLight = [
  "#ffffff",
  "#f8f9fa",
  "#f5faff",
  "#fffce8",
  "#fdf8f6",
] as const;

export const canvasBgDark = [
  "#121212",
  "#161718",
  "#13171c",
  "#181605",
  "#1b1615",
] as const;

export type DEFAULT_CANVAS_BACKGROUND_LIGHT = (typeof canvasBgLight)[number];

export type DEFAULT_CANVAS_BACKGROUND_DARK = (typeof canvasBgDark)[number];

export const LOCALSTORAGE_CANVAS_KEY = "standalone_canvas_shapes";

export type Shape =
  | {
      id: string | null;
      type: "rectangle";
      x: number;
      y: number;
      width: number;
      height: number;
      strokeWidth: number;
      strokeFill: string;
      bgFill: string;
      rounded: StrokeEdge;
      strokeStyle: StrokeStyle;
    }
  | {
      id: string | null;
      type: "ellipse";
      x: number;
      y: number;
      radX: number;
      radY: number;
      strokeWidth: number;
      strokeFill: string;
      bgFill: string;
      strokeStyle: StrokeStyle;
    }
  | {
      id: string | null;
      type: "diamond";
      x: number;
      y: number;
      width: number;
      height: number;
      strokeWidth: number;
      strokeFill: string;
      bgFill: string;
      rounded: StrokeEdge;
      strokeStyle: StrokeStyle;
    }
  | {
      id: string | null;
      type: "line";
      x: number;
      y: number;
      toX: number;
      toY: number;
      strokeWidth: number;
      strokeFill: string;
      strokeStyle: StrokeStyle;
    }
  | {
      id: string | null;
      type: "arrow";
      x: number;
      y: number;
      toX: number;
      toY: number;
      strokeWidth: number;
      strokeFill: string;
      strokeStyle: StrokeStyle;
    }
  | {
      id: string | null;
      type: "pen";
      points: { x: number; y: number }[];
      strokeWidth: number;
      strokeFill: string;
      strokeStyle: StrokeStyle;
    }
  | {
      id: string | null;
      type: "selection";
      x: number;
      y: number;
      width: number;
      height: number;
      strokeWidth: number;
      strokeFill: string;
      bgFill: string;
      rounded: StrokeEdge;
      strokeStyle: StrokeStyle;
    };

export enum WS_DATA_TYPE {
  JOIN = "JOIN",
  LEAVE = "LEAVE",
  USER_JOINED = "USER_JOINED",
  USER_LEFT = "USER_LEFT",
  DRAW = "DRAW",
  ERASER = "ERASER",
  UPDATE = "UPDATE",
  EXISTING_PARTICIPANTS = "EXISTING_PARTICIPANTS",
}

export type WsMessage = {
  id?: string;
  userId: string;
  userName: string;
  message?: Shape;
  timestamp: string;
  type: WS_DATA_TYPE;
};
