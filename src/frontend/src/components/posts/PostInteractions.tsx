import { useState } from 'react';
import { useGetPostComments, useCommentPost, useLikePost, useGetUserProfile } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';
import type { Post } from '../../backend';

interface PostInteractionsProps {
  post: Post;
}

export default function PostInteractions({ post }: PostInteractionsProps) {
  const { identity } = useInternetIdentity();
  const { data: comments = [], isLoading: commentsLoading } = useGetPostComments(post.id);
  const likeMutation = useLikePost();
  const commentMutation = useCommentPost();
  const [commentContent, setCommentContent] = useState('');
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    if (!identity) {
      toast.error('Please sign in to like posts');
      return;
    }

    try {
      await likeMutation.mutateAsync(post.id);
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to like post';
      if (errorMsg.includes('Already liked')) {
        toast.error('You already liked this post');
      } else {
        toast.error(errorMsg);
      }
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identity) {
      toast.error('Please sign in to comment');
      return;
    }

    if (!commentContent.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      await commentMutation.mutateAsync({ postId: post.id, content: commentContent.trim() });
      setCommentContent('');
      toast.success('Comment added');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add comment');
    }
  };

  return (
    <div className="mt-4 space-y-3">
      <Separator />
      
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={likeMutation.isPending}
          className="gap-2 text-muted-foreground hover:text-primary"
        >
          {likeMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart className="h-4 w-4" />
          )}
          <span>{Number(post.likeCount)}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className="gap-2 text-muted-foreground hover:text-primary"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{Number(post.commentCount)}</span>
        </Button>
      </div>

      {showComments && (
        <div className="space-y-3 pt-2">
          <form onSubmit={handleComment} className="flex gap-2">
            <Input
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Add a comment..."
              maxLength={200}
              disabled={commentMutation.isPending}
            />
            <Button
              type="submit"
              size="icon"
              disabled={commentMutation.isPending || !commentContent.trim()}
            >
              {commentMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>

          {commentsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <CommentItem key={comment.id.toString()} comment={comment} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CommentItem({ comment }: { comment: any }) {
  const { data: authorProfile } = useGetUserProfile(comment.author);

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

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex gap-2">
      <Link to="/profile/$userId" params={{ userId: comment.author.toString() }}>
        <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
          <AvatarImage src={getAvatarUrl()} alt={authorProfile?.username} />
          <AvatarFallback>{authorProfile?.username?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1 bg-muted rounded-lg px-3 py-2">
        <div className="flex items-center gap-2">
          <Link to="/profile/$userId" params={{ userId: comment.author.toString() }}>
            <span className="text-sm font-semibold hover:underline cursor-pointer">
              {authorProfile?.username || 'Unknown User'}
            </span>
          </Link>
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(comment.timestamp)}
          </span>
        </div>
        <p className="text-sm mt-1 break-words">{comment.content}</p>
      </div>
    </div>
  );
}
