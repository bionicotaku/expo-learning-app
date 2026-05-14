import { beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import type { Transcript } from '@/entities/transcript';
import type { VideoListItem } from '@/entities/video';
import { usePlaybackSettingsStore } from '@/features/playback-settings/model/playback-settings-store';

import { useFullscreenPlaybackSession } from './use-fullscreen-playback-session';

const items: VideoListItem[] = [
  {
    coverImageUrl: null,
    description: 'desc 1',
    durationSeconds: 10,
    favoriteCount: 1,
    likeCount: 10,
    tags: [],
    title: 'Video 1',
    videoId: 'video-a',
    videoUrl: 'https://example.com/a.m3u8',
    viewCount: 1,
  },
  {
    coverImageUrl: null,
    description: 'desc 2',
    durationSeconds: 20,
    favoriteCount: 2,
    likeCount: 20,
    tags: [],
    title: 'Video 2',
    videoId: 'video-b',
    videoUrl: 'https://example.com/b.m3u8',
    viewCount: 2,
  },
];

type FullscreenPlaybackSession = ReturnType<typeof useFullscreenPlaybackSession>;
type ViewabilityHandler = (args: {
  viewableItems: {
    index?: number | null;
    isViewable?: boolean;
    item?: VideoListItem | null;
  }[];
}) => void;
type SessionWithViewability = FullscreenPlaybackSession & {
  handleViewableItemsChanged?: ViewabilityHandler;
};

function SessionHarness({
  activeTranscript = null,
  createWatchSessionId,
  onActiveVideoChange,
}: {
  activeTranscript?: Transcript | null;
  createWatchSessionId?: () => string;
  onActiveVideoChange: (itemId: string, index: number) => void;
}) {
  latestSession = useFullscreenPlaybackSession({
    activeTranscript,
    createWatchSessionId,
    items,
    onActiveVideoChange,
  }) as SessionWithViewability;

  return React.createElement('SessionHarness');
}

let latestSession: SessionWithViewability | null = null;

const activeTranscript: Transcript = {
  sentences: [
    {
      end: 2_000,
      explanation: 'first',
      index: 0,
      start: 1_000,
      text: 'First sentence.',
      tokens: [],
    },
    {
      end: 4_000,
      explanation: 'second',
      index: 1,
      start: 3_000,
      text: 'Second sentence.',
      tokens: [],
    },
    {
      end: 7_000,
      explanation: 'third',
      index: 2,
      start: 6_000,
      text: 'Third sentence.',
      tokens: [],
    },
  ],
};

function createActiveController({
  currentTimeSeconds,
  durationSeconds,
}: {
  currentTimeSeconds: number | null;
  durationSeconds: number | null;
}) {
  return {
    getCurrentTimeSeconds: vi.fn(() => currentTimeSeconds),
    getDurationSeconds: vi.fn(() => durationSeconds),
    seekBy: vi.fn(() => true),
    seekTo: vi.fn(() => true),
    surfaceState: 'ready' as const,
  };
}

describe('useFullscreenPlaybackSession runtime', () => {
  beforeEach(() => {
    latestSession = null;
    usePlaybackSettingsStore.getState().resetPlaybackRate();
  });

  it('keeps a stable viewability handler while committing active video changes', () => {
    const onActiveVideoChange = vi.fn();

    act(() => {
      TestRenderer.create(
        <SessionHarness onActiveVideoChange={onActiveVideoChange} />
      );
    });

    const initialHandler = latestSession?.handleViewableItemsChanged;
    expect(initialHandler).toEqual(expect.any(Function));

    act(() => {
      initialHandler?.({
        viewableItems: [
          {
            index: 0,
            isViewable: true,
            item: items[0],
          },
        ],
      });
    });

    expect(onActiveVideoChange).toHaveBeenCalledTimes(1);
    expect(onActiveVideoChange).toHaveBeenLastCalledWith('video-a', 0);
    expect(latestSession?.activeIndex).toBe(0);
    expect(latestSession?.handleViewableItemsChanged).toBe(initialHandler);

    act(() => {
      initialHandler?.({
        viewableItems: [
          {
            index: 0,
            isViewable: true,
            item: items[0],
          },
        ],
      });
    });

    expect(onActiveVideoChange).toHaveBeenCalledTimes(1);
    expect(latestSession?.handleViewableItemsChanged).toBe(initialHandler);

    act(() => {
      initialHandler?.({
        viewableItems: [
          {
            index: 1,
            isViewable: true,
            item: items[1],
          },
        ],
      });
    });

    expect(onActiveVideoChange).toHaveBeenCalledTimes(2);
    expect(onActiveVideoChange).toHaveBeenLastCalledWith('video-b', 1);
    expect(latestSession?.activeIndex).toBe(1);
    expect(latestSession?.handleViewableItemsChanged).toBe(initialHandler);
  });

  it('creates one watch session per active video visit', () => {
    const onActiveVideoChange = vi.fn();
    const createWatchSessionId = vi
      .fn()
      .mockReturnValueOnce('watch-session-1')
      .mockReturnValueOnce('watch-session-2');

    act(() => {
      TestRenderer.create(
        <SessionHarness
          createWatchSessionId={createWatchSessionId}
          onActiveVideoChange={onActiveVideoChange}
        />
      );
    });

    act(() => {
      latestSession?.commitActiveVideo('video-a', 0);
    });

    expect(createWatchSessionId).toHaveBeenCalledTimes(1);
    expect(latestSession?.getRowRenderState('video-a', 0).isActive).toBe(true);
    expect(latestSession?.getRowRenderState('video-a', 0).watchSessionId).toBe(
      'watch-session-1'
    );
    expect(latestSession?.getRowRenderState('video-a', 1).isActive).toBe(false);
    expect(latestSession?.getRowRenderState('video-a', 1).watchSessionId).toBeNull();
    expect(latestSession?.getRowRenderState('video-b', 1).watchSessionId).toBeNull();

    act(() => {
      latestSession?.commitActiveVideo('video-a', 0);
    });

    expect(createWatchSessionId).toHaveBeenCalledTimes(1);
    expect(latestSession?.getRowRenderState('video-a', 0).watchSessionId).toBe(
      'watch-session-1'
    );

    act(() => {
      latestSession?.commitActiveVideo('video-b', 1);
    });

    expect(createWatchSessionId).toHaveBeenCalledTimes(2);
    expect(latestSession?.getRowRenderState('video-b', 1).isActive).toBe(true);
    expect(latestSession?.getRowRenderState('video-b', 1).watchSessionId).toBe(
      'watch-session-2'
    );
    expect(latestSession?.getRowRenderState('video-a', 0).isActive).toBe(false);
    expect(latestSession?.getRowRenderState('video-a', 0).watchSessionId).toBeNull();
  });

  it('uses the latest active-video callback without changing the viewability handler', () => {
    const firstOnActiveVideoChange = vi.fn();
    const secondOnActiveVideoChange = vi.fn();
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    act(() => {
      renderer = TestRenderer.create(
        <SessionHarness onActiveVideoChange={firstOnActiveVideoChange} />
      );
    });

    const initialHandler = latestSession?.handleViewableItemsChanged;
    expect(initialHandler).toEqual(expect.any(Function));

    act(() => {
      renderer?.update(
        <SessionHarness onActiveVideoChange={secondOnActiveVideoChange} />
      );
    });

    expect(latestSession?.handleViewableItemsChanged).toBe(initialHandler);

    act(() => {
      initialHandler?.({
        viewableItems: [
          {
            index: 1,
            isViewable: true,
            item: items[1],
          },
        ],
      });
    });

    expect(firstOnActiveVideoChange).not.toHaveBeenCalled();
    expect(secondOnActiveVideoChange).toHaveBeenCalledTimes(1);
    expect(secondOnActiveVideoChange).toHaveBeenLastCalledWith('video-b', 1);
  });

  it('reads the global default playback rate for row render state', () => {
    const onActiveVideoChange = vi.fn();

    usePlaybackSettingsStore.getState().setPlaybackRate(1.5);

    act(() => {
      TestRenderer.create(
        <SessionHarness onActiveVideoChange={onActiveVideoChange} />
      );
    });

    act(() => {
      latestSession?.commitActiveVideo('video-a', 0);
    });

    expect(
      latestSession?.getRowRenderState('video-a', 0).effectivePlaybackState
      .playbackRate
    ).toBe(1.5);
  });

  it('temporarily pauses active playback while a playback hold is active', () => {
    const onActiveVideoChange = vi.fn();
    let releaseHold: (() => void) | null = null;

    act(() => {
      TestRenderer.create(
        <SessionHarness onActiveVideoChange={onActiveVideoChange} />
      );
    });

    act(() => {
      latestSession?.commitActiveVideo('video-a', 0);
    });

    expect(
      latestSession?.getRowRenderState('video-a', 0).effectivePlaybackState
        .shouldPlay
    ).toBe(true);

    act(() => {
      releaseHold = latestSession?.acquirePlaybackHold() ?? null;
    });

    expect(
      latestSession?.getRowRenderState('video-a', 0).effectivePlaybackState
        .shouldPlay
    ).toBe(false);

    act(() => {
      releaseHold?.();
    });

    expect(
      latestSession?.getRowRenderState('video-a', 0).effectivePlaybackState
        .shouldPlay
    ).toBe(true);
  });

  it('does not resume playback after releasing a hold when the user had paused', () => {
    const onActiveVideoChange = vi.fn();
    let releaseHold: (() => void) | null = null;

    act(() => {
      TestRenderer.create(
        <SessionHarness onActiveVideoChange={onActiveVideoChange} />
      );
    });

    act(() => {
      latestSession?.commitActiveVideo('video-a', 0);
      latestSession?.handleSingleTap();
    });

    expect(
      latestSession?.getRowRenderState('video-a', 0).effectivePlaybackState
        .shouldPlay
    ).toBe(false);

    act(() => {
      releaseHold = latestSession?.acquirePlaybackHold() ?? null;
    });

    act(() => {
      releaseHold?.();
    });

    expect(
      latestSession?.getRowRenderState('video-a', 0).effectivePlaybackState
        .shouldPlay
    ).toBe(false);
  });

  it('keeps playback held until every hold is released and ignores duplicate release calls', () => {
    const onActiveVideoChange = vi.fn();
    let releaseFirstHold: (() => void) | null = null;
    let releaseSecondHold: (() => void) | null = null;

    act(() => {
      TestRenderer.create(
        <SessionHarness onActiveVideoChange={onActiveVideoChange} />
      );
    });

    act(() => {
      latestSession?.commitActiveVideo('video-a', 0);
    });

    act(() => {
      releaseFirstHold = latestSession?.acquirePlaybackHold() ?? null;
      releaseSecondHold = latestSession?.acquirePlaybackHold() ?? null;
    });

    expect(
      latestSession?.getRowRenderState('video-a', 0).effectivePlaybackState
        .shouldPlay
    ).toBe(false);

    act(() => {
      releaseFirstHold?.();
      releaseFirstHold?.();
    });

    expect(
      latestSession?.getRowRenderState('video-a', 0).effectivePlaybackState
        .shouldPlay
    ).toBe(false);

    act(() => {
      releaseSecondHold?.();
    });

    expect(
      latestSession?.getRowRenderState('video-a', 0).effectivePlaybackState
        .shouldPlay
    ).toBe(true);
  });

  it('uses active transcript sentence targets for double-tap seek before falling back to relative seek', () => {
    const onActiveVideoChange = vi.fn();
    const activeController = createActiveController({
      currentTimeSeconds: 3.5,
      durationSeconds: 10,
    });

    act(() => {
      TestRenderer.create(
        <SessionHarness
          activeTranscript={activeTranscript}
          onActiveVideoChange={onActiveVideoChange}
        />
      );
    });

    act(() => {
      latestSession?.commitActiveVideo('video-a', 0);
      latestSession?.registerActiveController(activeController);
      latestSession?.handleDoubleTap('right');
    });

    expect(activeController.seekTo).toHaveBeenCalledWith(6);
    expect(activeController.seekBy).not.toHaveBeenCalled();
    expect(
      latestSession?.getRowRenderState('video-a', 0).hudState.transientFeedback
    ).toEqual({
      kind: 'seek',
      direction: 'forward',
    });
  });

  it('falls back to relative double-tap seek when transcript or duration is unavailable', () => {
    const onActiveVideoChange = vi.fn();
    const noTranscriptController = createActiveController({
      currentTimeSeconds: 3.5,
      durationSeconds: 10,
    });
    const noDurationController = createActiveController({
      currentTimeSeconds: 3.5,
      durationSeconds: null,
    });

    act(() => {
      TestRenderer.create(
        <SessionHarness onActiveVideoChange={onActiveVideoChange} />
      );
    });

    act(() => {
      latestSession?.commitActiveVideo('video-a', 0);
      latestSession?.registerActiveController(noTranscriptController);
      latestSession?.handleDoubleTap('right');
    });

    expect(noTranscriptController.seekBy).toHaveBeenCalledWith(5);
    expect(noTranscriptController.seekTo).not.toHaveBeenCalled();

    act(() => {
      latestSession?.registerActiveController(noDurationController);
      latestSession?.handleDoubleTap('left');
    });

    expect(noDurationController.seekBy).toHaveBeenCalledWith(-5);
    expect(noDurationController.seekTo).not.toHaveBeenCalled();
  });

  it('keeps paused playback paused after sentence double-tap seek', () => {
    const onActiveVideoChange = vi.fn();
    const activeController = createActiveController({
      currentTimeSeconds: 3.5,
      durationSeconds: 10,
    });

    act(() => {
      TestRenderer.create(
        <SessionHarness
          activeTranscript={activeTranscript}
          onActiveVideoChange={onActiveVideoChange}
        />
      );
    });

    act(() => {
      latestSession?.commitActiveVideo('video-a', 0);
      latestSession?.handleSingleTap();
      latestSession?.registerActiveController(activeController);
      latestSession?.handleDoubleTap('right');
    });

    expect(activeController.seekTo).toHaveBeenCalledWith(6);
    expect(
      latestSession?.getRowRenderState('video-a', 0).effectivePlaybackState
        .shouldPlay
    ).toBe(false);
  });

  it('does not seek on double tap while another gesture locks playback gestures', () => {
    const onActiveVideoChange = vi.fn();
    const activeController = createActiveController({
      currentTimeSeconds: 3.5,
      durationSeconds: 10,
    });

    act(() => {
      TestRenderer.create(
        <SessionHarness
          activeTranscript={activeTranscript}
          onActiveVideoChange={onActiveVideoChange}
        />
      );
    });

    act(() => {
      latestSession?.commitActiveVideo('video-a', 0);
      latestSession?.registerActiveController(activeController);
      latestSession?.handleHoldStart('right');
      latestSession?.handleDoubleTap('right');
    });

    expect(activeController.seekTo).not.toHaveBeenCalled();
    expect(activeController.seekBy).not.toHaveBeenCalled();
  });
});
