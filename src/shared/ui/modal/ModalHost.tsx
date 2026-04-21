import { Platform, View, useWindowDimensions } from 'react-native';
import { useSyncExternalStore } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { modalStore } from '@/shared/lib/modal/store';

import { ModalBackdrop } from './ModalBackdrop';
import { MODAL_HOST_Z_INDEX } from './modal-design';
import { resolveTopmostModalId } from './modal-layout';
import { ModalItem } from './ModalItem';

export function ModalHost() {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const items = useSyncExternalStore(
    modalStore.subscribe,
    modalStore.getSnapshot,
    modalStore.getSnapshot
  );
  const topmostModalId = resolveTopmostModalId(items);
  const topmostModal = topmostModalId
    ? items.find((item) => item.id === topmostModalId) ?? null
    : null;

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
            topmostModal &&
            topmostModal.phase !== 'exiting' &&
            topmostModal.dismissOnBackdropPress
          ) {
            modalStore.dismiss(topmostModal.id, 'backdrop');
          }
        }}
        visible={items.length > 0}
      />

      {items.map((item, index) => (
        <ModalItem
          key={item.id}
          bottomInset={insets.bottom}
          isTopMost={item.id === topmostModalId}
          record={item}
          stackIndex={index}
          topInset={insets.top}
          viewportHeight={height}
          viewportWidth={width}
        />
      ))}
    </View>
  );
}
