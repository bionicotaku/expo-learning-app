import type { VideoAsset } from './types';

export const VIDEO_ASSETS: VideoAsset[] = [
  {
    assetId: 'asset-1',
    uri: 'https://storage.googleapis.com/videos2077/test-video/test1.mp4',
    defaultTitle: 'Asset 01',
    defaultSubtitle: 'Remote MP4 stream · vertical feed prototype',
  },
  {
    assetId: 'asset-2',
    uri: 'https://storage.googleapis.com/videos2077/test-video/test2.mp4',
    defaultTitle: 'Asset 02',
    defaultSubtitle: 'Expo Video + FlatList paging',
  },
  {
    assetId: 'asset-3',
    uri: 'https://storage.googleapis.com/videos2077/test-video/test3.mp4',
    defaultTitle: 'Asset 03',
    defaultSubtitle: 'FSD widget layer driving the feed',
  },
  {
    assetId: 'asset-4',
    uri: 'https://storage.googleapis.com/videos2077/test-video/test4.mp4',
    defaultTitle: 'Asset 04',
    defaultSubtitle: 'Paginated feed append checkpoint',
  },
  {
    assetId: 'asset-5',
    uri: 'https://storage.googleapis.com/videos2077/test-video/test5.mp4',
    defaultTitle: 'Asset 05',
    defaultSubtitle: 'Muted by default, tap anywhere to toggle sound',
  },
];
