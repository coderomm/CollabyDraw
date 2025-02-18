import client from '@repo/db/client';
import { NextRequest, NextResponse } from 'next/server';
import { JoinRoomSchema } from '@repo/common/types';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const user = session?.user;

        if (!user || !user.id) {
            return NextResponse.json({ message: "Error creating room, User not found" }, { status: 401 });
        }

        const body = await req.json();
        const result = JoinRoomSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: 'Invalid room code format' },
                { status: 400 }
            );
        }

        const { roomName } = result.data;

        const room = await client.room.findUnique({
            where: { slug: roomName },
            include: {
                Chat: true
            }
        });

        if (!room) {
            return NextResponse.json(
                { success: false, error: 'Room not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, room });
    } catch (error) {
        console.error('Failed to join room:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to join room' },
            { status: 500 }
        );
    }
}