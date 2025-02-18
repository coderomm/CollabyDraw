export enum WebSocketEvent {
    JOIN_ROOM = 'JOIN_ROOM',
    LEAVE_ROOM = 'LEAVE_ROOM',
    MESSAGE = 'MESSAGE',
    USER_JOINED = 'USER_JOINED',
    USER_LEFT = 'USER_LEFT',
  }
  
  export type WebSocketMessage = {
    event: WebSocketEvent;
    payload: any;
  };