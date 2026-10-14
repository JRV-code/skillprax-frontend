'use client';

import { useSyncExternalStore } from 'react';

export type PlayerState = 'HIDDEN' | 'MODAL' | 'DOCKED';

export interface ActiveVideo {
  videoId: string;
  resourceId?: string;
  title: string;
  channel?: string;
  startSeconds?: number;
}

export interface PlayerStoreState {
  state: PlayerState;
  activeVideo: ActiveVideo | null;
  savedSeconds: number;
  duration: number;
  watched: boolean;
  isPlaying: boolean;
  error: { code: number; message: string } | null;
}

export interface PlayerStoreActions {
  openVideo: (video: ActiveVideo) => void;
  dockVideo: () => void;
  expandVideo: () => void;
  closeVideo: () => void;
  setPlaying: (playing: boolean) => void;
  setProgress: (seconds: number, duration: number, watched: boolean) => void;
  setError: (err: { code: number; message: string } | null) => void;
}

export type PlayerStore = PlayerStoreState & PlayerStoreActions;

let currentState: PlayerStoreState = {
  state: 'HIDDEN',
  activeVideo: null,
  savedSeconds: 0,
  duration: 0,
  watched: false,
  isPlaying: false,
  error: null,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function set(partial: Partial<PlayerStoreState>) {
  currentState = { ...currentState, ...partial };
  notify();
}

const actions: PlayerStoreActions = {
  openVideo: (video: ActiveVideo) =>
    set({
      state: 'MODAL',
      activeVideo: video,
      savedSeconds: video.startSeconds || 0,
      error: null,
    }),
  dockVideo: () => set({ state: 'DOCKED' }),
  expandVideo: () => set({ state: 'MODAL' }),
  closeVideo: () => set({ state: 'HIDDEN', isPlaying: false, error: null }),
  setPlaying: (playing: boolean) => set({ isPlaying: playing }),
  setProgress: (seconds: number, duration: number, watched: boolean) =>
    set({ savedSeconds: seconds, duration, watched }),
  setError: (error: { code: number; message: string } | null) => set({ error }),
};

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): PlayerStoreState {
  return currentState;
}

export function usePlayerStore(): PlayerStore {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    ...state,
    ...actions,
  };
}

usePlayerStore.getState = (): PlayerStore => ({
  ...currentState,
  ...actions,
});

usePlayerStore.setState = (partial: Partial<PlayerStoreState>) => {
  set(partial);
};
