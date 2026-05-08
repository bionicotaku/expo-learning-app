import { beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import type { VideoListItem } from '@/entities/video';
import { usePlaybackSettingsStore } from '@/features/playback-settings/model/playback-settings-store';

import { useFullscreenPlaybackSession } from './use-fullscreen-playback-session';

const items: VideoListItem[] = [
  {
    coverImageUrl: null,
    description: 'desc 1',
    durationSeconds: 10,
    isFavorited: false,
    isLiked: false,
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
    isFavorited: false,
    isLiked: false,
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
  onActiveVideoChange,
}: {
  onActiveVideoChange: (itemId: string, index: number) => void;
}) {
  latestSession = useFullscreenPlaybackSession({
    items,
    onActiveVideoChange,
  }) as SessionWithViewability;

  return React.createElement('SessionHarness');
}

let latestSession: SessionWithViewability | null = null;

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
});
