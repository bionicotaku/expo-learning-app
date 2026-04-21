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
          boxShadow: tokens.elevation.soft,
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
        boxShadow: tokens.elevation.raised,
      }}
    >
      {children}
    </AdaptiveGlass>
  );
}
