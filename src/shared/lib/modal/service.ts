import { modalStore } from './store';
import type { ModalController, ModalDescriptor, ModalId } from './types';

export const modalService: ModalController = {
  present(descriptor: ModalDescriptor): ModalId {
    return modalStore.present(descriptor);
  },

  dismiss(id: ModalId): void {
    modalStore.dismiss(id, 'imperative');
  },

  dismissTop(): void {
    modalStore.dismissTop('imperative');
  },

  clear(): void {
    modalStore.clear();
  },
};
