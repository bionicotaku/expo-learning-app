# Video Watch Progress Feature

`features/video-watch-progress` owns the watch-progress API contract.

Current responsibilities:

- expose `reportVideoWatchProgress(videoId, body)`
- expose `createWatchProgressRequest(videoId, body)` for request contract tests and future real API wiring
- keep the current repository facade mock-backed

API shape:

- backend semantic endpoint: `POST /api/catalog/videos/:videoId/watch-progress`
- frontend request path: `/catalog/videos/:videoId/watch-progress`
- request body uses snake_case fields:
  - `watch_session_id`
  - `position_ms`
  - `duration_ms`
  - `is_completed`
  - `occurred_at`
  - `source`
  - optional `metadata.surface`

Current mock behavior:

- always resolves `undefined`
- does not validate `videoId`
- does not validate progress values
- does not update feed, video meta, video runtime, or telemetry queue
- does not simulate delay, retry, toast, or failure

Boundary constraints:

- This feature does not listen to player progress.
- This feature does not enqueue telemetry or flush anything by itself.
- This feature does not use React Query.
- Future telemetry integration should use `reportVideoWatchProgress(...)` as the sender for queued watch-progress items.
