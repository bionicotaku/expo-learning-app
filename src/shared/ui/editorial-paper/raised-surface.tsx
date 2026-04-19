import { View } from 'react-native';

import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';

import type { SharedSurfaceProps } from './types';
import {
  resolveEditorialPaperRadius,
  resolveEditorialPaperToneColor,
} from './utils';

export function RaisedSurface({
  children,
  tone = 'surface',
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
          borderRadius: resolveEditorialPaperRadius(tokens, radius, 'cardMd'),
          borderCurve: 'continuous',
          boxShadow: tokens.elevation.raised,
        },
        style,
      ]}
      {...viewProps}
    >
      {children}
    </View>
  );
}
