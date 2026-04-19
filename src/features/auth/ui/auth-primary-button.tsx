import { Pressable, Text, View } from 'react-native';

import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';

type AuthPrimaryButtonProps = {
  children: string;
};

export function AuthPrimaryButton({ children }: AuthPrimaryButtonProps) {
  const { tokens } = useEditorialPaperTheme();

  return (
    <Pressable accessibilityRole="button">
      {({ pressed }) => (
        <View
          style={{
            minHeight: 56,
            borderRadius: 22,
            borderCurve: 'continuous',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: tokens.color.softAction.peach,
            boxShadow:
              '6px 6px 14px rgba(215,204,187,1), -4px -4px 10px rgba(255,255,255,0.8), inset 1px 1px 2px rgba(255,255,255,0.22)',
            experimental_backgroundImage:
              'linear-gradient(135deg, #F2C7A7 0%, #E8B8C0 100%)',
            opacity: pressed ? 0.95 : 1,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              lineHeight: 20,
              fontWeight: '700',
              letterSpacing: 0.2,
              color: '#6E4E42',
            }}
          >
            {children}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
