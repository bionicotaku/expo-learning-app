type RequestAbortControllerOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

export type RequestAbortControllerHandle = {
  readonly signal: AbortSignal;
  cleanup: () => void;
  getAbortReason: () => 'external' | 'timeout' | null;
};

export function isAbortError(error: unknown) {
  if (
    typeof DOMException !== 'undefined' &&
    error instanceof DOMException &&
    error.name === 'AbortError'
  ) {
    return true;
  }

  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name?: unknown }).name === 'AbortError'
  );
}

export function createRequestAbortController({
  signal,
  timeoutMs,
}: RequestAbortControllerOptions): RequestAbortControllerHandle {
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let abortReason: 'external' | 'timeout' | null = null;
  let externalAbortHandler: (() => void) | null = null;

  function abortFromExternalSignal() {
    abortReason = 'external';
    controller.abort(signal?.reason);
  }

  if (signal) {
    if (signal.aborted) {
      abortFromExternalSignal();
    } else {
      externalAbortHandler = abortFromExternalSignal;
      signal.addEventListener('abort', externalAbortHandler, { once: true });
    }
  }

  if (timeoutMs !== undefined) {
    timeoutId = setTimeout(() => {
      abortReason = 'timeout';
      controller.abort();
    }, timeoutMs);
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (signal && externalAbortHandler) {
        signal.removeEventListener('abort', externalAbortHandler);
        externalAbortHandler = null;
      }
    },
    getAbortReason: () => abortReason,
  };
}
