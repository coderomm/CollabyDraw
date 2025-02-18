import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import client from '@repo/db/client';
import Link from 'next/link';
import RoomClientComponent from '@/components/RoomClientComponent';

export async function generateMetadata({ params }: { params: { roomName: string } }) {
    const { roomName } = params;

    const room = await client.room.findUnique({
        where: { slug: roomName },
    });

    if (!room) return { title: 'Room Not Found' };

    return {
        title: `${room.slug} - Collaboration Room`,
    };
}

export default async function RoomPage({ params }: { params: { roomName: string } }) {
    const { roomName } = params;

    const room = await client.room.findUnique({
        where: { slug: roomName },
        include: {
            participants: true,
        },
    });

    if (!room) {
        notFound();
    }

    // Get current user ID from cookies
    const userId = cookies().get('userId')?.value;

    if (!userId) {
        // Redirect to join room if no user ID
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

    // Check if user is a participant
    const isParticipant = room.participants.some(participant => participant.userId === userId);

    if (!isParticipant) {
        // Add user to room participants
        await db.roomParticipant.create({
            data: {
                userId,
                roomId: room.id,
            },
        });
    }

    return <RoomClientComponent roomName={roomName} roomName={room.slug} userId={userId} />;
}