type IdleDeadlineLike = {
  didTimeout: boolean;
  timeRemaining: () => number;
};

type IdleCallbackHandle = number;

type FeedRestoreTask = {
  cancel: () => void;
};

const FALLBACK_RESTORE_DELAY_MS = 16;

export function scheduleFeedRestore(callback: () => void): FeedRestoreTask {
  const requestIdleCallbackFn = globalThis.requestIdleCallback as
    | ((callback: (deadline: IdleDeadlineLike) => void) => IdleCallbackHandle)
    | undefined;
  const cancelIdleCallbackFn = globalThis.cancelIdleCallback as
    | ((handle: IdleCallbackHandle) => void)
    | undefined;

  if (requestIdleCallbackFn) {
    const handle = requestIdleCallbackFn(() => {
      callback();
    });

    return {
      cancel: () => {
        cancelIdleCallbackFn?.(handle);
      },
    };
  }

  const handle = globalThis.setTimeout(callback, FALLBACK_RESTORE_DELAY_MS);

  return {
    cancel: () => {
      globalThis.clearTimeout(handle);
    },
  };
}
