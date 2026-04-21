import { describe, expect, it } from 'vitest';

import {
  createRowPlaybackSeekBarStore,
  type FullscreenRowSeekController,
} from './row-playback-seek-bar-store';

describe('row playback seek bar store', () => {
  it('stores progress snapshots and seek controller references', () => {
    const store = createRowPlaybackSeekBarStore();
    const seekController: FullscreenRowSeekController = {
      seekTo: () => true,
    };

    store.setProgressSnapshot({
      bufferedPositionSeconds: 36,
      bufferedRatio: 0.6,
      currentTimeSeconds: 12,
      durationSeconds: 60,
      playedRatio: 0.2,
    });
    store.setSeekController(seekController);

    expect(store.getSnapshot()).toEqual({
      progressSnapshot: {
        bufferedPositionSeconds: 36,
        bufferedRatio: 0.6,
        currentTimeSeconds: 12,
        durationSeconds: 60,
        playedRatio: 0.2,
      },
      seekController,
    });
  });

  it('applies optimistic seek without changing duration or buffered progress', () => {
    const store = createRowPlaybackSeekBarStore();

    store.setProgressSnapshot({
      bufferedPositionSeconds: 36,
      bufferedRatio: 0.6,
      currentTimeSeconds: 12,
      durationSeconds: 60,
      playedRatio: 0.2,
    });

    store.applyOptimisticSeek(45);

    expect(store.getSnapshot().progressSnapshot).toEqual({
      bufferedPositionSeconds: 36,
      bufferedRatio: 0.6,
      currentTimeSeconds: 45,
      durationSeconds: 60,
      playedRatio: 0.75,
    });
  });

  it('clears progress and controller together', () => {
    const store = createRowPlaybackSeekBarStore();

    store.setProgressSnapshot({
      bufferedPositionSeconds: 36,
      bufferedRatio: 0.6,
      currentTimeSeconds: 12,
      durationSeconds: 60,
      playedRatio: 0.2,
    });
    store.setSeekController({
      seekTo: () => true,
    });

    store.clear();

    expect(store.getSnapshot()).toEqual({
      progressSnapshot: null,
      seekController: null,
    });
  });

  it('does not emit when clearing an already empty store', () => {
    const store = createRowPlaybackSeekBarStore();
    let emitCount = 0;

    const unsubscribe = store.subscribe(() => {
      emitCount += 1;
    });

    store.clear();
    unsubscribe();

    expect(emitCount).toBe(0);
  });

  it('does not emit when reusing the same snapshot or controller reference', () => {
    const store = createRowPlaybackSeekBarStore();
    let emitCount = 0;
    const progressSnapshot = {
      bufferedPositionSeconds: 36,
      bufferedRatio: 0.6,
      currentTimeSeconds: 12,
      durationSeconds: 60,
      playedRatio: 0.2,
    };
    const seekController: FullscreenRowSeekController = {
      seekTo: () => true,
    };

    const unsubscribe = store.subscribe(() => {
      emitCount += 1;
    });

    store.setProgressSnapshot(progressSnapshot);
    store.setProgressSnapshot(progressSnapshot);
    store.setSeekController(seekController);
    store.setSeekController(seekController);
    unsubscribe();

    expect(emitCount).toBe(2);
  });
});
