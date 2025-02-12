import { Router } from "express";
import client from "@repo/db/client";

export const router = Router();

router.post("/create", async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            res.status(400).json({ message: "Room name is required" });
            return;
        }

        const room = await client.room.create({ data: { name } });

        res.json({ roomId: room.id });
    } catch (error: any) {
        console.error("Create room error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});
