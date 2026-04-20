import { afterEach, describe, expect, it } from 'vitest';

import {
  resolveEffectiveVideoRuntimeFlags,
  resolveNextVideoRuntimeOverride,
  useVideoRuntimeStore,
} from '@/features/video-runtime';

afterEach(() => {
  useVideoRuntimeStore.getState().clearAll();
});

describe('video runtime store', () => {
  it('resolves effective runtime flags from base values and current override', () => {
    expect(
      resolveEffectiveVideoRuntimeFlags(
        { isLiked: false, isFavorited: false },
        {
          isLiked: true,
        }
      )
    ).toEqual({
      isLiked: true,
      isFavorited: false,
    });

    expect(
      resolveEffectiveVideoRuntimeFlags(
        { isLiked: true, isFavorited: false },
        {
          isFavorited: true,
        }
      )
    ).toEqual({
      isLiked: true,
      isFavorited: true,
    });

    expect(
      resolveEffectiveVideoRuntimeFlags(
        { isLiked: true, isFavorited: true },
        undefined
      )
    ).toEqual({
      isLiked: true,
      isFavorited: true,
    });
  });

  it('computes next overrides against current effective values instead of override-only values', () => {
    expect(
      resolveNextVideoRuntimeOverride(
        { isLiked: false, isFavorited: false },
        undefined,
        { isLiked: true }
      )
    ).toEqual({
      isLiked: true,
    });

    expect(
      resolveNextVideoRuntimeOverride(
        { isLiked: true, isFavorited: false },
        undefined,
        { isLiked: false }
      )
    ).toEqual({
      isLiked: false,
    });

    expect(
      resolveNextVideoRuntimeOverride(
        { isLiked: true, isFavorited: false },
        {
          isLiked: false,
        },
        { isLiked: true }
      )
    ).toBeUndefined();

    expect(
      resolveNextVideoRuntimeOverride(
        { isLiked: false, isFavorited: false },
        {
          isLiked: true,
        },
        { isLiked: false }
      )
    ).toBeUndefined();

    expect(
      resolveNextVideoRuntimeOverride(
        { isLiked: false, isFavorited: false },
        {
          isFavorited: true,
        },
        { isLiked: true }
      )
    ).toEqual({
      isLiked: true,
      isFavorited: true,
    });
  });

  it('removes override keys and empty video entries when next values collapse back to base', () => {
    useVideoRuntimeStore.getState().setFlags(
      'the-office-health-care-video-1',
      {
        isLiked: true,
        isFavorited: true,
      },
      {
        isLiked: false,
        isFavorited: false,
      }
    );

    expect(useVideoRuntimeStore.getState().overridesByVideoId).toEqual({
      'the-office-health-care-video-1': {
        isLiked: true,
        isFavorited: true,
      },
    });

    useVideoRuntimeStore.getState().setFlags(
      'the-office-health-care-video-1',
      {
        isLiked: false,
      },
      {
        isLiked: false,
        isFavorited: false,
      }
    );

    expect(useVideoRuntimeStore.getState().overridesByVideoId).toEqual({
      'the-office-health-care-video-1': {
        isFavorited: true,
      },
    });

    useVideoRuntimeStore.getState().setFlags(
      'the-office-health-care-video-1',
      {
        isFavorited: false,
      },
      {
        isLiked: false,
        isFavorited: false,
      }
    );

    expect(useVideoRuntimeStore.getState().overridesByVideoId).toEqual({});
  });

  it('accepts fetched ids into source membership and drops overrides for those ids', () => {
    useVideoRuntimeStore.getState().setFlags(
      'the-office-health-care-video-1',
      {
        isLiked: true,
      },
      {
        isLiked: false,
        isFavorited: false,
      }
    );
    useVideoRuntimeStore.getState().setFlags(
      'the-office-health-care-video-3',
      {
        isFavorited: true,
      },
      {
        isLiked: false,
        isFavorited: false,
      }
    );

    useVideoRuntimeStore
      .getState()
      .acceptFetchedIds('feed', ['the-office-health-care-video-1', 'the-office-health-care-video-2']);

    expect(useVideoRuntimeStore.getState().overridesByVideoId).toEqual({
      'the-office-health-care-video-3': {
        isFavorited: true,
      },
    });
    expect(useVideoRuntimeStore.getState().sourceVideoIds).toEqual({
      feed: {
        'the-office-health-care-video-1': true,
        'the-office-health-care-video-2': true,
      },
      history: {},
    });
  });

  it('replaces a source snapshot, prunes feed-only orphan overrides, and keeps ids still owned by another source', () => {
    useVideoRuntimeStore
      .getState()
      .acceptFetchedIds('feed', [
        'the-office-health-care-video-1',
        'the-office-health-care-video-2',
        'the-office-health-care-video-3',
      ]);
    useVideoRuntimeStore
      .getState()
      .acceptFetchedIds('history', ['the-office-health-care-video-2']);

    useVideoRuntimeStore.getState().setFlags(
      'the-office-health-care-video-1',
      {
        isLiked: true,
      },
      {
        isLiked: false,
        isFavorited: false,
      }
    );
    useVideoRuntimeStore.getState().setFlags(
      'the-office-health-care-video-2',
      {
        isFavorited: true,
      },
      {
        isLiked: false,
        isFavorited: false,
      }
    );
    useVideoRuntimeStore.getState().setFlags(
      'the-office-health-care-video-4',
      {
        isLiked: true,
      },
      {
        isLiked: false,
        isFavorited: false,
      }
    );

    useVideoRuntimeStore
      .getState()
      .replaceSourceSnapshot('feed', ['the-office-health-care-video-3']);

    expect(useVideoRuntimeStore.getState().overridesByVideoId).toEqual({
      'the-office-health-care-video-2': {
        isFavorited: true,
      },
      'the-office-health-care-video-4': {
        isLiked: true,
      },
    });
    expect(useVideoRuntimeStore.getState().sourceVideoIds).toEqual({
      feed: {
        'the-office-health-care-video-3': true,
      },
      history: {
        'the-office-health-care-video-2': true,
      },
    });
  });

  it('clearAll removes both runtime overrides and source membership', () => {
    useVideoRuntimeStore
      .getState()
      .acceptFetchedIds('feed', ['the-office-health-care-video-1']);
    useVideoRuntimeStore.getState().setFlags(
      'the-office-health-care-video-1',
      {
        isLiked: true,
      },
      {
        isLiked: false,
        isFavorited: false,
      }
    );

    useVideoRuntimeStore.getState().clearAll();

    expect(useVideoRuntimeStore.getState()).toMatchObject({
      overridesByVideoId: {},
      sourceVideoIds: {
        feed: {},
        history: {},
      },
    });
  });
});
