import { v4 as uuidv4 } from "uuid";

export const getOrCreateSessionId = (): string => {
  const key = "__collab_session_id";
  if (typeof window === "undefined") {
    return uuidv4();
  }
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = uuidv4();
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
};
