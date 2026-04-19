import { Text } from 'react-native';

import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';

import type { EditorialTitleProps } from './types';
import { resolveEditorialPaperTextColor } from './utils';

export function EditorialTitle({
  children,
  variant = 'title',
  tone = 'ink',
  style,
  ...textProps
}: EditorialTitleProps) {
  const { tokens } = useEditorialPaperTheme();
  const typography =
    variant === 'display' ? tokens.typography.display : tokens.typography.title;

  return (
    <Text
      style={[
        {
          color: resolveEditorialPaperTextColor(tokens, tone),
        },
        typography,
        style,
      ]}
      {...textProps}
    >
      {children}
    </Text>
  );
}
