import { create } from 'zustand';

export type PlaybackRate = 0.5 | 1 | 1.5 | 2;
export type SubtitleDisplayMode = 'off' | 'english' | 'bilingual';

export const DEFAULT_PLAYBACK_RATE: PlaybackRate = 1;
export const DEFAULT_SUBTITLE_DISPLAY_MODE: SubtitleDisplayMode = 'english';
export const DEFAULT_VIDEO_DETAILS_VISIBLE = true;
export const PLAYBACK_RATE_OPTIONS = [0.5, 1, 1.5, 2] as const satisfies readonly PlaybackRate[];

export type PlaybackSettingsState = {
  cycleSubtitleDisplayMode: () => void;
  playbackRate: PlaybackRate;
  resetPlaybackRate: () => void;
  resetSubtitleDisplayMode: () => void;
  resetVideoDetailsVisible: () => void;
  setPlaybackRate: (nextRate: PlaybackRate) => void;
  setSubtitleDisplayMode: (mode: SubtitleDisplayMode) => void;
  setVideoDetailsVisible: (nextVisible: boolean) => void;
  subtitleDisplayMode: SubtitleDisplayMode;
  toggleVideoDetailsVisible: () => void;
  videoDetailsVisible: boolean;
};

export const usePlaybackSettingsStore = create<PlaybackSettingsState>()((set) => ({
  cycleSubtitleDisplayMode: () => {
    set((state) => ({
      subtitleDisplayMode:
        state.subtitleDisplayMode === 'off'
          ? 'english'
          : state.subtitleDisplayMode === 'english'
            ? 'bilingual'
            : 'off',
    }));
  },
  playbackRate: DEFAULT_PLAYBACK_RATE,
  subtitleDisplayMode: DEFAULT_SUBTITLE_DISPLAY_MODE,
  videoDetailsVisible: DEFAULT_VIDEO_DETAILS_VISIBLE,
  resetPlaybackRate: () => {
    set({ playbackRate: DEFAULT_PLAYBACK_RATE });
  },
  resetSubtitleDisplayMode: () => {
    set({ subtitleDisplayMode: DEFAULT_SUBTITLE_DISPLAY_MODE });
  },
  resetVideoDetailsVisible: () => {
    set({ videoDetailsVisible: DEFAULT_VIDEO_DETAILS_VISIBLE });
  },
  setPlaybackRate: (nextRate) => {
    set({ playbackRate: nextRate });
  },
  setSubtitleDisplayMode: (mode) => {
    set({ subtitleDisplayMode: mode });
  },
  setVideoDetailsVisible: (nextVisible) => {
    set({ videoDetailsVisible: nextVisible });
  },
  toggleVideoDetailsVisible: () => {
    set((state) => ({ videoDetailsVisible: !state.videoDetailsVisible }));
  },
}));

export function useCycleSubtitleDisplayMode() {
  return usePlaybackSettingsStore((state) => state.cycleSubtitleDisplayMode);
}

export function usePlaybackRate() {
  return usePlaybackSettingsStore((state) => state.playbackRate);
}

export function useSetPlaybackRate() {
  return usePlaybackSettingsStore((state) => state.setPlaybackRate);
}

export function useSetSubtitleDisplayMode() {
  return usePlaybackSettingsStore((state) => state.setSubtitleDisplayMode);
}

export function useSubtitleDisplayMode() {
  return usePlaybackSettingsStore((state) => state.subtitleDisplayMode);
}

export function useSetVideoDetailsVisible() {
  return usePlaybackSettingsStore((state) => state.setVideoDetailsVisible);
}

export function useToggleVideoDetailsVisible() {
  return usePlaybackSettingsStore((state) => state.toggleVideoDetailsVisible);
}

export function useVideoDetailsVisible() {
  return usePlaybackSettingsStore((state) => state.videoDetailsVisible);
}
