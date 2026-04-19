import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';

export function SavePage() {
  const { tokens } = useEditorialPaperTheme();

  return (
    <>
      <StatusBar style="dark" />
      <View style={{ flex: 1, backgroundColor: tokens.color.background }} />
    </>
  );
}
