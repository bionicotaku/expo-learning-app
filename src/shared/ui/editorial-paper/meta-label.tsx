import { Text } from 'react-native';

import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';

import type { MetaLabelProps } from './types';
import { resolveEditorialPaperTextColor } from './utils';

export function MetaLabel({
  children,
  tone = 'inkMute',
  uppercase = true,
  style,
  ...textProps
}: MetaLabelProps) {
  const { tokens } = useEditorialPaperTheme();

  return (
    <Text
      style={[
        {
          color: resolveEditorialPaperTextColor(tokens, tone),
          textTransform: uppercase ? tokens.typography.meta.textTransform : 'none',
        },
        tokens.typography.meta,
        style,
      ]}
      {...textProps}
    >
      {children}
    </Text>
  );
}
