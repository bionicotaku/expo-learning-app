import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';
import { SegmentedFilterBar } from '@/shared/ui/editorial-paper';

import { resolveAuthLoginModeLabel } from '../model/auth-copy';
import type { AuthLoginMode } from '../model/auth-ui-state';

type AuthModeTabsProps = {
  activeMode: AuthLoginMode;
  onChangeMode: (mode: AuthLoginMode) => void;
};

const tabItems: readonly {
  mode: AuthLoginMode;
  label: string;
  tone: 'softActionPeach' | 'softActionButter';
}[] = [
  {
    mode: 'password',
    label: resolveAuthLoginModeLabel('password'),
    tone: 'softActionPeach',
  },
  {
    mode: 'code',
    label: resolveAuthLoginModeLabel('code'),
    tone: 'softActionButter',
  },
];

export function AuthModeTabs({ activeMode, onChangeMode }: AuthModeTabsProps) {
  const { tokens } = useEditorialPaperTheme();

  return (
    <SegmentedFilterBar
      inactiveTextColor={tokens.color.inkSoft}
      items={tabItems.map((item) => ({
        label: item.label,
        value: item.mode,
        tone: item.tone,
      }))}
      onChange={onChangeMode}
      selectedTextColor="#6E4E42"
      value={activeMode}
    />
  );
}
