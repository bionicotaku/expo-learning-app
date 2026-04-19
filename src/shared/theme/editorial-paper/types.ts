import type { TextStyle } from 'react-native';

export type EditorialPaperThemeKey = 'light';

export type EditorialPaperBaseTypographyToken = {
  fontSize: number;
  lineHeight: number;
  fontWeight: NonNullable<TextStyle['fontWeight']>;
  letterSpacing?: number;
  textTransform?: NonNullable<TextStyle['textTransform']>;
};

export type EditorialPaperDisplayTypographyToken = EditorialPaperBaseTypographyToken & {
  fontFamily: string;
};

export type EditorialPaperSystemTypographyToken = EditorialPaperBaseTypographyToken;

export type EditorialPaperTokens = {
  color: {
    background: string;
    surface: string;
    ink: string;
    inkSoft: string;
    inkMute: string;
    accent: string;
    gold: string;
    cocoa: string;
    softAction: {
      rose: string;
      peach: string;
      butter: string;
      pistachio: string;
      lavender: string;
      sky: string;
    };
  };
  typography: {
    display: EditorialPaperDisplayTypographyToken;
    title: EditorialPaperDisplayTypographyToken;
    body: EditorialPaperSystemTypographyToken;
    meta: EditorialPaperSystemTypographyToken;
  };
  spacing: {
    xxs: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    pageX: number;
    pageTop: number;
    pageBottomWithTab: number;
  };
  radius: {
    cardLg: number;
    cardMd: number;
    control: number;
    pill: number;
  };
  elevation: {
    raised: string;
    soft: string;
    inset: string;
  };
  glass: {
    tint: 'systemMaterial';
    intensity: number;
    translucentBackground: string;
    borderColor: string;
  };
};

export type EditorialPaperThemeContextValue = {
  themeKey: EditorialPaperThemeKey;
  tokens: EditorialPaperTokens;
  fontsLoaded: boolean;
};
