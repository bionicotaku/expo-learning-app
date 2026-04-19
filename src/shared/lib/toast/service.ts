import { toastStore } from './store';
import type { ToastConfig, ToastId } from './types';

export const toast = {
  show(config: ToastConfig): ToastId {
    return toastStore.enqueue(config);
  },

  dismiss(id: ToastId): void {
    toastStore.markExiting(id);
  },

  clear(): void {
    toastStore.clearAll();
  },
} as const;
