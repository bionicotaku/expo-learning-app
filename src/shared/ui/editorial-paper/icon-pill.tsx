import { Pressable, View } from 'react-native';

import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';

import { RaisedSurface } from './raised-surface';
import type { IconPillProps } from './types';
import { resolveEditorialPaperControlHeight } from './utils';

export function IconPill({
  children,
  tone = 'surface',
  size = 'md',
  shape = 'circle',
  style,
  onPress,
  disabled,
  ...pressableProps
}: IconPillProps) {
  const { tokens } = useEditorialPaperTheme();
  const height = resolveEditorialPaperControlHeight(size);
  const content = (
    <RaisedSurface
      tone={tone}
      radius="pill"
      style={{
        minHeight: height,
        minWidth: shape === 'circle' ? height : undefined,
        paddingHorizontal: shape === 'pill' ? tokens.spacing.lg : 0,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </View>
    </RaisedSurface>
  );

  if (!onPress) {
    return <View style={style}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          opacity: disabled ? 0.55 : pressed ? 0.9 : 1,
        },
        style,
      ]}
      {...pressableProps}
    >
      {content}
    </Pressable>
  );
}
