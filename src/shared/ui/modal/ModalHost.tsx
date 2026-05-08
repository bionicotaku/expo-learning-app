import { Platform, View, useWindowDimensions } from 'react-native';
import { useSyncExternalStore } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { modalStore } from '@/shared/lib/modal/store';

import { ModalBackdrop } from './ModalBackdrop';
import { MODAL_HOST_Z_INDEX } from './modal-design';
import { ModalItem } from './ModalItem';

export function ModalHost() {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const currentModal = useSyncExternalStore(
    modalStore.subscribe,
    modalStore.getSnapshot,
    modalStore.getSnapshot
  );
  const isBackdropVisible =
    currentModal !== null && currentModal.phase !== 'exiting';

  if (Platform.OS === 'web') {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: MODAL_HOST_Z_INDEX,
        elevation: MODAL_HOST_Z_INDEX,
      }}
    >
      <ModalBackdrop
        onPress={() => {
          if (
            currentModal &&
            currentModal.phase !== 'exiting' &&
            currentModal.dismissOnBackdropPress
          ) {
            modalStore.dismiss(currentModal.id, 'backdrop');
          }
        }}
        visible={isBackdropVisible}
      />

      {currentModal ? (
        <ModalItem
          key={currentModal.id}
          bottomInset={insets.bottom}
          record={currentModal}
          topInset={insets.top}
          viewportHeight={height}
          viewportWidth={width}
        />
      ) : null}
    </View>
  );
}
