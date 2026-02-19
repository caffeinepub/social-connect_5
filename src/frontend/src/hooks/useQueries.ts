import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, Story, Reel, Message } from '../backend';
import { ExternalBlob } from '../backend';
import { Principal } from '@dfinity/principal';

// User Profile Hooks
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
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

export function useGetUserProfile(principal: Principal | string) {
  const { actor, isFetching: actorFetching } = useActor();
  const principalObj = typeof principal === 'string' ? Principal.fromText(principal) : principal;

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', principalObj.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUserProfile(principalObj);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Follow System Hooks
export function useGetFollowers(principal: Principal | string) {
  const { actor, isFetching: actorFetching } = useActor();
  const principalObj = typeof principal === 'string' ? Principal.fromText(principal) : principal;

  return useQuery<Principal[]>({
    queryKey: ['followers', principalObj.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFollowers(principalObj);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetFollowing(principal: Principal | string) {
  const { actor, isFetching: actorFetching } = useActor();
  const principalObj = typeof principal === 'string' ? Principal.fromText(principal) : principal;

  return useQuery<Principal[]>({
    queryKey: ['following', principalObj.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFollowing(principalObj);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useFollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (target: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.followUser(target);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
}

export function useUnfollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (target: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unfollowUser(target);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
}

// Stories Hooks
export function useGetAllStories() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Story[]>({
    queryKey: ['stories'],
    queryFn: async () => {
      if (!actor) return [];
      const stories = await actor.getAllStories();
      const now = Date.now() * 1_000_000;
      return stories.filter(s => Number(s.expiresAt) > now);
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30000,
  });
}

export function useAddStory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addStory(content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });
}

export function useDeleteStory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storyId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteStory(storyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });
}

// Reels Hooks
export function useGetAllReels() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Reel[]>({
    queryKey: ['reels'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllReels();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30000,
  });
}

export function useAddReel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ video, caption }: { video: ExternalBlob; caption: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addReel(video, caption);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reels'] });
    },
  });
}

export function useDeleteReel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reelId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteReel(reelId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reels'] });
    },
  });
}

// Messages Hooks
export function useGetMessages(otherUser: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['messages', otherUser?.toString()],
    queryFn: async () => {
      if (!actor || !otherUser) return [];
      return actor.getMessages(otherUser);
    },
    enabled: !!actor && !actorFetching && !!otherUser,
    refetchInterval: 5000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recipient, text }: { recipient: Principal; text: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessage(recipient, text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

