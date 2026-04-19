import type { ToastKind } from '@/shared/lib/toast/types';

export const TOAST_TOP_OFFSET = -20;
export const TOAST_HOST_Z_INDEX = 1000;
export const TOAST_STACK_GAP = 8;
export const TOAST_HORIZONTAL_MARGIN = 35;
export const TOAST_BORDER_RADIUS = 24;
export const TOAST_CONTAINER_MIN_HEIGHT = 48;
export const TOAST_CONTAINER_PADDING_HORIZONTAL = 16;
export const TOAST_CONTAINER_PADDING_VERTICAL = 12;
export const TOAST_ICON_SIZE = 24;
export const TOAST_ICON_PADDING = 8;
export const TOAST_TITLE_MAX_LINES = 1;
export const TOAST_MESSAGE_MAX_LINES = 2;
export const TOAST_BLUR_INTENSITY = 60;
export const TOAST_BACKGROUND_OPACITY = 0.2;
export const TOAST_TITLE_OPACITY = 0.75;
export const TOAST_MESSAGE_OPACITY = 0.75;
export const TOAST_ICON_OPACITY = 0.7;
export const TOAST_ENTER_DURATION_MS = 220;
export const TOAST_EXIT_DURATION_MS = 180;
export const TOAST_ENTER_TRANSLATE_Y = -12;
export const TOAST_EXIT_TRANSLATE_Y = -18;
export const TOAST_ENTER_SCALE = 0.98;
export const TOAST_DISMISS_TRANSLATION_Y = -36;
export const TOAST_DISMISS_VELOCITY_Y = -600;

export const TOAST_TYPE_COLORS: Record<ToastKind, string> = {
  success: '#34C759',
  error: '#FF3B30',
  warning: '#FF9500',
  info: '#007AFF',
};

export const TOAST_TYPE_ICONS: Record<ToastKind, string> = {
  success: 'check-circle',
  error: 'error-outline',
  warning: 'warning',
  info: 'info',
};

export function withToastAlpha(color: string, opacity: number) {
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');

  return `${color}${alpha}`;
}

export function shouldDismissToastGesture({
  translationY,
  velocityY,
}: {
  translationY: number;
  velocityY: number;
}) {
  return (
    translationY <= TOAST_DISMISS_TRANSLATION_Y ||
    velocityY <= TOAST_DISMISS_VELOCITY_Y
  );
}
