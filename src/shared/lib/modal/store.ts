import type {
  ModalDescriptor,
  ModalDismissReason,
  ModalId,
  ModalRecord,
  ModalStore,
  ModalStoreListener,
} from './types';

type CreateModalStoreOptions = {
  createId?: () => ModalId;
};

function createModalId(): ModalId {
  return `modal_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function createModalRecord(
  descriptor: ModalDescriptor,
  id: ModalId
): ModalRecord {
  return {
    id,
    debugLabel: descriptor.debugLabel,
    presentation: descriptor.presentation,
    dismissOnBackdropPress: descriptor.dismissOnBackdropPress ?? true,
    render: descriptor.render,
    phase: 'entering',
    dismissReason: undefined,
  };
}

function markRecordExiting(
  record: ModalRecord,
  reason: ModalDismissReason
): ModalRecord {
  if (record.phase === 'exiting') {
    return record;
  }

  return {
    ...record,
    phase: 'exiting',
    dismissReason: reason,
  };
}

export function createModalStore({
  createId = createModalId,
}: CreateModalStoreOptions = {}): ModalStore {
  let current: ModalRecord | null = null;
  const listeners = new Set<ModalStoreListener>();

  const emit = () => {
    listeners.forEach((listener) => {
      listener();
    });
  };

  const commit = (nextCurrent: ModalRecord | null) => {
    current = nextCurrent;
    emit();
  };

  const updateCurrent = (
    id: ModalId,
    updater: (item: ModalRecord) => ModalRecord
  ) => {
    if (current?.id !== id) {
      return;
    }

    const nextCurrent = updater(current);

    if (nextCurrent !== current) {
      commit(nextCurrent);
    }
  };

  return {
    getSnapshot() {
      return current;
    },

    subscribe(listener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },

    present(descriptor) {
      if (current !== null) {
        return {
          id: null,
          didPresent: false,
        };
      }

      const id = descriptor.id ?? createId();
      const record = createModalRecord(descriptor, id);

      commit(record);

      return {
        id,
        didPresent: true,
      };
    },

    markVisible(id) {
      updateCurrent(id, (item) => {
        if (item.phase !== 'entering') {
          return item;
        }

        return {
          ...item,
          phase: 'visible',
        };
      });
    },

    dismiss(id, reason) {
      updateCurrent(id, (item) => markRecordExiting(item, reason));
    },

    dismissTop(reason) {
      if (!current || current.phase === 'exiting') {
        return;
      }

      commit(markRecordExiting(current, reason));
    },

    remove(id) {
      if (current?.id === id) {
        commit(null);
      }
    },

    clear() {
      if (!current) {
        return;
      }

      commit(markRecordExiting(current, 'clear'));
    },
  };
}

export const modalStore = createModalStore();
