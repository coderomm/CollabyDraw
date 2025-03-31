import { RoomParams } from "@/types/canvas";

/**
 * Extracts room parameters from URL hash
 * @returns RoomParams object or null if invalid hash
 */
export function getRoomParamsFromHash(hash: string): RoomParams | null {
  // Check if hash has the correct format
  if (!hash.startsWith("#room=")) return null;

  const [, roomIdAndKey] = hash.split("#room=");
  const [roomId, encryptionKey] = roomIdAndKey.split(",");

  // Validate that both values exist
  if (!roomId || !encryptionKey) return null;

  return { roomId, encryptionKey };
}

/**
 * Creates a room hash string from parameters
 * @param roomId - The room identifier
 * @param encryptionKey - The encryption key
 * @returns Formatted hash string
 */
export function createRoomHash(roomId: string, encryptionKey: string): string {
  return `#room=${roomId},${encryptionKey}`;
}

/**
 * Sets the room parameters in the URL hash
 * @param roomId - The room identifier
 * @param encryptionKey - The encryption key
 * @param replace - Whether to replace current history entry (defaults to false)
 */
export function setRoomParamsInHash(
  roomId: string,
  encryptionKey: string,
  replace: boolean = false
): void {
  if (typeof window === "undefined") return;

  const hash = createRoomHash(roomId, encryptionKey);

  if (replace) {
    window.history.replaceState(null, "", hash);
  } else {
    window.location.hash = hash;
  }
}

/**
 * Checks if the current URL contains room parameters
 * @returns true if the current URL contains valid room parameters
 */
export function isInRoom(hash: string): boolean {
  return getRoomParamsFromHash(hash) !== null;
}

/**
 * Gets the full room URL with the current path and room parameters
 * @param basePath - The base URL path (e.g., BASE_URL)
 * @param currentPath - The current pathname
 * @returns The full room URL for sharing
 */
export function getRoomSharingUrl(
  basePath: string,
  currentPath: string,
  hash: string
): string {
  const params = getRoomParamsFromHash(hash);
  if (!params) return `${basePath}${currentPath}`;

  return `${basePath}${currentPath}${createRoomHash(params.roomId, params.encryptionKey)}`;
}
