# Video Runtime Feature

`features/video-runtime` 维护 `videoId` 维度的前端 runtime override，以及 source membership registry。

当前职责：

- `model/video-runtime-store.ts`
  - `useVideoRuntimeStore()`
  - `acceptFetchedIds()`
  - `replaceSourceSnapshot()`
  - `setFlags()`
  - `clearAll()`
- `model/resolve-effective-video-runtime-flags.ts`
  - base flags + 当前 override 的单视频合成
- `model/resolve-next-video-runtime-override.ts`
  - 按当前有效值和 base 值推导下一个稀疏 override
- `model/use-video-runtime-state.ts`
  - UI 按 `videoId` 直接读取并写入当前 `isLiked / isFavorited`

当前 store 固定分成两层：

- `overridesByVideoId`
  - 本地 runtime 覆盖
- `sourceVideoIds`
  - source membership registry
  - 当前实现用对象语义 set：`Record<source, Record<videoId, true>>`

边界约束：

- 不读取 `FEED_QUERY_KEY`
- 不持有 source snapshot
- 不定义 source repository
- 不调用真实 like / favorite 写 API
- UI 主读链不依赖整表 `effective items`
- fullscreen 的 `like / favorite` 激活态由 row 直接按 `videoId` 订阅和写入 runtime
- runtime override 只在下一次成功 source fetch 之前有效；同一 `videoId` 的新 source 值一旦到达，就覆盖本地 runtime override
- full refresh 走 `replaceSourceSnapshot(source, videoIds)`
- append / requestMore 走 `acceptFetchedIds(source, videoIds)`
