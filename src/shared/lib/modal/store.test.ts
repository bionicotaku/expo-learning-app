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
  it('creates an entering singleton modal and fills backdrop dismiss by default', () => {
    const store = createModalStore({
      createId: createTestIdFactory(),
    });

    const result = store.present(
      createModalDescriptor({
        debugLabel: 'example-dialog',
      })
    );

    expect(result).toEqual({ id: 'modal-1', didPresent: true });
    expect(store.getSnapshot()).toEqual(
      {
        id: 'modal-1',
        debugLabel: 'example-dialog',
        presentation: 'dialog',
        dismissOnBackdropPress: true,
        render: expect.any(Function),
        phase: 'entering',
        dismissReason: undefined,
      }
    );
  });

  it('marks a modal visible and does not revive it after dismiss', () => {
    const store = createModalStore({
      createId: createTestIdFactory(),
    });

    store.present(createModalDescriptor());

    store.markVisible('modal-1');
    expect(store.getSnapshot()?.phase).toBe('visible');

    store.dismiss('modal-1', 'imperative');
    expect(store.getSnapshot()).toMatchObject({
      id: 'modal-1',
      phase: 'exiting',
      dismissReason: 'imperative',
    });

    store.markVisible('modal-1');
    expect(store.getSnapshot()).toMatchObject({
      id: 'modal-1',
      phase: 'exiting',
      dismissReason: 'imperative',
    });
  });

  it('rejects a second present while any current modal exists', () => {
    const store = createModalStore({
      createId: createTestIdFactory(),
    });

    expect(
      store.present(createModalDescriptor({ debugLabel: 'first' }))
    ).toEqual({ id: 'modal-1', didPresent: true });
    expect(
      store.present(createModalDescriptor({ debugLabel: 'second' }))
    ).toEqual({ id: null, didPresent: false });

    expect(store.getSnapshot()).toMatchObject({
      id: 'modal-1',
      debugLabel: 'first',
      phase: 'entering',
    });
  });

  it('rejects present while current modal is exiting but not removed', () => {
    const store = createModalStore({
      createId: createTestIdFactory(),
    });

    store.present(createModalDescriptor({ debugLabel: 'first' }));
    store.dismiss('modal-1', 'backdrop');

    expect(
      store.present(createModalDescriptor({ debugLabel: 'second' }))
    ).toEqual({ id: null, didPresent: false });
    expect(store.getSnapshot()).toMatchObject({
      id: 'modal-1',
      phase: 'exiting',
      dismissReason: 'backdrop',
    });
  });

  it('dismissTop dismisses current and repeated dismiss does not replace its reason', () => {
    const store = createModalStore({
      createId: createTestIdFactory(),
    });

    store.present(createModalDescriptor({ presentation: 'sheet' }));

    store.dismissTop('gesture');
    store.dismissTop('imperative');

    expect(store.getSnapshot()).toMatchObject({
      id: 'modal-1',
      phase: 'exiting',
      dismissReason: 'gesture',
    });
  });

  it('clear only marks current exiting', () => {
    const store = createModalStore({
      createId: createTestIdFactory(),
    });

    store.present(createModalDescriptor());
    store.clear();

    expect(store.getSnapshot()).toMatchObject({
      id: 'modal-1',
      phase: 'exiting',
      dismissReason: 'clear',
    });
  });

  it('removes current only when the id matches', () => {
    const store = createModalStore({
      createId: createTestIdFactory(),
    });

    store.present(createModalDescriptor());

    store.remove('modal-2');
    expect(store.getSnapshot()).toMatchObject({ id: 'modal-1' });

    store.remove('modal-1');
    expect(store.getSnapshot()).toBeNull();
  });

  it('allows a new present after current is removed', () => {
    const store = createModalStore({
      createId: createTestIdFactory(),
    });

    store.present(createModalDescriptor());
    store.remove('modal-1');

    expect(store.present(createModalDescriptor())).toEqual({
      id: 'modal-2',
      didPresent: true,
    });
  });
});
