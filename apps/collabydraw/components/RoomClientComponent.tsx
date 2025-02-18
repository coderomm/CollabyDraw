'use client';

import { useWebSocket } from '@/lib/websocket';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

type Message = {
    userId: string;
    content: string;
    timestamp: string;
};

export default function RoomClientComponent({
    roomCode,
    roomName,
    userId,
}: {
    roomCode: string;
    roomName: string;
    userId: string;
}) {
    const { isConnected, messages, participants, sendMessage } = useWebSocket(roomCode, userId);
    const [input, setInput] = useState('');
    const router = useRouter();

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            sendMessage(input);
            setInput('');
        }
    };

    // Leave room handler
    const handleLeaveRoom = () => {
        router.push('/');
    };

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">{roomName}</h1>
                    <p className="text-sm">Room Code: {roomCode}</p>
                </div>
                <div className="flex items-center">
                    <span className={`h-3 w-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                    <Button variant="outline" className="ml-4" onClick={handleLeaveRoom}>
                        Leave Room
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Participants sidebar */}
                <div className="md:col-span-1 bg-gray-50 p-4 rounded-lg">
                    <h2 className="font-bold mb-2">Participants ({participants.length})</h2>
                    <ul>
                        {participants.map((participantId) => (
                            <li key={participantId} className="py-1">
                                {participantId === userId ? `${participantId} (You)` : participantId}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Chat area */}
                <div className="md:col-span-3 flex flex-col h-[calc(100vh-240px)]">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 bg-white rounded-t-lg border">
                        {messages.length === 0 ? (
                            <p className="text-center text-gray-500 my-8">No messages yet. Start the conversation!</p>
                        ) : (
                            messages.map((msg: Message, index) => (
                                <div key={index} className={`mb-4 ${msg.userId === userId ? 'text-right' : ''}`}>
                                    <div
                                        className={`inline-block px-3 py-2 rounded-lg ${msg.userId === userId
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 text-gray-800'
                                            }`}
                                    >
                                        <p>{msg.content}</p>
                                        <p className="text-xs opacity-75 mt-1">
                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                        </p>
                                    </div>
                                    <p className="text-xs mt-1">{msg.userId === userId ? 'You' : msg.userId}</p>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Input area */}
                    <form onSubmit={handleSubmit} className="bg-gray-50 p-3 rounded-b-lg border-t-0 border">
                        <div className="flex">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 mr-2"
                                disabled={!isConnected}
                            />
                            <Button type="submit" disabled={!isConnected || !input.trim()}>
                                Send
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}