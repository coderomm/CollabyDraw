import { Canvas } from "./Canvas";
import { useWebSocket } from "@/hooks/useWebSocket";

export function RoomCanvas({ roomName, roomId, userId, userName }: { roomName: string; roomId: string; userId: string; userName: string; }) {

    const { isConnected } = useWebSocket(
        roomId,
        roomName,
        userId,
        userName
    );

    return (
        <div>
            {isConnected ? (
                <Canvas roomId={roomId} roomName={roomName} userId={userId} userName={userName} />
            ) : (
                <div className="h-dvh flex justify-center items-center font-bold text-xl md:text-5xl">Connecting to server...</div>
            )}
        </div>
    );
}
