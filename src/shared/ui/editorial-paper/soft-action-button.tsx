import { Pressable, View } from 'react-native';

import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';

import { RaisedSurface } from './raised-surface';
import type { SoftActionButtonProps } from './types';
import { resolveEditorialPaperControlHeight } from './utils';

export function SoftActionButton({
  children,
  icon,
  tone = 'softActionPeach',
  size = 'md',
  disabled = false,
  iconPlacement = 'start',
  style,
  ...pressableProps
}: SoftActionButtonProps) {
  const { tokens } = useEditorialPaperTheme();
  const height = resolveEditorialPaperControlHeight(size);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        {
          opacity: disabled ? 0.55 : pressed ? 0.92 : 1,
        },
        style,
      ]}
      {...pressableProps}
    >
      <RaisedSurface
        tone={tone}
        radius="control"
        style={{
          minHeight: height,
          paddingHorizontal: tokens.spacing.lg,
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            flexDirection: iconPlacement === 'end' ? 'row-reverse' : 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: tokens.spacing.sm,
          }}
        >
          {icon}
          {children}
        </View>
      </RaisedSurface>
    </Pressable>
  );
}
