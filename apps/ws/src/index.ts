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
    console.log("Authenticating user with token:", token);
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (typeof decoded == "string") {
      console.error("Decoded token is a string, expected object");
      return null;
    }
    if (!decoded.id) {
      console.error("No valid user ID in token");
      return null;
    }
    console.log("User authenticated successfully:", decoded.id);
    return decoded.id;
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}

interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
  userName: string;
}

const users: User[] = [];

wss.on("connection", function connection(ws, req) {
  console.log("New WebSocket connection attempt");
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

  console.log(`User ${userId} attempting to connect`);
  console.log("users1 = ", users);
  let comingUser = users.find((u) => u.userId === userId);
  if (comingUser) {
    comingUser.ws = ws;
    console.log(`Existing user ${userId} found, updating WebSocket connection`);
  } else {
    users.push({ userId, userName: userId, ws, rooms: [] });
    console.log(`New user ${userId} added`);
    console.log("users2 = ", users);
  }

  console.log(`User ${userId} connected successfully`);

  ws.on("error", (err) =>
    console.error(`WebSocket error for user ${userId}:`, err)
  );

  ws.on("message", async function message(data) {
    console.log(`Received message from ${userId}:`, data.toString());
    try {
      const parsedData: WebSocketMessage = JSON.parse(data.toString());
      if (!parsedData) {
        console.error("Error in parsing ws data");
        return;
      }
      console.log("Parsed message:", parsedData);

      const user = users.find((x) => x.userId === parsedData.userId);
      if (!user) {
        console.error("No user found");
        ws.close();
        return;
      }

      if (!parsedData.roomId) {
        console.error("No roomId provided for WS message");
        return;
      }

      if (!parsedData.userId) {
        console.error("No userId provided for WS message");
        return;
      }

      switch (parsedData.type) {
        case WS_DATA_TYPE.JOIN:
          console.log(`User ${userId} joining room ${parsedData.roomId}`);
          user.rooms.push(parsedData.roomId);
          
          const roomRespon = await client.room.findMany();
          console.log('roomRespon = ',roomRespon)

          const room = await client.room.findUnique({
            where: { id: Number(parsedData.roomId) },
          });

          if (!room) {
            console.log("No room found", room);
            ws.close();
            return;
          }

          if (parsedData.userName && user.userName === parsedData.userId) {
            user.userName = parsedData.userName;
          }

          console.log(`User ${userId} rooms after join:`, user.rooms);
          console.log("users after new user joined: ", users);
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
          console.log(
            `Room ${parsedData.roomId} participants:`,
            currentParticipants
          );
          ws.send(
            JSON.stringify({
              type: WS_DATA_TYPE.USER_JOINED,
              roomId: parsedData.roomId,
              roomName: parsedData.roomName,
              userId: user.userId,
              userName: parsedData.userName,
              participants: currentParticipants,
              timestamp: new Date().toISOString(),
            })
          );

          broadcastToRoom(
            parsedData.roomId,
            {
              type: WS_DATA_TYPE.USER_JOINED,
              roomId: parsedData.roomId,
              roomName: parsedData.roomName,
              userId: user.userId,
              userName: parsedData.userName,
              participants: currentParticipants,
              timestamp: new Date().toISOString(),
            },
            [user.userId],
            true
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
    const user = users.find((u) => u.userId === userId);
    if (user) {
      user.rooms.forEach((roomId) => {
        broadcastToRoom(
          roomId,
          {
            type: WS_DATA_TYPE.USER_LEFT,
            userId: user.userId,
            userName: user.userName,
            roomId,
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
