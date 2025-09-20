import e, { Request, Response, Router } from "express";
import multer from "multer";
import { prisma } from "../lib/prisma";
import { chatMiddleware } from "../middleware/chat-middleware";
import { messageQuery, newMessageQuery } from "../util/query/message-query";
import { getWebSocketServer } from "../server";
import { broadcastToChat, broadcastToHubMembers } from "../socket/brodcast";
import { mapAttachmentsWithUrl } from "../util/attachment";
import { sender } from "../util/query/query";

const ChatRoute = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get list of chats for a user with latest message preview
ChatRoute.get("/:userId/", async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const chats = await prisma.chat.findMany({
            where: {
                Hub: {
                    members: {
                        some: { userId: userId },
                    },
                },
            },
            include: {
                Hub: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                updatedAt: "asc",
            },
        });

        const chatsWithLatestMessage = await Promise.all(
            chats.map(async (chat) => {
                const latestMessage = await prisma.message.findFirst({
                    where: { chatId: chat.id },
                    orderBy: {
                        createdAt: "desc", // use "desc" so you get the newest, not the oldest
                    },
                    include: {
                        sender: true,
                    },
                });

                return {
                    ...chat,
                    lastActivity: {
                        hub: chat.Hub,
                        message: latestMessage
                            ? {
                                  ...latestMessage,
                                  message:
                                      latestMessage?.type === 1
                                          ? latestMessage.message
                                          : "sent an image",
                              }
                            : null,
                    },
                };
            })
        );

        return res.json({
            success: true,
            chatList: chatsWithLatestMessage.sort((a, b) => {
                const aDate = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
                const bDate = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
                return bDate - aDate;
            }),
        });
    } catch (error) {}
});
// Get messages in a chat with pagination
ChatRoute.get(
    "/:userId/:chatId",
    chatMiddleware,
    async (req: Request, res: Response) => {
        try {
            const { cursor } = req.query;
            const { userId, chatId } = req.params;
            const limit = 10;

            // Build the where clause for pagination
            const whereClause: any = { chatId };

            // If cursor is provided, only get messages older than the cursor
            if (cursor) {
                whereClause.id = {
                    lt: cursor, // Less than cursor (older messages)
                };
            }

            const messages = await prisma.message.findMany({
                where: whereClause,
                take: limit + 1, // Take one extra to check if there are more
                orderBy: {
                    createdAt: "desc", // Get newest first, then reverse
                },
                include: {
                    ...messageQuery,
                },
            });

            // Check if there are more messages
            const hasMore = messages.length > limit;
            let messagesToReturn = messages;
            let nextCursor = null;

            if (hasMore) {
                // Remove the extra message and set cursor
                messagesToReturn = messages.slice(0, limit);
                nextCursor = messagesToReturn[messagesToReturn.length - 1].id;
            }

            messagesToReturn.reverse();

            const members = await prisma.member.findMany({
                where: { hub: { chatId } },
                select: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                    lastSeenId: true,
                },
            });

            // Success: return chat info with properly paginated messages
            const messagesWithUrl = messagesToReturn.map((msg) => ({
                ...msg,
                attachments: mapAttachmentsWithUrl(msg.chatId, msg.attachments),
                replyTo: msg.replyTo
                    ? {
                          ...msg.replyTo,
                          attachments: mapAttachmentsWithUrl(
                              msg.chatId,
                              msg.replyTo.attachments
                          ),
                      }
                    : null,
                lastSeenBy: members
                    .filter((m) => m.lastSeenId === msg.id)
                    .map((m) => m.user),
            }));

            return res.json({
                success: true,
                messages: messagesWithUrl,
                nextCursor,
                hasMore,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                error: "Internal server error",
            });
        }
    }
);
// Upload attachments (like images) to a chat
ChatRoute.post(
    "/:userId/:chatId/attachment/upload",
    chatMiddleware,
    upload.array("files"),
    async (req: Request, res: Response) => {
        try {
            const { userId, chatId } = req.params;
            const { message, tempId, replyToId } = req.body;
            const messageResult = await prisma.message.create({
                data: {
                    senderId: userId,
                    chatId: chatId,
                    message: message || "",
                    type: 2,
                    replyToId: replyToId || null,
                },
                include: {
                    sender: true,
                },
            });

            if (!messageResult) {
                return res
                    .status(400)
                    .json({ error: "Failed to create message" });
            }

            for (const file of req.files as Express.Multer.File[]) {
                const { originalname, buffer, mimetype, size } = file;
                await prisma.attachment.create({
                    data: {
                        messageId: messageResult.id,
                        data: buffer,
                        name: originalname,
                        mimeType: mimetype,
                        size: size,
                        type: 1,
                    },
                });
            }
            const getNewMessage = await prisma.message.findUnique({
                where: { id: messageResult.id },
                include: {
                    ...newMessageQuery,
                },
            });

            const messageWithUrl = getNewMessage
                ? {
                      ...getNewMessage,
                      attachments: mapAttachmentsWithUrl(
                          getNewMessage.chatId,
                          getNewMessage.attachments
                      ),
                      replyTo: getNewMessage.replyTo
                          ? {
                                ...getNewMessage.replyTo,
                                attachments: mapAttachmentsWithUrl(
                                    getNewMessage.chatId,
                                    getNewMessage.replyTo.attachments
                                ),
                            }
                          : null,
                  }
                : null;

            const wsServer = getWebSocketServer();
            if (wsServer && getNewMessage) {
                const connectedUser = wsServer.connectedUsers;
                const chatRooms = wsServer.chatRooms;
                const payload = {
                    type: "chat-activity",
                    data: {
                        action: "new-message",
                        chatId,
                        senderId: userId,
                        message: messageWithUrl,
                        replyToId,
                        tempId,
                    },
                };
                broadcastToChat(chatId, payload, connectedUser, chatRooms);
                const payload2 = {
                    type: "chat-list-activity",
                    data: {
                        action: "new-message",
                        chatId,
                        lastMessage: {
                            ...messageResult,
                            message: "sent a message",
                        },
                    },
                };
                broadcastToHubMembers(chatId, payload2, connectedUser);
            }
            res.json({
                message: messageWithUrl,
            });
        } catch (error) {}
    }
);
// Serve attachment data (like images) for a message
ChatRoute.get("/:chatId/attachment/:attachmentId", async (req, res) => {
    try {
        const { attachmentId } = req.params;

        const attachment = await prisma.attachment.findUnique({
            where: { id: attachmentId },
        });

        if (!attachment) return res.status(404).send("Attachment not found");

        // Set proper content type
        res.setHeader(
            "Content-Type",
            attachment.mimeType ?? "application/octet-stream"
        );

        // For images, this URL can be used in <img src="...">
        res.send(attachment.data);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal server error");
    }
});
// Jump to a specific message in the chat and load context around it
ChatRoute.get(
    "/:userId/:chatId/jump/:messageId",
    chatMiddleware,
    async (req: Request, res: Response) => {
        try {
            const { userId, chatId, messageId } = req.params;
            const { cursor } = req.query;
            const targetMessage = await prisma.message.findUnique({
                where: { id: messageId, chatId },
                select: {
                    id: true,
                    createdAt: true,
                },
            });
            if (!targetMessage) {
                return res.status(404).json({
                    success: false,
                    error: "Message not found in chat",
                });
            }
            const whereClause: any = { chatId };
            if (cursor) {
                const cursorMessage = await prisma.message.findUnique({
                    where: { chatId, id: cursor as string },
                });
                if (cursorMessage) {
                    whereClause.createdAt = {
                        gte: targetMessage.createdAt,
                        lt: cursorMessage.createdAt,
                    };
                }
            } else {
                whereClause.createdAt = {
                    lte: targetMessage.createdAt, // Less than or equal to target message date
                };
            }

            const messages = await prisma.message.findMany({
                where: whereClause,
                include: {
                    ...messageQuery,
                },
            });

            const messagesAfterTarget = await prisma.message.findMany({
                where: {
                    chatId,
                    createdAt: { lt: targetMessage.createdAt },
                },
                orderBy: { createdAt: "desc" }, // Get newest first
            });
            const hasMore = messagesAfterTarget.length > 0;
            const nextCursor = hasMore ? targetMessage.id : null;
            return res.json({
                success: true,
                messages,
                targetMessage,
                nextCursor,
                hasMore,
                messagesAfterTarget,
            });
        } catch (error) {}
    }
);
// search messages in a chat
ChatRoute.get(
    "/:userId/:chatId/search",
    chatMiddleware,
    async (req: Request, res: Response) => {
        try {
            const { userId, chatId } = req.params;
            const { query } = req.query;
            if (!query || (query as string).trim() === "") {
                return res.status(400).json({
                    success: false,
                    error: "Query parameter is required",
                });
            }
            const messages = await prisma.message.findMany({
                where: {
                    chatId,
                    message: {
                        contains: query as string,
                    },
                    type: 1,
                },
                select: {
                    chatId: true,
                    id: true,
                    message: true,
                    type: true,
                    createdAt: true,
                    sender: sender,
                },
            });
            return res.json({
                success: true,
                messages,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                error: "Internal server error",
            });
        }
    }
);
// pinned messages in a chat
ChatRoute.get(
    "/:userId/:chatId/pins",
    chatMiddleware,
    async (req: Request, res: Response) => {
        try {
            const { userId, chatId } = req.params;

            const messages = await prisma.message.findMany({
                where: {
                    chatId,
                    pinnedById: {
                        not: null, // ensures it's not null
                    },
                },
                 select: {
                    chatId: true,
                    id: true,
                    message: true,
                    type: true,
                    createdAt: true,
                    sender: sender,
                    pinnedBy:sender
                },
            });
            
        } catch (error) {}
    }
);
export default ChatRoute;
