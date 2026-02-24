import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetFeed } from '../hooks/useQueries';
import PostComposer from '../components/posts/PostComposer';
import PostList from '../components/posts/PostList';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function FeedPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: posts = [], isLoading, refetch } = useGetFeed();

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/' });
    }
  }, [identity, navigate]);

  if (!identity) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Feed</h1>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <PostComposer />

      <div className="pt-2">
        <PostList posts={posts} isLoading={isLoading} />
      </div>
    </div>
  );
}
