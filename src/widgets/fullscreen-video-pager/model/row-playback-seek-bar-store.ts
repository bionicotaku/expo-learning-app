import type { FullscreenRowProgressSnapshot } from './row-progress-snapshot';

export type FullscreenRowSeekController = {
  seekTo(seconds: number): boolean;
};

export type RowPlaybackSeekBarStoreSnapshot = {
  progressSnapshot: FullscreenRowProgressSnapshot | null;
  seekController: FullscreenRowSeekController | null;
};

export type RowPlaybackSeekBarStore = {
  applyOptimisticSeek(targetSeconds: number): void;
  clear(): void;
  getSnapshot(): RowPlaybackSeekBarStoreSnapshot;
  setProgressSnapshot(snapshot: FullscreenRowProgressSnapshot | null): void;
  setSeekController(controller: FullscreenRowSeekController | null): void;
  subscribe(listener: () => void): () => void;
};

export function createRowPlaybackSeekBarStore(): RowPlaybackSeekBarStore {
  let snapshot: RowPlaybackSeekBarStoreSnapshot = {
    progressSnapshot: null,
    seekController: null,
  };
  const listeners = new Set<() => void>();

  function emit() {
    for (const listener of listeners) {
      listener();
    }
  }

  return {
    applyOptimisticSeek(targetSeconds) {
      if (!snapshot.progressSnapshot) {
        return;
      }

      const durationSeconds = snapshot.progressSnapshot.durationSeconds;
      const clampedSeconds = Math.max(0, Math.min(durationSeconds, targetSeconds));

      snapshot = {
        ...snapshot,
        progressSnapshot: {
          ...snapshot.progressSnapshot,
          currentTimeSeconds: clampedSeconds,
          playedRatio: durationSeconds > 0 ? clampedSeconds / durationSeconds : 0,
        },
      };
      emit();
    },
    clear() {
      if (!snapshot.progressSnapshot && !snapshot.seekController) {
        return;
      }

      snapshot = {
        progressSnapshot: null,
        seekController: null,
      };
      emit();
    },
    getSnapshot() {
      return snapshot;
    },
    setProgressSnapshot(progressSnapshot) {
      if (snapshot.progressSnapshot === progressSnapshot) {
        return;
      }

      snapshot = {
        ...snapshot,
        progressSnapshot,
      };
      emit();
    },
    setSeekController(seekController) {
      if (snapshot.seekController === seekController) {
        return;
      }

      snapshot = {
        ...snapshot,
        seekController,
      };
      emit();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
