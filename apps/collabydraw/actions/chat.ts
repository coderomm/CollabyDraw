"use server";

import { z } from "zod";
import client from "@repo/db/client";
import { JoinRoomSchema } from "@repo/common/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";

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

    if (!chats.length) {
      return { success: true, shapes: [] };
    }

    const shapes = chats.map((x: { message: string }) => {
      const messageData = JSON.parse(x.message);
      return messageData.shape;
    });

    return { success: true, shapes };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid room code format" };
    }
    console.error("Failed to get chats:", error);
    return { success: false, error: "Failed to get chats" };
  }
}

export async function clearAllChats(data: { roomName: string }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return { success: false, error: "Authentication required" };
    }

    const userEmail = session.user.email;
    const validatedRoomName = JoinRoomSchema.parse(data);

    const room = await client.room.findUnique({
      where: { slug: validatedRoomName.roomName },
      include: { admin: true },
    });

    if (!room || !room.id) {
      return { success: false, error: "Room not found" };
    }

    if (room.admin.email !== userEmail) {
      return {
        success: false,
        error: "Unauthorized: Only the room creator can clear chats",
      };
    }

    const result = await client.chat.deleteMany({
      where: { roomId: room.id },
    });

    return {
      success: true,
      count: result.count,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid room code format" };
    }
    console.error("Failed to clear chats:", error);
    return { success: false, error: "Failed to clear chats" };
  }
}
