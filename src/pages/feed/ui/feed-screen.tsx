import { View } from 'react-native';

import { VideoFeed } from '@/widgets/video-feed';

import { useFeedScreenController } from '../model/use-feed-screen-controller';

export function FeedScreen() {
  const controller = useFeedScreenController();

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <VideoFeed
        activeIndex={controller.activeIndex}
        activeItemId={controller.activeItemId}
        debugLabel={controller.debugLabel}
        isInitialLoading={controller.isInitialLoading}
        isMuted={controller.isMuted}
        items={controller.items}
        overlayModel={controller.overlayModel}
        setActiveItem={controller.setActiveItem}
        toggleMuted={controller.toggleMuted}
      />
    </View>
  );
}
