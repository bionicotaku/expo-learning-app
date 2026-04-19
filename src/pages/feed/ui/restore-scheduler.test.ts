import { afterEach, describe, expect, it, vi } from 'vitest';

import { scheduleFeedRestore } from './restore-scheduler';

describe('feed restore scheduler', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('prefers requestIdleCallback when it is available', () => {
    const callback = vi.fn();
    const cancelIdleCallback = vi.fn();
    const requestIdleCallback = vi.fn(() => 42);

    vi.stubGlobal('requestIdleCallback', requestIdleCallback);
    vi.stubGlobal('cancelIdleCallback', cancelIdleCallback);

    const task = scheduleFeedRestore(callback);

    expect(requestIdleCallback).toHaveBeenCalledTimes(1);
    expect(callback).not.toHaveBeenCalled();

    task.cancel();

    expect(cancelIdleCallback).toHaveBeenCalledWith(42);
  });

  it('falls back to a timeout when requestIdleCallback is unavailable', () => {
    vi.useFakeTimers();
    const callback = vi.fn();

    const task = scheduleFeedRestore(callback);

    expect(callback).not.toHaveBeenCalled();

    vi.runAllTimers();

    expect(callback).toHaveBeenCalledTimes(1);

    task.cancel();
  });
});
