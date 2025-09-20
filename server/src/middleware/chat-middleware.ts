import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

export const chatMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId, chatId } = req.params;

        // Ensure params exist
        if (!userId || !chatId) {
            return res.status(400).json({
                success: false,
                error: "Missing userId or chatId in request",
            });
        }

        const chat = await prisma.chat.findUnique({
            where: { id: chatId },
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                error: "Chat does not exist",
            });
        }

        // If it's a hub chat, validate membership
        if (chat.type === 2) {
            const hub = await prisma.hub.findFirst({
                where: {
                    chatId: chatId,
                    members: {
                        some: { userId: userId },
                    },
                },
            });

            if (!hub) {
                return res.status(403).json({
                    success: false,
                    error: "You are not a member of this chat",
                });
            }
        }

        // ✅ pass to the next handler if checks succeed
        next();
    } catch (err) {
        console.error("chatMiddleware error:", err);
        return res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};
