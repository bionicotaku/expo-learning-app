# Feed Source Feature

`features/feed-source` 负责把无状态 feed batch 续接成共享 source。

当前职责：

- `model/use-feed-source.ts`
  - `useQuery` 接入初次读取
  - query key: `['feed', 'main']`
- `model/feed-source.ts`
  - `videoId -> index` 映射
  - 共享 source state
  - `requestMore / refresh` controller
  - append 去重和单飞控制

边界约束：

- 不暴露分页语义
- 不定义页面 render item
- 不承担播放器状态
- 不定义卡片展示文案

这个 feature 的职责是“把重复读取得到的 batch 组装成同一条共享 feed source”。
