# Fullscreen Video Resources

`features/fullscreen-video-resources` reads fullscreen-only video resources for the active row window.

Current responsibilities:

- resolve the active `-1 / active / +1` video ids
- read `VideoMeta` for those ids
- read transcript assets from successful `VideoMeta.transcriptUrl` values
- pass React Query abort signals into transcript asset loading
- expose the active video meta, active transcript, and a meta map for fullscreen rows
- show global error toast feedback when video meta or transcript asset loading fails

Transcript content is no longer read by `videoId`; it is read from the URL returned by video meta.
Successful transcript asset reads return the `entities/transcript` prepared domain model:
sentence display timing is normalized before React Query caches the transcript, while token timing remains the original word-level timing.

Failure feedback:

- video meta query failure shows `视频数据获取失败`
- transcript asset query failure shows `字幕获取失败`
- transcript asset query abort caused by React Query cancellation does not show a toast
- each failed query attempt shows one toast; stable rerenders of the same error do not spam the toast stack
- when a cached query is in `error`, mounting fullscreen resources again refetches it
- successful video meta and transcript asset caches are reused on remount without refetching
