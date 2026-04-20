import { modalService } from './service';
import type { ModalController } from './types';

export function useModalController(): ModalController {
  return modalService;
}
