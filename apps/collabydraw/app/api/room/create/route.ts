import { NextRequest, NextResponse } from 'next/server';
import client from '@repo/db/client'
import { CreateRoomSchema } from '@repo/common/types';
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
        const parsedData = CreateRoomSchema.safeParse(body);

        if (!parsedData.success) {
            console.error("Create Room Schema Failed", { errors: parsedData.error.format() });
            return NextResponse.json({ message: "Invalid room name format", errors: parsedData.error.format() }, { status: 400 });
        }

        const existingRoom = await client.room.findFirst({
            where: {
                slug: parsedData.data.roomName
            }
        })

        if (existingRoom) {
            return NextResponse.json({ success: false, error: 'Room already exists!' }, { status: 400 });
        }

        const room = await client.room.create({
            data: {
                slug: parsedData.data.roomName,
                adminId: user.id,
            }
        });

        console.log("Room created successfully", { roomId: room.id });
        return NextResponse.json({ room }, { status: 201 });
    } catch (error) {
        console.error('Failed to create room:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create room' },
            { status: 500 }
        );
    }
}