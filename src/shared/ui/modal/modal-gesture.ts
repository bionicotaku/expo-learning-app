import {
  MODAL_SHEET_DISMISS_TRANSLATION_Y,
  MODAL_SHEET_DISMISS_VELOCITY_Y,
} from './modal-design';

export function shouldDismissSheetGesture({
  translationY,
  velocityY,
}: {
  translationY: number;
  velocityY: number;
}) {
  'worklet';

  return (
    translationY >= MODAL_SHEET_DISMISS_TRANSLATION_Y ||
    velocityY >= MODAL_SHEET_DISMISS_VELOCITY_Y
  );
}
