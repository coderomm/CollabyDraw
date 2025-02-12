import jwt, { JwtPayload } from 'jsonwebtoken';
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws, req) {
    const url = req.url;
    if (!url) {
        return;
    }
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token');
    if (!token) {
        ws.close();
        return;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    if (!decoded || !(decoded as JwtPayload).userId) {
        ws.close();
        return;
    }

    ws.on('error', console.error);

    ws.on('message', function message(data) {
        console.log('received: %s', data);
    });

    ws.send('something');
});

wss.on('listening', () => {
    console.log('Server is running on port 8080');
});