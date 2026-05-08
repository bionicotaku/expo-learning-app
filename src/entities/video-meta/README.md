# Video Meta Entity

`entities/video-meta` defines the current-user metadata read for a video.

Current responsibilities:

- expose `fetchVideoMeta(videoId)`
- return `isLiked`, `isFavorited`, and `transcriptUrl`
- keep this metadata out of the feed list contract

The current repository is mock-backed and resolves `transcriptUrl` through the shared mock clip catalog.

Like and favorite writes are owned by `features/video-engagement`. Successful writes do not update the video meta cache in v1; the current fullscreen session keeps local runtime overrides until resources naturally reload.
