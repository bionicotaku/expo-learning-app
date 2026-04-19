# Media Feature Card Widget

`widgets/media-feature-card` 负责 Feed / 历史等列表里复用的视频卡复合视图。

当前职责：

- 渲染封面色块、stats 胶囊、tag 胶囊、播放按钮和两行内标题
- 只消费已经准备好的展示 props，不直接知道 `FeedItem` 或未来的 `HistoryItem`
- 通过 `onPress` 向页面暴露点击入口，不直接做路由跳转

公开 props 契约：

- `title`
  - 卡片标题，最多显示两行
- `statsLabel`
  - 左上角 stats 胶囊文案，例如 `7.8k · 1:12`
- `tagLabel`
  - 左下角 tag 胶囊文案
- `tone`
  - 封面色块 tone
- `onPress`
  - 可选点击行为；widget 不直接处理路由
- `accessibilityLabel`
  - 可选无障碍标签

当前实现约束：

- `MediaFeatureCard` 不接受 `FeedItem`
- `MediaFeatureCard` 不接受未来的 `HistoryItem`
- 页面层必须先把领域实体映射成展示型 props，再传给 widget

边界约束：

- widget 不直接派生 `views / duration / tone / tag` 等 mock 展示字段
- widget 不直接依赖 feed repository、分页逻辑或恢复滚动逻辑
- widget 不回流到 `shared/ui`，因为它带有明确的视频卡业务语义
