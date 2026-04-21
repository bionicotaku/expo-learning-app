# Feed Source Feature

`features/feed-source` 负责把无状态 `feed` batch 续接成共享 source，并把 source item 映射成 canonical `VideoListItem[]`。

当前职责：

- `model/use-feed-source.ts`
  - `useQuery` 接入初次读取
  - query key: `['feed', 'main']`
- `model/feed-source.ts`
  - 共享 source state
  - `requestMore / refresh` controller
  - append 去重和单飞控制
  - `FeedItem[] -> VideoListItem[]` 映射出口
  - 成功 fetch 后通过 `video-runtime` 执行 source-aware handoff

边界约束：

- 不暴露分页语义
- 不定义 `videoId -> runtime override`
- 不承担播放器状态
- 不定义卡片展示文案

这个 feature 的职责是：

- 管 `feed` source 的 React Query cache
- 管 refresh / append / merge
- 输出 canonical `VideoListItem[]`

它不负责：

- 本地 like/favorite runtime state
- `effectiveVideoItem` 聚合
- fullscreen 的长期数据模型

当前与 `video-runtime` 的边界固定为：

- 本地点击 `like / favorite` 时，runtime override 可以先覆盖当前 canonical 值
- `feed` full refresh / initial fetch 成功后，调用 `replaceSourceSnapshot('feed', videoIds)`
- `feed` append / requestMore 成功后，调用 `acceptFetchedIds('feed', videoIds)`
- 也就是说，`feed-source` 不拥有 runtime store，但它负责在 fetch 成功边界上把 feed 的 source truth 重新接管回来
