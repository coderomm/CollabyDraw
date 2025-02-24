import type React from "react"
export type Point = {
  x: number
  y: number
}

export type ShapeType = "selection" | "rectangle" | "diamond" | "ellipse" | "arrow" | "line" | "pen" | "text" | "eraser"

export type StrokeStyle = "solid" | "dashed" | "dotted"

export type Shape = {
  id: string
  type: ShapeType
  points: Point[]
  strokeColor: string
  fillColor: string
  strokeWidth: number
  strokeStyle: StrokeStyle
  opacity: number
  sloppiness: number
  roughness: number
  zIndex: number
}

export type Tool = {
  type: ShapeType
  icon: React.ReactNode
  label: string
}

