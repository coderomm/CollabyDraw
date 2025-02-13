import { Router } from "express";
import { CreateRoomSchema } from "@repo/common/types";

export const roomRouter = Router();

roomRouter.post("/", async (req, res) => {
    try {
        const parsedData = CreateRoomSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(400).json({ message: "Create Room Schema Failed", errors: parsedData.error.format() });
            return;
        }

        res.json({ roomId: "room.id" });
    } catch (error: any) {
        console.error("Create room error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});
