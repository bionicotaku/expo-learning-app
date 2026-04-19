export type ToastKind = 'success' | 'error' | 'warning' | 'info';

export type ToastId = string;

export type ToastPhase = 'entering' | 'visible' | 'exiting';

export type ToastConfig = {
  readonly kind: ToastKind;
  readonly title: string;
  readonly message?: string;
  readonly durationMs?: number;
};

export type ToastRecord = {
  readonly id: ToastId;
  readonly kind: ToastKind;
  readonly title: string;
  readonly message?: string;
  readonly durationMs: number;
  readonly createdAt: number;
  readonly phase: ToastPhase;
};

export type ToastStoreListener = () => void;

export type ToastStore = {
  getSnapshot: () => readonly ToastRecord[];
  subscribe: (listener: ToastStoreListener) => () => void;
  enqueue: (config: ToastConfig) => ToastId;
  markVisible: (id: ToastId) => void;
  markExiting: (id: ToastId) => void;
  remove: (id: ToastId) => void;
  clearAll: () => void;
};
