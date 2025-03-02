import type { Drawable, Options } from "roughjs/bin/core";
import type { RoughGenerator } from "roughjs/bin/generator";
import {
  ElementShapes,
  ExcalidrawElement,
  ExcalidrawSelectionElement,
  NonDeletedExcalidrawElement,
} from "@/types/element-types";
import { canChangeRoundness } from "./comparisons";
import { ROUGHNESS } from "@/types/constants";
import { isTransparent } from "./utils";
import { getCornerRadius } from "./bound";
// import { getDiamondPoints, getArrowheadPoints } from "../element";
// import type { ElementShapes } from "./types";
// import type {
//   ExcalidrawElement,
//   NonDeletedExcalidrawElement,
//   ExcalidrawSelectionElement,
//   ExcalidrawLinearElement,
//   Arrowhead,
// } from "../element/types";
// import { generateFreeDrawShape } from "../renderer/renderElement";
// import { isTransparent, assertNever } from "../utils";
// import { simplify } from "points-on-curve";
// import { ROUGHNESS } from "../constants";
// import {
//   isElbowArrow,
//   isEmbeddableElement,
//   isIframeElement,
//   isIframeLikeElement,
//   isLinearElement,
// } from "../element/typeChecks";
// import { canChangeRoundness } from "./comparisons";
// import type { EmbedsValidationStatus } from "../types";
// import { pointFrom, pointDistance, type LocalPoint } from "@excalidraw/math";
// import { getCornerRadius, isPathALoop } from "../shapes";
// import { headingForPointIsHorizontal } from "../element/heading";

export const getDiamondPoints = (element: ExcalidrawElement) => {
  // Here we add +1 to avoid these numbers to be 0
  // otherwise rough.js will throw an error complaining about it
  const topX = Math.floor(element.width / 2) + 1;
  const topY = 0;
  const rightX = element.width;
  const rightY = Math.floor(element.height / 2) + 1;
  const bottomX = topX;
  const bottomY = element.height;
  const leftX = 0;
  const leftY = rightY;

  return [topX, topY, rightX, rightY, bottomX, bottomY, leftX, leftY];
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

const modifyIframeLikeForRoughOptions = (
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

// const getArrowheadShapes = (
//   element: ExcalidrawLinearElement,
//   shape: Drawable[],
//   position: "start" | "end",
//   arrowhead: Arrowhead,
//   generator: RoughGenerator,
//   options: Options,
//   canvasBackgroundColor: string
// ) => {
//   const arrowheadPoints = getArrowheadPoints(
//     element,
//     shape,
//     position,
//     arrowhead
//   );

//   if (arrowheadPoints === null) {
//     return [];
//   }

//   const generateCrowfootOne = (
//     arrowheadPoints: number[] | null,
//     options: Options
//   ) => {
//     if (arrowheadPoints === null) {
//       return [];
//     }

//     const [, , x3, y3, x4, y4] = arrowheadPoints;

//     return [generator.line(x3, y3, x4, y4, options)];
//   };

//   switch (arrowhead) {
//     case "dot":
//     case "circle":
//     case "circle_outline": {
//       const [x, y, diameter] = arrowheadPoints;

//       // always use solid stroke for arrowhead
//       delete options.strokeLineDash;

//       return [
//         generator.circle(x, y, diameter, {
//           ...options,
//           fill:
//             arrowhead === "circle_outline"
//               ? canvasBackgroundColor
//               : element.strokeColor,

//           fillStyle: "solid",
//           stroke: element.strokeColor,
//           roughness: Math.min(0.5, options.roughness || 0),
//         }),
//       ];
//     }
//     case "triangle":
//     case "triangle_outline": {
//       const [x, y, x2, y2, x3, y3] = arrowheadPoints;

//       // always use solid stroke for arrowhead
//       delete options.strokeLineDash;

//       return [
//         generator.polygon(
//           [
//             [x, y],
//             [x2, y2],
//             [x3, y3],
//             [x, y],
//           ],
//           {
//             ...options,
//             fill:
//               arrowhead === "triangle_outline"
//                 ? canvasBackgroundColor
//                 : element.strokeColor,
//             fillStyle: "solid",
//             roughness: Math.min(1, options.roughness || 0),
//           }
//         ),
//       ];
//     }
//     case "diamond":
//     case "diamond_outline": {
//       const [x, y, x2, y2, x3, y3, x4, y4] = arrowheadPoints;

//       // always use solid stroke for arrowhead
//       delete options.strokeLineDash;

//       return [
//         generator.polygon(
//           [
//             [x, y],
//             [x2, y2],
//             [x3, y3],
//             [x4, y4],
//             [x, y],
//           ],
//           {
//             ...options,
//             fill:
//               arrowhead === "diamond_outline"
//                 ? canvasBackgroundColor
//                 : element.strokeColor,
//             fillStyle: "solid",
//             roughness: Math.min(1, options.roughness || 0),
//           }
//         ),
//       ];
//     }
//     case "crowfoot_one":
//       return generateCrowfootOne(arrowheadPoints, options);
//     case "bar":
//     case "arrow":
//     case "crowfoot_many":
//     case "crowfoot_one_or_many":
//     default: {
//       const [x2, y2, x3, y3, x4, y4] = arrowheadPoints;

//       if (element.strokeStyle === "dotted") {
//         // for dotted arrows caps, reduce gap to make it more legible
//         const dash = getDashArrayDotted(element.strokeWidth - 1);
//         options.strokeLineDash = [dash[0], dash[1] - 1];
//       } else {
//         // for solid/dashed, keep solid arrow cap
//         delete options.strokeLineDash;
//       }
//       options.roughness = Math.min(1, options.roughness || 0);
//       return [
//         generator.line(x3, y3, x2, y2, options),
//         generator.line(x4, y4, x2, y2, options),
//         ...(arrowhead === "crowfoot_one_or_many"
//           ? generateCrowfootOne(
//               getArrowheadPoints(element, shape, position, "crowfoot_one"),
//               options
//             )
//           : []),
//       ];
//     }
//   }
// };

/**
 * Generates the roughjs shape for given element.
 *
 * Low-level. Use `ShapeCache.generateElementShape` instead.
 *
 * @private
 */
export const _generateElementShape = (
  element: Exclude<NonDeletedExcalidrawElement, ExcalidrawSelectionElement>,
  generator: RoughGenerator
): Drawable | null => {
  switch (element.type) {
    case "rectangle": {
      let shape: ElementShapes[typeof element.type];
      // this is for rendering the stroke/bg of the embeddable, especially
      // when the src url is not set

      if (element.roundness) {
        const w = element.width;
        const h = element.height;
        const r = getCornerRadius(Math.min(w, h), element);
        shape = generator.path(
          `M ${r} 0 L ${w - r} 0 Q ${w} 0, ${w} ${r} L ${w} ${
            h - r
          } Q ${w} ${h}, ${w - r} ${h} L ${r} ${h} Q 0 ${h}, 0 ${
            h - r
          } L 0 ${r} Q 0 0, ${r} 0`,
          generateRoughOptions(modifyIframeLikeForRoughOptions(element), true)
        );
      } else {
        shape = generator.rectangle(
          0,
          0,
          element.width,
          element.height,
          generateRoughOptions(modifyIframeLikeForRoughOptions(element), false)
        );
      }
      return shape;
    }
    case "diamond": {
      let shape: ElementShapes[typeof element.type];

      const [topX, topY, rightX, rightY, bottomX, bottomY, leftX, leftY] =
        getDiamondPoints(element);
      if (element.roundness) {
        const verticalRadius = getCornerRadius(Math.abs(topX - leftX), element);

        const horizontalRadius = getCornerRadius(
          Math.abs(rightY - topY),
          element
        );

        shape = generator.path(
          `M ${topX + verticalRadius} ${topY + horizontalRadius} L ${
            rightX - verticalRadius
          } ${rightY - horizontalRadius}
            C ${rightX} ${rightY}, ${rightX} ${rightY}, ${
              rightX - verticalRadius
            } ${rightY + horizontalRadius}
            L ${bottomX + verticalRadius} ${bottomY - horizontalRadius}
            C ${bottomX} ${bottomY}, ${bottomX} ${bottomY}, ${
              bottomX - verticalRadius
            } ${bottomY - horizontalRadius}
            L ${leftX + verticalRadius} ${leftY + horizontalRadius}
            C ${leftX} ${leftY}, ${leftX} ${leftY}, ${leftX + verticalRadius} ${
              leftY - horizontalRadius
            }
            L ${topX - verticalRadius} ${topY + horizontalRadius}
            C ${topX} ${topY}, ${topX} ${topY}, ${topX + verticalRadius} ${
              topY + horizontalRadius
            }`,
          generateRoughOptions(element, true)
        );
      } else {
        shape = generator.polygon(
          [
            [topX, topY],
            [rightX, rightY],
            [bottomX, bottomY],
            [leftX, leftY],
          ],
          generateRoughOptions(element)
        );
      }
      return shape;
    }
    case "ellipse": {
      const shape: ElementShapes[typeof element.type] = generator.ellipse(
        element.width / 2,
        element.height / 2,
        element.width,
        element.height,
        generateRoughOptions(element)
      );
      return shape;
    }

    default: {
      console.log(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        `generateElementShape(): Unimplemented type ${(element as any)?.type}`
      );
      return null;
    }
  }
};
