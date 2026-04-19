import { Pressable, Text, View } from 'react-native';

import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';

import { InsetSurface } from './inset-surface';
import { RaisedSurface } from './raised-surface';
import type { SegmentedFilterBarProps } from './types';
import { resolveEditorialPaperTextColor } from './utils';

export function SegmentedFilterBar<T extends string | number>({
  items,
  value,
  onChange,
  tone = 'softActionPeach',
  style,
}: SegmentedFilterBarProps<T>) {
  const { tokens } = useEditorialPaperTheme();

  return (
    <InsetSurface
      radius="pill"
      style={[
        {
          padding: 6,
        },
        style,
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          gap: 4,
        }}
      >
        {items.map((item) => {
          const selected = item.value === value;

          return (
            <Pressable
              key={String(item.value)}
              accessibilityRole="button"
              disabled={item.disabled}
              onPress={() => {
                if (!item.disabled) {
                  onChange(item.value);
                }
              }}
              style={{ flex: 1 }}
            >
              {selected ? (
                <RaisedSurface
                  tone={item.tone ?? tone}
                  radius="pill"
                  style={{
                    minHeight: 34,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: tokens.spacing.md,
                  }}
                >
                  <Text
                    style={{
                      ...tokens.typography.meta,
                      textTransform: 'none',
                      color: tokens.color.inkSoft,
                    }}
                  >
                    {item.label}
                  </Text>
                </RaisedSurface>
              ) : (
                <View
                  style={{
                    minHeight: 34,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: tokens.spacing.md,
                    opacity: item.disabled ? 0.45 : 1,
                  }}
                >
                  <Text
                    style={{
                      ...tokens.typography.meta,
                      textTransform: 'none',
                      color: resolveEditorialPaperTextColor(tokens, 'inkSoft'),
                    }}
                  >
                    {item.label}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </InsetSurface>
  );
}
