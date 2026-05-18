import type { ReactNode } from 'react';
import { View } from 'react-native';

import type { ModalPresentation } from '@/shared/lib/modal/types';
import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';
import { AdaptiveGlass } from '@/shared/ui/editorial-paper/adaptive-glass';

import {
  MODAL_SHEET_HANDLE_HEIGHT,
  MODAL_SHEET_HANDLE_OPACITY,
  MODAL_SHEET_HANDLE_WIDTH,
} from './modal-design';
import { ModalContentLayoutProvider } from './modal-content-layout';

type ModalFrameProps = {
  presentation: ModalPresentation;
  width: number;
  maxHeight: number;
  bottomInset: number;
  children: ReactNode;
};

export function ModalFrame({
  presentation,
  width,
  maxHeight,
  bottomInset,
  children,
}: ModalFrameProps) {
  const { tokens } = useEditorialPaperTheme();
  const dialogContentMaxHeight = Math.max(
    0,
    maxHeight - tokens.spacing.xxl * 2
  );
  const sheetHandleBlockHeight =
    tokens.spacing.sm + MODAL_SHEET_HANDLE_HEIGHT + tokens.spacing.xs;
  const sheetContentMaxHeight = Math.max(
    0,
    maxHeight -
      sheetHandleBlockHeight -
      tokens.spacing.xl -
      Math.max(bottomInset, tokens.spacing.xl)
  );

  if (presentation === 'sheet') {
    return (
      <AdaptiveGlass
        appearance="default"
        radius={tokens.radius.cardLg}
        style={{
          width,
          maxHeight,
          alignSelf: 'stretch',
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          padding: 0,
        }}
      >
        <View
          pointerEvents="none"
          style={{
            alignItems: 'center',
            paddingTop: tokens.spacing.sm,
            paddingBottom: tokens.spacing.xs,
          }}
        >
          <View
            style={{
              width: MODAL_SHEET_HANDLE_WIDTH,
              height: MODAL_SHEET_HANDLE_HEIGHT,
              borderRadius: tokens.radius.pill,
              backgroundColor: tokens.color.inkMute,
              opacity: MODAL_SHEET_HANDLE_OPACITY,
            }}
          />
        </View>

        <ModalContentLayoutProvider
          contentMaxHeight={sheetContentMaxHeight}
        >
          <View
            style={{
              paddingTop: tokens.spacing.xl,
              paddingRight: tokens.spacing.xl,
              paddingBottom: Math.max(bottomInset, tokens.spacing.xl),
              paddingLeft: tokens.spacing.xl,
            }}
          >
            {children}
          </View>
        </ModalContentLayoutProvider>
      </AdaptiveGlass>
    );
  }

  return (
    <AdaptiveGlass
      appearance="default"
      radius={tokens.radius.cardLg}
      style={{
        width,
        maxHeight,
        padding: tokens.spacing.xxl,
      }}
    >
      <ModalContentLayoutProvider
        contentMaxHeight={dialogContentMaxHeight}
      >
        {children}
      </ModalContentLayoutProvider>
    </AdaptiveGlass>
  );
}
