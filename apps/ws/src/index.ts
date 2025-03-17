import client from "@repo/db/client";
import { JWT_SECRET, WebSocketMessage, WS_DATA_TYPE } from "@repo/common/types";
import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import http from "http";
const cookie = require("cookie");

declare module "http" {
  interface IncomingMessage {
    user: {
      id: string;
      email: string;
    };
  }
}

const server = http.createServer();
const wss = new WebSocketServer({
  server,
  verifyClient: (info, callback) => {
    const cookies = cookie.parse(info.req.headers.cookie || "");
    const sessionToken = cookies["accessToken"];
    if (!sessionToken) {
      console.error("No session token found");
      callback(false, 401, "Unauthorized");
      return;
    }
    try {
      const decoded = jwt.verify(sessionToken, JWT_SECRET) as JwtPayload;
      if (!decoded || !decoded.id) {
        console.error("Invalid token payload:", decoded);
        callback(false, 401, "Invalid token");
        return;
      }
      info.req.user = {
        id: decoded.id,
        email: decoded.email,
      };
      callback(true);
    } catch (err) {
      console.error(
        "Direct JWT verification failed, trying NextAuth token format..."
      );
      callback(false, 401, "Unauthorized");
    }
  },
});

type User = {
  userId: string;
  userName: string;
  ws: WebSocket;
  rooms: string[];
};

const users: User[] = [];

wss.on("connection", function connection(ws, req) {
  if (!req.user || !req.user.id) {
    console.error("Connection without valid user");
    ws.close(1008, "User not authenticated");
    return;
  }

  const userId = req.user.id;
  const user: User = {
    userId,
    userName: userId,
    ws,
    rooms: [],
  };
  users.push(user);

  console.log(`User ${userId} connected`);

  ws.on("error", console.error);

  ws.on("message", async function message(data) {
    try {
      const parsedData: WebSocketMessage = JSON.parse(data.toString());
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
          console.log(`User ${userId} joining room ${parsedData.roomId}`);
          user.rooms.push(parsedData.roomId);
          broadcastToRoom(
            parsedData.roomId,
            {
              type: WS_DATA_TYPE.USER_JOINED,
              userId: user.userId,
              roomId: parsedData.roomId,
              userName: parsedData.userName,
              timestamp: new Date().toISOString(),
            },
            []
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
            [user.userId]
          );
          break;

        case WS_DATA_TYPE.CHAT:
          if (!parsedData.message || !parsedData.roomId) {
            console.error("Missing message or roomId for CHAT");
            return;
          }
          await client.shape.create({
            data: {
              message: parsedData.message,
              roomId: Number(parsedData.roomId),
              userId: userId,
            },
          });
          console.log(
            `Chat from ${userId} in room ${parsedData.roomId}: ${parsedData.message.substring(0, 50)}${parsedData.message.length > 50 ? "..." : ""}`
          );
          broadcastToRoom(
            parsedData.roomId,
            {
              type: WS_DATA_TYPE.CHAT,
              message: parsedData.message,
              roomId: parsedData.roomId,
              userId: userId,
              userName: parsedData.userName,
              timestamp: new Date().toISOString(),
            },
            [userId]
          );
          break;

        case WS_DATA_TYPE.DRAW:
        case WS_DATA_TYPE.ERASER:
          if (!parsedData.roomId || !parsedData.message) {
            console.error(`Missing roomId or data for ${parsedData.type}`);
            return;
          }

          // Save drawing data to database
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

          // Broadcast to room
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
            [userId] // Include sender so they get confirmation
          );
          break;

        case WS_DATA_TYPE.UPDATE:
          if (!parsedData.roomId || !parsedData.message || !parsedData.id) {
            console.error(
              `Missing shape Id or roomId or data for ${parsedData.type}`
            );
            return;
          }

          // Save drawing data to database
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

          // Broadcast to room
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
            [] // Include sender so they get confirmation
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
  excludeUsers: string[] = []
) {
  users.forEach((u) => {
    if (u.rooms.includes(roomId) && !excludeUsers.includes(u.userId)) {
      u.ws.send(JSON.stringify(message));
    }
  });
}

server.listen(8080, () => {
  console.log("HTTP/WebSocket server started on port 8080");
});
