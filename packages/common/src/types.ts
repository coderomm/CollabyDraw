import z from "zod";

export const SignupSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long." })
    .trim(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." })
    .regex(/[a-zA-Z]/, { message: "Must contain at least one letter." })
    .regex(/[0-9]/, { message: "Must contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Must contain at least one special character.",
    })
    .trim(),
});

export const SigninSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." })
    .regex(/[a-zA-Z]/, { message: "Must contain at least one letter." })
    .regex(/[0-9]/, { message: "Must contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Must contain at least one special character.",
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

export type RoomParticipants = {
  userId: string;
  userName: string;
};

export enum WsDataType {
  JOIN = "JOIN",
  LEAVE = "LEAVE",
  USER_JOINED = "USER_JOINED",
  USER_LEFT = "USER_LEFT",
  DRAW = "DRAW",
  ERASER = "ERASER",
  UPDATE = "UPDATE",
  EXISTING_PARTICIPANTS = "EXISTING_PARTICIPANTS",
  CLOSE_ROOM = "CLOSE_ROOM",
  CONNECTION_READY = "CONNECTION_READY",
  EXISTING_SHAPES = "EXISTING_SHAPES",
  STREAM_SHAPE = "STREAM_SHAPE",
  STREAM_UPDATE = "STREAM_UPDATE",
  CURSOR_MOVE = "CURSOR_MOVE",
}

export interface WebSocketMessage {
  id: string | null;
  type: WsDataType;
  connectionId: string;
  roomId: string;
  userId: string;
  userName: string | null;
  message: string | null;
  participants: RoomParticipants[] | null;
  timestamp: string | null;
}

export interface WebSocketChatMessage {
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  type: WsDataType;
}

export interface Room {
  id: number;
  name: string;
}

export interface RecentRooms {
  id: number;
  name: string;
  visitedAt: string;
}

export const saltRounds = 10;
