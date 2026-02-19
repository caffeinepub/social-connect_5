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
export interface Reel {
    id: string;
    video: ExternalBlob;
    author: Principal;
    timestamp: Time;
    caption: string;
}
export type Time = bigint;
export interface Story {
    id: string;
    content: ExternalBlob;
    expiresAt: Time;
    author: Principal;
    timestamp: Time;
}
export interface Message {
    text: string;
    recipient: Principal;
    sender: Principal;
    timestamp: Time;
}
export interface UserProfile {
    bio: string;
    username: string;
    displayName: string;
    followerCount: bigint;
    followingCount: bigint;
    profilePicture: ExternalBlob;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addReel(video: ExternalBlob, caption: string): Promise<void>;
    addStory(content: ExternalBlob): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteReel(reelId: string): Promise<void>;
    deleteStory(storyId: string): Promise<void>;
    followUser(target: Principal): Promise<void>;
    getAllReels(): Promise<Array<Reel>>;
    getAllStories(): Promise<Array<Story>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFollowers(user: Principal): Promise<Array<Principal>>;
    getFollowing(user: Principal): Promise<Array<Principal>>;
    getMessages(otherUser: Principal): Promise<Array<Message>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(recipient: Principal, text: string): Promise<void>;
    unfollowUser(target: Principal): Promise<void>;
}
