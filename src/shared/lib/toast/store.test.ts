import { describe, expect, it } from 'vitest';

import { DEFAULT_TOAST_DURATION_MS } from './constants';
import { createToastStore } from './store';
import type { ToastId } from './types';

function createTestIdFactory() {
  let counter = 0;

  return () => `toast-${++counter}` as ToastId;
}

describe('toast store', () => {
  it('creates an entering toast and fills the default duration', () => {
    const store = createToastStore({
      createId: createTestIdFactory(),
      now: () => 123,
    });

    const id = store.enqueue({
      kind: 'success',
      title: 'Saved',
    });

    expect(id).toBe('toast-1');
    expect(store.getSnapshot()).toEqual([
      {
        id: 'toast-1',
        kind: 'success',
        title: 'Saved',
        message: undefined,
        durationMs: DEFAULT_TOAST_DURATION_MS,
        createdAt: 123,
        phase: 'entering',
      },
    ]);
  });

  it('keeps only the newest two toasts', () => {
    const store = createToastStore({
      createId: createTestIdFactory(),
      now: () => 200,
    });

    store.enqueue({ kind: 'info', title: 'First' });
    store.enqueue({ kind: 'warning', title: 'Second' });
    store.enqueue({ kind: 'error', title: 'Third' });

    expect(store.getSnapshot().map((item) => item.id)).toEqual(['toast-3', 'toast-2']);
    expect(store.getSnapshot().map((item) => item.title)).toEqual(['Third', 'Second']);
  });

  it('marks an existing toast visible and then exiting without reviving it', () => {
    const store = createToastStore({
      createId: createTestIdFactory(),
      now: () => 300,
    });

    store.enqueue({ kind: 'warning', title: 'Slow down' });

    store.markVisible('toast-1');
    expect(store.getSnapshot()[0]?.phase).toBe('visible');

    store.markExiting('toast-1');
    expect(store.getSnapshot()[0]?.phase).toBe('exiting');

    store.markVisible('toast-1');
    expect(store.getSnapshot()[0]?.phase).toBe('exiting');
  });

  it('marks every toast exiting when cleared and removes them explicitly', () => {
    const store = createToastStore({
      createId: createTestIdFactory(),
      now: () => 400,
    });

    store.enqueue({ kind: 'success', title: 'One' });
    store.enqueue({ kind: 'info', title: 'Two' });

    store.markVisible('toast-1');
    store.markVisible('toast-2');
    store.clearAll();

    expect(store.getSnapshot().every((item) => item.phase === 'exiting')).toBe(true);

    store.remove('toast-2');
    expect(store.getSnapshot().map((item) => item.id)).toEqual(['toast-1']);
  });
});
