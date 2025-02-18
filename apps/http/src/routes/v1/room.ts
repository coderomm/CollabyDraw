import client from '@repo/db/client';
import { Router } from "express";
import { CreateRoomSchema, GetRoomBySlug } from "@repo/common/types";
import { userMiddleware } from '../../middlewares';

export const roomRouter = Router();

roomRouter.post("/", userMiddleware, async (req, res) => {
    try {
        const parsedData = CreateRoomSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(400).json({ message: "Create Room Schema Failed", errors: parsedData.error.format() });
            return;
        }

        const room = await client.room.create({
            data: {
                slug: parsedData.data.roomName,
                adminId: req.userId,
            }
        })

        res.json({ roomId: room.id });
    } catch (error: any) {
        console.error("Create room error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

roomRouter.get("/:slug", async (req, res) => {
    try {
        const parsedData = GetRoomBySlug.safeParse(req.params.slug);
        if (!parsedData.success) {
            res.status(403).json({ message: "Get Room Schema Validation failed", errors: parsedData.error.format() });
            return;
        }

        const room = await client.room.findFirst({
            where: {
                slug: parsedData.data.slug
            }
        });

        res.json({
            room
        })
    } catch (error: any) {
        console.error("Get room error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
})
