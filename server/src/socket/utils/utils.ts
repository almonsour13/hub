import { UserWebSocket, WebSocketMessage } from "../type";

export const generateSocketId = (): string =>
  Math.random().toString(36).substring(2) + Date.now().toString(36);

export const sendMessage = (ws: UserWebSocket, message: WebSocketMessage) => {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(message));
  }
};
