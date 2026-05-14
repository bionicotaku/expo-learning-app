import type { AnalyticsClientContext } from '@/shared/lib/client-environment';

export type WatchProgressSurface = 'detail' | 'feed' | 'fullscreen';

export type WatchProgressRequestBody = {
  client_context: AnalyticsClientContext;
  duration_ms: number;
  is_completed: boolean;
  occurred_at: string;
  position_ms: number;
  source_surface: WatchProgressSurface;
  watch_session_id: string;
};

export type WatchProgressWriteRequest = {
  body: WatchProgressRequestBody;
  method: 'POST';
  path: string;
};
