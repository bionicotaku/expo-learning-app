import type { ReactNode } from 'react';

export type ModalId = string;

export type ModalPresentation = 'dialog' | 'sheet';

export type ModalPhase = 'entering' | 'visible' | 'exiting';

export type ModalDismissReason = 'imperative' | 'backdrop' | 'gesture' | 'clear';

export type ModalRenderContext = {
  dismiss: () => void;
  dismissTop: () => void;
  clear: () => void;
  isTopMost: boolean;
};

export type ModalDescriptor = {
  readonly id?: ModalId;
  readonly debugLabel?: string;
  readonly presentation: ModalPresentation;
  readonly dismissOnBackdropPress?: boolean;
  readonly render: (context: ModalRenderContext) => ReactNode;
};

export type ModalRecord = {
  readonly id: ModalId;
  readonly debugLabel?: string;
  readonly presentation: ModalPresentation;
  readonly dismissOnBackdropPress: boolean;
  readonly render: ModalDescriptor['render'];
  readonly phase: ModalPhase;
  readonly dismissReason?: ModalDismissReason;
};

export type ModalStoreListener = () => void;

export type ModalStore = {
  getSnapshot: () => readonly ModalRecord[];
  subscribe: (listener: ModalStoreListener) => () => void;
  present: (descriptor: ModalDescriptor) => ModalId;
  markVisible: (id: ModalId) => void;
  dismiss: (id: ModalId, reason: ModalDismissReason) => void;
  dismissTop: (reason: ModalDismissReason) => void;
  remove: (id: ModalId) => void;
  clear: () => void;
};

export type ModalController = {
  present: (descriptor: ModalDescriptor) => ModalId;
  dismiss: (id: ModalId) => void;
  dismissTop: () => void;
  clear: () => void;
};
