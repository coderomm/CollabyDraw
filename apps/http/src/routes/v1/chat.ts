import client from '@repo/db/client';
import { Router } from "express";
import { userMiddleware } from "../../middlewares";
import { GetChatSchema } from "@repo/common/types";

export const chatRouter = Router()

chatRouter.get('/:roomId', userMiddleware, async (req, res) => {
    try {
        const parsedData = GetChatSchema.safeParse(req.params.roomId);
        if (!parsedData.success) {
            res.status(403).json({ message: "Get Chat Schema Validation failed", errors: parsedData.error.format() });
            return;
        }
        const chats = await client.chat.findMany({
            where: {
                roomId: Number(parsedData.data.roomId)
            }, orderBy: {
                id: 'desc'
            }, take: 100
        });
        res.json({ chats })
    } catch (error: any) {
        console.error("Get chats error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
})