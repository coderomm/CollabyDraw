import { notFound } from 'next/navigation';
import client from '@repo/db/client';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { RoomCanvas } from '@/components/canvas/RoomCanavs';

export async function generateMetadata({ params }: { params: Promise<{ roomName: string }> }) {
    const resolvedParams = params instanceof Promise ? await params : params;
    const paramsRoomName = resolvedParams.roomName;
    const decodedParam = decodeURIComponent(paramsRoomName)

    const room = await client.room.findFirst({
        where: { slug: decodedParam },
    });

    if (!room) return { title: 'Room Not Found' };

    return {
        title: `${room.slug} - Collaboration Room`,
    };
}

export default async function DrawCanvasPage({ params }: { params: Promise<{ roomName: string }> }) {
    const resolvedParams = params instanceof Promise ? await params : params;
    const paramsRoomName = resolvedParams.roomName;
    const decodedParam = decodeURIComponent(paramsRoomName)

    const room = await client.room.findFirst({
        where: { slug: decodedParam },
    });
    if (!room) {
        notFound();
    }

    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) {
        console.error('User from session not found.');
        return;
    }
    if (!user.id) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-2xl mb-4">Session Expired</h1>
                <p>Your session has expired. Please join the room again.</p>
                <Link href="/" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Back to Home
                </Link>
            </div>
        );
    }

    return <RoomCanvas
        roomId={room.id.toString()}
        roomName={room.slug}
        userId={user.id}
        userName={user.name || 'User-' + user.id}
    />;
}