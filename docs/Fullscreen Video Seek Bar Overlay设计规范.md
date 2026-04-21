# Fullscreen Video Seek Bar Overlay 设计规范

## 1. 文档目标

本文档定义 `Fullscreen Video 页` 底部 `RowPlaybackSeekBarOverlay` 的目标设计。

这份文档不再只回答“seek bar 怎么摆”，而是把原本属于 seek bar 的完整语义一起收进来：

- seek bar overlay 在 fullscreen 架构里的正式定位是什么
- 左时间、rail、thumb、右总时长分别表达什么
- tap-to-seek、drag preview、release commit 的正式语义是什么
- 哪些状态属于真实播放器，哪些状态属于 interaction layer
- 为什么 seek bar overlay 不应继续承担跨组件 bridge 职责

相关文档：

- overlay 架构见 [Fullscreen Video Overlay架构设计规范](./Fullscreen%20Video%20Overlay架构设计规范.md)
- 手势设计见 [Fullscreen Video Gesture设计规范](./Fullscreen%20Video%20Gesture设计规范.md)
- 页面关系见 [Feed与Fullscreen Video页面设计逻辑](./Feed%E4%B8%8EFullscreen%20Video%E9%A1%B5%E9%9D%A2%E8%AE%BE%E8%AE%A1%E9%80%BB%E8%BE%91.md)

## 2. 正式定位

`RowPlaybackSeekBarOverlay` 的目标定位固定为：

- `RowPlaybackInteractionLayer` 内部的 bottom control strip
- row-local
- active-only
- seek bar 的 presenter / control strip

它不是：

- pager 顶层控制条
- HUD overlay
- 内容层
- 独立的交互 owner
- 向外暴露 gesture blocker 的 bridge 组件

一句话收口：

`RowPlaybackSeekBarOverlay` 负责把 seek bar 画出来，并承载 seek bar lane 内的交互语义；但它不再负责背景层协调。

## 3. 正式层级

目标层级固定为：

1. `RowPlaybackMediaLayer`
2. `RowPlaybackInteractionLayer`
   1. `BackgroundGestureRegion`
   2. `SeekBarControlLane`
      1. `RowPlaybackSeekBarOverlay`
3. `RowOwnedVideoOverlay`
4. `RowPlaybackHudOverlay`
5. `RowSurfaceStatusOverlay`

其中：

- `RowPlaybackMediaLayer`
  - 持有真实 `progressSnapshot`
  - 暴露 row-local `seekController`
- `RowPlaybackInteractionLayer`
  - 持有 seek bar lane 的交互逻辑与本地 draft
- `RowPlaybackSeekBarOverlay`
  - 只消费 interaction layer 提供的显示值与手势对象

## 4. Overlay 组成

`RowPlaybackSeekBarOverlay` 固定渲染三段：

1. 左时间
2. 中间 rail + thumb
3. 右总时长

### 4.1 左时间

左侧时间的正式名字是：

- `displayCurrentTime`

它的语义固定为：

- 平时不拖动时，表示当前视频播放时间
- 正在 scrubbing 时，表示当前 thumb 所代表的预览时间

因此左时间不是“永远显示播放器真实 currentTime”，而是：

```ts
displayCurrentTime =
  isScrubbing ? draftSeconds : progressSnapshot.currentTimeSeconds
```

### 4.2 中间 rail + thumb

中间区域表达三类信息：

- base track
- buffered progress
- played progress
- thumb 当前表示位置

thumb 的位置语义固定与左时间一致：

- 不拖动时跟随真实播放进度
- scrubbing 时跟随 draft 预览位置

### 4.3 右总时长

右侧时间的正式名字是：

- `displayTotalDuration`

它固定等于：

```ts
displayTotalDuration = progressSnapshot.durationSeconds
```

右时间不参与拖动，不跟随 thumb 变化。

## 5. 状态归属

### 5.1 真实播放器快照

真实播放器快照继续归 `RowPlaybackMediaLayer`：

```ts
type FullscreenRowProgressSnapshot = {
  currentTimeSeconds: number;
  durationSeconds: number;
  bufferedPositionSeconds: number;
  playedRatio: number;
  bufferedRatio: number;
};
```

它来自：

- `PlayableVideoSurface`
- `timeUpdate`
- `readyToPlay` / `seekBy` / `seekTo` 边界 resync

### 5.2 Seek bar draft

seek bar 的交互中间态固定归 `RowPlaybackInteractionLayer`：

- `isScrubbing`
- `draftRatio`
- `draftSeconds`

这些状态不进入：

- pager 会话层
- HUD store
- row 根 state
- bridge state

### 5.3 显示值

seek bar overlay 只消费以下显示值：

- `displayCurrentTime`
- `displayRatio`
- `displayTotalDuration`
- `bufferedRatio`
- `isScrubbing`

也就是说，overlay 本身不拥有“真实状态”，它只是当前 seek bar 语义的渲染出口。

## 6. 交互语义

### 6.1 Tap-to-seek

tap 只作用于 rail + thumb 区域。

行为固定为：

- 根据 rail-local 坐标计算 `targetSeconds`
- 立即做一次绝对 seek
- 不进入 scrubbing
- 不显示额外 HUD
- 不改变当前播放 / 暂停基态

### 6.2 Drag preview

drag 继续只作用于 `SeekBarControlLane`。

行为固定为：

- 拖动过程中只更新本地 preview
- 不实时调 player
- 松手后只做一次绝对 seek

### 6.3 Tap 与 drag 的共用链路

`tap-to-seek` 与 `drag release` 固定共用：

- 同一条 rail-local 几何换算
- 同一条 `targetSeconds` 解析逻辑
- 同一条 optimistic commit / rollback 链

这样 seek bar overlay 只有一套 seek 数学与 commit 语义，不再存在“tap 一套、drag 一套”的分叉。

### 6.4 点击时间文本

左右时间文本继续属于底部 control lane，但固定为 inert：

- 不 seek
- 不 pause
- 不向背景区回落

这条规则是 seek bar overlay 语义的一部分，不是背景层的副作用。

## 7. 与背景手势的边界

seek bar overlay 之所以不再需要 bridge，不是因为 bridge 被“优化掉了”，而是因为命中区前提已经改变：

- `BackgroundGestureRegion` 与 `SeekBarControlLane` 几何分离
- 底部 control lane 不再属于背景区

因此不再需要：

- `SeekBarGestureBlockers`
- `onRailGesturesChange`
- `externalGestureBlockers`
- `railGestureBlockers`

也不再需要把 `RowPlaybackSeekBarOverlay` 设计成一个向外注册手势的组件。

## 8. 与播放器控制的边界

seek bar overlay 的控制语义固定为：

- 双击仍走 session-level `seekBy(±5)`
- seek bar `tap` 与 `drag release` 走 row-local `seekTo(seconds)`

也就是说：

- `seekBy` 是背景手势的相对 seek
- `seekTo` 是 seek bar overlay 的绝对 seek

两者同属 fullscreen 播放控制，但属于两条不同的语义通道。

## 9. 视觉约束

seek bar overlay 继续保持当前设计方向：

- 左时间 + 中间 rail/thumb + 右总时长
- 非 glass
- 细 rail
- 小 thumb
- 固定宽度时间文本
- `tabular-nums`

默认不引入：

- time bubble
- glass pill
- haptic
- 拖动中实时 seek

## 10. 非目标

以下内容不属于本文档定义的 seek bar overlay 范围：

- 背景区 `single tap / double tap / long press` 的完整手势协议
- pause / seek / `2x` HUD 的视觉与生命周期
- loading / error / retry presenter
- pager 壳层的 chrome / loading pill

这些仍由各自文档定义。

## 11. 成功标准

`RowPlaybackSeekBarOverlay` 只有同时满足以下条件，才算结构正确：

1. 它是 `RowPlaybackInteractionLayer` 内部的 bottom control strip
2. 它不再向外注册 gesture blocker
3. 左时间始终绑定当前 thumb 表示值
4. tap 与 drag release 共用同一条 rail-local 几何与 commit 链
5. 真实 `progressSnapshot` 在 media layer，本地 draft 在 interaction layer
6. 它继续 active-only、row-local、tap 无额外 HUD、drag preview-only
7. 左右时间文本继续 inert，不参与 seek，也不回落成背景点击
8. 它完整承载原本属于 seek bar 的显示与控制语义，而不是一个只负责画 rail 的薄壳
