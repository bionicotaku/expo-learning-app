import {
  DEFAULT_TOAST_DURATION_MS,
  MAX_TOASTS,
} from './constants';
import type {
  ToastConfig,
  ToastId,
  ToastRecord,
  ToastStore,
  ToastStoreListener,
} from './types';

type CreateToastStoreOptions = {
  createId?: () => ToastId;
  now?: () => number;
};

function createToastId(): ToastId {
  return `toast_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function resolveToastDuration(durationMs: ToastConfig['durationMs']) {
  if (typeof durationMs !== 'number' || Number.isNaN(durationMs) || durationMs <= 0) {
    return DEFAULT_TOAST_DURATION_MS;
  }

  return durationMs;
}

function createToastRecord(
  config: ToastConfig,
  id: ToastId,
  now: number
): ToastRecord {
  return {
    id,
    kind: config.kind,
    title: config.title,
    message: config.message,
    durationMs: resolveToastDuration(config.durationMs),
    createdAt: now,
    phase: 'entering',
  };
}

export function createToastStore({
  createId = createToastId,
  now = Date.now,
}: CreateToastStoreOptions = {}): ToastStore {
  let items: readonly ToastRecord[] = [];
  const listeners = new Set<ToastStoreListener>();

  const emit = () => {
    listeners.forEach((listener) => {
      listener();
    });
  };

  const commit = (nextItems: readonly ToastRecord[]) => {
    items = nextItems;
    emit();
  };

  const updateOne = (
    id: ToastId,
    updater: (item: ToastRecord) => ToastRecord
  ) => {
    let hasChanged = false;

    const nextItems = items.map((item) => {
      if (item.id !== id) {
        return item;
      }

      const nextItem = updater(item);
      hasChanged = hasChanged || nextItem !== item;
      return nextItem;
    });

    if (hasChanged) {
      commit(nextItems);
    }
  };

  return {
    getSnapshot() {
      return items;
    },

    subscribe(listener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },

    enqueue(config) {
      const id = createId();
      const record = createToastRecord(config, id, now());
      const nextItems = [record, ...items].slice(0, MAX_TOASTS);

      commit(nextItems);

      return id;
    },

    markVisible(id) {
      updateOne(id, (item) => {
        if (item.phase !== 'entering') {
          return item;
        }

        return {
          ...item,
          phase: 'visible',
        };
      });
    },

    markExiting(id) {
      updateOne(id, (item) => {
        if (item.phase === 'exiting') {
          return item;
        }

        return {
          ...item,
          phase: 'exiting',
        };
      });
    },

    remove(id) {
      const nextItems = items.filter((item) => item.id !== id);

      if (nextItems.length !== items.length) {
        commit(nextItems);
      }
    },

    clearAll() {
      let hasChanged = false;

      const nextItems: readonly ToastRecord[] = items.map((item) => {
        if (item.phase === 'exiting') {
          return item;
        }

        hasChanged = true;

        return {
          ...item,
          phase: 'exiting' as const,
        };
      });

      if (hasChanged) {
        commit(nextItems);
      }
    },
  };
}

export const toastStore = createToastStore();
