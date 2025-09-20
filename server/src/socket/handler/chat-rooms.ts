import WebSocketServer, { UserWebSocket } from "../socket";
import { sendMessage } from "../utils/utils";


interface JoinchatData {
    chatId: string;
    userId: string;
    userName?: string;
}

interface LeavechatData {
    chatId: string;
    userId?: string;
}

export const handleChatRooms = async (
    ws: UserWebSocket,
    type: string,
    data: JoinchatData | LeavechatData,
    server: WebSocketServer
) => {
    switch (type) {
        case "join_chat":
            await joinchat(ws, data as JoinchatData, server);
            break;
        case "leave_chat":
            leavechat(ws, data as LeavechatData, server);
            break;
    }
};

const joinchat = async (
    ws: UserWebSocket,
    data: JoinchatData,
    server: WebSocketServer
) => {
    try {
        if (!data.userId) {
            sendMessage(ws, {
                type: "error",
                data: { message: "User ID required" },
            });
            return;
        }

        if (!ws.userId) {
            ws.userId = data.userId;
            ws.chatIds = new Set();
            server.connectedUsers.set(data.userId, ws);
        }

        ws.chatIds?.add(data.chatId);
        if (!server.chatRooms.has(data.chatId)) {
            server.chatRooms.set(data.chatId, new Set());
        }
        server.chatRooms.get(data.chatId)?.add(ws.userId);
        console.log(`User joined chat: ${data.chatId}`);
        sendMessage(ws, { type: "joined_chat", data: { chatId: data.chatId } });
    } catch (error) {
        console.error("Error joining chat room:", error);
        sendMessage(ws, {
            type: "error",
            data: { message: "Failed to join chat room" },
        });
    }
};

const leavechat = (
    ws: UserWebSocket,
    data: LeavechatData,
    server: WebSocketServer
) => {
    if (ws.userId) {
        ws.chatIds?.delete(data.chatId);
        server.chatRooms.get(data.chatId)?.delete(ws.userId);
        console.log(`User left chat: ${data.chatId}`);
        sendMessage(ws, { type: "left_chat", data: { chatId: data.chatId } });
    }
};
