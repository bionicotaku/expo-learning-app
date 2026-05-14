# Video Watch Progress Feature

`features/video-watch-progress` owns the watch-progress API contract and the
fullscreen watch-progress telemetry reporter.

Current responsibilities:

- expose `reportVideoWatchProgress(videoId, body)`
- expose `createWatchProgressRequest(videoId, body)` for request contract tests and future real API wiring
- keep the current repository facade mock-backed
- maintain an internal in-memory telemetry queue for fullscreen progress samples
- expose `useVideoWatchProgressReporter(...)` for runtime upsert and flush
- consume `watchSessionId` from the fullscreen active video visit layer

API shape:

- backend semantic endpoint: `POST /api/catalog/videos/:videoId/watch-progress`
- frontend request path: `/catalog/videos/:videoId/watch-progress`
- request body uses snake_case fields:
  - `watch_session_id`
  - `position_ms`
  - `active_watch_ms`
  - `is_completed`
  - `occurred_at`
  - `source_surface`
  - `client_context`
- `source_surface` currently uses `detail | feed | fullscreen`; the fullscreen reporter defaults to `fullscreen`
- `client_context` is produced by `toAnalyticsClientContext(getClientEnvironment())`

Current mock behavior:

- always resolves `undefined`
- does not validate `videoId`
- does not validate progress values
- does not update feed, video meta, video runtime, or telemetry queue
- does not simulate delay, retry, toast, or failure

Runtime reporter behavior:

- payload is `{ videoId, body }`
- `dedupeKey` is `video.watch_progress:${videoId}:${watchSessionId}`
- `watch_session_id` is owned by fullscreen active video visit state, not generated in this feature
- samples without `watchSessionId` are ignored
- `durationSeconds` is consumed only inside the reporter to decide the position ratio for completion; it is not sent in the request body
- `active_watch_ms` is maintained per `videoId + watchSessionId` from raw progress samples before throttle
- the first valid raw sample establishes the local baseline and reports `active_watch_ms = 0`
- later raw samples add wall-clock elapsed time only when playback position advances plausibly for the current playback rate
- paused/no-movement samples, seek jumps, backward movement, and long background gaps do not add active watch time, but they do reset the baseline for later samples
- non-completed progress samples are accepted at most once per second per `videoId + watchSessionId`
- a sample is completed only when `active_watch_ms > 10_000` and `positionMs / durationMs >= 0.9`
- the first sample that crosses the completed threshold is accepted immediately and triggers an immediate flush
- later completed samples in the same watch session follow the normal throttle and do not trigger another completed flush
- accepted samples replace the latest pending state for that session; flush only sends that pending state
- merge keeps the latest position, active watch time, timestamp, `source_surface`, and `client_context`
- merge preserves `is_completed=true` once any sample has completed
- flush only sends the current pending queue; it does not read the player or recompute progress
- sender calls `reportVideoWatchProgress(videoId, body)`

Boundary constraints:

- This feature does not listen to the player directly; fullscreen passes active progress samples in.
- This feature does not own active video identity, `watchSessionId`, route/session reset, or row selection.
- This feature does not use React Query.
- This feature does not own fullscreen active row selection or player mount windows.
- This feature does not toast on telemetry failure.
- This feature does not persist telemetry to disk.
- This feature does not implement learning-interaction events. Future `features/learning-interactions` should own a separate append-only or aggregated queue and may reuse the active visit `watchSessionId` as correlation context.
