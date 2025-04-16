import React from "react";
import { WsDataType } from "@repo/common/types";

export type Mode = "standalone" | "room";
export interface WsMessage {
  id?: string;
  userId: string;
  userName: string;
  message?: Shape;
  timestamp: string;
  type: WsDataType;
}
export interface ExistingWsMessages {
  id?: string;
  userId: string;
  userName: string;
  message?: Shape[];
  timestamp: string;
  type: WsDataType;
}
export interface Point {
  x: number;
  y: number;
}
export interface RoomParams {
  roomId: string;
  encryptionKey: string;
}
export type ToolType =
  | "selection"
  | "grab"
  | "rectangle"
  | "diamond"
  | "ellipse"
  | "line"
  | "arrow"
  | "free-draw"
  | "eraser"
  | "text";
export type Tool = {
  type: ToolType;
  icon: React.ReactNode;
  label: string;
  shortcut: number;
};
export type StrokeEdge = "sharp" | "round";
export type StrokeWidth = 1 | 2 | 4;
export type StrokeStyle = "solid" | "dashed" | "dotted";
export type RoughStyle = 0 | 1 | 2;
export const ROUGHNESS = {
  architect: 0,
  artist: 1,
  cartoonist: 2,
} as const;
export type FillStyle =
  | "hachure"
  | "solid"
  | "cross-hatch"
  | "zigzag"
  | "dots"
  | "dashed"
  | "zigzag-line";
export type TextAlign = "left" | "center" | "right";
export type FontStyle = "normal" | "italic" | "bold" | "bold italic";
export type FontFamily = "hand-drawn" | "normal" | "code";
export type FontSize = "Small" | "Medium" | "Large";
export const FONT_SIZE_MAP: Record<FontSize, number> = {
  Small: 16,
  Medium: 24,
  Large: 32,
};
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
export const canvasBgLight: ReadonlyArray<string> = [
  "#ffffff",
  "#f8f9fa",
  "#f5faff",
  "#fffce8",
  "#fdf8f6",
] as const;
export const canvasBgDark: ReadonlyArray<string> = [
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
      strokeWidth: StrokeWidth;
      strokeFill: string;
      bgFill: string;
      rounded: StrokeEdge;
      strokeStyle: StrokeStyle;
      roughStyle: RoughStyle;
      fillStyle: FillStyle;
    }
  | {
      id: string | null;
      type: "ellipse";
      x: number;
      y: number;
      radX: number;
      radY: number;
      strokeWidth: StrokeWidth;
      strokeFill: string;
      bgFill: string;
      strokeStyle: StrokeStyle;
      roughStyle: RoughStyle;
      fillStyle: FillStyle;
    }
  | {
      id: string | null;
      type: "diamond";
      x: number;
      y: number;
      width: number;
      height: number;
      strokeWidth: StrokeWidth;
      strokeFill: string;
      bgFill: string;
      rounded: StrokeEdge;
      strokeStyle: StrokeStyle;
      roughStyle: RoughStyle;
      fillStyle: FillStyle;
    }
  | {
      id: string | null;
      type: "line";
      x: number;
      y: number;
      toX: number;
      toY: number;
      strokeWidth: StrokeWidth;
      strokeFill: string;
      strokeStyle: StrokeStyle;
      roughStyle: RoughStyle;
    }
  | {
      id: string | null;
      type: "arrow";
      x: number;
      y: number;
      toX: number;
      toY: number;
      strokeWidth: StrokeWidth;
      strokeFill: string;
      strokeStyle: StrokeStyle;
      roughStyle: RoughStyle;
    }
  | {
      id: string | null;
      type: "free-draw";
      points: { x: number; y: number }[];
      strokeFill: string;
      bgFill: string;
      strokeStyle: StrokeStyle;
      fillStyle: FillStyle;
      strokeWidth: StrokeWidth;
    }
  | {
      id: string | null;
      type: "selection";
      x: number;
      y: number;
      width: number;
      height: number;
      strokeWidth: StrokeWidth;
      strokeFill: string;
      bgFill: string;
      rounded: StrokeEdge;
      strokeStyle: StrokeStyle;
      roughStyle: RoughStyle;
    }
  | {
      id: string;
      type: "text";
      x: number;
      y: number;
      width: number;
      height: number;
      text: string;
      fontSize: FontSize;
      fontFamily: FontFamily;
      fontStyle: FontStyle;
      textAlign: TextAlign;
      strokeFill: string;
    };
