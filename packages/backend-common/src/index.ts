export const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const saltRounds = 10;

export enum WS_DATA_TYPE {
    JOIN = 'join_room',
    LEAVE = 'leave_room',
    CHAT = 'chat'
}