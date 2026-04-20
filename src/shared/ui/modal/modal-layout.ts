import type { ModalId } from '@/shared/lib/modal/types';

export function resolveDialogModalLayout({
  viewportWidth,
  viewportHeight,
  topInset,
  bottomInset,
  horizontalMargin,
  maxWidth,
}: {
  viewportWidth: number;
  viewportHeight: number;
  topInset: number;
  bottomInset: number;
  horizontalMargin: number;
  maxWidth: number;
}) {
  return {
    width: Math.max(0, Math.min(maxWidth, viewportWidth - horizontalMargin * 2)),
    maxHeight: Math.max(
      0,
      viewportHeight - topInset - bottomInset - horizontalMargin * 2
    ),
  };
}

export function resolveSheetModalLayout({
  viewportWidth,
  viewportHeight,
  topInset,
  pageTopOffset,
}: {
  viewportWidth: number;
  viewportHeight: number;
  topInset: number;
  pageTopOffset: number;
}) {
  return {
    width: viewportWidth,
    maxHeight: Math.max(0, viewportHeight - topInset - pageTopOffset),
  };
}

export function resolveTopmostModalId<T extends { id: ModalId }>(
  items: readonly T[]
) {
  const topmostItem = items.at(-1);
  return topmostItem?.id ?? null;
}
