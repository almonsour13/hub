import type { Server as HTTPServer } from "http";
import { WebSocketServer as WSServer, WebSocket } from "ws";
import type { IncomingMessage } from "http";
import { handleAuthenticate } from "./handler/authenticate";
import { generateSocketId, sendMessage } from "./utils/utils";
import { handleChatRooms } from "./handler/chat-rooms";
import ChatMessage from "./handler/chat-message";

export interface UserWebSocket extends WebSocket {
    userId?: string;
    chatIds?: Set<string>;
    id: string;
}

export interface WebSocketMessage {
    type: string;
    data?: any;
}
class WebSocketServer {
    public wss: WSServer;
    public connectedUsers: Map<string, UserWebSocket> = new Map();
    public chatRooms: Map<string, Set<string>> = new Map();
    public socketConnections: Map<string, UserWebSocket> = new Map();

    private chatHandler: ChatMessage;

    constructor(httpServer: HTTPServer) {
        this.wss = new WSServer({
            server: httpServer,
        });

        this.chatHandler = new ChatMessage(this);
        this.setupEventHandlers();
    }
    private setupEventHandlers(): void {
        this.wss.on(
            "connection",
            (ws: UserWebSocket, request: IncomingMessage) => {
                // Generate unique socket ID
                ws.id = generateSocketId();
                this.socketConnections.set(ws.id, ws);

                // console.log(`Client connected: ${ws.id}`);

                // Handle incoming messages
                ws.on("message", async (data: Buffer) => {
                    try {
                        const message: WebSocketMessage = JSON.parse(
                            data.toString()
                        );
                        await this.handleMessage(ws, message);
                    } catch (error) {
                        console.error("Error parsing message:", error);
                        sendMessage(ws, {
                            type: "error",
                            data: { message: "Invalid message format" },
                        });
                    }
                });

                // Handle disconnection
                ws.on("close", () => {
                    if (ws.userId) {
                        console.log(`User ${ws.userId} disconnected`);
                        this.connectedUsers.delete(ws.userId);

                        // Remove from hub rooms
                        ws.chatIds?.forEach((chatId) => {
                            this.chatRooms.get(chatId)?.delete(ws.userId!);
                        });
                    }
                    this.socketConnections.delete(ws.id);
                });

                // Handle errors
                ws.on("error", (error) => {
                    console.error("WebSocket error:", error);
                });
            }
        );
    }
    private async handleMessage(
        ws: UserWebSocket,
        message: WebSocketMessage
    ): Promise<void> {
        console.log(`Handling message type: ${message.type} from ${ws.id}`);

        switch (message.type) {
            case "authenticate":
                await handleAuthenticate(ws, message.data, this);
                break;
            case "join_chat":
            case "leave_chat":
                await handleChatRooms(ws, message.type, message.data, this);
                break;
            case "chat-activity":
                // Route all chat activity to the ChatMessage class
                await this.chatHandler.handleActivity(ws, message.data);
                break;
            default:
                sendMessage(ws, {
                    type: "error",
                    data: { message: "Unknown message type" },
                });
        }
    }
}

export default WebSocketServer;
