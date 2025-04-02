import { FontSize, FONT_SIZE_MAP } from "@/types/canvas";

export function getFontSize(size: FontSize, scale: number): number {
  return FONT_SIZE_MAP[size] * scale;
}

export function getLineHeight(fontSize: number): number {
  return fontSize * 1.2;
}