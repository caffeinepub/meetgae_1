import { Principal } from '@dfinity/principal';

export const queryKeys = {
  profile: {
    caller: ['currentUserProfile'] as const,
    user: (userId: Principal) => ['userProfile', userId.toString()] as const,
  },
  follows: {
    followers: (userId: Principal) => ['followers', userId.toString()] as const,
  },
  posts: {
    feed: ['feed'] as const,
    byUser: (userId: Principal) => ['posts', userId.toString()] as const,
    comments: (postId: bigint) => ['postComments', postId.toString()] as const,
    likedByCaller: (postId: bigint) => ['postLikedByCaller', postId.toString()] as const,
  },
  messages: {
    conversations: ['conversations'] as const,
    conversation: (partnerId: Principal) => ['conversation', partnerId.toString()] as const,
  },
  discovery: {
    users: ['discoveryUsers'] as const,
  },
  admin: {
    isAdmin: ['isCallerAdmin'] as const,
    employees: ['employees'] as const,
  },
};
