import { UserProfile } from '../../backend';
import { useGetFollowers } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import FollowButton from '../profile/FollowButton';

interface UserCardProps {
  user: UserProfile;
}

export default function UserCard({ user }: UserCardProps) {
  const { identity } = useInternetIdentity();
  const { data: followers = [] } = useGetFollowers(user.id);
  const navigate = useNavigate();

  const currentUserId = identity?.getPrincipal().toString();
  const isOwnProfile = currentUserId === user.id.toString();
  const isFollowing = identity ? followers.some(f => f.toString() === currentUserId) : false;

  const getAvatarUrl = () => {
    if (user.photo) {
      return user.photo.getDirectURL();
    }
    return '/assets/generated/default-avatar.dim_256x256.png';
  };

  const handleMessage = () => {
    navigate({ to: '/conversation/$userId', params: { userId: user.id.toString() } });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <Link to="/profile/$userId" params={{ userId: user.id.toString() }}>
            <Avatar className="h-20 w-20 cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarImage src={getAvatarUrl()} alt={user.username} />
              <AvatarFallback className="text-xl">{user.username[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>

          <div className="space-y-1 w-full">
            <Link to="/profile/$userId" params={{ userId: user.id.toString() }}>
              <h3 className="font-semibold hover:underline cursor-pointer">{user.username}</h3>
            </Link>
            {user.bio && (
              <p className="text-sm text-muted-foreground line-clamp-2">{user.bio}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {followers.length} {followers.length === 1 ? 'Follower' : 'Followers'}
            </p>
          </div>

          {!isOwnProfile && identity && (
            <div className="flex gap-2 w-full">
              <FollowButton userId={user.id} isFollowing={isFollowing} />
              <Button variant="outline" size="sm" onClick={handleMessage} className="gap-2 flex-1">
                <MessageSquare className="h-4 w-4" />
                Message
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

