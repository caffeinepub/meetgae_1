import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { queryKeys } from './queryKeys';
import type { UserProfile, Post, ConversationView, Message, PostComment, EmployeeView } from '../backend';
import { Principal } from '@dfinity/principal';
import { ExternalBlob } from '../backend';

// Profile queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: queryKeys.profile.caller,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetUserProfile(userId: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: userId ? queryKeys.profile.user(userId) : ['userProfile', 'null'],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getUserProfile(userId);
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.caller });
    },
  });
}

export function useUploadProfilePhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photo: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      await actor.uploadPhoto(photo, true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.caller });
    },
  });
}

// Follow queries
export function useGetFollowers(userId: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: userId ? queryKeys.follows.followers(userId) : ['followers', 'null'],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getFollowers(userId);
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useFollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUser: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.followUser(targetUser);
    },
    onSuccess: (_, targetUser) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.follows.followers(targetUser) });
    },
  });
}

export function useUnfollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUser: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.unfollowUser(targetUser);
    },
    onSuccess: (_, targetUser) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.follows.followers(targetUser) });
    },
  });
}

// Post queries
export function useGetFeed() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: queryKeys.posts.feed,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeed();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetPostsByUser(userId: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: userId ? queryKeys.posts.byUser(userId) : ['posts', 'null'],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getPostsByUser(userId);
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createPost(content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.feed });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.caller });
      if (identity) {
        queryClient.invalidateQueries({ queryKey: queryKeys.posts.byUser(identity.getPrincipal()) });
      }
    },
  });
}

export function useCreatePhotoPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async ({ photo, caption }: { photo: ExternalBlob; caption: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createPhotoPost(photo, caption);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.feed });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.caller });
      if (identity) {
        queryClient.invalidateQueries({ queryKey: queryKeys.posts.byUser(identity.getPrincipal()) });
      }
    },
  });
}

export function useDeletePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deletePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.feed });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.caller });
    },
  });
}

// Like queries
export function useLikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.likePost(postId);
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.feed });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.likedByCaller(postId) });
    },
  });
}

// Comment queries
export function useGetPostComments(postId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PostComment[]>({
    queryKey: postId ? queryKeys.posts.comments(postId) : ['postComments', 'null'],
    queryFn: async () => {
      if (!actor || postId === null) return [];
      return actor.getPostComments(postId);
    },
    enabled: !!actor && !actorFetching && postId !== null,
  });
}

export function useCommentPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: bigint; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.commentPost(postId, content);
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.comments(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.feed });
    },
  });
}

// Message queries
export function useGetAllConversations() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<ConversationView[]>({
    queryKey: queryKeys.messages.conversations,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllConversations();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useGetConversation(partnerId: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Message[] | null>({
    queryKey: partnerId ? queryKeys.messages.conversation(partnerId) : ['conversation', 'null'],
    queryFn: async () => {
      if (!actor || !partnerId) return null;
      return actor.getConversation(partnerId);
    },
    enabled: !!actor && !actorFetching && !!identity && !!partnerId,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ to, content }: { to: Principal; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.sendMessage(to, content);
    },
    onSuccess: (_, { to }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.conversations });
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.conversation(to) });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.caller });
    },
  });
}

// Discovery query
export function useGetDiscoveryUsers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile[]>({
    queryKey: queryKeys.discovery.users,
    queryFn: async () => {
      if (!actor) return [];
      const feed = await actor.getFeed();
      const uniqueAuthors = new Set<string>();
      const profiles: UserProfile[] = [];

      for (const post of feed) {
        const authorId = post.author.toString();
        if (!uniqueAuthors.has(authorId)) {
          uniqueAuthors.add(authorId);
          const profile = await actor.getUserProfile(post.author);
          if (profile) {
            profiles.push(profile);
          }
        }
      }

      return profiles;
    },
    enabled: !!actor && !actorFetching,
  });
}

// Admin queries
export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: queryKeys.admin.isAdmin,
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useGetEmployees() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<EmployeeView[]>({
    queryKey: queryKeys.admin.employees,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getEmployees();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newAdmin: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addAdmin(newAdmin);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.employees });
    },
  });
}
