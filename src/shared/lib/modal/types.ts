import type { ReactNode } from 'react';

export type ModalId = string;

export type ModalPresentation = 'dialog' | 'sheet';

export type ModalPhase = 'entering' | 'visible' | 'exiting';

export type ModalDismissReason = 'imperative' | 'backdrop' | 'gesture' | 'clear';

export type ModalRenderContext = {
  dismiss: () => void;
  dismissTop: () => void;
  clear: () => void;
};

export type ModalDismissContext = {
  id: ModalId;
  reason: ModalDismissReason;
};

export type ModalPresentResult = {
  readonly id: ModalId | null;
  readonly didPresent: boolean;
};

export type ModalDescriptor = {
  readonly id?: ModalId;
  readonly debugLabel?: string;
  readonly presentation: ModalPresentation;
  readonly dismissOnBackdropPress?: boolean;
  readonly onDidDismiss?: (context: ModalDismissContext) => void;
  readonly render: (context: ModalRenderContext) => ReactNode;
};

export type ModalRecord = {
  readonly id: ModalId;
  readonly debugLabel?: string;
  readonly presentation: ModalPresentation;
  readonly dismissOnBackdropPress: boolean;
  readonly onDidDismiss?: ModalDescriptor['onDidDismiss'];
  readonly render: ModalDescriptor['render'];
  readonly phase: ModalPhase;
  readonly dismissReason?: ModalDismissReason;
};

export type ModalStoreListener = () => void;

export type ModalStore = {
  getSnapshot: () => ModalRecord | null;
  subscribe: (listener: ModalStoreListener) => () => void;
  present: (descriptor: ModalDescriptor) => ModalPresentResult;
  markVisible: (id: ModalId) => void;
  dismiss: (id: ModalId, reason: ModalDismissReason) => void;
  dismissTop: (reason: ModalDismissReason) => void;
  remove: (id: ModalId) => void;
  clear: () => void;
};

export type ModalController = {
  present: (descriptor: ModalDescriptor) => ModalPresentResult;
  dismiss: (id: ModalId) => void;
  dismissTop: () => void;
  clear: () => void;
};
