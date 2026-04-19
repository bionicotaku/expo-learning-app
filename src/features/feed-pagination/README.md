# Feed Pagination Feature

`features/feed-pagination` 只负责 feed 的分页策略和标准查询接入。

当前结构：

- `model/feed-pagination-policy.ts`
  - `PAGE_SIZE`
  - `NETWORK_DELAY_MS`
  - `PREFETCH_THRESHOLD`
  - `shouldPrefetchNextPage(...)`
- `model/feed-source.ts`
  - feed pages 扁平化
  - `videoId -> index` 映射
  - refresh 成功后把共享 source 替换成新第一页
- `model/use-feed-infinite-query.ts`
  - `useInfiniteQuery` 接入 mock feed repository
  - query key: `['feed', 'main']`

边界约束：

- 不定义页面 render item
- 不定义 debug 徽标
- 不直接承担播放状态
- 不在这里写页面 overlay 文案

这个 feature 的职责是“什么时候拉下一页”和“怎么把 feed 数据接到标准异步查询流里”。
