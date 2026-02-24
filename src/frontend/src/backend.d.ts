import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type CommentId = bigint;
export type Time = bigint;
export type PostId = bigint;
export interface TextPost {
    content: string;
}
export type PostContent = {
    __kind__: "text";
    text: TextPost;
} | {
    __kind__: "photo";
    photo: PhotoPost;
};
export interface EmployeeView {
    id: UserId;
    username: string;
    city: string;
    state: string;
    photo?: ExternalBlob;
}
export interface ConversationView {
    id: ConversationId;
    participant1: UserId;
    participant2: UserId;
    messages: Array<Message>;
}
export type UserId = Principal;
export type ConversationId = bigint;
export type MessageId = bigint;
export interface Post {
    id: PostId;
    likeCount: bigint;
    content: PostContent;
    author: UserId;
    timestamp: Time;
    commentCount: bigint;
}
export interface PostComment {
    id: CommentId;
    content: string;
    author: UserId;
    timestamp: Time;
    postId: PostId;
}
export interface Message {
    id: MessageId;
    content: string;
    sender: UserId;
    timestamp: Time;
}
export interface PhotoPost {
    caption: string;
    photo: ExternalBlob;
}
export interface UserProfile {
    id: UserId;
    bio: string;
    messageCountDaily: bigint;
    lastActivityDay: bigint;
    username: string;
    subscription: Subscription;
    interests: Array<Orientation>;
    city: string;
    lookingFor: Array<RelationshipStatus>;
    state: string;
    gender: Gender;
    isAdmin: boolean;
    photo?: ExternalBlob;
    postCountDaily: bigint;
}
export enum Gender {
    other = "other",
    female = "female",
    male = "male"
}
export enum Orientation {
    top = "top",
    lesbian = "lesbian",
    bottom = "bottom",
    versatile = "versatile"
}
export enum RelationshipStatus {
    fun = "fun",
    looking = "looking",
    casual = "casual"
}
export enum Subscription {
    pro = "pro",
    free = "free"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAdmin(newAdmin: UserId): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    commentPost(postId: PostId, content: string): Promise<void>;
    createPhotoPost(photo: ExternalBlob, caption: string | null): Promise<void>;
    createPost(content: string): Promise<void>;
    deletePost(postId: PostId): Promise<void>;
    followUser(targetUser: UserId): Promise<void>;
    getAllConversations(): Promise<Array<ConversationView>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getConversation(partner: UserId): Promise<Array<Message> | null>;
    getEmployees(): Promise<Array<EmployeeView>>;
    getFeed(): Promise<Array<Post>>;
    getFollowers(userId: UserId): Promise<Array<UserId>>;
    getPost(postId: PostId): Promise<Post | null>;
    getPostComments(postId: PostId): Promise<Array<PostComment>>;
    getPostsByUser(userId: UserId): Promise<Array<Post>>;
    getUserProfile(userId: UserId): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    likePost(postId: PostId): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(to: UserId, content: string): Promise<void>;
    unfollowUser(targetUser: UserId): Promise<void>;
    uploadPhoto(photo: ExternalBlob, b: boolean): Promise<void>;
}
