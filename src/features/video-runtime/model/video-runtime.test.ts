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

  it('drops runtime overrides for fetched video ids when source truth is accepted again', () => {
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

    useVideoRuntimeStore
      .getState()
      .acceptSourceTruth(['the-office-health-care-video-1']);

    expect(useVideoRuntimeStore.getState().overridesByVideoId).toEqual({
      'the-office-health-care-video-2': {
        isFavorited: true,
      },
    });
  });
});
