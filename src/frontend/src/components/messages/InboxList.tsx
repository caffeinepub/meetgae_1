import { ConversationView } from '../../backend';
import { useGetUserProfile } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from '@tanstack/react-router';
import { Principal } from '@dfinity/principal';

interface InboxListProps {
  conversations: ConversationView[];
  isLoading?: boolean;
}

function ConversationItem({ conversation }: { conversation: ConversationView }) {
  const { identity } = useInternetIdentity();
  const currentUserId = identity?.getPrincipal().toString();

  const partnerId = conversation.participant1.toString() === currentUserId
    ? conversation.participant2
    : conversation.participant1;

  const { data: partnerProfile } = useGetUserProfile(partnerId);

  const lastMessage = conversation.messages[conversation.messages.length - 1];

  const getAvatarUrl = () => {
    if (partnerProfile?.photo) {
      return partnerProfile.photo.getDirectURL();
    }
    return '/assets/generated/default-avatar.dim_256x256.png';
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  return (
    <Link to="/conversation/$userId" params={{ userId: partnerId.toString() }}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={getAvatarUrl()} alt={partnerProfile?.username} />
              <AvatarFallback>{partnerProfile?.username?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold truncate">
                  {partnerProfile?.username || 'Unknown User'}
                </h4>
                {lastMessage && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTimestamp(lastMessage.timestamp)}
                  </span>
                )}
              </div>
              {lastMessage && (
                <p className="text-sm text-muted-foreground truncate mt-1">
                  {lastMessage.sender.toString() === currentUserId ? 'You: ' : ''}
                  {lastMessage.content}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function InboxList({ conversations, isLoading }: InboxListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-full bg-muted animate-pulse rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No conversations yet. Start chatting with someone from the Discover page!
          </p>
        </CardContent>
      </Card>
    );
  }

  const sortedConversations = [...conversations].sort((a, b) => {
    const aLast = a.messages[a.messages.length - 1];
    const bLast = b.messages[b.messages.length - 1];
    if (!aLast) return 1;
    if (!bLast) return -1;
    return Number(bLast.timestamp - aLast.timestamp);
  });

  return (
    <div className="space-y-3">
      {sortedConversations.map((conversation) => (
        <ConversationItem key={conversation.id.toString()} conversation={conversation} />
      ))}
    </div>
  );
}

