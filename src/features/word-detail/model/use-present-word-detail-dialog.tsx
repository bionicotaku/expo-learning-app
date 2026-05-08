import { PropsWithChildren, useCallback, useEffect } from 'react';

import { useModalController } from '@/shared/lib/modal';

import {
  WordDetailDialogContent,
  type WordDetailDialogPayload,
} from '../ui/word-detail-dialog-content';

type PresentWordDetailDialogOptions = {
  onDismissComplete?: () => void;
};

function WordDetailDialogLifecycleBoundary({
  children,
  onDismissComplete,
}: PropsWithChildren<PresentWordDetailDialogOptions>) {
  useEffect(() => {
    return () => {
      onDismissComplete?.();
    };
  }, [onDismissComplete]);

  return children;
}

export function usePresentWordDetailDialog() {
  const modal = useModalController();

  return useCallback(
    (
      payload: WordDetailDialogPayload,
      options: PresentWordDetailDialogOptions = {}
    ) => {
      modal.present({
        debugLabel: 'word-detail',
        presentation: 'dialog',
        render: () => (
          <WordDetailDialogLifecycleBoundary
            onDismissComplete={options.onDismissComplete}
          >
            <WordDetailDialogContent payload={payload} />
          </WordDetailDialogLifecycleBoundary>
        ),
      });
    },
    [modal]
  );
}
