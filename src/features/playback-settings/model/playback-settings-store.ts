import { create } from 'zustand';

export type PlaybackRate = 0.5 | 1 | 1.5 | 2;

export const DEFAULT_PLAYBACK_RATE: PlaybackRate = 1;
export const PLAYBACK_RATE_OPTIONS = [0.5, 1, 1.5, 2] as const satisfies readonly PlaybackRate[];

export type PlaybackSettingsState = {
  playbackRate: PlaybackRate;
  resetPlaybackRate: () => void;
  setPlaybackRate: (nextRate: PlaybackRate) => void;
};

export const usePlaybackSettingsStore = create<PlaybackSettingsState>()((set) => ({
  playbackRate: DEFAULT_PLAYBACK_RATE,
  resetPlaybackRate: () => {
    set({ playbackRate: DEFAULT_PLAYBACK_RATE });
  },
  setPlaybackRate: (nextRate) => {
    set({ playbackRate: nextRate });
  },
}));

export function usePlaybackRate() {
  return usePlaybackSettingsStore((state) => state.playbackRate);
}

export function useSetPlaybackRate() {
  return usePlaybackSettingsStore((state) => state.setPlaybackRate);
}
