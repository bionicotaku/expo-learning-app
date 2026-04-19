import { Text } from 'react-native';

import {
  editorialPaperCjkTitleFontFamily,
  useEditorialPaperTheme,
} from '@/shared/theme/editorial-paper';

import { resolveStructuredAuthTitleFontFamily } from './title-font';

type AuthCardTitleProps = {
  children: string;
  marginBottom?: number;
};

export function AuthCardTitle({
  children,
  marginBottom = 18,
}: AuthCardTitleProps) {
  const { tokens, fontsLoaded } = useEditorialPaperTheme();
  const titleFontFamily = resolveStructuredAuthTitleFontFamily(
    children,
    tokens.typography.title.fontFamily,
    editorialPaperCjkTitleFontFamily,
    fontsLoaded
  );

  return (
    <Text
      style={{
        color: tokens.color.ink,
        fontFamily: titleFontFamily,
        fontSize: 28,
        lineHeight: 30,
        fontWeight: '500',
        letterSpacing: -0.8,
        marginBottom,
      }}
    >
      {children}
    </Text>
  );
}
