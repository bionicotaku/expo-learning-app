# Feed Source Feature

`features/feed-source` 负责把无状态 `feed` batch 续接成共享 source，并把 `FeedResponse` 映射成前端消费的 `VideoListItem[]`。

当前职责：

- `model/use-feed-source.ts`
  - `useQuery` 接入初次读取
  - query key: `['feed', 'main']`
- `model/feed-source.ts`
  - 共享 source state
  - `requestMore / refresh` controller
  - append 去重和单飞控制
  - `FeedResponse -> VideoListItem[]` 映射出口
  - 把 response 级 `recommendation_run_id` 写入每个 `VideoListItem.recommendationRunId`
  - 把 `FeedLearningUnit[]` 映射为 `VideoListItem.learningUnits`
  - 成功 fetch 后通过 `video-runtime` 更新 source membership
  - 续接读取失败时触发统一全局 error toast：`加载更多视频失败`
- `model/tail-request-gate.ts`
  - 管理页面级 tail 续接触发 gate
  - 请求中阻止重复并发，成功后阻止同一 tail 重复续接，失败后释放同一 tail 以允许用户再次触发

边界约束：

- 不暴露分页语义
- 不定义 `videoId -> runtime override`
- 不承担播放器状态
- 不定义卡片展示文案
- 不处理首屏 error UI；首屏失败由 `pages/feed` 渲染页内失败状态并触发全局 toast

这个 feature 的职责是：

- 管 `feed` source 的 React Query cache
- 管 refresh / append / merge
- 输出前端消费的 `VideoListItem[]`

它不负责：

- 本地 like/favorite runtime state
- 当前用户态 meta 读取
- `effectiveVideoItem` 聚合
- fullscreen 的长期数据模型

当前与 `video-runtime` 的边界固定为：

- `feed` full refresh / initial fetch 成功后，调用 `replaceSourceSnapshot('feed', videoIds)` 更新 membership，并清理离开 feed 且不属于其他 source 的孤儿 override
- `feed` append / requestMore 成功后，调用 `acceptFetchedIds('feed', videoIds)` 追加 membership
- feed fetch 不再因为拿到同一 `videoId` 就覆盖本地 like/favorite override；这些 base 值来自 `VideoMeta`
- feed source 不保存单独的 plan registry；后续上报直接使用 item 上携带的 `recommendationRunId`
