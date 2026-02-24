import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetPostsByUser, useIsCallerAdmin } from '../hooks/useQueries';
import ProfileEditor from '../components/profile/ProfileEditor';
import PostList from '../components/posts/PostList';
import PlanStatusCard from '../components/profile/PlanStatusCard';
import AdminEmployeesSection from '../components/admin/AdminEmployeesSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { Gender, Orientation, RelationshipStatus } from '../backend';

export default function ProfileMePage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: posts = [], isLoading: postsLoading } = useGetPostsByUser(
    identity?.getPrincipal() || null
  );

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/' });
    }
  }, [identity, navigate]);

  if (!identity) {
    return null;
  }

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">My Profile</h1>

      <Tabs defaultValue="edit" className="w-full">
        <TabsList className={`grid w-full max-w-md ${isAdmin ? 'grid-cols-4' : 'grid-cols-3'}`}>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
        </TabsList>

        <TabsContent value="edit" className="mt-6">
          <ProfileEditor />
        </TabsContent>

        <TabsContent value="info" className="mt-6 space-y-6">
          {userProfile && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Profile Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Username:</span>
                      <span className="text-sm font-medium">{userProfile.username}</span>
                    </div>
                    {userProfile.bio && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Bio:</span>
                        <span className="text-sm font-medium text-right max-w-xs">{userProfile.bio}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Gender:</span>
                      <span className="text-sm font-medium">{formatGender(userProfile.gender)}</span>
                    </div>
                    {userProfile.city && userProfile.state && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Location:</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="text-sm font-medium">{userProfile.city}, {userProfile.state}</span>
                        </div>
                      </div>
                    )}
                    {userProfile.interests.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Interests:</span>
                        <Badge variant="outline">{formatOrientation(userProfile.interests[0])}</Badge>
                      </div>
                    )}
                    {userProfile.lookingFor.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Looking For:</span>
                        <Badge variant="outline">{formatRelationshipStatus(userProfile.lookingFor[0])}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <PlanStatusCard />
        </TabsContent>

        <TabsContent value="posts" className="mt-6">
          <PostList posts={posts} isLoading={postsLoading} />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="admin" className="mt-6">
            <AdminEmployeesSection />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
