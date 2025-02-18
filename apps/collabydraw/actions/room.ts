'use server';

import { z } from 'zod';
import client from '@repo/db/client';
import { CreateRoomSchema, JoinRoomSchema } from '@repo/common/types';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';

export async function joinRoom(roomName: string) {
    try {
        const validatedRoomName = JoinRoomSchema.parse(roomName);

        const room = await client.room.findUnique({
            where: { slug: validatedRoomName.roomName },
        });

        if (!room) {
            return { success: false, error: 'Room not found' };
        }

        return {
            success: true,
            roomName: room.slug
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: 'Invalid room code format' };
        }
        console.error('Failed to join room:', error);
        return { success: false, error: 'Failed to join room' };
    }
}

export async function createRoom(roomName: string) {
    try {
        const session = await getServerSession(authOptions);
        const user = session?.user;

        const validatedRoomName = CreateRoomSchema.parse(roomName);

        const room = await client.room.create({
            data: {
                slug: validatedRoomName.roomName,
                adminId: user.id,
            },
        });

        return {
            success: true,
            room
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: 'Invalid room name format' };
        }
        console.error('Failed to create room:', error);
        return { success: false, error: 'Failed to create room' };
    }
}