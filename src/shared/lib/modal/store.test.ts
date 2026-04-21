import { describe, expect, it } from 'vitest';

import { createModalStore } from './store';
import type { ModalDescriptor, ModalId } from './types';

function createTestIdFactory() {
  let counter = 0;

  return () => `modal-${++counter}` as ModalId;
}

function createModalDescriptor(
  overrides: Partial<ModalDescriptor> = {}
): ModalDescriptor {
  return {
    presentation: 'dialog',
    render: () => null,
    ...overrides,
  };
}

describe('modal store', () => {
  it('creates an entering modal and fills backdrop dismiss by default', () => {
    const store = createModalStore({
      createId: createTestIdFactory(),
    });

    const id = store.present(
      createModalDescriptor({
        debugLabel: 'example-dialog',
      })
    );

    expect(id).toBe('modal-1');
    expect(store.getSnapshot()).toEqual([
      {
        id: 'modal-1',
        debugLabel: 'example-dialog',
        presentation: 'dialog',
        dismissOnBackdropPress: true,
        render: expect.any(Function),
        phase: 'entering',
        dismissReason: undefined,
      },
    ]);
  });

  it('marks a modal visible and does not revive it after dismiss', () => {
    const store = createModalStore({
      createId: createTestIdFactory(),
    });

    store.present(createModalDescriptor());

    store.markVisible('modal-1');
    expect(store.getSnapshot()[0]?.phase).toBe('visible');

    store.dismiss('modal-1', 'imperative');
    expect(store.getSnapshot()[0]).toMatchObject({
      id: 'modal-1',
      phase: 'exiting',
      dismissReason: 'imperative',
    });

    store.markVisible('modal-1');
    expect(store.getSnapshot()[0]).toMatchObject({
      id: 'modal-1',
      phase: 'exiting',
      dismissReason: 'imperative',
    });
  });

  it('dismisses only the topmost non-exiting modal', () => {
    const store = createModalStore({
      createId: createTestIdFactory(),
    });

    store.present(createModalDescriptor({ debugLabel: 'first' }));
    store.present(createModalDescriptor({ debugLabel: 'second' }));
    store.present(createModalDescriptor({ debugLabel: 'third' }));

    store.dismiss('modal-3', 'imperative');
    store.dismissTop('gesture');

    expect(store.getSnapshot()).toMatchObject([
      {
        id: 'modal-1',
        phase: 'entering',
        dismissReason: undefined,
      },
      {
        id: 'modal-2',
        phase: 'exiting',
        dismissReason: 'gesture',
      },
      {
        id: 'modal-3',
        phase: 'exiting',
        dismissReason: 'imperative',
      },
    ]);
  });

  it('marks every visible modal exiting when cleared and ignores repeated dismisses', () => {
    const store = createModalStore({
      createId: createTestIdFactory(),
    });

    store.present(createModalDescriptor({ presentation: 'sheet' }));
    store.present(createModalDescriptor());

    store.dismiss('modal-2', 'backdrop');
    store.dismiss('modal-2', 'gesture');
    store.clear();

    expect(store.getSnapshot()).toMatchObject([
      {
        id: 'modal-1',
        phase: 'exiting',
        dismissReason: 'clear',
      },
      {
        id: 'modal-2',
        phase: 'exiting',
        dismissReason: 'backdrop',
      },
    ]);
  });

  it('removes a dismissed modal explicitly', () => {
    const store = createModalStore({
      createId: createTestIdFactory(),
    });

    store.present(createModalDescriptor());
    store.present(createModalDescriptor());

    store.remove('modal-2');

    expect(store.getSnapshot().map((item) => item.id)).toEqual(['modal-1']);
  });
});
