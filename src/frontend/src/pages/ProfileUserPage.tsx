import { useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetPostsByUser } from '../hooks/useQueries';
import ProfileHeader from '../components/profile/ProfileHeader';
import PostList from '../components/posts/PostList';
import { Principal } from '@dfinity/principal';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ProfileUserPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { userId } = useParams({ from: '/profile/$userId' });

  let userPrincipal: Principal | null = null;
  try {
    userPrincipal = Principal.fromText(userId);
  } catch (e) {
    console.error('Invalid principal:', userId);
  }

  const { data: posts = [], isLoading: postsLoading } = useGetPostsByUser(userPrincipal);

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/' });
    }
  }, [identity, navigate]);

  if (!identity || !userPrincipal) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/discovery' })} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Discovery
      </Button>

      <ProfileHeader userId={userPrincipal} />

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Posts</h2>
        <PostList posts={posts} isLoading={postsLoading} />
      </div>
    </div>
  );
}
