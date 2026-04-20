import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { modalStore } from '@/shared/lib/modal/store';
import type { ModalRecord } from '@/shared/lib/modal/types';
import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';

import { ModalFrame } from './ModalFrame';
import {
  MODAL_DIALOG_MAX_WIDTH,
  MODAL_DIALOG_ENTER_DURATION_MS,
  MODAL_DIALOG_ENTER_SCALE,
  MODAL_DIALOG_EXIT_DURATION_MS,
  MODAL_DIALOG_TRANSLATE_Y,
  MODAL_SHEET_ENTER_DURATION_MS,
  MODAL_SHEET_EXIT_DURATION_MS,
  MODAL_SHEET_SETTLE_SPRING,
  MODAL_STACK_BASE_Z_INDEX,
} from './modal-design';
import { shouldDismissSheetGesture } from './modal-gesture';
import {
  resolveDialogModalLayout,
  resolveSheetModalLayout,
} from './modal-layout';

type ModalItemProps = {
  record: ModalRecord;
  isTopMost: boolean;
  stackIndex: number;
  viewportWidth: number;
  viewportHeight: number;
  topInset: number;
  bottomInset: number;
};

export function ModalItem({
  record,
  isTopMost,
  stackIndex,
  viewportWidth,
  viewportHeight,
  topInset,
  bottomInset,
}: ModalItemProps) {
  const { tokens } = useEditorialPaperTheme();
  const enterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const opacity = useSharedValue(record.presentation === 'dialog' ? 0 : 1);
  const scale = useSharedValue(
    record.presentation === 'dialog' ? MODAL_DIALOG_ENTER_SCALE : 1
  );
  const translateY = useSharedValue(
    record.presentation === 'dialog' ? MODAL_DIALOG_TRANSLATE_Y : viewportHeight
  );

  const layout =
    record.presentation === 'dialog'
      ? resolveDialogModalLayout({
          viewportWidth,
          viewportHeight,
          topInset,
          bottomInset,
          horizontalMargin: tokens.spacing.pageX,
          maxWidth: MODAL_DIALOG_MAX_WIDTH,
        })
      : resolveSheetModalLayout({
          viewportWidth,
          viewportHeight,
          topInset,
          pageTopOffset: tokens.spacing.pageTop,
        });

  useEffect(() => {
    return () => {
      if (enterTimerRef.current) {
        clearTimeout(enterTimerRef.current);
      }

      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (record.phase !== 'entering') {
      return;
    }

    if (record.presentation === 'dialog') {
      opacity.value = withTiming(1, {
        duration: MODAL_DIALOG_ENTER_DURATION_MS,
        easing: Easing.out(Easing.cubic),
      });
      scale.value = withTiming(1, {
        duration: MODAL_DIALOG_ENTER_DURATION_MS,
        easing: Easing.out(Easing.cubic),
      });
      translateY.value = withTiming(0, {
        duration: MODAL_DIALOG_ENTER_DURATION_MS,
        easing: Easing.out(Easing.cubic),
      });

      enterTimerRef.current = setTimeout(() => {
        modalStore.markVisible(record.id);
      }, MODAL_DIALOG_ENTER_DURATION_MS);
    } else {
      translateY.value = withTiming(0, {
        duration: MODAL_SHEET_ENTER_DURATION_MS,
        easing: Easing.out(Easing.cubic),
      });

      enterTimerRef.current = setTimeout(() => {
        modalStore.markVisible(record.id);
      }, MODAL_SHEET_ENTER_DURATION_MS);
    }

    return () => {
      if (enterTimerRef.current) {
        clearTimeout(enterTimerRef.current);
        enterTimerRef.current = null;
      }
    };
  }, [opacity, record.id, record.phase, record.presentation, scale, translateY]);

  useEffect(() => {
    if (record.phase !== 'exiting') {
      return;
    }

    if (record.presentation === 'dialog') {
      opacity.value = withTiming(0, {
        duration: MODAL_DIALOG_EXIT_DURATION_MS,
        easing: Easing.in(Easing.cubic),
      });
      scale.value = withTiming(MODAL_DIALOG_ENTER_SCALE, {
        duration: MODAL_DIALOG_EXIT_DURATION_MS,
        easing: Easing.in(Easing.cubic),
      });
      translateY.value = withTiming(MODAL_DIALOG_TRANSLATE_Y, {
        duration: MODAL_DIALOG_EXIT_DURATION_MS,
        easing: Easing.in(Easing.cubic),
      });

      exitTimerRef.current = setTimeout(() => {
        modalStore.remove(record.id);
      }, MODAL_DIALOG_EXIT_DURATION_MS);
    } else {
      translateY.value = withTiming(viewportHeight, {
        duration: MODAL_SHEET_EXIT_DURATION_MS,
        easing: Easing.in(Easing.cubic),
      });

      exitTimerRef.current = setTimeout(() => {
        modalStore.remove(record.id);
      }, MODAL_SHEET_EXIT_DURATION_MS);
    }

    return () => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    };
  }, [
    opacity,
    record.id,
    record.phase,
    record.presentation,
    scale,
    translateY,
    viewportHeight,
  ]);

  const gesture = useMemo(() => {
    const canDrag =
      isTopMost && record.presentation === 'sheet' && record.phase !== 'exiting';

    return Gesture.Pan()
      .enabled(canDrag)
      .activeOffsetY([6, 9999])
      .failOffsetX([-16, 16])
      .onUpdate((event) => {
        if (event.translationY > 0) {
          translateY.value = event.translationY;
        }
      })
      .onEnd((event) => {
        if (
          shouldDismissSheetGesture({
            translationY: event.translationY,
            velocityY: event.velocityY,
          })
        ) {
          runOnJS(modalStore.dismiss)(record.id, 'gesture');
          return;
        }

        translateY.value = withSpring(0, MODAL_SHEET_SETTLE_SPRING);
      });
  }, [isTopMost, record.id, record.phase, record.presentation, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const wrapperStyle =
    record.presentation === 'dialog'
      ? {
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
          paddingHorizontal: tokens.spacing.pageX,
        }
      : {
          justifyContent: 'flex-end' as const,
        };

  const renderedContent = record.render({
    dismiss: () => {
      modalStore.dismiss(record.id, 'imperative');
    },
    dismissTop: () => {
      modalStore.dismissTop('imperative');
    },
    clear: () => {
      modalStore.clear();
    },
    isTopMost,
  });

  return (
    <View
      pointerEvents="box-none"
      style={[
        StyleSheet.absoluteFillObject,
        {
          zIndex: MODAL_STACK_BASE_Z_INDEX + stackIndex,
        },
      ]}
    >
      <GestureDetector gesture={gesture}>
        <View
          pointerEvents="box-none"
          style={[
            StyleSheet.absoluteFillObject,
            wrapperStyle,
          ]}
        >
          <Animated.View
            pointerEvents={isTopMost ? 'auto' : 'none'}
            style={animatedStyle}
          >
            <ModalFrame
              bottomInset={bottomInset}
              maxHeight={layout.maxHeight}
              presentation={record.presentation}
              width={layout.width}
            >
              {renderedContent}
            </ModalFrame>
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
}
