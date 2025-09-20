"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const uuid_1 = require("uuid");
const HubRoute = (0, express_1.Router)();
HubRoute.post("/:userId/create", async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, description } = req.body;
        const existingHub = await prisma_1.prisma.hub.findFirst({
            where: { name: name },
        });
        if (existingHub) {
            return {
                success: false,
                error: "Hub with this name already exists",
            };
        }
        const hub = await prisma_1.prisma.hub.create({
            data: {
                code: (0, uuid_1.v4)(),
                creatorId: userId,
                name: name,
                description: description || null,
            },
        });
        await prisma_1.prisma.member.create({
            data: {
                hubId: hub.id,
                userId: userId,
                role: 1,
            },
        });
        console.log("hub created:", hub);
        return {
            success: true,
            message: "Hub created successfully",
            hub: hub,
        };
    }
    catch (error) {
        console.error("Error creating hub:", error);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
});
exports.default = HubRoute;
