# Video Engagement Feature

`features/video-engagement` owns current-user like and favorite writes.

Current responsibilities:

- expose `useVideoEngagementState(...)` for fullscreen rows
- expose local count formatting and `+1 / -1` derivation helpers
- call like / favorite write repositories through React Query mutations
- optimistically write `features/video-runtime` overrides
- roll back optimistic state and show Chinese error toast when a write fails

Write API shape:

- `PUT /videos/:videoId/like`
- `DELETE /videos/:videoId/like`
- `PUT /videos/:videoId/favorite`
- `DELETE /videos/:videoId/favorite`

The write API only confirms success or failure. It does not return count values.

Boundary constraints:

- `VideoMeta` remains the current-user read snapshot and transcript URL owner.
- `VideoListItem.likeCount / favoriteCount` remain feed base counts.
- Successful writes do not update feed cache, video meta cache, or invalidate fullscreen resource queries.
- Count display remains local: feed base count plus the delta between `VideoMeta` base state and `video-runtime` effective state.
- Like pending only disables like; favorite pending only disables favorite.
- When `VideoMeta` has not loaded successfully, both like and favorite writes are disabled.
