export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL;
export const getDashArrayDashed = (strokeWidth: number) => [
  strokeWidth,
  strokeWidth * 4,
];
export const getDashArrayDotted = (strokeWidth: number) => [
  strokeWidth,
  strokeWidth * 2,
];
export const CORNER_RADIUS_FACTOR = 20;
export const ROUND_RADIUS_FACTOR = 0.25;
export const RECT_CORNER_RADIUS_FACTOR = CORNER_RADIUS_FACTOR;
export const DIAMOND_CORNER_RADIUS_PERCENTAGE = CORNER_RADIUS_FACTOR;
export const ERASER_TOLERANCE = 5;
export const DEFAULT_STROKE_WIDTH = 1;
export const DEFAULT_STROKE_FILL = "rgba(255, 255, 255)";
export const DEFAULT_BG_FILL = "rgba(18, 18, 18)";
export const ARROW_HEAD_LENGTH = 20;
export const COLOR_WHITE = "#ffffff";
export const COLOR_CHARCOAL_BLACK = "#1e1e1e";
export const COLOR_DRAG_CALL = "#a2f1a5";
export const TEXT_ADJUSTED_HEIGHT = 40;