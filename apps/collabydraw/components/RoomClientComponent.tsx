'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { WebSocketChatMessage } from '@repo/common/types';

export default function RoomClientComponent({
  roomName,
  userId,
  token
}: {
  roomName: string;
  userId: string;
  token: string;
}) {
  const {
    isConnected,
    messages,
    participants,
    sendMessage
  } = useWebSocket(roomName, userId, token);

  const [input, setInput] = useState('');
  const [showDisconnectAlert, setShowDisconnectAlert] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    console.log('roomName = ' + roomName + ' userId = ' + userId + ' token = ' + token)
  }, [roomName, token, userId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (!isConnected) {
      const timer = setTimeout(() => {
        setShowDisconnectAlert(true);
      }, 5000);

      return () => clearTimeout(timer);
    } else if (isConnected) {
      setShowDisconnectAlert(false);
    }
  }, [isConnected]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && sendMessage(input)) {
      setInput('');
    }
  };

  const handleLeaveRoom = () => {
    router.push('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <div className="container mx-auto px-4 py-6 max-w-6xl h-[calc(100vh-80px)] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">{roomName}</h1>
            <div className="flex items-center text-sm text-muted-foreground">
              <span className={`h-2 w-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLeaveRoom}>
            Leave Room
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 overflow-hidden">
          {/* Participants sidebar */}
          <div className="md:col-span-1 bg-muted/20 rounded-lg overflow-hidden flex flex-col">
            <div className="p-3 bg-muted/30 font-medium">
              Participants ({participants.length})
            </div>
            <div className="p-3 overflow-y-auto flex-1">
              {participants.length === 0 ? (
                <p className="text-muted-foreground text-sm italic">No one is here yet</p>
              ) : (
                <ul className="space-y-2">
                  {participants.map((participant) => (
                    <li key={participant.userId} className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8 bg-primary/10">
                        <AvatarFallback className="text-xs">
                          {getInitials(participant.userId)}
                        </AvatarFallback>
                      </Avatar>
                      <span className={participant.userId === userId ? "font-medium" : ""}>
                        {participant.userId === userId && " (You)"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className="md:col-span-3 flex flex-col rounded-lg overflow-hidden border bg-card">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <p className="text-center mb-2">No messages yet</p>
                  <p className="text-sm text-center">Start the conversation or wait for others to join</p>
                </div>
              ) : (
                <>
                  {messages.map((msg: WebSocketChatMessage, index) => {
                    const isCurrentUser = msg.userId === userId;
                    const showAvatar = index === 0 || messages[index - 1]?.userId !== msg.userId;

                    return (
                      <div key={index} className={`mb-4 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                        {!isCurrentUser && showAvatar && (
                          <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                            <AvatarFallback className="text-xs">
                              {getInitials(msg.userName || msg.userId)}
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <div className={`max-w-[80%] ${!isCurrentUser && !showAvatar ? 'ml-10' : ''}`}>
                          {showAvatar && (
                            <div className={`text-sm mb-1 ${isCurrentUser ? 'text-right' : ''}`}>
                              {isCurrentUser ? 'You' : (msg.userName || msg.userId)}
                            </div>
                          )}
                          <div
                            className={`px-3 py-2 rounded-lg ${isCurrentUser
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                              }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          </div>
                          <div className={`text-xs text-muted-foreground mt-1 ${isCurrentUser ? 'text-right' : ''}`}>
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input area */}
            <form onSubmit={handleSubmit} className="p-3 border-t bg-card/50">
              <div className="flex">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isConnected ? "Type your message..." : "Waiting for connection..."}
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

      {/* Disconnection Alert */}
      <AlertDialog open={showDisconnectAlert} onOpenChange={setShowDisconnectAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
              Connection Lost
            </AlertDialogTitle>
            <AlertDialogDescription>
              The connection to the chat server has been lost and we are unable to reconnect.
              This might be due to internet issues or server maintenance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleLeaveRoom}>
              Return to Home
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}