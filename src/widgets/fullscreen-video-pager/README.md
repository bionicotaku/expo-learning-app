# Fullscreen Video Pager Widget

`widgets/fullscreen-video-pager` 负责沉浸式纵向视频页的复合视图。

当前职责：

- 纵向分页滚动
- 首次进入时只显示底部小 loading 动画，不渲染整页 loading 项
- 只为当前视频与前后 2 个视频挂载 player
- 在 widget 内部维护单一 `activeIndex` 状态，并从它派生当前 active item
- 在 widget 内部维护当前播放会话的 `basePausedByUser`
- 在 widget 内部维护当前临时长按态 `transientHoldState`
- 在 widget 内部维护当前 active row 的 `activeSurfaceState`
- 在 widget 内部维护 HUD feedback；播/停与 seek 会自动消失，`2x` 会在左右长按期间持续显示
- 只为当前 active row 挂载真实 `ActiveVideoGestureSurface`
- active row 的背景单击使用 `Pressable` 语义，并等待 double tap / long press 失败后才切换播/停
- active row 的背景手势只在 `loading / ready` 时可用；`error` 时撤掉背景手势层，让 `Retry` 直接接管点击
- 采用三层 overlay 结构：
  - `row-owned content overlay`：每个 row 自己的标题、描述、底部可读性 scrim 和右侧 clear glass action rail
  - `top chrome overlay`：右上 counter
  - `active ephemeral overlay`：当前包含播/停、seek、临时 `2x` HUD
- 首屏定位拆成两条明确路径：
  - 首次渲染已有数据时使用 `initialScrollIndex`
  - 首次渲染为空列表时，feed 返回后执行一次异步 post-load alignment
- 当前视频默认有声自动播放
- 点击 active row 的视频背景切换播/停
- 双击 active row 左右半区执行 `-5s / +5s`
- 长按 active row 左右区进入临时 `2x`
- 左右长按期间持续显示 `2x` HUD，松手后立即清掉
- 右侧 rail 这轮只完成结构落位，不接真实业务动作
- active row 的最小 player controller 不再只是 `seekBy`，而是 `{ seekBy, surfaceState }`

边界约束：

- widget 不直接请求 feed 数据
- widget 不直接决定何时重新读取 feed；续接时机由页面层基于 active index 和当前尾部窗口决定
- widget 只通过 `onActiveItemChange(itemId, index)` 向页面上报 active video 变化
- widget 不持有跨页面恢复定位状态
- widget 不持有跨页面长期音频偏好；这轮不提供静音切换
- widget 不使用自动 safe-area content inset；否则会破坏 `initialScrollIndex` 的首屏整页吸附
- widget 不直接持有 `VideoPlayer` 实例；播放器只通过 active row 的最小 controller 暴露 `{ seekBy, surfaceState }`
