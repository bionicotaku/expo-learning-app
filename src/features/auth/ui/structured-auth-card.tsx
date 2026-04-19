import { Text, View } from 'react-native';

import {
  editorialPaperCjkTitleFontFamily,
  useEditorialPaperTheme,
} from '@/shared/theme/editorial-paper';
import { RaisedSurface } from '@/shared/ui/editorial-paper';

import { AuthCodeRow } from './auth-code-row';
import { AuthField } from './auth-field';
import { AuthPrimaryButton } from './auth-primary-button';
import { resolveStructuredAuthTitleFontFamily } from './title-font';

type StructuredAuthCardProps = {
  title: string;
  confirmLabel?: string;
};

export function StructuredAuthCard({
  title,
  confirmLabel = '确认',
}: StructuredAuthCardProps) {
  const { tokens } = useEditorialPaperTheme();
  const titleFontFamily = resolveStructuredAuthTitleFontFamily(
    title,
    tokens.typography.title.fontFamily,
    editorialPaperCjkTitleFontFamily
  );

  return (
    <RaisedSurface
      radius="cardLg"
      style={{
        paddingHorizontal: 22,
        paddingVertical: 22,
      }}
    >
      <Text
        style={{
          color: tokens.color.ink,
          fontFamily: titleFontFamily,
          fontSize: 28,
          lineHeight: 30,
          fontWeight: '500',
          letterSpacing: -0.8,
          marginBottom: 18,
        }}
      >
        {title}
      </Text>
      <AuthField label="邮箱" value="name@learnability.app" />
      <AuthCodeRow marginBottom={14} />
      <AuthField label="密码" value="•••••••••••" />
      <AuthField label="确认密码" value="•••••••••••" marginBottom={18} />
      <AuthPrimaryButton>{confirmLabel}</AuthPrimaryButton>
      <View style={{ marginTop: 14, alignItems: 'center' }}>
        <Text
          style={{
            fontSize: 11.5,
            lineHeight: 17,
            fontWeight: '500',
            color: tokens.color.inkSoft,
          }}
        >
          继续即表示同意 Terms & Privacy
        </Text>
      </View>
    </RaisedSurface>
  );
}
