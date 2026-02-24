import { Post, PostContent } from '../../backend';
import { useDeletePost, useGetUserProfile } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import PostInteractions from './PostInteractions';

interface PostListProps {
  posts: Post[];
  isLoading?: boolean;
}

function PostItem({ post }: { post: Post }) {
  const { identity } = useInternetIdentity();
  const { data: authorProfile } = useGetUserProfile(post.author);
  const deleteMutation = useDeletePost();

  const isAuthor = identity?.getPrincipal().toString() === post.author.toString();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(post.id);
      toast.success('Post deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete post');
    }
  };

  const getAvatarUrl = () => {
    if (authorProfile?.photo) {
      return authorProfile.photo.getDirectURL();
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
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderPostContent = (content: PostContent) => {
    if (content.__kind__ === 'text') {
      return (
        <p className="mt-2 whitespace-pre-wrap break-words">
          {content.text.content}
        </p>
      );
    } else if (content.__kind__ === 'photo') {
      return (
        <div className="mt-2 space-y-2">
          <img
            src={content.photo.photo.getDirectURL()}
            alt="Post photo"
            className="w-full rounded-lg object-cover max-h-96"
          />
          {content.photo.caption && (
            <p className="whitespace-pre-wrap break-words text-sm">
              {content.photo.caption}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-3">
          <Link to="/profile/$userId" params={{ userId: post.author.toString() }}>
            <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarImage src={getAvatarUrl()} alt={authorProfile?.username} />
              <AvatarFallback>{authorProfile?.username?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link to="/profile/$userId" params={{ userId: post.author.toString() }}>
                  <h4 className="font-semibold hover:underline cursor-pointer">
                    {authorProfile?.username || 'Unknown User'}
                  </h4>
                </Link>
                <p className="text-xs text-muted-foreground">
                  {formatTimestamp(post.timestamp)}
                </p>
              </div>

              {isAuthor && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Post?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your post.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            {renderPostContent(post.content)}

            <PostInteractions post={post} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PostList({ posts, isLoading }: PostListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No posts yet. Be the first to share something!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostItem key={post.id.toString()} post={post} />
      ))}
    </div>
  );
}
