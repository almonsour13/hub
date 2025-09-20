// handler/authenticate.ts
import { prisma } from "../../lib/prisma";
import WebSocketServer from "../socket";
import { UserWebSocket } from "../socket"; // Fixed import path
import { sendMessage } from "../utils/utils";

export const handleAuthenticate = async (
    ws: UserWebSocket,
    data: { userId: string; token?: string },
    server: WebSocketServer
) => {
    try {
        // Validate input data
        if (!data || !data.userId) {
            return sendMessage(ws, {
                type: "auth_error",
                data: { message: "Missing userId in authentication data" },
            });
        }

        console.log(`Authenticating user: ${data.userId}`);

        // Check if user exists in database
        const user = await prisma.user.findUnique({
            where: { id: data.userId },
            select: { id: true, name: true },
        });

        if (!user) {
            return sendMessage(ws, {
                type: "auth_error",
                data: { message: "Invalid user ID" },
            });
        }

        // Check if user is already connected and handle reconnection
        const existingSocket = server.connectedUsers.get(data.userId);
        if (existingSocket && existingSocket !== ws) {
            console.log(
                `User ${data.userId} already connected, closing previous connection`
            );
            // Remove old connection
            server.socketConnections.delete(existingSocket.id);
            existingSocket.close();
        }

        // Set user data on socket
        ws.userId = data.userId;
        ws.chatIds = new Set();

        // Add to connected users
        server.connectedUsers.set(data.userId, ws);

        // Get user's chats

        const userChats = await prisma.chat.findMany({
            where:{
                Hub:{
                    members:{
                        some:{userId:data.userId}
                    }
                }
            },
        })

        // Add user to chat rooms
        if (userChats && userChats.length > 0) {
            userChats.forEach((chat) => {
                if(!chat.id) return
                ws.chatIds?.add(chat.id);

                // Initialize chat room if it doesn't exist
                if (!server.chatRooms.has(chat.id)) {
                    server.chatRooms.set(chat.id, new Set());
                }

                // Add user to chat room
                server.chatRooms.get(chat.id)?.add(ws.userId!);
                console.log(
                    `User ${data.userId} joined chat: ${chat.id} `
                );
            });
        }

        // Send success response
        sendMessage(ws, {
            type: "authenticated",
            data: {
                message: "Successfully authenticated",
                user,
            },
        });

        console.log(
            `User ${data.userId} successfully authenticated and joined ${userChats.length} chat`
        );
    } catch (err) {
        console.error("Authentication error:", err);
        sendMessage(ws, {
            type: "auth_error",
            data: { message: "Authentication failed due to server error" },
        });
    }
};
