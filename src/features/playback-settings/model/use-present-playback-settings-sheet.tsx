import { useCallback } from 'react';

import { useModalController } from '@/shared/lib/modal';

import { PlaybackSettingsSheetContent } from '../ui/playback-settings-sheet-content';

export function usePresentPlaybackSettingsSheet() {
  const modal = useModalController();

  return useCallback(() => {
    modal.present({
      debugLabel: 'playback-settings',
      presentation: 'sheet',
      render: () => <PlaybackSettingsSheetContent />,
    });
  }, [modal]);
}
