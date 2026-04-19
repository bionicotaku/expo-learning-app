# Fullscreen Video Pager Widget

`widgets/fullscreen-video-pager` 负责沉浸式纵向视频页的复合视图。

当前职责：

- 纵向分页滚动
- 初次进入和翻页都只显示底部小 loading 动画，不渲染整页 loading 项
- 只为当前/前后 1 个视频挂载 player
- 在 widget 内部维护单一 `activeIndex` 状态，并从它派生当前 active item
- 在 widget 内部维护当前播放会话的 `pausedByUser`
- 在 widget 内部维护短暂的 `playbackFeedbackLabel`
- 采用三层 overlay 结构：
  - `row-owned content overlay`：每个 row 自己的标题、说明、底部可读性 scrim 和右侧 clear glass action rail
  - `top chrome overlay`：右上 counter
  - `active ephemeral overlay`：当前只包含播/停 HUD
- 底部 loading pill 继续保留在 pager shell，而不是并入任何 video overlay
- 首屏定位拆成两条明确路径：
  - 首次渲染已有数据时使用 `initialScrollIndex`
  - 首次渲染为空列表时，第一页到达后执行一次异步 post-load alignment
- 当前视频默认有声自动播放
- 点击 active row 的视频背景切换播/停
- 右侧 rail 这轮只完成结构落位，不接真实业务动作

边界约束：

- widget 不直接请求 feed 数据
- widget 不直接决定何时分页
- widget 只通过 `onActiveItemChange(itemId, index)` 向页面上报 active video 变化
- widget 不持有跨页面恢复定位状态
- widget 不持有跨页面长期音频偏好；这轮不提供静音切换
- widget 不使用自动 safe-area content inset；否则会破坏 `initialScrollIndex` 的首屏整页吸附
