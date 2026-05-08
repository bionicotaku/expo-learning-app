# Video Meta Entity

`entities/video-meta` defines the current-user metadata read for a video.

Current responsibilities:

- expose `fetchVideoMeta(videoId)`
- return `isLiked`, `isFavorited`, and `transcriptUrl`
- keep this metadata out of the feed list contract

The current repository is mock-backed and resolves `transcriptUrl` through the shared mock clip catalog.
