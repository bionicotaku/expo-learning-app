import { Text, View } from 'react-native';
import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';
import { RaisedSurface } from '@/shared/ui/editorial-paper';

import { AuthCodeRow } from './auth-code-row';
import { AuthCardTitle } from './auth-card-title';
import { AuthField } from './auth-field';
import { AuthPrimaryButton } from './auth-primary-button';

type StructuredAuthCardProps = {
  title: string;
  confirmLabel?: string;
};

export function StructuredAuthCard({
  title,
  confirmLabel = '确认',
}: StructuredAuthCardProps) {
  const { tokens } = useEditorialPaperTheme();

  return (
    <RaisedSurface
      radius="cardLg"
      style={{
        paddingHorizontal: 22,
        paddingVertical: 22,
      }}
    >
      <AuthCardTitle>{title}</AuthCardTitle>
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
