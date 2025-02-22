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
        console.log("Invalid token payload:", decoded);
        callback(false, 401, "Invalid token");
        return;
      }
      info.req.user = {
        id: decoded.id,
        email: decoded.email,
      };
      callback(true);
    } catch (err) {
      console.log(
        "Direct JWT verification failed, trying NextAuth token format..."
      );
      callback(false, 401, "Unauthorized");
    }
  },
});

type User = {
  userId: string;
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
      console.log("parsedData = ", parsedData);
      switch (parsedData.type) {
        case WS_DATA_TYPE.JOIN:
          console.log(`User ${userId} joining room ${parsedData.roomId}`);
          user.rooms.push(parsedData.roomId);
          broadcastToRoom(
            parsedData.roomId,
            {
              type: WS_DATA_TYPE.USER_JOINED,
              userId: user.userId,
              roomId: parsedData.roomId,
            },
            [user.userId]
          );
          break;

        case WS_DATA_TYPE.LEAVE:
          console.log(`User ${userId} leaving room ${parsedData.roomId}`);
          user.rooms = user.rooms.filter((r) => r !== parsedData.roomId);
          broadcastToRoom(
            parsedData.roomId,
            {
              type: WS_DATA_TYPE.USER_LEFT,
              userId: user.userId,
              roomId: parsedData.roomId,
            },
            [user.userId]
          );
          break;

        case WS_DATA_TYPE.CHAT:
          if (!parsedData.message || !parsedData.roomId) break;
          await client.chat.create({
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
              userId: userId,
              roomId: parsedData.roomId,
              timestamp: new Date().toISOString(),
            },
            [userId]
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
