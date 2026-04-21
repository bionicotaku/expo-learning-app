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
  let items: readonly ModalRecord[] = [];
  const listeners = new Set<ModalStoreListener>();

  const emit = () => {
    listeners.forEach((listener) => {
      listener();
    });
  };

  const commit = (nextItems: readonly ModalRecord[]) => {
    items = nextItems;
    emit();
  };

  const updateOne = (
    id: ModalId,
    updater: (item: ModalRecord) => ModalRecord
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

    present(descriptor) {
      const id = descriptor.id ?? createId();
      const record = createModalRecord(descriptor, id);

      commit([...items, record]);

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

    dismiss(id, reason) {
      updateOne(id, (item) => markRecordExiting(item, reason));
    },

    dismissTop(reason) {
      const topmostItem = [...items].reverse().find((item) => item.phase !== 'exiting');

      if (!topmostItem) {
        return;
      }

      updateOne(topmostItem.id, (item) => markRecordExiting(item, reason));
    },

    remove(id) {
      const nextItems = items.filter((item) => item.id !== id);

      if (nextItems.length !== items.length) {
        commit(nextItems);
      }
    },

    clear() {
      let hasChanged = false;

      const nextItems = items.map((item) => {
        const nextItem = markRecordExiting(item, 'clear');
        hasChanged = hasChanged || nextItem !== item;
        return nextItem;
      });

      if (hasChanged) {
        commit(nextItems);
      }
    },
  };
}

export const modalStore = createModalStore();
