import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('me page source', () => {
  it('renders the hardcoded Desk UI without live actions or a week issue bar chart', () => {
    const source = readFileSync(
      new URL('./me-page.tsx', import.meta.url).pathname,
      'utf8'
    );

    expect(source).toContain('ScrollView');
    expect(source).toContain('ProfileSummaryCard');
    expect(source).toContain('StatsStrip');
    expect(source).toContain('WeekIssueTextCard');
    expect(source).toContain('ToastTriggerPanel');
    expect(source).toContain('PlaybackSettingsTestCard');
    expect(source).toContain('GroupedActionList');
    expect(source).toContain('FooterLabel');

    expect(source).toContain('Mika');
    expect(source).toContain('Issue desk · editorial mode');
    expect(source).toContain('22 day streak');
    expect(source).toContain('Saved');
    expect(source).toContain('Reviewed');
    expect(source).toContain('Hours');
    expect(source).toContain('Archive');
    expect(source).toContain('Favorites');
    expect(source).toContain('Review queue');
    expect(source).toContain('Preferences');
    expect(source).toContain('Reading goals');
    expect(source).toContain('Help & feedback');
    expect(source).toContain('Sign out');
    expect(source).toContain('Toast colors');
    expect(source).toContain('Feedback test');
    expect(source).toContain('Success');
    expect(source).toContain('Error');
    expect(source).toContain('Warning');
    expect(source).toContain('Info');
    expect(source).toContain("kind: 'success'");
    expect(source).toContain("kind: 'error'");
    expect(source).toContain("kind: 'warning'");
    expect(source).toContain("kind: 'info'");
    expect(source).toContain("tone: 'softActionPistachio'");
    expect(source).toContain("tone: 'softActionRose'");
    expect(source).toContain("tone: 'softActionButter'");
    expect(source).toContain("tone: 'softActionSky'");
    expect(source).toContain('Show success toast');
    expect(source).toContain('Show error toast');
    expect(source).toContain('Show warning toast');
    expect(source).toContain('Show info toast');
    expect(source).toContain("import { toast } from '@/shared/lib/toast';");
    expect(source).toContain('toast.show({');
    expect(source).toContain('Playback settings');
    expect(source).toContain('usePresentPlaybackSettingsSheet');
    expect(source).not.toContain('132 clips');
    expect(source).not.toContain('58 words');
    expect(source).not.toContain('10 due');
    expect(source).not.toContain('detail?: string;');
    expect(source).not.toContain('item.detail');

    expect(source).toContain("const actionIconTone = 'surface';");
    expect(source).toContain('tone={actionIconTone}');
    expect(source).not.toContain(
      "tone: 'surface' | 'background' | 'softActionPeach' | 'softActionButter';"
    );

    expect(source).toContain('onPress={noopAction}');
    expect(source).not.toContain('router.');
    expect(source).not.toContain('modal.');
    expect(source).not.toContain('signOut');
    expect(source).not.toContain('weekIssueBars');
    expect(source).not.toContain("['M', 'T', 'W', 'T', 'F', 'S', 'S']");
  });
});
