"use server";

import { z } from "zod";
import client from "@repo/db/client";
import { CreateRoomSchema, JoinRoomSchema } from "@repo/common/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { cookies } from "next/headers";

export async function joinRoom(data: { roomName: string }) {
  try {
    const validatedRoomName = JoinRoomSchema.parse(data);

    const room = await client.room.findUnique({
      where: { slug: validatedRoomName.roomName },
    });

    if (!room) {
      return { success: false, error: "Room not found" };
    }

    const session = await getServerSession(authOptions);
    const cookieToken = session?.accessToken;

    if (!cookieToken) {
      console.error("session.accessToken not found in join room server action");
      return;
    }

    (await cookies()).set("accessToken", cookieToken, {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: false,
    });

    return {
      success: true,
      roomName: room.slug,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid room code format" };
    }
    console.error("Failed to join room:", error);
    return { success: false, error: "Failed to join room" };
  }
}

export async function createRoom(data: { roomName: string }) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user || !user.id) {
      return { success: false, error: "User not found" };
    }

    const validatedRoomName = CreateRoomSchema.parse(data);

    const room = await client.room.create({
      data: {
        slug: validatedRoomName.roomName,
        adminId: user.id,
      },
    });

    return {
      success: true,
      room,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid room name format",
        errorMessage: error.message,
      };
    }
    console.error("Failed to create room:", error);
    return { success: false, error: "Failed to create room" };
  }
}

export async function getRoom(data: { roomName: string }) {
  try {
    const validatedRoomName = JoinRoomSchema.parse(data);

    const room = await client.room.findUnique({
      where: { slug: validatedRoomName.roomName },
      include: { Chat: true },
    });

    if (!room) {
      return { success: false, error: "Room not found" };
    }

    const session = await getServerSession(authOptions);
    const cookieToken = session?.accessToken;

    if (!cookieToken) {
      console.error("session.accessToken not found in join room server action");
      return;
    }

    (await cookies()).set("accessToken", cookieToken, {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: false,
    });

    return {
      success: true,
      room: room,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid room code format" };
    }
    console.error("Failed to join room:", error);
    return { success: false, error: "Failed to join room" };
  }
}
