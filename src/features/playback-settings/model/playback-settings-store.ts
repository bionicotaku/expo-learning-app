import { create } from 'zustand';

export type PlaybackRate = 0.5 | 1 | 1.5 | 2;

export const DEFAULT_ARE_SUBTITLES_VISIBLE = true;
export const DEFAULT_PLAYBACK_RATE: PlaybackRate = 1;
export const PLAYBACK_RATE_OPTIONS = [0.5, 1, 1.5, 2] as const satisfies readonly PlaybackRate[];

export type PlaybackSettingsState = {
  areSubtitlesVisible: boolean;
  playbackRate: PlaybackRate;
  resetPlaybackRate: () => void;
  resetSubtitlesVisible: () => void;
  setPlaybackRate: (nextRate: PlaybackRate) => void;
  setSubtitlesVisible: (visible: boolean) => void;
  toggleSubtitlesVisible: () => void;
};

export const usePlaybackSettingsStore = create<PlaybackSettingsState>()((set) => ({
  areSubtitlesVisible: DEFAULT_ARE_SUBTITLES_VISIBLE,
  playbackRate: DEFAULT_PLAYBACK_RATE,
  resetPlaybackRate: () => {
    set({ playbackRate: DEFAULT_PLAYBACK_RATE });
  },
  resetSubtitlesVisible: () => {
    set({ areSubtitlesVisible: DEFAULT_ARE_SUBTITLES_VISIBLE });
  },
  setPlaybackRate: (nextRate) => {
    set({ playbackRate: nextRate });
  },
  setSubtitlesVisible: (visible) => {
    set({ areSubtitlesVisible: visible });
  },
  toggleSubtitlesVisible: () => {
    set((state) => ({ areSubtitlesVisible: !state.areSubtitlesVisible }));
  },
}));

export function useAreSubtitlesVisible() {
  return usePlaybackSettingsStore((state) => state.areSubtitlesVisible);
}

export function usePlaybackRate() {
  return usePlaybackSettingsStore((state) => state.playbackRate);
}

export function useSetPlaybackRate() {
  return usePlaybackSettingsStore((state) => state.setPlaybackRate);
}

export function useSetSubtitlesVisible() {
  return usePlaybackSettingsStore((state) => state.setSubtitlesVisible);
}

export function useToggleSubtitlesVisible() {
  return usePlaybackSettingsStore((state) => state.toggleSubtitlesVisible);
}
