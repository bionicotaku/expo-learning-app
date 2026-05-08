import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('use present playback settings sheet source', () => {
  it('presents the playback settings content as a shared sheet modal', () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        'src/features/playback-settings/model/use-present-playback-settings-sheet.tsx'
      ),
      'utf8'
    );

    expect(source).toContain("import { useModalController } from '@/shared/lib/modal';");
    expect(source).toContain("presentation: 'sheet'");
    expect(source).toContain("debugLabel: 'playback-settings'");
    expect(source).toContain('<PlaybackSettingsSheetContent />');
  });
});
