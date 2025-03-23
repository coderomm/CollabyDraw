import client from '@repo/db/client';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
// import RoomCanvas from '@/components/canvas/RoomCanvas';
import CanvasSheet from '@/components/canvas/CanvasSheet';

export default async function CanvasPage({ params }: { params: Promise<{ roomName: string }> }) {
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
    if (!user || !user.id) {
        console.error('User from session not found.');
        redirect(`/`);
    }

    return (
        <CanvasSheet
            roomId={room.id.toString()}
            roomName={room.slug}
            userId={user.id}
            userName={user.name || 'User-' + user.id}
            token={session.accessToken}
        />
        // <RoomCanvas
        //     roomId={room.id.toString()}
        //     roomName={room.slug}
        //     userId={user.id}
        //     userName={user.name || 'User-' + user.id}
        //     token={session.accessToken}
        // />
    )
}