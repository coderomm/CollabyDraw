/**
 * Generates a unique key for identifying a streamed shape based on user ID,
 * connection ID, and shape ID. Useful for managing real-time shape updates
 * in collaborative canvas environments.
 *
 * @param {Object} params
 * @param {string} params.userId - The user ID of the shape sender
 * @param {string} params.connectionId - The WebSocket connection ID
 * @param {string} params.shapeId - The unique shape ID
 * @returns {string} A concatenated key in the format: `${userId}-${connectionId}-${shapeId}`
 *
 * @example
 * const key = getStreamKey({ userId: "u1", connectionId: "c1", shapeId: "s1" });
 * // "u1-c1-s1"
 */
export function getStreamKey({
  userId,
  connectionId,
  shapeId,
}: {
  userId: string;
  connectionId: string;
  shapeId: string;
}): string {
  return `${userId}-${connectionId}-${shapeId}`;
}
