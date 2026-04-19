import type { ReactNode } from 'react';
import type { PressableProps, StyleProp, TextProps, ViewProps, ViewStyle } from 'react-native';

export type EditorialPaperTone =
  | 'background'
  | 'surface'
  | 'accent'
  | 'gold'
  | 'cocoa'
  | 'softActionRose'
  | 'softActionPeach'
  | 'softActionButter'
  | 'softActionPistachio'
  | 'softActionLavender'
  | 'softActionSky';

export type EditorialPaperControlSize = 'sm' | 'md' | 'lg';

export type EditorialPaperRadiusKey = 'cardLg' | 'cardMd' | 'control' | 'pill';

export type SharedSurfaceProps = ViewProps & {
  children?: ReactNode;
  tone?: EditorialPaperTone;
  radius?: EditorialPaperRadiusKey | number;
  style?: StyleProp<ViewStyle>;
};

export type EditorialTextTone = 'ink' | 'inkSoft' | 'inkMute';

export type EditorialTitleProps = TextProps & {
  children: ReactNode;
  variant?: 'display' | 'title';
  tone?: EditorialTextTone;
};

export type MetaLabelProps = TextProps & {
  children: ReactNode;
  tone?: EditorialTextTone;
  uppercase?: boolean;
};

export type SoftActionButtonProps = Omit<PressableProps, 'children'> & {
  children?: ReactNode;
  icon?: ReactNode;
  tone?: EditorialPaperTone;
  size?: EditorialPaperControlSize;
  disabled?: boolean;
  iconPlacement?: 'start' | 'end';
  style?: StyleProp<ViewStyle>;
};

export type IconPillProps = Omit<PressableProps, 'children'> & {
  children: ReactNode;
  tone?: EditorialPaperTone;
  size?: EditorialPaperControlSize;
  shape?: 'circle' | 'pill';
  style?: StyleProp<ViewStyle>;
};

export type SegmentedFilterBarItem<T extends string | number> = {
  label: string;
  value: T;
  tone?: EditorialPaperTone;
  disabled?: boolean;
};

export type SegmentedFilterBarProps<T extends string | number> = {
  items: SegmentedFilterBarItem<T>[];
  value: T;
  onChange: (nextValue: T) => void;
  tone?: EditorialPaperTone;
  selectedTextColor?: string;
  inactiveTextColor?: string;
  style?: StyleProp<ViewStyle>;
};

export type AdaptiveGlassProps = ViewProps & {
  children?: ReactNode;
  variant?: 'overlay' | 'chrome' | 'pill';
  interactive?: boolean;
  fallbackMode?: 'auto' | 'blur' | 'translucent';
  radius?: number;
  style?: StyleProp<ViewStyle>;
};
