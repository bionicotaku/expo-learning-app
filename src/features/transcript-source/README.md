# Transcript Source Feature

`features/transcript-source` 负责 fullscreen transcript 的 query key、active query、邻近预取与 active transcript 派生。

相关设计文档：

- [Fullscreen Transcript Source设计规范](../../../docs/Fullscreen%20Transcript%20Source设计规范.md)
- [Transcript API设计](../../../docs/Transcript%20API设计.md)
- [Video 真值与 Runtime 设计规范](../../../docs/Video%20真值与%20Runtime%20设计规范.md)

当前职责：

- `model/transcript-query.ts`
  - transcript query key builder
- `model/transcript-prefetch.ts`
  - `active ±1` 邻近预取目标解析
- `model/use-fullscreen-transcript-source.ts`
  - active transcript query
  - React Query 内存缓存复用
  - 邻近视频 transcript 预取
  - `activeTranscript / status / error` 派生暴露

边界约束：

- 这里只负责 fullscreen transcript 的 source/read/cache
- 不定义 transcript DTO / domain types；那属于 `entities/transcript`
- 不进入 `video-runtime`
- 不进入 `FullscreenVideoPager` 或 `useFullscreenPlaybackSession`
- 不渲染 subtitle UI、token UI 或任何 overlay
- 不实现本地持久化缓存
