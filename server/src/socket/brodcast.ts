import { prisma } from "../lib/prisma";
import { UserWebSocket } from "./socket";
import { WebSocketMessage } from "./type";

export const broadcastToChat = (
    chatId: string,
    message: WebSocketMessage,
    connectedUsers: Map<string, UserWebSocket>,
    chatRooms: Map<string, Set<string>>,
    excludeUserId?: string
) => {
    const hubMembers = chatRooms.get(chatId);
    if (!hubMembers) return;

    hubMembers.forEach((userId) => {
        if (excludeUserId && userId === excludeUserId) return;

        const ws = connectedUsers.get(userId);
        if (ws && ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify(message));
        }
    });
};

export const broadcastToHubMembers = async (
    chatId: string,
    message: WebSocketMessage,
    connectedUsers: Map<string, UserWebSocket>,
    excludeUserId?: string
) => {
    const hubMembers = await getChatMembers(chatId);
    hubMembers.forEach((userId) => {
        if (excludeUserId && userId === excludeUserId) return;

        const ws = connectedUsers.get(userId);
        if (ws && ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify(message));
        }
    });
};
const getChatMembers = async (chatId: string): Promise<string[]> => {
    try {
        const chatHubMembers = await prisma.chat.findUnique({
            where: { id: chatId },
            include: {
                Hub: {
                    select: {
                        members: {
                            select: {
                                userId: true,
                            },
                        },
                    },
                },
            },
        });

        return chatHubMembers?.Hub?.members.map((member) => member.userId) || [];
    } catch (error) {
        console.error("Error fetching hub members:", error);
        return [];
    }
};
