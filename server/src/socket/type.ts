import { WebSocket } from "ws";

export interface UserWebSocket extends WebSocket {
  userId?: string;
  chatIds?: Set<string>;
  id: string;
}

export interface WebSocketMessage {
  type: string;
  data?: any;
}
