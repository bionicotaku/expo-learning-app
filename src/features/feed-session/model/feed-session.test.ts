import { beforeEach, describe, expect, it } from 'vitest';

import {
  clearPendingRestoreVideoId,
  getPendingRestoreVideoId,
  resetFeedSession,
  setPendingRestoreVideoId,
} from './feed-session';

describe('feed session', () => {
  beforeEach(() => {
    resetFeedSession();
  });

  it('stores the pending restore video id until it is explicitly cleared', () => {
    setPendingRestoreVideoId('feed-9');

    expect(getPendingRestoreVideoId()).toBe('feed-9');

    clearPendingRestoreVideoId();

    expect(getPendingRestoreVideoId()).toBeNull();
  });

  it('reset clears the pending restore video id', () => {
    setPendingRestoreVideoId('feed-4');
    resetFeedSession();

    expect(getPendingRestoreVideoId()).toBeNull();
  });
});
