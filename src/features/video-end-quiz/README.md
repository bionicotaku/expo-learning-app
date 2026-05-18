# features/video-end-quiz

`features/video-end-quiz` orchestrates the video-end quiz lookup flow for
fullscreen playback.

Responsibilities:

- Extract `videoId`, `recommendationRunId`, and `learningUnits[].coarseUnitId`
  from `VideoListItem`.
- Use React Query as the in-memory cache for end quiz results.
- Treat only non-empty `items` as usable cache.
- Retry retryable failures locally without changing the global QueryClient
  defaults.
- Show `题目加载失败` only after a final non-aborted failure.
- Map End Quiz questions to `features/choice-question` dialog data.
- Wait for the choice-question dialog to dismiss before fullscreen advances.

Boundaries:

- This feature does not own the backend DTO shape; `entities/end-quiz` does.
- This feature does not render choice-question UI.
- This feature does not submit quiz attempts.
- This feature does not show row-local playback errors.
