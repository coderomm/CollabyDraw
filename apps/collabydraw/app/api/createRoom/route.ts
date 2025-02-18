import client from "@repo/db/client";
import { CreateRoomSchema } from "@repo/common/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user || !user.id) {
        return NextResponse.json({ message: "Error creating room, User not found" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const parsedData = CreateRoomSchema.safeParse(body);

        if (!parsedData.success) {
            console.error("Create Room Schema Failed", { errors: parsedData.error.format() });
            return NextResponse.json({ message: "Invalid input data", errors: parsedData.error.format() }, { status: 400 });
        }

        const room = await client.room.create({
            data: {
                slug: parsedData.data.roomName,
                adminId: user.id,
            }
        });

        console.log("Room created successfully", { roomId: room.id });
        return NextResponse.json({ roomId: room.id }, { status: 201 });

    } catch (error) {
        console.error("Error creating room", { error });
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PUT() {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE() {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}