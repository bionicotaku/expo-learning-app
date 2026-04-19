# Video Feed Widget

`widgets/video-feed` 负责 feed 的页面级复合视图，但不负责数据源与业务编排。

当前结构：

- `ui/video-feed.tsx`
  - 最薄的 widget 组合壳
- `ui/video-feed-list.tsx`
  - `FlatList` 与可见项回调
- `ui/video-feed-overlay.tsx`
  - 左上 debug、底部文案、静音提示、toast
- `ui/video-feed-item.tsx`
  - 单个视频项与播放器失败重试
- `ui/video-feed-loading-card.tsx`
  - 首屏 loading 和尾部 loading 卡
- `model/types.ts`
  - widget 级 render item 与 overlay model

边界约束：

- widget 只消费整理好的 props
- widget 不直接请求 feed 数据
- widget 不直接决定何时分页
- widget 不直接定义全局播放状态
