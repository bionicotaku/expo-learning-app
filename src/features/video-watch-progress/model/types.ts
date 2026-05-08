export type WatchProgressSource = 'android' | 'ios' | 'web';

export type WatchProgressSurface = 'detail' | 'feed' | 'fullscreen';

export type WatchProgressRequestBody = {
  duration_ms: number;
  is_completed: boolean;
  metadata?: {
    surface: WatchProgressSurface;
  };
  occurred_at: string;
  position_ms: number;
  source: WatchProgressSource;
  watch_session_id: string;
};

export type WatchProgressWriteRequest = {
  body: WatchProgressRequestBody;
  method: 'POST';
  path: string;
};
