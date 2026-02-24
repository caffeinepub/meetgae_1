import { Principal } from '@dfinity/principal';
import { useFollowUser, useUnfollowUser } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FollowButtonProps {
  userId: Principal;
  isFollowing: boolean;
}

export default function FollowButton({ userId, isFollowing }: FollowButtonProps) {
  const { identity } = useInternetIdentity();
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const isLoading = followMutation.isPending || unfollowMutation.isPending;

  const handleClick = async () => {
    if (!identity) {
      toast.error('Please sign in to follow users');
      return;
    }

    try {
      if (isFollowing) {
        await unfollowMutation.mutateAsync(userId);
        toast.success('Unfollowed successfully');
      } else {
        await followMutation.mutateAsync(userId);
        toast.success('Following!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update follow status');
    }
  };

  return (
    <Button
      variant={isFollowing ? 'outline' : 'default'}
      size="sm"
      onClick={handleClick}
      disabled={isLoading}
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserMinus className="h-4 w-4" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          Follow
        </>
      )}
    </Button>
  );
}

