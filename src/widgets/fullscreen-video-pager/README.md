# Fullscreen Video Pager Widget

`widgets/fullscreen-video-pager` 负责沉浸式纵向视频页的复合视图。

当前职责：

- 纵向分页滚动
- 初次进入和翻页都只显示底部小 loading 动画，不渲染整页 loading 项
- 只为当前/前后 1 个视频挂载 player
- 在 widget 内部维护单一 `activeIndex` 状态，并从它派生当前 active item
- 在 widget 内部维护 `audioToastLabel`
- 采用三层 overlay 结构：
  - row-bound overlay：每个 row 自己的标题与描述
  - active-only stable overlay：当前只包含左上角 debug / counter
  - active-only ephemeral overlay：当前只包含静音 toast
- 底部 loading pill 继续保留在 pager shell，而不是并入任何 video overlay
- 首屏定位拆成两条明确路径：
  - 首次渲染已有数据时使用 `initialScrollIndex`
  - 首次渲染为空列表时，第一页到达后执行一次异步 post-load alignment
- 点击任意位置切换静音

边界约束：

- widget 不直接请求 feed 数据
- widget 不直接决定何时分页
- widget 只通过 `onActiveItemChange(itemId, index)` 向页面上报 active video 变化
- widget 不持有跨页面恢复定位状态
- widget 不使用自动 safe-area content inset；否则会破坏 `initialScrollIndex` 的首屏整页吸附
