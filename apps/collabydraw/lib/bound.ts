import {
  DEFAULT_ADAPTIVE_RADIUS,
  DEFAULT_PROPORTIONAL_RADIUS,
  ROUGHNESS,
  ROUNDNESS,
} from "@/types/constants";
import {
  ExcalidrawElement,
  NonDeletedExcalidrawElement,
} from "@/types/element-types";
import { Options } from "roughjs/bin/core";
import { isTransparent } from "./utils";
import { canChangeRoundness } from "./comparisons";

export const getCornerRadius = (x: number, element: ExcalidrawElement) => {
  if (
    element.roundness?.type === ROUNDNESS.PROPORTIONAL_RADIUS ||
    element.roundness?.type === ROUNDNESS.LEGACY
  ) {
    return x * DEFAULT_PROPORTIONAL_RADIUS;
  }

  if (element.roundness?.type === ROUNDNESS.ADAPTIVE_RADIUS) {
    const fixedRadiusSize = element.roundness?.value ?? DEFAULT_ADAPTIVE_RADIUS;

    const CUTOFF_SIZE = fixedRadiusSize / DEFAULT_PROPORTIONAL_RADIUS;

    if (x <= CUTOFF_SIZE) {
      return x * DEFAULT_PROPORTIONAL_RADIUS;
    }

    return fixedRadiusSize;
  }

  return 0;
};

const getDashArrayDashed = (strokeWidth: number) => [8, 8 + strokeWidth];
const getDashArrayDotted = (strokeWidth: number) => [1.5, 6 + strokeWidth];

function adjustRoughness(element: ExcalidrawElement): number {
  const roughness = element.roughness;

  const maxSize = Math.max(element.width, element.height);
  const minSize = Math.min(element.width, element.height);

  // don't reduce roughness if
  if (
    // both sides relatively big
    (minSize >= 20 && maxSize >= 50) ||
    // is round & both sides above 15px
    (minSize >= 15 && !!element.roundness && canChangeRoundness(element.type))
  ) {
    return roughness;
  }

  return Math.min(roughness / (maxSize < 10 ? 3 : 2), 2.5);
}

export const generateRoughOptions = (
  element: ExcalidrawElement,
  continuousPath = false
): Options => {
  const options: Options = {
    seed: element.seed,
    strokeLineDash:
      element.strokeStyle === "dashed"
        ? getDashArrayDashed(element.strokeWidth)
        : element.strokeStyle === "dotted"
          ? getDashArrayDotted(element.strokeWidth)
          : undefined,
    // for non-solid strokes, disable multiStroke because it tends to make
    // dashes/dots overlay each other
    disableMultiStroke: element.strokeStyle !== "solid",
    // for non-solid strokes, increase the width a bit to make it visually
    // similar to solid strokes, because we're also disabling multiStroke
    strokeWidth:
      element.strokeStyle !== "solid"
        ? element.strokeWidth + 0.5
        : element.strokeWidth,
    // when increasing strokeWidth, we must explicitly set fillWeight and
    // hachureGap because if not specified, roughjs uses strokeWidth to
    // calculate them (and we don't want the fills to be modified)
    fillWeight: element.strokeWidth / 2,
    hachureGap: element.strokeWidth * 4,
    roughness: adjustRoughness(element),
    stroke: element.strokeColor,
    preserveVertices:
      continuousPath || element.roughness < ROUGHNESS.cartoonist,
  };

  switch (element.type) {
    case "rectangle":
    case "diamond":
    case "ellipse": {
      options.fillStyle = element.fillStyle;
      options.fill = isTransparent(element.backgroundColor)
        ? undefined
        : element.backgroundColor;
      if (element.type === "ellipse") {
        options.curveFitting = 1;
      }
      return options;
    }
    default: {
      throw new Error(`Unimplemented type ${element.type}`);
    }
  }
};

export const modifyIframeLikeForRoughOptions = (
  element: NonDeletedExcalidrawElement
) => {
  if (
    isTransparent(element.backgroundColor) &&
    isTransparent(element.strokeColor)
  ) {
    return {
      ...element,
      roughness: 0,
      backgroundColor: "#d3d3d3",
      fillStyle: "solid",
    } as const;
  }
  return element;
};

export const getElementAbsoluteCoords = (
  element: ExcalidrawElement
): [number, number, number, number, number, number] => {
  return [
    element.x,
    element.y,
    element.x + element.width,
    element.y + element.height,
    element.x + element.width / 2,
    element.y + element.height / 2,
  ];
};
export interface ExcalidrawElementWithCanvas {
    element: ExcalidrawElement;
    canvas: HTMLCanvasElement;
    scale: number;
    angle: number;
    canvasOffsetX: number;
    canvasOffsetY: number;
    boundTextElementVersion: number | null;
    imageCrop: null;
    containingFrameOpacity: number;
    boundTextCanvas: HTMLCanvasElement;
  }
export const drawElementFromCanvas = (
  elementWithCanvas: ExcalidrawElementWithCanvas,
  context: CanvasRenderingContext2D,
) => {
  const element = elementWithCanvas.element;
  const padding = 20;
  const [x1, y1, x2, y2] = getElementAbsoluteCoords(element);
  const cx = ((x1 + x2) / 2 + window.scrollX) * window.devicePixelRatio;
  const cy = ((y1 + y2) / 2 + window.scrollY) * window.devicePixelRatio;

  context.save();
  context.scale(1 / window.devicePixelRatio, 1 / window.devicePixelRatio);

  // we translate context to element center so that rotation and scale
  // originates from the element center
  context.translate(cx, cy);

  context.rotate(element.angle);

  // revert afterwards we don't have account for it during drawing
  context.translate(-cx, -cy);

  context.drawImage(
    elementWithCanvas.canvas!,
    (x1 + window.scrollX) * window.devicePixelRatio -
      (padding * elementWithCanvas.scale) / elementWithCanvas.scale,
    (y1 + window.scrollY) * window.devicePixelRatio -
      (padding * elementWithCanvas.scale) / elementWithCanvas.scale,
    elementWithCanvas.canvas!.width / elementWithCanvas.scale,
    elementWithCanvas.canvas!.height / elementWithCanvas.scale
  );

  context.restore();

  // Clear the nested element we appended to the DOM
};
