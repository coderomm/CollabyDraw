import getStroke, { StrokeOptions } from "perfect-freehand";

// This function generates a free-draw path based on points and stroke width
export function generateFreeDrawPath(
  points: { x: number; y: number }[],
  strokeWidth: number
): string {
  // Convert points to the format required by perfect-freehand
  const inputPoints = points.map((pt) => [pt.x, pt.y]);

  if (!inputPoints.length) return "";

  const options: StrokeOptions = {
    simulatePressure: true,
    size: strokeWidth * 4.25,
    thinning: 0.6,
    smoothing: 0.5,
    streamline: 0.5,
    easing: (t) => Math.sin((t * Math.PI) / 2), // easeOutSine
    last: true,
  };

  // Get the stroke points and convert to SVG path
  const strokePoints = getStroke(inputPoints, options);
  return getSvgPathFromStroke(strokePoints);
}

// Function to get the midpoint between two points
export function getMidpoint(pointA: number[], pointB: number[]): number[] {
  return [(pointA[0] + pointB[0]) / 2, (pointA[1] + pointB[1]) / 2];
}

// Regex to fix precision of numbers in SVG path
export const TO_FIXED_PRECISION =
  /(\s?[A-Z]?,?-?[0-9]*\.[0-9]{0,2})(([0-9]|e|-)*)/g;

// Convert stroke points to SVG path data
export function getSvgPathFromStroke(points: number[][]): string {
  if (!points.length) {
    return "";
  }

  const max = points.length - 1;

  return points
    .reduce(
      (acc, point, i, arr) => {
        if (i === max) {
          // Close the path by connecting back to the first point
          acc.push(point, getMidpoint(point, arr[0]), "L", arr[0], "Z");
        } else {
          // Create smooth curves between points
          acc.push(point, getMidpoint(point, arr[i + 1]));
        }
        return acc;
      },
      ["M", points[0], "Q"]
    )
    .join(" ")
    .replace(TO_FIXED_PRECISION, "$1"); // Limit precision for performance
}
