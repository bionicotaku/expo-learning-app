import { Pressable, Text, View } from 'react-native';

import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';
import { InsetSurface, MetaLabel, RaisedSurface } from '@/shared/ui/editorial-paper';

type AuthCodeRowProps = {
  label?: string;
  value?: string;
  marginBottom?: number;
};

export function AuthCodeRow({
  label = '验证码',
  value = '284931',
  marginBottom = 18,
}: AuthCodeRowProps) {
  const { tokens } = useEditorialPaperTheme();

  return (
    <View style={{ marginBottom }}>
      <MetaLabel uppercase={false} style={{ marginBottom: 6 }}>
        {label}
      </MetaLabel>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'stretch',
          gap: 10,
        }}
      >
        <View style={{ flex: 1 }}>
          <InsetSurface radius="control">
            <View
              style={{
                minHeight: 46,
                paddingHorizontal: 16,
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  lineHeight: 20,
                  fontWeight: '500',
                  color: tokens.color.ink,
                }}
              >
                {value}
              </Text>
            </View>
          </InsetSurface>
        </View>
        <Pressable accessibilityRole="button" style={{ width: 88 }}>
          <RaisedSurface
            radius="control"
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: tokens.color.surface,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: '#6E4E42',
              }}
            >
              发送
            </Text>
          </RaisedSurface>
        </Pressable>
      </View>
    </View>
  );
}
