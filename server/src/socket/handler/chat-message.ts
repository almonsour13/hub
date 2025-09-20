import { prisma } from "../../lib/prisma";
import { newMessageQuery } from "../../util/query/message-query";
import { mapAttachmentsWithUrl } from "../../util/attachment";
import { broadcastToChat,broadcastToHubMembers } from "../brodcast";
import WebSocketServer, { UserWebSocket } from "../socket";
interface Sender {
    id: string;
    name: string;
}
interface ChatActivityData {
    tempId?: string;
    action: string;
    chatId: string;
    senderId?: string;
    sender?: Sender;
    messageId?: string;
    message?: string;
    replyToId?: string;
    isTyping?: boolean;
}

export default class ChatMessage {
    server: WebSocketServer;

    constructor(server: WebSocketServer) {
        this.server = server;
    }

    public handleActivity = async (
        ws: UserWebSocket,
        data: ChatActivityData
    ) => {
        const { action } = data;

        switch (action) {
            case "send":
                this.sendMessage(ws, data);
                break;
            case "update":
                this.updateMessage(ws, data);
                break;
            case "remove":
                this.removeMessage(ws, data);
                break;
            case "pin":
            case "unpin":
                this.pinMessage(ws, data);
                break;
            case "typing":
                this.typing(ws, data);
                break;
            case "mark-read": // Add new action
                this.markMessageAsRead(ws, data);
            default:
                console.warn("Unknown chat action:", action);
        }

        console.log("Chat activity received:", data);
    };

    private async sendMessage(ws: UserWebSocket, data: ChatActivityData) {
        const { chatId, senderId, message, replyToId, tempId } = data;
        const newMessage = await prisma.message.create({
            data: {
                senderId,
                chatId,
                message,
                replyToId: replyToId || null,
            },
            include: {
               ...newMessageQuery,
            },
        });
        const chat = await prisma.chat.update({
            where: { id: chatId },
            data: {
                updatedAt: new Date(),
            },
        });

        const newMessageWithUrl = newMessage
            ? {
                  ...newMessage,
                  attachments: mapAttachmentsWithUrl(
                      newMessage.chatId,
                      newMessage.attachments
                  ),
                  replyTo: newMessage.replyTo
                      ? {
                            ...newMessage.replyTo,
                            attachments: mapAttachmentsWithUrl(
                                newMessage.chatId,
                                newMessage.replyTo.attachments
                            ),
                        }
                      : null,
              }
            : null;
        const payload = {
            type: "chat-activity",
            data: {
                action: "new-message",
                chatId,
                senderId,
                message: newMessageWithUrl,
                replyToId,
                tempId,
            },
        };
        broadcastToChat(
            chatId,
            payload,
            this.server.connectedUsers,
            this.server.chatRooms
        );
        const payload2 = {
            type: "chat-list-activity",
            data: {
                action: "new-message",
                chat,
                chatId,
                lastMessage: newMessage,
            },
        };
        broadcastToHubMembers(chatId, payload2, this.server.connectedUsers);
    }
    private async updateMessage(ws: UserWebSocket, data: ChatActivityData) {
        const { chatId, senderId, message, messageId } = data;

        if (!message || !messageId) return;

        // 1. Fetch original
        const originalMessage = await prisma.message.findUnique({
            where: { id: messageId },
        });
        if (!originalMessage) return;

        // 2. Save old content into edit history
        await prisma.edit.create({
            data: {
                messageId,
                prevMessage: originalMessage.message!,
            },
        });

        // 3. Update the message with the new content
        const updatedMessage = await prisma.message.update({
            where: { id: messageId },
            data: {
                message,
                updatedAt: new Date(),
            },
            include: {
                edits: true, // fetch all past edits
            },
        });

        // 4. Broadcast updated message + its edit history
        const payload = {
            type: "chat-activity",
            data: {
                action: "update-message",
                chatId,
                senderId,
                message: updatedMessage,
            },
        };

        broadcastToChat(
            chatId,
            payload,
            this.server.connectedUsers,
            this.server.chatRooms
        );
    }
    private async removeMessage(ws: UserWebSocket, data: ChatActivityData) {
        const { chatId, senderId, messageId } = data;
        await prisma.message.update({
            where: { id: messageId },
            data: {
                status: 2,
            },
        });
        const payload = {
            type: "chat-activity",
            data: {
                action: "remove-message",
                chatId,
                senderId,
                messageId,
            },
        };
        broadcastToChat(
            chatId,
            payload,
            this.server.connectedUsers,
            this.server.chatRooms
        );
        // broadcastToHubMembers(chatId, payload, this.server.connectedUsers);
        // TODO: implement message update logic
    }
    private async pinMessage(ws: UserWebSocket, data: ChatActivityData) {
        const { action, chatId, senderId, messageId } = data;
        await prisma.message.update({
            where: { id: messageId },
            data: {
                pinnedById: action === "pin" ? senderId : null,
                pinnedAt: action === "pin" ? new Date() : null,
            },
        });
        const payload = {
            type: "chat-activity",
            data: {
                action: action === "pin" ? "pin-message" : "unpin-message",
                chatId,
                senderId,
                messageId,
            },
        };
        broadcastToChat(
            chatId,
            payload,
            this.server.connectedUsers,
            this.server.chatRooms
        );
    }
    private async typing(ws: UserWebSocket, data: ChatActivityData) {
        const { action, chatId, senderId, isTyping, sender } = data;

        const payload = {
            type: "chat-activity",
            data: {
                action: "typing",
                chatId,
                senderId,
                sender,
                isTyping,
            },
        };
        broadcastToChat(
            chatId,
            payload,
            this.server.connectedUsers,
            this.server.chatRooms,
            senderId
        );
    }
    private async markMessageAsRead(ws: UserWebSocket, data: ChatActivityData) {
        const { chatId, senderId, messageId } = data;

        if (!messageId || !senderId || !chatId) return;

        try {
            // Check if user is member of the chat
            const hubMember = await prisma.member.findFirst({
                where: {
                    userId: senderId,
                    hub: {
                        chatId: chatId,
                    },
                    
                },
                include: { lastSeenMessage: true, user:{
                    select:{
                        id:true,
                        name:true,
                        email:true
                    }
                } },
            });

            if (!hubMember) return;
            const currentMessage = await prisma.message.findUnique({
                where: { id: messageId },
                select: {
                    id: true,
                    createdAt: true,
                },
            });

            if (!currentMessage) return;
            let shouldUpdateLastSeen = true;
            // Check if there's already a last seen message
            if (hubMember.lastSeenMessage) {
                shouldUpdateLastSeen =
                    currentMessage.createdAt >
                    hubMember.lastSeenMessage.createdAt;
            }
            if (shouldUpdateLastSeen) {
                await prisma.member.update({
                    where: { id: hubMember.id },
                    data: {
                        lastSeenId: messageId,
                        lastSeenAt: new Date(),
                    },
                    include: {
                        lastSeenMessage: true,
                    },
                });
            }
            const receipt = await prisma.readReceipt.upsert({
                where: {
                    messageId_userId: {
                        messageId: messageId,
                        userId: senderId,
                    },
                },
                create: {
                    messageId: messageId,
                    userId: senderId,
                    readAt: new Date(),
                },
                update: {
                    readAt: new Date(),
                },
                include: {
                    user: true,
                },
            });
            const payload = {
                type: "chat-activity",
                data: {
                    action: "message-receipts-update",
                    chatId: chatId,
                    messageId: messageId,
                    receipt: receipt,
                },
            };

            broadcastToChat(
                chatId,
                payload,
                this.server.connectedUsers,
                this.server.chatRooms
            );
            const lastSeenPayload = {
                type: "chat-activity",
                data: {
                    action: "user-last-seen-update",
                    chatId: chatId,
                    user: hubMember.user,
                    messageId,
                },
            };
            if (shouldUpdateLastSeen) {
                broadcastToChat(
                    chatId,
                    lastSeenPayload,
                    this.server.connectedUsers,
                    this.server.chatRooms
                );
            }
        } catch (error) {
            console.error("Error marking message as read:", error);
        }
    }
}
