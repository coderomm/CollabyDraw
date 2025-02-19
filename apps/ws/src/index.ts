import client from '@repo/db/client';
import jwt from 'jsonwebtoken';
import { WebSocketServer, WebSocket } from 'ws';
import { WebSocketMessage, WS_DATA_TYPE } from '@repo/common/types'

const JWT_SECRET = 'your-secret-key';

const wss = new WebSocketServer({ port: 8080 });

type User = {
    userId: string,
    ws: WebSocket,
    rooms: string[]
}

const users: User[] = [];

function validateUser(token: string): null | string {
    try {
        if (!token) return null;
        console.log('ws JWT_SECRET = ', JWT_SECRET)
        const decoded = jwt.verify(token, JWT_SECRET);
        if (typeof decoded === 'string' || !decoded || !decoded.userId) return null;
        return decoded.userId;
    }
    catch (error) {
        console.error("Error in jwt verification: ", error)
        return null;
    }
}

wss.on('connection', function connection(ws, req) {
    const url = req.url;
    if (!url) return;
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const userId = validateUser(queryParams.get('token') || "");
    if (!userId) {
        console.error("Invalid user");
        ws.close();
        return;
    }

    const user: User = {
        userId,
        ws,
        rooms: []
    };
    users.push(user);

    ws.on('error', console.error);

    ws.on('message', async function message(data) {
        try {
            const parsedData: WebSocketMessage = JSON.parse(data.toString());
            if (!parsedData) {
                console.error('Error in parsing ws data');
                return;
            }
            switch (parsedData.type) {
                case WS_DATA_TYPE.JOIN:
                    user.rooms.push(parsedData.roomId);
                    broadcastToRoom(parsedData.roomId, {
                        type: WS_DATA_TYPE.USER_JOINED,
                        userId: user.userId,
                        roomId: parsedData.roomId
                    }, [user.userId]);
                    break;

                case WS_DATA_TYPE.LEAVE:
                    user.rooms = user.rooms.filter(r => r !== parsedData.roomId);
                    broadcastToRoom(parsedData.roomId, {
                        type: WS_DATA_TYPE.USER_LEFT,
                        userId: user.userId,
                        roomId: parsedData.roomId
                    }, [user.userId]);
                    break;

                case WS_DATA_TYPE.CHAT:
                    if (!parsedData.message || !parsedData.roomId) break;

                    await client.chat.create({
                        data: {
                            message: parsedData.message,
                            roomId: parseInt(parsedData.roomId),
                            userId: userId
                        }
                    });

                    broadcastToRoom(parsedData.roomId, {
                        type: WS_DATA_TYPE.CHAT,
                        message: parsedData.message,
                        userId: userId,
                        roomId: parsedData.roomId,
                        timestamp: new Date().toISOString()
                    }, [userId]);
                    break;
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        user.rooms.forEach(roomId => {
            broadcastToRoom(roomId, {
                type: WS_DATA_TYPE.USER_LEFT,
                userId: user.userId,
                roomId
            }, [user.userId]);
        });

        const index = users.findIndex(u => u.userId === userId);
        if (index !== -1) users.splice(index, 1);
    })
});

wss.on('listening', () => {
    console.log('Server is running on port 8080 and JWT_SECRET = ', JWT_SECRET);
});

function broadcastToRoom(roomId: string, message: WebSocketMessage, excludeUsers: string[] = []) {
    users.forEach(u => {
        if (u.rooms.includes(roomId) && !excludeUsers.includes(u.userId)) {
            u.ws.send(JSON.stringify(message));
        }
    });
}