# Video Watch Progress Feature

`features/video-watch-progress` owns the watch-progress API contract and the
fullscreen watch-progress telemetry reporter.

Current responsibilities:

- expose `reportVideoWatchProgress(videoId, body)`
- expose `createWatchProgressRequest(videoId, body)` for request contract tests and future real API wiring
- keep the current repository facade mock-backed
- maintain an internal in-memory telemetry queue for fullscreen progress samples
- expose `useVideoWatchProgressReporter(...)` for runtime upsert and flush

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

Runtime reporter behavior:

- payload is `{ videoId, body }`
- `dedupeKey` is `video.watch_progress:${videoId}:${watchSessionId}`
- `watch_session_id` is generated per active fullscreen visit token
- non-completed progress samples are accepted at most once per second per active visit
- completed samples are accepted immediately and trigger an immediate flush
- merge keeps the latest position, duration, timestamp, source, and metadata
- merge preserves `is_completed=true` once any sample has completed
- sender calls `reportVideoWatchProgress(videoId, body)`

Boundary constraints:

- This feature does not listen to the player directly; fullscreen passes active progress samples in.
- This feature does not use React Query.
- This feature does not own fullscreen active row selection or player mount windows.
- This feature does not toast on telemetry failure.
- This feature does not persist telemetry to disk.
