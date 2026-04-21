import { Text, View } from 'react-native';

import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';
import { InsetSurface, MetaLabel } from '@/shared/ui/editorial-paper';

type AuthFieldProps = {
  label: string;
  value: string;
  trailing?: React.ReactNode;
  marginBottom?: number;
};

export function AuthField({
  label,
  value,
  trailing = null,
  marginBottom = 14,
}: AuthFieldProps) {
  const { tokens } = useEditorialPaperTheme();

  return (
    <View style={{ marginBottom }}>
      <MetaLabel uppercase={false} style={{ marginBottom: 6 }}>
        {label}
      </MetaLabel>
      <InsetSurface radius="control">
        <View
          style={{
            minHeight: 46,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Text
            style={{
              flex: 1,
              fontSize: 15,
              lineHeight: 20,
              fontWeight: '500',
              color: tokens.color.ink,
            }}
          >
            {value}
          </Text>
          {trailing}
        </View>
      </InsetSurface>
    </View>
  );
}
