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

type Connection = {
  connectionId: string;
  userId: string;
  userName: string;
  ws: WebSocket;
  rooms: string[];
};

const connections: Connection[] = [];
const roomShapes: Record<string, WebSocketMessage[]> = {};

function generateConnectionId(): string {
  return `conn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

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

  const connectionId = generateConnectionId();
  const newConnection: Connection = {
    connectionId,
    userId,
    userName: userId,
    ws,
    rooms: [],
  };
  connections.push(newConnection);

  ws.send(
    JSON.stringify({
      type: WsDataType.CONNECTION_READY,
      connectionId,
    })
  );
  console.log("✅ Sent CONNECTION_READY to:", connectionId);

  ws.on("error", (err) =>
    console.error(`WebSocket error for user ${userId}:`, err)
  );

  ws.on("message", async function message(data) {
    try {
      const parsedData: WebSocketMessage = JSON.parse(data.toString());
      if (!parsedData) {
        console.error("Error in parsing ws data");
        return;
      }

      if (!parsedData.roomId || !parsedData.userId) {
        console.error("No userId or roomId provided for WS message");
        return;
      }

      const connection = connections.find(
        (x) => x.connectionId === connectionId
      );
      if (!connection) {
        console.error("No connection found");
        ws.close();
        return;
      }

      if (parsedData.userName && connection.userName === userId) {
        // Update username for this connection
        connection.userName = parsedData.userName;

        // Sync username across all connections for this user
        connections
          .filter((conn) => conn.userId === userId)
          .forEach((conn) => {
            conn.userName = parsedData.userName ?? parsedData.userId;
          });
      }

      switch (parsedData.type) {
        case WsDataType.JOIN:
          {
            const roomCheckResponse = await client.room.findUnique({
              where: { id: parsedData.roomId },
            });

            if (!roomCheckResponse) {
              ws.close();
              return;
            }

            if (!connection.rooms.includes(parsedData.roomId)) {
              connection.rooms.push(parsedData.roomId);
            }

            const participants = getCurrentParticipants(parsedData.roomId);

            if (!roomShapes[parsedData.roomId]) {
              roomShapes[parsedData.roomId] = [];
            }

            ws.send(
              JSON.stringify({
                type: WsDataType.USER_JOINED,
                roomId: parsedData.roomId,
                userId: connection.userId,
                userName: connection.userName,
                connectionId: connection.connectionId,
                participants,
                timestamp: new Date().toISOString(),
              })
            );

            const shapes = roomShapes[parsedData.roomId] || [];

            if (shapes && shapes.length > 0) {
              ws.send(
                JSON.stringify({
                  type: WsDataType.EXISTING_SHAPES,
                  roomId: parsedData.roomId,
                  message: shapes,
                  timestamp: new Date().toISOString(),
                })
              );
            }

            // Don't broadcast JOIN to the user's other tabs if this is a duplicate tab
            const isFirstTabInRoom = connections
              .filter(
                (conn) =>
                  conn.userId === connection.userId &&
                  conn.connectionId !== connection.connectionId
              )
              .every((conn) => !conn.rooms.includes(parsedData.roomId));

            if (isFirstTabInRoom) {
              broadcastToRoom(
                parsedData.roomId,
                {
                  type: WsDataType.USER_JOINED,
                  roomId: parsedData.roomId,
                  userId: connection.userId,
                  userName: connection.userName,
                  connectionId: connection.connectionId,
                  participants,
                  timestamp: new Date().toISOString(),
                  id: null,
                  message: null,
                },
                [connection.connectionId],
                true
              );
            }
          }
          break;

        case WsDataType.LEAVE:
          connection.rooms = connection.rooms.filter(
            (r) => r !== parsedData.roomId
          );

          const userHasOtherTabsInRoom = connections.some(
            (conn) =>
              conn.userId === connection.userId &&
              conn.connectionId !== connection.connectionId &&
              conn.rooms.includes(parsedData.roomId)
          );

          if (!userHasOtherTabsInRoom) {
            broadcastToRoom(
              parsedData.roomId,
              {
                type: WsDataType.USER_LEFT,
                userId: connection.userId,
                userName: connection.userName,
                connectionId: connection.connectionId,
                roomId: parsedData.roomId,
                id: null,
                message: null,
                participants: null,
                timestamp: new Date().toISOString(),
              },
              [connection.connectionId],
              true
            );
          }

          const anyConnectionsInRoom = connections.some((conn) =>
            conn.rooms.includes(parsedData.roomId)
          );

          if (!anyConnectionsInRoom) {
            try {
              await client.room.delete({
                where: { id: parsedData.roomId },
              });
              delete roomShapes[parsedData.roomId];
              console.log(`Deleted empty room ${parsedData.roomId}`);
            } catch (err) {
              console.error(`Failed to delete room ${parsedData.roomId}`, err);
            }
          }
          break;

        case WsDataType.CLOSE_ROOM: {
          const connectionsInRoom = connections.filter((conn) =>
            conn.rooms.includes(parsedData.roomId)
          );

          if (
            connectionsInRoom.length === 1 &&
            connectionsInRoom[0] &&
            connectionsInRoom[0].connectionId === connectionId
          ) {
            try {
              await client.room.delete({
                where: { id: parsedData.roomId },
              });

              delete roomShapes[parsedData.roomId];

              connectionsInRoom.forEach((conn) => {
                if (conn.ws.readyState === WebSocket.OPEN) {
                  conn.ws.send(
                    JSON.stringify({
                      type: "ROOM_CLOSED",
                      roomId: parsedData.roomId,
                      timestamp: new Date().toISOString(),
                    })
                  );
                }

                conn.rooms = conn.rooms.filter((r) => r !== parsedData.roomId);
              });

              console.log(
                `Room ${parsedData.roomId} closed by connection ${connectionId}`
              );
            } catch (err) {
              console.error("Error deleting room:", err);
            }
          }
        }

        case WsDataType.CURSOR_MOVE:
          if (
            parsedData.roomId &&
            parsedData.userId &&
            parsedData.connectionId &&
            parsedData.message
          ) {
            broadcastToRoom(
              parsedData.roomId,
              {
                type: parsedData.type,
                roomId: parsedData.roomId,
                userId: connection.userId,
                userName: connection.userName,
                connectionId: connection.connectionId,
                message: parsedData.message,
                timestamp: new Date().toISOString(),
                id: null,
                participants: null,
              },
              [parsedData.connectionId],
              false
            );
          }
          break;

        case WsDataType.STREAM_SHAPE:
          broadcastToRoom(
            parsedData.roomId,
            {
              type: parsedData.type,
              id: parsedData.id,
              message: parsedData.message,
              roomId: parsedData.roomId,
              userId: connection.userId,
              userName: connection.userName,
              connectionId: connection.connectionId,
              timestamp: new Date().toISOString(),
              participants: null,
            },
            [connection.connectionId],
            false
          );
          break;

        case WsDataType.STREAM_UPDATE:
          broadcastToRoom(
            parsedData.roomId,
            {
              type: parsedData.type,
              id: parsedData.id,
              message: parsedData.message,
              roomId: parsedData.roomId,
              userId: connection.userId,
              userName: connection.userName,
              connectionId: connection.connectionId,
              timestamp: new Date().toISOString(),
              participants: null,
            },
            [connection.connectionId],
            false
          );
          break;

        case WsDataType.DRAW: {
          if (!parsedData.message || !parsedData.id || !parsedData.roomId) {
            console.error(
              `Missing shape Id or shape message data for ${parsedData.type}`
            );
            return;
          }

          if (!roomShapes[parsedData.roomId]) {
            roomShapes[parsedData.roomId] = [];
          }
          const shapes = (roomShapes[parsedData.roomId] ||= []);
          const shapeIndex = shapes.findIndex((s) => s.id === parsedData.id);

          if (shapeIndex !== -1) {
            shapes[shapeIndex] = parsedData;
          } else {
            shapes.push(parsedData);
          }

          broadcastToRoom(
            parsedData.roomId,
            {
              type: parsedData.type,
              message: parsedData.message,
              roomId: parsedData.roomId,
              userId: connection.userId,
              userName: connection.userName,
              connectionId: connection.connectionId,
              timestamp: new Date().toISOString(),
              id: parsedData.id,
              participants: null,
            },
            [],
            false
          );
          break;
        }
        case WsDataType.UPDATE: {
          if (!parsedData.message || !parsedData.id || !parsedData.roomId) {
            console.error(
              `Missing shape Id or shape message data for ${parsedData.type}`
            );
            return;
          }

          const shapes = (roomShapes[parsedData.roomId] ||= []);
          const shapeIndex = shapes.findIndex((s) => s.id === parsedData.id);

          if (shapeIndex !== -1) {
            shapes[shapeIndex] = parsedData;
          } else {
            shapes.push(parsedData);
          }

          broadcastToRoom(
            parsedData.roomId,
            {
              type: parsedData.type,
              id: parsedData.id,
              message: parsedData.message,
              roomId: parsedData.roomId,
              userId: connection.userId,
              userName: connection.userName,
              connectionId: connection.connectionId,
              participants: null,
              timestamp: new Date().toISOString(),
            },
            [],
            false
          );
          break;
        }
        case WsDataType.ERASER:
          if (!parsedData.id) {
            console.error(`Missing shape Id for ${parsedData.type}`);
            return;
          }

          const shapes = (roomShapes[parsedData.roomId] ||= []);
          roomShapes[parsedData.roomId] = shapes.filter(
            (s) => s.id !== parsedData.id
          );

          broadcastToRoom(
            parsedData.roomId,
            {
              id: parsedData.id,
              type: parsedData.type,
              roomId: parsedData.roomId,
              userId: connection.userId,
              userName: connection.userName,
              connectionId: connection.connectionId,
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
            `Unknown message type received from connection ${connectionId}:`,
            parsedData.type
          );
          break;
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  ws.on("close", (code, reason) => {
    const connection = connections.find(
      (conn) => conn.connectionId === connectionId
    );
    if (connection) {
      // For each room this connection was in
      connection.rooms.forEach((roomId) => {
        // Check if this was the last connection from this user in the room
        const userHasOtherConnectionsInRoom = connections.some(
          (conn) =>
            conn.userId === connection.userId &&
            conn.connectionId !== connectionId &&
            conn.rooms.includes(roomId)
        );

        // Only broadcast USER_LEFT if this was the last connection for this user
        if (!userHasOtherConnectionsInRoom) {
          broadcastToRoom(
            roomId,
            {
              type: WsDataType.USER_LEFT,
              userId: connection.userId,
              userName: connection.userName,
              connectionId: connection.connectionId,
              roomId,
              id: null,
              message: null,
              participants: null,
              timestamp: new Date().toISOString(),
            },
            [connectionId],
            true
          );
        }

        // Check if the room is now empty
        const roomIsEmpty = !connections.some(
          (conn) =>
            conn.connectionId !== connectionId && conn.rooms.includes(roomId)
        );

        // Delete empty rooms
        if (roomIsEmpty) {
          client.room
            .delete({
              where: { id: roomId },
            })
            .then(() => {
              delete roomShapes[roomId];
              console.log(
                `Deleted empty room ${roomId} after last connection left`
              );
            })
            .catch((err) => {
              console.error(`Failed to delete empty room ${roomId}:`, err);
            });
        }
      });
    }

    // Remove the connection from our connections array
    const index = connections.findIndex(
      (conn) => conn.connectionId === connectionId
    );
    if (index !== -1) {
      connections.splice(index, 1);
      console.log(`Connection ${connectionId} closed and removed`);
    }
  });
});

function broadcastToRoom(
  roomId: string,
  message: WebSocketMessage,
  excludeConnectionIds: string[] = [],
  includeParticipants: boolean = false
) {
  if (
    (includeParticipants && !message.participants) ||
    message.type === WsDataType.USER_JOINED
  ) {
    message.participants = getCurrentParticipants(roomId);
  }

  connections.forEach((conn) => {
    if (
      conn.rooms.includes(roomId) &&
      !excludeConnectionIds.includes(conn.connectionId)
    ) {
      try {
        if (conn.ws.readyState === WebSocket.OPEN) {
          conn.ws.send(JSON.stringify(message));
        }
      } catch (err) {
        console.error(
          `Error sending message to connection ${conn.connectionId}:`,
          err
        );
      }
    }
  });
}

function getCurrentParticipants(roomId: string) {
  const map = new Map();
  connections
    .filter((conn) => conn.rooms.includes(roomId))
    .forEach((conn) =>
      map.set(conn.userId, { userId: conn.userId, userName: conn.userName })
    );
  return Array.from(map.values());
}

wss.on("listening", () => {
  console.log(`WebSocket server started on port ${process.env.PORT || 8080}`);
});
