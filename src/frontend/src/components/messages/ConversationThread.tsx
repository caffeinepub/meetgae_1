import { useState, useEffect, useRef } from 'react';
import { Message } from '../../backend';
import { useGetUserProfile, useSendMessage, useGetCallerUserProfile } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Principal } from '@dfinity/principal';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';

interface ConversationThreadProps {
  partnerId: Principal;
  messages: Message[] | null;
  isLoading?: boolean;
  onRefresh: () => void;
}

export default function ConversationThread({ partnerId, messages, isLoading, onRefresh }: ConversationThreadProps) {
  const { identity } = useInternetIdentity();
  const { data: partnerProfile } = useGetUserProfile(partnerId);
  const { data: userProfile } = useGetCallerUserProfile();
  const sendMutation = useSendMessage();
  const [content, setContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = identity?.getPrincipal().toString();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identity) {
      toast.error('Please sign in to send messages');
      return;
    }

    if (!content.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      await sendMutation.mutateAsync({ to: partnerId, content: content.trim() });
      setContent('');
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to send message';
      if (errorMsg.includes('Daily message limit reached')) {
        toast.error('Daily message limit reached. Check your plan for details.');
      } else {
        toast.error(errorMsg);
      }
    }
  };

  const getAvatarUrl = () => {
    if (partnerProfile?.photo) {
      return partnerProfile.photo.getDirectURL();
    }
    return '/assets/generated/default-avatar.dim_256x256.png';
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)]">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={getAvatarUrl()} alt={partnerProfile?.username} />
            <AvatarFallback>{partnerProfile?.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <h3 className="font-semibold">{partnerProfile?.username || 'Unknown User'}</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!messages || messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isOwn = message.sender.toString() === currentUserId;
              return (
                <div
                  key={message.id.toString()}
                  className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                    <p className={`text-xs mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {formatTimestamp(message.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message..."
            maxLength={500}
            disabled={sendMutation.isPending}
          />
          <Button type="submit" disabled={sendMutation.isPending || !content.trim()} className="gap-2">
            {sendMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
