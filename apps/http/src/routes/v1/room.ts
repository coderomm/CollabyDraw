import client from '@repo/db/client';
import { Router } from "express";
import { CreateRoomSchema } from "@repo/common/types";
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
                slug: parsedData.data.name,
                adminId: req.userId,
            }
        })

        res.json({ roomId: room.id });
    } catch (error: any) {
        console.error("Create room error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});
