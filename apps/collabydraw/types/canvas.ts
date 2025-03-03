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

export type StrokeStyle = "solid" | "dashed" | "dotted";

export type Tool = {
  type: ToolType;
  icon: React.ReactNode;
  label: string;
  shortcut: number;
};

export type strokeWidth = 1 | 2 | 4;

export type strokeFill =
  | "rgba(211, 211, 211)"
  | "rgba(242, 154, 158)"
  | "rgba(77, 161, 83)"
  | "rgba(98, 177, 247)"
  | "rgba(183, 98, 42)";

export type bgFill =
  | "rgba(0, 0, 0, 0)"
  | "rgba(89, 49, 49)"
  | "rgba(23, 61, 16)"
  | "rgba(30, 70, 101)"
  | "rgba(49, 37, 7)";

export type canvasBg =
  | "rgba(0, 0, 0, 0)"
  | "rgba(89, 49, 49)"
  | "rgba(23, 61, 16)"
  | "rgba(30, 70, 101)"
  | "rgba(49, 37, 7)";

export type DEFAULT_CANVAS_BACKGROUND_LIGHT =
  | "#ffffff"
  | "#f8f9fa"
  | "#f5faff"
  | "#fffce8"
  | "#fdf8f6";

export type DEFAULT_CANVAS_BACKGROUND_DARK =
  | "#121212"
  | "#161718"
  | "#13171c"
  | "#181605"
  | "#1b1615";

export const canvasBgLight: DEFAULT_CANVAS_BACKGROUND_LIGHT[] = [
  "#ffffff",
  "#fffce8",
  "#fdf8f6",
  "#f8f9fa",
  "#f5faff",
];
export const canvasBgDark: DEFAULT_CANVAS_BACKGROUND_DARK[] = [
  "#121212",
  "#13171c",
  "#161718",
  "#181605",
  "#1b1615",
];

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
