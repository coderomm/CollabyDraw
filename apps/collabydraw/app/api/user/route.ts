import { authOptions } from "@/utils/auth";
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);
    return NextResponse.json({
        name: session?.user?.name,
        email: session?.user?.email
    })
}