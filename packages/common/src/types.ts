import z from "zod";

export const SignupSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long." })
    .trim(),
  password: z
    .string()
    .min(6, { message: "Be at least 6 characters long" })
    .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
    .regex(/[0-9]/, { message: "Contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Contain at least one special character.",
    })
    .trim(),
});

export const SigninSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  password: z
    .string()
    .min(6, { message: "Be at least 6 characters long" })
    .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
    .regex(/[0-9]/, { message: "Contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Contain at least one special character.",
    })
    .trim(),
});

export const JoinRoomSchema = z.object({
  roomName: z.string().trim().min(3, "Room name must be at least 3 characters"),
});

export const CreateRoomSchema = z.object({
  roomName: z.string().trim().min(3, "Room name must be at least 3 characters"),
});

export const GetChatsSchema = z.object({
  roomName: z.string().trim().min(3, "Room name must be at least 3 characters"),
});

export const GetRoomBySlug = z.object({
  slug: z.string(),
});

export enum WS_DATA_TYPE {
  JOIN = "JOIN",
  LEAVE = "LEAVE",
  USER_JOINED = "USER_JOINED",
  USER_LEFT = "USER_LEFT",
  DRAW = "DRAW",
  ERASER = "ERASER",
  UPDATE = "UPDATE",
  EXISTING_PARTICIPANTS = "EXISTING_PARTICIPANTS",
  CLOSE_ROOM = "CLOSE_ROOM",
}

export type WebSocketMessage = {
  id?: string;
  type: WS_DATA_TYPE;
  roomId: string;
  roomName?: string;
  userId: string;
  userName?: string;
  message?: string;
  participants?: any[];
  timestamp?: string;
};

export type RoomParticipants = {
  userId: string;
  userName: string;
};

export type WebSocketChatMessage = {
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  type: WS_DATA_TYPE;
};

export interface Room {
  id: number;
  name: string;
}

export interface RecentRooms {
  id: number;
  name: string;
  visitedAt: string;
}

export const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
