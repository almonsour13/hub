import { Router } from "express";
import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { v4 as uuidv4 } from "uuid";

const HubRoute = Router();

HubRoute.post("/:userId/create", async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { name, description } = req.body;
        const existingHub = await prisma.hub.findFirst({
            where: { name: name },
        });
        if (existingHub) {
            return {
                success: false,
                error: "Hub with this name already exists",
            };
        }
        const chat = await prisma.chat.create({
            data: {
                type: 2, // 2 = hub chat
            },
        });
        const hub = await prisma.hub.create({
            data: {
                code: uuidv4(),
                creatorId: userId,
                name: name,
                description: description || null,
                chatId: chat.id,
            },
        });
        await prisma.member.create({
            data: {
                hubId: hub.id,
                userId: userId,
                role: 1,
            },
        });
        console.log("hub created:", hub);
        return res.status(201).json({
            success: true,
            message: "Hub created successfully",
            hub,
        });
    } catch (error) {
        console.error("Error creating hub:", error);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
});
HubRoute.post("/:userId/join", async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { code } = req.body;

        // Find hub by code
        const hub = await prisma.hub.findUnique({
            where: { code },
            include: { members: true },
        });

        if (!hub) {
            return res.status(404).json({
                success: false,
                error: "Hub not found",
            });
        }

        // Check if user is already a member
        const existingMember = hub.members.find((m) => m.userId === userId);
        if (existingMember) {
            return res.status(400).json({
                success: false,
                error: "User is already a member of this hub",
            });
        }

        // Add user as a member
        const member = await prisma.member.create({
            data: {
                hubId: hub.id,
                userId,
            },
        });

        return res.status(201).json({
            success: true,
            message: "Joined hub successfully",
            hub,
            member,
        });
    } catch (error) {
        console.error("Error joining hub:", error);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
});

HubRoute.get("/:userId", async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        // Fetch hubs where the user is a member
        const hubs = await prisma.hub.findMany({
            where: {
                members: {
                    some: { userId }, // only hubs where this user is a member
                },
            },
            include: {
                chat: true,
            },
        });

        return res.status(200).json({
            success: true,
            hubs,
        });
    } catch (error) {
        console.error("Error fetching hubs:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
});

export default HubRoute;
