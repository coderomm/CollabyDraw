import dotenv from "dotenv";
dotenv.config();
import client from "@repo/db/client";
import { WebSocketMessage, WsDataType } from "@repo/common/types";
import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is ABSOLUTELY REQUIRED and not set");
}

const JWT_SECRET = process.env.JWT_SECRET;

declare module "http" {
  interface IncomingMessage {
    user: {
      id: string;
      email: string;
    };
  }
}

const wss = new WebSocketServer({ port: Number(process.env.PORT) || 8080 });

function authUser(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (typeof decoded == "string") {
      console.error("Decoded token is a string, expected object");
      return null;
    }
    if (!decoded.id) {
      console.error("No valid user ID in token");
      return null;
    }
    return decoded.id;
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}

type User = {
  userId: string;
  userName: string;
  ws: WebSocket;
  rooms: string[];
};

const users: User[] = [];

wss.on("connection", function connection(ws, req) {
  const url = req.url;
  if (!url) {
    console.error("No valid URL found in request");
    return;
  }
  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token");
  if (!token || token === null) {
    console.error("No valid token found in query params");
    ws.close(1008, "User not authenticated");
    return;
  }
  const userId = authUser(token);
  if (!userId) {
    console.error("Connection rejected: invalid user");
    ws.close(1008, "User not authenticated");
    return;
  }

  const existingIndex = users.findIndex((u) => u.userId === userId);
  if (existingIndex !== -1) {
    users.splice(existingIndex, 1);
  }

  const newUser: User = {
    userId,
    userName: userId,
    ws,
    rooms: [],
  };
  users.push(newUser);

  ws.on("error", (err) =>
    console.error(`WebSocket error for user ${userId}:`, err)
  );

  ws.on("open", () => {
    ws.send(JSON.stringify({ type: WsDataType.CONNECTION_READY }));
  });

  ws.on("message", async function message(data) {
    try {
      const parsedData: WebSocketMessage = JSON.parse(data.toString());
      if (!parsedData) {
        console.error("Error in parsing ws data");
        return;
      }

      const user = users.find((x) => x.userId === parsedData.userId);
      if (!user) {
        console.error("No user found");
        ws.close();
        return;
      }

      if (!parsedData.roomId || !parsedData.userId) {
        console.error("No userId or roomId provided for WS message");
        return;
      }

      if (parsedData.userName && user.userName === userId) {
        user.userName = parsedData.userName;
      }

      switch (parsedData.type) {
        case WsDataType.JOIN:
          const roomCheckResponse = await client.room.findUnique({
            where: { id: parsedData.roomId },
          });

          if (!roomCheckResponse) {
            ws.close();
            return;
          }

          user.rooms.push(parsedData.roomId);

          const uniqueParticipantsMap = new Map();
          users
            .filter((u) => u.rooms.includes(parsedData.roomId))
            .forEach((u) =>
              uniqueParticipantsMap.set(u.userId, {
                userId: u.userId,
                userName: u.userName,
              })
            );

          const currentParticipants = Array.from(
            uniqueParticipantsMap.values()
          );

          ws.send(
            JSON.stringify({
              type: WsDataType.USER_JOINED,
              roomId: parsedData.roomId,
              userId: user.userId,
              userName: parsedData.userName,
              participants: currentParticipants,
              timestamp: new Date().toISOString(),
            })
          );

          broadcastToRoom(
            parsedData.roomId,
            {
              type: WsDataType.USER_JOINED,
              roomId: parsedData.roomId,
              userId: user.userId,
              userName: parsedData.userName,
              participants: currentParticipants,
              timestamp: new Date().toISOString(),
              id: null,
              message: null,
            },
            [user.userId],
            true
          );
          break;

        case WsDataType.LEAVE:
          user.rooms = user.rooms.filter((r) => r !== parsedData.roomId);
          broadcastToRoom(
            parsedData.roomId,
            {
              type: WsDataType.USER_LEFT,
              userId: user.userId,
              userName: user.userName,
              roomId: parsedData.roomId,
              id: null,
              message: null,
              participants: null,
              timestamp: new Date().toISOString(),
            },
            [user.userId],
            true
          );
          break;

        case WsDataType.CLOSE_ROOM: {
          const usersInRoom = users.filter((u) =>
            u.rooms.includes(parsedData.roomId)
          );

          if (
            usersInRoom.length === 1 &&
            usersInRoom[0] &&
            usersInRoom[0].userId === userId
          ) {
            try {
              ws.send(
                JSON.stringify({
                  type: "ROOM_CLOSED",
                  roomId: parsedData.roomId,
                  timestamp: new Date().toISOString(),
                })
              );

              ws.close(1000, "Room deleted");
            } catch (err) {
              console.error("Error deleting room and shapes:", err);
            }
          }
          break;
        }

        case WsDataType.DRAW:
          if (!parsedData.message || !parsedData.id) {
            console.error(
              `Missing shape Id or shape message data for ${parsedData.type}`
            );
            return;
          }

          broadcastToRoom(
            parsedData.roomId,
            {
              type: parsedData.type,
              message: parsedData.message,
              roomId: parsedData.roomId,
              userId: userId,
              userName: user.userName,
              timestamp: new Date().toISOString(),
              id: null,
              participants: null,
            },
            [],
            false
          );
          break;

        case WsDataType.UPDATE:
          if (!parsedData.message || !parsedData.id) {
            console.error(
              `Missing shape Id or shape message data for ${parsedData.type}`
            );
            return;
          }

          broadcastToRoom(
            parsedData.roomId,
            {
              type: parsedData.type,
              id: parsedData.id,
              message: parsedData.message,
              roomId: parsedData.roomId,
              userId: userId,
              userName: user.userName,
              participants: null,
              timestamp: new Date().toISOString(),
            },
            [],
            false
          );
          break;

        case WsDataType.ERASER:
          if (!parsedData.id) {
            console.error(`Missing shape Id for ${parsedData.type}`);
            return;
          }

          broadcastToRoom(
            parsedData.roomId,
            {
              id: parsedData.id,
              type: parsedData.type,
              roomId: parsedData.roomId,
              userId: userId,
              userName: user.userName,
              timestamp: new Date().toISOString(),
              message: null,
              participants: null,
            },
            [],
            false
          );
          break;

        default:
          console.warn(
            `Unknown message type received from user ${userId}:`,
            parsedData.type
          );
          break;
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  ws.on("close", (code, reason) => {
    const user = users.find((u) => u.userId === userId);
    if (user) {
      user.rooms.forEach((roomId) => {
        broadcastToRoom(
          roomId,
          {
            type: WsDataType.USER_LEFT,
            userId: user.userId,
            userName: user.userName,
            roomId,
            id: null,
            message: null,
            participants: null,
            timestamp: Date.now().toString(),
          },
          [user.userId]
        );
      });
    }

    const index = users.findIndex((u) => u.userId === userId);
    if (index !== -1) users.splice(index, 1);
  });
});

function broadcastToRoom(
  roomId: string,
  message: WebSocketMessage,
  excludeUsers: string[] = [],
  includeParticipants: boolean = false
) {
  if (
    (includeParticipants && !message.participants) ||
    message.type === WsDataType.USER_JOINED
  ) {
    const uniqueParticipantsMap = new Map();
    users
      .filter((u) => u.rooms.includes(roomId))
      .forEach((u) =>
        uniqueParticipantsMap.set(u.userId, {
          userId: u.userId,
          userName: u.userName,
        })
      );

    const currentParticipants = Array.from(uniqueParticipantsMap.values());
    message.participants = currentParticipants;
  }
  users.forEach((u) => {
    if (u.rooms.includes(roomId) && !excludeUsers.includes(u.userId)) {
      try {
        if (u.ws.readyState === WebSocket.OPEN) {
          u.ws.send(JSON.stringify(message));
        }
      } catch (err) {
        console.error(`Error sending message to user ${u.userId}:`, err);
      }
    }
  });
}

wss.on("listening", () => {
  console.log(`WebSocket server started on port ${process.env.PORT || 8080}`);
});
