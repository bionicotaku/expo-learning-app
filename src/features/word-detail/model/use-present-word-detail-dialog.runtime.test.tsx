import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  ModalDescriptor,
  ModalPresentResult,
} from '@/shared/lib/modal/types';
import type { WordDetailDialogPayload } from '../ui/word-detail-dialog-content';
import { usePresentWordDetailDialog } from './use-present-word-detail-dialog';

const hoisted = vi.hoisted(() => ({
  modalPresent: vi.fn<(descriptor: ModalDescriptor) => ModalPresentResult>(),
}));

vi.mock('@/shared/lib/modal', () => ({
  useModalController: () => ({
    present: hoisted.modalPresent,
    dismiss: vi.fn(),
    dismissTop: vi.fn(),
    clear: vi.fn(),
  }),
}));

vi.mock('../ui/word-detail-dialog-content', () => ({
  WordDetailDialogContent: ({ payload }: { payload: WordDetailDialogPayload }) =>
    React.createElement('WordDetailDialogContent', { payload }),
}));

const payload: WordDetailDialogPayload = {
  text: 'test',
  explanation: 'context',
  semantic_element: {
    base_form: 'test',
    dictionary: 'dictionary',
    coarse_id: null,
  },
};

let latestPresentWordDetailDialog: ReturnType<typeof usePresentWordDetailDialog> | null =
  null;

function Harness() {
  latestPresentWordDetailDialog = usePresentWordDetailDialog();

  return React.createElement('Harness');
}

describe('usePresentWordDetailDialog runtime', () => {
  beforeEach(() => {
    hoisted.modalPresent.mockReset();
    hoisted.modalPresent.mockReturnValue({ id: 'modal-1', didPresent: true });
    latestPresentWordDetailDialog = null;
  });

  it('returns true when the shared modal accepts the dialog', () => {
    act(() => {
      TestRenderer.create(<Harness />);
    });

    let didPresent = false;

    act(() => {
      didPresent = latestPresentWordDetailDialog?.(payload) ?? false;
    });

    expect(didPresent).toBe(true);
  });

  it('returns false and does not mount a lifecycle boundary when modal present is rejected', () => {
    hoisted.modalPresent.mockReturnValue({ id: null, didPresent: false });

    act(() => {
      TestRenderer.create(<Harness />);
    });

    let didPresent = true;

    act(() => {
      didPresent = latestPresentWordDetailDialog?.(payload) ?? true;
    });

    expect(didPresent).toBe(false);
  });

  it('calls onDismissComplete when the dialog content unmounts', () => {
    const onDismissComplete = vi.fn();

    act(() => {
      TestRenderer.create(<Harness />);
    });

    act(() => {
      latestPresentWordDetailDialog?.(payload, { onDismissComplete });
    });

    expect(hoisted.modalPresent).toHaveBeenCalledWith(
      expect.objectContaining({
        debugLabel: 'word-detail',
        presentation: 'dialog',
      })
    );

    const descriptor = hoisted.modalPresent.mock.calls[0]![0];
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    act(() => {
      renderer = TestRenderer.create(
        <>
          {descriptor.render({
            clear: vi.fn(),
            dismiss: vi.fn(),
            dismissTop: vi.fn(),
          })}
        </>
      );
    });

    expect(onDismissComplete).not.toHaveBeenCalled();

    act(() => {
      renderer?.unmount();
    });

    expect(onDismissComplete).toHaveBeenCalledTimes(1);
  });
});
