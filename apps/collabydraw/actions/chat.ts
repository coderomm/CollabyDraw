"use server";

import { z } from "zod";
import client from "@repo/db/client";
import { JoinRoomSchema } from "@repo/common/types";

export async function getChats(data: { roomName: string }) {
  try {
    const validatedRoomName = JoinRoomSchema.parse(data);

    const room = await client.room.findUnique({
      where: { slug: validatedRoomName.roomName },
    });

    if (!room || !room.id) {
      return { success: false, error: "Room not found" };
    }

    const chats = await client.chat.findMany({
      where: { roomId: room.id },
    });

    if (!chats) {
      return { success: false, error: "Chats not found" };
    }

    const shapes = chats.map((x: { message: string }) => {
      const messageData = JSON.parse(x.message);
      return messageData.shape;
    });

    return {
      shapes,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid room code format" };
    }
    console.error("Failed to get chats:", error);
    return { success: false, error: "Failed to get chats" };
  }
}
