import { useSyncExternalStore } from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { toastStore } from '@/shared/lib/toast/store';

import { ToastCard } from './ToastCard';
import {
  TOAST_HOST_Z_INDEX,
  TOAST_STACK_GAP,
  TOAST_TOP_OFFSET,
} from './toast-design';

export function ToastHost() {
  const insets = useSafeAreaInsets();
  const items = useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    toastStore.getSnapshot
  );

  if (Platform.OS === 'web' || items.length === 0) {
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
        zIndex: TOAST_HOST_Z_INDEX,
        elevation: TOAST_HOST_Z_INDEX,
      }}
    >
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          top: insets.top + TOAST_TOP_OFFSET,
          right: 0,
          left: 0,
          alignItems: 'center',
          gap: TOAST_STACK_GAP,
        }}
      >
        {items.map((item, index) => (
          <ToastCard
            key={item.id}
            record={item}
            stackIndex={index}
            onDismissRequest={toastStore.markExiting}
            onRemove={toastStore.remove}
            onVisible={toastStore.markVisible}
          />
        ))}
      </View>
    </View>
  );
}
