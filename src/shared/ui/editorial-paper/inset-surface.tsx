import { View } from 'react-native';

import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';

import type { SharedSurfaceProps } from './types';
import {
  resolveEditorialPaperRadius,
  resolveEditorialPaperToneColor,
} from './utils';

export function InsetSurface({
  children,
  tone = 'background',
  radius,
  style,
  ...viewProps
}: SharedSurfaceProps) {
  const { tokens } = useEditorialPaperTheme();

  return (
    <View
      style={[
        {
          backgroundColor: resolveEditorialPaperToneColor(tokens, tone),
          borderRadius: resolveEditorialPaperRadius(tokens, radius, 'control'),
          borderCurve: 'continuous',
          boxShadow: tokens.elevation.inset,
        },
        style,
      ]}
      {...viewProps}
    >
      {children}
    </View>
  );
}
