import { NextApiRequest, NextApiResponse } from "next";
import client from "@repo/db/client";
import { CreateRoomSchema } from "@repo/common/types";
import { getServerSession } from "next-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession();
    const user = session?.user
    if (!user || !user.id) {
        return res.status(400).json({ message: "Error creating room, User not found" });
    }
    if (req.method === "POST") {
        console.log("user: ", user);
        const parsedData = CreateRoomSchema.safeParse(req.body);
        if (!parsedData.success) {
            return res.status(400).json({ message: "Create Room Schema Failed", errors: parsedData.error.format() });
        }

        const room = await client.room.create({
            data: {
                slug: parsedData.data.name,
                adminId: user.id,
            }
        })
        return res.status(200).json({ roomId: room.id });
    }

    return res.status(405).json({ error: "Method not allowed" });
}