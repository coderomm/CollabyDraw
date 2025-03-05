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

export type StrokeWidth = 1 | 2 | 4;
export type StrokeStyle = "solid" | "dashed" | "dotted";
export type StrokeFill =
  | "#1e1e1e"
  | "#e03131"
  | "#2f9e44"
  | "#1971c2"
  | "#f08c00";
  
export type BgFill =
  | "#00000000"
  | "#ffc9c9"
  | "#b2f2bb"
  | "#a5d8ff"
  | "#ffec99";

// export type canvasBg =
//   | "rgba(0, 0, 0, 0)"
//   | "rgba(89, 49, 49)"
//   | "rgba(23, 61, 16)"
//   | "rgba(30, 70, 101)"
//   | "rgba(49, 37, 7)";

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

export type Shape =
  | {
      type: "rectangle";
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
      type: "diamond";
      centerX: number;
      centerY: number;
      width: number;
      height: number;
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
