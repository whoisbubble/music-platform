import { create } from "zustand";
import { authApiFetch } from "@/lib/api";
import type { CollectionState } from "@/types";

interface CollectionStoreState {
  albumIds: number[];
  songIds: number[];
  isLoaded: boolean;
  isLoading: boolean;
  pendingKeys: string[];
  refresh: () => Promise<void>;
  addAlbum: (albumId: number) => Promise<void>;
  removeAlbum: (albumId: number) => Promise<void>;
  addSong: (songId: number) => Promise<void>;
  removeSong: (songId: number) => Promise<void>;
  reset: () => void;
}

function pendingKey(type: "album" | "song", id: number) {
  return `${type}:${id}`;
}

export const useCollectionStore = create<CollectionStoreState>((set) => ({
  albumIds: [],
  songIds: [],
  isLoaded: false,
  isLoading: false,
  pendingKeys: [],

  refresh: async () => {
    set({ isLoading: true });

    try {
      const state = await authApiFetch<CollectionState>("/collections/me/state");
      set({
        albumIds: state.albumIds,
        songIds: state.songIds,
        isLoaded: true,
        isLoading: false,
      });
    } catch {
      set({
        albumIds: [],
        songIds: [],
        isLoaded: false,
        isLoading: false,
      });
    }
  },

  addAlbum: async (albumId) => {
    const key = pendingKey("album", albumId);
    set((state) => ({ pendingKeys: [...state.pendingKeys, key] }));

    try {
      await authApiFetch(`/collections/me/albums/${albumId}`, { method: "POST" });
      set((state) => ({
        albumIds: state.albumIds.includes(albumId) ? state.albumIds : [...state.albumIds, albumId],
      }));
    } finally {
      set((state) => ({ pendingKeys: state.pendingKeys.filter((item) => item !== key) }));
    }
  },

  removeAlbum: async (albumId) => {
    const key = pendingKey("album", albumId);
    set((state) => ({ pendingKeys: [...state.pendingKeys, key] }));

    try {
      await authApiFetch(`/collections/me/albums/${albumId}`, { method: "DELETE" });
      set((state) => ({
        albumIds: state.albumIds.filter((id) => id !== albumId),
      }));
    } finally {
      set((state) => ({ pendingKeys: state.pendingKeys.filter((item) => item !== key) }));
    }
  },

  addSong: async (songId) => {
    const key = pendingKey("song", songId);
    set((state) => ({ pendingKeys: [...state.pendingKeys, key] }));

    try {
      await authApiFetch(`/collections/me/songs/${songId}`, { method: "POST" });
      set((state) => ({
        songIds: state.songIds.includes(songId) ? state.songIds : [...state.songIds, songId],
      }));
    } finally {
      set((state) => ({ pendingKeys: state.pendingKeys.filter((item) => item !== key) }));
    }
  },

  removeSong: async (songId) => {
    const key = pendingKey("song", songId);
    set((state) => ({ pendingKeys: [...state.pendingKeys, key] }));

    try {
      await authApiFetch(`/collections/me/songs/${songId}`, { method: "DELETE" });
      set((state) => ({
        songIds: state.songIds.filter((id) => id !== songId),
      }));
    } finally {
      set((state) => ({ pendingKeys: state.pendingKeys.filter((item) => item !== key) }));
    }
  },

  reset: () => {
    set({
      albumIds: [],
      songIds: [],
      isLoaded: false,
      isLoading: false,
      pendingKeys: [],
    });
  },
}));
