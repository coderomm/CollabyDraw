import dotenv from "dotenv";
dotenv.config();
import client from "@repo/db/client";
import {
  JWT_SECRET as JWT_SECRET_TYPE,
  WebSocketMessage,
  WS_DATA_TYPE,
} from "@repo/common/types";
import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || (JWT_SECRET_TYPE as string);

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
      return null;
    }
    if (!decoded.id) {
      console.error("No valid token found in verify");
      return null;
    }
    return decoded.id;
  } catch (err) {
    console.error("JWT verification failed.");
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
    console.error("No valid url found");
    return;
  }
  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token");
  if (!token || token === null) {
    console.error("No valid token found");
    return;
  }

  const userId = authUser(token);
  if (!userId) {
    console.error("Connection without valid user");
    ws.close(1008, "User not authenticated");
    return;
  }

  let user: User = {
    userId,
    userName: userId,
    ws,
    rooms: [],
  };

  const existingUserIndex = users.findIndex((u) => u.userId === userId);
  if (existingUserIndex !== -1) {
    const existingUser = users[existingUserIndex];
    if (!existingUser) {
      console.error("Error: Existing User not found.");
      return;
    }

    const existingRooms = [...existingUser.rooms];
    users.splice(existingUserIndex, 1);
    user = {
      userId,
      userName: existingUser.userName || userId,
      ws,
      rooms: existingRooms,
    };
  } else {
    user = {
      userId,
      userName: userId,
      ws,
      rooms: [],
    };
  }

  users.push(user);

  console.log(`User ${userId} connected`);

  ws.on("error", console.error);

  ws.on("message", async function message(data) {
    console.log("message data in ws = ", JSON.parse(data.toString()));
    try {
      const parsedData: WebSocketMessage = JSON.parse(data.toString());
      console.log("parsedData in ws = ", parsedData);
      if (!parsedData) {
        console.error("Error in parsing ws data");
        return;
      }

      if (parsedData.userName && user.userName === userId) {
        user.userName = parsedData.userName;
      }

      console.log(
        `Received ${parsedData.type} message from user ${userId} in room ${parsedData.roomId}`
      );

      switch (parsedData.type) {
        case WS_DATA_TYPE.JOIN:
          if (!parsedData.roomId) {
            console.error("No roomId provided for JOIN message");
            return;
          }

          if (!user.rooms.includes(parsedData.roomId)) {
            user.rooms.push(parsedData.roomId);
            console.log(
              `User ${userId} joined room ${parsedData.roomId}, now in rooms:`,
              user.rooms
            );
          }

          const uniqueParticipantsMap = new Map();
          users
            .filter((u) => u.rooms.includes(parsedData.roomId!))
            .forEach((u) =>
              uniqueParticipantsMap.set(u.userId, {
                userId: u.userId,
                userName: u.userName,
              })
            );

          const currentParticipants = Array.from(
            uniqueParticipantsMap.values()
          );
          console.log(
            `Room ${parsedData.roomId} participants:`,
            currentParticipants
          );
          ws.send(
            JSON.stringify({
              type: WS_DATA_TYPE.USER_JOINED,
              userId: user.userId,
              roomId: parsedData.roomId,
              userName: parsedData.userName,
              timestamp: new Date().toISOString(),
              participants: currentParticipants,
            })
          );

          console.log(`User ${userId} joining room ${parsedData.roomId}`);

          broadcastToRoom(
            parsedData.roomId,
            {
              type: WS_DATA_TYPE.USER_JOINED,
              userId: user.userId,
              roomId: parsedData.roomId,
              userName: parsedData.userName,
              timestamp: new Date().toISOString(),
              participants: currentParticipants,
            },
            [user.userId],
            false
          );
          break;

        case WS_DATA_TYPE.LEAVE:
          if (!parsedData.roomId) return;
          console.log(`User ${userId} leaving room ${parsedData.roomId}`);
          user.rooms = user.rooms.filter((r) => r !== parsedData.roomId);
          broadcastToRoom(
            parsedData.roomId,
            {
              type: WS_DATA_TYPE.USER_LEFT,
              userId: user.userId,
              userName: user.userName,
              roomId: parsedData.roomId,
            },
            [user.userId],
            true
          );
          break;

        case WS_DATA_TYPE.DRAW:
        case WS_DATA_TYPE.ERASER:
          if (!parsedData.roomId || !parsedData.message) {
            console.error(`Missing roomId or data for ${parsedData.type}`);
            return;
          }

          try {
            await client.shape.create({
              data: {
                message: parsedData.message,
                roomId: Number(parsedData.roomId),
                userId: userId,
              },
            });
          } catch (err) {
            console.error(
              `Error saving ${parsedData.type} data to database:`,
              err
            );
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
            },
            [userId]
          );
          break;

        case WS_DATA_TYPE.UPDATE:
          if (!parsedData.roomId || !parsedData.message || !parsedData.id) {
            console.error(
              `Missing shape Id or roomId or data for ${parsedData.type}`
            );
            return;
          }

          try {
            await client.shape.update({
              where: {
                id: parsedData.id,
                roomId: Number(parsedData.roomId),
              },
              data: {
                message: parsedData.message,
              },
            });
          } catch (err) {
            console.error(
              `Error saving ${parsedData.type} data to database:`,
              err
            );
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
            },
            []
          );
          break;

        default:
          console.warn(`Unknown message type: ${parsedData.type}`);
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  ws.on("close", () => {
    console.log(`User ${userId} disconnected`);
    user.rooms.forEach((roomId) => {
      broadcastToRoom(
        roomId,
        {
          type: WS_DATA_TYPE.USER_LEFT,
          userId: user.userId,
          roomId,
        },
        [user.userId]
      );
    });

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
    message.type === WS_DATA_TYPE.USER_JOINED
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
    console.log(
      `Broadcasting participants to room ${roomId}:`,
      currentParticipants
    );
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
  console.log("WebSocket server started on port 8080");
});
