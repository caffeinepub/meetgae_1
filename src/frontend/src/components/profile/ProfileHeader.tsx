import { useGetUserProfile, useGetFollowers } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Principal } from '@dfinity/principal';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin } from 'lucide-react';
import FollowButton from './FollowButton';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Gender, Orientation, RelationshipStatus } from '../../backend';

interface ProfileHeaderProps {
  userId: Principal;
}

export default function ProfileHeader({ userId }: ProfileHeaderProps) {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useGetUserProfile(userId);
  const { data: followers = [], isLoading: followersLoading } = useGetFollowers(userId);
  const navigate = useNavigate();

  const isOwnProfile = identity?.getPrincipal().toString() === userId.toString();
  const isFollowing = identity ? followers.some(f => f.toString() === identity.getPrincipal().toString()) : false;

  const getAvatarUrl = () => {
    if (profile?.photo) {
      return profile.photo.getDirectURL();
    }
    return '/assets/generated/default-avatar.dim_256x256.png';
  };

  const formatGender = (gender: Gender) => {
    return gender.charAt(0).toUpperCase() + gender.slice(1);
  };

  const formatOrientation = (orientation: Orientation) => {
    return orientation.charAt(0).toUpperCase() + orientation.slice(1);
  };

  const formatRelationshipStatus = (status: RelationshipStatus) => {
    if (status === RelationshipStatus.looking) return 'Relationship';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (profileLoading || followersLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Profile not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-6">
          <Avatar className="h-24 w-24 md:h-32 md:w-32">
            <AvatarImage src={getAvatarUrl()} alt={profile.username} />
            <AvatarFallback className="text-2xl">{profile.username[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold">{profile.username}</h2>
                {profile.isAdmin && (
                  <Badge variant="secondary" className="text-xs">Admin</Badge>
                )}
              </div>
              {profile.bio && (
                <p className="text-muted-foreground mt-2">{profile.bio}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              {profile.city && profile.state && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.city}, {profile.state}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{formatGender(profile.gender)}</Badge>
              {profile.interests.length > 0 && (
                <Badge variant="outline">{formatOrientation(profile.interests[0])}</Badge>
              )}
              {profile.lookingFor.length > 0 && (
                <Badge variant="outline">Looking for: {formatRelationshipStatus(profile.lookingFor[0])}</Badge>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div>
                <span className="font-semibold">{followers.length}</span>
                <span className="text-muted-foreground ml-1">Followers</span>
              </div>
            </div>

            {!isOwnProfile && (
              <div className="flex gap-2">
                <FollowButton userId={userId} isFollowing={isFollowing} />
                <Button
                  variant="outline"
                  onClick={() => navigate({ to: '/conversation/$userId', params: { userId: userId.toString() } })}
                >
                  Message
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
