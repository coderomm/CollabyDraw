import jwt from 'jsonwebtoken';
import { WebSocketServer, WebSocket } from 'ws';
import { JWT_SECRET, WS_DATA_TYPE } from '@repo/backend-common/config';

const wss = new WebSocketServer({ port: 8080 });

type User = {
    userId: string,
    ws: WebSocket,
    rooms: string[]
}

const users: User[] = [];

// interface JOIN {
//     type: WS_DATA_TYPE.JOIN;
//     roomId: string
// }
// interface LEAVE {
//     type: WS_DATA_TYPE.LEAVE,
//     roomId: string
// }
// interface CHAT {
//     type: WS_DATA_TYPE.CHAT,
//     message: string;
//     roomId: string
// }

function validateUser(token: string): null {
    try {
        if (!token) {
            return null;
        }
        const decoded = jwt.verify(token, JWT_SECRET || 'secret');

        if (typeof decoded === 'string') {
            return null;
        }
        if (!decoded || !decoded.userId) {
            return null;
        }
        return decoded.userId;
    }
    catch (error) {
        console.error("Error in jwt verification: ", error)
        return null;
    }
}

wss.on('connection', function connection(ws, req) {
    const url = req.url;
    if (!url) {
        return;
    }
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const userId = validateUser(queryParams.get('token') || "");
    if (userId === null) {
        console.error("UserId is null")
        return;
    }

    users.push({
        userId,
        ws,
        rooms: []
    })

    ws.on('error', console.error);

    ws.on('message', function message(data) {
        console.log('received: %s', data);
        const parsedData = JSON.parse(data as unknown as string);
        if (!parsedData || parsedData === null || parsedData === undefined) {
            console.error('Error in parsing ws data');
            return;
        }
        if (parsedData.type === WS_DATA_TYPE.JOIN) {
            const user = users.find(u => u.ws === ws)
            if (!user) return;
            user.rooms.push(parsedData.roomId);
        }
        if (parsedData.type === WS_DATA_TYPE.LEAVE) {
            const user = users.find(u => u.ws === ws)
            if (!user) return;
            user.rooms = user.rooms.filter(r => r !== parsedData.roomId);
        }
        if (parsedData.type === WS_DATA_TYPE.CHAT) {
            users.forEach(u => {
                if (u.rooms.includes(parsedData.roomId) && u.ws !== ws) {
                    u.ws.send(JSON.stringify({
                        type: "WS_DATA_TYPE.CHAT",
                        message: parsedData.message,
                        roomId: parsedData.roomId
                    }))
                }
            })
        }

    });

    ws.send('something');
});

wss.on('listening', () => {
    console.log('Server is running on port 8080');
});