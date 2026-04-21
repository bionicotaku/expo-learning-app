# Fullscreen Video Gesture 设计规范

## 1. 文档目标

本文档定义 `Fullscreen Video 页` 的目标手势结构、命中区划分、状态归属与播放控制边界。

这份文档重点回答：

- fullscreen 的交互 owner 应该落在哪一层
- 为什么 seek bar 与背景手势不应该继续靠 bridge 协调
- 单击、双击、长按与底部 seek bar 的职责边界是什么
- 哪些状态属于 pager 会话，哪些状态属于 row-local interaction layer

相关文档：

- overlay 架构见 [Fullscreen Video Overlay架构设计规范](./Fullscreen%20Video%20Overlay架构设计规范.md)
- seek bar 设计见 [Fullscreen Video Seek Bar Overlay设计规范](./Fullscreen%20Video%20Seek%20Bar%20Overlay设计规范.md)
- 页面关系见 [Feed与Fullscreen Video页面设计逻辑](./Feed与Fullscreen%20Video页面设计逻辑.md)

## 2. 正式交互模型

fullscreen 的目标结构不再采用“背景手势层 + seek bar 向外注册 blocker”的模式，而改为：

1. `RowPlaybackMediaLayer`
2. `RowPlaybackInteractionLayer`
3. `RowOwnedVideoOverlay`
4. `RowPlaybackHudOverlay`
5. `RowSurfaceStatusOverlay`
6. `Page-attached overlays`

其中：

- `RowPlaybackInteractionLayer` 是 row 内唯一正式交互 owner
- 它不属于 HUD，也不属于 content overlay
- 它只负责当前 row 的命中区划分、手势识别与 seek bar control lane 交互

## 3. 命中区划分

`RowPlaybackInteractionLayer` 内部固定拆成两个互斥命中区：

1. `BackgroundGestureRegion`
2. `SeekBarControlLane`

### 3.1 `BackgroundGestureRegion`

负责 fullscreen 视频背景区的手势：

- `single tap`
- `double tap`
- `long press`

这个区域覆盖视频背景，但**不覆盖底部 seek bar lane**。

### 3.2 `SeekBarControlLane`

负责底部 seek bar 的交互：

- rail + thumb 的 `tap-to-seek`
- drag preview
- release commit

这个区域只覆盖 seek bar control strip 本身。

时间文本继续只读：

- 左侧 `displayCurrentTime`
- 右侧 `displayTotalDuration`

左右时间文本不参与 seek，不属于背景区，也不向外传播手势协调信息。

## 4. 为什么必须放弃 bridge 协调

当前 bridge-driven 方案的问题，不是实现细节“还不够优雅”，而是命中区本身发生了重叠。

一旦 seek bar 与背景点击共享一块屏幕区域，就会自然产生以下需求：

- seek bar 必须向外暴露 rail 手势
- row 必须暂存这些手势
- 背景层必须等待这些手势失败

这会带来三个长期问题：

1. 交互边界跨组件扩散
2. 结构上引入纯桥接状态
3. 背景单击可靠性被 seek bar 协调链拖累

因此目标结构固定采用：

- **几何命中区分离**
- **单一 interaction owner**

而不是继续优化 bridge。

## 5. 背景手势语义

### 5.1 Single Tap

`single tap` 只存在于 `BackgroundGestureRegion`。

它的职责保持不变：

- 点击视频背景
- 切换暂停 / 恢复

seek bar lane 不属于背景区，因此在该 lane 上：

- 不触发 `single tap`
- 不触发暂停切换

### 5.2 Double Tap

`double tap` 只存在于 `BackgroundGestureRegion`。

分区规则保持不变：

- 左半区：`seek -5s`
- 右半区：`seek +5s`

双击只做相对 seek，不改变当前播放/暂停基态。

seek bar lane 上不触发 `double tap`。

### 5.3 Long Press

`long press` 只存在于 `BackgroundGestureRegion`。

分区规则保持不变：

- 左区：临时 `2x`
- 中区：占位接口
- 右区：临时 `2x`

seek bar lane 上不触发 `long press`，因此不会在底部 control lane 内误进临时 `2x`。

## 6. Seek Bar 手势语义

### 6.1 Tap-to-seek

`tap-to-seek` 只作用于 `SeekBarControlLane` 内的 rail + thumb 区域。

行为固定为：

- 直接根据 rail-local 坐标计算 `targetSeconds`
- 立即做一次绝对 seek
- 不进入 scrubbing
- 不显示额外 seek HUD
- 不改变当前播放/暂停基态

### 6.2 Drag-to-seek

drag 只作用于 `SeekBarControlLane`。

行为固定为：

- 拖动过程中只更新本地 preview
- 不实时调 player
- 松手后只做一次绝对 seek

这意味着 drag 期间：

- 视频继续播放
- seek bar UI优先显示 draft
- 真实 `timeUpdate` 不覆盖当前 preview

### 6.3 底部 lane 不是背景区的一部分

这是全文最关键的约束：

- 底部 seek bar lane 不属于视频背景区
- 它是 row-local control lane

因此在 seek bar lane 内：

- 不触发 pause/resume
- 不触发背景双击 `±5s`
- 不触发背景长按 `2x`

## 7. 状态归属

### 7.1 Pager / session hook

继续持有低频播放会话态：

- `activeIndex`
- `activeItemId`
- `basePausedByUser`
- `transientHoldState`
- active controller
- active surface gating state
- row HUD lifecycle state

这层不持有 seek bar draft state。

### 7.2 RowPlaybackMediaLayer

继续持有真实播放器快照：

- `progressSnapshot`
- `surfacePresentation`
- row-local `seekController`

### 7.3 RowPlaybackInteractionLayer

持有交互中间态：

- 背景区手势
- seek bar lane 手势
- `isScrubbing`
- `draftRatio`
- `draftSeconds`

这层是交互 owner，但不是播放器状态 owner。

## 8. 目标结构中废弃的旧接口/术语

以下术语在目标结构中不再成立：

- `ActiveVideoGestureSurface`
- `SeekBarGestureBlockers`
- `railGestureBlockers`
- `externalGestureBlockers`
- `onRailGesturesChange(...)`

这些接口对应的设计前提是“seek bar 与背景手势重叠，需要跨组件桥接协调”。
目标结构通过命中区分离消除这个前提，因此它们不再属于正式设计的一部分。

## 9. 成功标准

手势设计只有同时满足以下条件，才算结构正确：

1. row 内只有一个正式 interaction owner
2. 背景区与 seek bar lane 命中不重叠
3. seek bar 不再向背景层注册 gesture blockers
4. 背景 pause / double tap / long press 不再依赖外部 rail blocker 协调
5. seek bar lane 内只负责 seek，不触发背景手势
6. pager 会话状态仍然不承载高频 scrubbing draft
7. fullscreen row 切换后，seek bar 交互资格仍然只绑定 active row
