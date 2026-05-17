import type { AnalyticsClientContext } from '@/shared/lib/client-environment';

export type WatchProgressSurface = 'detail' | 'feed' | 'fullscreen';

export type WatchProgressRequestBody = {
  active_watch_ms: number;
  client_context: AnalyticsClientContext;
  occurred_at: string;
  position_ms: number;
  source_surface: WatchProgressSurface;
  video_id: string;
  watch_session_id: string;
};

export type WatchProgressWriteResponse = {
  accepted: boolean;
};

export type WatchProgressWriteRequest = {
  body: WatchProgressRequestBody;
  method: 'POST';
  path: string;
};
