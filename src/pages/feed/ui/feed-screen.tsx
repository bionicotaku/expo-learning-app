import { View } from 'react-native';

import { VideoFeed } from '@/widgets/video-feed';

export function FeedScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <VideoFeed />
    </View>
  );
}
